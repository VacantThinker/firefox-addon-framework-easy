/**
 * Interface representing the structure of an Aria2 request.
 */
export interface Aria2Request {
  downlink: string;
  filename?: string | null;
  rpcSecret: string;
  rpcPort: string;
}

/**
 * Generic service to perform POST requests with JSON content.
 * @param url The target URL.
 * @param body The request payload.
 * @returns Promise<Response>
 */
export async function servicePostJson(
  url: string,
  body: any
): Promise<Response> {
  return await fetch(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Service to send download data to a local Aria2 instance via JSON-RPC.
 * @param request The Aria2 request parameters.
 * @returns Promise<Response>
 */
export async function serviceSendDataToLocalAria2(request: Aria2Request): Promise<Response> {
  const {downlink, filename, rpcSecret, rpcPort} = request;

  // Construct JSON-RPC parameters
  const params: any[] = [`token:${rpcSecret}`, [downlink]];

  if (filename) {
    params.push({out: filename});
  }

  // Construct JSON-RPC payload
  const payload = {
    jsonrpc: '2.0',
    id: 'aria2-service',
    method: 'aria2.addUri',
    params,
  };

  const url = `http://localhost:${rpcPort}/jsonrpc`;
  return await servicePostJson(
    url,
    payload
  );
}