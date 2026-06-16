import {BaseORM} from './BaseORM';

/**
 * Abstract class for ORMs that store Map<number, V> data.
 * Automatically handles the conversion between internal Record<number, V> and
 * Map<number, V>.
 */
export abstract class BaseNumberKeyORM<V> extends BaseORM<Record<number, V>> {
  protected constructor(prefix: string, id: string) {
    // Hardcode the default value to an empty object
    super(prefix, id, {});
  }

  /**
   * Fetches data as Record, handles legacy arrays/corruption,
   * and converts it to Map<number, V> with properly cast number keys.
   */
  protected async getMap(): Promise<Map<number, V>> {
    let data = await this.get();

    // Data Migration / Corruption Guard (carried over from your original logic)
    if (Array.isArray(data)) {
      console.warn(`BaseNumberKeyORM: Old Array data detected for ${this.storageKey}. Migrating to Record.`);
      data = Object.fromEntries(data);
      await this.set(data);
    } else if (typeof data !== 'object' || data === null) {
      data = {};
      await this.set(data);
    }

    // Convert object entries back to Map, casting string keys to numbers
    return new Map<number, V>(
      Object.entries(data).map(([key, value]) => [Number(key), value])
    );
  }

  /**
   * Converts internal Map<number, V> back to Record for storage.
   */
  protected async setMap(map: Map<number, V>): Promise<void> {
    await this.set(Object.fromEntries(map));
  }
}