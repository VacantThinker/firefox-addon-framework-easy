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
 * 终极清理函数：过滤所有中英文标点、全角符号、以及非法/不可见字符。
 * （100% 预防下载报错和复制粘贴导致的乱码）
 * @param {string} value - 原始视频标题
 * @returns {string} - 干净、安全的纯文本/字母数字文件名
 */
export function serviceRemoveIllegalWord(value) {
  if (!value) return '';

  // 1. 获取第一行并去除两端空格
  let name = value.trim().split(/\r?\n/).shift();

  // 2. 使用 Unicode 属性移除所有危险字符：
  // \p{P} = 所有标点符号
  // \p{S} = 所有符号（Emoji、数学符号、货币符号）
  // \p{C} = 所有控制/格式化/代理字符（完美修复不可见的 U+202A/U+202C 导致崩溃的 Bug！）
  name = name.replace(/[\p{P}\p{S}\p{C}]/gu, ' ');

  // 3. Firefox WebExtension 严格拦截的特殊字符。
  // （大部分已经被 \p{P} 和 \p{S} 处理，但显式移除可以确保彻底杜绝边缘报错）
  name = name.replace(/[~"#%&*:<>?/\\{|}]/g, ' ');

  // 4. 将连续的空格（包括全角/Unicode空格）合并为一个标准空格
  name = name.replace(/[\s\u3000]+/g, ' ').trim();

  // 5. Firefox 下载 API 会因为文件名以点（.）或连字符（-）开头/结尾而报错
  // 再次修剪以确保绝对安全
  return name.replace(/^[-.]+|[-.]+$/g, '');
}