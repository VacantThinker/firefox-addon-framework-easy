/**
 *
 * @param param0
 * @param param0.downlink{string}
 * @param param0.filename{string}
 * @returns {Promise<void>}
 */
export async function browserDownloadByDownlink({ downlink, filename }) {
  let url = downlink;
  await browser.downloads.download({url, filename});
}
