# Cicaww33 — A Story Beneath the Rain (Unified Edition v13 • Chapter 1–5 Lengkap)

Seluruh cerita **Chapter 1 hingga Chapter 5** kini telah tergabung dalam **satu aplikasi utuh (`index.html`)** dan langsung dapat dimainkan baik secara *offline* (klik dua kali `index.html`) maupun dipasang sebagai aplikasi PWA di HP Android, iOS, dan PC.

## Daftar Chapter di Dalam Game
1. **Chapter 1 — Beneath the Rain:** Pertemuan Rizka & Kael di halaman sekolah saat hujan sore.
2. **Chapter 2 — Next Door:** Kejutan apartemen bersebelahan (Unit 302 & Unit 301), payung biru, & teh jahe hangat (Scene A–E).
3. **Chapter 3 — The Face Behind the Smile:** Kehidupan sekolah, proyek kelompok bersama Bu Mira, Hana, & Sena, serta perjalanan pulang senja (Scene A–E).
4. **Chapter 4 — A Little Closer:** Setelah telepon malam dari Ayah, koridor & kelas 11-A dekat jendela, kesalahpahaman kecil bersama Nadine, hingga percakapan jujur saat *Golden Hour* di *rooftop* sekolah (Scene 1–5).
5. **Chapter 5 — The Things We Don't Say:** Pagi yang terasa berbeda di depan Unit 302 & 301, belajar membagi tugas persiapan *Autumn Fest* bersama Bu Mira, Hana, Sena, & Nadine, teka-teki menata dekorasi Aula Sekolah yang tertukar, ruang kecil untuk jujur di kelas sore, hingga jalan pulang senja di bawah lampu jalan menuju Chapter 6 (Scene 1–5).

## Cara Instalasi & Menjalankan Game
- **Opsi 1 — Langsung Buka Offline (`file://` tanpa Server):**
  1. Ekstrak seluruh isi ZIP ke satu folder (jangan memisahkan `index.html` dari folder `assets/` dan `icons/`).
  2. Klik dua kali `index.html` di Chrome, Edge, atau Safari terbaru.
  3. Seluruh pustaka Three.js `r128`, `GLTFLoader`, Tailwind CSS, 29 model `.glb` Chapter 5 (`ch5_offline_pack.js`), tekstur PBR, dan mesin audio Web Audio berjalan lokal 100% tanpa internet.
- **Opsi 2 — Melalui Local Web Server (`http://`, Direkomendasikan untuk Pemuatan Biner `.glb` Langsung & Pengujian Service Worker):**
  ```bash
  cd cicaww33-pwa
  python -m http.server 8090
  ```
  Lalu buka `http://localhost:8090` di browser.
- **Opsi 3 — Instalasi sebagai Aplikasi PWA di Android / iOS / Desktop (`https://`):**
  1. Unggah seluruh isi folder ke layanan hosting statis ber-HTTPS (Netlify Drop, GitHub Pages, atau Cloudflare Pages).
  2. Buka alamat HTTPS-nya di Chrome Android lalu ketuk tombol **📲 Pasang Aplikasi** (atau di Safari iOS: *Bagikan → Tambah ke Layar Utama*).
  3. Setelah dimuat sekali, `sw.js` (`cicaww33-v13-ch5`) menyimpan seluruh kode dan aset Chapter 1–5 agar dapat dimainkan penuh secara offline.

## Cara Memulai Chapter 5
- **Setelah Menyelesaikan Chapter 4:** Klik tombol **✦ Lanjut ke Chapter 5: The Things We Don't Say →** pada layar tamat Chapter 4 (atau klik **Lanjutkan** di Menu Utama jika save terakhir sudah menamatkan Chapter 4).
- **Langsung dari Menu Utama / Chapter Selector:** Klik tombol **✦ Ch. 5: Baru** di Menu Utama atau buka menu **Chapter** untuk memilih Chapter 1, 2, 3, 4, atau 5 kapan saja tanpa merusak data save sebelumnya.

## Kontrol Permainan
- **PC / Laptop:** `WASD` / Panah untuk bergerak, `Shift` untuk berlari, *Drag Mouse* / *Scroll* untuk kamera, `E` / `Spasi` untuk berinteraksi, `1–3` untuk pilihan cepat dialog, dan `Esc` untuk menu jeda (*Pause*).
- **Android / Layar Sentuh (Portrait & Landscape):** *Virtual Joystick* kiri untuk bergerak, geser layar untuk memutar kamera, tombol **Sprint**, dan tombol **Act** saat penanda interaksi aktif.

## Struktur Modul Chapter 5 (`assets/chapter5/`)
- `chapter5_asset_manifest.json` — Manifest 51 aset Chapter 5 (29 model `.glb` READY, 10 preset VFX `.json` READY, dan dokumentasi jujur 12 entri karakter Blender 4K dengan fallback Ultra-HD).
- `environments/*.glb` & `props/*.glb` — 29 model biner glTF 2.0 nyata hasil ekspor Asset Studio Chapter 5.
- `effects/*.json` & `textures/*.png` — 10 konfigurasi pencahayaan/partikel/angin dan peta tekstur PBR (Albedo, Normal, Roughness).
- `ch5_assets.js` & `ch5_offline_pack.js` — `Chapter5AssetManager` asinkron dengan caching, normalisasi skala/bayangan, dukungan `file://` offline, dan pembersihan memori GPU antar-scene.
- `characters/ch5_characters.js` — Rig karakter Ultra-HD Chapter 5 (Rizka, Kael, Nadine, Bu Mira, Hana, Sena) beserta sistem ekspresi, tatapan mata, dan animasi gestur.
- `environments/ch5_world.js` — Pembangun 5 panggung 3D terintegrasi model `.glb`, kubah langit, sinar volumetrik, debu/daun melayang, dan titik interaksi misi.
- `audio/ch5_audio.js` — 5 komposisi musik & *ambience* orisinal Chapter 5 + SFX langkah, kertas, pengambilan barang, dan dekorasi di atas `AudioContext` tunggal.
- `story/ch5_story_data.js` & `story/ch5_controller.js` — Naskah dialog ringkas, sistem pilihan & relasi, 5 variasi tantangan misi, sistem *save/load* kompatibel mundur (`cicaww33_save_slot_0`), dan penilaian chapter (`cicaww33_scores_v1`).

## Catatan v14 (Audio & Bug)
- Bunyi "salah" dibuat bersih (tanpa semburan derau/sawtooth yang kresek di speaker HP); penekanan lewat dentum + nada turun + getar + goyang layar.
- Derau loop Chapter 4 (rumus crossfade 2π salah) dan Chapter 5 (tanpa crossfade = klik tiap 4 detik) diperbaiki jadi mulus.
- Limiter/kompresor dilembutkan + headroom master; reverb HP dibuat mono & lebih pendek.
- Penjadwal musik utama memecah pembuatan suara per tick (tidak menumpuk puluhan node sekaligus); lookahead Ch5 0.35s → 1.2s.
- Rantai hujan dilepas saat tidak dipakai (hemat CPU di Chapter 2–5).
