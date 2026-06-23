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
  try {
    // Attempt 1: Full download with provided parameters
    await browserDownloadByDownlink(params);
  } catch (error) {
    // Notify about the failure
    await browserNotificationCreateBasicContent(`reason=${error}`);
    const {filename, ...rest} = params;
    await browserDownloadByDownlink(rest);
  }
}