/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  downlink: string;
  filename?: string | null;
}

export async function browserDownloadByDownlink(
  {
    downlink,
    filename = null,
  }: DownloadParams): Promise<void> {
  const options: browser.downloads._DownloadOptions = {
    url: downlink,
    saveAs: false,
  };

  if (filename) {
    options.filename = filename;
  }

  await browser.downloads.download(options);
}