"use strict";

importScripts("./webmirror.esm.js");

// import { wmFetch } from "./webmirror.esm.js";

self.addEventListener("install", (event) => {
  console.log("[service-worker] install", event);

  // The promise that skipWaiting() returns can be safely ignored.
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[service-worker] activate", event);

  // https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  console.log("[service-worker] fetch", event);
  const url = new URL(event.request.url);
  if (url.hostname.endsWith(".webmirror")) {
    console.log("[service-worker] fetch (responding...)", url);
    event.respondWith(webmirror.wmFetch(event));
  }

  // passthrough
  return;
});
