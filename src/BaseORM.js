import {stoOpCheck, stoOpGet, stoOpRem, stoOpSet} from './opStorage.js';

/**
 * Abstract base class BaseORM.
 * Provides encapsulated CRUD operations for JSON-serializable Key-Value pairs.
 */
export class BaseORM {
  #id;
  #fullStorageKey;
  #defaultValue;

  constructor(prefix, id, defaultValue = {}) {
    if (new.target === BaseORM) {
      throw new TypeError(
          'Cannot construct BaseORM instances directly (Abstract Class).');
    }
    if (!prefix || !id) {
      throw new Error('Both prefix and id must be specified.');
    }

    this.#id = id;
    const formattedPrefix = prefix.endsWith(' ') ? prefix : `${prefix} `;
    this.#fullStorageKey = `${formattedPrefix}${id}`;
    this.#defaultValue = JSON.parse(JSON.stringify(defaultValue));
  }

  get id() {
    return this.#id;
  }

  get storageKey() {
    return this.#fullStorageKey;
  }

  async #exists() {
    return await stoOpCheck(this.#fullStorageKey);
  }

  async #initDefaultObject() {
    await stoOpSet(this.#fullStorageKey, this.#defaultValue);
  }

  async get() {
    if (!(await this.#exists())) {
      await this.#initDefaultObject();
    }
    return await stoOpGet(this.#fullStorageKey);
  }

  async set(value) {
    await stoOpSet(this.#fullStorageKey, value || this.#defaultValue);
  }

  async delete() {
    const previousValue = await this.get();
    await stoOpRem(this.#fullStorageKey);
    return previousValue;
  }

  async updateValueKeyValue(objectKey, objectValue) {
    const currentData = await this.get();
    currentData[objectKey] = objectValue;
    await this.set(currentData);
    return currentData;
  }
}