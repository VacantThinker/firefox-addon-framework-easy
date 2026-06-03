/**
 *
 * @param param0
 * @param param0.downlink{string}
 * @param param0.filename{string}
 * @returns {Promise<void>}
 */
export async function browserDownloadByDownlink(
    {
      downlink,
      filename,
    }) {

  let url = downlink;
  let options = {url};
  if (filename) {
    Object.assign(options, {filename});
  }
  await browser.downloads.download(options);
}
