import {BaseORM} from './BaseORM';

/**
 * Abstract class for ORMs that store Map<string, V> data.
 * Automatically handles the conversion between internal
 * Record<string, V> and Map<string, V>.
 */
export abstract class BaseOneBooleanORM extends BaseORM<Record<string, boolean>> {
  private readonly state: string = "state";

  protected constructor(prefix: string, id: string) {
    super(prefix, id, {"state": false});
    // todo here cannot use this.state, why?
  }

  public async getValue() {
    const map = await this.getMap();
    return map.get(this.state) || false
  }

  public async setValue(value: boolean) {
    const map = await this.getMap();
    map.set(this.state, value)
    await this.setMap(map)
  }

  private async getMap(): Promise<Map<string, boolean>> {
    const data = await this.get();
    return new Map<string, boolean>(Object.entries(data || {}));
  }

  private async setMap(map: Map<string, boolean>): Promise<void> {
    await this.set(Object.fromEntries(map));
  }
}