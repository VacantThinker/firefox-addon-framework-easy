/**
 *
 * @param url{string}
 * @returns {string}
 */
export function serviceGetDomainByUrl(url) {
  let urlWrap = new URL(url);
  let domain = urlWrap.hostname;
  return domain;
}

/**
 * eg 2222_12_25_11h_47m_24s_302
 * @return {string}
 */
export function serviceGetCurrentDateYYYYMMDDHHMMSS() {
  let date = new Date();
  let m = [
    [date.getFullYear(), ''].join(''),
    [date.getMonth() + 1, ''].join(''),
    [date.getDate(), ''].join(''),

    [date.getHours(), 'h'].join(''),
    [date.getMinutes(), 'm'].join(''),
    [date.getSeconds(), 's'].join(''),
    date.getMilliseconds(),
  ];
  let r = m.join('_');
  return r;
}

