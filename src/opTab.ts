import {serviceGetDomain} from "./serviceGet";

/**
 * Interface representing a Tab with an explicitly defined tabId.
 */
export interface EnhancedTab extends browser.tabs.Tab {
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
async function _update(tabId: number, properties: browser.tabs._UpdateUpdateProperties): Promise<EnhancedTab> {
  const tab = await browser.tabs.update(tabId, properties);
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

interface TabOpCreateNearOptions {
  properties: browser.tabs._CreateCreateProperties;
  previousTabId: number | undefined;
}

/**
 * Creates a new tab positioned immediately after a specified existing tab.
 */
export async function tabOpCreateNear(options: TabOpCreateNearOptions): Promise<EnhancedTab> {
  const {properties, previousTabId} = options;

  if (previousTabId !== undefined) {
    try {
      const previousTab = await tabOpGet(previousTabId);
      properties.index = previousTab.index + 1;
      properties.openerTabId = previousTab.id;
    } catch {
      // Ignore if source tab is invalid
    }
  }

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
 * Creates a new window and returns its primary tab.
 */
export async function tabOpCreateByWindow(url: string): Promise<EnhancedTab | undefined> {
  const window = await browser.windows.create({url});
  const tab = window.tabs?.[0];
  return tab ? tabOpEnhance(tab) ?? undefined : undefined;
}

/**
 * Retrieves details about the specified tab.
 */
export async function tabOpGet(tabId: number): Promise<browser.tabs.Tab> {
  return await browser.tabs.get(tabId);
}

/**
 * Retrieves all tabs across all windows.
 */
export async function tabOpQueryAll(): Promise<browser.tabs.Tab[]> {
  return await browser.tabs.query({});
}

/**
 *
 * @param {string} domain
 */
export async function tabOpQueryDomain(domain: string): Promise<{
  id: number, url: string, title: string
}[]> {
  const tabs = await tabOpQueryAll();

  if (tabs.length > 0) {
    return tabs
      .filter(t => t.url && t.id && serviceGetDomain(t.url) === domain)
      .map(t => ({
        id: t.id!,
        url: t.url!,
        title: t.title || ''
      }));
  }
  return [];
}

/**
 * Retrieves an array of tab IDs matching the URL pattern.
 */
export async function tabOpQueryUrl(urlQuery: string): Promise<number[]> {
  const tabs = await browser.tabs.query({url: urlQuery});
  return tabs.filter((t) => typeof t.id === 'number').map((t) => t.id!);
}

/**
 * Finds all tabs matching the URL pattern and removes them simultaneously.
 */
export async function tabOpQueryUrlThenRemove(urlQuery: string): Promise<void> {
  const ids = await tabOpQueryUrl(urlQuery);
  if (ids.length > 0) {
    await browser.tabs.remove(ids);
  }
}

/**
 * Reloads the given tab.
 * @param tabId The tab ID to reload.
 * @param bypassCache Whether to bypass the cache.
 */
export async function tabOpReload(tabId: number, bypassCache: boolean = false): Promise<void> {
  await browser.tabs.reload(tabId, {bypassCache});
}

/**
 * Closes one or more tabs.
 */
export async function tabOpRemove(tabId: number | number[]): Promise<void> {
  await browser.tabs.remove(tabId);
}

/**
 * Hides one or more tabs.
 */
export async function tabOpHide(tabId: number | number[]): Promise<number[]> {
  return await browser.tabs.hide(tabId);
}

/**
 * Modifies the properties of a tab.
 */
export async function tabOpUpdate(
  tabId: number,
  updateProperties: browser.tabs._UpdateUpdateProperties
): Promise<EnhancedTab> {
  return _update(tabId, updateProperties);
}

/**
 * Updates a tab to be inactive and muted.
 */
export async function tabOpUpdateActiveFalse(tabId: number): Promise<EnhancedTab> {
  return _update(tabId, {active: false, muted: true});
}

/**
 * Focuses the window containing the tab, then highlights and activates the tab.
 */
export async function tabOpFocus(tabId: number): Promise<EnhancedTab> {
  const tab = await browser.tabs.get(tabId);
  if (!tab || typeof tab.windowId !== 'number') {
    throw new Error(`Tab ${tabId} not found or has no window.`);
  }

  await browser.windows.update(tab.windowId, {focused: true});
  return _update(tabId, {active: true, highlighted: true});
}

/**
 * Injects CSS code into a page.
 */
export async function tabOpInsertCssCode(tabId: number, code: string): Promise<void> {
  await browser.tabs.insertCSS(tabId, {code});
}

/**
 * Removes CSS code that was previously injected into a page.
 */
export async function tabOpRemoveCssCode(tabId: number, code: string): Promise<void> {
  await browser.tabs.removeCSS(tabId, {code});
}