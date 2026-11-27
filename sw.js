/* Service worker Cicaww33 — membuat game (Chapter 1–4 lengkap) bisa dibuka offline setelah pernah dimuat sekali.
   Naikkan VERSION setiap kali kamu mengganti index.html / aset / ikon agar pemain mendapat versi baru. */
const VERSION = "cicaww33-v12-polish";
const SHELL = [
  "./", "./index.html", "./manifest.webmanifest?v=11",
  "./icons/icon-192.png?v=11", "./icons/icon-512.png?v=11", "./icons/icon-maskable-512.png?v=11",
  "./icons/apple-touch-icon.png?v=11", "./icons/favicon-32.png?v=11",
  "./assets/vendor/tailwind.js",
  "./assets/vendor/three.min.js",
  "./assets/vendor/CopyShader.js",
  "./assets/vendor/LuminosityHighPassShader.js",
  "./assets/vendor/EffectComposer.js",
  "./assets/vendor/MaskPass.js",
  "./assets/vendor/ShaderPass.js",
  "./assets/vendor/RenderPass.js",
  "./assets/vendor/UnrealBloomPass.js",
  "./assets/textures/ch4_textures.js",
  "./assets/animations/ch4_shaders_anim.js",
  "./assets/characters/ch4_character_core.js",
  "./assets/characters/rizka/rizka_builder.js",
  "./assets/characters/kael/kael_builder.js",
  "./assets/characters/nadine/nadine_builder.js",
  "./assets/props/ch4_props.js",
  "./assets/environments/apartment/scene1_corridor.js",
  "./assets/environments/school/scene2_4_corridor.js",
  "./assets/environments/school/scene3_classroom.js",
  "./assets/environments/rooftop/scene5_rooftop.js",
  "./assets/audio/ch4_audio.js",
  "./assets/story/ch4_story_data.js",
  "./assets/story/ch4_unified_controller.js",
];
const CDN = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.allSettled(SHELL.map((u) => cache.add(u)));
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
