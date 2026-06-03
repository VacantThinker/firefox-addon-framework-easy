import {stoOpCheck, stoOpGet, stoOpRem, stoOpSet} from './opStorage.js';

/**
 * Abstract base class BaseORM (similar to Java's Abstract Class).
 * Provides encapsulated CRUD operations for specific Key-Value pairs bound at instantiation.
 */
export class BaseORM {
  // Private fields for data encapsulation
  #fullStorageKey;
  #defaultValue;

  /**
   * Constructor
   * @param {string} prefix The prefix for the keys (e.g., 'magnetKey')
   * @param {string} id The unique identifier for this instance (e.g., a specific hash or filename)
   * @param {object} [defaultValue={}] Custom initial value for the instance, defaults to an empty object
   */
  constructor(prefix, id, defaultValue = {}) {
    // Simulating Java's abstract class behavior: prevent direct instantiation of the base class
    if (new.target === BaseORM) {
      throw new TypeError(
          'Cannot construct BaseORM instances directly (Abstract Class).');
    }
    if (!prefix || !id) {
      throw new Error('Both prefix and id must be specified.');
    }

    // Lock down the final storage key during instance construction
    this.#fullStorageKey = `${prefix}${id}`;

    // Deep clone the default value to protect against object reference shared-state bugs
    this.#defaultValue = JSON.parse(JSON.stringify(defaultValue));
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

  // Private helper method: checks if the bound key exists in the storage layer
  async #exists() {
    return await stoOpCheck(this.#fullStorageKey);
  }

  // Private helper method: populates the storage key with the designated initial layout
  async #initDefaultObject() {
    await stoOpSet(this.#fullStorageKey, this.#defaultValue);
  }

  /**
   * [Read] Retrieve the value associated with the bound key.
   * If it does not exist yet, it automatically initializes it with the default value first.
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
   * [Delete] Wipe the bound key from storage and return its final state prior to deletion.
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