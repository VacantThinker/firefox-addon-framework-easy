import {tabOpRemove} from './opTab.js';
import {serviceDownloadByDownlink} from './serviceCommon.js';
import {browserTabSendMessage} from './browserTab.js';

/**
 * offer common act <=> function, eg: actRemoveTab, actLog
 */
export function browserRuntimeOnMessageCommon() {
  browser.runtime.onMessage.addListener(
      (message, sender) => {
        message['tab'] = sender.tab;
        message['tabId'] = sender.tab?.id;

        let keyAct = 'act';
        /**
         * @type{
         *   |'actLog'
         *   |'actRemoveTab'
         *   |'actDownloadFile'
         *   |'actSendMessageToTab'
         * }
         */
        let act = message[keyAct];
        delete message[keyAct];
        if (act === 'actLog') {
          console.log('act', act, 'message', message);
        }
        else if (act === 'actRemoveTab') {
          tabOpRemove(message.tabId)
        }
        else if (act === 'actDownloadFile') {
          serviceDownloadByDownlink(message);
        }
        else if (act === 'actSendMessageToTab') {
          browserTabSendMessage(message.tabId, message);
        }
      });

}