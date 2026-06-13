/**
 * Style management service for browser tabs.
 */

/**
 * Apply a CSS string globally to the target tab.
 * This is the most efficient way to override styles without traversing the DOM.
 */
async function applyGlobalCss(
  tabId: number,
  css: string
): Promise<void> {
  await browser.scripting.insertCSS({
    target: {tabId},
    css: css,
  });
}

/**
 * Update the text color for all elements globally.
 */
export async function serviceUpdataALLTextNodeColor(
  tabId: number,
  color: string
): Promise<void> {
  // Use "body, body *" to target all elements, with !important to override existing styles.
  const css = `body, body * { color: ${color} !important; }`;
  await applyGlobalCss(
    tabId,
    css
  );
}

/**
 * Update the background color for all elements globally.
 */
export async function serviceUpdataALLNodeBackgroundColor(
  tabId: number,
  bgColor: string
): Promise<void> {
  // Apply background-color to all elements.
  const css = `body, body * { background-color: ${bgColor} !important; }`;
  await applyGlobalCss(
    tabId,
    css
  );
}

/**
 * Arguments interface for the script injection.
 */
interface FontSizeArgs {
  delta: number;
}

/**
 * Adjust font size globally by a delta value.
 * Uses recursive DOM traversal to support Shadow DOM elements.
 */
export async function serviceIncreaseAllTextFontSize(
  tabId: number,
  delta: number
): Promise<void> {
  await browser.scripting.executeScript({
    target: {tabId},
    args: [{delta}],
    func: (({delta}: FontSizeArgs) => {
      /**
       * Recursively traverse DOM and Shadow DOM to update font sizes.
       */
      function walk(root: Document | ShadowRoot | HTMLElement): void {
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_ELEMENT
        );
        let node: Node | null;

        while ((node = walker.nextNode())) {
          const el = node as HTMLElement;

          // If the element has a Shadow Root, recurse into it to support web components.
          if (el.shadowRoot) {
            walk(el.shadowRoot);
          }

          // Calculate and update font size
          const style = window.getComputedStyle(el);
          const currentSize = parseFloat(style.fontSize);

          if (!isNaN(currentSize)) {
            el.style.setProperty(
              'font-size',
              `${currentSize + delta}px`,
              'important'
            );
          }
        }
      }

      // Start traversal from the document body
      walk(document.body);
    }) as any, // Cast to any to bypass strict type checking for the execution closure
  });
}