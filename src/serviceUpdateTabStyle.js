/**
 * color => node.style.color = color;
 * @param message{{
 *   tabId:number,
 *   color:string
 * }}
 * @returns {Promise<void>}
 */
export async function serviceUpdataALLTextNodeColor(message) {
  let {tabId} = message;
  const ass = Object.assign({}, message);
  await browser.scripting.executeScript({
    target: {tabId},
    args: [ass],
    /**
     *
     * @param message{{
     *   tabId: number,
     *   color:string,
     * }}
     * @returns {Promise<void>}
     */
    func: async (message) => {
      let {color} = message;
      updateStyleColor(color);

      function updateStyleColor(color) {
        /**
         *
         * @returns {Node[]}
         */
        function nativeTreeWalkerFindALLElementHasNodeText() {
          const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null,
          );

          let node;
          /**
           * @type {Node[]}
           */
          const textNodes = [];
          while (node = walker.nextNode()) {
            if (node.nodeName === '#text') {
              textNodes.push(node.parentElement);
            }
          }
          return Array.from(textNodes);
        }

        const arr = nativeTreeWalkerFindALLElementHasNodeText();

        if (arr.length) {
          arr.forEach(value => {
            value['style'].color = color;
          });
        }
      }

      // todo end
    },
  });
}

/**
 * node.style.backgroundColor = color;
 * @param message{{
 *   tabId:number,
 *   backgroundColor:string
 * }}
 * @returns {Promise<void>}
 */
export async function serviceUpdataALLNodeBackgroundColor(message) {
  let {tabId} = message;
  const ass = Object.assign({}, message);
  await browser.scripting.executeScript({
    target: {tabId},
    args: [ass],
    /**
     *
     * @param message{{
     *   tabId: number,
     *   backgroundColor:string,
     * }}
     * @returns {Promise<void>}
     */
    func: async (message) => {
      let {backgroundColor} = message;
      updateStyleBackgroundColor(backgroundColor);

      function updateStyleBackgroundColor(backgroundColor) {
        /**
         *
         * @returns {Node[]}
         */
        function nativeTreeWalker() {
          const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_ELEMENT,
              null,
          );

          let node;
          /**
           * @type {Node[]}
           */
          const textNodes = [];
          while (node = walker.nextNode()) {
            textNodes.push(node);
          }
          return Array.from(textNodes);
        }

        /**
         * @type {Node[]}
         */
        const arr = nativeTreeWalker();

        if (arr.length) {
          arr.forEach(value => {
            value['style'].backgroundColor = backgroundColor;
          });
        }
      }

      // todo end
    },
  });
}