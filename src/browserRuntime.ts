/**
 * Reloads the current extension.
 */
export function browserRuntimeReload(): void {
  browser.runtime.reload();
}

/**
 * Sets the URL to be visited upon uninstallation.
 * @param url The URL string, defaults to empty.
 */
export async function browserRuntimeSetUninstallURL(url: string = ''): Promise<void> {
  await browser.runtime.setUninstallURL(url);
}

/**
 * Adds a listener for available updates.
 */
export function browserRuntimeOnUpdateAvailable(): void {
  browser.runtime.onUpdateAvailable.addListener(() => {
  });
}

/**
 * Converts a relative path to a fully qualified URL.
 * @param path The path to the resource.
 * @returns The absolute URL string.
 */
export function browserRuntimeGetURL(path: string): string {
  return browser.runtime.getURL(path);
}

/**
 * `pages/${path}`
 * @param path
 */
export function browserRuntimeGetPagesURL(path: string): string {
  return browser.runtime.getURL(`pages/${path}`);
}

/**
 * `pages/${path}.html`
 * @param path
 */
export function browserRuntimeGetPagesURLNoNeedExtHTML(path: string): string {
  return browser.runtime.getURL(`pages/${path}.html`);
}

/**
 * Retrieves the Gecko ID from the manifest.
 * @returns The Gecko ID or empty string if not found.
 */
export function browserRuntimeGeckoId(): string {
  const manifest = browser.runtime.getManifest() as any;
  return manifest.browser_specific_settings?.gecko?.id ??
    '';
}

/**
 * Gets information about the current platform.
 * @returns A promise resolving to PlatformInfo.
 */
export async function browserRuntimePlatformInfo(): Promise<browser.runtime.PlatformInfo> {
  return await browser.runtime.getPlatformInfo();
}

/**
 * Gets the version from the manifest.
 * @returns The version string.
 */
export function browserRuntimeManifestVersion(): string {
  return browser.runtime.getManifest().version;
}

/**
 * Gets the extension name from the manifest.
 * @returns The extension name.
 */
export function browserRuntimeManifestName(): string {
  return browser.runtime.getManifest().name;
}
