/**
 * Creates a normal tab using either a URL string or a properties object.
 *
 * @param tab{browser.tabs.Tab}
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpEnhance(tab) {
  return Object.assign({}, tab, {tabId: tab.id});
}

/**
 * Creates a normal tab using either a URL string or a properties object.
 *
 * @param {browser.tabs._CreateCreateProperties} properties
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreate(properties) {
  // Otherwise, assume it is already a properties object
  let tab = await browser.tabs.create(properties);
  return tabOpEnhance(tab);
}

/**
 *
 * @param {browser.tabs._CreateCreateProperties & {tabId: number} } properties
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreateNear(properties) {
  let tabPrev = await tabOpGet(properties.tabId);
  delete properties.tabId;
  Object.assign(properties, {
    index: tabPrev.index + 1, openerTabId: tabPrev.id,
  });

  let tab = await tabOpCreate(properties);
  return tabOpEnhance(tab);
}

/**
 * {active: false, muted: true}
 * @param properties{browser.tabs._CreateCreateProperties}
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreateActiveFalse(properties) {
  /**
   * @type {browser.tabs._CreateCreateProperties}
   */
  let source = {active: false, muted: true};
  Object.assign(properties, source);
  let tab = await browser.tabs.create(properties);
  return tabOpEnhance(tab);
}

/**
 * Creates a normal tab using either a URL string or a properties object.
 *
 * @param {string} url
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreateByWindow(url) {
  // If it's a string, wrap it in an object
  if (typeof url === 'string') {
    let window = await browser.windows.create({
      url,
    });
    let tab = window.tabs.shift();
    return tabOpEnhance(tab);
  }
}

/**
 *
 * @param tabId{number}
 * @return {Promise<browser.tabs.Tab>}
 */
export async function tabOpGet(tabId) {
  return await browser.tabs.get(tabId);
}

/**
 *
 * @returns {Promise<browser.tabs.Tab[]>}
 */
export async function tabOpQueryAll() {
  return await browser.tabs.query({});
}

/**
 *
 * @param urlQuery{string}
 * @returns {Promise<number[]>}
 */
export async function tabOpQueryUrl(urlQuery) {
  let tabs = await browser.tabs.query({url: urlQuery});
  return tabs.map(v => v.id);
}

/**
 *
 * @param urlQuery{string}
 * @returns {Promise<void>}
 */
export async function tabOpQueryUrlThenRemove(urlQuery) {
  let ids = await tabOpQueryUrl(urlQuery);
  ids.map(id => tabOpRemove(id));
}

/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpReload(tabId) {
  await browser.tabs.reload(tabId, {bypassCache: true});
}

/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpReloadByPassCacheTrue(tabId) {
  await browser.tabs.reload(tabId, {bypassCache: true});
}

/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpRemove(tabId) {
  await browser.tabs.remove(tabId);
}

/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpHide(tabId) {
  await browser.tabs.hide(tabId);
}

/**
 *
 * @param {number}tabId
 * @param {browser.tabs._UpdateUpdateProperties}updateProperties
 * @returns {Promise<browser.tabs.Tab&{tabId: number}>}
 */
export async function tabOpUpdate(tabId, updateProperties) {
  let tab = await browser.tabs.update(tabId, updateProperties);
  return tabOpEnhance(tab);
}

/**
 * active: false, muted: true
 * @param tabId{number}
 * @returns {Promise<browser.tabs.Tab&{tabId: number}>}
 */
export async function tabOpUpdateActiveFalse(tabId) {
  return await tabOpUpdate(tabId, {active: false, muted: true});
}

/**
 * @param tabId
 */
export async function tabOpFocus(tabId) {
  let tab = await tabOpGet(tabId);
  let windowId = tab.windowId;
  await browser.windows.update(windowId, {focused: true});

  let updateProperties = {active: true, highlighted: true};
  let tabUpdated = await tabOpUpdate(tabId, updateProperties);
  return tabOpEnhance(tabUpdated);
}

/**
 *
 * @param{number} tabId
 * @param {string}code
 * @returns {Promise<void>}
 */
export async function tabOpInsertCssCode(tabId, code) {
  await browser.tabs.insertCSS(tabId, {code});
}

/**
 *
 * @param{number} tabId
 * @param {string}code
 * @returns {Promise<void>}
 */
export async function tabOpRemoveCssCode(tabId, code) {
  await browser.tabs.removeCSS(tabId, {code});
}