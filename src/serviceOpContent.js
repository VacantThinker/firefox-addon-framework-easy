import {browserRuntimePlatformInfo} from './browserRuntime.js';
import {
  generateMkvScriptForSystemFedora,
  generateMkvScriptForSystemWindows,
} from './generate.js';

/**
 *
 * @param data
 * @returns {Promise<void>}
 */
export async function serviceCopyContentToClipboard(data) {
  return await window.navigator.clipboard.writeText(data);
}

/**
 * eg: fnName('this is content', 'this is a filename without ext', 'txt')
 * @param {string} content
 * @param {string} filename eg: abc
 * @param {string} ext txt json
 */
export function serviceSaveContentToLocal(content, filename, ext = 'txt') {
  const eleBtn = document.createElement('button');
  eleBtn.addEventListener(
      'click',
      function() {
        const eleA = document.createElement('a');

        const extObj = {
          txt: 'text/plain',
          json: 'application/json',
        };
        const type = extObj[ext];

        const file = new Blob([content], {type});
        eleA.href = URL.createObjectURL(file);
        eleA.download = [filename, ext].join('.');
        eleA.click();
        URL.revokeObjectURL(eleA.href);
      },
      false,
  );
  eleBtn.click();
  // eleBtn.previousElementSibling
}

/**
 * need install nodejs mkvtoolnix
 * @param message{{
 *      vid, title,
 * }}
 * @returns {Promise<void>}
 */
export async function serviceGenerateMkvToolNixScript({vid, title}) {
  let message = {vid, title};
  const platformInfo = await browserRuntimePlatformInfo();
  if (platformInfo.os === 'win') {
    let content = generateMkvScriptForSystemWindows(message);
    serviceSaveContentToLocal(content, title, 'js');
  }
  else if (platformInfo.os === 'linux') {
    let content = generateMkvScriptForSystemFedora(message);
    serviceSaveContentToLocal(content, title, 'sh');
  }
}

/**
 * Ultimate sanitization function: Filters all Chinese/English punctuation, full-width symbols, and illegal characters.
 * (100% prevents download errors and copy-paste character corruption)
 * @param {string} value - The original video title
 * @returns {string} - A clean, safe plaintext/alphanumeric filename
 */
export function serviceRemoveIllegalWord(value) {
  if (!value) return '';

  // 1. Get the first line and trim whitespace from both ends
  let name = value.trim().split(/\r?\n/).shift();

  // 2. Use Unicode properties to remove all punctuation (\p{P}) and all symbols/geometry (\p{S})
  // This natively crushes Chinese full-width punctuation, em dashes (—), Emojis, math symbols, and special brackets.
  // Note: The 'u' flag is mandatory to enable Unicode mode in the regex.
  name = name.replace(/[\p{P}\p{S}]/gu, ' ');

  // 3. Additional defense: Filter out hidden control characters that Firefox/OS are extremely sensitive to (0-31 and 127-159)
  name = name.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

  // 4. Clean up Emojis and any remaining surrogate pairs
  name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');

  // 5. Merge consecutive spaces (including Chinese full-width spaces) into a single standard space
  return name.replace(/[\s\u3000]+/g, ' ').trim();
}