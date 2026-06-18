import {tabOpCreateActiveTrue, tabOpCreateKeepOnlyOneFocusTrue} from "./opTab";
import {browserBrowsingDataRemoveDomainCache} from "./browserBrowsingData";
import {browserRuntimeSendMessage} from "./browserRuntime";
import {MessagePayloadAct, MessagePayloadFocusTargetTab} from "./types";

/**
 * Captures an <img> element from the current document, draws it to a canvas
 * matching its expected YouTube aspect ratio dimensions, and triggers a
 * browser download.
 * * @param filename - The name to save the downloaded file as.
 * @param filename
 * @param querySelector - Optional custom selector if you aren't targeting the
 *   first <img>.
 */
export function ctJsDownloadYoutubeImageViaCanvas(filename: string, querySelector: string = 'img'): void {
  const img = document.body.querySelector<HTMLImageElement>(querySelector);
  if (!img) {
    console.warn("downloadYoutubeImageViaCanvas: No image element found on the page.");
    return;
  }

  // Map YouTube naturalWidths to their expected canvas proportions (handling
  // black bars)
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
  if (!ctx) return;

  ctx.drawImage(img, 0, 0, w, h);

  const canvasUrl = canvas.toDataURL('image/jpeg', 1.0);

  const eleA = document.createElement('a');
  eleA.href = canvasUrl;
  eleA.download = filename;
  eleA.click();
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
 * Establishes a persistent baseline connection with the background script to
 * maintain runtime context.
 */
export function ctJskeepAlive(tag: string = "", enableLog = false) {
  setInterval(
    async () => {
      if (enableLog) {
        console.log(tag, "br send message actMarco")
      }
      let message: MessagePayloadAct = {act: 'actMarco'};
      await browserRuntimeSendMessage(message)
    },
    1000);
}

export async function ctJsCloseTab() {
  let message: MessagePayloadAct = {
    act: 'actRemoveCurrentTab',
  };
  await browserRuntimeSendMessage(message);
}

export async function ctJsFocusTargetTab(targetTabId: number) {
  const message: MessagePayloadFocusTargetTab = {
    targetTabId,
    act: 'actFocusTargetTab'
  };
  await browserRuntimeSendMessage(message);
}

export async function ctJsRemoveDomainCache(domain: string) {
  await browserBrowsingDataRemoveDomainCache(domain)
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

export async function ctJsOpenPage(url: string) {
  await tabOpCreateActiveTrue({url})
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