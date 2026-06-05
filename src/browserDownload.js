/**
 *
 * @param param0
 * @param param0.downlink{string}
 * @param param0.filename{string|null|undefined}
 * @returns {Promise<void>}
 */
export async function browserDownloadByDownlink(
  {
    downlink,
    filename = null,
  }) {
		let url = downlink;
		/** @type {browser.downloads._DownloadOptions} */
		let options = {
			url,
			saveAs: false
		};
		if (filename) {
			Object.assign(options, { filename });
		}
		await browser.downloads.download(options);
	}
