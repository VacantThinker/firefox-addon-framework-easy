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

export async function browserTabExecuteScriptCodeDocumentStart(
  tabId: number,
  code: string,
) {
  return browserTabExecuteScriptDocumentStart(
    tabId,
    {code}
  )
}

export async function browserTabExecuteScriptDocumentStart(
  tabId: number,
  updateDetails: browser.extensionTypes.InjectDetails
) {
  const details: browser.extensionTypes.InjectDetails
    = {...updateDetails, runAt: "document_start"}
  return await browserTabExecuteScript(
    tabId,
    details
  )
}

export async function browserTabExecuteScript(
  tabId: number,
  details: browser.extensionTypes.InjectDetails
) {
  return await browser.tabs.executeScript(
    tabId,
    details
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

export async function browserTabInsertCSSCodeDocumentStart(
  tabId: number,
  code: string
): Promise<void> {
  const mergedDetails: browser.extensionTypes.InjectDetails
    = {code};
  await browserTabInsertCSSDocumentStart(
    tabId,
    mergedDetails
  )
}

export async function browserTabInsertCSSDocumentStart(
  tabId: number,
  details: browser.extensionTypes.InjectDetails,
): Promise<void> {
  const mergedDetails: browser.extensionTypes.InjectDetails
    = {...details, runAt: 'document_start'};
  await browserTabInsertCSS(
    tabId,
    mergedDetails
  )
}

/**
 * Injects CSS code into a page.
 */
export async function browserTabInsertCSS(
  tabId: number,
  details: browser.extensionTypes.InjectDetails,
): Promise<void> {
  await browser.tabs.insertCSS(
    tabId,
    details
  );
}

export async function browserTabRemoveCSSCode(
  tabId: number,
  code: string
): Promise<void> {
  await browserTabRemoveCSS(
    tabId,
    {code}
  )
}

export async function browserTabRemoveCSS(
  tabId: number,
  details: browser.extensionTypes.InjectDetails
): Promise<void> {
  await browser.tabs.removeCSS(
    tabId,
    details
  );
}
