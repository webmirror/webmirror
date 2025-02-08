// @deno-types="@types/range-parser"
import parseRange from "range-parser";
import { get as idbGet, set as idbSet } from "idb-keyval";

import { decodeBase32, encodeBase64 } from "./encoding.ts";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

export function wmFetch(event: FetchEvent): Promise<Response> {
  try {
    return wmFetchInternal(event);
  } catch (error) {
    if (error instanceof HttpError) {
      return Promise.resolve(
        new Response(error.message, { status: error.status }),
      );
    } else {
      return Promise.resolve(
        new Response(`internal server error: ${error}`, { status: 500 }),
      );
    }
  }
}

async function wmFetchInternal(event: FetchEvent): Promise<Response> {
  const { descDigest, path } = parseURL(event.request.url);

  if (!["HEAD", "GET"].includes(event.request.method)) {
    throw new HttpError(400, "unsupported HTTP method");
  }

  const manifest = await retrieveDescription(descDigest);

  // assume it's a hash of type
  // path --> {size: integer, digest: base32 encoded sha-256 hash}
  const { size, digest: fileDigest } = manifest[path];

  const fileBlob = await (await caFetch(descDigest, path, {
    integrity: `sha256-${encodeBase64(decodeBase32(fileDigest))}`,
  })).blob();

  const rangeHeader = event.request.headers.get("Range");
  if (rangeHeader) {
    const ranges = parseRange(size, rangeHeader);
    if (ranges === -2) {
      // Malformed `Range` header string, ignore the header.
      return new Response(fileBlob);
    }
    if (ranges === -1) {
      // Unsatisfiable range, ignore the header.
      return new Response(fileBlob);
    }

    if (ranges.length !== 1) {
      // We don't support multiple ranges at the moment, ignore the header.
      return new Response(fileBlob);
    }

    const range = ranges[0];
    return new Response(
      fileBlob.slice(range.start, range.end + 1),
      {
        status: 206,
        statusText: "Partial Content",
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
        },
      },
    );
  } else {
    return new Response(
      fileBlob,
      {
        headers: {
          "Accept-Ranges": "bytes",
        },
      },
    );
  }
}

async function retrieveDescription(descDigest: string): Promise<any> {
  const url = new URL(
    `http://${descDigest}/.webmirror/directory-description.json`,
  );

  let blob = await cacheGet(url);

  const isBlobMissing = !blob;

  if (isBlobMissing) {
    const resp = await caFetch(
      descDigest,
      ".webmirror/directory-description.json",
      {
        integrity: `sha256-${encodeBase64(decodeBase32(descDigest))}`,
      },
    );
    blob = await resp.blob();
  }

  if (!blob) {
    throw new HttpError(504, "no mirror has responded successfully");
  }

  const json = JSON.parse(await blob.text());

  if (isBlobMissing) {
    cachePut(url, blob);
  }

  return json;
}

async function cachePut(url: URL, blob: Blob) {
  const cache = await caches.open("webmirror");
  const request = new Request(url);
  const response = new Response(blob);
  await cache.put(request, response);
}

async function cacheGet(url: URL): Promise<Blob | null> {
  const cache = await caches.open("webmirror");
  const response = await cache.match(new Request(url));
  if (response) {
    const blob = await response.blob();
    return blob;
  } else {
    return null;
  }
}

/**
 * caFetch is "content addressed fetch"
 */
async function caFetch(
  descDigest: string,
  path: string,
  options: RequestInit,
): Promise<Response> {
  let retries = 0;
  do {
    const server = await getServer(descDigest);
    try {
      return await secFetch(`${server}${path}`, options);
    } catch {
      console.log("WebMirror changing server", descDigest);
      await changeCurrentServer(descDigest, server);
    }
    retries++;
  } while (retries < 3);

  console.log("WebMirror caFetch failed", descDigest, path, options);
  throw new HttpError(504, "no mirror has responded successfully");
}

async function secFetch(
  input: RequestInfo | URL,
  options: RequestInit,
): Promise<Response> {
  const resp = await fetch(
    input,
    {
      ...options,
      // > [credentials] control whether or not the browser sends credentials
      // > with the request, as well as whether any `Set-Cookie` response
      // headers are respected.
      // We want neither any credentials to be sent nor cookies to be set.
      credentials: "omit",
      // > Reject the promise with a network error when a redirect status
      // > [HTTP 3xx] is returned.
      redirect: "error",
      // > Omit the `Referer` header.
      referrer: "",
      referrerPolicy: "no-referrer",
    },
  );
  if (resp.status !== 200) {
    throw Error("non-200 response");
  }
  return resp;
}

async function getServers(descDigest: string): Promise<string[]> {
  const key = `webmirror-servers--${descDigest}`;
  let servers = await idbGet(key);
  if (servers == undefined) {
    // assume the response is a json array of server URLs ending with a trailing slash
    // e.g. http://127.0.0.1:8080/<hash>/
    const resp = await fetch(
      `https://tracker.webmirrors.org/v0/datasets/${descDigest}/mirrors`,
      {
        // The browser fetches the resource from the remote server without
        // first looking in the cache, *and will not* update the cache with the
        // downloaded resource.
        cache: "no-store",
      },
    );
    const json = await resp.json();
    servers = json.data.map((x) => x.url);
    servers.push("SENTINEL-VALUE");
    await idbSet(key, servers);
  }
  console.log("WebMirror servers", descDigest, servers);
  return servers;
}

async function getServer(descDigest: string): Promise<string> {
  const servers = await getServers(descDigest);
  if (servers.length === 0) {
    throw new HttpError(404, "no servers found");
  }
  const server = servers[0];
  if (server === "SENTINEL-VALUE") {
    throw new HttpError(404, "no servers found");
  }
  return servers[0];
}

async function changeCurrentServer(
  descDigest: string,
  current: string,
): Promise<void> {
  const key = `webmirror-servers--${descDigest}`;
  const servers = await getServers(descDigest);

  const head = servers.shift();
  if (head == null) {
    return;
  }

  // There can be multiple requests in flight intercepted by WebMirror Service
  // Worker, such as when loading map tiles. All of those would use the same
  // server, and let's assume that the server is down. Those requests would then
  // fail one by one in quick succession, and then we'd try to change the 
  // current server in good faith *for every failure*. However, if we do not 
  // check what the current  server is and whether it is the one that failed, 
  // we can easily cycle through all good servers in our list without realising.
  //
  // When a caller requests this function to change the current server, check
  // if the current server is indeed what they think it is (i.e. what they want
  // us to change from). If it's already different, we can skip.
  if (head !== current) {
    return;
  }

  // If `head === "SENTINEL-VALUE"` then we must have cycled through all servers
  // in our list. Invalidate (purge) the cache and retrieve a new list of
  // servers from the tracker.
  if (head === "SENTINEL-VALUE") {
    await idbSet(key, undefined);
    await getServers(descDigest);
    return;
  }

  servers.push(head);
  await idbSet(key, servers);
}

function parseURL(urlS: string): { descDigest: string; path: string } {
  const url = new URL(urlS);

  let descDigest, path;

  if (url.hostname.endsWith(".webmirror")) {
    descDigest = url.hostname.replace(/\.webmirror$/, "");
    path = url.pathname.replace(/^\//, "");
  } else if (url.pathname.startsWith("/.webmirror/")) {
    descDigest = url.pathname.match(/^\/\.webmirror\/([^\/]+)/)[1];
    path = url.pathname.replace(/^\/\.webmirror\/([^\/]+)\//, "");
  } else {
    throw new HttpError(400, "invalid WebMirror URL");
  }

  return { descDigest, path };
}
