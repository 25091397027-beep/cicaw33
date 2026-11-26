# Cicaww33 — A Story Beneath the Rain (versi aplikasi / PWA)

## Isi folder
- `index.html` — game (sudah berisi perbaikan suara untuk HP)
- `manifest.webmanifest` — data aplikasi (nama, warna, ikon)
- `sw.js` — service worker (agar bisa offline setelah dibuka sekali)
- `icons/` — ikon aplikasi (192, 512, maskable, apple-touch, favicon)
- `tools/buat_ikon.py` — pembuat ikon dari gambarmu

## Cara agar bisa diinstal siapa saja
Aplikasi hanya bisa diinstal dari alamat **HTTPS** (bukan file yang dibuka langsung).
1. Unggah SELURUH isi folder ini ke hosting gratis: Netlify Drop (drag & drop folder), GitHub Pages, atau Cloudflare Pages.
2. Bagikan alamat webnya.
3. Android/Chrome: tombol **📲 Pasang Aplikasi** muncul di menu utama (atau menu ⋮ → Instal aplikasi).
4. iPhone/iPad (Safari): Bagikan → **Tambah ke Layar Utama**.
Buka pertama kali butuh internet; setelah itu bisa offline.

## Mengganti gambar ikon (agar ikon aplikasi terpasang ikut berubah)
Ikon aplikasi yang terpasang SELALU diambil dari file di folder `icons/` yang ada di GitHub, bukan dari pengaturan di dalam game. Pengaturan di game hanya mengubah ikon tab di perangkat itu. Jadi caranya:
1. Buka game → Pengaturan → *Aplikasi & Ikon* → **Pilih Gambar Ikon**, atur zoom dan warna latar.
2. Tekan **Unduh Paket Ikon (.zip)** → ekstrak. Isinya 5 file PNG dengan nama yang sudah benar.
3. Di GitHub, buka folder `icons/` → *Add file → Upload files* → timpa kelima file itu → Commit.
4. Tunggu ±1 menit sampai GitHub Pages selesai deploy.
5. **Hapus aplikasi lama** dari layar utama, buka alamat web game di Chrome, lalu pasang ulang (Instal aplikasi). Ikon aplikasi lama tidak diperbarui otomatis di sebagian HP.
Cara lain: `python3 tools/buat_ikon.py gambarmu.png --bg "#162033" --zoom 1.1` (butuh Pillow).
Jika kamu mengganti ikon lagi di kemudian hari, naikkan angka `?v=10` di `manifest.webmanifest`, `index.html` (3 tempat di bagian atas) dan `VERSION` di `sw.js` (mis. jadi 11) agar tidak tersangkut cache.

## Suara di HP
Semua suara (musik, hujan, efek) dibuat langsung oleh browser lewat Web Audio API — tidak ada file suara dan tidak ada pustaka luar (Tone.js sudah dibuang), jadi tidak bisa gagal diunduh.
Browser HP memblokir suara sampai layar disentuh. Game kini membuka suara otomatis pada sentuhan pertama, dan menampilkan tombol "Ketuk layar untuk menyalakan suara" bila masih terkunci. Di iPhone, suara tetap terdengar walau tombol silent aktif. Jika ada musik tidak terdengar, cek volume media dan pengaturan Audio di game.

## Ikon foto tidak bisa diinstal / muncul logo Chrome
Jangan ganti manifest lewat kode (blob/data URL): Chrome lalu menganggap situs tidak bisa diinstal dan hanya menawarkan pintasan berlogo Chrome. Ikon aplikasi Android selalu diambil dari file `icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`. Ganti file-file itu (ukuran harus sama persis), naikkan `VERSION` di `sw.js`, unggah, hapus aplikasi lama lalu pasang ulang lewat "Instal aplikasi".
