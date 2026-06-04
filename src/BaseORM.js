import {stoOpCheck, stoOpGet, stoOpRem, stoOpSet} from './opStorage.js';

/**
 * Abstract base class BaseORM (similar to Java's Abstract Class).
 * Provides encapsulated CRUD operations for specific Key-Value pairs bound at instantiation.
 */
export class BaseORM {
  // Private fields for data encapsulation
  #id; // Added to store the raw unique identifier
  #fullStorageKey;
  #defaultValue;

  /**
   * Constructor
   * @param {string} prefix The prefix for the keys (e.g., 'magnetKey')
   * @param {string} id The unique identifier for this instance
   * @param {object} [defaultValue={}] Custom initial value
   */
  constructor(prefix, id, defaultValue = {}) {
    if (new.target === BaseORM) {
      throw new TypeError(
          'Cannot construct BaseORM instances directly (Abstract Class).');
    }
    if (!prefix || !id) {
      throw new Error('Both prefix and id must be specified.');
    }

    // Save the raw id to the private field
    this.#id = id;

    const formattedPrefix = prefix.endsWith(' ') ? prefix : `${prefix} `;
    this.#fullStorageKey = `${formattedPrefix}${id}`;
    this.#defaultValue = JSON.parse(JSON.stringify(defaultValue));
  }

  /**
   * Public Getter to retrieve the bound unique identifier (id).
   * Can be accessed as `this.id` inside subclasses or `instance.id` externally.
   * @return {string} The raw id
   */
  get id() {
    return this.#id;
  }

  /**
   * Protected Getter for subclasses to safely access the complete key.
   * Can be used in subclasses as `this.storageKey`.
   * @protected
   * @return {string} The full storage key
   */
  get storageKey() {
    return this.#fullStorageKey;
  }

  // Private helper method
  async #exists() {
    return await stoOpCheck(this.#fullStorageKey);
  }

  // Private helper method
  async #initDefaultObject() {
    await stoOpSet(this.#fullStorageKey, this.#defaultValue);
  }

  /**
   * [Read] Retrieve the value associated with the bound key.
   * @return {Promise<object>}
   */
  async get() {
    if (!(await this.#exists())) {
      await this.#initDefaultObject();
    }
    return await stoOpGet(this.#fullStorageKey);
  }

  /**
   * [Create/Update] Overwrite the value of the bound key completely.
   * @param {object} value The new Object data to store
   * @return {Promise<void>}
   */
  async set(value) {
    await stoOpSet(this.#fullStorageKey, value || this.#defaultValue);
  }

  /**
   * [Delete] Wipe the bound key from storage.
   * @return {Promise<object>}
   */
  async delete() {
    const previousValue = await this.get();
    await stoOpRem(this.#fullStorageKey);
    return previousValue;
  }

  /**
   * [Partial Update] Modify a single targeted key-value pair nested deep within the stored object.
   * @param {string} objectKey The internal key path inside the main value object
   * @param {*} objectValue The new value to map to that key
   * @return {Promise<object>} Returns the fully updated object structure
   */
  async updateValueKeyValue(objectKey, objectValue) {
    const currentData = await this.get();
    currentData[objectKey] = objectValue;
    await this.set(currentData);
    return currentData;
  }
}