/**
 * Extracts the hostname from a given URL string.
 * @param targetUrl The full URL string.
 * @returns The domain/hostname.
 */
export function serviceGetDomain(targetUrl: string) {
  if (targetUrl == undefined) return;
  const url = serviceParseURL(targetUrl);
  if (url) return url.hostname;
  else return;
}

interface URLBase {
  domain: string;
  pathname: string;
  searchParams: URLSearchParams;
}

export function serviceParseURLBase(
  targetUrl: string): URLBase | undefined {
  if (targetUrl == undefined) return;
  const url = new URL(targetUrl);
  const domain = url.hostname
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  return {
    domain, pathname, searchParams
  };
}

export function serviceParseURL(targetUrl: string) {
  if (targetUrl == undefined) return;
  return new URL(targetUrl);
}

/**
 * Generates a timestamp string in the format:
 * YYYY_M_D_Hh_Mm_Ss_ms e.g., 2026_6_11_10h_30m_15s_450
 * @returns The formatted timestamp string.
 */
export function serviceGetCurrentDateYYYYMMDDHHMMSS(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  return `${year}_${month}_${day}_${hours}h_${minutes}m_${seconds}s_${milliseconds}`;
}

export function serviceContentLimit80(
  content: string | undefined,
  numLength: number = 80
) {
  return serviceContentLimit(content, numLength)
}

export function serviceContentLimit50(
  content: string | undefined,
  numLength: number = 50
) {
  return serviceContentLimit(content, numLength)
}

/**
 * Truncates a content to a safe length and appends the .mp4
 * extension.
 */
export function serviceContentLimit(
  content: string | undefined,
  numLength: number
): string | undefined {
  if (!content || !numLength) return undefined;
  return content.slice(0, numLength);
}

/**
 * Appends the .mp4 extension to a given string.
 */
export function serviceAppendExtMP4(
  title: string | undefined): string | undefined {
  if (!title) return undefined;
  let extMP4 = '.mp4';
  if (title.toLowerCase().endsWith(extMP4)) return title;
  return `${title}${extMP4}`;
}