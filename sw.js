const CACHE_NAME =
  "calendar-2x2-v1";

const ASSETS = [

  "./",

  "./index.html",

  "./styles.css",

  "./app.js",

  "./manifest.webmanifest",

  "./utils/calendar.js"

];

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(ASSETS);
        })

    );

  }
);

self.addEventListener(
  "fetch",
  (event) => {

    event.respondWith(

      caches.match(event.request)
        .then((response) => {

          return (
            response ||
            fetch(event.request)
          );

        })

    );

  }
);