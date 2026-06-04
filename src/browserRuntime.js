export function browserRuntimeReload() {
  browser.runtime.reload();
}

/**
 *
 * @param url{string}
 */
export async function browserRuntimeSetUninstallURL(
    url = '',
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
