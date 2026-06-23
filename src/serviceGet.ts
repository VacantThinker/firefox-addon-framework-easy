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
 * Generates a timestamp string in the format: YYYY_M_D_Hh_Mm_Ss_ms
 * e.g., 2026_6_11_10h_30m_15s_450
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