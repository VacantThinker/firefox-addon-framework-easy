import {serviceGetDomain} from "./serviceGet";

/**
 * Interface representing a Tab with an explicitly defined tabId.
 */
export interface EnhancedTab
  extends browser.tabs.Tab {
  tabId: number;
}

/**
 * Enhances a standard tab object by attaching its ID to the 'tabId' property.
 */
export function tabOpEnhance(tab: browser.tabs.Tab): EnhancedTab | null {
  if (!tab || typeof tab.id !== 'number') return null;
  return {...tab, tabId: tab.id};
}

/**
 * Internal helper to unify tab creation.
 */
async function _create(properties: browser.tabs._CreateCreateProperties): Promise<EnhancedTab> {
  const tab = await browser.tabs.create(properties);
  const enhanced = tabOpEnhance(tab);
  if (!enhanced) throw new Error('Failed to enhance created tab: tabId is missing.');
  return enhanced;
}

/**
 * Internal helper to unify tab updates.
 */
async function _update(
  tabId: number | undefined,
  properties: browser.tabs._UpdateUpdateProperties
): Promise<EnhancedTab | undefined> {
  if (tabId == undefined) return;
  const tab = await browser.tabs.update(
    tabId,
    properties
  );
  const enhanced = tabOpEnhance(tab);
  if (!enhanced) throw new Error(`Failed to enhance updated tab ${tabId}`);
  return enhanced;
}

/**
 * Creates a standard tab.
 */
export async function tabOpCreate(properties: browser.tabs._CreateCreateProperties): Promise<EnhancedTab> {
  return _create(properties);
}

/**
 * Creates a tab in the background (inactive and muted).
 */
export async function tabOpCreateActiveFalse(properties: browser.tabs._CreateCreateProperties): Promise<EnhancedTab> {
  return _create({
    ...properties,
    active: false,
    muted: true,
  });
}

/**
 * Creates a tab in the background (inactive and muted).
 */
export async function tabOpCreateActiveTrue(properties: browser.tabs._CreateCreateProperties): Promise<EnhancedTab> {
  return _create({
    ...properties,
    active: true,
  });
}

interface TabOpCreateNearOptions {
  properties: browser.tabs._CreateCreateProperties;
  previousTabId: number | undefined;
}

/**
 * Creates a new tab positioned immediately after a specified existing tab.
 */
export async function tabOpCreateNear(
  options: TabOpCreateNearOptions): Promise<EnhancedTab> {
  const {properties, previousTabId} = options;

  if (previousTabId !== undefined) {
    try {
      const previousTab = await tabOpGet(previousTabId);
      if (previousTab) {
        properties.index = previousTab.index + 1;
        properties.openerTabId = previousTab.id;
      }
    } catch {
    }
  }

  return _create(properties);
}

/**
 * Creates a new window and returns its primary tab.
 */
export async function tabOpCreateByWindow(url: string): Promise<EnhancedTab | undefined> {
  const window = await browser.windows.create({url});
  const tab = window.tabs?.[0];
  return tab ?
    tabOpEnhance(tab) ?? undefined :
    undefined;
}

/**
 * Retrieves details about the specified tab.
 */
export async function tabOpGet(tabId: number | undefined): Promise<browser.tabs.Tab | undefined> {
  if (tabId == undefined) return;
  return await browser.tabs.get(tabId);
}

/**
 * Retrieves all tabs across all windows.
 */
export async function tabOpQueryAll(): Promise<browser.tabs.Tab[]> {
  return await browser.tabs.query({});
}


export async function tabOpQueryDomain(domain: string): Promise<{
  id: number;
  url: string;
  title: string;
}[]> {
  const tabs = await tabOpQueryAll();
  // flatMap allows us to filter and map in a single pass without using
  // non-null assertions (!)
  return tabs.flatMap((tab) => {
    if (tab.id !== undefined && tab.url && serviceGetDomain(tab.url) === domain) {
      return [
        {
          id: tab.id,
          url: tab.url,
          title: tab.title ?? ''
        }
      ];
    }
    return [];
  });
}

