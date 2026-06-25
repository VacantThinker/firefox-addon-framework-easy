import {BaseObjectORM} from './BaseObjectORM';

// Define the interface for strict typing
interface BooleanState {
  state: boolean;
}

/**
 * Abstract class for ORMs that store a single boolean state.
 * Optimized to remove Map overhead and prevent race conditions.
 */
export abstract class BaseOneBooleanORM extends BaseObjectORM<BooleanState> {
  private readonly stateKey = 'state';

  // A promise queue acting as a Mutex to serialize write
  // operations
  private writeLock: Promise<void> = Promise.resolve();

  protected constructor(prefix: string, id: string) {
    // Pass the default state directly to the parent
    super(prefix, id, {state: false});
  }

  /**
   * Retrieves the current boolean value.
   */
  public async getValue(): Promise<boolean> {
    const data = await this.get();
    return data?.[this.stateKey] ?? false;
  }

  /**
   * Direct overwrite of the boolean value.
   * Queued to prevent overwriting a concurrent toggle/update
   * operation.
   */
  public async setValue(value: boolean): Promise<void> {
    return this.atomicUpdate(() => value);
  }

  /**
   * Safely toggles or updates the value based on the previous
   * state. This guarantees no race conditions during
   * Read-Modify-Write cycles.
   */
  protected async updateValue(updater: (prevValue: boolean) => boolean): Promise<void> {
    return this.atomicUpdate(updater);
  }

  /**
   * Internal mechanism to queue state changes sequentially.
   */
  private async atomicUpdate(updater: (prevValue: boolean) => boolean): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      try {
        const currentData = await this.get();
        const currentValue = currentData?.[this.stateKey] ?? false;

        const newValue = updater(currentValue);

        await this.set({[this.stateKey]: newValue});
      } catch (error) {
        console.error(`BaseOneBooleanORM: Failed to update state for ${this.storageKey}`, error);
        throw error;
      }
    }).catch(() => {
      // Catch prevents a single failure from permanently
      // breaking the queue chain
    });

    return this.writeLock;
  }
}