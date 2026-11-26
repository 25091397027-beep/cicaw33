/* Service worker Cicaww33 — membuat game bisa dibuka offline setelah pernah dimuat sekali.
   Naikkan VERSION setiap kali kamu mengganti index.html / ikon agar pemain mendapat versi baru. */
const VERSION = "cicaww33-v10-fix2";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest?v=10",
  "./icons/icon-192.png?v=10", "./icons/icon-512.png?v=10", "./icons/icon-maskable-512.png?v=10",
  "./icons/apple-touch-icon.png?v=10", "./icons/favicon-32.png?v=10",
];
const CDN = [
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/MaskPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.allSettled(SHELL.map((u) => cache.add(u)));
    // Pustaka CDN: gagal satu tidak membatalkan instalasi (akan di-cache saat dipakai)
    await Promise.allSettled(CDN.map((u) => fetch(new Request(u, { mode: "no-cors" })).then((r) => cache.put(u, r))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

const cacheable = (res) => res && (res.ok || res.type === "opaque");

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;

  // Halaman utama: coba jaringan dulu (agar update cepat), jatuh ke cache saat offline
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const net = await Promise.race([
          fetch(req),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
        ]);
        if (cacheable(net)) cache.put("./index.html", net.clone());
        return net;
      } catch (_) {
        return (await cache.match("./index.html", { ignoreSearch: true })) || (await cache.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Manifest & ikon: SELALU jaringan dulu (lewati cache HTTP), supaya ikon baru langsung terpakai.
  // Cache hanya dipakai saat offline. Query ?v= dihormati (tanpa ignoreSearch) agar tidak menyajikan ikon lama.
  if (url.origin === location.origin && /\/(icons\/|manifest\.webmanifest)/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await fetch(new Request(req.url, { cache: "reload" }));
        if (cacheable(res)) cache.put(req, res.clone());
        return res;
      } catch (_) {
        return (await cache.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Aset lain: cache dulu, lalu isi ulang dari jaringan
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    const refresh = fetch(req).then((res) => { if (cacheable(res)) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { event.waitUntil(refresh); return hit; }
    return (await refresh) || Response.error();
  })());
});
