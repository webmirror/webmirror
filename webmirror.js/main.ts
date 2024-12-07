// @deno-types="@types/range-parser"
import parseRange from "range-parser";

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
    console.log("[webmirror] fetch", event);
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
  const url = new URL(event.request.url);
  if (!url.hostname.endsWith(".webmirror")) {
    throw new HttpError(
      400,
      "invalid WebMirror URI: hostname does not end with `.webmirror`",
    );
  }

  if (!["HEAD", "GET"].includes(event.request.method)) {
    console.log("[webmirror] unsupported HTTP method", event.request.method);
    throw new HttpError(400, "unsupported HTTP method");
  }

  const imageDigest = url.hostname.replace(/\.webmirror$/, "");
  const path = normalizePath(url.pathname);

  // assume the response is a json array of server URLs ending with a trailing slash
  // e.g. http://127.0.0.1:8080/<hash>/
  const servers = await (await fetch(
    `http://127.0.0.1:2020/v0/descriptions/${imageDigest}/servers`,
  ))
    .json();

  const server = servers[0];

  const manifest = await (await fetch(
    `${server}.webmirror/directory-description.json`,
    {
      integrity: `sha256-${encodeBase64(decodeBase32(imageDigest))}`,
    },
  )).json();

  console.log("[webmirror] manifest", imageDigest, manifest);
  console.log("[webmirror] path", path);

  // assume it's a hash of type
  // path --> {size: integer, digest: base32 encoded sha-256 hash}
  const { size, digest: fileDigest } = manifest[path];

  const fileBlob = await (await fetch(
    `${server}${path}`,
    {
      integrity: `sha256-${encodeBase64(decodeBase32(fileDigest))}`,
    },
  )).blob();

  console.log("[webmirror] fetched", imageDigest, path, fileBlob);

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
    console.log("[webmirror] range response", range);
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
    console.log("[webmirror] full response");
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

function normalizePath(path: string): string {
  // Remove first slash to make paths relative
  return path.replace(/^\//, '');
}