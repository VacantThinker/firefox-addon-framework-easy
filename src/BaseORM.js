import {
  stoOpCheck,
  stoOpGet,
  stoOpQueryStartWith,
  stoOpRem,
  stoOpSet,
} from './opStorage.js';

/**
 * Abstract base class BaseORM (similar to Java's Abstract Class).
 * Provides general CRUD operations for Key-Value pairs, where the Value defaults to an Object.
 */
export class BaseORM {
  // Private fields for encapsulation
  #prefix;
  #defaultValue;

  /**
   * Constructor
   * @param {string} prefix The prefix for the keys (e.g., 'magnetKey')
   * @param {object} [defaultValue={}] Custom initial value for the subclass, defaults to an empty object if omitted
   */
  constructor(prefix, defaultValue = {}) {
    // Simulate Java's abstract class: prevent direct instantiation of the base class
    if (new.target === BaseORM) {
      throw new TypeError("Cannot construct BaseORM instances directly (Abstract Class).");
    }
    if (!prefix) {
      throw new Error("A key prefix must be specified for the subclass.");
    }

    // Automatically handle trailing spaces to ensure proper formatting like "magnetKey keyname123"
    this.#prefix = prefix.endsWith(' ') ? prefix : `${prefix} `;

    // Deep clone the initial value to prevent data pollution from multiple keys sharing the same object reference
    this.#defaultValue = JSON.parse(JSON.stringify(defaultValue));
  }

  // Private helper method: generates the final full storage key
  #buildStorageKey(key) {
    return `${this.#prefix}${key}`;
  }

  // Private helper method: checks if the key exists
  async #exists(key) {
    return await stoOpCheck(this.#buildStorageKey(key));
  }

  // Private helper method: initializes the key with the custom default value
  async #initDefaultObject(key) {
    await stoOpSet(this.#buildStorageKey(key), this.#defaultValue);
  }

  /**
   * [Read] Get the value of the specified key.
   * If it does not exist, initialize it with the custom default value and return it.
   * @param {string} key Custom key name
   * @return {Promise<object>}
   */
  async get(key) {
    if (!(await this.#exists(key))) {
      await this.#initDefaultObject(key);
    }
    return await stoOpGet(this.#buildStorageKey(key));
  }

  /**
   * [Create/Update] Overwrite and set the value for the specified key.
   * @param {string} key Custom key name
   * @param {object} value The new Object
   * @return {Promise<void>}
   */
  async set(key, value) {
    await stoOpSet(this.#buildStorageKey(key), value || this.#defaultValue);
  }

  /**
   * [Delete] Delete the specified key and return its previous value.
   * @param {string} key Custom key name
   * @return {Promise<object>}
   */
  async delete(key) {
    const previousValue = await this.get(key);
    await stoOpRem(this.#buildStorageKey(key));
    return previousValue;
  }

  /**
   * [Partial Update] Modify a specific key-value pair inside the Value object.
   * @param {string} key Custom key name
   * @param {string} objectKey The key inside the target Value object
   * @param {*} objectValue The value to set for the objectKey
   * @return {Promise<object>} Returns the updated full Object
   */
  async updateValueKeyValue(key, objectKey, objectValue) {
    const currentData = await this.get(key);
    currentData[objectKey] = objectValue;
    await this.set(key, currentData);
    return currentData;
  }

  /**
   * [Batch Read] Get a list of all pure keys under the current prefix (with the prefix removed).
   * @returns {Promise<string[]>} e.g., ['keyname123', 'keyname456']
   */
  async getAllKeys() {
    const fullKeys = await stoOpQueryStartWith(this.#prefix);
    return fullKeys.map(k => k.replace(this.#prefix, ''));
  }

  /**
   * [Batch Read] Get a mapping of all keys and their corresponding values.
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