import {serviceRemoveIllegalWord} from "./serviceOpContent";

interface VideoLinkInfoYTB {
  videolink: string;
  vid: string;
}

export interface PlaylistLinkInfoYTB {
  playlistId: string;
  playlistLink: string;
}

export interface PlaylistInfoYTB extends PlaylistLinkInfoYTB {
  playlistTitle: string;
}


export type ImageQualityYTB =
  | 'maxresdefault'
  | 'sddefault'
  | 'hqdefault'
  | 'mqdefault'

export function serviceGetImageURLYTB(
  vid: string,
  imageQuality: ImageQualityYTB
): string {
  return `https://i.ytimg.com/vi/${vid}/${imageQuality}.jpg`
}

/**
 * `https://www.youtube.com/watch?v=${vid}`
 * @param vid
 */
export function serviceGetVideolinkByVid(vid: string): string {
  return `https://www.youtube.com/watch?v=${vid}`
}

export interface VideoInfoBase {
  vid: string;
  videolink: string;
  title: string;
}

export function serviceGetVideoInfoBaseYTB(
  videolinkOrigin: string, titleOrigin: string, imageQuality: ImageQualityYTB
): VideoInfoBase | undefined {
  const videolinkYTB = servicePureVideolinkYTB(videolinkOrigin)
  if (!videolinkYTB) return;
  const {vid, videolink} = videolinkYTB;
  const title = serviceRemoveIllegalWord(titleOrigin);
  return {vid, videolink, title};
}

export function serviceGetVideoInfoYTB(
  videolinkOrigin: string, titleOrigin: string, imageQuality: ImageQualityYTB
): VideoInfoYTB | undefined {
  const infoBase = serviceGetVideoInfoBaseYTB(
    videolinkOrigin, titleOrigin, imageQuality);
  if (!infoBase) return;
  const {vid, title} = infoBase;
  const filenameVideo: string = `${title}.mp4`;
  const filenameImg: string = `${title}.jpg`;
  const imageUrl: string = serviceGetImageURLYTB(vid, imageQuality);
  return {...infoBase, filenameVideo, filenameImg, imageUrl}
}

export interface VideoInfoYTB extends VideoInfoBase {
  filenameVideo: string;
  filenameImg: string;
  imageUrl: string;
}

/**
 * Extracts video ID and creates a clean YouTube URL.
 * Supports: youtube.com/watch?v=, youtu.be/, and youtube.com/shorts/
 */
export function servicePureVideolinkYTB(videolinkOrigin: string): VideoLinkInfoYTB | null {
  if (!videolinkOrigin) {
    return null;
  }

  try {
    const url = new URL(videolinkOrigin);
    let vid: string | null = null;

    // 1. Standard watch URL: youtube.com/watch?v=ID
    vid = url.searchParams.get('v');

    // 2. Short URL: youtu.be/ID
    if (!vid &&
      url.hostname.includes('youtu.be')) {
      vid = url.pathname.slice(1);
    }

    // 3. Shorts URL: youtube.com/shorts/ID
    if (!vid &&
      url.pathname.startsWith('/shorts/')) {
      vid = url.pathname.split('/')[2];
    }

    if (!vid) {
      return null;
    }

    return {
      videolink: serviceGetVideolinkByVid(vid),
      vid,
    };
  } catch {
    return null; // Invalid URL
  }
}

/**
 * Extracts playlist ID and creates a clean YouTube playlist URL.
 */
function servicePurePlaylistVideolinkYTB(playlistLinkOrigin: string):
  PlaylistLinkInfoYTB | null {

  if (!playlistLinkOrigin) {
    return null;
  }

  try {
    const url = new URL(playlistLinkOrigin);
    const playlistId = url.searchParams.get('list');

    if (!playlistId) {
      return null;
    }

    return {
      playlistLink: `https://www.youtube.com/playlist?list=${playlistId}`,
      playlistId,
    };
  } catch {
    return null; // Invalid URL
  }
}

export default servicePurePlaylistVideolinkYTB