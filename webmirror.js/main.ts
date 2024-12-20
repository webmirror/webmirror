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
  const {descDigest, path} = parseURL(event.request.url);

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

  if (!blob) {
    blob = await (await caFetch(
      descDigest,
      ".webmirror/directory-description.json",
      {
        integrity: `sha256-${encodeBase64(decodeBase32(descDigest))}`,
      },
    )).blob();

    cachePut(url, blob);
  }

  return JSON.parse(await blob.text());
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
  const server = await getServer(descDigest);
  return fetch(`${server}${path}`, options);
}

async function getServer(descDigest: string): Promise<string> {
  const key = `webmirror-servers--${descDigest}`;
  let servers = await idbGet(key);
  if (servers == undefined) {
    // assume the response is a json array of server URLs ending with a trailing slash
    // e.g. http://127.0.0.1:8080/<hash>/
    const url = new URL("https://tracker.webmirrors.org/v0/servers");
    url.search = new URLSearchParams({digest: descDigest}).toString();
    servers = await (await fetch(url)).json();
    await idbSet(key, servers);
  } 
  
  if (servers.length === 0) {
    throw new HttpError(404, "no servers found");
  }

  // Get one server at random each time
  return servers[Math.floor(Math.random() * servers.length)];
}

function parseURL(urlS: string): {descDigest: string, path: string} {
  const url = new URL(urlS);

  let descDigest, path;

  if (url.hostname.endsWith(".webmirror")) {
    descDigest = url.hostname.replace(/\.webmirror$/, "");
    path = url.pathname.replace(/^\//, '');
  } else if (url.pathname.startsWith("/.webmirror/")) {
    descDigest = url.pathname.match(/^\/\.webmirror\/([^\/]+)/)[1];
    path = url.pathname.replace(/^\/\.webmirror\/([^\/]+)\//, "");
  } else {
    throw new HttpError(400, "invalid WebMirror URL");
  }

  return {descDigest, path};
}
