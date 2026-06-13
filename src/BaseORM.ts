import {
  stoOpCheck,
  stoOpGet,
  stoOpRem,
  stoOpSet
} from './opStorage';

/**
 * Abstract base class BaseORM.
 * Provides encapsulated CRUD operations for JSON-serializable Key-Value pairs.
 * Uses Generics (T) to ensure type safety for the stored object structure.
 */
export abstract class BaseORM<T extends Record<string, any>> {
  #id: string;
  #fullStorageKey: string;
  #defaultValue: T;

  /**
   * @param prefix The prefix for the storage key.
   * @param id The unique identifier for this instance.
   * @param defaultValue The initial value to use if the key does not exist.
   */
  protected constructor(
    prefix: string,
    id: string,
    defaultValue: T = {} as T
  ) {
    if (new.target === BaseORM) {
      throw new TypeError('Cannot construct BaseORM instances directly (Abstract Class).');
    }
    if (!prefix || !id) {
      throw new Error('Both prefix and id must be specified.');
    }

    this.#id = id;
    const formattedPrefix = prefix.endsWith(' ') ? prefix : `${prefix} `;
    this.#fullStorageKey = `${formattedPrefix}${id}`;
    this.#defaultValue = JSON.parse(JSON.stringify(defaultValue));
  }

  get id(): string {
    return this.#id;
  }

  get storageKey(): string {
    return this.#fullStorageKey;
  }

  /**
   * Retrieve the value associated with the bound key.
   * @returns {Promise<T>}
   */
  async get(): Promise<T> {
    if (!(await this.exists())) {
      await this.initDefaultObject();
    }
    return (await stoOpGet(this.#fullStorageKey)) as T;
  }

  /**
   * Overwrite the value of the bound key completely.
   * @param {T} value
   * @returns {Promise<void>}
   */
  async set(value: T): Promise<void> {
    await stoOpSet(
      this.#fullStorageKey,
      value || this.#defaultValue
    );
  }

  /**
   * Wipe the bound key from storage.
   * @returns {Promise<T>}
   */
  async delete(): Promise<T> {
    const previousValue = await this.get();
    await stoOpRem(this.#fullStorageKey);
    return previousValue;
  }

  /**
   * Modify a single targeted key-value pair nested deep within the stored object.
   * @param {K} key The internal key path inside the main value object.
   * @param {T[K]} value The new value to map to that key.
   */
  async updateValueKeyValue<K extends keyof T>(
    key: K,
    value: T[K]
  ): Promise<void> {
    const data = await this.get();
    data[key] = value;
    await this.set(data);
  }

  private async exists(): Promise<boolean> {
    return await stoOpCheck(this.#fullStorageKey);
  }

  private async initDefaultObject(): Promise<void> {
    await stoOpSet(
      this.#fullStorageKey,
      this.#defaultValue
    );
  }
}