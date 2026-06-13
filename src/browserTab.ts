/**
 * Sends a message to a specific tab.
 */
export async function browserTabSendMessage(
  tabId: number,
  message: any
): Promise<void> {
  await browser.tabs.sendMessage(
    tabId,
    message
  );
}

export async function browserTabExecuteScriptDocumentStart(
  tabId: number,
  code: string,
) {
  return await browserTabExecuteScript(
    tabId,
    code,
    "document_start"
  )
}

export async function browserTabExecuteScript(
  tabId: number,
  code: string,
  runAt: browser.extensionTypes.RunAt = "document_end"
) {
  return await browser.tabs.executeScript(
    tabId,
    {code, runAt}
  )
}

export async function browserTabSetZoom(
  tabId: number,
  zoomFactor: number
) {
  return await browser.tabs.setZoom(
    tabId,
    zoomFactor
  )
}

export async function browserTabGetZoom(
  tabId: number,
) {
  return await browser.tabs.getZoom(tabId)
}


export async function browserTabInsertCSSDocumentStart(
  tabId: number,
  code: string,
): Promise<void> {
  await browserTabInsertCSS(
    tabId,
    code,
    "document_start"
  )
}

/**
 * Injects CSS code into a page.
 */
export async function browserTabInsertCSS(
  tabId: number,
  code: string,
  runAt: browser.extensionTypes.RunAt
): Promise<void> {
  await browser.tabs.insertCSS(
    tabId,
    {code, runAt}
  );
}

/**
 * Removes CSS code that was previously injected into a page.
 */
export async function browserTabRemoveCSS(
  tabId: number,
  code: string
): Promise<void> {
  await browser.tabs.removeCSS(
    tabId,
    {code}
  );
}