/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  downlink: string;
  filename?: string;
  referrer?: string; // Add this
}

export async function browserDownloadByDownlink(
  params: DownloadParams): Promise<void> {
  const {downlink, filename, referrer} = params;
  if (downlink == undefined) return;

  const options: browser.downloads._DownloadOptions = {
    url: downlink,
  };

  if (filename) {
    options.filename = filename;
  }

  // Inject the Referer header to bypass hotlink protection
  if (referrer && options.headers) {
    options.headers.push({
      name: 'referer',
      value: referrer
    })
  }

  await browser.downloads.download(options);
}