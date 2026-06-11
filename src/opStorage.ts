/**
 * Checks if a key exists in local storage.
 * @param key The key to check.
 * @returns Promise resolving to true if key exists, false otherwise.
 */
export async function stoOpCheck(key: string): Promise<boolean> {
  const result = await browser.storage.local.get(key);
  return key in result;
}

/**
 * Retrieves a value from local storage by key.
 * @param key The key to retrieve.
 * @returns Promise resolving to the stored value or null if not found.
 */
export async function stoOpGet<T = any>(key: string): Promise<T | null> {
  const result = await browser.storage.local.get(key);
  return result[key] !== undefined ? (result[key] as T) : null;
}

/**
 * Retrieves all items from local storage.
 * @returns Promise resolving to an object containing all storage items.
 */
export async function stoOpGetAll<T = Record<string, any>>(): Promise<T> {
  const result = await browser.storage.local.get();
  return result as T;
}

/**
 * Queries keys that start with a specific prefix.
 * @param prefix The prefix to filter keys.
 * @returns Promise resolving to an array of matching keys.
 */
export async function stoOpQueryStartWith(prefix: string): Promise<string[]> {
  const allItems = await browser.storage.local.get();
  return Object.keys(allItems)
    .filter((key) => key.startsWith(prefix));
}

/**
 * Sets a value in local storage.
 * @param key The key to set.
 * @param value The value to store.
 */
export async function stoOpSet(key: string, value: any): Promise<void> {
  await browser.storage.local.set({[key]: value});
}

/**
 * Removes a key from local storage.
 * @param key The key to remove.
 */
export async function stoOpRem(key: string): Promise<void> {
  await browser.storage.local.remove(key);
}

/**
 * Sets a key to null in local storage.
 * @param key The key to set to null.
 */
export async function stoOpSetNull(key: string): Promise<void> {
  await stoOpSet(key, null);
}