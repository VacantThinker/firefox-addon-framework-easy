/**
 * Sends a message to a specific tab.
 */
export async function browserTabSendMessage(tabId: number, message: any): Promise<void> {
  await browser.tabs.sendMessage(tabId, message);
}
