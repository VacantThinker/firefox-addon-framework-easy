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