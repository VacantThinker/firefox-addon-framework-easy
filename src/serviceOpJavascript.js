import {serviceGetCurrentDateYYYYMMDDHHMMSS} from './serviceGet.js';
import {
  serviceCopyContentToClipboard,
  serviceRemoveIllegalWord,
  serviceSaveContentToLocal,
} from './serviceOpContent.js';
import {browserNotificationCreate} from './browserNotification.js';

/**
 *
 * @param param0
 * @param param0.tabId {number}
 * @param param0.filename {string}
 * @param param0.rect {{
 *                x,
 *                y,
 *                width,
 *                height,
 * }}
 * @returns {Promise<void>}
 */
export async function serviceTakeScreenshot(
    {
      tabId,
      filename,
      rect,
    }) {

  const tag = 'actTakeScreenshot()';
  let dataURI = await browser.tabs.captureTab(tabId, {
    rect: rect,
  });
  let assign = Object.assign(
      {},
      {dataURI, filename},
  );
  await browser.scripting.executeScript({
    target: {tabId},
    args: [assign],
    func: function(message) {
      if (message) {
        let {dataURI, filename} = message;

        imageDataToLocalFile({dataURI, filename});

        function imageDataToLocalFile({dataURI, filename}) {
          let a = document.createElement('a');
          a.href = dataURI;
          a.download = filename;
          a.click();
        }

        // todo end if(message)
      }
    },
  });

}

/**
 * middle ware, output => {rect, uniqueSelector,}
 * @param message{{
 *      tabId:number,
 *      act:string
 * }}
 * @returns {Promise<void>}
 */
