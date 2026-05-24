
/**
 *
 * @param{string} content
 */
export function serviceCopyContentToClipboard(content) {
  window.navigator.clipboard.writeText(content).then(r => null);
}

/**
 * eg: fnName('this is content', 'this is a filename without ext', 'txt')
 * @param {string} content
 * @param {string} filename eg: abc
 * @param {string} ext txt json cmd js ...
 */
export function serviceSaveContentToLocal(content, filename, ext = 'txt') {
  const eleBtn = document.createElement('button');
  eleBtn.addEventListener(
      'click',
      function() {
        const eleA = document.createElement('a');
        let type = 'text/plain';
        // let type = 'application/json';

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
 *
 * @param {string} value
 * @returns {string}
 */
export function serviceRemoveIllegalWord(value) {
  let searchValue = /[\/\\\[\]\-"『』<>›:：；❗”“'|丨｜⦇⦈?？!！「」【】─\(\)（）《》*#$@&%、,，。+·•]/g;
  let name0 = value.trim().split(/\r?\n/).shift();
  let name1 = name0.replace(searchValue, ' ');
  let name2 = name1.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ' ');
  return name2;
}