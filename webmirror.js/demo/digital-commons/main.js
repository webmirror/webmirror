"use strict";

async function setupServiceWorker() {
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

setupServiceWorker();

/******************************************************************************
 * OpenStreetMap
 ******************************************************************************/
function setupMap() {
  const mapElem = document.querySelector("#map");

  function initMapLibreGL() {
    const map = new maplibregl.Map({
      style: "/openstreetmap/bright",
      center: [2.743308122111671, 50.8390414028689],
      zoom: 5,
      maxZoom: 6,
      container: "map",
      scrollZoom: false
    });
    const zoomControl = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true
    });
    map.addControl(zoomControl, 'top-right');
  }

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        initMapLibreGL();
        // Stop observing once initialized
        observer.unobserve(mapElem);
      }
    });
  };

  const observerOptions = {
    // Observe relative to the viewport
    root: null,
    // Trigger when 1% of the map is visible
    threshold: 0.01,
  };
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  observer.observe(mapElem);
}

setupMap();

/******************************************************************************
 * Open Library
 ******************************************************************************/
async function setupSQL() {
  const config = {
    from: "jsonconfig",
    configUrl:
      "/.webmirror/bzcp4cesceixrxnon6uy3gsz6tlh3kma2v2stz4unjcwilv2ueaa/config.json",
  };

  async function initWorker() {
    window.worker = await createDbWorker(
      [config],
      "/sqlite.worker.js",
      "/sql-wasm.wasm",
    );
  }

  document.querySelector("form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const template = `
      <li>
        <a href="https://openlibrary.org{{ key }}">{{ title }}</a> by {{ author }}
      </li>
    `;
    const div = document.querySelector("#olResults");
    const query = document.querySelector("form input").value;

    if (!window.worker) {
      await initWorker();
    }

    const results = await window.worker.db.exec(
      `select openlibrary_key as key, title, author from works_fts5(?) limit 5;`,
      [query],
    );
    if (results.length === 0) {
      div.textContent = "No results found.";
      return;
    }

    div.innerHTML = "";
    for (const result of results[0].values) {
      const rendered = Mustache.render(template, {
        key: result[0],
        title: result[1],
        author: result[2],
      });
      div.innerHTML += rendered;
    }
  });
}

setupSQL();