export async function serviceElementPicker(message) {
  let {tabId} = message;
  await browser.scripting.executeScript({
    target: {tabId},
    args: [message],
    func: async function(message) {
      if (!message) return;
      console.log('picker.js initialized', message);
      
      // 1. Create a dedicated "Always On Top" highlighter overlay
      const overlayId = 'extension-element-highlighter-overlay';
      let overlay = document.getElementById(overlayId);

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        // !important and max z-index guarantees it will never be hidden by site CSS
        overlay.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 0 !important;
          height: 0 !important;
          background-color: rgba(255, 0, 85, 0.2) !important;
          outline: 2px dashed #ff0055 !important;
          outline-offset: -2px !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          transition: all 0.05s ease-out !important;
          display: none !important;
        `;
        // Appending to documentElement (<html>) avoids <body> layout restrictions
        document.documentElement.appendChild(overlay);
      }

      function getUniqueSelector(el) {
        if (!(el instanceof Element)) return '';
        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
          let selector = el.nodeName.toLowerCase();
          if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
          }
          else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
              if (sib.nodeName.toLowerCase() === selector) nth++;
            }
            if (nth !== 1) selector += `:nth-of-type(${nth})`;
          }
          path.unshift(selector);
          el = el.parentNode;
        }
        return path.join(' > ');
      }

      function handleMouseOver(e) {
        const target = e.target;

        // Safety check to ensure we don't try to highlight our own UI
        if (target.id === overlayId) return;

        // Get exact coordinates of the hovered element
        const clientRect = target.getBoundingClientRect();

        // Move the floating overlay exactly over the target
        overlay.style.setProperty('display', 'block', 'important');
        overlay.style.setProperty('top', `${clientRect.top}px`, 'important');
        overlay.style.setProperty('left', `${clientRect.left}px`, 'important');
        overlay.style.setProperty('width', `${clientRect.width}px`,
            'important');
        overlay.style.setProperty('height', `${clientRect.height}px`,
            'important');

        // Change mouse cursor to indicate picking mode
        document.body.style.setProperty('cursor', 'crosshair', 'important');
      }

      async function handleElementClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;

        // Clean up the picker completely
        stopPickingMode();

        // Calculate screenshot coordinates
        let clientRect = target.getBoundingClientRect();
        let rect = {
          height: clientRect.height,
          width: clientRect.width,
          x: clientRect.left + window.scrollX,
          y: clientRect.top + window.scrollY,
        };

        // Assuming 'target' is your clicked element (e.g., from e.target)
        let messageTakeScreenshot = Object.assign(
            {}, // Start with a fresh, empty object
            message, // Put the original message first so it doesn't overwrite your new data
            {rect},
            {
              // The guaranteed unique CSS path (e.g., "div#wrap > ul > li:nth-of-type(2)")
              uniqueSelector: getUniqueSelector(target),
            },
        );

        await browser.runtime.sendMessage(messageTakeScreenshot);
      }

      function startPickingMode() {
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('click', handleElementClick, true);
      }

      function stopPickingMode() {
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('click', handleElementClick, true);

        // Restore normal mouse cursor
        document.body.style.removeProperty('cursor');

        // Remove the overlay from the DOM entirely
        if (overlay) {
          overlay.remove();
        }
      }

      // Initialize the picker mode
      startPickingMode();
    },
  });
}

/**
 * middle ware, output: {rect}
 *
 * @param message{{
 *      tabId:number,
 *      act:string
 * }}
 * @returns {Promise<void>}
 */
export async function serviceGetFullPageRectData(message) {
  let {tabId} = message;

  await browser.scripting.executeScript({
    target: {tabId},
    args: [message],
    func: (message) => {

      let x = 0, y = 0;
      let width = document.documentElement.scrollWidth;
      let height = document.documentElement.scrollHeight;
      let rect = {
        x, y, width, height,
      };
      browser.runtime.sendMessage(Object.assign(
          {},
          message,
          {rect},
      ));
      // todo end if (message)
    },
  });
}

/**
 * middle ware, output: Object.assign({}, message, {data})
 *
 * serviceFindAllMagnetLink({
 *   tabId, title, act, ...
 * })
 *
 * @param message{{
 *    tabId:number,
 *    title:string,
 *    act: string,
 * }}
 */
export async function serviceFindAllMagnetLink(message) {
  let {tabId} = message;
  const assign = Object.assign({}, message);

  await browser.scripting.executeScript({
    target: {tabId},
    args: [assign],
    func: async (message) => {
      if (message) {
        function findAllMagnetLinks() {
          const magnets = new Set(); // Prevents duplicates

          // --- Type 1: Find inside ANY element's attributes ---
          const attributeSelector = '*[href*="magnet:"], *[data-url*="magnet:"], *[data-magnet*="magnet:"], *[data-href*="magnet:"]';
          const attrElements = document.querySelectorAll(attributeSelector);

          attrElements.forEach(el => {
            // Check every attribute of the element to find the one holding the magnet string
            for (let attr of el.attributes) {
              if (attr.value.includes('magnet:?xt=')) {
                magnets.add(attr.value.trim());
              }
            }
          });

          // --- Type 2: Find inside raw text (for <div>, <span>, <td>, etc.) ---
          // We target elements that don't have children to avoid grabbing huge parent container blocks
          const allElements = document.querySelectorAll(
              'div, span, td, p, a, button');
          allElements.forEach(el => {
            if (el.children.length === 0) { // Deepest element
              const text = el.textContent.trim();
              if (text.includes('magnet:?xt=')) {
                // Extract just the magnet link using Regex in case there is surrounding text
                const match = text.match(/magnet:\?xt=[^\s"'<>]+/);
                if (match) {
                  magnets.add(match[0]);
                }
              }
            }
          });

          return Array.from(magnets);
        }

        await browser.runtime.sendMessage(Object.assign(
            {},
            message,
            {
              data: findAllMagnetLinks(),
            },
        ));

        // todo end if(message)
      }
    },
  });
}

/**
 *
 * @param message{{
 *   title:string,
 *   data: [string],
 *   handleOption: 'clipboard'|'txt'|'clipboardAndTxt'
 * }}
 * @returns {Promise<void>}
 */
export async function serviceDealWithMagnetLink(message) {

  let {title, data, handleOption} = message;
  let titleCleaned = serviceRemoveIllegalWord(title);

  if (Array.isArray(data) && data.length >= 1) {
    let content = `${data.join('\n')}\n`;

    let filename = [
      'magnet-link',
      titleCleaned,
      serviceGetCurrentDateYYYYMMDDHHMMSS()].join(' ');

    if (handleOption === 'clipboard') {
      await serviceCopyContentToClipboard(content);
    }
    else if (handleOption === 'txt') {
      serviceSaveContentToLocal(content, filename);
    }
    else if (handleOption === 'clipboardAndTxt') {
      await serviceCopyContentToClipboard(content);
      serviceSaveContentToLocal(content, filename);
    }
  }
  else {
    // todo notification => magnet link not found!
    await browserNotificationCreate('magnet link not found!');
  }
}