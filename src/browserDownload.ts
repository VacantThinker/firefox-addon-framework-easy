/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  downlink: string;
  filename?: string;
}

export async function browserDownloadByDownlink(
  params: DownloadParams): Promise<number> {
  const {downlink, filename,} = params;
  if (downlink == undefined) return -1;

  const options: browser.downloads._DownloadOptions = {
    url: downlink,
  };

  if (filename) {
    options.filename = filename;
  }
  return await browser.downloads.download(options);
}