/**
 * will get => {{x, y, width, height, uniqueSelector}}
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
        const rect = target.getBoundingClientRect();

        // Move the floating overlay exactly over the target
        overlay.style.setProperty('display', 'block', 'important');
        overlay.style.setProperty('top', `${rect.top}px`, 'important');
        overlay.style.setProperty('left', `${rect.left}px`, 'important');
        overlay.style.setProperty('width', `${rect.width}px`, 'important');
        overlay.style.setProperty('height', `${rect.height}px`, 'important');

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
        let rect = target.getBoundingClientRect();
        let rectData = {
          height: rect.height,
          width: rect.width,
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          selector: getUniqueSelector(target),
        };

        console.log('Target Selected:', {rectData});

        // Assuming 'target' is your clicked element (e.g., from e.target)
        let messageTakeScreenshot = Object.assign(
            {}, // Start with a fresh, empty object
            message, // Put the original message first so it doesn't overwrite your new data
            rectData,
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
 * will get => {{x, y, width, height,}}
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
    func: async (message) => {

      let x = 0, y = 0;
      let width = document.documentElement.scrollWidth;
      let height = document.documentElement.scrollHeight;

      await browser.runtime.sendMessage(Object.assign(
          {},
          message,
          {
            x, y, width, height,
          },
      ));
      // todo end if (message)
    },
  });
}
