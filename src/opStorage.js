/**
 *
 * @param k{string}
 * @returns {Promise<boolean>}
 */
export async function stoOpCheck(k) {
  let key = k.toString();

  let objGet = await browser.storage.local.get(key);
  let b = objGet.hasOwnProperty(key);
  return b;
}

/**
 *
 * @param k{string}
 * @returns {Promise<any|null>}
 */
export async function stoOpGet(k) {
  let key = k.toString();
  let objGet = await browser.storage.local.get(key);
  let v = objGet[key];
  return v;
}

/**
 *
 * @returns {Promise<{[p: string]: any}|null>}
 */
export async function stoOpGetAll() {
  return await browser.storage.local.get();
}

/**
 *
 * @param k{string}
 * @returns {Promise<string[]|null>}
 */
export async function stoOpQueryStartWith(k) {
  let objAll = await browser.storage.local.get();
  let keys = Object.keys(objAll);
  return keys.filter(value => value.startsWith(k.toString()));
}

/**
 *
 * @param k{string}
 * @param v{any}
 * @returns {Promise<void>}
 */
export async function stoOpSet(k, v) {
  let key = k.toString();

  let objNew = {};
  objNew[key] = v;
  await browser.storage.local.set(objNew);
}

/**
 *
 * @param k{string}
 * @returns {Promise<void>}
 */
export async function stoOpRem(k) {
  let key = k.toString();
  await browser.storage.local.remove(key);
}

/**
 *
 * @param k{string}
 * @returns {Promise<void>}
 */
export async function stoOpSetNull(k) {
  await stoOpSet(k, null);
}
