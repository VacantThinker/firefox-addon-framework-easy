import {tabOpCreate, tabOpCreateNear, tabOpRemove} from './opTab';

/**
 * Interface representing the structure of a message sent to a tab.
 * Includes optional properties for tab creation and specific message data.
 */
export interface TabMessage {
  targetTabId?: number;
  previousTabId?: number;

  url?: string;
  focusNewTab?: boolean;

  [key: string]: any;
}

/**
 * Sends a message to a specific tab.
 */
export async function browserTabSendMessage(tabId: number, message: any): Promise<void> {
  await browser.tabs.sendMessage(tabId, message);
}

/**
 * Waits for a tab to finish loading (status: complete) before sending a message.
 */
export function browserTabWaitReloadThenSendMessageToContentJs(message: TabMessage): void {
  const {targetTabId, ...rest} = message;
  if (targetTabId === undefined) return;

  const listener = async (
    tabId: number,
    changeInfo: browser.tabs._OnUpdatedChangeInfo) => {

    if (tabId === targetTabId && changeInfo.status === 'complete') {
      browser.tabs.onUpdated.removeListener(listener);
      await browserTabSendMessage(tabId, rest);
    }
  };

  browser.tabs.onUpdated.addListener(listener, {
    tabId: targetTabId,
    properties: ['status'],
  });
}

/**
 * Creates a tab for download, waits for load, and then removes it.
 */
export async function browserTabCreateToDownload(message: TabMessage): Promise<void> {
  if (!message.url) return;

  const properties: browser.tabs._CreateCreateProperties = {
    url: message.url,
  };

  if (message.focusNewTab !== undefined) {
    properties.active = message.focusNewTab;
  }

  const {tabId} = await tabOpCreate(properties);

  const listener = async (
    updatedTabId: number,
    changeInfo: browser.tabs._OnUpdatedChangeInfo) => {
    if (updatedTabId === tabId && changeInfo.status === 'complete') {
      browser.tabs.onUpdated.removeListener(listener);
      await tabOpRemove(tabId);
    }
  };

  browser.tabs.onUpdated.addListener(listener, {
    tabId,
    properties: ['status'],
  });
}

/**
 * Safely handles incoming messages to create tabs and send messages to content scripts.
 */
export async function browserTabCreateNearSendMessageToContentJs(message: TabMessage = {}): Promise<void> {
  if (!message.url) return;

  const {previousTabId, ...rest} = message;
  const properties: browser.tabs._CreateCreateProperties = {
    url: message.url,
    active: message.focusNewTab ?? false,
  };

  const {tabId: createdTabId} = message.previousTabId
    ? await tabOpCreateNear({properties, previousTabId})
    : await tabOpCreate(properties);
  if (!createdTabId) return;

  const onUpdatedListener = async (tabId: number, changeInfo: browser.tabs._OnUpdatedChangeInfo) => {
    if (tabId === createdTabId && changeInfo.status === 'complete') {
      cleanup();

      await browserTabSendMessage(tabId, {
        ...rest,
        tabId: tabId,
      });
    }
  };

// Listener to cleanup if tab is closed before loading completes
  const onRemovedListener = (tabId: number) => {
    if (tabId === createdTabId) {
      cleanup();
    }
  };
  const cleanup = () => {
    browser.tabs.onUpdated.removeListener(onUpdatedListener);
    browser.tabs.onRemoved.removeListener(onRemovedListener);
  };
  browser.tabs.onUpdated.addListener(onUpdatedListener, {
    tabId: createdTabId,
    properties: ['status'],
  });
  browser.tabs.onRemoved.addListener(onRemovedListener);

}

/**
 * Watches a tab for reload, then removes it upon completion.
 */
export function browserTabWaitReloadThenRemoveIt({tabId}: { tabId: number }): void {
  const listener = async (updatedTabId: number, changeInfo: browser.tabs._OnUpdatedChangeInfo) => {
    if (updatedTabId === tabId && changeInfo.status === 'complete') {
      browser.tabs.onUpdated.removeListener(listener);
      await tabOpRemove(tabId);
    }
  };

  browser.tabs.onUpdated.addListener(listener, {
    tabId,
    properties: ['status'],
  });
}