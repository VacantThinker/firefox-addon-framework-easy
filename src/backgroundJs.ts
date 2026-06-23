// --- IN YOUR FRAMEWORK ---
import {browserTabSendMessageMarcoPolo} from "./browserTab";
import {tabOpFocus, tabOpReload, tabOpRemove} from "./opTab";
import {MessageActionBaseOptions, MessagePayloadDownloadInfo} from "./types";
import {browserNotificationCreateBasicContent} from "./browserNotification";
import {serviceDownloadByDownlink} from "./serviceCommon";

export type ActHandlerFunc = (
  rest: any,
  tabId?: number | undefined,
  tabUrl?: string | undefined) => Promise<void>;

/**
 * Uses <T extends string> so the app can pass its own union type.
 * It defaults to FrameworkBaseAction if no type is passed.
 */
export function bkJsCreateActionBaseHandlers
<T extends string = MessageActionBaseOptions>()
  : Map<T, ActHandlerFunc> {

  // We use `any` internally to set the map up without TS complaining,
  // but we return the strictly typed generic Map.
  const map = new Map<MessageActionBaseOptions, ActHandlerFunc>();
  map.set("actDownloadFile", async (rest: MessagePayloadDownloadInfo) => {
    if (rest && rest.downloadParams) {
      await serviceDownloadByDownlink(rest.downloadParams)
    }
  })
  map.set("actNotification", async (rest) => {
    if (rest && rest.content) {
      await browserNotificationCreateBasicContent(rest.content)
    }
  })
  map.set('actInfo', async (rest) => {
    console.info('actInfo', rest);
  });
  map.set('actMarco', async (_rest, tabId) => {
    if (tabId) await browserTabSendMessageMarcoPolo(tabId);
  });
  map.set('actFocusTargetTab', async (rest) => {
    if (rest) await tabOpFocus(rest.targetTabId);
  });
  map.set('actReloadTargetTab', async (rest) => {
    if (rest) await tabOpReload(rest.targetTabId);
  });
  map.set('actFocusCurrentTab', async (_rest, tabId) => {
    if (tabId) await tabOpFocus(tabId);
  });
  map.set('actRemoveCurrentTab', async (_rest, tabId) => {
    if (tabId) await tabOpRemove(tabId);
  });

  // Cast it to the consumer's type before returning
  return map as Map<T, ActHandlerFunc>;
}

/**
 * Dispatcher also accepts the generic map
 */
export function bkJsRegisterRuntimeActionDispatcher<T extends string>(
  handlersMap: Map<T, ActHandlerFunc>,
  logTag: string = "background.ts "
) {
  browser.runtime.onMessage.addListener(
    async (message, sender) => {
      const {act, ...rest} = message;
      if (!act) return;

      const tabId = sender?.tab?.id;
      const tabUrl = sender?.tab?.url;
      if (act !== "actMarco") {
        console.info(logTag, act, `tabId=`, tabId);
      } else {
        console.log(logTag, act, `tabId=`, tabId);
      }

      // Cast `act` to T so it can be used to query the Map
      const handler = handlersMap.get(act as T);
      if (handler) {
        await handler(rest, tabId, tabUrl);
      } else {
        console.warn(act, " not match!");
      }
    });
}