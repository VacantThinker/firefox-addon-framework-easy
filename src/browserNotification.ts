import {
  browserRuntimeGeckoId,
  browserRuntimeManifestName
} from './browserRuntime';

/**
 * Creates a browser notification with basic type.
 * @param content The notification message string.
 * @param title The notification title (defaults to manifest name).
 * @returns The notification identifier.
 */
export async function browserNotificationCreate(
  content: string,
  title: string = browserRuntimeManifestName()
): Promise<string> {
  const notificationId = `${browserRuntimeGeckoId()}cake-noti`;

  const options: browser.notifications.CreateNotificationOptions = {
    type: 'basic',
    title: title,
    message: content,
  };

  await browser.notifications.create(
    notificationId,
    options
  );

  return notificationId;
}