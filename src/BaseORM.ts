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
  protected readonly id: string;
  protected readonly storageKey: string;
  private readonly defaultValue: T;

  // The Mutex "Lock" for preventing race conditions during initialization
  private initPromise: Promise<void> | null = null;

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

    this.id = id;
    const formattedPrefix = prefix.endsWith(' ') ?
      prefix :
      `${prefix} `;
    this.storageKey = `${formattedPrefix}${id}`;

    this.defaultValue = structuredClone(defaultValue);
  }

  /**
   * Retrieve the value associated with the bound key.
   * @returns {Promise<T>}
   */
  protected async get(): Promise<T> {
    if (!(await this.exists())) {
      // Calls the lock-protected initialization instead of initDefaultObject directly
      await this.safeInit();
    }
    return (await stoOpGet(this.storageKey)) as T;
  }

  /**
   * Safely initialize the default object. Prevents multiple concurrent
   * requests from writing the default value simultaneously.
   */
  private async safeInit(): Promise<void> {
    // If an initialization is already in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization and store the Promise as the lock
    this.initPromise = this.initDefaultObject()
      .finally(() => {
        // Clear the lock whether the initialization succeeds or fails
        this.initPromise = null;
      });

    return this.initPromise;
  }

  /**
   * Overwrite the value of the bound key completely.
   * @param {T} value
   * @returns {Promise<void>}
   */
  protected async set(value: T): Promise<void> {
    await stoOpSet(
      this.storageKey,
      value ?? this.defaultValue
    );
  }

  /**
   * Wipe the bound key from storage.
   * @returns {Promise<T>}
   */
  protected async delete(): Promise<T> {
    const previousValue = await this.get();
    await stoOpRem(this.storageKey);
    return previousValue;
  }

  private async exists(): Promise<boolean> {
    return await stoOpCheck(this.storageKey);
  }

  private async initDefaultObject(): Promise<void> {
    await stoOpSet(
      this.storageKey,
      this.defaultValue
    );
  }
}