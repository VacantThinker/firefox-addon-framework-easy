import {browserRuntimePlatformInfo} from './browserRuntime.js';
import {generateMkvScriptForSystemFedora, generateMkvScriptForSystemWindows,} from './generate.js';

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
    function () {
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
 * @param {string} value -
 * @returns {string} -
 */
export function serviceRemoveIllegalWord(value) {
  if (!value) return '';

  let name = value.trim().split(/\r?\n/).shift();

  name = name.replace(/[\p{P}\p{S}\p{C}]/gu, ' ');

  name = name.replace(/[~"#%&*:<>?/\\{|}]/g, ' ');

  name = name.replace(/[\s\u3000]+/g, ' ').trim();

  return name.replace(/^[-.]+|[-.]+$/g, '');
}