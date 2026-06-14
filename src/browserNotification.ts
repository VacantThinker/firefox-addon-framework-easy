import {browserRuntimeManifestName} from './browserRuntime';

export interface NotificationTwoOptions {
  message: string,
  title?: string,
}

/**
 * Creates a browser notification with basic type,
 * if title null use addon manifest name.
 * @returns The notification identifier.
 * @param notificationTwoOptions
 */
export async function browserNotificationCreateBasicMessage(
  notificationTwoOptions: NotificationTwoOptions
): Promise<string> {
  const notificationOptions: browser.notifications.CreateNotificationOptions = {
    message: "",
    type: 'basic',
    title: browserRuntimeManifestName()
  };
  const options: browser.notifications.CreateNotificationOptions = {
    ...notificationOptions, ...notificationTwoOptions
  }
  return await browserNotificationCreate(
    options
  );
}

export async function browserNotificationCreate(
  notificationOptions: browser.notifications.CreateNotificationOptions
)
{
  return await browser.notifications.create(notificationOptions)
}
