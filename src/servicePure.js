/**
 *
 * @param {string}videolinkOrigin
 * @returns {{
 *      videolink: string,
 *      vid: string
 *
 *      }|null}
 */
export function servicePureVideolinkYTB(videolinkOrigin) {
  if (!videolinkOrigin) {
    return null;
  }

  const u = new URL(videolinkOrigin);
  let vid = u.searchParams.get('v');

  let searchValue = '/shorts/';
  if (u.pathname.startsWith(searchValue)) {
    vid = u.pathname.replace(searchValue, '');
  }
  let videolink = `https://www.youtube.com/watch?v=${vid}`;
  return {videolink, vid};
}

/**
 * https://www.youtube.com/playlist?list=PLo6dUe-n7Er913xrQrvCEzHAU5_krsekL
 *
 * @param videolinkOrigin{string}
 * @returns {{playlistVideolink: string, playlistId: string}|null}
 */
export function servicePurePlaylistVideolinkYTB(videolinkOrigin) {
  if (!videolinkOrigin) return null;

  const u = new URL(videolinkOrigin);
  let playlistId = u.searchParams.get('list');

  let prefix = "https://www.youtube.com/playlist?list=";
  let playlistVideolink = `${prefix}${playlistId}`;
  const ret = {playlistVideolink, playlistId};
  return ret;
}
