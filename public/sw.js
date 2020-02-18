importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

workbox.precaching.precacheAndRoute([
    {url:'/index.html', revision:1}
])

workbox.routing.registerRoute(
    /.*\.(?:js|css)/,
    workbox.strategies.staleWhileRevalidate({
        cacheName: 'workbox:css',
    })
);

workbox.routing.registerRoute(
    /.*\.png/,
    workbox.strategies.cacheFirst({
        cacheName: 'workbox:image',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ],
    })
);