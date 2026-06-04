// @ts-check

import {browserNotificationCreate} from './browserNotification.js';
import {tabOpCreateNear, tabOpRemove} from './opTab.js';

export async function browserTabSendMessage(tabId, message) {
  await browser.tabs.sendMessage(tabId, message);
}

/**
 * must has,  url
 * @param message{{
 *      tabId:number,
 *      title:string,
 *      url:string,
 *      focusNewTab:boolean,
 * }}
 * @returns {Promise<void>}
 */
export async function browserTabCreateToDownload(message) {
  let {title, url} = message;
  await browserNotificationCreate(`new tab! ${title || url}`);

  let {focusNewTab} = message;
  let properties = {
    url, tabId: message.tabId,
    active: focusNewTab || false,
  };

  let {tabId} = await tabOpCreateNear(properties);
  browser.tabs.onUpdated.addListener(
      async function lis(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          // todo code here
          await tabOpRemove(tabId)
        }
      }
      , {tabId, properties: ['status']});
}


/**
 * must has, tabId, url
 * @param message{{
 *      tabId:number,
 *      title:string,
 *      url:string,
 *      focusNewTab:boolean,
 * }}
 * @returns {Promise<void>}
 */
export async function browserTabCreateNearSendMessageToContentJs(message) {
  let {title, url} = message;
  await browserNotificationCreate(`new tab! ${title || url}`);

  let {focusNewTab} = message;
  let properties = {
    url, tabId: message.tabId,
    active: focusNewTab || false,
  };

  let {tabId} = await tabOpCreateNear(properties);
  browser.tabs.onUpdated.addListener(
      async function lis(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          // todo code here
          await browserTabSendMessage(
              tabId, Object.assign({}, message, {tabId}));
        }
      }
      , {tabId, properties: ['status']});
}

/**
 * tab exists, watch it, reload then close
 * @param param0
 * @param param0.tabId{number}
 */
export function browserTabWaitReloadThenRemoveIt({tabId}) {
  browser.tabs.onUpdated.addListener(
      async function lis(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          // todo code here
          await tabOpRemove(tabId);
        }
      }
      , {tabId, properties: ['status']});

}
