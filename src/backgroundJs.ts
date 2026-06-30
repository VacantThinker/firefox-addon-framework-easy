// --- IN YOUR FRAMEWORK ---
import {tabOpFocus, tabOpReload, tabOpRemove} from "./opTab";
import {MessageActionBaseOptions, MessagePayloadDownloadInfo} from "./types";
import {browserNotificationCreateBasicContent} from "./browserNotification";
import {serviceDownloadByDownlink} from "./serviceCommon";

export type ActHandlerFunc = (
  rest: any,
  tabId?: number | undefined,
  tabUrl?: string | undefined
) => Promise<void>;

/**
 * Uses <T extends string> so the app can pass its own union type.
 * It defaults to FrameworkBaseAction if no type is passed.
 */
export function bkJsCreateActionBaseHandlers<
  T extends string = MessageActionBaseOptions>()
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
  map.set('actMarco', async (rest: any, tabId) => {
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
      }
      else {
        console.log(logTag, act, `tabId=`, tabId);
      }

      // Cast `act` to T so it can be used to query the Map
      const handler = handlersMap.get(act as T);
      if (handler) {
        await handler(rest, tabId, tabUrl);
      }
      else {
        console.warn(act, " not match!");
      }
    });
}


//============================================================================
// alarm area
//============================================================================

export type AlarmHandlerFunc = (
  alarm: browser.alarms.Alarm,
) => Promise<void>;

/**
 * Uses <T extends string> so the app can pass its own union type.
 * It defaults to FrameworkBaseAction if no type is passed.
 */
export function bkJsCreateAlarmBaseHandlers<
  T extends string>()
  : Map<T, AlarmHandlerFunc> {
  const map = new Map<string, AlarmHandlerFunc>();
  return map as Map<T, AlarmHandlerFunc>;
}

/**
 * Dispatcher also accepts the generic map
 */
export function bkJsRegisterAlarmDispatcher<T extends string>(
  handlersMap: Map<T, AlarmHandlerFunc>,
  logTag: string = "initialAlarm.ts "
) {
  browser.alarms.onAlarm.addListener(async (alarm) => {
    const {name} = alarm;
    const handler = handlersMap.get(name as T);
    console.info(logTag, "name=", name, " triggered")
    if (handler) {
      await handler(alarm);
    }
    else {
      console.info(logTag, "name=", name, " not match!")
    }
  })
}


// 1. The function now RETURNS the CreateAlarmInfo (or void if they decide not to set an
// alarm)
export type AlarmSetupFunc = (
  name: string
) => Promise<browser.alarms._CreateAlarmInfo | void>;

export function bkJsCreateAlarmSetupMap<T extends string>(): Map<T, AlarmSetupFunc> {
  const map = new Map<string, AlarmSetupFunc>();
  const originalSet = map.set.bind(map);

  map.set = (key: string, originalFunc: AlarmSetupFunc) => {

    // 2. Wrap the function to intercept its return value
    const wrappedFunc: AlarmSetupFunc = async (name) => {

      // Execute the user's complex logic to get the alarm info
      const alarmInfo = await originalFunc(name);

      // 3. Auto-inject the creation logic ONLY if they returned valid info
      if (alarmInfo) {
        await browser.alarms.create(name, alarmInfo);
        console.info(`[Framework] Auto-created alarm: ${name}`);
      }
    };

    return originalSet(key, wrappedFunc);
  };

  return map as unknown as Map<T, AlarmSetupFunc>;
}
