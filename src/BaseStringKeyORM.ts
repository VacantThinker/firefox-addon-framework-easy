import {BaseORM} from './BaseORM';

/**
 * Abstract class for ORMs that store Map<string, V> data.
 * Automatically handles the conversion between internal Record<string, V> and
 * Map<string, V>.
 */
export abstract class BaseStringKeyORM<V> extends BaseORM<Record<string, V>> {
  protected constructor(prefix: string, id: string) {
    // Hardcode the default value to an empty object
    super(prefix, id, {});
  }

  /**
   * Fetches data as Record and converts it to Map<string, V>.
   */
  protected async getMap(): Promise<Map<string, V>> {
    const data = await this.get();

    // Convert object entries to Map
    return new Map<string, V>(Object.entries(data || {}));
  }

  /**
   * Converts internal Map<string, V> back to Record for storage.
   */
  protected async setMap(map: Map<string, V>): Promise<void> {
    await this.set(Object.fromEntries(map));
  }
}