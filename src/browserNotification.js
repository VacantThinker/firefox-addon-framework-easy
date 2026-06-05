import {browserRuntimeManifestName} from './browserRuntime.js';

/**
 *
 * @param content{ string}
 * @param title{string}
 * @returns {Promise<string>}
 */
export async function browserNotificationCreate(
  content,
  title = browserRuntimeManifestName(),
) {

  const tag = 'browserNotificationCreate';
  let notificationId = `${tag}cake-noti`;
  await browser.notifications.create(notificationId, {
    type: 'basic',
    title,
    message: `${content}`,
  });
  return notificationId;
}
