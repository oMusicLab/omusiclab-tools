/* Minimal service worker for installable PWA shell caching */
var CACHE_NAME = "oml-tools-shell-v1";
var SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/shared/favicon.svg",
  "/shared/omusiclab-theme.css",
  "/shared/oml-hub.css",
  "/shared/oml-hub.js",
  "/shared/oml-logo-mark.js",
];

function isShellRequest(url) {
  if (url.pathname === "/" || url.pathname === "/index.html") return true;
  if (url.pathname.indexOf("/shared/oml-hub") !== -1) return true;
  if (url.pathname === "/manifest.webmanifest") return true;
  if (url.pathname === "/sw.js") return true;
  return false;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var url = new URL(event.request.url);

  if (event.request.mode === "navigate" && !isShellRequest(url)) {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match("/index.html");
      })
    );
    return;
  }

  if (!isShellRequest(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
