import {stoOpGet, stoOpSet} from './opStorage.js';

/**
 *
 * searchEngine: {
 *     optionType: 'checkbox',
 *     options: ['Searcher1', 'Searcher2'],
 *     selected: ['Searcher1', 'Searcher2'],
 *     queryTitle: {
 *       'Searcher1': 'https://y2down.cc/',
 *       'Searcher2': 'https://ssyou.online',
 *     },
 *   },
 *   videoQuality: {
 *     options: ['360', '480', '720', '1080', '1440', '2160'],
 *     selected: '720',
 *   },
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
 * // todo 当前这个文件 建议使用生成式脚本来处理
 * @param userSettings{{}}
 * @returns {Promise<{}>}
 */
export async function serviceGetUserSettings(userSettings) {
  const red = {};
  for (let k of Object.keys(userSettings)) {
    red[k] = await stoOpGet(k);
  }
  return red;
}




