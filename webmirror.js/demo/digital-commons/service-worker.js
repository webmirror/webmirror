"use strict";

importScripts("./webmirror.esm.js");

self.addEventListener("install", (_event) => {
  // The promise that skipWaiting() returns can be safely ignored.
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.endsWith(".webmirror") || url.pathname.startsWith("/.webmirror")) {
    event.respondWith(webmirror.wmFetch(event));
  }

  // Passthrough: let the browser handle it as usual.
  return;
});
