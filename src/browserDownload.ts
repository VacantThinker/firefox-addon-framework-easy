/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  downlink: string;
  filename?: string;
}

export async function browserDownloadByDownlink(
  params: DownloadParams): Promise<void> {
  const {downlink, filename,} = params;
  if (downlink == undefined) return;

  const options: browser.downloads._DownloadOptions = {
    url: downlink,
  };

  if (filename) {
    options.filename = filename;
  }
  await browser.downloads.download(options);
}