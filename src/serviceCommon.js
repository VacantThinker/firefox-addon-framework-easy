import {browserDownloadByDownlink} from './browserDownload.js';
import {browserNotificationCreate} from './browserNotification.js';

/**
 * service, download by downlink, if success, notification the filename
 *
 * if failed, nootification the reason, then try download only use downlink
 * @param message
 * @returns {Promise<void>}
 */
export async function serviceDownloadByDownlink(message) {
  let {filename, downlink} = message;

  try {
    await browserDownloadByDownlink(message);
    await browserNotificationCreate(`downloading! ${filename}`);
  } catch (e) {
    await browserNotificationCreate(`reason=${e}`);
    await browserDownloadByDownlink({downlink});
  }

}