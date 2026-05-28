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
 * 终极清洗函数：过滤所有中英文标点、全角符号及非法字符（100% 杜绝下载报错与复制乱码）
 * @param {string} value - 原始视频标题
 * @returns {string} - 完美的纯文本/数字文件名
 */
export function serviceRemoveIllegalWord(value) {
  if (!value) return '';

  // 1. 获取第一行并修剪两端空格
  let name = value.trim().split(/\r?\n/).shift();

  // 2. 使用 Unicode 属性移除所有标点符号 (\p{P}) 和 所有符号/图形 (\p{S})
  // 该方法自带对中文全角标点、长破折号(—)、Emoji、数学符号、特殊括号的降维打击
  // 注：'u' 修饰符是必须的，它让正则开启 Unicode 模式
  name = name.replace(/[\p{P}\p{S}]/gu, ' ');

  // 3. 补充防御：过滤火狐/系统极其敏感的隐藏控制字符 (0-31 以及 127-159)
  name = name.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

  // 4. 清理 Emoji 及其残余高位代理对字符
  name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');

  // 5. 将替换后产生的连续多个空格（含中文全角空格）合并为一个标准空格
  return name.replace(/[\s\u3000]+/g, ' ').trim();
}

// /**
//  *
//  * @param {string} value
//  * @returns {string}
//  */
// export function serviceRemoveIllegalWord(value) {
//   let searchValue = /[\/\\\[\]\-"『』<>›:：；❗”“'|丨｜⦇⦈?？!！「」【】─\(\)（）《》*#$@&%、,，。+·•]/g;
//   let name0 = value.trim().split(/\r?\n/).shift();
//   let name1 = name0.replace(searchValue, ' ');
//   let name2 = name1.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');
//   return name2;
// }
