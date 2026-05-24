/**
 *
 * @param serverUrl{string}
 * @param message{{}}
 * @param handleError{function}
 * @returns {Promise<Response>}
 */
export async function servicePostJson(
    serverUrl,
    message,
    handleError,
) {

  try {
    let body = JSON.stringify(message);
    const fetchResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    console.info('fetchResponse');
    console.info(fetchResponse);
    return fetchResponse;
  } catch (e) {
    handleError(e);
  }

}