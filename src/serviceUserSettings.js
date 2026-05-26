import {stoOpGet, stoOpSet} from './opStorage.js';

/**
 * this function connect with generateHtmlByUserSettings()
 *
 * @param userSettings{{}}
 * @returns {Promise<void>}
 */
export async function serviceInitUserSettings(userSettings) {
  for (const k of Object.keys(userSettings)) {
    let v = userSettings[k];
    let options = v.options;
    let selected = v.selected;

    // todo check if has oldvalue donothing, else set k and v
    let oldValue = await stoOpGet(k);
    if (oldValue) {
    }
    else {
      await stoOpSet(k, selected);
    }

  }
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




