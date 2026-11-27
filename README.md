# Cicaww33 — A Story Beneath the Rain (Unified Edition v11 • Chapter 1–4 Lengkap)

Seluruh cerita **Chapter 1 hingga Chapter 4** kini telah tergabung dalam **satu aplikasi utuh (`index.html`)** dan langsung dapat dimainkan baik secara *offline* (klik dua kali `index.html`) maupun dipasang sebagai aplikasi PWA di HP/PC.

## Daftar Chapter di Dalam Game
1. **Chapter 1 — Beneath the Rain:** Pertemuan Rizka & Kael di halaman sekolah saat hujan sore.
2. **Chapter 2 — Next Door:** Kejutan apartemen bersebelahan (Unit 302 & Unit 301), payung biru, & teh jahe hangat (Scene A–E).
3. **Chapter 3 — The Face Behind the Smile:** Kehidupan sekolah, proyek kelompok bersama Bu Mira, Hana, & Sena, serta perjalanan pulang senja (Scene A–E).
4. **Chapter 4 — A Little Closer:** Setelah telepon malam dari Ayah, koridor & kelas 11-A dekat jendela, kesalahpahaman kecil bersama Nadine, hingga pengakuan hangat saat *Golden Hour* di *rooftop* sekolah (Scene 1–5).

## Cara Langsung Memainkan
- **Langsung Buka di Komputer (`file://` / Offline):** Klik dua kali `index.html`. Seluruh pustaka Three.js `r128`, Tailwind CSS, model karakter 3D, *environment*, tekstur PBR prosedural, dan mesin suara Web Audio telah dibundel lokal di dalam folder `assets/` sehingga langsung berjalan tanpa internet.
- **Melalui Local Server (`http://`):**
  ```bash
  cd cicaww33-pwa
  python -m http.server 8090
  ```
  Lalu buka `http://localhost:8090`.
- **Memilih Chapter Secara Langsung:** Di Menu Utama, klik **Mulai Cerita** untuk bermain berurutan dari Chapter 1 → 4, klik **Mainkan Chapter 4** untuk langsung masuk ke Chapter 4, atau buka menu **Chapter** untuk memilih Chapter 1, 2, 3, atau 4 kapan saja.

## Isi Folder
- `index.html` — Game utama terpadu (Chapter 1–4 lengkap + perbaikan suara anti-kresek & responsif HP).
- `assets/` — Pustaka lokal (`vendor/`), karakter 3D (`characters/`), lingkungan 3D (`environments/`), tekstur (`textures/`), shader & animasi (`animations/`), properti (`props/`), musik/SFX (`audio/`), dan naskah cerita (`story/`).
- `manifest.webmanifest` — Metadata aplikasi PWA.
- `sw.js` — Service Worker offline (`cicaww33-v11-unified`).
- `icons/` — Ikon aplikasi (192, 512, maskable, apple-touch, favicon).
- `tools/` — Utilitas pembuat ikon (`buat_ikon.py`).

## Cara Agar Bisa Diinstal Siapa Saja (PWA)
Aplikasi hanya bisa diinstal dari alamat **HTTPS** (bukan file yang dibuka langsung).
1. Unggah **SELURUH isi folder ini** (termasuk `assets/` dan `icons/`) ke hosting gratis: Netlify Drop (drag & drop folder), GitHub Pages, atau Cloudflare Pages.
2. Bagikan alamat webnya.
3. Android/Chrome: tombol **📲 Pasang Aplikasi** muncul di menu utama (atau menu ⋮ → Instal aplikasi).
4. iPhone/iPad (Safari): Bagikan → **Tambah ke Layar Utama**.

## Mengganti Gambar Ikon
1. Buka game → Setelan → *Aplikasi & Ikon* → **Pilih Gambar Ikon**, atur zoom dan warna latar.
2. Tekan **Unduh Paket Ikon (.zip)** → ekstrak (5 file PNG).
3. Timpa kelima file di folder `icons/`, naikkan angka `?v=11` di `manifest.webmanifest`, `index.html`, dan `VERSION` di `sw.js` bila perlu, lalu pasang ulang aplikasi.

## Catatan Versi v12 (Polish)
- **Narasi Chapter 1:** kalimat "saat itu aku belum tahu Kael tetangganya" kini dibawakan Narasi/sistem, bukan ucapan Rizka.
- **Umpan balik salah:** suara salah diperkeras (dentum rendah + buzzer), disertai **getar HP**, **layar bergoyang**, dan **kilat merah**. Berlaku di Ch1 genangan, Ch2 mini-game, Ch3 & Ch4 semua tantangan.
- **Penilaian chapter (huruf & poin, akumulasi):** S ≥90%, A ≥75%, B ≥60%, C ≥40%, D di bawahnya. Kartu nilai muncul di akhir tiap chapter; rekor terbaik tersimpan di `localStorage` (`cicaww33_scores_v1`).
- **Chapter 3 – permintaan tolong:** kini mini-game visual (Hana: pilih elemen poster; Sena: urutkan agenda rapat). Hasil menentukan energi terpakai; energi ≤50% memotong waktu proyek 30 detik.
- **Chapter 4:** 8 interaksi baru (napas, baca bahasa tubuh, susun buku, sapaan spontan, reaksi spontan, susun catatan, kata jujur) menggantikan "tekan E lalu baca".
- **Popup:** petunjuk WASD di tengah dihapus, panduan Ch4 tidak lagi muncul otomatis (tetap ada di tombol *Panduan*), panel misi kiri dipadatkan (hanya langkah aktif).
- Service worker: `cicaww33-v12-polish`.
