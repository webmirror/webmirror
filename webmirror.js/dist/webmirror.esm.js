var webmirror = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../../Library/Caches/deno/deno_esbuild/registry.npmjs.org/range-parser@1.2.1/node_modules/range-parser/index.js
  var require_range_parser = __commonJS({
    "../../../Library/Caches/deno/deno_esbuild/registry.npmjs.org/range-parser@1.2.1/node_modules/range-parser/index.js"(exports, module) {
      "use strict";
      module.exports = rangeParser;
      function rangeParser(size, str, options) {
        if (typeof str !== "string") {
          throw new TypeError("argument str must be a string");
        }
        var index = str.indexOf("=");
        if (index === -1) {
          return -2;
        }
        var arr = str.slice(index + 1).split(",");
        var ranges = [];
        ranges.type = str.slice(0, index);
        for (var i = 0; i < arr.length; i++) {
          var range = arr[i].split("-");
          var start = parseInt(range[0], 10);
          var end = parseInt(range[1], 10);
          if (isNaN(start)) {
            start = size - end;
            end = size - 1;
          } else if (isNaN(end)) {
            end = size - 1;
          }
          if (end > size - 1) {
            end = size - 1;
          }
          if (isNaN(start) || isNaN(end) || start > end || start < 0) {
            continue;
          }
          ranges.push({
            start,
            end
          });
        }
        if (ranges.length < 1) {
          return -1;
        }
        return options && options.combine ? combineRanges(ranges) : ranges;
      }
      function combineRanges(ranges) {
        var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart);
        for (var j = 0, i = 1; i < ordered.length; i++) {
          var range = ordered[i];
          var current = ordered[j];
          if (range.start > current.end + 1) {
            ordered[++j] = range;
          } else if (range.end > current.end) {
            current.end = range.end;
            current.index = Math.min(current.index, range.index);
          }
        }
        ordered.length = j + 1;
        var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex);
        combined.type = ranges.type;
        return combined;
      }
      function mapWithIndex(range, index) {
        return {
          start: range.start,
          end: range.end,
          index
        };
      }
      function mapWithoutIndex(range) {
        return {
          start: range.start,
          end: range.end
        };
      }
      function sortByRangeIndex(a, b) {
        return a.index - b.index;
      }
      function sortByRangeStart(a, b) {
        return a.start - b.start;
      }
    }
  });

  // main.ts
  var main_exports = {};
  __export(main_exports, {
    wmFetch: () => wmFetch
  });
  var import_range_parser = __toESM(require_range_parser());

  // ../../../Library/Caches/deno/deno_esbuild/registry.npmjs.org/idb-keyval@6.2.1/node_modules/idb-keyval/dist/index.js
  function promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.oncomplete = request.onsuccess = () => resolve(request.result);
      request.onabort = request.onerror = () => reject(request.error);
    });
  }
  function createStore(dbName, storeName) {
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    const dbp = promisifyRequest(request);
    return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
  }
  var defaultGetStoreFunc;
  function defaultGetStore() {
    if (!defaultGetStoreFunc) {
      defaultGetStoreFunc = createStore("keyval-store", "keyval");
    }
    return defaultGetStoreFunc;
  }
  function get(key, customStore = defaultGetStore()) {
    return customStore("readonly", (store) => promisifyRequest(store.get(key)));
  }
  function set(key, value, customStore = defaultGetStore()) {
    return customStore("readwrite", (store) => {
      store.put(value, key);
      return promisifyRequest(store.transaction);
    });
  }

  // https://jsr.io/@std/encoding/1.0.5/_validate_binary_like.ts
  var encoder = new TextEncoder();
  function getTypeName(value) {
    const type = typeof value;
    if (type !== "object") {
      return type;
    } else if (value === null) {
      return "null";
    } else {
      return value?.constructor?.name ?? "object";
    }
  }
  function validateBinaryLike(source) {
    if (typeof source === "string") {
      return encoder.encode(source);
    } else if (source instanceof Uint8Array) {
      return source;
    } else if (source instanceof ArrayBuffer) {
      return new Uint8Array(source);
    }
    throw new TypeError(
      `Cannot validate the input as it must be a Uint8Array, a string, or an ArrayBuffer: received a value of the type ${getTypeName(source)}`
    );
  }

  // https://jsr.io/@std/encoding/1.0.5/_base32_common.ts
  var placeHolderPadLookup = [0, 1, , 2, 3, , 4];
  function getPadLength(placeHoldersLen) {
    const maybeLen = placeHolderPadLookup[placeHoldersLen];
    if (typeof maybeLen !== "number") {
      throw new Error("Invalid pad length");
    }
    return maybeLen;
  }
  function getLens(b32) {
    const len = b32.length;
    if (len % 8 > 0) {
      throw new Error(
        `Cannot decode base32 string as the length must be a multiple of 8: received length ${len}`
      );
    }
    let validLen = b32.indexOf("=");
    if (validLen === -1) validLen = len;
    const placeHoldersLen = validLen === len ? 0 : 8 - validLen % 8;
    return [validLen, placeHoldersLen];
  }
  function getByteLength(validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 5 / 8 - getPadLength(placeHoldersLen);
  }
  function decode(b32, lookup2) {
    const revLookup2 = [];
    lookup2.forEach((c, i2) => revLookup2[c.charCodeAt(0)] = i2);
    let tmp;
    const [validLen, placeHoldersLen] = getLens(b32);
    const arr = new Uint8Array(getByteLength(validLen, placeHoldersLen));
    let curByte = 0;
    const len = placeHoldersLen > 0 ? validLen - 8 : validLen;
    let i;
    for (i = 0; i < len; i += 8) {
      tmp = revLookup2[b32.charCodeAt(i)] << 20 | revLookup2[b32.charCodeAt(i + 1)] << 15 | revLookup2[b32.charCodeAt(i + 2)] << 10 | revLookup2[b32.charCodeAt(i + 3)] << 5 | revLookup2[b32.charCodeAt(i + 4)];
      arr[curByte++] = tmp >> 17 & 255;
      arr[curByte++] = tmp >> 9 & 255;
      arr[curByte++] = tmp >> 1 & 255;
      tmp = (tmp & 1) << 15 | revLookup2[b32.charCodeAt(i + 5)] << 10 | revLookup2[b32.charCodeAt(i + 6)] << 5 | revLookup2[b32.charCodeAt(i + 7)];
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup2[b32.charCodeAt(i)] << 20 | revLookup2[b32.charCodeAt(i + 1)] << 15 | revLookup2[b32.charCodeAt(i + 2)] << 10 | revLookup2[b32.charCodeAt(i + 3)] << 5 | revLookup2[b32.charCodeAt(i + 4)];
      arr[curByte++] = tmp >> 17 & 255;
      arr[curByte++] = tmp >> 9 & 255;
      arr[curByte++] = tmp >> 1 & 255;
      tmp = (tmp & 1) << 7 | revLookup2[b32.charCodeAt(i + 5)] << 2 | revLookup2[b32.charCodeAt(i + 6)] >> 3;
      arr[curByte++] = tmp & 255;
    } else if (placeHoldersLen === 3) {
      tmp = revLookup2[b32.charCodeAt(i)] << 19 | revLookup2[b32.charCodeAt(i + 1)] << 14 | revLookup2[b32.charCodeAt(i + 2)] << 9 | revLookup2[b32.charCodeAt(i + 3)] << 4 | revLookup2[b32.charCodeAt(i + 4)] >> 1;
      arr[curByte++] = tmp >> 16 & 255;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    } else if (placeHoldersLen === 4) {
      tmp = revLookup2[b32.charCodeAt(i)] << 11 | revLookup2[b32.charCodeAt(i + 1)] << 6 | revLookup2[b32.charCodeAt(i + 2)] << 1 | revLookup2[b32.charCodeAt(i + 3)] >> 4;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    } else if (placeHoldersLen === 6) {
      tmp = revLookup2[b32.charCodeAt(i)] << 3 | revLookup2[b32.charCodeAt(i + 1)] >> 2;
      arr[curByte++] = tmp & 255;
    }
    return arr;
  }

  // https://jsr.io/@std/encoding/1.0.5/base32.ts
  var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("");
  var revLookup = [];
  lookup.forEach((c, i) => revLookup[c.charCodeAt(0)] = i);
  function decodeBase32(b32) {
    return decode(b32, lookup);
  }

  // https://jsr.io/@std/encoding/1.0.5/base58.ts
  var base58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");

  // https://jsr.io/@std/encoding/1.0.5/base64.ts
  var base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
  ];
  function encodeBase64(data) {
    const uint8 = validateBinaryLike(data);
    let result = "";
    let i;
    const l = uint8.length;
    for (i = 2; i < l; i += 3) {
      result += base64abc[uint8[i - 2] >> 2];
      result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
      result += base64abc[(uint8[i - 1] & 15) << 2 | uint8[i] >> 6];
      result += base64abc[uint8[i] & 63];
    }
    if (i === l + 1) {
      result += base64abc[uint8[i - 2] >> 2];
      result += base64abc[(uint8[i - 2] & 3) << 4];
      result += "==";
    }
    if (i === l) {
      result += base64abc[uint8[i - 2] >> 2];
      result += base64abc[(uint8[i - 2] & 3) << 4 | uint8[i - 1] >> 4];
      result += base64abc[(uint8[i - 1] & 15) << 2];
      result += "=";
    }
    return result;
  }

  // https://jsr.io/@std/encoding/1.0.5/hex.ts
  var hexTable = new TextEncoder().encode("0123456789abcdef");
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder();

  // https://jsr.io/@std/encoding/1.0.5/varint.ts
  var AB = new ArrayBuffer(8);
  var U32_VIEW = new Uint32Array(AB);
  var U64_VIEW = new BigUint64Array(AB);

  // encoding.ts
  function decodeBase322(b32) {
    const mod = b32.length % 8;
    const b32padded = mod !== 0 ? b32 + "=".repeat(8 - mod) : b32;
    return decodeBase32(b32padded.toUpperCase());
  }

  // main.ts
  var HttpError = class extends Error {
    status;
    constructor(status, message) {
      super(message);
      this.status = status;
      this.name = this.constructor.name;
    }
  };
  function wmFetch(event) {
    try {
      return wmFetchInternal(event);
    } catch (error) {
      if (error instanceof HttpError) {
        return Promise.resolve(
          new Response(error.message, { status: error.status })
        );
      } else {
        return Promise.resolve(
          new Response(`internal server error: ${error}`, { status: 500 })
        );
      }
    }
  }
  async function wmFetchInternal(event) {
    const { descDigest, path } = parseURL(event.request.url);
    if (!["HEAD", "GET"].includes(event.request.method)) {
      throw new HttpError(400, "unsupported HTTP method");
    }
    const manifest = await retrieveDescription(descDigest);
    const { size, digest: fileDigest } = manifest[path];
    const fileBlob = await (await caFetch(descDigest, path, {
      integrity: `sha256-${encodeBase64(decodeBase322(fileDigest))}`
    })).blob();
    const rangeHeader = event.request.headers.get("Range");
    if (rangeHeader) {
      const ranges = (0, import_range_parser.default)(size, rangeHeader);
      if (ranges === -2) {
        return new Response(fileBlob);
      }
      if (ranges === -1) {
        return new Response(fileBlob);
      }
      if (ranges.length !== 1) {
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
            "Content-Range": `bytes ${range.start}-${range.end}/${size}`
          }
        }
      );
    } else {
      return new Response(
        fileBlob,
        {
          headers: {
            "Accept-Ranges": "bytes"
          }
        }
      );
    }
  }
  async function retrieveDescription(descDigest) {
    const url = new URL(
      `http://${descDigest}/.webmirror/directory-description.json`
    );
    let blob = await cacheGet(url);
    if (!blob) {
      blob = await (await caFetch(
        descDigest,
        ".webmirror/directory-description.json",
        {
          integrity: `sha256-${encodeBase64(decodeBase322(descDigest))}`
        }
      )).blob();
      cachePut(url, blob);
    }
    return JSON.parse(await blob.text());
  }
  async function cachePut(url, blob) {
    const cache = await caches.open("webmirror");
    const request = new Request(url);
    const response = new Response(blob);
    await cache.put(request, response);
  }
  async function cacheGet(url) {
    const cache = await caches.open("webmirror");
    const response = await cache.match(new Request(url));
    if (response) {
      const blob = await response.blob();
      return blob;
    } else {
      return null;
    }
  }
  async function caFetch(descDigest, path, options) {
    const server = await getServer(descDigest);
    return fetch(`${server}${path}`, options);
  }
  async function getServer(descDigest) {
    const key = `webmirror-servers--${descDigest}`;
    let servers = await get(key);
    if (servers == void 0) {
      const url = new URL("https://tracker.webmirrors.org/v0/servers");
      url.search = new URLSearchParams({ digest: descDigest }).toString();
      servers = await (await fetch(url)).json();
      await set(key, servers);
    }
    if (servers.length === 0) {
      throw new HttpError(404, "no servers found");
    }
    return servers[Math.floor(Math.random() * servers.length)];
  }
  function parseURL(urlS) {
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
  return __toCommonJS(main_exports);
})();
/*! Bundled license information:

range-parser/index.js:
  (*!
   * range-parser
   * Copyright(c) 2012-2014 TJ Holowaychuk
   * Copyright(c) 2015-2016 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
