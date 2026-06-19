import {browserRuntimeManifestName} from './browserRuntime';

export async function browserNotificationCreateBasicMessage(message: string) {
  await browserNotificationCreateBasicContent(message)
}

export async function browserNotificationCreateBasicContent(content: string): Promise<string> {
  const notificationOptions: browser.notifications.CreateNotificationOptions = {
    message: content,
    type: 'basic',
    title: browserRuntimeManifestName()
  };
  return await browserNotificationCreate(notificationOptions);
}

export async function browserNotificationCreate(
  notificationOptions: browser.notifications.CreateNotificationOptions
): Promise<string> {
  return await browser.notifications.create(notificationOptions)
}
