/**
 * Enhances a tab object by explicitly attaching its ID to the 'tabId' property.
 *
 * @param {browser.tabs.Tab} tab
 * @returns {browser.tabs.Tab & {tabId: number}|null}
 */
export function tabOpEnhance(tab) {
  if (!tab || typeof tab.id !== 'number') return null;
  return {...tab, tabId: tab.id};
}

/**
 * Creates a normal tab using a properties object.
 *
 * @param {Object} properties
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export async function tabOpCreate(properties) {
  const tab = await browser.tabs.create(properties);
  return tabOpEnhance(tab);
}

/**
 * Creates a new tab positioned immediately after a specified existing tab.
 * Does not mutate the original properties object.
 *
 * @param {Object & {tabId?: number}} properties
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export async function tabOpCreateNear(properties) {
  // Destructure tabId out to avoid mutating the original properties object
  const {tabId, ...restProperties} = properties;

  if (tabId) {
    const tabPrev = await tabOpGet(tabId);
    if (tabPrev) {
      Object.assign(restProperties, {
        index: tabPrev.index + 1,
        openerTabId: tabPrev.id,
      });
    }
  }

  const tab = await browser.tabs.create(restProperties);
  return tabOpEnhance(tab);
}

/**
 * Creates a tab in the background (inactive and muted).
 *
 * @param {Object} properties
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export async function tabOpCreateActiveFalse(properties) {
  const mergedProperties = {
    ...properties,
    active: false,
    muted: true,
  };
  const tab = await browser.tabs.create(mergedProperties);
  return tabOpEnhance(tab);
}

/**
 * Creates a completely new window and returns its initial tab.
 *
 * @param {string} url
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})|undefined>}
 */
export async function tabOpCreateByWindow(url) {
  if (typeof url !== 'string') return undefined;

  const window = await browser.windows.create({url});
  if (window && window.tabs && window.tabs.length > 0) {
    return tabOpEnhance(window.tabs[0]);
  }
  return undefined;
}

/**
 * Retrieves details about the specified tab.
 *
 * @param {number} tabId
 * @returns {Promise<browser.tabs.Tab>}
 */
export function tabOpGet(tabId) {
  return browser.tabs.get(tabId);
}

/**
 * Retrieves all tabs across all windows.
 *
 * @returns {Promise<browser.tabs.Tab[]>}
 */
export function tabOpQueryAll() {
  return browser.tabs.query({});
}

/**
 * Retrieves an array of tab IDs that match the specified URL pattern.
 *
 * @param {string} urlQuery
 * @returns {Promise<number[]>}
 */
export async function tabOpQueryUrl(urlQuery) {
  const tabs = await browser.tabs.query({url: urlQuery});
  return tabs.map(tab => tab.id);
}

/**
 * Finds all tabs matching the URL pattern and removes them simultaneously.
 * [Optimization]: browser.tabs.remove accepts an array of numbers, which is
 * significantly faster than looping and awaiting individually.
 *
 * @param {string} urlQuery
 * @returns {Promise<void>}
 */
export async function tabOpQueryUrlThenRemove(urlQuery) {
  const ids = await tabOpQueryUrl(urlQuery);
  if (ids.length > 0) {
    await browser.tabs.remove(ids);
  }
}

/**
 * Reloads the given tab.
 *
 * @param {number} tabId
 * @returns {Promise<void>}
 */
export function tabOpReload(tabId) {
  return browser.tabs.reload(tabId);
}

/**
 * Reloads the given tab, bypassing the local web cache.
 *
 * @param {number} tabId
 * @returns {Promise<void>}
 */
export function tabOpReloadByPassCacheTrue(tabId) {
  return browser.tabs.reload(tabId, {bypassCache: true});
}

/**
 * Closes one or more tabs.
 *
 * @param {number|number[]} tabId
 * @returns {Promise<void>}
 */
export function tabOpRemove(tabId) {
  return browser.tabs.remove(tabId);
}

/**
 * Hides one or more tabs (Firefox specific API).
 *
 * @param {number|number[]} tabId
 * @returns {Promise<number[]>}
 */
export function tabOpHide(tabId) {
  return browser.tabs.hide(tabId);
}

/**
 * Modifies the properties of a tab.
 *
 * @param {number} tabId
 * @param {Object} updateProperties
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export async function tabOpUpdate(
    tabId,
    updateProperties,
) {
  const tab = await browser.tabs.update(tabId, updateProperties);
  return tabOpEnhance(tab);
}

/**
 * Updates a tab to be inactive and muted.
 *
 * @param {number} tabId
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export function tabOpUpdateActiveFalse(tabId) {
  return tabOpUpdate(tabId, {active: false, muted: true});
}

/**
 * Focuses the window containing the tab, then highlights and activates the tab.
 *
 * @param {number} tabId
 * @returns {Promise<browser.tabs.Tab & {tabId: number}>}
 */
export async function tabOpFocus(tabId) {
  const tab = await tabOpGet(tabId);
  if (!tab || !tab.windowId) throw new Error(`Tab ${tabId} not found.`);

  await browser.windows.update(tab.windowId, {focused: true});

  const tabUpdated = await browser.tabs.update(tabId, {
    active: true,
    highlighted: true,
  });

  return tabOpEnhance(tabUpdated);
}

/**
 * Injects CSS code into a page.
 * Note: Check manifest version compatibility for 'insertCSS'.
 *
 * @param {number} tabId
 * @param {string} code
 * @returns {Promise<void>}
 */
export function tabOpInsertCssCode(
    tabId,
    code,
) {
  return browser.tabs.insertCSS(tabId, {code});
}

/**
 * Removes CSS code that was previously injected into a page.
 *
 * @param {number} tabId
 * @param {string} code
 * @returns {Promise<void>}
 */
export function tabOpRemoveCssCode(
    tabId,
    code,
) {
  return browser.tabs.removeCSS(tabId, {code});
}