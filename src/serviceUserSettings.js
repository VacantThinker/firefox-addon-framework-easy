import {stoOpGet, stoOpSet} from './opStorage.js';

export async function serviceInitUserSettings(userSettings) {
  const initPromises = Object.entries(userSettings)
      .map(async ([key, setting]) => {
        const oldValue = await stoOpGet(key);

        // FIX: Check strictly for null or undefined.
        // This allows `false` and `0` to be recognized as valid saved values.
        if (oldValue === null || oldValue === undefined) {
          await stoOpSet(key, setting.selected);
        }
      });

  await Promise.all(initPromises);
}

/**
 * // todo
 * @param userSettings{{}}
 * @returns {Promise<{Object}>}
 */
export async function serviceGetUserSettings(userSettings) {
  const red = {};
  for (let k of Object.keys(userSettings)) {
    red[k] = await stoOpGet(k);
  }
  return red;
}




