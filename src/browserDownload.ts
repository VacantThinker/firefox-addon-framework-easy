/**
 * Interface for the download request parameters.
 */
export interface DownloadParams {
  downlink: string;
  filename?: string;
  referrer?: string; // Add this
}

export async function browserDownloadByDownlink(
  {
    downlink,
    filename,
    referrer,
  }: DownloadParams): Promise<void> {
  const options: browser.downloads._DownloadOptions = {
    url: downlink,
    saveAs: false,
  };

  if (filename) {
    options.filename = filename;
  }

  // Inject the Referer header to bypass hotlink protection
  if (referrer) {
    options.headers = [
      {
        name: 'Referer',
        value: referrer
      }
    ];
  }

  await browser.downloads.download(options);
}