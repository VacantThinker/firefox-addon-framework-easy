import {tabOpRemove} from './opTab.js';
import {serviceDownloadByDownlink} from './serviceCommon.js';
import {browserTabSendMessage} from './browserTab.js';
import {browserNotificationCreate} from './browserNotification.js';

/**
 * offer common act <=> function, eg: actRemoveTab, actLog
 */
/**
 *
 * @param act{
 *          'actLog'
 *          |'actNotification'
 *          |'actRemoveTab'
 *          |'actDownloadFile'
 *          |'actSendMessageToTab'
 * }
 * @param message
 */
export function browserRuntimeOnMessageCommon(act, message) {
  switch (act) {
    case 'actLog':
      console.log('act', act, 'message', message);
      break;
    case 'actNotification':
      browserNotificationCreate(message.content)
      break
    case 'actRemoveTab':
      tabOpRemove(message.tabId);
      break;
    case 'actDownloadFile':
      serviceDownloadByDownlink(message);
      break;
    case 'actSendMessageToTab':
      browserTabSendMessage(message.tabId, message);
      break;
  }

}
