/**
 * Extracts the hostname from a given URL string.
 * @param url The full URL string.
 * @returns The domain/hostname.
 */
export function serviceGetDomainByUrl(url: string): string {
  return new URL(url).hostname;
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