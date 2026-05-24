/**
 *
 * @param { string}content
 * @param {string|null}title
 * @returns {Promise<string>}
 */
export async function browserNotificationCreate(content, title = null) {
  const tag = 'browserNotificationCreate';
  try {
    let notificationId = `${tag}cake-noti`;
    title = title ? title : browser.runtime.getManifest().name;
    console.info(tag, `content=${content}`, `title=${title}`);
    await browser.notifications.create(notificationId, {
      type: 'basic',
      title,
      message: content,
    });
    return notificationId;
  } catch (e) {
    console.error(tag, e);
  }
}
