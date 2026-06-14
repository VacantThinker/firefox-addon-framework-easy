// @vacantthinker/firefox-addon-framework-easy (or your local framework)

/**
 * Captures an <img> element from the current document, draws it to a canvas
 * matching its expected YouTube aspect ratio dimensions, and triggers a browser download.
 * * @param filename - The name to save the downloaded file as.
 * @param filename
 * @param querySelector - Optional custom selector if you aren't targeting the first <img>.
 */
export function downloadYoutubeImageViaCanvas(filename: string, querySelector: string = 'img'): void {
    const img = document.body.querySelector<HTMLImageElement>(querySelector);
    if (!img) {
        console.warn("downloadYoutubeImageViaCanvas: No image element found on the page.");
        return;
    }

    // Map YouTube naturalWidths to their expected canvas proportions (handling black bars)
    const sizes = new Map<number, { w: number; h: number }>();
    sizes.set(1280, {w: 1280, h: 720});
    sizes.set(320, {w: 1280, h: 720});
    sizes.set(640, {w: 1280, h: 900});
    sizes.set(480, {w: 1280, h: 900});

    const {w, h} = sizes.get(img.naturalWidth) || {
        w: img.naturalWidth,
        h: img.naturalHeight
    };

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);

    const canvasUrl = canvas.toDataURL('image/jpeg', 1.0);

    const eleA = document.createElement('a');
    eleA.href = canvasUrl;
    eleA.download = filename;
    eleA.click();
}