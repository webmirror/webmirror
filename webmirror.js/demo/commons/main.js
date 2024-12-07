"use strict";

async function main() {
  if (!("serviceWorker" in navigator)) {
    alert("Your browser does not support Service Workers!");
    return;
  }

  // const oldRegistrations = await navigator.serviceWorker.getRegistrations();
  // for (const reg of oldRegistrations) {
  //   reg.unregister();
  //   console.log("Old service worker unregistered:", reg);
  // }

  const newRegistration = await navigator.serviceWorker.register(
    "/service-worker.js",
    {
      scope: "/",
    },
  );
  console.log("New service worker registered:", newRegistration);

  await navigator.serviceWorker.ready;
}

main();
