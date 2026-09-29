// Service worker de RedAL. Política deliberadamente conservadora:
//  - Solo se cachea el ícono y la página sin conexión.
//  - Los archivos de /_next/static NO se cachean acá: el navegador ya los guarda por su cuenta
//    (llevan hash en el nombre) y, si el service worker los servía primero, tras cada despliegue o
//    actualización quedaba código viejo en el navegador y la página fallaba al hidratarse.
//  - Las páginas y las llamadas a datos NUNCA se cachean: contienen información de la
//    persona con sesión y no deben quedar disponibles para otra en el mismo dispositivo.
//  - Sin conexión, las navegaciones muestran /offline.html.

// v3: al activarse borra el caché v2, que guardaba archivos de /_next/static.
const STATIC_CACHE = "redal-static-v3";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/icon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === "/icon.svg") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
