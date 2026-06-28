import {tabOpCreateActiveTrue, tabOpCreateKeepOnlyOneFocusTrue} from "./opTab";
import {browserBrowsingDataRemoveDomainCache} from "./browserBrowsingData";
import {browserRuntimeSendMessage} from "./browserRuntime";
import {
  MessagePayloadAction,
  MessagePayloadDownloadInfo,
  MessagePayloadFocusTargetTab,
  MessagePayloadInfo,
  MessagePayloadNotification,
  MessagePayloadReloadTargetTab
} from "./types";
import {DownloadParams} from "./browserDownload";

/**
 * Bypasses virtual DOM tracking properties to force modern framework
 * listeners to accept assignments
 */
export function ctJsSetInputElementNativeValue(element: HTMLInputElement,
                                               value: string
) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch bubbling events to trigger UI framework event tracking maps
  element.dispatchEvent(new Event('input', {bubbles: true}));
  element.dispatchEvent(new Event('change', {bubbles: true}));
}

/**
 * Captures an <img> element from the current document, draws it to a canvas
 * matching its expected YouTube aspect ratio dimensions, and triggers a
 * browser download.
 * * @param filename - The name to save the downloaded file as.
 * @param filename
 * @param querySelector - Optional custom selector if you aren't targeting the
 *   first <img>.
 * @param delayMs
 */
export function ctJsDownloadYoutubeImageViaCanvas(
  filename: string,
  querySelector: string = 'img',
  delayMs: number = 300
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = document.body.querySelector<HTMLImageElement>(querySelector);
    if (!img) {
      console.warn("No image element found on the page.");
      return resolve();
    }

    const sizes = new Map<number, { w: number; h: number }>();
    sizes.set(1280, {w: 1280, h: 720});
    sizes.set(320, {w: 1280, h: 720});
    sizes.set(640, {w: 1280, h: 900});
    sizes.set(480, {w: 1280, h: 900});

    const {w, h} = sizes.get(img.naturalWidth) || {
      w: img.naturalWidth,
      h: img.naturalHeight
    };

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve();

    ctx.drawImage(img, 0, 0, w, h);

    // BETTER WAY: Use toBlob instead of toDataURL
    canvas.toBlob((blob) => {
      if (!blob) {
        return reject(new Error("Canvas to Blob conversion failed"));
      }

      // Create a temporary local URL for the binary data
      const blobUrl = URL.createObjectURL(blob);

      const eleA = document.createElement('a');
      eleA.href = blobUrl;
      eleA.download = filename;
      eleA.click();

      // Clean up the memory immediately after the click
      URL.revokeObjectURL(blobUrl);

      // Wait for the browser to register the download before resolving
      setTimeout(() => {
        resolve();
      }, delayMs);

    }, 'image/jpeg', 1.0);
  });
}

/**
 * Delays execution for a random period to emulate human actions and bypass
 * anti-bot detections.
 * @param {number} min - Minimum duration in milliseconds.
 * @param {number} max - Maximum duration in milliseconds.
 * @returns {Promise<void>}
 */
export function ctJsRandomSleep(min: number, max: number): Promise<void> {
  return new Promise(resolve =>
    setTimeout(
      resolve,
      Math.floor(Math.random() * (max - min + 1)) +
      min),
  );
}

export async function ctJsRandomSleep2001_2500() {
  await ctJsRandomSleep(2001, 2500);
}

export async function ctJsRandomSleep1501_2000() {
  await ctJsRandomSleep(1501, 2000);
}

export async function ctJsRandomSleep1001_1500() {
  await ctJsRandomSleep(1001, 1500);
}

export async function ctJsRandomSleep501_1000() {
  await ctJsRandomSleep(501, 1000);
}

export async function ctJsRandomSleep501_800() {
  await ctJsRandomSleep(501, 800);
}

const SLEEP_RANGES = {
  vShort: [
    501,
    800
  ],
  short: [
    501,
    1000
  ],
  medium: [
    1001,
    1500
  ],
  long: [
    1501,
    2000
  ],
  vLong: [
    2001,
    2500
  ],
} as const;

export async function ctJsPresetSleep(preset: keyof typeof SLEEP_RANGES) {
  const [min, max] = SLEEP_RANGES[preset];
  await ctJsRandomSleep(min, max);
}

// Usage: await ctJsPresetSleep('vLong');

/**
 * Safely isolates numerals from alphanumeric video quality markers (e.g.,
 * "1080p" -> "1080").
 * @param {string} text - Raw textual value containing targeting resolution
 *   details.
 * @returns {string} Normalized string representation of numbers, or "unknown".
 */
