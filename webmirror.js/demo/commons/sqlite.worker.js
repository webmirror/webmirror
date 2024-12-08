!function (e, t) {
  if ("object" == typeof exports && "object" == typeof module) {
    module.exports = t();
  } else if ("function" == typeof define && define.amd) define([], t);
  else {
    var r = t();
    for (var n in r) ("object" == typeof exports ? exports : e)[n] = r[n];
  }
}(this, function () {
  return (() => {
    var __webpack_modules__ = {
        870: (e, t, r) => {
          "use strict";
          r.r(t),
            r.d(t, {
              createEndpoint: () => o,
              expose: () => l,
              proxy: () => v,
              proxyMarker: () => n,
              releaseProxy: () => i,
              transfer: () => _,
              transferHandlers: () => u,
              windowEndpoint: () => b,
              wrap: () => d,
            });
          const n = Symbol("Comlink.proxy"),
            o = Symbol("Comlink.endpoint"),
            i = Symbol("Comlink.releaseProxy"),
            s = Symbol("Comlink.thrown"),
            a = (e) =>
              "object" == typeof e && null !== e || "function" == typeof e,
            u = new Map([["proxy", {
              canHandle: (e) => a(e) && e[n],
              serialize(e) {
                const { port1: t, port2: r } = new MessageChannel();
                return l(e, t), [r, [r]];
              },
              deserialize: (e) => (e.start(), d(e)),
            }], ["throw", {
              canHandle: (e) => a(e) && s in e,
              serialize({ value: e }) {
                let t;
                return t = e instanceof Error
                  ? {
                    isError: !0,
                    value: { message: e.message, name: e.name, stack: e.stack },
                  }
                  : { isError: !1, value: e },
                  [t, []];
              },
              deserialize(e) {
                if (e.isError) {
                  throw Object.assign(new Error(e.value.message), e.value);
                }
                throw e.value;
              },
            }]]);
          function l(e, t = self) {
            t.addEventListener("message", function r(n) {
              if (!n || !n.data) return;
              const { id: o, type: i, path: a } = Object.assign(
                  { path: [] },
                  n.data,
                ),
                u = (n.data.argumentList || []).map(w);
              let d;
              try {
                const t = a.slice(0, -1).reduce((e, t) => e[t], e),
                  r = a.reduce((e, t) => e[t], e);
                switch (i) {
                  case 0:
                    d = r;
                    break;
                  case 1:
                    t[a.slice(-1)[0]] = w(n.data.value), d = !0;
                    break;
                  case 2:
                    d = r.apply(t, u);
                    break;
                  case 3:
                    d = v(new r(...u));
                    break;
                  case 4:
                    {
                      const { port1: t, port2: r } = new MessageChannel();
                      l(e, r), d = _(t, [t]);
                    }
                    break;
                  case 5:
                    d = void 0;
                }
              } catch (e) {
                d = { value: e, [s]: 0 };
              }
              Promise.resolve(d).catch((e) => ({ value: e, [s]: 0 })).then(
                (e) => {
                  const [n, s] = g(e);
                  t.postMessage(
                    Object.assign(Object.assign({}, n), { id: o }),
                    s,
                  ), 5 === i && (t.removeEventListener("message", r), c(t));
                },
              );
            }), t.start && t.start();
          }
          function c(e) {
            (function (e) {
              return "MessagePort" === e.constructor.name;
            })(e) && e.close();
          }
          function d(e, t) {
            return h(e, [], t);
          }
          function f(e) {
            if (e) {
              throw new Error("Proxy has been released and is not useable");
            }
          }
          function h(e, t = [], r = function () {}) {
            let n = !1;
            const s = new Proxy(r, {
              get(r, o) {
                if (f(n), o === i) {
                  return () =>
                    y(e, { type: 5, path: t.map((e) => e.toString()) }).then(
                      () => {
                        c(e), n = !0;
                      },
                    );
                }
                if ("then" === o) {
                  if (0 === t.length) return { then: () => s };
                  const r = y(e, { type: 0, path: t.map((e) => e.toString()) })
                    .then(w);
                  return r.then.bind(r);
                }
                return h(e, [...t, o]);
              },
              set(r, o, i) {
                f(n);
                const [s, a] = g(i);
                return y(e, {
                  type: 1,
                  path: [...t, o].map((e) => e.toString()),
                  value: s,
                }, a).then(w);
              },
              apply(r, i, s) {
                f(n);
                const a = t[t.length - 1];
                if (a === o) return y(e, { type: 4 }).then(w);
                if ("bind" === a) return h(e, t.slice(0, -1));
                const [u, l] = m(s);
                return y(e, {
                  type: 2,
                  path: t.map((e) => e.toString()),
                  argumentList: u,
                }, l).then(w);
              },
              construct(r, o) {
                f(n);
                const [i, s] = m(o);
                return y(e, {
                  type: 3,
                  path: t.map((e) => e.toString()),
                  argumentList: i,
                }, s).then(w);
              },
            });
            return s;
          }
          function m(e) {
            const t = e.map(g);
            return [
              t.map((e) => e[0]),
              (r = t.map((e) => e[1]), Array.prototype.concat.apply([], r)),
            ];
            var r;
          }
          const p = new WeakMap();
          function _(e, t) {
            return p.set(e, t), e;
          }
          function v(e) {
            return Object.assign(e, { [n]: !0 });
          }
          function b(e, t = self, r = "*") {
            return {
              postMessage: (t, n) => e.postMessage(t, r, n),
              addEventListener: t.addEventListener.bind(t),
              removeEventListener: t.removeEventListener.bind(t),
            };
          }
          function g(e) {
            for (const [t, r] of u) {
              if (r.canHandle(e)) {
                const [n, o] = r.serialize(e);
                return [{ type: 3, name: t, value: n }, o];
              }
            }
            return [{ type: 0, value: e }, p.get(e) || []];
          }
          function w(e) {
            switch (e.type) {
              case 3:
                return u.get(e.name).deserialize(e.value);
              case 0:
                return e.value;
            }
          }
          function y(e, t, r) {
            return new Promise((n) => {
              const o = new Array(4).fill(0).map(
                () =>
                  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(
                    16,
                  ),
              ).join("-");
              e.addEventListener("message", function t(r) {
                r.data && r.data.id && r.data.id === o &&
                  (e.removeEventListener("message", t), n(r.data));
              }),
                e.start && e.start(),
                e.postMessage(Object.assign({ id: o }, t), r);
            });
          }
        },
        794: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            t.createLazyFile = t.LazyUint8Array = void 0;
          class r {
            constructor(e) {
              this.serverChecked = !1,
                this.chunks = [],
                this.totalFetchedBytes = 0,
                this.totalRequests = 0,
                this.readPages = [],
                this.readHeads = [],
                this.lastGet = -1,
                this._chunkSize = e.requestChunkSize,
                this.maxSpeed = Math.round(
                  (e.maxReadSpeed || 5242880) / this._chunkSize,
                ),
                this.maxReadHeads = e.maxReadHeads ?? 3,
                this.rangeMapper = e.rangeMapper,
                this.logPageReads = e.logPageReads ?? !1,
                e.fileLength && (this._length = e.fileLength),
                this.requestLimiter = null == e.requestLimiter
                  ? (e) => {}
                  : e.requestLimiter;
            }
            copyInto(e, t, r, n) {
              if (n >= this.length) return 0;
              const o = n + (r = Math.min(this.length - n, r));
              let i = 0;
              for (; i < r;) {
                const r = n + i,
                  s = r % this.chunkSize,
                  a = r / this.chunkSize | 0,
                  u = Math.min(this.chunkSize, o - r);
                let l = this.getChunk(a);
                0 === s && u === this.chunkSize || (l = l.subarray(s, s + u)),
                  e.set(l, t + i),
                  i += l.length;
              }
              return r;
            }
            moveReadHead(e) {
              for (const [t, r] of this.readHeads.entries()) {
                const n = r.startChunk + r.speed,
                  o = Math.min(this.maxSpeed, 2 * r.speed);
                if (e >= n && e < n + o) {
                  return r.speed = o,
                    r.startChunk = n,
                    0 !== t &&
                    (this.readHeads.splice(t, 1), this.readHeads.unshift(r)),
                    r;
                }
              }
              const t = { startChunk: e, speed: 1 };
              for (
                this.readHeads.unshift(t);
                this.readHeads.length > this.maxReadHeads;
              ) this.readHeads.pop();
              return t;
            }
            getChunk(e) {
              let t = !0;
              if (void 0 === this.chunks[e]) {
                t = !1;
                const r = this.moveReadHead(e),
                  n = r.speed,
                  o = r.startChunk * this.chunkSize;
                let i = (r.startChunk + n) * this.chunkSize - 1;
                i = Math.min(i, this.length - 1);
                const s = this.doXHR(o, i);
                for (let e = 0; e < n; e++) {
                  const t = r.startChunk + e;
                  if (e * this.chunkSize >= s.byteLength) break;
                  const n = (e + 1) * this.chunkSize > s.byteLength
                    ? s.byteLength - e * this.chunkSize
                    : this.chunkSize;
                  this.chunks[t] = new Uint8Array(s, e * this.chunkSize, n);
                }
              }
              if (void 0 === this.chunks[e]) {
                throw new Error("doXHR failed (bug)!");
              }
              return !this.logPageReads || this.lastGet == e ||
                (this.lastGet = e,
                  this.readPages.push({
                    pageno: e,
                    wasCached: t,
                    prefetch: t ? 0 : this.readHeads[0].speed - 1,
                  })),
                this.chunks[e];
            }
            checkServer() {
              var e = new XMLHttpRequest();
              const t = this.rangeMapper(0, 0).url;
              if (
                e.open("HEAD", t, !1),
                  e.send(null),
                  !(e.status >= 200 && e.status < 300 || 304 === e.status)
              ) throw new Error("Couldn't load " + t + ". Status: " + e.status);
              var r = Number(e.getResponseHeader("Content-length")),
                n = "bytes" === e.getResponseHeader("Accept-Ranges");
              const o = e.getResponseHeader("Content-Encoding");
              var i = o && "identity" !== o;
              if (!n) {
                const t =
                  "Warning: The server did not respond with Accept-Ranges=bytes. It either does not support byte serving or does not advertise it (`Accept-Ranges: bytes` header missing), or your database is hosted on CORS and the server doesn't mark the accept-ranges header as exposed. This may lead to incorrect results.";
                console.warn(
                  t,
                  "(seen response headers:",
                  e.getAllResponseHeaders(),
                  ")",
                );
              }
              if (
                i &&
                console.warn(
                  `Warning: The server responded with ${o} encoding to a HEAD request. Ignoring since it may not do so for Range HTTP requests, but this will lead to incorrect results otherwise since the ranges will be based on the compressed data instead of the uncompressed data.`,
                ),
                  i && (r = null),
                  !this._length
              ) {
                if (!r) {
                  throw console.error(
                    "response headers",
                    e.getAllResponseHeaders(),
                  ),
                    Error(
                      "Length of the file not known. It must either be supplied in the config or given by the HTTP server.",
                    );
                }
                this._length = r;
              }
              this.serverChecked = !0;
            }
            get length() {
              return this.serverChecked || this.checkServer(), this._length;
            }
            get chunkSize() {
              return this.serverChecked || this.checkServer(), this._chunkSize;
            }
            doXHR(e, t) {
              if (
                console.log(
                  `[xhr of size ${(t + 1 - e) / 1024} KiB @ ${e / 1024} KiB]`,
                ),
                  this.requestLimiter(t - e),
                  this.totalFetchedBytes += t - e,
                  this.totalRequests++,
                  e > t
              ) {
                throw new Error(
                  "invalid range (" + e + ", " + t + ") or no bytes requested!",
                );
              }
              if (t > this.length - 1) {
                throw new Error(
                  "only " + this.length + " bytes available! programmer error!",
                );
              }
              const { fromByte: r, toByte: n, url: o } = this.rangeMapper(e, t);
              var i = new XMLHttpRequest();
              if (
                i.open("GET", o, !1),
                  this.length !== this.chunkSize &&
                  i.setRequestHeader("Range", "bytes=" + r + "-" + n),
                  i.responseType = "arraybuffer",
                  i.overrideMimeType &&
                  i.overrideMimeType("text/plain; charset=x-user-defined"),
                  i.send(null),
                  !(i.status >= 200 && i.status < 300 || 304 === i.status)
              ) throw new Error("Couldn't load " + o + ". Status: " + i.status);
              if (void 0 !== i.response) return i.response;
              throw Error("xhr did not return uint8array");
            }
          }
          t.LazyUint8Array = r,
            t.createLazyFile = function (e, t, n, o, i, s) {
              var a = new r(s),
                u = { isDevice: !1, contents: a },
                l = e.createFile(t, n, u, o, i);
              l.contents = a,
                Object.defineProperties(l, {
                  usedBytes: {
                    get: function () {
                      return this.contents.length;
                    },
                  },
                });
              var c = {};
              return Object.keys(l.stream_ops).forEach(function (t) {
                var r = l.stream_ops[t];
                c[t] = function () {
                  return e.forceLoadFile(l), r.apply(null, arguments);
                };
              }),
                c.read = function (t, r, n, o, i) {
                  return e.forceLoadFile(l),
                    t.node.contents.copyInto(r, n, o, i);
                },
                l.stream_ops = c,
                l;
            };
        },
        630: function (__unused_webpack_module, exports, __webpack_require__) {
          "use strict";
          var __createBinding = this && this.__createBinding ||
              (Object.create
                ? function (e, t, r, n) {
                  void 0 === n && (n = r),
                    Object.defineProperty(e, n, {
                      enumerable: !0,
                      get: function () {
                        return t[r];
                      },
                    });
                }
                : function (e, t, r, n) {
                  void 0 === n && (n = r), e[n] = t[r];
                }),
            __setModuleDefault = this && this.__setModuleDefault ||
              (Object.create
                ? function (e, t) {
                  Object.defineProperty(e, "default", {
                    enumerable: !0,
                    value: t,
                  });
                }
                : function (e, t) {
                  e.default = t;
                }),
            __importStar = this && this.__importStar || function (e) {
              if (e && e.__esModule) return e;
              var t = {};
              if (null != e) {
                for (var r in e) {
                  "default" !== r &&
                    Object.prototype.hasOwnProperty.call(e, r) &&
                    __createBinding(t, e, r);
                }
              }
              return __setModuleDefault(t, e), t;
            },
            __importDefault = this && this.__importDefault || function (e) {
              return e && e.__esModule ? e : { default: e };
            };
          Object.defineProperty(exports, "__esModule", { value: !0 }),
            exports.toObjects = void 0;
          const Comlink = __importStar(__webpack_require__(870)),
            sql_wasm_js_1 = __importDefault(__webpack_require__(365)),
            sql_wasm_wasm_1 = __importDefault(__webpack_require__(720)),
            lazyFile_1 = __webpack_require__(794),
            vtab_1 = __webpack_require__(457);
          function initTransferHandlers(e) {
            Comlink.transferHandlers.set("WORKERSQLPROXIES", {
              canHandle: (t) => {
                let r = t instanceof e.Database,
                  n = t && t.db && t.db instanceof e.Database;
                return r || n;
              },
              serialize(e) {
                const { port1: t, port2: r } = new MessageChannel();
                return Comlink.expose(e, t), [r, [r]];
              },
              deserialize: (e) => {},
            });
          }
          async function init(e) {
            const t = await sql_wasm_js_1.default({ locateFile: (t) => e });
            return initTransferHandlers(t), t;
          }
          function toObjects(e) {
            return e.flatMap((e) =>
              e.values.map((t) => {
                const r = {};
                for (let n = 0; n < e.columns.length; n++) {
                  r[e.columns[n]] = t[n];
                }
                return r;
              })
            );
          }
          async function fetchConfigs(e) {
            const t = e.map(async (e) => {
              if ("jsonconfig" === e.from) {
                const t = new URL(e.configUrl, location.href),
                  r = await fetch(t.toString());
                if (!r.ok) {
                  throw console.error("httpvfs config error", await r.text()),
                    Error(
                      `Could not load httpvfs config: ${r.status}: ${r.statusText}`,
                    );
                }
                const n = await r.json();
                return {
                  from: "inline",
                  config: "chunked" === n.serverMode
                    ? { ...n, urlPrefix: new URL(n.urlPrefix, t).toString() }
                    : { ...n, url: new URL(n.url, t).toString() },
                  virtualFilename: e.virtualFilename,
                };
              }
              return e;
            });
            return Promise.all(t);
          }
          sql_wasm_wasm_1.default, exports.toObjects = toObjects;
          const mod = {
            db: null,
            inited: !1,
            sqljs: null,
            bytesRead: 0,
            async SplitFileHttpDatabase(e, t, r, n = 1 / 0) {
              if (this.inited) {
                throw Error("sorry, only one db is supported right now");
              }
              this.inited = !0, this.sqljs || (this.sqljs = init(e));
              const o = await this.sqljs;
              this.bytesRead = 0;
              let i = (e) => {
                if (this.bytesRead + e > n) {
                  throw this.bytesRead = 0, new o.FS.ErrnoError(6);
                }
                this.bytesRead += e;
              };
              const s = new Map(), a = await fetchConfigs(t);
              let u;
              for (const { config: e, virtualFilename: t } of a) {
                const n = "chunked" === e.serverMode ? e.urlPrefix : e.url;
                let a;
                console.log("constructing url database", n);
                let l = e.cacheBust ? "?cb=" + e.cacheBust : "";
                a = "chunked" == e.serverMode
                  ? (t, r) => {
                    const n = t / e.serverChunkSize | 0,
                      o = t % e.serverChunkSize,
                      i = o + (r - t);
                    return {
                      url: e.urlPrefix +
                        String(n).padStart(e.suffixLength, "0") + l,
                      fromByte: o,
                      toByte: i,
                    };
                  }
                  : (t, r) => ({ url: e.url + l, fromByte: t, toByte: r });
                const c = t || n.replace(/\//g, "_");
                r || (r = c, u = e),
                  console.log("filename", c),
                  console.log("constructing url database", n, "filename", c);
                const d = lazyFile_1.createLazyFile(o.FS, "/", c, !0, !0, {
                  rangeMapper: a,
                  requestChunkSize: e.requestChunkSize,
                  fileLength: "chunked" === e.serverMode
                    ? e.databaseLengthBytes
                    : void 0,
                  logPageReads: !0,
                  maxReadHeads: 3,
                  requestLimiter: i,
                });
                s.set(c, d);
              }
              if (this.db = new o.CustomDatabase(r), u) {
                const e =
                  (await this.db.exec("pragma page_size; pragma cache_size=0"))[
                    0
                  ].values[0][0];
                e !== u.requestChunkSize &&
                  console.warn(
                    `Chunk size does not match page size: pragma page_size = ${e} but chunkSize = ${u.requestChunkSize}`,
                  );
              }
              return this.db.lazyFiles = s,
                this.db.create_vtab(vtab_1.SeriesVtab),
                this.db.query = (...e) => toObjects(this.db.exec(...e)),
                this.db;
            },
            getResetAccessedPages(e) {
              if (!this.db) return [];
              const t = this.db.lazyFiles.get(e || this.db.filename);
              if (!t) throw Error("unknown lazy file");
              const r = [...t.contents.readPages];
              return t.contents.readPages = [], r;
            },
            getStats(e) {
              const t = this.db;
              if (!t) return null;
              const r = t.lazyFiles.get(e || t.filename);
              if (!r) throw Error("unknown lazy file");
              return {
                filename: t.filename,
                totalBytes: r.contents.length,
                totalFetchedBytes: r.contents.totalFetchedBytes,
                totalRequests: r.contents.totalRequests,
              };
            },
            async evalCode(code) {
              return await eval(
                `(async function (db) {\n      ${code}\n    })`,
              )(this.db);
            },
          };
          Comlink.expose(mod);
        },
        457: (e, t) => {
          "use strict";
          var r;
          Object.defineProperty(t, "__esModule", { value: !0 }),
            t.SeriesVtab = void 0,
            function (e) {
              e[e.idx = 0] = "idx",
                e[e.id = 1] = "id",
                e[e.tagName = 2] = "tagName",
                e[e.textContent = 3] = "textContent",
                e[e.innerHTML = 4] = "innerHTML",
                e[e.outerHTML = 5] = "outerHTML",
                e[e.className = 6] = "className",
                e[e.parent = 7] = "parent",
                e[e.selector = 8] = "selector",
                e[e.querySelector = 9] = "querySelector";
            }(r || (r = {}));
          const n = Object.keys(r).map((e) => r[e]).filter(
            (e) => "string" == typeof e,
          );
          function o(e) {
            const t = {};
            for (let n = 0; n < e.length; n++) t[r[n]] = e[n];
            return t;
          }
          function i(e) {
            const t = new SharedArrayBuffer(1048576),
              r = new Int32Array(t, 0, 2);
            r[0] = 1,
              self.postMessage({ action: "eval", notify: t, request: e }),
              Atomics.wait(r, 0, 1);
            const n = r[1],
              o = new Uint8Array(t, 8, n).slice(),
              i = (new TextDecoder()).decode(o),
              s = JSON.parse(i);
            if ("err" in s) throw new Error(s.err);
            return s.ok;
          }
          t.SeriesVtab = class {
            constructor(e, t) {
              this.module = e,
                this.db = t,
                this.name = "dom",
                this.iVersion = 2,
                this.cursors = new Map(),
                console.log("constructed vfs");
            }
            getCursor(e) {
              const t = this.cursors.get(e);
              if (!t) throw Error("impl error");
              return t;
            }
            xConnect(e, t, r, o, i, s) {
              console.log("xconnect!!"),
                this.db.handleError(
                  this.module.ccall("sqlite3_declare_vtab", "number", [
                    "number",
                    "string",
                  ], [
                    e,
                    `create table x(\n              ${
                      n.slice(0, -1).join(", ")
                    } PRIMARY KEY\n          ) WITHOUT ROWID`,
                  ]),
                );
              const a = this.module._malloc(12);
              return this.module.setValue(i, a, "*"), 0;
            }
            xDisconnect(e) {
              return this.module._free(e), 0;
            }
            xOpen(e, t) {
              const r = this.module._malloc(4);
              return this.cursors.set(r, {
                elements: [],
                index: 0,
                querySelector: "",
              }),
                this.module.setValue(t, r, "*"),
                0;
            }
            xClose(e) {
              return this.module._free(e), 0;
            }
            xBestIndex(e, t) {
              try {
                const e = this.module.getValue(t + 0, "i32"),
                  n = this.module.getValue(t + 4, "i32"),
                  o = 64;
                let i = !1;
                for (let s = 0; s < e; s++) {
                  const e = n + 12 * s,
                    a = this.module.getValue(e, "i32"),
                    u = this.module.getValue(e + 4, "i8");
                  if (this.module.getValue(e + 5, "i8")) {
                    if (u === o) {
                      if (a !== r.selector) {
                        throw Error(
                          "The match operator can only be applied to the selector column!",
                        );
                      }
                      {
                        i = !0;
                        const e = this.module.getValue(t + 16, "i32"), r = 8;
                        this.module.setValue(e + s * r, 1, "i32");
                      }
                    }
                    console.log(`constraint ${s}: ${r[a]} (op=${u})`);
                  }
                }
                if (!i) {
                  throw Error(
                    "You must query the dom using `select ... from dom where selector MATCH <css-selector>`",
                  );
                }
                const s = this.module.getValue(t + 64, "i32");
                return this.module.setValue(t + 20, s, "i32"), 0;
              } catch (t) {
                return console.error("xbestindex", t),
                  this.setVtabError(e, String(t)),
                  21;
              }
            }
            xFilter(e, t, o, s, a) {
              if (console.log("xfilter", s), 1 !== s) {
                return console.error(
                  "did not get a single argument to xFilter",
                ),
                  21;
              }
              const u = this.module.extract_value(a + 0), l = this.getCursor(e);
              l.querySelector = u;
              const c = t, d = n.filter((e) => c & 1 << r[e]);
              return console.log("used columns", d),
                l.elements = i({ type: "select", selector: u, columns: d }),
                0;
            }
            xNext(e) {
              return this.getCursor(e).index++, 0;
            }
            xEof(e) {
              const t = this.getCursor(e);
              return +(t.index >= t.elements.length);
            }
            xColumn(e, t, n) {
              const o = this.getCursor(e), i = o.elements[o.index];
              if (r[n] in i) this.module.set_return_value(t, i[r[n]]);
              else {switch (n) {
                  case r.idx:
                    this.module.set_return_value(t, o.index);
                    break;
                  case r.querySelector:
                    this.module.set_return_value(t, o.querySelector);
                    break;
                  default:
                    throw Error(`unknown column ${r[n]}`);
                }}
              return 0;
            }
            setVtabError(e, t) {
              const r = this.module.lengthBytesUTF8(t) + 1,
                n = this.module.sqlite3_malloc(r);
              console.log("writing error", t, r),
                this.module.stringToUTF8(t, n, r),
                this.module.setValue(e + 8, n, "i32");
            }
            xUpdate(e, t, r, n) {
              try {
                const [e, n, ...s] = Array.from(
                  { length: t },
                  (e, t) => this.module.extract_value(r + 4 * t),
                );
                if (e) {
                  if (e && !n) {
                    console.log("DELETE", e),
                      i({ type: "delete", selector: e });
                  } else {
                    if (e !== n) throw "The selector row can't be set";
                    i({ type: "update", value: o(s) });
                  }
                } else {console.assert(null === n),
                    i({ type: "insert", value: o(s) });}
                return 0;
              } catch (t) {
                return this.setVtabError(e, String(t)), 21;
              }
            }
            xRowid(e, t) {
              throw Error("xRowid not implemented");
            }
            xFindFunction(e, t, r, n, o) {
              return "match" !== this.module.UTF8ToString(r)
                ? 0
                : (this.module.setValue(
                  n,
                  this.module.addFunction((e, t, r) => {
                    this.module.set_return_value(e, !0);
                  }, "viii"),
                  "i32",
                ),
                  150);
            }
          };
        },
        365: (e, t, r) => {
          e = r.nmd(e);
          var n = void 0,
            o = function (t) {
              return n || (n = new Promise(function (n, o) {
                var i, s = (i = void 0 !== t ? t : {}).onAbort;
                i.onAbort = function (e) {
                  o(new Error(e)), s && s(e);
                },
                  i.postRun = i.postRun || [],
                  i.postRun.push(function () {
                    n(i);
                  }),
                  e = void 0,
                  (i = void 0 !== i ? i : {}).onRuntimeInitialized =
                    function () {
                      var e = Ie(4),
                        t = i.cwrap,
                        r = t("sqlite3_open", "number", ["string", "number"]),
                        n = (t("sqlite3_open_v2", "number", [
                          "string",
                          "number",
                          "number",
                          "string",
                        ]),
                          t("sqlite3_close_v2", "number", ["number"])),
                        o = t("sqlite3_exec", "number", [
                          "number",
                          "string",
                          "number",
                          "number",
                          "number",
                        ]),
                        s = t("sqlite3_changes", "number", ["number"]),
                        a = t("sqlite3_prepare_v2", "number", [
                          "number",
                          "string",
                          "number",
                          "number",
                          "number",
                        ]),
                        u = t("sqlite3_sql", "string", ["number"]),
                        l = t("sqlite3_normalized_sql", "string", ["number"]),
                        c = t("sqlite3_prepare_v2", "number", [
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                        ]),
                        d = t("sqlite3_bind_text", "number", [
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                        ]),
                        f = t("sqlite3_bind_blob", "number", [
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                        ]),
                        h = t("sqlite3_bind_double", "number", [
                          "number",
                          "number",
                          "number",
                        ]),
                        m = t("sqlite3_bind_int", "number", [
                          "number",
                          "number",
                          "number",
                        ]),
                        p = t("sqlite3_bind_parameter_index", "number", [
                          "number",
                          "string",
                        ]),
                        _ = t("sqlite3_step", "number", ["number"]),
                        v = t("sqlite3_errmsg", "string", ["number"]),
                        b = t("sqlite3_column_count", "number", ["number"]),
                        g = t("sqlite3_data_count", "number", ["number"]),
                        w = t("sqlite3_column_double", "number", [
                          "number",
                          "number",
                        ]),
                        y = t("sqlite3_column_text", "string", [
                          "number",
                          "number",
                        ]),
                        E = t("sqlite3_column_blob", "number", [
                          "number",
                          "number",
                        ]),
                        k = t("sqlite3_column_bytes", "number", [
                          "number",
                          "number",
                        ]),
                        S = t("sqlite3_column_type", "number", [
                          "number",
                          "number",
                        ]),
                        x = t("sqlite3_column_name", "string", [
                          "number",
                          "number",
                        ]),
                        M = t("sqlite3_reset", "number", ["number"]),
                        D = t("sqlite3_clear_bindings", "number", ["number"]),
                        F = t("sqlite3_finalize", "number", ["number"]),
                        A = t("sqlite3_create_module_v2", "number", [
                          "number",
                          "string",
                          "number",
                          "number",
                          "number",
                        ]),
                        P = t("sqlite3_create_function_v2", "number", [
                          "number",
                          "string",
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                          "number",
                        ]),
                        R = t("sqlite3_value_type", "number", ["number"]),
                        z = t("sqlite3_value_bytes", "number", ["number"]),
                        j = t("sqlite3_value_text", "string", ["number"]),
                        B = t("sqlite3_value_blob", "number", ["number"]),
                        N = t("sqlite3_value_double", "number", ["number"]),
                        H = t("sqlite3_result_double", "", [
                          "number",
                          "number",
                        ]),
                        I = t("sqlite3_result_null", "", ["number"]),
                        U = t("sqlite3_result_text", "", [
                          "number",
                          "string",
                          "number",
                          "number",
                        ]),
                        V = t("sqlite3_result_blob", "", [
                          "number",
                          "number",
                          "number",
                          "number",
                        ]),
                        W = t("sqlite3_result_int", "", ["number", "number"]),
                        X = t("sqlite3_result_error", "", [
                          "number",
                          "string",
                          "number",
                        ]),
                        G = t("sqlite3_malloc", "number", ["number"]);
                      i.sqlite3_malloc = G;
                      var $ = t("RegisterExtensionFunctions", "number", [
                        "number",
                      ]);
                      function K(e, t) {
                        this.stmt = e,
                          this.db = t,
                          this.pos = 1,
                          this.allocatedmem = [];
                      }
                      function Y(e, t) {
                        this.db = t;
                        var r = L(e) + 1;
                        if (this.sqlPtr = Oe(r), null === this.sqlPtr) {
                          throw new Error(
                            "Unable to allocate memory for the SQL string",
                          );
                        }
                        O(e, this.sqlPtr, r),
                          this.nextSqlPtr = this.sqlPtr,
                          this.nextSqlString = null,
                          this.activeStatement = null;
                      }
                      function Q(t) {
                        this.filename = "dbfile_" +
                          (4294967295 * Math.random() >>> 0),
                          null != t &&
                          he.createDataFile("/", this.filename, t, !0, !0);
                        const n = r(this.filename, e);
                        this.db = oe(e, "i32"),
                          this.handleError(n),
                          $(this.db),
                          this.statements = {},
                          this.functions = {};
                      }
                      function J(t) {
                        this.filename = t;
                        const n = r(this.filename, e);
                        this.db = oe(e, "i32"),
                          this.handleError(n),
                          $(this.db),
                          this.statements = {},
                          this.functions = {};
                      }
                      K.prototype.bind = function (e) {
                        if (!this.stmt) throw "Statement closed";
                        return this.reset(),
                          Array.isArray(e)
                            ? this.bindFromArray(e)
                            : null == e || "object" != typeof e ||
                              this.bindFromObject(e);
                      },
                        K.prototype.bind_ = K.prototype.bind,
                        K.prototype.step = function () {
                          if (!this.stmt) throw "Statement closed";
                          this.pos = 1;
                          var e = _(this.stmt);
                          switch (e) {
                            case 100:
                              return !0;
                            case 101:
                              return !1;
                            default:
                              throw this.db.handleError(e);
                          }
                        },
                        K.prototype.getNumber = function (e) {
                          return null == e && (e = this.pos, this.pos += 1),
                            w(this.stmt, e);
                        },
                        K.prototype.getString = function (e) {
                          return null == e && (e = this.pos, this.pos += 1),
                            y(this.stmt, e);
                        },
                        K.prototype.getBlob = function (e) {
                          null == e && (e = this.pos, this.pos += 1);
                          for (
                            var t = k(this.stmt, e),
                              r = E(this.stmt, e),
                              n = new Uint8Array(t),
                              o = 0;
                            o < t;
                            o += 1
                          ) n[o] = q[r + o];
                          return n;
                        },
                        K.prototype.get = function (e) {
                          null != e && this.bind(e) && this.step();
                          for (
                            var t = [], r = g(this.stmt), n = 0;
                            n < r;
                            n += 1
                          ) {
                            switch (S(this.stmt, n)) {
                              case 1:
                              case 2:
                                t.push(this.getNumber(n));
                                break;
                              case 3:
                                t.push(this.getString(n));
                                break;
                              case 4:
                                t.push(this.getBlob(n));
                                break;
                              default:
                                t.push(null);
                            }
                          }
                          return t;
                        },
                        K.prototype.getColumnNames = function () {
                          for (
                            var e = [], t = b(this.stmt), r = 0;
                            r < t;
                            r += 1
                          ) e.push(x(this.stmt, r));
                          return e;
                        },
                        K.prototype.getAsObject = function (e) {
                          for (
                            var t = this.get(e),
                              r = this.getColumnNames(),
                              n = {},
                              o = 0;
                            o < r.length;
                            o += 1
                          ) n[r[o]] = t[o];
                          return n;
                        },
                        K.prototype.getSQL = function () {
                          return u(this.stmt);
                        },
                        K.prototype.getNormalizedSQL = function () {
                          return l(this.stmt);
                        },
                        K.prototype.run = function (e) {
                          return null != e && this.bind(e),
                            this.step(),
                            this.reset();
                        },
                        K.prototype.bindString = function (e, t) {
                          null == t && (t = this.pos, this.pos += 1);
                          var r = ue(e), n = Ae(r, Fe);
                          return this.allocatedmem.push(n),
                            this.db.handleError(
                              d(this.stmt, t, n, r.length - 1, 0),
                            ),
                            !0;
                        },
                        K.prototype.bindBlob = function (e, t) {
                          null == t && (t = this.pos, this.pos += 1);
                          var r = Ae(e, Fe);
                          return this.allocatedmem.push(r),
                            this.db.handleError(
                              f(this.stmt, t, r, e.length, 0),
                            ),
                            !0;
                        },
                        K.prototype.bindNumber = function (e, t) {
                          null == t && (t = this.pos, this.pos += 1);
                          var r = e === (0 | e) ? m : h;
                          return this.db.handleError(r(this.stmt, t, e)), !0;
                        },
                        K.prototype.bindNull = function (e) {
                          return null == e && (e = this.pos, this.pos += 1),
                            0 === f(this.stmt, e, 0, 0, 0);
                        },
                        K.prototype.bindValue = function (e, t) {
                          switch (
                            null == t && (t = this.pos, this.pos += 1), typeof e
                          ) {
                            case "string":
                              return this.bindString(e, t);
                            case "number":
                            case "boolean":
                              return this.bindNumber(e + 0, t);
                            case "object":
                              if (null === e) return this.bindNull(t);
                              if (null != e.length) {
                                return this.bindBlob(e, t);
                              }
                          }
                          throw "Wrong API use : tried to bind a value of an unknown type (" +
                            e + ").";
                        },
                        K.prototype.bindFromObject = function (e) {
                          var t = this;
                          return Object.keys(e).forEach(function (r) {
                            var n = p(t.stmt, r);
                            0 !== n && t.bindValue(e[r], n);
                          }),
                            !0;
                        },
                        K.prototype.bindFromArray = function (e) {
                          for (var t = 0; t < e.length; t += 1) {
                            this.bindValue(e[t], t + 1);
                          }
                          return !0;
                        },
                        K.prototype.reset = function () {
                          return this.freemem(),
                            0 === D(this.stmt) && 0 === M(this.stmt);
                        },
                        K.prototype.freemem = function () {
                          for (
                            var e;
                            void 0 !== (e = this.allocatedmem.pop());
                          ) {
                            Le(e);
                          }
                        },
                        K.prototype.free = function () {
                          var e;
                          return this.freemem(),
                            e = 0 === F(this.stmt),
                            delete this.db.statements[this.stmt],
                            this.stmt = 0,
                            e;
                        },
                        Y.prototype.next = function () {
                          if (null === this.sqlPtr) return { done: !0 };
                          if (
                            null !== this.activeStatement &&
                            (this.activeStatement.free(),
                              this.activeStatement = null), !this.db.db
                          ) {
                            throw this.finalize(), new Error("Database closed");
                          }
                          var t = Ne(), r = Ie(4);
                          ie(e, 0, "i32"), ie(r, 0, "i32");
                          try {
                            this.db.handleError(
                              c(this.db.db, this.nextSqlPtr, -1, e, r),
                            ), this.nextSqlPtr = oe(r, "i32");
                            var n = oe(e, "i32");
                            return 0 === n
                              ? (this.finalize(), { done: !0 })
                              : (this.activeStatement = new K(n, this.db),
                                this.db.statements[n] = this.activeStatement,
                                { value: this.activeStatement, done: !1 });
                          } catch (e) {
                            throw this.nextSqlString = T(this.nextSqlPtr),
                              this.finalize(),
                              e;
                          } finally {
                            He(t);
                          }
                        },
                        Y.prototype.finalize = function () {
                          Le(this.sqlPtr), this.sqlPtr = null;
                        },
                        Y.prototype.getRemainingSQL = function () {
                          return null !== this.nextSqlString
                            ? this.nextSqlString
                            : T(this.nextSqlPtr);
                        },
                        "function" == typeof Symbol &&
                        "symbol" == typeof Symbol.iterator &&
                        (Y.prototype[Symbol.iterator] = function () {
                          return this;
                        }),
                        Q.prototype.run = function (t, r) {
                          if (!this.db) throw "Database closed";
                          if (r) {
                            var n = this.prepare(t, r);
                            try {
                              n.step();
                            } finally {
                              n.free();
                            }
                          } else this.handleError(o(this.db, t, 0, 0, e));
                          return this;
                        },
                        Q.prototype.exec = function (t, r) {
                          if (!this.db) throw "Database closed";
                          var n, o, i, s = Ne(), a = null;
                          try {
                            for (
                              var u =
                                  (o = L(n = t) + 1,
                                    i = Ie(o),
                                    C(n, q, i, o),
                                    i),
                                l = Ie(4),
                                d = [];
                              0 !== oe(u, "i8");
                            ) {
                              ie(e, 0, "i32"),
                                ie(l, 0, "i32"),
                                this.handleError(c(this.db, u, -1, e, l));
                              var f = oe(e, "i32");
                              if (u = oe(l, "i32"), 0 !== f) {
                                var h = null;
                                for (
                                  a = new K(f, this), null != r && a.bind(r);
                                  a.step();
                                ) {
                                  null === h &&
                                  (h = {
                                    columns: a.getColumnNames(),
                                    values: [],
                                  },
                                    d.push(h)), h.values.push(a.get());
                                }
                                a.free();
                              }
                            }
                            return d;
                          } catch (e) {
                            throw a && a.free(), e;
                          } finally {
                            He(s);
                          }
                        },
                        Q.prototype.each = function (e, t, r, n) {
                          var o;
                          "function" == typeof t && (n = r, r = t, t = void 0),
                            o = this.prepare(e, t);
                          try {
                            for (; o.step();) r(o.getAsObject());
                          } finally {
                            o.free();
                          }
                          if ("function" == typeof n) return n();
                        },
                        Q.prototype.prepare = function (t, r) {
                          ie(e, 0, "i32"),
                            this.handleError(a(this.db, t, -1, e, 0));
                          var n = oe(e, "i32");
                          if (0 === n) throw "Nothing to prepare";
                          var o = new K(n, this);
                          return null != r && o.bind(r),
                            this.statements[n] = o,
                            o;
                        },
                        Q.prototype.iterateStatements = function (e) {
                          return new Y(e, this);
                        },
                        Q.prototype.export = function () {
                          Object.values(this.statements).forEach(function (e) {
                            e.free();
                          }),
                            Object.values(this.functions).forEach(De),
                            this.functions = {},
                            this.handleError(n(this.db));
                          var t = he.readFile(this.filename, {
                            encoding: "binary",
                          });
                          return this.handleError(r(this.filename, e)),
                            this.db = oe(e, "i32"),
                            t;
                        },
                        Q.prototype.close = function () {
                          null !== this.db &&
                            (Object.values(this.statements).forEach(
                              function (e) {
                                e.free();
                              },
                            ),
                              Object.values(this.functions).forEach(De),
                              this.functions = {},
                              this.handleError(n(this.db)),
                              he.unlink("/" + this.filename),
                              this.db = null);
                        },
                        Q.prototype.handleError = function (e) {
                          var t;
                          if (0 === e) return null;
                          throw t = v(this.db),
                            new Error("SQLite: " + (t || "Code " + e));
                        },
                        Q.prototype.getRowsModified = function () {
                          return s(this.db);
                        },
                        Q.prototype.create_function = function (e, t) {
                          Object.prototype.hasOwnProperty.call(
                            this.functions,
                            e,
                          ) &&
                            (De(this.functions[e]), delete this.functions[e]);
                          var r = Me(function (e, r, n) {
                            for (var o, s = [], a = 0; a < r; a += 1) {
                              s.push(i.extract_value(n + 4 * a));
                            }
                            try {
                              o = t.apply(null, s);
                            } catch (t) {
                              return void X(e, "JS threw: " + t, -1);
                            }
                            i.set_return_value(e, o);
                          }, "viii");
                          return this.functions[e] = r,
                            this.handleError(
                              P(this.db, e, t.length, 1, 0, r, 0, 0, 0),
                            ),
                            this;
                        },
                        i.extract_value = function (e) {
                          var t = oe(e, "i32"), r = R(t);
                          return 1 === r || 2 === r
                            ? N(t)
                            : 3 === r
                            ? j(t)
                            : 4 === r
                            ? function (e) {
                              for (
                                var t = z(e),
                                  r = B(e),
                                  n = new Uint8Array(t),
                                  o = 0;
                                o < t;
                                o += 1
                              ) n[o] = q[r + o];
                              return n;
                            }(t)
                            : null;
                        },
                        i.set_return_value = function (e, t) {
                          switch (typeof t) {
                            case "boolean":
                              W(e, t ? 1 : 0);
                              break;
                            case "number":
                              H(e, t);
                              break;
                            case "string":
                              U(e, t, -1, -1);
                              break;
                            case "object":
                              if (null === t) I(e);
                              else if (null != t.length) {
                                var r = Ae(t, Fe);
                                V(e, r, t.length, -1), Le(r);
                              } else {X(
                                  e,
                                  "Wrong API use : tried to return a value of an unknown type (" +
                                    t + ").",
                                  -1,
                                );}
                              break;
                            default:
                              console.warn(
                                "unknown sqlite result type: ",
                                typeof t,
                                t,
                              ), I(e);
                          }
                        },
                        Q.prototype.create_vtab = function (e) {
                          const t = new e(i, this),
                            r = {
                              iVersion: null,
                              xCreate: "ptr",
                              xConnect: "ptr",
                              xBestIndex: "ptr",
                              xDisconnect: "ptr",
                              xDestroy: "ptr",
                              xOpen: "ptr",
                              xClose: "ptr",
                              xFilter: "ptr",
                              xNext: "ptr",
                              xEof: "ptr",
                              xColumn: "ptr",
                              xRowid: "ptr",
                              xUpdate: "ptr",
                              xBegin: "ptr",
                              xSync: "ptr",
                              xCommit: "ptr",
                              xRollback: "ptr",
                              xFindFunction: "ptr",
                              xRename: "ptr",
                              xSavepoint: "ptr",
                              xRelease: "ptr",
                              xRollbackTo: "ptr",
                              xShadowName: "ptr",
                            },
                            n = Oe(4 * Object.keys(r).length);
                          let o = 0;
                          for (const e in r) {
                            let i = t[e] || 0, s = "i32";
                            if (r[e] && t[e]) {
                              const r = t[e].bind(t);
                              i = Me(r, Array(1 + r.length).fill("i").join("")),
                                s = "*";
                            }
                            ie(n + 4 * o, i, s), o++;
                          }
                          this.handleError(A(this.db, t.name, n, 0, 0));
                        },
                        i.Database = Q,
                        i.CustomDatabase = J,
                        i.FS = he,
                        J.prototype = Object.create(Q.prototype);
                    };
                var a,
                  u,
                  l,
                  c,
                  d,
                  f,
                  h = Object.assign({}, i),
                  m = [],
                  p = "./this.program",
                  _ = "object" == typeof window,
                  v = "function" == typeof importScripts,
                  b = "object" == typeof process &&
                    "object" == typeof process.versions &&
                    "string" == typeof process.versions.node,
                  g = "";
                b
                  ? (g = v ? r(101).dirname(g) + "/" : "//",
                    f = () => {
                      d || (c = r(905), d = r(101));
                    },
                    a = function (e, t) {
                      return f(),
                        e = d.normalize(e),
                        c.readFileSync(e, t ? void 0 : "utf8");
                    },
                    l = (e) => {
                      var t = a(e, !0);
                      return t.buffer || (t = new Uint8Array(t)), t;
                    },
                    u = (e, t, r) => {
                      f(),
                        e = d.normalize(e),
                        c.readFile(e, function (e, n) {
                          e ? r(e) : t(n.buffer);
                        });
                    },
                    process.argv.length > 1 &&
                    (p = process.argv[1].replace(/\\/g, "/")),
                    m = process.argv.slice(2),
                    e.exports = i,
                    i.inspect = function () {
                      return "[Emscripten Module object]";
                    })
                  : (_ || v) &&
                    (v
                      ? g = self.location.href
                      : "undefined" != typeof document &&
                        document.currentScript &&
                        (g = document.currentScript.src),
                      g = 0 !== g.indexOf("blob:")
                        ? g.substr(
                          0,
                          g.replace(/[?#].*/, "").lastIndexOf("/") + 1,
                        )
                        : "",
                      a = (e) => {
                        var t = new XMLHttpRequest();
                        return t.open("GET", e, !1),
                          t.send(null),
                          t.responseText;
                      },
                      v && (l = (e) => {
                        var t = new XMLHttpRequest();
                        return t.open("GET", e, !1),
                          t.responseType = "arraybuffer",
                          t.send(null),
                          new Uint8Array(t.response);
                      }),
                      u = (e, t, r) => {
                        var n = new XMLHttpRequest();
                        n.open("GET", e, !0),
                          n.responseType = "arraybuffer",
                          n.onload = () => {
                            200 == n.status || 0 == n.status && n.response
                              ? t(n.response)
                              : r();
                          },
                          n.onerror = r,
                          n.send(null);
                      });
                var w,
                  y = i.print || console.log.bind(console),
                  E = i.printErr || console.warn.bind(console);
                Object.assign(i, h),
                  h = null,
                  i.arguments && (m = i.arguments),
                  i.thisProgram && (p = i.thisProgram),
                  i.quit && i.quit,
                  i.wasmBinary && (w = i.wasmBinary);
                var k;
                i.noExitRuntime;
                "object" != typeof WebAssembly &&
                  Z("no native wasm support detected");
                var S,
                  q,
                  x,
                  M,
                  D,
                  F,
                  A,
                  P,
                  R = !1,
                  z = "undefined" != typeof TextDecoder
                    ? new TextDecoder("utf8")
                    : void 0;
                function j(e, t, r) {
                  for (var n = t + r, o = t; e[o] && !(o >= n);) ++o;
                  if (o - t > 16 && e.buffer && z) {
                    return z.decode(e.subarray(t, o));
                  }
                  for (var i = ""; t < o;) {
                    var s = e[t++];
                    if (128 & s) {
                      var a = 63 & e[t++];
                      if (192 != (224 & s)) {
                        var u = 63 & e[t++];
                        if (
                          (s = 224 == (240 & s)
                            ? (15 & s) << 12 | a << 6 | u
                            : (7 & s) << 18 | a << 12 | u << 6 | 63 & e[t++]) <
                            65536
                        ) i += String.fromCharCode(s);
                        else {
                          var l = s - 65536;
                          i += String.fromCharCode(
                            55296 | l >> 10,
                            56320 | 1023 & l,
                          );
                        }
                      } else i += String.fromCharCode((31 & s) << 6 | a);
                    } else i += String.fromCharCode(s);
                  }
                  return i;
                }
                function T(e, t) {
                  return e ? j(x, e, t) : "";
                }
                function C(e, t, r, n) {
                  if (!(n > 0)) return 0;
                  for (var o = r, i = r + n - 1, s = 0; s < e.length; ++s) {
                    var a = e.charCodeAt(s);
                    if (
                      a >= 55296 && a <= 57343 &&
                      (a = 65536 + ((1023 & a) << 10) |
                        1023 & e.charCodeAt(++s)), a <= 127
                    ) {
                      if (r >= i) break;
                      t[r++] = a;
                    } else if (a <= 2047) {
                      if (r + 1 >= i) break;
                      t[r++] = 192 | a >> 6, t[r++] = 128 | 63 & a;
                    } else if (a <= 65535) {
                      if (r + 2 >= i) break;
                      t[r++] = 224 | a >> 12,
                        t[r++] = 128 | a >> 6 & 63,
                        t[r++] = 128 | 63 & a;
                    } else {
                      if (r + 3 >= i) break;
                      t[r++] = 240 | a >> 18,
                        t[r++] = 128 | a >> 12 & 63,
                        t[r++] = 128 | a >> 6 & 63,
                        t[r++] = 128 | 63 & a;
                    }
                  }
                  return t[r] = 0, r - o;
                }
                function O(e, t, r) {
                  return C(e, x, t, r);
                }
                function L(e) {
                  for (var t = 0, r = 0; r < e.length; ++r) {
                    var n = e.charCodeAt(r);
                    n <= 127
                      ? t++
                      : n <= 2047
                      ? t += 2
                      : n >= 55296 && n <= 57343
                      ? (t += 4, ++r)
                      : t += 3;
                  }
                  return t;
                }
                function B(e) {
                  S = e,
                    i.HEAP8 = q = new Int8Array(e),
                    i.HEAP16 = M = new Int16Array(e),
                    i.HEAP32 = D = new Int32Array(e),
                    i.HEAPU8 = x = new Uint8Array(e),
                    i.HEAPU16 = new Uint16Array(e),
                    i.HEAPU32 = F = new Uint32Array(e),
                    i.HEAPF32 = A = new Float32Array(e),
                    i.HEAPF64 = P = new Float64Array(e);
                }
                i.INITIAL_MEMORY;
                var N,
                  H,
                  I,
                  U,
                  V,
                  W = [],
                  X = [],
                  G = [],
                  $ = 0,
                  K = null,
                  Y = null;
                function Q(e) {
                  $++, i.monitorRunDependencies && i.monitorRunDependencies($);
                }
                function J(e) {
                  if (
                    $--,
                      i.monitorRunDependencies && i.monitorRunDependencies($),
                      0 == $ && (null !== K && (clearInterval(K), K = null), Y)
                  ) {
                    var t = Y;
                    Y = null, t();
                  }
                }
                function Z(e) {
                  throw i.onAbort && i.onAbort(e),
                    E(e = "Aborted(" + e + ")"),
                    R = !0,
                    e += ". Build with -sASSERTIONS for more info.",
                    new WebAssembly.RuntimeError(e);
                }
                function ee(e) {
                  return e.startsWith("data:application/octet-stream;base64,");
                }
                function te(e) {
                  return e.startsWith("file://");
                }
                function re(e) {
                  try {
                    if (e == H && w) return new Uint8Array(w);
                    if (l) return l(e);
                    throw "both async and sync fetching of the wasm failed";
                  } catch (e) {
                    Z(e);
                  }
                }
                function ne(e) {
                  for (; e.length > 0;) e.shift()(i);
                }
                function oe(e, t = "i8") {
                  switch (t.endsWith("*") && (t = "*"), t) {
                    case "i1":
                    case "i8":
                      return q[e >> 0];
                    case "i16":
                      return M[e >> 1];
                    case "i32":
                    case "i64":
                      return D[e >> 2];
                    case "float":
                      return A[e >> 2];
                    case "double":
                      return P[e >> 3];
                    case "*":
                      return F[e >> 2];
                    default:
                      Z("invalid type for getValue: " + t);
                  }
                  return null;
                }
                function ie(e, t, r = "i8") {
                  switch (r.endsWith("*") && (r = "*"), r) {
                    case "i1":
                    case "i8":
                      q[e >> 0] = t;
                      break;
                    case "i16":
                      M[e >> 1] = t;
                      break;
                    case "i32":
                      D[e >> 2] = t;
                      break;
                    case "i64":
                      V = [
                        t >>> 0,
                        (U = t,
                          +Math.abs(U) >= 1
                            ? U > 0
                              ? (0 |
                                Math.min(
                                  +Math.floor(U / 4294967296),
                                  4294967295,
                                )) >>> 0
                              : ~~+Math.ceil(
                                (U - +(~~U >>> 0)) / 4294967296,
                              ) >>> 0
                            : 0),
                      ],
                        D[e >> 2] = V[0],
                        D[e + 4 >> 2] = V[1];
                      break;
                    case "float":
                      A[e >> 2] = t;
                      break;
                    case "double":
                      P[e >> 3] = t;
                      break;
                    case "*":
                      F[e >> 2] = t;
                      break;
                    default:
                      Z("invalid type for setValue: " + r);
                  }
                }
                ee(H = "sql-wasm.wasm") ||
                  (I = H, H = i.locateFile ? i.locateFile(I, g) : g + I);
                var se = {
                    isAbs: (e) => "/" === e.charAt(0),
                    splitPath: (e) =>
                      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
                        .exec(e).slice(1),
                    normalizeArray: (e, t) => {
                      for (var r = 0, n = e.length - 1; n >= 0; n--) {
                        var o = e[n];
                        "." === o
                          ? e.splice(n, 1)
                          : ".." === o
                          ? (e.splice(n, 1), r++)
                          : r && (e.splice(n, 1), r--);
                      }
                      if (t) { for (; r; r--) e.unshift(".."); }
                      return e;
                    },
                    normalize: (e) => {
                      var t = se.isAbs(e), r = "/" === e.substr(-1);
                      return (e = se.normalizeArray(
                        e.split("/").filter((e) => !!e),
                        !t,
                      ).join("/")) || t || (e = "."),
                        e && r && (e += "/"),
                        (t ? "/" : "") + e;
                    },
                    dirname: (e) => {
                      var t = se.splitPath(e), r = t[0], n = t[1];
                      return r || n
                        ? (n && (n = n.substr(0, n.length - 1)), r + n)
                        : ".";
                    },
                    basename: (e) => {
                      if ("/" === e) return "/";
                      var t = (e = (e = se.normalize(e)).replace(/\/$/, ""))
                        .lastIndexOf("/");
                      return -1 === t ? e : e.substr(t + 1);
                    },
                    join: function () {
                      var e = Array.prototype.slice.call(arguments);
                      return se.normalize(e.join("/"));
                    },
                    join2: (e, t) => se.normalize(e + "/" + t),
                  },
                  ae = {
                    resolve: function () {
                      for (
                        var e = "", t = !1, r = arguments.length - 1;
                        r >= -1 && !t;
                        r--
                      ) {
                        var n = r >= 0 ? arguments[r] : he.cwd();
                        if ("string" != typeof n) {
                          throw new TypeError(
                            "Arguments to path.resolve must be strings",
                          );
                        }
                        if (!n) return "";
                        e = n + "/" + e, t = se.isAbs(n);
                      }
                      return (t ? "/" : "") +
                          (e = se.normalizeArray(
                            e.split("/").filter((e) => !!e),
                            !t,
                          ).join("/")) || ".";
                    },
                    relative: (e, t) => {
                      function r(e) {
                        for (var t = 0; t < e.length && "" === e[t]; t++);
                        for (var r = e.length - 1; r >= 0 && "" === e[r]; r--);
                        return t > r ? [] : e.slice(t, r - t + 1);
                      }
                      e = ae.resolve(e).substr(1), t = ae.resolve(t).substr(1);
                      for (
                        var n = r(e.split("/")),
                          o = r(t.split("/")),
                          i = Math.min(n.length, o.length),
                          s = i,
                          a = 0;
                        a < i;
                        a++
                      ) {
                        if (n[a] !== o[a]) {
                          s = a;
                          break;
                        }
                      }
                      var u = [];
                      for (a = s; a < n.length; a++) u.push("..");
                      return (u = u.concat(o.slice(s))).join("/");
                    },
                  };
                function ue(e, t, r) {
                  var n = r > 0 ? r : L(e) + 1,
                    o = new Array(n),
                    i = C(e, o, 0, o.length);
                  return t && (o.length = i), o;
                }
                var le = {
                  ttys: [],
                  init: function () {},
                  shutdown: function () {},
                  register: function (e, t) {
                    le.ttys[e] = { input: [], output: [], ops: t },
                      he.registerDevice(e, le.stream_ops);
                  },
                  stream_ops: {
                    open: function (e) {
                      var t = le.ttys[e.node.rdev];
                      if (!t) throw new he.ErrnoError(43);
                      e.tty = t, e.seekable = !1;
                    },
                    close: function (e) {
                      e.tty.ops.fsync(e.tty);
                    },
                    fsync: function (e) {
                      e.tty.ops.fsync(e.tty);
                    },
                    read: function (e, t, r, n, o) {
                      if (!e.tty || !e.tty.ops.get_char) {
                        throw new he.ErrnoError(60);
                      }
                      for (var i = 0, s = 0; s < n; s++) {
                        var a;
                        try {
                          a = e.tty.ops.get_char(e.tty);
                        } catch (e) {
                          throw new he.ErrnoError(29);
                        }
                        if (void 0 === a && 0 === i) throw new he.ErrnoError(6);
                        if (null == a) break;
                        i++, t[r + s] = a;
                      }
                      return i && (e.node.timestamp = Date.now()), i;
                    },
                    write: function (e, t, r, n, o) {
                      if (!e.tty || !e.tty.ops.put_char) {
                        throw new he.ErrnoError(60);
                      }
                      try {
                        for (var i = 0; i < n; i++) {
                          e.tty.ops.put_char(e.tty, t[r + i]);
                        }
                      } catch (e) {
                        throw new he.ErrnoError(29);
                      }
                      return n && (e.node.timestamp = Date.now()), i;
                    },
                  },
                  default_tty_ops: {
                    get_char: function (e) {
                      if (!e.input.length) {
                        var t = null;
                        if (b) {
                          var r = Buffer.alloc(256), n = 0;
                          try {
                            n = c.readSync(process.stdin.fd, r, 0, 256, -1);
                          } catch (e) {
                            if (!e.toString().includes("EOF")) throw e;
                            n = 0;
                          }
                          t = n > 0 ? r.slice(0, n).toString("utf-8") : null;
                        } else {"undefined" != typeof window &&
                              "function" == typeof window.prompt
                            ? null !== (t = window.prompt("Input: ")) &&
                              (t += "\n")
                            : "function" == typeof readline &&
                              null !== (t = readline()) && (t += "\n");}
                        if (!t) return null;
                        e.input = ue(t, !0);
                      }
                      return e.input.shift();
                    },
                    put_char: function (e, t) {
                      null === t || 10 === t
                        ? (y(j(e.output, 0)), e.output = [])
                        : 0 != t && e.output.push(t);
                    },
                    fsync: function (e) {
                      e.output && e.output.length > 0 &&
                        (y(j(e.output, 0)), e.output = []);
                    },
                  },
                  default_tty1_ops: {
                    put_char: function (e, t) {
                      null === t || 10 === t
                        ? (E(j(e.output, 0)), e.output = [])
                        : 0 != t && e.output.push(t);
                    },
                    fsync: function (e) {
                      e.output && e.output.length > 0 &&
                        (E(j(e.output, 0)), e.output = []);
                    },
                  },
                };
                function ce(e) {
                  e = function (e, t) {
                    return 65536 * Math.ceil(e / 65536);
                  }(e);
                  var t = Be(65536, e);
                  return t
                    ? function (e, t) {
                      return x.fill(0, e, e + t), e;
                    }(t, e)
                    : 0;
                }
                var de = {
                  ops_table: null,
                  mount: function (e) {
                    return de.createNode(null, "/", 16895, 0);
                  },
                  createNode: function (e, t, r, n) {
                    if (he.isBlkdev(r) || he.isFIFO(r)) {
                      throw new he.ErrnoError(63);
                    }
                    de.ops_table || (de.ops_table = {
                      dir: {
                        node: {
                          getattr: de.node_ops.getattr,
                          setattr: de.node_ops.setattr,
                          lookup: de.node_ops.lookup,
                          mknod: de.node_ops.mknod,
                          rename: de.node_ops.rename,
                          unlink: de.node_ops.unlink,
                          rmdir: de.node_ops.rmdir,
                          readdir: de.node_ops.readdir,
                          symlink: de.node_ops.symlink,
                        },
                        stream: { llseek: de.stream_ops.llseek },
                      },
                      file: {
                        node: {
                          getattr: de.node_ops.getattr,
                          setattr: de.node_ops.setattr,
                        },
                        stream: {
                          llseek: de.stream_ops.llseek,
                          read: de.stream_ops.read,
                          write: de.stream_ops.write,
                          allocate: de.stream_ops.allocate,
                          mmap: de.stream_ops.mmap,
                          msync: de.stream_ops.msync,
                        },
                      },
                      link: {
                        node: {
                          getattr: de.node_ops.getattr,
                          setattr: de.node_ops.setattr,
                          readlink: de.node_ops.readlink,
                        },
                        stream: {},
                      },
                      chrdev: {
                        node: {
                          getattr: de.node_ops.getattr,
                          setattr: de.node_ops.setattr,
                        },
                        stream: he.chrdev_stream_ops,
                      },
                    });
                    var o = he.createNode(e, t, r, n);
                    return he.isDir(o.mode)
                      ? (o.node_ops = de.ops_table.dir.node,
                        o.stream_ops = de.ops_table.dir.stream,
                        o.contents = {})
                      : he.isFile(o.mode)
                      ? (o.node_ops = de.ops_table.file.node,
                        o.stream_ops = de.ops_table.file.stream,
                        o.usedBytes = 0,
                        o.contents = null)
                      : he.isLink(o.mode)
                      ? (o.node_ops = de.ops_table.link.node,
                        o.stream_ops = de.ops_table.link.stream)
                      : he.isChrdev(o.mode) &&
                        (o.node_ops = de.ops_table.chrdev.node,
                          o.stream_ops = de.ops_table.chrdev.stream),
                      o.timestamp = Date.now(),
                      e && (e.contents[t] = o, e.timestamp = o.timestamp),
                      o;
                  },
                  getFileDataAsTypedArray: function (e) {
                    return e.contents
                      ? e.contents.subarray
                        ? e.contents.subarray(0, e.usedBytes)
                        : new Uint8Array(e.contents)
                      : new Uint8Array(0);
                  },
                  expandFileStorage: function (e, t) {
                    var r = e.contents ? e.contents.length : 0;
                    if (!(r >= t)) {
                      t = Math.max(t, r * (r < 1048576 ? 2 : 1.125) >>> 0),
                        0 != r && (t = Math.max(t, 256));
                      var n = e.contents;
                      e.contents = new Uint8Array(t),
                        e.usedBytes > 0 &&
                        e.contents.set(n.subarray(0, e.usedBytes), 0);
                    }
                  },
                  resizeFileStorage: function (e, t) {
                    if (e.usedBytes != t) {
                      if (0 == t) e.contents = null, e.usedBytes = 0;
                      else {
                        var r = e.contents;
                        e.contents = new Uint8Array(t),
                          r &&
                          e.contents.set(
                            r.subarray(0, Math.min(t, e.usedBytes)),
                          ),
                          e.usedBytes = t;
                      }
                    }
                  },
                  node_ops: {
                    getattr: function (e) {
                      var t = {};
                      return t.dev = he.isChrdev(e.mode) ? e.id : 1,
                        t.ino = e.id,
                        t.mode = e.mode,
                        t.nlink = 1,
                        t.uid = 0,
                        t.gid = 0,
                        t.rdev = e.rdev,
                        he.isDir(e.mode)
                          ? t.size = 4096
                          : he.isFile(e.mode)
                          ? t.size = e.usedBytes
                          : he.isLink(e.mode)
                          ? t.size = e.link.length
                          : t.size = 0,
                        t.atime = new Date(e.timestamp),
                        t.mtime = new Date(e.timestamp),
                        t.ctime = new Date(e.timestamp),
                        t.blksize = 4096,
                        t.blocks = Math.ceil(t.size / t.blksize),
                        t;
                    },
                    setattr: function (e, t) {
                      void 0 !== t.mode && (e.mode = t.mode),
                        void 0 !== t.timestamp && (e.timestamp = t.timestamp),
                        void 0 !== t.size && de.resizeFileStorage(e, t.size);
                    },
                    lookup: function (e, t) {
                      throw he.genericErrors[44];
                    },
                    mknod: function (e, t, r, n) {
                      return de.createNode(e, t, r, n);
                    },
                    rename: function (e, t, r) {
                      if (he.isDir(e.mode)) {
                        var n;
                        try {
                          n = he.lookupNode(t, r);
                        } catch (e) {}
                        if (n) {
                          for (var o in n.contents) {
                            throw new he.ErrnoError(55);
                          }
                        }
                      }
                      delete e.parent.contents[e.name],
                        e.parent.timestamp = Date.now(),
                        e.name = r,
                        t.contents[r] = e,
                        t.timestamp = e.parent.timestamp,
                        e.parent = t;
                    },
                    unlink: function (e, t) {
                      delete e.contents[t], e.timestamp = Date.now();
                    },
                    rmdir: function (e, t) {
                      var r = he.lookupNode(e, t);
                      for (var n in r.contents) throw new he.ErrnoError(55);
                      delete e.contents[t], e.timestamp = Date.now();
                    },
                    readdir: function (e) {
                      var t = [".", ".."];
                      for (var r in e.contents) {
                        e.contents.hasOwnProperty(r) && t.push(r);
                      }
                      return t;
                    },
                    symlink: function (e, t, r) {
                      var n = de.createNode(e, t, 41471, 0);
                      return n.link = r, n;
                    },
                    readlink: function (e) {
                      if (!he.isLink(e.mode)) throw new he.ErrnoError(28);
                      return e.link;
                    },
                  },
                  stream_ops: {
                    read: function (e, t, r, n, o) {
                      var i = e.node.contents;
                      if (o >= e.node.usedBytes) return 0;
                      var s = Math.min(e.node.usedBytes - o, n);
                      if (s > 8 && i.subarray) t.set(i.subarray(o, o + s), r);
                      else for (var a = 0; a < s; a++) t[r + a] = i[o + a];
                      return s;
                    },
                    write: function (e, t, r, n, o, i) {
                      if (t.buffer === q.buffer && (i = !1), !n) return 0;
                      var s = e.node;
                      if (
                        s.timestamp = Date.now(),
                          t.subarray && (!s.contents || s.contents.subarray)
                      ) {
                        if (i) {
                          return s.contents = t.subarray(r, r + n),
                            s.usedBytes = n,
                            n;
                        }
                        if (0 === s.usedBytes && 0 === o) {
                          return s.contents = t.slice(r, r + n),
                            s.usedBytes = n,
                            n;
                        }
                        if (o + n <= s.usedBytes) {
                          return s.contents.set(t.subarray(r, r + n), o), n;
                        }
                      }
                      if (
                        de.expandFileStorage(s, o + n),
                          s.contents.subarray && t.subarray
                      ) s.contents.set(t.subarray(r, r + n), o);
                      else {for (var a = 0; a < n; a++) {
                          s.contents[o + a] = t[r + a];
                        }}
                      return s.usedBytes = Math.max(s.usedBytes, o + n), n;
                    },
                    llseek: function (e, t, r) {
                      var n = t;
                      if (
                        1 === r
                          ? n += e.position
                          : 2 === r && he.isFile(e.node.mode) &&
                            (n += e.node.usedBytes), n < 0
                      ) throw new he.ErrnoError(28);
                      return n;
                    },
                    allocate: function (e, t, r) {
                      de.expandFileStorage(e.node, t + r),
                        e.node.usedBytes = Math.max(e.node.usedBytes, t + r);
                    },
                    mmap: function (e, t, r, n, o) {
                      if (!he.isFile(e.node.mode)) throw new he.ErrnoError(43);
                      var i, s, a = e.node.contents;
                      if (2 & o || a.buffer !== S) {
                        if (
                          (r > 0 || r + t < a.length) &&
                          (a = a.subarray
                            ? a.subarray(r, r + t)
                            : Array.prototype.slice.call(a, r, r + t)),
                            s = !0,
                            !(i = ce(t))
                        ) throw new he.ErrnoError(48);
                        q.set(a, i);
                      } else s = !1, i = a.byteOffset;
                      return { ptr: i, allocated: s };
                    },
                    msync: function (e, t, r, n, o) {
                      if (!he.isFile(e.node.mode)) throw new he.ErrnoError(43);
                      return 2 & o || de.stream_ops.write(e, t, 0, n, r, !1), 0;
                    },
                  },
                };
                var fe,
                  he = {
                    root: null,
                    mounts: [],
                    devices: {},
                    streams: [],
                    nextInode: 1,
                    nameTable: null,
                    currentPath: "/",
                    initialized: !1,
                    ignorePermissions: !0,
                    ErrnoError: null,
                    genericErrors: {},
                    filesystems: null,
                    syncFSRequests: 0,
                    lookupPath: (e, t = {}) => {
                      if (!(e = ae.resolve(he.cwd(), e))) {
                        return { path: "", node: null };
                      }
                      if (
                        (t = Object.assign({
                          follow_mount: !0,
                          recurse_count: 0,
                        }, t)).recurse_count > 8
                      ) throw new he.ErrnoError(32);
                      for (
                        var r = se.normalizeArray(
                            e.split("/").filter((e) => !!e),
                            !1,
                          ),
                          n = he.root,
                          o = "/",
                          i = 0;
                        i < r.length;
                        i++
                      ) {
                        var s = i === r.length - 1;
                        if (s && t.parent) break;
                        if (
                          n = he.lookupNode(n, r[i]),
                            o = se.join2(o, r[i]),
                            he.isMountpoint(n) && (!s || s && t.follow_mount) &&
                            (n = n.mounted.root),
                            !s || t.follow
                        ) {
                          for (var a = 0; he.isLink(n.mode);) {
                            var u = he.readlink(o);
                            if (
                              o = ae.resolve(se.dirname(o), u),
                                n = he.lookupPath(o, {
                                  recurse_count: t.recurse_count + 1,
                                }).node,
                                a++ > 40
                            ) throw new he.ErrnoError(32);
                          }
                        }
                      }
                      return { path: o, node: n };
                    },
                    getPath: (e) => {
                      for (var t;;) {
                        if (he.isRoot(e)) {
                          var r = e.mount.mountpoint;
                          return t
                            ? "/" !== r[r.length - 1] ? r + "/" + t : r + t
                            : r;
                        }
                        t = t ? e.name + "/" + t : e.name, e = e.parent;
                      }
                    },
                    hashName: (e, t) => {
                      for (var r = 0, n = 0; n < t.length; n++) {
                        r = (r << 5) - r + t.charCodeAt(n) | 0;
                      }
                      return (e + r >>> 0) % he.nameTable.length;
                    },
                    hashAddNode: (e) => {
                      var t = he.hashName(e.parent.id, e.name);
                      e.name_next = he.nameTable[t], he.nameTable[t] = e;
                    },
                    hashRemoveNode: (e) => {
                      var t = he.hashName(e.parent.id, e.name);
                      if (he.nameTable[t] === e) he.nameTable[t] = e.name_next;
                      else {for (var r = he.nameTable[t]; r;) {
                          if (r.name_next === e) {
                            r.name_next = e.name_next;
                            break;
                          }
                          r = r.name_next;
                        }}
                    },
                    lookupNode: (e, t) => {
                      var r = he.mayLookup(e);
                      if (r) throw new he.ErrnoError(r, e);
                      for (
                        var n = he.hashName(e.id, t), o = he.nameTable[n];
                        o;
                        o = o.name_next
                      ) {
                        var i = o.name;
                        if (o.parent.id === e.id && i === t) return o;
                      }
                      return he.lookup(e, t);
                    },
                    createNode: (e, t, r, n) => {
                      var o = new he.FSNode(e, t, r, n);
                      return he.hashAddNode(o), o;
                    },
                    destroyNode: (e) => {
                      he.hashRemoveNode(e);
                    },
                    isRoot: (e) => e === e.parent,
                    isMountpoint: (e) => !!e.mounted,
                    isFile: (e) => 32768 == (61440 & e),
                    isDir: (e) => 16384 == (61440 & e),
                    isLink: (e) => 40960 == (61440 & e),
                    isChrdev: (e) => 8192 == (61440 & e),
                    isBlkdev: (e) => 24576 == (61440 & e),
                    isFIFO: (e) => 4096 == (61440 & e),
                    isSocket: (e) => 49152 == (49152 & e),
                    flagModes: {
                      r: 0,
                      "r+": 2,
                      w: 577,
                      "w+": 578,
                      a: 1089,
                      "a+": 1090,
                    },
                    modeStringToFlags: (e) => {
                      var t = he.flagModes[e];
                      if (void 0 === t) {
                        throw new Error("Unknown file open mode: " + e);
                      }
                      return t;
                    },
                    flagsToPermissionString: (e) => {
                      var t = ["r", "w", "rw"][3 & e];
                      return 512 & e && (t += "w"), t;
                    },
                    nodePermissions: (e, t) =>
                      he.ignorePermissions ||
                        (!t.includes("r") || 292 & e.mode) &&
                          (!t.includes("w") || 146 & e.mode) &&
                          (!t.includes("x") || 73 & e.mode)
                        ? 0
                        : 2,
                    mayLookup: (e) =>
                      he.nodePermissions(e, "x") || (e.node_ops.lookup ? 0 : 2),
                    mayCreate: (e, t) => {
                      try {
                        return he.lookupNode(e, t), 20;
                      } catch (e) {}
                      return he.nodePermissions(e, "wx");
                    },
                    mayDelete: (e, t, r) => {
                      var n;
                      try {
                        n = he.lookupNode(e, t);
                      } catch (e) {
                        return e.errno;
                      }
                      var o = he.nodePermissions(e, "wx");
                      if (o) return o;
                      if (r) {
                        if (!he.isDir(n.mode)) return 54;
                        if (he.isRoot(n) || he.getPath(n) === he.cwd()) {
                          return 10;
                        }
                      } else if (he.isDir(n.mode)) return 31;
                      return 0;
                    },
                    mayOpen: (e, t) =>
                      e
                        ? he.isLink(e.mode) ? 32 : he.isDir(e.mode) &&
                            ("r" !== he.flagsToPermissionString(t) || 512 & t)
                          ? 31
                          : he.nodePermissions(e, he.flagsToPermissionString(t))
                        : 44,
                    MAX_OPEN_FDS: 4096,
                    nextfd: (e = 0, t = he.MAX_OPEN_FDS) => {
                      for (var r = e; r <= t; r++) if (!he.streams[r]) return r;
                      throw new he.ErrnoError(33);
                    },
                    getStream: (e) => he.streams[e],
                    createStream: (e, t, r) => {
                      he.FSStream || (he.FSStream = function () {
                        this.shared = {};
                      },
                        he.FSStream.prototype = {},
                        Object.defineProperties(he.FSStream.prototype, {
                          object: {
                            get: function () {
                              return this.node;
                            },
                            set: function (e) {
                              this.node = e;
                            },
                          },
                          isRead: {
                            get: function () {
                              return 1 != (2097155 & this.flags);
                            },
                          },
                          isWrite: {
                            get: function () {
                              return 0 != (2097155 & this.flags);
                            },
                          },
                          isAppend: {
                            get: function () {
                              return 1024 & this.flags;
                            },
                          },
                          flags: {
                            get: function () {
                              return this.shared.flags;
                            },
                            set: function (e) {
                              this.shared.flags = e;
                            },
                          },
                          position: {
                            get: function () {
                              return this.shared.position;
                            },
                            set: function (e) {
                              this.shared.position = e;
                            },
                          },
                        })), e = Object.assign(new he.FSStream(), e);
                      var n = he.nextfd(t, r);
                      return e.fd = n, he.streams[n] = e, e;
                    },
                    closeStream: (e) => {
                      he.streams[e] = null;
                    },
                    chrdev_stream_ops: {
                      open: (e) => {
                        var t = he.getDevice(e.node.rdev);
                        e.stream_ops = t.stream_ops,
                          e.stream_ops.open && e.stream_ops.open(e);
                      },
                      llseek: () => {
                        throw new he.ErrnoError(70);
                      },
                    },
                    major: (e) => e >> 8,
                    minor: (e) => 255 & e,
                    makedev: (e, t) => e << 8 | t,
                    registerDevice: (e, t) => {
                      he.devices[e] = { stream_ops: t };
                    },
                    getDevice: (e) => he.devices[e],
                    getMounts: (e) => {
                      for (var t = [], r = [e]; r.length;) {
                        var n = r.pop();
                        t.push(n), r.push.apply(r, n.mounts);
                      }
                      return t;
                    },
                    syncfs: (e, t) => {
                      "function" == typeof e && (t = e, e = !1),
                        he.syncFSRequests++,
                        he.syncFSRequests > 1 &&
                        E(
                          "warning: " + he.syncFSRequests +
                            " FS.syncfs operations in flight at once, probably just doing extra work",
                        );
                      var r = he.getMounts(he.root.mount), n = 0;
                      function o(e) {
                        return he.syncFSRequests--, t(e);
                      }
                      function i(e) {
                        if (e) {
                          return i.errored ? void 0 : (i.errored = !0, o(e));
                        }
                        ++n >= r.length && o(null);
                      }
                      r.forEach((t) => {
                        if (!t.type.syncfs) return i(null);
                        t.type.syncfs(t, e, i);
                      });
                    },
                    mount: (e, t, r) => {
                      var n, o = "/" === r, i = !r;
                      if (o && he.root) throw new he.ErrnoError(10);
                      if (!o && !i) {
                        var s = he.lookupPath(r, { follow_mount: !1 });
                        if (r = s.path, n = s.node, he.isMountpoint(n)) {
                          throw new he.ErrnoError(10);
                        }
                        if (!he.isDir(n.mode)) throw new he.ErrnoError(54);
                      }
                      var a = { type: e, opts: t, mountpoint: r, mounts: [] },
                        u = e.mount(a);
                      return u.mount = a,
                        a.root = u,
                        o ? he.root = u : n &&
                          (n.mounted = a, n.mount && n.mount.mounts.push(a)),
                        u;
                    },
                    unmount: (e) => {
                      var t = he.lookupPath(e, { follow_mount: !1 });
                      if (!he.isMountpoint(t.node)) throw new he.ErrnoError(28);
                      var r = t.node, n = r.mounted, o = he.getMounts(n);
                      Object.keys(he.nameTable).forEach((e) => {
                        for (var t = he.nameTable[e]; t;) {
                          var r = t.name_next;
                          o.includes(t.mount) && he.destroyNode(t), t = r;
                        }
                      }), r.mounted = null;
                      var i = r.mount.mounts.indexOf(n);
                      r.mount.mounts.splice(i, 1);
                    },
                    lookup: (e, t) => e.node_ops.lookup(e, t),
                    mknod: (e, t, r) => {
                      var n = he.lookupPath(e, { parent: !0 }).node,
                        o = se.basename(e);
                      if (!o || "." === o || ".." === o) {
                        throw new he.ErrnoError(28);
                      }
                      var i = he.mayCreate(n, o);
                      if (i) throw new he.ErrnoError(i);
                      if (!n.node_ops.mknod) throw new he.ErrnoError(63);
                      return n.node_ops.mknod(n, o, t, r);
                    },
                    create: (
                      e,
                      t,
                    ) => (t = void 0 !== t ? t : 438,
                      t &= 4095,
                      t |= 32768,
                      he.mknod(e, t, 0)),
                    mkdir: (
                      e,
                      t,
                    ) => (t = void 0 !== t ? t : 511,
                      t &= 1023,
                      t |= 16384,
                      he.mknod(e, t, 0)),
                    mkdirTree: (e, t) => {
                      for (
                        var r = e.split("/"), n = "", o = 0;
                        o < r.length;
                        ++o
                      ) {
                        if (r[o]) {
                          n += "/" + r[o];
                          try {
                            he.mkdir(n, t);
                          } catch (e) {
                            if (20 != e.errno) throw e;
                          }
                        }
                      }
                    },
                    mkdev: (
                      e,
                      t,
                      r,
                    ) => (void 0 === r && (r = t, t = 438),
                      t |= 8192,
                      he.mknod(e, t, r)),
                    symlink: (e, t) => {
                      if (!ae.resolve(e)) throw new he.ErrnoError(44);
                      var r = he.lookupPath(t, { parent: !0 }).node;
                      if (!r) throw new he.ErrnoError(44);
                      var n = se.basename(t), o = he.mayCreate(r, n);
                      if (o) throw new he.ErrnoError(o);
                      if (!r.node_ops.symlink) throw new he.ErrnoError(63);
                      return r.node_ops.symlink(r, n, e);
                    },
                    rename: (e, t) => {
                      var r,
                        n,
                        o = se.dirname(e),
                        i = se.dirname(t),
                        s = se.basename(e),
                        a = se.basename(t);
                      if (
                        r = he.lookupPath(e, { parent: !0 }).node,
                          n = he.lookupPath(t, { parent: !0 }).node,
                          !r || !n
                      ) throw new he.ErrnoError(44);
                      if (r.mount !== n.mount) throw new he.ErrnoError(75);
                      var u, l = he.lookupNode(r, s), c = ae.relative(e, i);
                      if ("." !== c.charAt(0)) throw new he.ErrnoError(28);
                      if ("." !== (c = ae.relative(t, o)).charAt(0)) {
                        throw new he.ErrnoError(55);
                      }
                      try {
                        u = he.lookupNode(n, a);
                      } catch (e) {}
                      if (l !== u) {
                        var d = he.isDir(l.mode), f = he.mayDelete(r, s, d);
                        if (f) throw new he.ErrnoError(f);
                        if (
                          f = u ? he.mayDelete(n, a, d) : he.mayCreate(n, a)
                        ) throw new he.ErrnoError(f);
                        if (!r.node_ops.rename) throw new he.ErrnoError(63);
                        if (he.isMountpoint(l) || u && he.isMountpoint(u)) {
                          throw new he.ErrnoError(10);
                        }
                        if (n !== r && (f = he.nodePermissions(r, "w"))) {
                          throw new he.ErrnoError(f);
                        }
                        he.hashRemoveNode(l);
                        try {
                          r.node_ops.rename(l, n, a);
                        } catch (e) {
                          throw e;
                        } finally {
                          he.hashAddNode(l);
                        }
                      }
                    },
                    rmdir: (e) => {
                      var t = he.lookupPath(e, { parent: !0 }).node,
                        r = se.basename(e),
                        n = he.lookupNode(t, r),
                        o = he.mayDelete(t, r, !0);
                      if (o) throw new he.ErrnoError(o);
                      if (!t.node_ops.rmdir) throw new he.ErrnoError(63);
                      if (he.isMountpoint(n)) throw new he.ErrnoError(10);
                      t.node_ops.rmdir(t, r), he.destroyNode(n);
                    },
                    readdir: (e) => {
                      var t = he.lookupPath(e, { follow: !0 }).node;
                      if (!t.node_ops.readdir) throw new he.ErrnoError(54);
                      return t.node_ops.readdir(t);
                    },
                    unlink: (e) => {
                      var t = he.lookupPath(e, { parent: !0 }).node;
                      if (!t) throw new he.ErrnoError(44);
                      var r = se.basename(e),
                        n = he.lookupNode(t, r),
                        o = he.mayDelete(t, r, !1);
                      if (o) throw new he.ErrnoError(o);
                      if (!t.node_ops.unlink) throw new he.ErrnoError(63);
                      if (he.isMountpoint(n)) throw new he.ErrnoError(10);
                      t.node_ops.unlink(t, r), he.destroyNode(n);
                    },
                    readlink: (e) => {
                      var t = he.lookupPath(e).node;
                      if (!t) throw new he.ErrnoError(44);
                      if (!t.node_ops.readlink) throw new he.ErrnoError(28);
                      return ae.resolve(
                        he.getPath(t.parent),
                        t.node_ops.readlink(t),
                      );
                    },
                    stat: (e, t) => {
                      var r = he.lookupPath(e, { follow: !t }).node;
                      if (!r) throw new he.ErrnoError(44);
                      if (!r.node_ops.getattr) throw new he.ErrnoError(63);
                      return r.node_ops.getattr(r);
                    },
                    lstat: (e) => he.stat(e, !0),
                    chmod: (e, t, r) => {
                      var n;
                      if (
                        !(n = "string" == typeof e
                          ? he.lookupPath(e, { follow: !r }).node
                          : e).node_ops.setattr
                      ) throw new he.ErrnoError(63);
                      n.node_ops.setattr(n, {
                        mode: 4095 & t | -4096 & n.mode,
                        timestamp: Date.now(),
                      });
                    },
                    lchmod: (e, t) => {
                      he.chmod(e, t, !0);
                    },
                    fchmod: (e, t) => {
                      var r = he.getStream(e);
                      if (!r) throw new he.ErrnoError(8);
                      he.chmod(r.node, t);
                    },
                    chown: (e, t, r, n) => {
                      var o;
                      if (
                        !(o = "string" == typeof e
                          ? he.lookupPath(e, { follow: !n }).node
                          : e).node_ops.setattr
                      ) throw new he.ErrnoError(63);
                      o.node_ops.setattr(o, { timestamp: Date.now() });
                    },
                    lchown: (e, t, r) => {
                      he.chown(e, t, r, !0);
                    },
                    fchown: (e, t, r) => {
                      var n = he.getStream(e);
                      if (!n) throw new he.ErrnoError(8);
                      he.chown(n.node, t, r);
                    },
                    truncate: (e, t) => {
                      if (t < 0) throw new he.ErrnoError(28);
                      var r;
                      if (
                        !(r = "string" == typeof e
                          ? he.lookupPath(e, { follow: !0 }).node
                          : e).node_ops.setattr
                      ) throw new he.ErrnoError(63);
                      if (he.isDir(r.mode)) throw new he.ErrnoError(31);
                      if (!he.isFile(r.mode)) throw new he.ErrnoError(28);
                      var n = he.nodePermissions(r, "w");
                      if (n) throw new he.ErrnoError(n);
                      r.node_ops.setattr(r, { size: t, timestamp: Date.now() });
                    },
                    ftruncate: (e, t) => {
                      var r = he.getStream(e);
                      if (!r) throw new he.ErrnoError(8);
                      if (0 == (2097155 & r.flags)) throw new he.ErrnoError(28);
                      he.truncate(r.node, t);
                    },
                    utime: (e, t, r) => {
                      var n = he.lookupPath(e, { follow: !0 }).node;
                      n.node_ops.setattr(n, { timestamp: Math.max(t, r) });
                    },
                    open: (e, t, r) => {
                      if ("" === e) throw new he.ErrnoError(44);
                      var n;
                      if (
                        r = void 0 === r ? 438 : r,
                          r = 64 & (t = "string" == typeof t
                              ? he.modeStringToFlags(t)
                              : t)
                            ? 4095 & r | 32768
                            : 0,
                          "object" == typeof e
                      ) n = e;
                      else {
                        e = se.normalize(e);
                        try {
                          n = he.lookupPath(e, { follow: !(131072 & t) }).node;
                        } catch (e) {}
                      }
                      var o = !1;
                      if (64 & t) {
                        if (n) { if (128 & t) throw new he.ErrnoError(20); }
                        else n = he.mknod(e, r, 0), o = !0;
                      }
                      if (!n) throw new he.ErrnoError(44);
                      if (
                        he.isChrdev(n.mode) && (t &= -513),
                          65536 & t && !he.isDir(n.mode)
                      ) throw new he.ErrnoError(54);
                      if (!o) {
                        var s = he.mayOpen(n, t);
                        if (s) throw new he.ErrnoError(s);
                      }
                      512 & t && !o && he.truncate(n, 0), t &= -131713;
                      var a = he.createStream({
                        node: n,
                        path: he.getPath(n),
                        flags: t,
                        seekable: !0,
                        position: 0,
                        stream_ops: n.stream_ops,
                        ungotten: [],
                        error: !1,
                      });
                      return a.stream_ops.open && a.stream_ops.open(a),
                        !i.logReadFiles || 1 & t ||
                        (he.readFiles || (he.readFiles = {}),
                          e in he.readFiles || (he.readFiles[e] = 1)),
                        a;
                    },
                    close: (e) => {
                      if (he.isClosed(e)) throw new he.ErrnoError(8);
                      e.getdents && (e.getdents = null);
                      try {
                        e.stream_ops.close && e.stream_ops.close(e);
                      } catch (e) {
                        throw e;
                      } finally {
                        he.closeStream(e.fd);
                      }
                      e.fd = null;
                    },
                    isClosed: (e) => null === e.fd,
                    llseek: (e, t, r) => {
                      if (he.isClosed(e)) throw new he.ErrnoError(8);
                      if (!e.seekable || !e.stream_ops.llseek) {
                        throw new he.ErrnoError(70);
                      }
                      if (0 != r && 1 != r && 2 != r) {
                        throw new he.ErrnoError(28);
                      }
                      return e.position = e.stream_ops.llseek(e, t, r),
                        e.ungotten = [],
                        e.position;
                    },
                    read: (e, t, r, n, o) => {
                      if (n < 0 || o < 0) throw new he.ErrnoError(28);
                      if (he.isClosed(e)) throw new he.ErrnoError(8);
                      if (1 == (2097155 & e.flags)) throw new he.ErrnoError(8);
                      if (he.isDir(e.node.mode)) throw new he.ErrnoError(31);
                      if (!e.stream_ops.read) throw new he.ErrnoError(28);
                      var i = void 0 !== o;
                      if (i) { if (!e.seekable) throw new he.ErrnoError(70); }
                      else o = e.position;
                      var s = e.stream_ops.read(e, t, r, n, o);
                      return i || (e.position += s), s;
                    },
                    write: (e, t, r, n, o, i) => {
                      if (n < 0 || o < 0) throw new he.ErrnoError(28);
                      if (he.isClosed(e)) throw new he.ErrnoError(8);
                      if (0 == (2097155 & e.flags)) throw new he.ErrnoError(8);
                      if (he.isDir(e.node.mode)) throw new he.ErrnoError(31);
                      if (!e.stream_ops.write) throw new he.ErrnoError(28);
                      e.seekable && 1024 & e.flags && he.llseek(e, 0, 2);
                      var s = void 0 !== o;
                      if (s) { if (!e.seekable) throw new he.ErrnoError(70); }
                      else o = e.position;
                      var a = e.stream_ops.write(e, t, r, n, o, i);
                      return s || (e.position += a), a;
                    },
                    allocate: (e, t, r) => {
                      if (he.isClosed(e)) throw new he.ErrnoError(8);
                      if (t < 0 || r <= 0) throw new he.ErrnoError(28);
                      if (0 == (2097155 & e.flags)) throw new he.ErrnoError(8);
                      if (!he.isFile(e.node.mode) && !he.isDir(e.node.mode)) {
                        throw new he.ErrnoError(43);
                      }
                      if (!e.stream_ops.allocate) throw new he.ErrnoError(138);
                      e.stream_ops.allocate(e, t, r);
                    },
                    mmap: (e, t, r, n, o) => {
                      if (
                        0 != (2 & n) && 0 == (2 & o) && 2 != (2097155 & e.flags)
                      ) throw new he.ErrnoError(2);
                      if (1 == (2097155 & e.flags)) throw new he.ErrnoError(2);
                      if (!e.stream_ops.mmap) throw new he.ErrnoError(43);
                      return e.stream_ops.mmap(e, t, r, n, o);
                    },
                    msync: (e, t, r, n, o) =>
                      e && e.stream_ops.msync
                        ? e.stream_ops.msync(e, t, r, n, o)
                        : 0,
                    munmap: (e) => 0,
                    ioctl: (e, t, r) => {
                      if (!e.stream_ops.ioctl) throw new he.ErrnoError(59);
                      return e.stream_ops.ioctl(e, t, r);
                    },
                    readFile: (e, t = {}) => {
                      if (
                        t.flags = t.flags || 0,
                          t.encoding = t.encoding || "binary",
                          "utf8" !== t.encoding && "binary" !== t.encoding
                      ) {
                        throw new Error(
                          'Invalid encoding type "' + t.encoding + '"',
                        );
                      }
                      var r,
                        n = he.open(e, t.flags),
                        o = he.stat(e).size,
                        i = new Uint8Array(o);
                      return he.read(n, i, 0, o, 0),
                        "utf8" === t.encoding
                          ? r = j(i, 0)
                          : "binary" === t.encoding && (r = i),
                        he.close(n),
                        r;
                    },
                    writeFile: (e, t, r = {}) => {
                      r.flags = r.flags || 577;
                      var n = he.open(e, r.flags, r.mode);
                      if ("string" == typeof t) {
                        var o = new Uint8Array(L(t) + 1),
                          i = C(t, o, 0, o.length);
                        he.write(n, o, 0, i, void 0, r.canOwn);
                      } else {
                        if (!ArrayBuffer.isView(t)) {
                          throw new Error("Unsupported data type");
                        }
                        he.write(n, t, 0, t.byteLength, void 0, r.canOwn);
                      }
                      he.close(n);
                    },
                    cwd: () => he.currentPath,
                    chdir: (e) => {
                      var t = he.lookupPath(e, { follow: !0 });
                      if (null === t.node) throw new he.ErrnoError(44);
                      if (!he.isDir(t.node.mode)) throw new he.ErrnoError(54);
                      var r = he.nodePermissions(t.node, "x");
                      if (r) throw new he.ErrnoError(r);
                      he.currentPath = t.path;
                    },
                    createDefaultDirectories: () => {
                      he.mkdir("/tmp"),
                        he.mkdir("/home"),
                        he.mkdir("/home/web_user");
                    },
                    createDefaultDevices: () => {
                      he.mkdir("/dev"),
                        he.registerDevice(he.makedev(1, 3), {
                          read: () => 0,
                          write: (e, t, r, n, o) => n,
                        }),
                        he.mkdev("/dev/null", he.makedev(1, 3)),
                        le.register(he.makedev(5, 0), le.default_tty_ops),
                        le.register(he.makedev(6, 0), le.default_tty1_ops),
                        he.mkdev("/dev/tty", he.makedev(5, 0)),
                        he.mkdev("/dev/tty1", he.makedev(6, 0));
                      var e = function () {
                        if (
                          "object" == typeof crypto &&
                          "function" == typeof crypto.getRandomValues
                        ) {
                          var e = new Uint8Array(1);
                          return () => (crypto.getRandomValues(e), e[0]);
                        }
                        if (b) {
                          try {
                            var t = r(821);
                            return () => t.randomBytes(1)[0];
                          } catch (e) {}
                        }
                        return () => Z("randomDevice");
                      }();
                      he.createDevice("/dev", "random", e),
                        he.createDevice("/dev", "urandom", e),
                        he.mkdir("/dev/shm"),
                        he.mkdir("/dev/shm/tmp");
                    },
                    createSpecialDirectories: () => {
                      he.mkdir("/proc");
                      var e = he.mkdir("/proc/self");
                      he.mkdir("/proc/self/fd"),
                        he.mount(
                          {
                            mount: () => {
                              var t = he.createNode(e, "fd", 16895, 73);
                              return t.node_ops = {
                                lookup: (e, t) => {
                                  var r = +t, n = he.getStream(r);
                                  if (!n) throw new he.ErrnoError(8);
                                  var o = {
                                    parent: null,
                                    mount: { mountpoint: "fake" },
                                    node_ops: { readlink: () => n.path },
                                  };
                                  return o.parent = o, o;
                                },
                              },
                                t;
                            },
                          },
                          {},
                          "/proc/self/fd",
                        );
                    },
                    createStandardStreams: () => {
                      i.stdin
                        ? he.createDevice("/dev", "stdin", i.stdin)
                        : he.symlink("/dev/tty", "/dev/stdin"),
                        i.stdout
                          ? he.createDevice("/dev", "stdout", null, i.stdout)
                          : he.symlink("/dev/tty", "/dev/stdout"),
                        i.stderr
                          ? he.createDevice("/dev", "stderr", null, i.stderr)
                          : he.symlink("/dev/tty1", "/dev/stderr"),
                        he.open("/dev/stdin", 0),
                        he.open("/dev/stdout", 1),
                        he.open("/dev/stderr", 1);
                    },
                    ensureErrnoError: () => {
                      he.ErrnoError || (he.ErrnoError = function (e, t) {
                        this.node = t,
                          this.setErrno = function (e) {
                            this.errno = e;
                          },
                          this.setErrno(e),
                          this.message = "FS error";
                      },
                        he.ErrnoError.prototype = new Error(),
                        he.ErrnoError.prototype.constructor = he.ErrnoError,
                        [44].forEach((e) => {
                          he.genericErrors[e] = new he.ErrnoError(e),
                            he.genericErrors[e].stack =
                              "<generic error, no stack>";
                        }));
                    },
                    staticInit: () => {
                      he.ensureErrnoError(),
                        he.nameTable = new Array(4096),
                        he.mount(de, {}, "/"),
                        he.createDefaultDirectories(),
                        he.createDefaultDevices(),
                        he.createSpecialDirectories(),
                        he.filesystems = { MEMFS: de };
                    },
                    init: (e, t, r) => {
                      he.init.initialized = !0,
                        he.ensureErrnoError(),
                        i.stdin = e || i.stdin,
                        i.stdout = t || i.stdout,
                        i.stderr = r || i.stderr,
                        he.createStandardStreams();
                    },
                    quit: () => {
                      he.init.initialized = !1;
                      for (var e = 0; e < he.streams.length; e++) {
                        var t = he.streams[e];
                        t && he.close(t);
                      }
                    },
                    getMode: (e, t) => {
                      var r = 0;
                      return e && (r |= 365), t && (r |= 146), r;
                    },
                    findObject: (e, t) => {
                      var r = he.analyzePath(e, t);
                      return r.exists ? r.object : null;
                    },
                    analyzePath: (e, t) => {
                      try {
                        e = (n = he.lookupPath(e, { follow: !t })).path;
                      } catch (e) {}
                      var r = {
                        isRoot: !1,
                        exists: !1,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: !1,
                        parentPath: null,
                        parentObject: null,
                      };
                      try {
                        var n = he.lookupPath(e, { parent: !0 });
                        r.parentExists = !0,
                          r.parentPath = n.path,
                          r.parentObject = n.node,
                          r.name = se.basename(e),
                          n = he.lookupPath(e, { follow: !t }),
                          r.exists = !0,
                          r.path = n.path,
                          r.object = n.node,
                          r.name = n.node.name,
                          r.isRoot = "/" === n.path;
                      } catch (e) {
                        r.error = e.errno;
                      }
                      return r;
                    },
                    createPath: (e, t, r, n) => {
                      e = "string" == typeof e ? e : he.getPath(e);
                      for (var o = t.split("/").reverse(); o.length;) {
                        var i = o.pop();
                        if (i) {
                          var s = se.join2(e, i);
                          try {
                            he.mkdir(s);
                          } catch (e) {}
                          e = s;
                        }
                      }
                      return s;
                    },
                    createFile: (e, t, r, n, o) => {
                      var i = se.join2(
                          "string" == typeof e ? e : he.getPath(e),
                          t,
                        ),
                        s = he.getMode(n, o);
                      return he.create(i, s);
                    },
                    createDataFile: (e, t, r, n, o, i) => {
                      var s = t;
                      e &&
                        (e = "string" == typeof e ? e : he.getPath(e),
                          s = t ? se.join2(e, t) : e);
                      var a = he.getMode(n, o), u = he.create(s, a);
                      if (r) {
                        if ("string" == typeof r) {
                          for (
                            var l = new Array(r.length), c = 0, d = r.length;
                            c < d;
                            ++c
                          ) l[c] = r.charCodeAt(c);
                          r = l;
                        }
                        he.chmod(u, 146 | a);
                        var f = he.open(u, 577);
                        he.write(f, r, 0, r.length, 0, i),
                          he.close(f),
                          he.chmod(u, a);
                      }
                      return u;
                    },
                    createDevice: (e, t, r, n) => {
                      var o = se.join2(
                          "string" == typeof e ? e : he.getPath(e),
                          t,
                        ),
                        i = he.getMode(!!r, !!n);
                      he.createDevice.major || (he.createDevice.major = 64);
                      var s = he.makedev(he.createDevice.major++, 0);
                      return he.registerDevice(s, {
                        open: (e) => {
                          e.seekable = !1;
                        },
                        close: (e) => {
                          n && n.buffer && n.buffer.length && n(10);
                        },
                        read: (e, t, n, o, i) => {
                          for (var s = 0, a = 0; a < o; a++) {
                            var u;
                            try {
                              u = r();
                            } catch (e) {
                              throw new he.ErrnoError(29);
                            }
                            if (void 0 === u && 0 === s) {
                              throw new he.ErrnoError(6);
                            }
                            if (null == u) break;
                            s++, t[n + a] = u;
                          }
                          return s && (e.node.timestamp = Date.now()), s;
                        },
                        write: (e, t, r, o, i) => {
                          for (var s = 0; s < o; s++) {
                            try {
                              n(t[r + s]);
                            } catch (e) {
                              throw new he.ErrnoError(29);
                            }
                          }
                          return o && (e.node.timestamp = Date.now()), s;
                        },
                      }),
                        he.mkdev(o, i, s);
                    },
                    forceLoadFile: (e) => {
                      if (e.isDevice || e.isFolder || e.link || e.contents) {
                        return !0;
                      }
                      if ("undefined" != typeof XMLHttpRequest) {
                        throw new Error(
                          "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
                        );
                      }
                      if (!a) {
                        throw new Error(
                          "Cannot load without read() or XMLHttpRequest.",
                        );
                      }
                      try {
                        e.contents = ue(a(e.url), !0),
                          e.usedBytes = e.contents.length;
                      } catch (e) {
                        throw new he.ErrnoError(29);
                      }
                    },
                    createLazyFile: (e, t, r, n, o) => {
                      function i() {
                        this.lengthKnown = !1, this.chunks = [];
                      }
                      if (
                        i.prototype.get = function (e) {
                          if (!(e > this.length - 1 || e < 0)) {
                            var t = e % this.chunkSize,
                              r = e / this.chunkSize | 0;
                            return this.getter(r)[t];
                          }
                        },
                          i.prototype.setDataGetter = function (e) {
                            this.getter = e;
                          },
                          i.prototype.cacheLength = function () {
                            var e = new XMLHttpRequest();
                            if (
                              e.open("HEAD", r, !1),
                                e.send(null),
                                !(e.status >= 200 && e.status < 300 ||
                                  304 === e.status)
                            ) {
                              throw new Error(
                                "Couldn't load " + r + ". Status: " + e.status,
                              );
                            }
                            var t,
                              n = Number(e.getResponseHeader("Content-length")),
                              o = (t = e.getResponseHeader("Accept-Ranges")) &&
                                "bytes" === t,
                              i =
                                (t = e.getResponseHeader("Content-Encoding")) &&
                                "gzip" === t,
                              s = 1048576;
                            o || (s = n);
                            var a = this;
                            a.setDataGetter((e) => {
                              var t = e * s, o = (e + 1) * s - 1;
                              if (
                                o = Math.min(o, n - 1),
                                  void 0 === a.chunks[e] &&
                                  (a.chunks[e] = ((e, t) => {
                                    if (e > t) {
                                      throw new Error(
                                        "invalid range (" + e + ", " + t +
                                          ") or no bytes requested!",
                                      );
                                    }
                                    if (t > n - 1) {
                                      throw new Error(
                                        "only " + n +
                                          " bytes available! programmer error!",
                                      );
                                    }
                                    var o = new XMLHttpRequest();
                                    if (
                                      o.open("GET", r, !1),
                                        n !== s &&
                                        o.setRequestHeader(
                                          "Range",
                                          "bytes=" + e + "-" + t,
                                        ),
                                        o.responseType = "arraybuffer",
                                        o.overrideMimeType &&
                                        o.overrideMimeType(
                                          "text/plain; charset=x-user-defined",
                                        ),
                                        o.send(null),
                                        !(o.status >= 200 && o.status < 300 ||
                                          304 === o.status)
                                    ) {
                                      throw new Error(
                                        "Couldn't load " + r + ". Status: " +
                                          o.status,
                                      );
                                    }
                                    return void 0 !== o.response
                                      ? new Uint8Array(o.response || [])
                                      : ue(o.responseText || "", !0);
                                  })(t, o)),
                                  void 0 === a.chunks[e]
                              ) throw new Error("doXHR failed!");
                              return a.chunks[e];
                            }),
                              !i && n ||
                              (s = n = 1,
                                n = this.getter(0).length,
                                s = n,
                                y("LazyFiles on gzip forces download of the whole file when length is accessed")),
                              this._length = n,
                              this._chunkSize = s,
                              this.lengthKnown = !0;
                          },
                          "undefined" != typeof XMLHttpRequest
                      ) {
                        if (!v) {
                          throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        }
                        var s = new i();
                        Object.defineProperties(s, {
                          length: {
                            get: function () {
                              return this.lengthKnown || this.cacheLength(),
                                this._length;
                            },
                          },
                          chunkSize: {
                            get: function () {
                              return this.lengthKnown || this.cacheLength(),
                                this._chunkSize;
                            },
                          },
                        });
                        var a = { isDevice: !1, contents: s };
                      } else a = { isDevice: !1, url: r };
                      var u = he.createFile(e, t, a, n, o);
                      a.contents
                        ? u.contents = a.contents
                        : a.url && (u.contents = null, u.url = a.url),
                        Object.defineProperties(u, {
                          usedBytes: {
                            get: function () {
                              return this.contents.length;
                            },
                          },
                        });
                      var l = {};
                      function c(e, t, r, n, o) {
                        var i = e.node.contents;
                        if (o >= i.length) return 0;
                        var s = Math.min(i.length - o, n);
                        if (i.slice) {
                          for (var a = 0; a < s; a++) t[r + a] = i[o + a];
                        } else for (a = 0; a < s; a++) t[r + a] = i.get(o + a);
                        return s;
                      }
                      return Object.keys(u.stream_ops).forEach((e) => {
                        var t = u.stream_ops[e];
                        l[e] = function () {
                          return he.forceLoadFile(u), t.apply(null, arguments);
                        };
                      }),
                        l.read = (
                          e,
                          t,
                          r,
                          n,
                          o,
                        ) => (he.forceLoadFile(u), c(e, t, r, n, o)),
                        l.mmap = (e, t, r, n, o) => {
                          he.forceLoadFile(u);
                          var i = ce(t);
                          if (!i) throw new he.ErrnoError(48);
                          return c(e, q, i, t, r), { ptr: i, allocated: !0 };
                        },
                        u.stream_ops = l,
                        u;
                    },
                    createPreloadedFile: (e, t, r, n, o, i, s, a, l, c) => {
                      var d = t ? ae.resolve(se.join2(e, t)) : e;
                      function f(r) {
                        function u(r) {
                          c && c(),
                            a || he.createDataFile(e, t, r, n, o, l),
                            i && i(),
                            J();
                        }
                        Browser.handledByPreloadPlugin(r, d, u, () => {
                          s && s(), J();
                        }) || u(r);
                      }
                      Q(),
                        "string" == typeof r
                          ? function (e, t, r, n) {
                            var o = n ? "" : "al " + e;
                            u(e, (r) => {
                              r ||
                              Z(
                                'Loading data file "' + e +
                                  '" failed (no arrayBuffer).',
                              ),
                                t(new Uint8Array(r)),
                                o && J();
                            }, (t) => {
                              if (!r) {
                                throw 'Loading data file "' + e + '" failed.';
                              }
                              r();
                            }), o && Q();
                          }(r, (e) => f(e), s)
                          : f(r);
                    },
                    indexedDB: () =>
                      window.indexedDB || window.mozIndexedDB ||
                      window.webkitIndexedDB || window.msIndexedDB,
                    DB_NAME: () => "EM_FS_" + window.location.pathname,
                    DB_VERSION: 20,
                    DB_STORE_NAME: "FILE_DATA",
                    saveFilesToDB: (e, t, r) => {
                      t = t || (() => {}), r = r || (() => {});
                      var n = he.indexedDB();
                      try {
                        var o = n.open(he.DB_NAME(), he.DB_VERSION);
                      } catch (e) {
                        return r(e);
                      }
                      o.onupgradeneeded = () => {
                        y("creating db"),
                          o.result.createObjectStore(he.DB_STORE_NAME);
                      },
                        o.onsuccess = () => {
                          var n = o.result.transaction(
                              [he.DB_STORE_NAME],
                              "readwrite",
                            ),
                            i = n.objectStore(he.DB_STORE_NAME),
                            s = 0,
                            a = 0,
                            u = e.length;
                          function l() {
                            0 == a ? t() : r();
                          }
                          e.forEach((e) => {
                            var t = i.put(he.analyzePath(e).object.contents, e);
                            t.onsuccess = () => {
                              ++s + a == u && l();
                            },
                              t.onerror = () => {
                                a++, s + a == u && l();
                              };
                          }), n.onerror = r;
                        },
                        o.onerror = r;
                    },
                    loadFilesFromDB: (e, t, r) => {
                      t = t || (() => {}), r = r || (() => {});
                      var n = he.indexedDB();
                      try {
                        var o = n.open(he.DB_NAME(), he.DB_VERSION);
                      } catch (e) {
                        return r(e);
                      }
                      o.onupgradeneeded = r,
                        o.onsuccess = () => {
                          var n = o.result;
                          try {
                            var i = n.transaction(
                              [he.DB_STORE_NAME],
                              "readonly",
                            );
                          } catch (e) {
                            return void r(e);
                          }
                          var s = i.objectStore(he.DB_STORE_NAME),
                            a = 0,
                            u = 0,
                            l = e.length;
                          function c() {
                            0 == u ? t() : r();
                          }
                          e.forEach((e) => {
                            var t = s.get(e);
                            t.onsuccess = () => {
                              he.analyzePath(e).exists && he.unlink(e),
                                he.createDataFile(
                                  se.dirname(e),
                                  se.basename(e),
                                  t.result,
                                  !0,
                                  !0,
                                  !0,
                                ),
                                ++a + u == l && c();
                            },
                              t.onerror = () => {
                                u++, a + u == l && c();
                              };
                          }), i.onerror = r;
                        },
                        o.onerror = r;
                    },
                  },
                  me = {
                    DEFAULT_POLLMASK: 5,
                    calculateAt: function (e, t, r) {
                      if (se.isAbs(t)) return t;
                      var n;
                      if (
                        n = -100 === e ? he.cwd() : me.getStreamFromFD(e).path,
                          0 == t.length
                      ) {
                        if (!r) throw new he.ErrnoError(44);
                        return n;
                      }
                      return se.join2(n, t);
                    },
                    doStat: function (e, t, r) {
                      try {
                        var n = e(t);
                      } catch (e) {
                        if (
                          e && e.node &&
                          se.normalize(t) !== se.normalize(he.getPath(e.node))
                        ) return -54;
                        throw e;
                      }
                      return D[r >> 2] = n.dev,
                        D[r + 8 >> 2] = n.ino,
                        D[r + 12 >> 2] = n.mode,
                        F[r + 16 >> 2] = n.nlink,
                        D[r + 20 >> 2] = n.uid,
                        D[r + 24 >> 2] = n.gid,
                        D[r + 28 >> 2] = n.rdev,
                        V = [
                          n.size >>> 0,
                          (U = n.size,
                            +Math.abs(U) >= 1
                              ? U > 0
                                ? (0 |
                                  Math.min(
                                    +Math.floor(U / 4294967296),
                                    4294967295,
                                  )) >>> 0
                                : ~~+Math.ceil(
                                  (U - +(~~U >>> 0)) / 4294967296,
                                ) >>> 0
                              : 0),
                        ],
                        D[r + 40 >> 2] = V[0],
                        D[r + 44 >> 2] = V[1],
                        D[r + 48 >> 2] = 4096,
                        D[r + 52 >> 2] = n.blocks,
                        V = [
                          Math.floor(n.atime.getTime() / 1e3) >>> 0,
                          (U = Math.floor(n.atime.getTime() / 1e3),
                            +Math.abs(U) >= 1
                              ? U > 0
                                ? (0 |
                                  Math.min(
                                    +Math.floor(U / 4294967296),
                                    4294967295,
                                  )) >>> 0
                                : ~~+Math.ceil(
                                  (U - +(~~U >>> 0)) / 4294967296,
                                ) >>> 0
                              : 0),
                        ],
                        D[r + 56 >> 2] = V[0],
                        D[r + 60 >> 2] = V[1],
                        F[r + 64 >> 2] = 0,
                        V = [
                          Math.floor(n.mtime.getTime() / 1e3) >>> 0,
                          (U = Math.floor(n.mtime.getTime() / 1e3),
                            +Math.abs(U) >= 1
                              ? U > 0
                                ? (0 |
                                  Math.min(
                                    +Math.floor(U / 4294967296),
                                    4294967295,
                                  )) >>> 0
                                : ~~+Math.ceil(
                                  (U - +(~~U >>> 0)) / 4294967296,
                                ) >>> 0
                              : 0),
                        ],
                        D[r + 72 >> 2] = V[0],
                        D[r + 76 >> 2] = V[1],
                        F[r + 80 >> 2] = 0,
                        V = [
                          Math.floor(n.ctime.getTime() / 1e3) >>> 0,
                          (U = Math.floor(n.ctime.getTime() / 1e3),
                            +Math.abs(U) >= 1
                              ? U > 0
                                ? (0 |
                                  Math.min(
                                    +Math.floor(U / 4294967296),
                                    4294967295,
                                  )) >>> 0
                                : ~~+Math.ceil(
                                  (U - +(~~U >>> 0)) / 4294967296,
                                ) >>> 0
                              : 0),
                        ],
                        D[r + 88 >> 2] = V[0],
                        D[r + 92 >> 2] = V[1],
                        F[r + 96 >> 2] = 0,
                        V = [
                          n.ino >>> 0,
                          (U = n.ino,
                            +Math.abs(U) >= 1
                              ? U > 0
                                ? (0 |
                                  Math.min(
                                    +Math.floor(U / 4294967296),
                                    4294967295,
                                  )) >>> 0
                                : ~~+Math.ceil(
                                  (U - +(~~U >>> 0)) / 4294967296,
                                ) >>> 0
                              : 0),
                        ],
                        D[r + 104 >> 2] = V[0],
                        D[r + 108 >> 2] = V[1],
                        0;
                    },
                    doMsync: function (e, t, r, n, o) {
                      var i = x.slice(e, e + r);
                      he.msync(t, i, o, r, n);
                    },
                    varargs: void 0,
                    get: function () {
                      return me.varargs += 4, D[me.varargs - 4 >> 2];
                    },
                    getStr: function (e) {
                      return T(e);
                    },
                    getStreamFromFD: function (e) {
                      var t = he.getStream(e);
                      if (!t) throw new he.ErrnoError(8);
                      return t;
                    },
                  };
                function pe(e, t) {
                  return t + 2097152 >>> 0 < 4194305 - !!e
                    ? (e >>> 0) + 4294967296 * t
                    : NaN;
                }
                function _e(e) {
                  return F[e >> 2] + 4294967296 * D[e + 4 >> 2];
                }
                function ve(e) {
                  var t = L(e) + 1, r = Oe(t);
                  return r && C(e, q, r, t), r;
                }
                function be(e) {
                  try {
                    return k.grow(e - S.byteLength + 65535 >>> 16),
                      B(k.buffer),
                      1;
                  } catch (e) {}
                }
                fe = b
                  ? () => {
                    var e = process.hrtime();
                    return 1e3 * e[0] + e[1] / 1e6;
                  }
                  : () => performance.now();
                var ge = {};
                function we() {
                  if (!we.strings) {
                    var e = {
                      USER: "web_user",
                      LOGNAME: "web_user",
                      PATH: "/",
                      PWD: "/",
                      HOME: "/home/web_user",
                      LANG:
                        ("object" == typeof navigator && navigator.languages &&
                            navigator.languages[0] || "C").replace("-", "_") +
                        ".UTF-8",
                      _: p || "./this.program",
                    };
                    for (var t in ge) {
                      void 0 === ge[t] ? delete e[t] : e[t] = ge[t];
                    }
                    var r = [];
                    for (var t in e) r.push(t + "=" + e[t]);
                    we.strings = r;
                  }
                  return we.strings;
                }
                function ye(e, t) {
                  e < 128 ? t.push(e) : t.push(e % 128 | 128, e >> 7);
                }
                var Ee = [];
                function ke(e) {
                  var t = Ee[e];
                  return t ||
                    (e >= Ee.length && (Ee.length = e + 1),
                      Ee[e] = t = N.get(e)),
                    t;
                }
                var Se = void 0, qe = [];
                function xe(e, t) {
                  N.set(e, t), Ee[e] = N.get(e);
                }
                function Me(e, t) {
                  if (
                    Se || (Se = new WeakMap(),
                      function (e, t) {
                        if (Se) {
                          for (var r = 0; r < 0 + t; r++) {
                            var n = ke(r);
                            n && Se.set(n, r);
                          }
                        }
                      }(0, N.length)), Se.has(e)
                  ) return Se.get(e);
                  var r = function () {
                    if (qe.length) return qe.pop();
                    try {
                      N.grow(1);
                    } catch (e) {
                      if (!(e instanceof RangeError)) throw e;
                      throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
                    }
                    return N.length - 1;
                  }();
                  try {
                    xe(r, e);
                  } catch (n) {
                    if (!(n instanceof TypeError)) throw n;
                    xe(
                      r,
                      function (e, t) {
                        if ("function" == typeof WebAssembly.Function) {
                          return new WebAssembly.Function(
                            function (e) {
                              for (
                                var t = {
                                    i: "i32",
                                    j: "i64",
                                    f: "f32",
                                    d: "f64",
                                    p: "i32",
                                  },
                                  r = {
                                    parameters: [],
                                    results: "v" == e[0] ? [] : [t[e[0]]],
                                  },
                                  n = 1;
                                n < e.length;
                                ++n
                              ) r.parameters.push(t[e[n]]);
                              return r;
                            }(t),
                            e,
                          );
                        }
                        var r = [1, 96],
                          n = t.slice(0, 1),
                          o = t.slice(1),
                          i = { i: 127, p: 127, j: 126, f: 125, d: 124 };
                        ye(o.length, r);
                        for (var s = 0; s < o.length; ++s) r.push(i[o[s]]);
                        "v" == n ? r.push(0) : r.push(1, i[n]);
                        var a = [0, 97, 115, 109, 1, 0, 0, 0, 1];
                        ye(r.length, a),
                          a.push.apply(a, r),
                          a.push(
                            2,
                            7,
                            1,
                            1,
                            101,
                            1,
                            102,
                            0,
                            0,
                            7,
                            5,
                            1,
                            1,
                            102,
                            0,
                            0,
                          );
                        var u = new WebAssembly.Module(new Uint8Array(a));
                        return new WebAssembly.Instance(u, { e: { f: e } })
                          .exports.f;
                      }(e, t),
                    );
                  }
                  return Se.set(e, r), r;
                }
                function De(e) {
                  Se.delete(ke(e)), qe.push(e);
                }
                var Fe = 0;
                function Ae(e, t) {
                  var r;
                  return r = 1 == t ? Ie(e.length) : Oe(e.length),
                    e.subarray || e.slice || (e = new Uint8Array(e)),
                    x.set(e, r),
                    r;
                }
                function Pe(e) {
                  return i["_" + e];
                }
                function Re(e, t, r, n, o) {
                  var i = {
                      string: (e) => {
                        var t = 0;
                        if (null != e && 0 !== e) {
                          var r = 1 + (e.length << 2);
                          O(e, t = Ie(r), r);
                        }
                        return t;
                      },
                      array: (e) => {
                        var t = Ie(e.length);
                        return function (e, t) {
                          q.set(e, t);
                        }(e, t),
                          t;
                      },
                    },
                    s = Pe(e),
                    a = [],
                    u = 0;
                  if (n) {
                    for (var l = 0; l < n.length; l++) {
                      var c = i[r[l]];
                      c ? (0 === u && (u = Ne()), a[l] = c(n[l])) : a[l] = n[l];
                    }
                  }
                  var d = s.apply(null, a);
                  return function (e) {
                    return 0 !== u && He(u),
                      function (e) {
                        return "string" === t
                          ? T(e)
                          : "boolean" === t
                          ? Boolean(e)
                          : e;
                      }(e);
                  }(d);
                }
                var ze = function (e, t, r, n) {
                  e || (e = this),
                    this.parent = e,
                    this.mount = e.mount,
                    this.mounted = null,
                    this.id = he.nextInode++,
                    this.name = t,
                    this.mode = r,
                    this.node_ops = {},
                    this.stream_ops = {},
                    this.rdev = n;
                };
                Object.defineProperties(ze.prototype, {
                  read: {
                    get: function () {
                      return 365 == (365 & this.mode);
                    },
                    set: function (e) {
                      e ? this.mode |= 365 : this.mode &= -366;
                    },
                  },
                  write: {
                    get: function () {
                      return 146 == (146 & this.mode);
                    },
                    set: function (e) {
                      e ? this.mode |= 146 : this.mode &= -147;
                    },
                  },
                  isFolder: {
                    get: function () {
                      return he.isDir(this.mode);
                    },
                  },
                  isDevice: {
                    get: function () {
                      return he.isChrdev(this.mode);
                    },
                  },
                }),
                  he.FSNode = ze,
                  he.staticInit();
                var je,
                  Te = {
                    a: function (e, t, r, n) {
                      Z(
                        "Assertion failed: " + T(e) + ", at: " +
                          [
                            t ? T(t) : "unknown filename",
                            r,
                            n ? T(n) : "unknown function",
                          ],
                      );
                    },
                    g: function (e, t) {
                      try {
                        return e = me.getStr(e), he.chmod(e, t), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    I: function (e, t, r, n) {
                      try {
                        if (
                          t = me.getStr(t), t = me.calculateAt(e, t), -8 & r
                        ) return -28;
                        var o = he.lookupPath(t, { follow: !0 }).node;
                        if (!o) return -44;
                        var i = "";
                        return 4 & r && (i += "r"),
                          2 & r && (i += "w"),
                          1 & r && (i += "x"),
                          i && he.nodePermissions(o, i) ? -2 : 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    h: function (e, t) {
                      try {
                        return he.fchmod(e, t), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    H: function (e, t, r) {
                      try {
                        return he.fchown(e, t, r), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    b: function (e, t, r) {
                      me.varargs = r;
                      try {
                        var n = me.getStreamFromFD(e);
                        switch (t) {
                          case 0:
                            return (o = me.get()) < 0
                              ? -28
                              : he.createStream(n, o).fd;
                          case 1:
                          case 2:
                            return 0;
                          case 3:
                            return n.flags;
                          case 4:
                            var o = me.get();
                            return n.flags |= o, 0;
                          case 5:
                            return o = me.get(), M[o + 0 >> 1] = 2, 0;
                          case 6:
                          case 7:
                            return 0;
                          case 16:
                          case 8:
                            return -28;
                          case 9:
                            return 28, D[Ce() >> 2] = 28, -1;
                          default:
                            return -28;
                        }
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    G: function (e, t) {
                      try {
                        var r = me.getStreamFromFD(e);
                        return me.doStat(he.stat, r.path, t);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    l: function (e, t, r) {
                      try {
                        var n = pe(t, r);
                        return isNaN(n) ? -61 : (he.ftruncate(e, n), 0);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    B: function (e, t) {
                      try {
                        if (0 === t) return -28;
                        var r = he.cwd(), n = L(r) + 1;
                        return t < n ? -68 : (O(r, e, t), n);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    E: function (e, t) {
                      try {
                        return e = me.getStr(e), me.doStat(he.lstat, e, t);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    y: function (e, t, r) {
                      try {
                        return t = me.getStr(t),
                          t = me.calculateAt(e, t),
                          "/" === (t = se.normalize(t))[t.length - 1] &&
                          (t = t.substr(0, t.length - 1)),
                          he.mkdir(t, r, 0),
                          0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    D: function (e, t, r, n) {
                      try {
                        t = me.getStr(t);
                        var o = 256 & n, i = 4096 & n;
                        return n &= -4353,
                          t = me.calculateAt(e, t, i),
                          me.doStat(o ? he.lstat : he.stat, t, r);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    v: function (e, t, r, n) {
                      me.varargs = n;
                      try {
                        t = me.getStr(t), t = me.calculateAt(e, t);
                        var o = n ? me.get() : 0;
                        return he.open(t, r, o).fd;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    t: function (e, t, r, n) {
                      try {
                        if (
                          t = me.getStr(t), t = me.calculateAt(e, t), n <= 0
                        ) return -28;
                        var o = he.readlink(t),
                          i = Math.min(n, L(o)),
                          s = q[r + i];
                        return O(o, r, n + 1), q[r + i] = s, i;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    s: function (e) {
                      try {
                        return e = me.getStr(e), he.rmdir(e), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    F: function (e, t) {
                      try {
                        return e = me.getStr(e), me.doStat(he.stat, e, t);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    p: function (e, t, r) {
                      try {
                        return t = me.getStr(t),
                          t = me.calculateAt(e, t),
                          0 === r
                            ? he.unlink(t)
                            : 512 === r
                            ? he.rmdir(t)
                            : Z("Invalid flags passed to unlinkat"),
                          0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    n: function (e, t, r, n) {
                      try {
                        if (t = me.getStr(t), t = me.calculateAt(e, t, !0), r) {
                          var o = _e(r), i = D[r + 8 >> 2];
                          s = 1e3 * o + i / 1e6,
                            a = 1e3 * (o = _e(r += 16)) +
                              (i = D[r + 8 >> 2]) / 1e6;
                        } else var s = Date.now(), a = s;
                        return he.utime(t, s, a), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    e: function () {
                      return Date.now();
                    },
                    i: function (e, t) {
                      var r = new Date(1e3 * _e(e));
                      D[t >> 2] = r.getSeconds(),
                        D[t + 4 >> 2] = r.getMinutes(),
                        D[t + 8 >> 2] = r.getHours(),
                        D[t + 12 >> 2] = r.getDate(),
                        D[t + 16 >> 2] = r.getMonth(),
                        D[t + 20 >> 2] = r.getFullYear() - 1900,
                        D[t + 24 >> 2] = r.getDay();
                      var n = new Date(r.getFullYear(), 0, 1),
                        o = (r.getTime() - n.getTime()) / 864e5 | 0;
                      D[t + 28 >> 2] = o,
                        D[t + 36 >> 2] = -60 * r.getTimezoneOffset();
                      var i = new Date(r.getFullYear(), 6, 1)
                          .getTimezoneOffset(),
                        s = n.getTimezoneOffset(),
                        a = 0 |
                          (i != s && r.getTimezoneOffset() == Math.min(s, i));
                      D[t + 32 >> 2] = a;
                    },
                    w: function (e, t, r, n, o, i) {
                      try {
                        var s = me.getStreamFromFD(n),
                          a = he.mmap(s, e, o, t, r),
                          u = a.ptr;
                        return D[i >> 2] = a.allocated, u;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    x: function (e, t, r, n, o, i) {
                      try {
                        var s = me.getStreamFromFD(o);
                        2 & r && me.doMsync(e, s, t, n, i), he.munmap(s);
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return -e.errno;
                      }
                    },
                    j: function e(t, r, n) {
                      e.called || (e.called = !0,
                        function (e, t, r) {
                          var n = (new Date()).getFullYear(),
                            o = new Date(n, 0, 1),
                            i = new Date(n, 6, 1),
                            s = o.getTimezoneOffset(),
                            a = i.getTimezoneOffset(),
                            u = Math.max(s, a);
                          function l(e) {
                            var t = e.toTimeString().match(/\(([A-Za-z ]+)\)$/);
                            return t ? t[1] : "GMT";
                          }
                          D[e >> 2] = 60 * u, D[t >> 2] = Number(s != a);
                          var c = l(o), d = l(i), f = ve(c), h = ve(d);
                          a < s
                            ? (F[r >> 2] = f, F[r + 4 >> 2] = h)
                            : (F[r >> 2] = h, F[r + 4 >> 2] = f);
                        }(t, r, n));
                    },
                    q: function () {
                      return 2147483648;
                    },
                    d: fe,
                    o: function (e, t, r) {
                      x.copyWithin(e, t, t + r);
                    },
                    c: function (e) {
                      var t, r = x.length, n = 2147483648;
                      if ((e >>>= 0) > n) return !1;
                      for (var o = 1; o <= 4; o *= 2) {
                        var i = r * (1 + .2 / o);
                        if (
                          i = Math.min(i, e + 100663296),
                            be(
                              Math.min(
                                n,
                                (t = Math.max(e, i)) +
                                  (65536 - t % 65536) % 65536,
                              ),
                            )
                        ) return !0;
                      }
                      return !1;
                    },
                    z: function (e, t) {
                      var r = 0;
                      return we().forEach(function (n, o) {
                        var i = t + r;
                        F[e + 4 * o >> 2] = i,
                          function (e, t, r) {
                            for (var n = 0; n < e.length; ++n) {
                              q[t++ >> 0] = e.charCodeAt(n);
                            }
                            q[t >> 0] = 0;
                          }(n, i),
                          r += n.length + 1;
                      }),
                        0;
                    },
                    A: function (e, t) {
                      var r = we();
                      F[e >> 2] = r.length;
                      var n = 0;
                      return r.forEach(function (e) {
                        n += e.length + 1;
                      }),
                        F[t >> 2] = n,
                        0;
                    },
                    f: function (e) {
                      try {
                        var t = me.getStreamFromFD(e);
                        return he.close(t), 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                    m: function (e, t) {
                      try {
                        var r = me.getStreamFromFD(e),
                          n = r.tty
                            ? 2
                            : he.isDir(r.mode)
                            ? 3
                            : he.isLink(r.mode)
                            ? 7
                            : 4;
                        return q[t >> 0] = n, 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                    u: function (e, t, r, n) {
                      try {
                        var o = function (e, t, r, n) {
                          for (var o = 0, i = 0; i < r; i++) {
                            var s = F[t >> 2], a = F[t + 4 >> 2];
                            t += 8;
                            var u = he.read(e, q, s, a, undefined);
                            if (u < 0) return -1;
                            if (o += u, u < a) break;
                          }
                          return o;
                        }(me.getStreamFromFD(e), t, r);
                        return F[n >> 2] = o, 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                    k: function (e, t, r, n, o) {
                      try {
                        var i = pe(t, r);
                        if (isNaN(i)) return 61;
                        var s = me.getStreamFromFD(e);
                        return he.llseek(s, i, n),
                          V = [
                            s.position >>> 0,
                            (U = s.position,
                              +Math.abs(U) >= 1
                                ? U > 0
                                  ? (0 |
                                    Math.min(
                                      +Math.floor(U / 4294967296),
                                      4294967295,
                                    )) >>> 0
                                  : ~~+Math.ceil(
                                    (U - +(~~U >>> 0)) / 4294967296,
                                  ) >>> 0
                                : 0),
                          ],
                          D[o >> 2] = V[0],
                          D[o + 4 >> 2] = V[1],
                          s.getdents && 0 === i && 0 === n &&
                          (s.getdents = null),
                          0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                    C: function (e) {
                      try {
                        var t = me.getStreamFromFD(e);
                        return t.stream_ops && t.stream_ops.fsync
                          ? t.stream_ops.fsync(t)
                          : 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                    r: function (e, t, r, n) {
                      try {
                        var o = function (e, t, r, n) {
                          for (var o = 0, i = 0; i < r; i++) {
                            var s = F[t >> 2], a = F[t + 4 >> 2];
                            t += 8;
                            var u = he.write(e, q, s, a, undefined);
                            if (u < 0) return -1;
                            o += u;
                          }
                          return o;
                        }(me.getStreamFromFD(e), t, r);
                        return F[n >> 2] = o, 0;
                      } catch (e) {
                        if (void 0 === he || !(e instanceof he.ErrnoError)) {
                          throw e;
                        }
                        return e.errno;
                      }
                    },
                  },
                  Ce = (function () {
                    var e = { a: Te };
                    function t(e, t) {
                      var r, n = e.exports;
                      i.asm = n,
                        B((k = i.asm.J).buffer),
                        N = i.asm.Da,
                        r = i.asm.K,
                        X.unshift(r),
                        J();
                    }
                    function r(e) {
                      t(e.instance);
                    }
                    function n(t) {
                      return function () {
                        if (!w && (_ || v)) {
                          if ("function" == typeof fetch && !te(H)) {
                            return fetch(H, { credentials: "same-origin" })
                              .then(function (e) {
                                if (!e.ok) {
                                  throw "failed to load wasm binary file at '" +
                                    H + "'";
                                }
                                return e.arrayBuffer();
                              }).catch(function () {
                                return re(H);
                              });
                          }
                          if (u) {
                            return new Promise(function (e, t) {
                              u(H, function (t) {
                                e(new Uint8Array(t));
                              }, t);
                            });
                          }
                        }
                        return Promise.resolve().then(function () {
                          return re(H);
                        });
                      }().then(function (t) {
                        return WebAssembly.instantiate(t, e);
                      }).then(function (e) {
                        return e;
                      }).then(t, function (e) {
                        E("failed to asynchronously prepare wasm: " + e), Z(e);
                      });
                    }
                    if (Q(), i.instantiateWasm) {
                      try {
                        return i.instantiateWasm(e, t);
                      } catch (e) {
                        return E(
                          "Module.instantiateWasm callback failed with error: " +
                            e,
                        ),
                          !1;
                      }
                    }
                    w ||
                      "function" != typeof WebAssembly.instantiateStreaming ||
                      ee(H) || te(H) || b || "function" != typeof fetch
                      ? n(r)
                      : fetch(H, { credentials: "same-origin" }).then(
                        function (t) {
                          return WebAssembly.instantiateStreaming(t, e).then(
                            r,
                            function (e) {
                              return E("wasm streaming compile failed: " + e),
                                E("falling back to ArrayBuffer instantiation"),
                                n(r);
                            },
                          );
                        },
                      );
                  }(),
                    i.___wasm_call_ctors = function () {
                      return (i.___wasm_call_ctors = i.asm.K).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_malloc = function () {
                      return (i._sqlite3_malloc = i.asm.L).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_free = function () {
                      return (i._sqlite3_free = i.asm.M).apply(null, arguments);
                    },
                    i.___errno_location = function () {
                      return (Ce = i.___errno_location = i.asm.N).apply(
                        null,
                        arguments,
                      );
                    }),
                  Oe = (i._sqlite3_finalize = function () {
                    return (i._sqlite3_finalize = i.asm.O).apply(
                      null,
                      arguments,
                    );
                  },
                    i._sqlite3_reset = function () {
                      return (i._sqlite3_reset = i.asm.P).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_clear_bindings = function () {
                      return (i._sqlite3_clear_bindings = i.asm.Q).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_blob = function () {
                      return (i._sqlite3_value_blob = i.asm.R).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_text = function () {
                      return (i._sqlite3_value_text = i.asm.S).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_bytes = function () {
                      return (i._sqlite3_value_bytes = i.asm.T).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_double = function () {
                      return (i._sqlite3_value_double = i.asm.U).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_int = function () {
                      return (i._sqlite3_value_int = i.asm.V).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_value_type = function () {
                      return (i._sqlite3_value_type = i.asm.W).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_blob = function () {
                      return (i._sqlite3_result_blob = i.asm.X).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_double = function () {
                      return (i._sqlite3_result_double = i.asm.Y).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_error = function () {
                      return (i._sqlite3_result_error = i.asm.Z).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_int = function () {
                      return (i._sqlite3_result_int = i.asm._).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_int64 = function () {
                      return (i._sqlite3_result_int64 = i.asm.$).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_null = function () {
                      return (i._sqlite3_result_null = i.asm.aa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_result_text = function () {
                      return (i._sqlite3_result_text = i.asm.ba).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_step = function () {
                      return (i._sqlite3_step = i.asm.ca).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_count = function () {
                      return (i._sqlite3_column_count = i.asm.da).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_data_count = function () {
                      return (i._sqlite3_data_count = i.asm.ea).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_blob = function () {
                      return (i._sqlite3_column_blob = i.asm.fa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_bytes = function () {
                      return (i._sqlite3_column_bytes = i.asm.ga).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_double = function () {
                      return (i._sqlite3_column_double = i.asm.ha).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_text = function () {
                      return (i._sqlite3_column_text = i.asm.ia).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_type = function () {
                      return (i._sqlite3_column_type = i.asm.ja).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_column_name = function () {
                      return (i._sqlite3_column_name = i.asm.ka).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_bind_blob = function () {
                      return (i._sqlite3_bind_blob = i.asm.la).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_bind_double = function () {
                      return (i._sqlite3_bind_double = i.asm.ma).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_bind_int = function () {
                      return (i._sqlite3_bind_int = i.asm.na).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_bind_text = function () {
                      return (i._sqlite3_bind_text = i.asm.oa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_bind_parameter_index = function () {
                      return (i._sqlite3_bind_parameter_index = i.asm.pa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_sql = function () {
                      return (i._sqlite3_sql = i.asm.qa).apply(null, arguments);
                    },
                    i._sqlite3_normalized_sql = function () {
                      return (i._sqlite3_normalized_sql = i.asm.ra).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_errmsg = function () {
                      return (i._sqlite3_errmsg = i.asm.sa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_exec = function () {
                      return (i._sqlite3_exec = i.asm.ta).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_prepare_v2 = function () {
                      return (i._sqlite3_prepare_v2 = i.asm.ua).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_create_module_v2 = function () {
                      return (i._sqlite3_create_module_v2 = i.asm.va).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_declare_vtab = function () {
                      return (i._sqlite3_declare_vtab = i.asm.wa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_changes = function () {
                      return (i._sqlite3_changes = i.asm.xa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_close_v2 = function () {
                      return (i._sqlite3_close_v2 = i.asm.ya).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_create_function_v2 = function () {
                      return (i._sqlite3_create_function_v2 = i.asm.za).apply(
                        null,
                        arguments,
                      );
                    },
                    i._sqlite3_open = function () {
                      return (i._sqlite3_open = i.asm.Aa).apply(
                        null,
                        arguments,
                      );
                    },
                    i._malloc = function () {
                      return (Oe = i._malloc = i.asm.Ba).apply(null, arguments);
                    }),
                  Le = i._free = function () {
                    return (Le = i._free = i.asm.Ca).apply(null, arguments);
                  },
                  Be = (i._RegisterExtensionFunctions = function () {
                    return (i._RegisterExtensionFunctions = i.asm.Ea).apply(
                      null,
                      arguments,
                    );
                  },
                    i._emscripten_builtin_memalign = function () {
                      return (Be = i._emscripten_builtin_memalign = i.asm.Fa)
                        .apply(null, arguments);
                    }),
                  Ne = i.stackSave = function () {
                    return (Ne = i.stackSave = i.asm.Ga).apply(null, arguments);
                  },
                  He = i.stackRestore = function () {
                    return (He = i.stackRestore = i.asm.Ha).apply(
                      null,
                      arguments,
                    );
                  },
                  Ie = i.stackAlloc = function () {
                    return (Ie = i.stackAlloc = i.asm.Ia).apply(
                      null,
                      arguments,
                    );
                  };
                function Ue(e) {
                  function t() {
                    je ||
                      (je = !0,
                        i.calledRun = !0,
                        R ||
                        (i.noFSInit || he.init.initialized || he.init(),
                          he.ignorePermissions = !1,
                          le.init(),
                          ne(X),
                          i.onRuntimeInitialized && i.onRuntimeInitialized(),
                          function () {
                            if (i.postRun) {
                              for (
                                "function" == typeof i.postRun &&
                                (i.postRun = [i.postRun]);
                                i.postRun.length;
                              ) e = i.postRun.shift(), G.unshift(e);
                            }
                            var e;
                            ne(G);
                          }()));
                  }
                  e = e || m,
                    $ > 0 || (function () {
                      if (i.preRun) {
                        for (
                          "function" == typeof i.preRun &&
                          (i.preRun = [i.preRun]);
                          i.preRun.length;
                        ) e = i.preRun.shift(), W.unshift(e);
                      }
                      var e;
                      ne(W);
                    }(),
                      $ > 0 ||
                      (i.setStatus
                        ? (i.setStatus("Running..."),
                          setTimeout(function () {
                            setTimeout(function () {
                              i.setStatus("");
                            }, 1), t();
                          }, 1))
                        : t()));
                }
                if (
                  i.UTF8ToString = T,
                    i.stringToUTF8 = O,
                    i.lengthBytesUTF8 = L,
                    i.stackAlloc = Ie,
                    i.stackSave = Ne,
                    i.stackRestore = He,
                    i.ccall = Re,
                    i.cwrap = function (e, t, r, n) {
                      var o = (r = r || []).every(
                        (e) => "number" === e || "boolean" === e,
                      );
                      return "string" !== t && o && !n ? Pe(e) : function () {
                        return Re(e, t, r, arguments);
                      };
                    },
                    i.addFunction = Me,
                    i.setValue = ie,
                    i.getValue = oe,
                    Y = function e() {
                      je || Ue(), je || (Y = e);
                    },
                    i.preInit
                ) {
                  for (
                    "function" == typeof i.preInit && (i.preInit = [i.preInit]);
                    i.preInit.length > 0;
                  ) i.preInit.pop()();
                }
                return Ue(), i;
              }));
            };
          e.exports = o, e.exports.default = o;
        },
        720: (e, t, r) => {
          "use strict";
          e.exports = r.p + "sql-wasm.wasm";
        },
        821: () => {},
        905: () => {},
        101: () => {},
      },
      __webpack_module_cache__ = {};
    function __webpack_require__(e) {
      var t = __webpack_module_cache__[e];
      if (void 0 !== t) return t.exports;
      var r = __webpack_module_cache__[e] = { id: e, loaded: !1, exports: {} };
      return __webpack_modules__[e].call(
        r.exports,
        r,
        r.exports,
        __webpack_require__,
      ),
        r.loaded = !0,
        r.exports;
    }
    __webpack_require__.d = (e, t) => {
      for (var r in t) {
        __webpack_require__.o(t, r) && !__webpack_require__.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
      }
    },
      __webpack_require__.o = (e, t) =>
        Object.prototype.hasOwnProperty.call(e, t),
      __webpack_require__.r = (e) => {
        "undefined" != typeof Symbol && Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      },
      __webpack_require__.nmd = (
        e,
      ) => (e.paths = [], e.children || (e.children = []), e),
      __webpack_require__.p = "";
    var __webpack_exports__ = __webpack_require__(630);
    return __webpack_exports__;
  })();
});
//# sourceMappingURL=sqlite.worker.js.map
