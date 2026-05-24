/**
 *
 * @param k{string}
 * @returns {Promise<boolean>}
 */
export async function stoOpCheck(k) {
  try {
    let key = k.toString();

    let objGet = await browser.storage.local.get(key);
    let b = objGet.hasOwnProperty(key);
    console.info(`key=${key} exists ${b}`);
    return b;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param k{string}
 * @returns {Promise<any|null>}
 */
export async function stoOpGet(k) {
  try {
    let key = k.toString();
    let objGet = await browser.storage.local.get(key);
    let v = objGet[key];
    console.info(`key=${k} value=\n`, v);
    return v;
  } catch (e) {
    return null;
  }
}

/**
 *
 * @returns {Promise<{[p: string]: any}|null>}
 */
export async function stoOpGetAll() {
  try {
    return await browser.storage.local.get();
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 *
 * @param k{string}
 * @returns {Promise<string[]|null>}
 */
export async function stoOpQueryStartWith(k) {
  try {
    let objAll = await browser.storage.local.get();
    let keys = Object.keys(objAll);
    return keys.filter(value => value.startsWith(k.toString()));
  } catch (e) {
    console.error(e);
    return null;
  }
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
  try {
    let key = k.toString();
    await browser.storage.local.remove(key);
  } catch (e) {
  }
}

/**
 *
 * @param k{string}
 * @returns {Promise<void>}
 */
export async function stoOpSetNull(k) {
  await stoOpSet(k, null);
}
