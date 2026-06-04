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

  browserDownloadByDownlink(message).then(async () => {
    await browserNotificationCreate(`downloading! ${filename}`);
  }, async (reason) => {
    await browserNotificationCreate(`reason=${reason}`)
    await browserDownloadByDownlink({downlink});
  });

}