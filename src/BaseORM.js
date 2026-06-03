import {
  stoOpCheck,
  stoOpGet,
  stoOpQueryStartWith,
  stoOpRem,
  stoOpSet,
} from './opStorage.js';

/**
 * 抽象基类 BaseORM (类似 Java 的 Abstract Class)
 * 提供通用的 Key-Value 增删改查操作，Value 默认为 Object
 */
export class BaseORM {
  // 私有属性
  #prefix;
  #defaultValue = {};

  /**
   * 构造函数
   * @param {string} prefix Key 的前缀 (例如: 'magnetKey')
   */
  constructor(prefix) {
    // 模拟 Java 抽象类：禁止直接实例化基类
    if (new.target === BaseORM) {
      throw new TypeError("Cannot construct BaseORM instances directly (Abstract Class).");
    }
    if (!prefix) {
      throw new Error("A key prefix must be specified for the subclass.");
    }

    // 自动处理前缀尾部的空格，确保拼接时形如 "magnetKey keyname123"
    this.#prefix = prefix.endsWith(' ') ? prefix : `${prefix} `;
  }

  // 私有辅助方法：生成最终存储的完整 Key
  #buildStorageKey(key) {
    return `${this.#prefix}${key}`;
  }

  // 私有辅助方法：检查 Key 是否存在
  async #exists(key) {
    return await stoOpCheck(this.#buildStorageKey(key));
  }

  // 私有辅助方法：初始化默认的空对象
  async #initEmptyObject(key) {
    await stoOpSet(this.#buildStorageKey(key), this.#defaultValue);
  }

  /**
   * 【查】获取指定 Key 的 Value。如果不存在，则默认初始化为 {} 并返回
   * @param {string} key 自定义 keyname
   * @return {Promise<object>}
   */
  async get(key) {
    if (!(await this.#exists(key))) {
      await this.#initEmptyObject(key);
    }
    return await stoOpGet(this.#buildStorageKey(key));
  }

  /**
   * 【增/改】覆盖设置指定 Key 的 Value
   * @param {string} key 自定义 keyname
   * @param {object} value 新的 Object 对象
   * @return {Promise<void>}
   */
  async set(key, value) {
    await stoOpSet(this.#buildStorageKey(key), value || this.#defaultValue);
  }

  /**
   * 【删】删除指定 Key，并返回删除前的值
   * @param {string} key 自定义 keyname
   * @return {Promise<object>}
   */
  async delete(key) {
    const previousValue = await this.get(key);
    await stoOpRem(this.#buildStorageKey(key));
    return previousValue;
  }

  /**
   * 【局部改】修改 Value (Object) 中的某一个特定的 key-value 键值对
   * @param {string} key 自定义 keyname
   * @param {string} objectKey Value对象内部的键
   * @param {*} objectValue Value对象内部的值
   * @return {Promise<object>} 返回修改后的完整 Object
   */
  async updateValueKeyValue(key, objectKey, objectValue) {
    // 确保节点已初始化
    const currentData = await this.get(key);

    // 修改对象内部的 key-value
    currentData[objectKey] = objectValue;

    // 重新存入物理存储
    await this.set(key, currentData);
    return currentData;
  }

  /**
   * 【批量查】获取当前前缀下的所有自定义 Key 列表 (已过滤掉前缀)
   * @returns {Promise<string[]>} 例如: ['keyname123', 'keyname456']
   */
  async getAllKeys() {
    const fullKeys = await stoOpQueryStartWith(this.#prefix);
    // 移除前缀，只保留纯粹的自定义 key
    return fullKeys.map(k => k.replace(this.#prefix, ''));
  }

  /**
   * 【批量查】获取当前前缀下的所有数据映射
   * @returns {Promise<{keyList: string[], keyValueMap: {}}>}
   */
  async getAllMap() {
    const keyList = await this.getAllKeys();
    const keyValueMap = {};

    for (const key of keyList) {
      keyValueMap[key] = await this.get(key);
    }

    return { keyList, keyValueMap };
  }
}