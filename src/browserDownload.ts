/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  url: string;
  filename?: string;
}

export async function browserDownloadByDownlink(
  params: DownloadParams): Promise<void> {
  const {url, filename,} = params;
  if (url == undefined) return;

  const options: browser.downloads._DownloadOptions = {
    url
  };

  if (filename) {
    options.filename = filename;
  }
  await browser.downloads.download(options);
}