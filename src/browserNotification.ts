import {browserRuntimeManifestName} from './browserRuntime';

export async function browserNotificationCreateBasicContent(content: string): Promise<string> {
  const notification = ({
    content: content,
  });
  const notificationOptions: browser.notifications.CreateNotificationOptions = {
    message: "",
    type: 'basic',
    title: browserRuntimeManifestName()
  };
  const options: browser.notifications.CreateNotificationOptions = {
    ...notificationOptions, ...notification
  }
  return await browserNotificationCreate(
    options
  );

}

export async function browserNotificationCreate(
  notificationOptions: browser.notifications.CreateNotificationOptions
): Promise<string> {
  return await browser.notifications.create(notificationOptions)
}
