import {serviceGetCurrentDateYYYYMMDDHHMMSS} from './serviceGet';
import {
  serviceCopyContentToClipboard,
  serviceRemoveIllegalWord,
  serviceSaveContentToLocal,
} from './serviceOpContent';
import {browserNotificationCreate} from './browserNotification';

// --- Interfaces ---

interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ActionMessage {
  tabId: number;
  act: string;
}

interface MagnetLinkMessage
  extends ActionMessage {
  title: string;
  data?: string[];
  handleOption?: 'clipboard' | 'txt' | 'clipboardAndTxt';
}

// --- Services ---

/**
 * Captures a tab's screenshot and triggers a local download in the target tab.
 */
export async function serviceTakeScreenshot({
                                              tabId,
                                              filename,
                                              rect
                                            }: {
  tabId: number;
  filename: string;
  rect: ScreenRect
}): Promise<void> {
  const dataURI = await browser.tabs.captureTab(
    tabId,
    {rect}
  );

  await browser.scripting.executeScript({
    target: {tabId},
    args: [{dataURI, filename}],
    func: (message) => {
      const {dataURI, filename} = message;
      const a = document.createElement('a');
      a.href = dataURI;
      a.download = filename;
      a.click();
    },
  });
}

/**
 * Enables an element picker overlay in the target tab.
 */
export async function serviceElementPicker(message: ActionMessage): Promise<void> {
  await browser.scripting.executeScript({
    target: {tabId: message.tabId},
    args: [message],
    func: (async (message: Object) => {
      const overlayId = 'extension-element-highlighter-overlay';
      let overlay = document.getElementById(overlayId);

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
          position: fixed !important; top: 0 !important; left: 0 !important;
          width: 0 !important; height: 0 !important;
          background-color: rgba(255, 0, 85, 0.2) !important;
          outline: 2px dashed #ff0055 !important; outline-offset: -2px !important;
          z-index: 2147483647 !important; pointer-events: none !important;
          transition: all 0.05s ease-out !important; display: none !important;
        `;
        document.documentElement.appendChild(overlay);
      }

      function getUniqueSelector(el: Element): string {
        const path: string[] = [];
        let current: Element | null = el;
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let selector = current.nodeName.toLowerCase();
          if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break;
          } else {
            let sib = current, nth = 1;
            while ((sib = sib.previousElementSibling as Element) && sib.nodeName.toLowerCase() === selector) nth++;
            if (nth !== 1) selector += `:nth-of-type(${nth})`;
          }
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(' > ');
      }

      function handleMouseOver(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.id === overlayId || !overlay) return;
        const rect = target.getBoundingClientRect();
        Object.assign(
          overlay.style,
          {
            display: 'block',
            top: `${rect.top}px`, left: `${rect.left}px`,
            width: `${rect.width}px`, height: `${rect.height}px`,
          }
        );
        document.body.style.setProperty(
          'cursor',
          'crosshair',
          'important'
        );
      }

      async function handleElementClick(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as Element;
        stopPickingMode();

        const clientRect = target.getBoundingClientRect();
        const rect = {
          height: clientRect.height,
          width: clientRect.width,
          x: clientRect.left + window.scrollX,
          y: clientRect.top + window.scrollY,
        };

        await browser.runtime.sendMessage({
          ...message,
          rect,
          uniqueSelector: getUniqueSelector(target),
        });
      }

      function stopPickingMode() {
        document.removeEventListener(
          'mouseover',
          handleMouseOver,
          true
        );
        document.removeEventListener(
          'click',
          handleElementClick,
          true
        );
        document.body.style.removeProperty('cursor');
        overlay?.remove();
      }

      document.addEventListener(
        'mouseover',
        handleMouseOver,
        true
      );
      document.addEventListener(
        'click',
        handleElementClick,
        true
      );
    }) as any,
  });
}

/**
 * Gets the bounding rectangle of the full page.
 */
export async function serviceGetFullPageRectData(message: ActionMessage): Promise<void> {
  await browser.scripting.executeScript({
    target: {tabId: message.tabId},
    args: [message],
    func: (message) => {
      const rect = {
        x: 0, y: 0,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      };
      browser.runtime.sendMessage({...message, rect});
    },
  });
}

/**
 * Scans the page for magnet links.
 */
export async function serviceFindAllMagnetLink(message: MagnetLinkMessage): Promise<void> {
  await browser.scripting.executeScript({
    target: {tabId: message.tabId},
    args: [message],
    func: (async (message: Object) => {
      const magnets = new Set<string>();

      // Type 1: Attribute selectors
      const attrElements = document.querySelectorAll('*[href*="magnet:"], *[data-url*="magnet:"], *[data-magnet*="magnet:"], *[data-href*="magnet:"]');
      attrElements.forEach(el => {
        Array.from((el as Element).attributes)
          .forEach(attr => {
            if (attr.value.includes('magnet:?xt=')) magnets.add(attr.value.trim());
          });
      });

      // Type 2: Text content
      document.querySelectorAll('div, span, td, p, a, button')
        .forEach(el => {
          if (el.children.length === 0) {
            const text = el.textContent?.trim() || '';
            const match = text.match(/magnet:\?xt=[^\s"'<>]+/);
            if (match) magnets.add(match[0]);
          }
        });

      await browser.runtime.sendMessage({
        ...message,
        data: Array.from(magnets),
      });
    }) as any,
  });
}

/**
 * Handles the processing of collected magnet links (clipboard or file).
 */
export async function serviceDealWithMagnetLink(message: MagnetLinkMessage): Promise<void> {
  const {title, data, handleOption} = message;
  const titleCleaned = serviceRemoveIllegalWord(title);

  if (!Array.isArray(data) || data.length === 0) {
    await browserNotificationCreate('magnet link not found!');
    return;
  }

  const content = `${data.join('\n')}\n`;
  const filename = ['magnet-link', titleCleaned, serviceGetCurrentDateYYYYMMDDHHMMSS()].join(' ');

  switch (handleOption) {
    case 'clipboard':
      await serviceCopyContentToClipboard(content);
      break;
    case 'txt':
      serviceSaveContentToLocal(
        content,
        filename
      );
      break;
    case 'clipboardAndTxt':
      await serviceCopyContentToClipboard(content);
      serviceSaveContentToLocal(
        content,
        filename
      );
      break;
  }
}