/**
 * Retrieves an array of tab IDs matching the URL pattern.
 */
export async function tabOpQueryUrl(url: string): Promise<number[]> {
  const tabs = await browser.tabs.query({url});

  // flatMap handles both the filter and the map in a single pass
  return tabs.flatMap((tab) => (typeof tab.id === 'number' ? [tab.id] : []));
}

/**
 * Ensures only one tab with the given URL exists, focuses/reloads it,
 * or creates a new one if it doesn't exist. Closes duplicates if found.
 * @param url
 */
export async function tabOpCreateKeepOnlyOneFocusTrue(url: string): Promise<void> {
  const tabIds = await tabOpQueryUrl(url);

  if (tabIds.length > 0) {
    // 1. Pick the first existing tab to focus and reload
    const targetTabId = tabIds[0];
    await tabOpFocus(targetTabId);
    await tabOpReload(targetTabId);

    // 2. Cleanup: If there are accidental duplicates, close them
    if (tabIds.length > 1) {
      const extraTabIds = tabIds.slice(1);
      await tabOpRemove(extraTabIds);
    }
  } else {
    // 3. No tabs exist with this URL, create a new one
    await tabOpCreateActiveTrue({url});
  }
}

export async function tabOpQueryThenReloadALL(url: string): Promise<void> {
  const tabIds = await tabOpQueryUrl(url);
  if (tabIds.length >= 1) {
    // Reload all matching tabs concurrently and wait for completion
    await Promise.all(tabIds.map(tabId => tabOpReload(tabId)));
  }
}

/**
 * Finds all tabs matching the URL pattern and removes them simultaneously.
 */
export async function tabOpQueryUrlThenRemove(url: string): Promise<void> {
  const ids = await tabOpQueryUrl(url);
  if (ids.length > 0) {
    await tabOpRemove(ids);
  }
}

/**
 * Reloads the given tab.
 * @param tabId The tab ID to reload.
 * @param bypassCache Whether to bypass the cache.
 */
export async function tabOpReload(
  tabId: number | undefined,
  bypassCache: boolean = false
): Promise<void> {
  if (tabId == undefined) return;
  await browser.tabs.reload(
    tabId,
    {bypassCache}
  );
}

/**
 * Closes one or more tabs.
 */
export async function tabOpRemove(
  tabId: number | number[] | undefined): Promise<void> {
  if (tabId == undefined) return;
  await browser.tabs.remove(tabId);
}

/**
 * Hides one or more tabs.
 */
export async function tabOpHide(tabId: number | number[] | undefined): Promise<number[] | undefined> {
  if (tabId == undefined) return;
  return await browser.tabs.hide(tabId);
}

/**
 * Modifies the properties of a tab.
 */
export async function tabOpUpdate(
  tabId: number | undefined,
  updateProperties: browser.tabs._UpdateUpdateProperties
): Promise<EnhancedTab | undefined> {
  if (tabId == undefined) return;
  return _update(
    tabId,
    updateProperties
  );
}

/**
 * Updates a tab to be inactive and muted.
 */
export async function tabOpUpdateActiveFalse(tabId: number | undefined): Promise<EnhancedTab | undefined> {
  if (tabId == undefined) return;
  return _update(
    tabId,
    {active: false, muted: true}
  );
}

/**
 * Focuses the window containing the tab, then highlights and activates the tab.
 */
export async function tabOpFocus(tabId: number | undefined): Promise<EnhancedTab | undefined> {
  if (tabId == undefined) return;
  const tab = await tabOpGet(tabId);
  if (!tab || typeof tab.windowId !== 'number') {
    throw new Error(`Tab ${tabId} not found or has no window.`);
  }

  await browser.windows.update(
    tab.windowId,
    {focused: true}
  );
  return _update(
    tabId,
    {active: true, highlighted: true}
  );
}