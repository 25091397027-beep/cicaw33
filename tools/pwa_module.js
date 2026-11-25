/* ===== PWA: pasang aplikasi + ikon yang bisa diatur ===== */
(function () {
  "use strict";
  const KEY = "cicaww33_app_icon_v1";
  const $ = (id) => document.getElementById(id);
  const isStandalone = () => matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const secure = window.isSecureContext && /^https?:$/.test(location.protocol);
  const toast = (m, t) => { try { Toast.show(m, t || "info", 3500); } catch (_) {} };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (_) { return null; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (_) { return false; } };

  /* ---------- gambar ikon ---------- */
  let srcImg = null; // HTMLImageElement | null
  function draw(size, opt) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d");
    const r = opt.maskable ? 0 : size * 0.22;
    g.fillStyle = opt.bg; g.beginPath();
    if (g.roundRect && r) g.roundRect(0, 0, size, size, r); else g.rect(0, 0, size, size);
    g.fill();
    if (srcImg) {
      const safe = opt.maskable ? 0.8 : 1;
      const box = size * safe * opt.zoom;
      const k = Math.min(box / srcImg.width, box / srcImg.height);
      const w = srcImg.width * k, h = srcImg.height * k;
      g.save();
      if (!opt.maskable) { g.beginPath(); if (g.roundRect) g.roundRect(0, 0, size, size, r); else g.rect(0, 0, size, size); g.clip(); }
      g.drawImage(srcImg, (size - w) / 2, (size - h) / 2, w, h);
      g.restore();
    }
    return c;
  }
  const state = { bg: "#162033", zoom: 1, data: null };

  function renderPreview() {
    const cv = $("icon-preview"); if (!cv) return;
    const g = cv.getContext("2d"); g.clearRect(0, 0, 128, 128);
    if (srcImg) g.drawImage(draw(128, { bg: state.bg, zoom: state.zoom }), 0, 0);
    else { const d = new Image(); d.onload = () => g.drawImage(d, 0, 0, 128, 128); d.src = "icons/icon-192.png?v=7"; }
  }

  function setLink(id, rel, href, extra) {
    let el = $(id);
    if (!el) { el = document.createElement("link"); el.id = id; el.rel = rel; document.head.appendChild(el); }
    el.href = href; if (extra) Object.assign(el, extra);
  }

  function applyCustom() {
    const o = { bg: state.bg, zoom: state.zoom };
    const png = (n, m) => draw(n, { ...o, maskable: !!m }).toDataURL("image/png");
    const i192 = png(192), i512 = png(512), im512 = png(512, true), apple = png(180), fav = png(32);
    setLink("pwa-apple-icon", "apple-touch-icon", apple);
    setLink("pwa-favicon", "icon", fav);
    // PENTING: manifest TIDAK diganti. Manifest dari blob:/data: membuat Chrome menganggap situs tidak bisa
    // diinstal (hanya muncul "Tambahkan ke layar utama" = pintasan berlogo Chrome). Ikon aplikasi di Android
    // diambil dari file di folder icons/ (lihat README).
    setLink("pwa-manifest", "manifest", "manifest.webmanifest?v=7");
  }

  /* ---------- paket ikon (.zip) untuk ditimpa ke folder icons/ ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function makeZip(files) { // files: [{name, data:Uint8Array}] — tanpa kompresi (PNG sudah terkompresi)
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    const d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach((f) => {
      const nm = enc.encode(f.name), crc = crc32(f.data), sz = f.data.length;
      const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true); lh.setUint16(26, nm.length, true);
      parts.push(new Uint8Array(lh.buffer), nm, f.data);
      const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
      central.push(new Uint8Array(ch.buffer), nm);
      off += 30 + nm.length + sz;
    });
    const csize = central.reduce((a, b) => a + b.length, 0);
    const end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, off, true);
    return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: "application/zip" });
  }
  const toBytes = (canvas) => new Promise((res) => canvas.toBlob((b) => b.arrayBuffer().then((a) => res(new Uint8Array(a))), "image/png"));

  async function exportPack() {
    if (!srcImg) { toast("Pilih gambar ikon dulu, baru unduh paketnya.", "info"); return; }
    const o = { bg: state.bg, zoom: state.zoom };
    const list = [
      ["icons/icon-192.png", 192, false], ["icons/icon-512.png", 512, false], ["icons/icon-maskable-512.png", 512, true],
      ["icons/apple-touch-icon.png", 180, false], ["icons/favicon-32.png", 32, false],
    ];
    const files = [];
    for (const [name, size, mask] of list) files.push({ name, data: await toBytes(draw(size, { ...o, maskable: mask })) });
    const url = URL.createObjectURL(makeZip(files));
    const a = document.createElement("a"); a.href = url; a.download = "cicaww33-icons.zip"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast("Paket ikon diunduh. Ekstrak, timpa isi folder icons/ di GitHub, lalu pasang ulang aplikasi.", "success");
  }

  function resetDefault() {
    try { localStorage.removeItem(KEY); } catch (_) {}
    srcImg = null; state.bg = "#162033"; state.zoom = 1; state.data = null;
    setLink("pwa-apple-icon", "apple-touch-icon", "icons/apple-touch-icon.png?v=7");
    setLink("pwa-favicon", "icon", "icons/favicon-32.png?v=7");
    setLink("pwa-manifest", "manifest", "manifest.webmanifest?v=7");
    syncUI(); renderPreview();
  }

  function syncUI() { if ($("icon-zoom")) { $("icon-zoom").value = state.zoom; $("icon-bg").value = state.bg; } }

  function persistAndApply() {
    if (!srcImg || !state.data) return;
    save({ data: state.data, bg: state.bg, zoom: state.zoom });
    applyCustom();
  }

  function pickFile(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      const im = new Image();
      im.onload = () => {
        const m = 768, k = Math.min(1, m / Math.max(im.width, im.height));
        const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        state.data = c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.9);
        const im2 = new Image(); im2.onload = () => { srcImg = im2; renderPreview(); persistAndApply(); toast("Ikon tab diperbarui. Ikon aplikasi di Android memakai file di folder icons/."); }; im2.src = state.data;
      };
      im.onerror = () => toast("File gambar tidak bisa dibaca.");
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------- install ---------- */
  let deferred = null;
  function refreshButtons() {
    const show = !isStandalone();
    ["btn-install-app", "btn-install-app-2"].forEach((id) => { const b = $(id); if (b) b.classList.toggle("hidden", !show); });
  }
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; refreshButtons(); });
  window.addEventListener("appinstalled", () => { deferred = null; refreshButtons(); toast("Aplikasi terpasang 🎉", "success"); });

  async function install() {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (_) {}
      deferred = null; return;
    }
    let msg;
    if (location.protocol === "file:") msg = "Game sedang dibuka dari file lokal. Agar bisa diinstal, unggah seluruh folder ke hosting HTTPS (Netlify, GitHub Pages, Cloudflare Pages) lalu buka alamat webnya.";
    else if (!secure) msg = "Instalasi butuh koneksi aman (HTTPS). Buka game lewat alamat https://.";
    else if (isIOS) msg = "iPhone/iPad (Safari): ketuk tombol Bagikan (kotak dengan panah ke atas) → gulir → 'Tambah ke Layar Utama' → Tambah.";
    else msg = "Buka menu browser (⋮) lalu pilih 'Instal aplikasi' atau 'Tambahkan ke layar utama'. Jika tidak ada, buka lewat Chrome/Edge/Safari.";
    ConfirmModal.open({ tag: "Pasang Aplikasi", title: "Cara memasang", message: msg, confirmText: "Mengerti", onConfirm() {} });
  }

  /* ---------- service worker ---------- */
  function registerSW() {
    if (!("serviceWorker" in navigator) || !(secure && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1"))) return;
    navigator.serviceWorker.register("sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) toast("Versi baru tersedia — muat ulang untuk memperbarui.", "success");
        });
      });
    }).catch((e) => console.warn("SW gagal:", e));
  }

  function init() {
    const saved = load();
    if (saved && saved.data) {
      state.bg = saved.bg || state.bg; state.zoom = +saved.zoom || 1; state.data = saved.data;
      const im = new Image(); im.onload = () => { srcImg = im; syncUI(); renderPreview(); applyCustom(); }; im.src = saved.data;
    } else { renderPreview(); }
    syncUI(); refreshButtons();
    $("btn-install-app")?.addEventListener("click", install);
    $("btn-install-app-2")?.addEventListener("click", install);
    $("btn-icon-pick")?.addEventListener("click", () => $("icon-file").click());
    $("icon-file")?.addEventListener("change", (e) => { pickFile(e.target.files[0]); e.target.value = ""; });
    $("btn-icon-export")?.addEventListener("click", exportPack);
    $("btn-icon-reset")?.addEventListener("click", () => { resetDefault(); toast("Ikon dikembalikan ke bawaan."); });
    let t;
    const upd = () => { state.zoom = +$("icon-zoom").value; state.bg = $("icon-bg").value; renderPreview(); clearTimeout(t); t = setTimeout(persistAndApply, 250); };
    $("icon-zoom")?.addEventListener("input", upd);
    $("icon-bg")?.addEventListener("input", upd);
    registerSW();
  }
  if (document.readyState === "complete") init(); else window.addEventListener("load", init);
})();

  