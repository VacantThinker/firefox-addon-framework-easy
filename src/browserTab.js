// @ts-check

import {browserNotificationCreate} from './browserNotification.js';
import {tabOpCreateNear, tabOpRemove} from './opTab.js';

async function browserTabSendMessage(tabId, message) {
  await browser.tabs.sendMessage(tabId, message);
}

/**
 *
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
  await browserNotificationCreate(`new tab! ${title}`);

  let {focusNewTab} = message;
  let properties = {
    url, tabId: message.tabId,
    active: focusNewTab,
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
 *
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
