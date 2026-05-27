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
  await browser.tabs.reload(tabId);
}

/**
 * {active: false, muted: true}
 * Creates a normal tab using either a URL string or a properties object.
 * @param urlOrArgs{string|browser.tabs._CreateCreateProperties}
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreate(urlOrArgs) {
    /**
     * @type {browser.tabs._CreateCreateProperties}
     */
    let source = {active: false, muted: true};
    // If it's a string, wrap it in an object
    if (typeof urlOrArgs === 'string') {
      let tab = await browser.tabs.create(Object.assign(
          {url: urlOrArgs}, source,
      ));
      return tabOpEnhance(tab);
    }
    Object.assign(urlOrArgs, source);
    let tab = await browser.tabs.create(urlOrArgs);
    return tabOpEnhance(tab)
}

/**
 * Creates a normal tab using either a URL string or a properties object.
 *
 * @param {string|browser.tabs._CreateCreateProperties} urlOrArgs
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
export async function tabOpCreateNormal(urlOrArgs) {
  // If it's a string, wrap it in an object
  if (typeof urlOrArgs === 'string') {
    let tab = await browser.tabs.create({url: urlOrArgs});
    return tabOpEnhance(tab)
  }

  // Otherwise, assume it is already a properties object
  let tab = await browser.tabs.create(urlOrArgs);
  return tabOpEnhance(tab)
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
      url
    });
    let tab = window.tabs.shift();
    return tabOpEnhance(tab)
  }
}



/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpRemove(tabId) {
  try {
    await browser.tabs.remove(tabId);
  } catch (e) {
    console.error(e);
  }
}

/**
 *
 * @param tabId{number}
 * @returns {Promise<void>}
 */
export async function tabOpHide(tabId) {
  try {
    await browser.tabs.hide(tabId);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Creates a normal tab using either a URL string or a properties object.
 *
 * @param tab{browser.tabs.Tab}
 * @returns {Promise<(browser.tabs.Tab & {tabId: number})>}
 */
async function tabOpEnhance(tab) {
  return Object.assign(tab, {tabId: tab.id});
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
  return tabOpEnhance(tabUpdated)
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