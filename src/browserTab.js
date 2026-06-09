// @ts-check

import {tabOpCreateNear, tabOpGet, tabOpRemove} from './opTab.js';

export async function browserTabSendMessage(
    tabId,
    message,
) {
  await browser.tabs.sendMessage(tabId, message);
}

export function browserTabWaitReloadThenSendMessageToContentJs(message) {
  let tabId = message.tabId;
  browser.tabs.onUpdated.addListener(
      async function lis(
          tabId,
          changeInfo,
      ) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          await browserTabSendMessage(tabId, message);
        }
      }
      , {tabId, properties: ['status']});
}

/**
 * must has,  url
 * @param message
 * @param message.tabId{number}
 * @param message.url{string}
 * @param message.options.focusNewTab{boolean}
 * @returns {Promise<void>}
 */
export async function browserTabCreateToDownload(message) {
  let properties = {
    url: message.url,
  };
  if (message.tabId) {
    let tabId = message.tabId;
    try {
      await tabOpGet(tabId);
      Object.assign(properties, {tabId});
    } catch (e) {
      delete message.tabId;
    }
  }
  if (message.options) {
    let focusNewTab = message.options.focusNewTab;
    Object.assign(properties, {active: focusNewTab});
  }

  let {tabId} = await tabOpCreateNear(properties);
  browser.tabs.onUpdated.addListener(
      async function lis(
          tabId,
          changeInfo,
      ) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          // todo code here
          await tabOpRemove(tabId);
        }
      }
      , {tabId, properties: ['status']});
}

/**
 * Safely handles incoming messages to create tabs and send messages to content scripts.
 * * @param {Object} message - The message payload.
 * @param {number} [message.tabId] - Optional Tab ID to attach to.
 * @param {string} [message.url] - The URL to open.
 * @param {Object} [message.options] - Additional options.
 * @param {boolean} [message.options.focusNewTab] - Whether the newly created tab should be active.
 * @returns {Promise<void>}
 */
export async function browserTabCreateNearSendMessageToContentJs(message = {}) {
  let properties = {
    url: message.url,
  };

  // Strictly check for tabId presence to prevent passing undefined.
  if (message.tabId !== undefined) {
    let tabId = message.tabId;
    try {
      await tabOpGet(tabId);
      Object.assign(properties, {tabId});
    } catch (e) {
      delete message.tabId;
    }
  }

  // Use optional chaining to safely extract nested properties.
  // Only assign 'active' if 'focusNewTab' was explicitly provided.
  if (message?.options?.focusNewTab !== undefined) {
    Object.assign(properties, {active: message.options.focusNewTab});
  }

  let {tabId} = await tabOpCreateNear(properties);

  browser.tabs.onUpdated.addListener(
      async function lis(
          updatedTabId,
          changeInfo,
      ) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);

          // Execute further logic once the tab is completely loaded.
          await browserTabSendMessage(
              updatedTabId,
              Object.assign({}, message, {tabId: updatedTabId}),
          );
        }
      },
      {tabId, properties: ['status']},
  );
}

/**
 * tab exists, watch it, reload then close
 * @param param0
 * @param param0.tabId{number}
 */
export function browserTabWaitReloadThenRemoveIt({tabId}) {
  browser.tabs.onUpdated.addListener(
      async function lis(
          tabId,
          changeInfo,
      ) {
        if (changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(lis);
          // todo code here
          await tabOpRemove(tabId);
        }
      }
      , {tabId, properties: ['status']});

}
