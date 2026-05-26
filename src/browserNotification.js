import {browserRuntimeManifestName} from './browserRuntime.js';

/**
 *
 * @param content{ string}
 * @param title{string}
 * @returns {Promise<string>}
 */
export async function browserNotificationCreate(
    content,
    title = browserRuntimeManifestName()
) {

  const tag = 'browserNotificationCreate';
  try {
    let notificationId = `${tag}cake-noti`;
    console.info(tag, `content=${content}`, `title=${title}`);
    await browser.notifications.create(notificationId, {
      type: 'basic',
      title,
      message: `${content}`,
    });
    return notificationId;
  } catch (e) {
    console.error(tag, e);
  }
}
