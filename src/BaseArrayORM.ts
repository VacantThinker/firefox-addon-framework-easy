import { BaseObjectORM } from './BaseObjectORM';

/**
 * Abstract class for ORMs that store an Array of items (T[]).
 * Includes atomic mutation methods to prevent race conditions.
 */
export abstract class BaseArrayORM<T> extends BaseObjectORM<T[]> {

  // A promise queue acting as a Mutex to serialize array mutations
  private mutationQueue: Promise<void> = Promise.resolve();

  protected constructor(prefix: string, id: string) {
    // Correctly initialize with an empty array.
    // BaseObjectORM accepts 'any[]' so this is type-safe.
    super(prefix, id, []);
  }

  /**
   * Retrieves the current array. Returns a copy to prevent accidental
   * by-reference mutations outside the ORM.
   */
  public async getArray(): Promise<T[]> {
    const data = await this.get();
    return Array.isArray(data) ? [...data] : [];
  }

  /**
   * Safely appends a new item to the array without race conditions.
   */
  public async push(item: T): Promise<void> {
    return this.mutateArray(async (currentArray) => {
      currentArray.push(item);
      return currentArray;
    });
  }

  /**
   * Safely appends multiple items.
   */
  public async pushMany(items: T[]): Promise<void> {
    return this.mutateArray(async (currentArray) => {
      return currentArray.concat(items);
    });
  }

  /**
   * Removes items that match the provided predicate function.
   * @returns {Promise<number>} The number of items removed.
   */
  public async remove(predicate: (item: T) => boolean): Promise<number> {
    let removedCount = 0;
    await this.mutateArray(async (currentArray) => {
      const initialLength = currentArray.length;
      const filtered = currentArray.filter((item) => !predicate(item));
      removedCount = initialLength - filtered.length;
      return filtered;
    });
    return removedCount;
  }

  /**
   * Completely clears the array.
   */
  public async clearArray(): Promise<void> {
    await this.set([]);
  }

  /**
   * Internal mechanism to queue array mutations sequentially.
   * Guarantees that concurrent pushes do not result in lost updates.
   */
  private async mutateArray(mutator: (currentArray: T[]) => Promise<T[]> | T[]): Promise<void> {
    this.mutationQueue = this.mutationQueue.then(async () => {
      try {
        let currentData = await this.get();

        // Data integrity fallback
        if (!Array.isArray(currentData)) {
          console.warn(`BaseArrayORM: Invalid data type for ${this.storageKey}. Resetting to Array.`);
          currentData = [];
        }

        const updatedArray = await mutator(currentData);
        await this.set(updatedArray);
      } catch (error) {
        console.error(`BaseArrayORM: Failed to mutate array for ${this.storageKey}`, error);
        throw error;
      }
    }).catch(() => {
      // Prevents queue deadlocks on individual transaction failures
    });

    return this.mutationQueue;
  }
}