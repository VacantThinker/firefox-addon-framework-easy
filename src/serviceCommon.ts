import {browserDownloadByDownlink, DownloadParams} from './browserDownload';
import {browserNotificationCreateBasicContent} from './browserNotification';
import {stoOpClear} from "./opStorage";
import {browserRuntimeReload} from "./browserRuntime";

/**
 * clear storage, then raload addon
 */
export async function serviceResetAddon() {
  await stoOpClear();
  browserRuntimeReload();
}

/**
 * Service to handle download operations.
 * Attempts a full download with filename; if it fails, retries with downlink
 * only.
 * * @param params The download parameters.
 */
export async function serviceDownloadByDownlink(
  params: DownloadParams): Promise<void> {
  const {
    filename,
    downlink
  } = params;

  try {
    // Attempt 1: Full download with provided parameters
    await browserDownloadByDownlink(params);
    await browserNotificationCreateBasicContent(
      `downloading! ${filename ?? 'file'}`);
  } catch (error) {
    // Notify about the failure
    await browserNotificationCreateBasicContent(`reason=${error}`);

    // Attempt 2: Fallback retry using only the downlink
    await browserDownloadByDownlink({downlink});
  }
}