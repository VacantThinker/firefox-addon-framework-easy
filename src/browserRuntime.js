import {tabOpCreate} from './opTab.js';
import {browserNotificationCreate} from './browserNotification.js';

export function browserRuntimeReload() {
  browser.runtime.reload();
}

/**
 *
 * @param url{string}
 */
export async function browserRuntimeSetUninstallURL(
    url = 'https://addons.mozilla.org/en-US/firefox/user/17783213/',
) {
  await browser.runtime.setUninstallURL(url);
}

/**
 *
 * @param doWhat{function}
 */
export function browserRuntimeOnUpdateAvailable(doWhat = null) {
  browser.runtime.onUpdateAvailable.addListener(async (details) => {
    if (doWhat) {
      await doWhat(details);
    }
    else {
      try {
        let id = await browserNotificationCreate(
            'There is a new version!',
        );
        browser.notifications.onClicked.addListener(async (notificationId) => {
          if (notificationId === id) {
            await tabOpCreate('https://addons.mozilla.org/en-US/firefox/user/17783213/');
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  });
}

/**
 * @returns {browser._manifest.ExtensionID}
 */
export function browserRuntimeGeckoId() {
  return browser.runtime.getManifest().browser_specific_settings.gecko.id;
}

/**
 *
 * @returns {Promise<browser.runtime.PlatformInfo>}
 */
export async function browserRuntimePlatformInfo() {
  return await browser.runtime.getPlatformInfo();
}

/**
 * browser.runtime.getManifest().version;
 * @returns {string}
 */
export function browserRuntimeManifestVersion() {
  return browser.runtime.getManifest().version;
}

/**
 * browser.runtime.getManifest().name;
 * @returns {string}
 */
export function browserRuntimeManifestName() {
  return browser.runtime.getManifest().name;
}
