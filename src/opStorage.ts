/**
 * Checks if a key exists in local storage.
 * @param key The key to check.
 * @returns Promise resolving to true if key exists, false otherwise.
 */
export async function stoOpCheck(key: string): Promise<boolean> {
  const result = await browser.storage.local.get(key);
  // FIX: Protects against prototype pollution (e.g., key = "constructor")
  return Object.prototype.hasOwnProperty.call(result, key);
}

/**
 * Retrieves a value from local storage by key.
 * @param key The key to retrieve.
 * @returns Promise resolving to the stored value or null if not found.
 */
// FIX: Removed default `any`. Forces the caller to specify the expected type.
export async function stoOpGet<T>(key: string): Promise<T | null> {
  const result = await browser.storage.local.get(key);
  return Object.prototype.hasOwnProperty.call(result, key) ?
    (result[key] as T) :
    null;
}

/**
 * Retrieves all items from local storage.
 * @returns Promise resolving to an object containing all storage items.
 */
// FIX: Narrowed generic constraint to ensure it returns an object structure.
export async function stoOpGetAll<T extends Record<string, unknown>>(): Promise<T> {
  const result = await browser.storage.local.get(null); // Explicitly passing
                                                        // null is safer in
                                                        // some MV3 contexts
  return result as T;
}

/**
 * Clears all data from local storage.
 */
export async function stoOpClear(): Promise<void> {
  await browser.storage.local.clear();
}

/**
 * Queries keys that start with a specific prefix.
 * WARNING: This loads all storage into memory. Use sparingly on large datasets.
 * @param prefix The prefix to filter keys.
 * @returns Promise resolving to an array of matching keys.
 */
export async function stoOpQueryStartWith(prefix: string): Promise<string[]> {
  try {
    const allItems = await browser.storage.local.get(null);
    return Object.keys(allItems).filter((key) => key.startsWith(prefix));
  } catch (error) {
    console.error(`stoOpQueryStartWith failed. Storage might be too large:`, error);
    return [];
  }
}

/**
 * Sets a value in local storage.
 * @param key The key to set.
 * @param value The value to store. Must be JSON-serializable.
 */
// FIX: Replaced `any` with `unknown` to prevent reckless assignments without
// type checking.
export async function stoOpSet<T = unknown>(
  key: string,
  value: T
): Promise<void> {
  try {
    await browser.storage.local.set({[key]: value});
  } catch (error) {
    console.error(`stoOpSet failed to write key "${key}". Quota exceeded?`, error);
    throw error;
  }
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