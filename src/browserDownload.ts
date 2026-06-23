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

  // FIX: Explicitly assign the headers array if a referrer is provided
  if (referrer) {
    options.headers = [
      {
        name: 'Referer', // Fix spelling: canonical HTTP header name
        value: referrer
      }
    ];
  }

  await browser.downloads.download(options);
}