"use strict";

async function main() {
  if (!("serviceWorker" in navigator)) {
    alert("Your browser does not support Service Workers!");
    return;
  }

  const newRegistration = await navigator.serviceWorker.register(
    "/service-worker.js",
    {
      scope: "/",
    },
  );
  console.log("New service worker registered:", newRegistration);

  await navigator.serviceWorker.ready;

  if (navigator.serviceWorker.controller == null) {
    window.location.reload();
  }
}

main();
