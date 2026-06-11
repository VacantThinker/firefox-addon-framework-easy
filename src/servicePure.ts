export interface YoutubeVideoInfo {
  videolink: string;
  vid: string;
}

export interface YoutubePlaylistInfo {
  playlistVideolink: string;
  playlistId: string;
}

/**
 * Extracts video ID and creates a clean YouTube URL.
 * Supports: youtube.com/watch?v=, youtu.be/, and youtube.com/shorts/
 */
export function servicePureVideolinkYTB(videolinkOrigin: string): YoutubeVideoInfo | null {
  if (!videolinkOrigin) return null;

  try {
    const url = new URL(videolinkOrigin);
    let vid: string | null = null;

    // 1. Standard watch URL: youtube.com/watch?v=ID
    vid = url.searchParams.get('v');

    // 2. Short URL: youtu.be/ID
    if (!vid && url.hostname.includes('youtu.be')) {
      vid = url.pathname.slice(1);
    }

    // 3. Shorts URL: youtube.com/shorts/ID
    if (!vid && url.pathname.startsWith('/shorts/')) {
      vid = url.pathname.split('/')[2];
    }

    if (!vid) return null;

    return {
      videolink: `https://www.youtube.com/watch?v=${vid}`,
      vid,
    };
  } catch {
    return null; // Invalid URL
  }
}

/**
 * Extracts playlist ID and creates a clean YouTube playlist URL.
 */
export function servicePurePlaylistVideolinkYTB(videolinkOrigin: string): YoutubePlaylistInfo | null {
  if (!videolinkOrigin) return null;

  try {
    const url = new URL(videolinkOrigin);
    const playlistId = url.searchParams.get('list');

    if (!playlistId) return null;

    return {
      playlistVideolink: `https://www.youtube.com/playlist?list=${playlistId}`,
      playlistId,
    };
  } catch {
    return null; // Invalid URL
  }
}