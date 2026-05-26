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

/**
 *
 * @param message{ {
 *        downlink:string,
 *        filename:string|null,
 *        rpcsecret:string,
 *        rpcport:string
 *        }}
 * @returns {Promise<Response>}
 */
export async function serviceSendDataToLocalAria2(message) {
  let {downlink, filename, rpcsecret, rpcport} = message;

  const secret = rpcsecret;
  const port = rpcport;

  const params = [`token:${secret}`, [downlink]];
  if (filename) {
    const options = {
      out: filename,
    };
    params.push(options);
  }

  const data = {
    jsonrpc: '2.0',
    id: 'qwer',
    method: 'aria2.addUri',
    params,
  };

  try {
    const response = await fetch(`http://localhost:${port}/jsonrpc`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(data),
    });
    console.info(`response=\n`, response);

    return response;
  } catch (e) {
    console.error(e);
  }

}