export function ctJsExtractVideoQualityFromText(text: string): string {
  const num = parseInt(
    text,
    10);
  return Number.isNaN(num) ? 'unknown' : num.toString();
}

/**
 * Executes a provided function once the entire page (including all dependent
 * resources such as stylesheets and images) is fully loaded.
 * If the page is already fully loaded, it executes immediately.
 * * @param fn - The function to execute. Can be synchronous or asynchronous.
 */
export async function ctJsExecuteOnComplete(fn: () => void | Promise<void>): Promise<void> {
  // 'complete' means the DOM is ready AND all external resources have finished
  // loading
  if (document.readyState === 'complete') {
    await fn();
  } else {
    // Wait for the window 'load' event, which fires after all resources are
    // downloaded
    await new Promise<void>((resolve) => {
      window.addEventListener(
        'load',
        async () => {
          await fn();
          resolve();
        },
        {once: true}
      );
    });
  }
}

/**
 * Executes a provided function once the DOM is ready.
 * If the DOM is already ready, it executes immediately.
 * * @param fn - The function to execute. Can be a synchronous or asynchronous
 * function.
 */
export async function ctJsExecuteOnReady(fn: () => void | Promise<void>): Promise<void> {
  if (document.readyState === 'loading') {
    // DOM is still loading, wait for the event
    await new Promise<void>((resolve) => {
      document.addEventListener(
        'DOMContentLoaded',
        async () => {
          await fn();
          resolve();
        },
        {once: true}
      );
    });
  } else {
    // DOM is already ready, execute immediately
    await fn();
  }
}

export function ctJsElementScrollIntoViewSmoothEnd(
  targetElement: HTMLElement) {
  targetElement.scrollIntoView({
    behavior: 'smooth', block: 'end'
  })
}

//===========================================================
//===========================================================
//===========================================================
//===========================================================

export async function ctJsOpenPage(url: string) {
  await tabOpCreateActiveTrue({url})
}

export async function ctJsRemoveDomainCache(domain: string) {
  await browserBrowsingDataRemoveDomainCache(domain)
}

export async function ctJsOpenPageKeepOnlyOne(url: string) {
  await tabOpCreateKeepOnlyOneFocusTrue(url)
}

export function ctJsHideElements(selectors: string[]) {
  selectors.forEach(sel => {
    Array.from(document.body.querySelectorAll<HTMLElement>(sel))
      .forEach(ele => ele.hidden = true)
  })
}

//-------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------
// -------------------------------------------------------------------------------

export function ctJskeepAlive() {
  setInterval(() => {
    browserRuntimeSendMessage<MessagePayloadAction>({
      act: "actMarco",
    }).then()
  }, 2000)
}

export async function ctJsCloseTab() {
  await browserRuntimeSendMessage<MessagePayloadAction>({
    act: 'actRemoveCurrentTab',
  });
}

export async function ctJsRemoveCurrentTab() {
  await browserRuntimeSendMessage<MessagePayloadAction>({
    act: 'actRemoveCurrentTab',
  });
}

export async function ctJsFocusCurrentTab() {
  await browserRuntimeSendMessage<MessagePayloadAction>({
    act: 'actFocusCurrentTab',
  });
}

export async function ctJsFocusTargetTab(targetTabId: number) {
  await browserRuntimeSendMessage<MessagePayloadFocusTargetTab>({
    targetTabId: targetTabId,
    act: 'actFocusTargetTab'
  });
}

export async function ctJsReloadTargetTab(targetTabId: number) {
  await browserRuntimeSendMessage<MessagePayloadReloadTargetTab>({
    targetTabId: targetTabId,
    act: 'actReloadTargetTab'
  });
}

export async function ctJsInfoToBackground(info: string) {
  await browserRuntimeSendMessage<MessagePayloadInfo>(
    {act: "actInfo", info,})
}

export async function ctJsDownloadFile(
  downloadParams: DownloadParams) {
  await browserRuntimeSendMessage<MessagePayloadDownloadInfo>({
    act: "actDownloadFile", downloadParams
  })
}

export async function ctJsNotification(content: string) {
  await browserRuntimeSendMessage<MessagePayloadNotification>({
    act: "actNotification", content,
  })
}

export async function ctJsBrowserRuntimeSendMessage<T extends {
  act: string
}>(message: T) {
  await browserRuntimeSendMessage<T>(message);
}
