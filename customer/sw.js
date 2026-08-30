/* ============================================================
   FIX MY WORK — PRODUCTION SERVICE WORKER
   ============================================================ */

const CACHE_NAME = "fix-my-work-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js",
    "./firebase-config.js",
    "./manifest.json"
];

/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );

});


/* ============================================================
   ACTIVATE
   ============================================================ */

self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {

                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );

            })
            .then(() => self.clients.claim())
    );

});


/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener("fetch", (event) => {

    const request = event.request;

    /*
     * Only handle GET requests.
     */

    if (request.method !== "GET") {
        return;
    }


    /*
     * Firebase / Google / external APIs
     * should remain network controlled.
     */

    const url = new URL(request.url);

    if (
        url.hostname.includes("googleapis.com") ||
        url.hostname.includes("firebaseio.com") ||
        url.hostname.includes("firebaseapp.com") ||
        url.hostname.includes("gstatic.com")
    ) {
        return;
    }


    /*
     * Navigation requests:
     * network first, cache fallback.
     */

    if (request.mode === "navigate") {

        event.respondWith(

            fetch(request)
                .then((response) => {

                    if (response && response.ok) {

                        const responseClone =
                            response.clone();

                        caches
                            .open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(
                                    request,
                                    responseClone
                                );
                            });
                    }

                    return response;
                })
                .catch(() => {

                    return caches
                        .match("./index.html")
                        .then((cached) => {

                            return cached ||
                                caches.match("./");

                        });

                })
        );

        return;
    }


    /*
     * Static assets:
     * cache first, then network.
     */

    event.respondWith(

        caches
            .match(request)
            .then((cachedResponse) => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then((response) => {

                        if (
                            response &&
                            response.ok &&
                            response.type === "basic"
                        ) {

                            const responseClone =
                                response.clone();

                            caches
                                .open(CACHE_NAME)
                                .then((cache) => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });
                        }

                        return response;
                    });

            })
    );

});
