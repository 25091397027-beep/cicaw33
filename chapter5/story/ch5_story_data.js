/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   CONCISE INTERACTIVE STORY, DIALOGUE, & CHALLENGE DATA
   (assets/chapter5/story/ch5_story_data.js)
   - Strict Dialogue Rule: Short, punchy, 1 idea per bubble, natural banter,
     zero long monologues, synced with expressions, gestures, & camera shots.
============================================================================ */
"use strict";

window.CH5_STORY_DATA = {
  chapterId: "chapter_05",
  chapterTitle: "Chapter 5 — The Things We Don't Say",

  scenes: {
    scene_1: {
      id: "scene_1",
      order: 1,
      shortTitle: "Scene 1 — The Morning Feels Different",
      subtitle: "Koridor Apartemen Lantai 3 • Pagi Hari",
      missionTitle: "Pagi Setelah Rooftop",
      audioMood: "morning_apt",
      steps: [
        "Periksa tas sekolah Rizka di dekat pintu Unit 302",
        "Ambil buku catatan yang tertinggal di bangku jendela",
        "Temui Kael di depan Unit 301",
        "Jalan bersama menuju tangga lobi"
      ]
    },
    scene_2: {
      id: "scene_2",
      order: 2,
      shortTitle: "Scene 2 — A Day Out of Routine",
      subtitle: "Halaman, Loker & Koridor Sekolah",
      missionTitle: "Membagi Tugas Acara",
      audioMood: "school_event",
      steps: [
        "Kumpulkan 3 perlengkapan acara di loker, koridor & halaman",
        "Susun prioritas pengiriman barang",
        "Antar ketiga perlengkapan ke tujuan yang tepat"
      ]
    },
    scene_3: {
      id: "scene_3",
      order: 3,
      shortTitle: "Scene 3 — Not Everything Goes as Planned",
      subtitle: "Aula Sekolah • Persiapan Autumn Fest",
      missionTitle: "Dekorasi yang Tertukar",
      audioMood: "hall_active",
      steps: [
        "Periksa Papan Rancangan Dekorasi di meja tengah",
        "Perbaiki posisi 4 dekorasi aula sebelum waktu habis",
        "Laporkan hasil penataan ke Kael & Bu Mira"
      ]
    },
    scene_4: {
      id: "scene_4",
      order: 4,
      shortTitle: "Scene 4 — A Little Space",
      subtitle: "Ruang Kelas Kosong • Sore Tenang",
      missionTitle: "Ruang Kecil untuk Bicara",
      audioMood: "quiet_space",
      steps: [
        "Rapikan perlengkapan yang tersisa di meja kelas",
        "Simpan kotak perlengkapan ke lemari belakang",
        "Dekati Kael di dekat jendela & amati sikapnya"
      ]
    },
    scene_5: {
      id: "scene_5",
      order: 5,
      shortTitle: "Scene 5 — After the Noise",
      subtitle: "Halaman Sekolah Senja & Jalan Pulang",
      missionTitle: "Pulang Setelah Keramaian",
      audioMood: "dusk_walk",
      steps: [
        "Temui Kael di halaman sekolah yang mulai sepi",
        "Mampir ke bangku tepi jalan di jalur pulang",
        "Selesaikan obrolan pulang di bawah lampu jalan"
      ]
    }
  },

  /* Aula Blueprint Reference & 4 Misplaced Zones (Scene 3) */
  aulaBlueprint: [
    { zoneId: "zone_1", zoneLabel: "1. Pilar Kiri Panggung", wrongLabel: "Poster Acara (Salah Tempat)", correctKey: "ribbon", correctLabel: "Pita Merah & Emas Panggung", icon: "🎀", hint: "Pilar kiri mengapit tirai panggung—gunakan Pita Merah & Emas." },
    { zoneId: "zone_2", zoneLabel: "2. Meja Sambutan Depan", wrongLabel: "Gulungan Lampu Kabel (Salah Tempat)", correctKey: "cloth", correctLabel: "Kain Taplak Burgundy", icon: "🧣", hint: "Meja sambutan tamu di depan panggung wajib ditutup Kain Taplak Burgundy." },
    { zoneId: "zone_3", zoneLabel: "3. Stand Pengumuman Kanan", wrongLabel: "Tumpukan Kertas Lipat (Salah Tempat)", correctKey: "poster", correctLabel: "Poster Utama Autumn Fest", icon: "🖼️", hint: "Stand kayu di sisi kanan panggung disiapkan khusus untuk Poster Utama." },
    { zoneId: "zone_4", zoneLabel: "4. Lengkungan Tengah Aula", wrongLabel: "Kardus Logistik (Salah Tempat)", correctKey: "lights", correctLabel: "Untaian Lampu Hangat", icon: "💡", hint: "Gawang lengkung di tengah aula harus digantungi Untaian Lampu Hangat." }
  ],

  aulaDecorOptions: [
    { key: "ribbon", icon: "🎀", label: "Pita Merah & Emas" },
    { key: "cloth", icon: "🧣", label: "Kain Taplak Burgundy" },
    { key: "poster", icon: "🖼️", label: "Poster Utama Fest" },
    { key: "lights", icon: "💡", label: "Untaian Lampu Hangat" }
  ],

  /* Scene 2 Supplies & Delivery Targets */
  scene2Supplies: {
    poster: { id: "poster", icon: "🖼️", label: "Poster Acara", target: "aula", targetName: "Pintu Aula Sekolah", wrongHint: "Poster ukuran besar ini harus dipasang di depan Pintu Aula, bukan di sini." },
    decor: { id: "decor", icon: "🎀", label: "Kotak Dekorasi", target: "hana", targetName: "Hana (Meja Halaman)", wrongHint: "Pita dan gunting dekorasi ini ditunggu Hana di meja halaman." },
    notes: { id: "notes", icon: "📋", label: "Catatan Susunan Acara", target: "sena", targetName: "Sena (Meja OSIS)", wrongHint: "Catatan susunan acara ini perlu dicek Sena di meja OSIS." }
  },

  /* Short, Crisp, Character-Driven Dialogue Trees */
  dialogues: {
    /* ==================== SCENE 1 ==================== */
    s1_intro: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", submood: "Pagi di Depan Unit 302",
          rizkaExp: "subtle_blush", rizkaAct: "awkward_shift", camShot: "close_rizka",
          text: "Jam segini... biasanya Kael juga baru keluar kamar.",
          next: "n2"
        },
        n2: {
          speaker: "Rizka", submood: "Menarik Napas Pelan",
          rizkaExp: "small_smile", camShot: "ots_rizka",
          text: "Sikap biasa saja, Rizka. Cek isi tas dulu sebelum turun.",
          next: null
        }
      }
    },

    s1_phone_msg: {
      start: "p1",
      nodes: {
        p1: {
          speaker: "Ponsel Rizka", submood: "Pesan Singkat • 06:58",
          rizkaExp: "small_smile", camShot: "close_rizka",
          text: "Bu Mira: \"Rizka, pagi ini bantu koordinasi perlengkapan Autumn Fest sebentar ya.\"",
          next: "p2"
        },
        p2: {
          speaker: "Rizka", submood: "Mengingat Sesuatu",
          rizkaExp: "focused", camShot: "close_rizka",
          text: "Untung sempat cek ponsel. Jangan sampai catatannya ketinggalan.",
          next: null
        }
      }
    },

    s1_bag_checked: {
      start: "b1",
      nodes: {
        b1: {
          speaker: "Rizka", submood: "Memeriksa Tas",
          rizkaExp: "worried", rizkaAct: "pickup", camShot: "close_rizka",
          text: "Kotak pensil ada, kunci kamar ada... lho, buku catatan acaranya mana?",
          next: "b2"
        },
        b2: {
          speaker: "Rizka", submood: "Menoleh ke Ujung Koridor",
          rizkaExp: "awkward", camShot: "wide",
          text: "Astaga, tadi kutaruh di bangku dekat jendela waktu mengikat tali sepatu.",
          next: null
        }
      }
    },

    s1_book_picked: {
      start: "bk1",
      nodes: {
        bk1: {
          speaker: "Rizka", submood: "Lega",
          rizkaExp: "small_smile", rizkaAct: "pickup", camShot: "close_rizka",
          text: "Ketemu. Hampir saja balik lagi dari gerbang sekolah.",
          next: "bk2"
        },
        bk2: {
          speaker: "Kael", submood: "Pintu Unit 301 Terbuka",
          kaelExp: "calm", rizkaExp: "subtle_blush", camShot: "wide",
          text: "Pagi, Rizka.",
          next: null
        }
      }
    },

    s1_meet_kael: {
      start: "m1",
      nodes: {
        m1: {
          speaker: "Rizka", submood: "Sedikit Canggung",
          rizkaExp: "awkward", kaelExp: "small_smile", camShot: "two_shot",
          text: "Eh—pagi. Kamu berangkat sekarang?",
          next: "m2"
        },
        m2: {
          speaker: "Kael", submood: "Santai",
          kaelExp: "gentle_smile", kaelAct: "gesture", camShot: "ots_rizka",
          textFn: (ctx) => ctx.ch4HighOpenness
            ? "Iya. Setelah obrolan di rooftop kemarin, rasanya aneh kalau jalan sendiri-sendiri."
            : "Iya. Kalau kamu nggak buru-buru, kita bisa jalan bareng.",
          next: "m3_choice"
        },
        m3_choice: {
          speaker: "Rizka", submood: "Pilih Respons",
          choices: [
            {
              label: "\"Siapa bilang aku mau jalan bareng?\"",
              next: "m_tease1",
              effects: { comfort: 3, affection: 2, flag: { s1_tone: "tease" }, resonance: "Candaan pagi mencairkan canggung..." }
            },
            {
              label: "\"Kebetulan arahnya memang sama, kan?\"",
              next: "m_shy1",
              effects: { affection: 2, openness: 2, flag: { s1_tone: "shy" }, resonance: "Langkah pagi terasa lebih ringan..." }
            },
            {
              label: "\"Boleh. Tapi jangan jalan terlalu cepat ya.\"",
              next: "m_honest1",
              effects: { trust: 2, comfort: 2, flag: { s1_tone: "honest" }, resonance: "Kebiasaan kecil mulai terbentuk..." }
            }
          ]
        },
        m_tease1: {
          speaker: "Kael", submood: "Mengangkat Bahu Tipis",
          kaelExp: "teasing", rizkaExp: "awkward", camShot: "ots_rizka",
          text: "Ya sudah. Aku jalan duluan.",
          next: "m_tease2"
        },
        m_tease2: {
          speaker: "Rizka", submood: "Refleks Menahan",
          rizkaExp: "subtle_blush", rizkaAct: "gesture", kaelExp: "laugh", camShot: "two_shot",
          text: "Eh, tunggu! Aku cuma bercanda.",
          next: "m_end"
        },
        m_shy1: {
          speaker: "Kael", submood: "Tersenyum Kecil",
          kaelExp: "gentle_smile", rizkaExp: "subtle_blush", camShot: "two_shot",
          text: "Iya, dari lantai yang sama sampai gedung sekolah yang sama.",
          next: "m_end"
        },
        m_honest1: {
          speaker: "Kael", submood: "Melambatkan Langkah",
          kaelExp: "gentle_smile", rizkaExp: "small_smile", camShot: "two_shot",
          text: "Tenang, aku samakan sama langkahmu.",
          next: "m_end"
        },
        m_end: {
          speaker: "Kael", submood: "Menuju Tangga Lobi",
          kaelExp: "small_smile", rizkaExp: "happy", camShot: "two_shot",
          text: "Ayo turun. Katanya hari ini sekolah mulai sibuk buat acara.",
          next: null
        }
      }
    },

    /* ==================== SCENE 2 ==================== */
    s2_intro: {
      start: "i1",
      nodes: {
        i1: {
          speaker: "Bu Mira", submood: "Koordinator Acara",
          miraExp: "happy", rizkaExp: "neutral", kaelExp: "calm", camShot: "two_shot",
          text: "Rizka, Kael, kebetulan sekali kalian datang berdua.",
          next: "i2"
        },
        i2: {
          speaker: "Bu Mira", submood: "Membagi Perlengkapan",
          miraExp: "happy", camShot: "ots_rizka",
          text: "Ada tiga perlengkapan acara yang belum diantar: poster aula, kotak dekorasi, dan catatan susunan acara.",
          next: "i3_choice"
        },
        i3_choice: {
          speaker: "Rizka", submood: "Cara Menyikapi Tugas",
          choices: [
            {
              label: "\"Kami bagi tugas sama Hana dan Sena ya, Bu.\"",
              next: "i_delegate",
              effects: { openness: 3, trust: 2, flag: { s2_delegated: true }, resonance: "Rizka mulai berani membagi beban..." }
            },
            {
              label: "\"Biar saya urus semuanya sekarang, Bu.\"",
              next: "i_all",
              effects: { comfort: 1, flag: { s2_delegated: false } }
            }
          ]
        },
        i_delegate: {
          speaker: "Kael", submood: "Memperhatikan Perubahan Rizka",
          kaelExp: "gentle_smile", rizkaExp: "small_smile", camShot: "two_shot",
          text: "Tumben nggak langsung kamu borong sendiri.",
          next: "i_delegate2"
        },
        i_delegate2: {
          speaker: "Rizka", submood: "Melirik Kael",
          rizkaExp: "teasing", camShot: "two_shot",
          text: "Aku juga bisa belajar, tahu. Ayo ambil tiga barangnya dulu.",
          next: null
        },
        i_all: {
          speaker: "Kael", submood: "Menyela Halus",
          kaelExp: "small_smile", rizkaExp: "awkward", camShot: "two_shot",
          text: "Kita kumpulkan dulu bertiga sama yang lain, Bu. Biar nggak keteteran.",
          next: "i_all2"
        },
        i_all2: {
          speaker: "Rizka", submood: "Tersadar",
          rizkaExp: "small_smile", camShot: "two_shot",
          text: "...Benar juga. Oke, kita ambil tiga perlengkapannya dulu.",
          next: null
        }
      }
    },

    s2_nadine_chat: {
      start: "nc1",
      nodes: {
        nc1: {
          speaker: "Nadine", submood: "Santai di Koridor",
          nadineExp: "friendly_smile", rizkaExp: "small_smile", camShot: "two_shot",
          text: "Pagi, Rizka! Kalian kelihatan kompak banget dari gerbang tadi.",
          next: "nc2"
        },
        nc2: {
          speaker: "Nadine", submood: "Info Panitia",
          nadineExp: "playful", camShot: "ots_rizka",
          text: "Hana sudah nunggu kotak dekorasi di halaman, kalau Sena butuh catatan acara di meja OSIS ya.",
          next: null
        }
      }
    },

    s2_done_all: {
      start: "d1",
      nodes: {
        d1: {
          speaker: "Hana", submood: "Senang",
          hanaExp: "happy", rizkaExp: "happy", camShot: "two_shot",
          text: "Semua barang pas di tempatnya! Makasih ya, Rizka, Kael!",
          next: "d2"
        },
        d2: {
          speaker: "Sena", submood: "Melihat Jam",
          senaExp: "surprised", kaelExp: "serious", camShot: "two_shot",
          text: "Eh, gawat—anak-anak di aula bilang dekorasi panggungnya banyak yang tertukar!",
          next: "d3"
        },
        d3: {
          speaker: "Kael", submood: "Sigap",
          kaelExp: "calm", rizkaExp: "focused", camShot: "two_shot",
          text: "Ayo kita cek ke aula sekarang.",
          next: null
        }
      }
    },

    /* ==================== SCENE 3 ==================== */
    s3_intro: {
      start: "a1",
      nodes: {
        a1: {
          speaker: "Rizka", submood: "Melihat Sekeliling Aula",
          rizkaExp: "worried", kaelExp: "serious", camShot: "wide",
          text: "Wah... pita panggung malah jadi poster, meja depan malah ditumpuk lampu.",
          next: "a2"
        },
        a2: {
          speaker: "Rizka", submood: "Refleks Lama",
          rizkaExp: "focused", camShot: "two_shot",
          text: "Biar aku rapikan satu-satu dari ujung—",
          next: "a3"
        },
        a3: {
          speaker: "Kael", submood: "Paham Kebiasaan Rizka",
          kaelExp: "small_smile", kaelAct: "gesture", camShot: "ots_rizka",
          text: "Mulai lagi kebiasaannya. Cek papan rancangan di meja tengah dulu, kita kerjakan bareng.",
          next: "a4"
        },
        a4: {
          speaker: "Rizka", submood: "Senyum Kecil",
          rizkaExp: "small_smile", camShot: "two_shot",
          text: "...Iya, iya. Aku cek papan rancangannya sekarang.",
          next: null
        }
      }
    },

    s3_blueprint_read: {
      start: "bp1",
      nodes: {
        bp1: {
          speaker: "Kael", submood: "Membaca Rancangan",
          kaelExp: "serious", rizkaExp: "focused", camShot: "two_shot",
          text: "Ada empat titik yang tertukar: pilar kiri, meja depan, stand kanan, sama lengkungan tengah.",
          next: "bp2"
        },
        bp2: {
          speaker: "Rizka", submood: "Siap Bergerak",
          rizkaExp: "happy", camShot: "two_shot",
          text: "Oke, sebelum Bu Mira kembali, ayo kita betulkan keempatnya!",
          next: null
        }
      }
    },

    s3_finish: {
      start: "f1",
      nodes: {
        f1: {
          speaker: "Bu Mira", submood: "Lega Melihat Aula",
          miraExp: "happy", rizkaExp: "small_smile", kaelExp: "calm", camShot: "wide",
          text: "Syukurlah, aulanya jadi rapi tepat waktu! Kerja bagus kalian berdua.",
          next: "f2"
        },
        f2: {
          speaker: "Kael", submood: "Mengangkat Kardus Sisa",
          kaelExp: "calm", kaelAct: "assist", rizkaExp: "tired", camShot: "two_shot",
          text: "Kotak beratnya biar kubawa semua ke kelas kosong. Kamu istirahat saja.",
          next: "f3"
        },
        f3: {
          speaker: "Rizka", submood: "Mengernyit Pelan",
          rizkaExp: "annoyed", camShot: "close_rizka",
          text: "Kael, aku nggak selemah itu sampai harus disuruh duduk terus.",
          next: null
        }
      }
    },

    /* ==================== SCENE 4 ==================== */
    s4_intro: {
      start: "c1",
      nodes: {
        c1: {
          speaker: "Rizka", submood: "Suasana Agak Canggung",
          rizkaExp: "annoyed", kaelExp: "confused", camShot: "two_shot",
          text: "Tadi di aula juga kamu langsung ambil alih bagian panggung tanpa bilang.",
          next: "c2"
        },
        c2: {
          speaker: "Kael", submood: "Tidak Bermaksud Buruk",
          kaelExp: "awkward", camShot: "ots_rizka",
          text: "Aku cuma nggak mau kamu kecapekan lagi kayak kemarin.",
          next: "c3"
        },
        c3: {
          speaker: "Nadine", submood: "Masuk Sebentar Mengambil Map",
          nadineExp: "understanding", rizkaExp: "awkward", camShot: "wide",
          text: "Ups, maaf ganggu—aku cuma mau ambil map OSIS yang ketinggalan.",
          next: "c4"
        },
        c4: {
          speaker: "Nadine", submood: "Senyum Natural",
          nadineExp: "friendly_smile", camShot: "two_shot",
          text: "Kalian berdua tuh sama-sama keras kepala kalau soal peduli. Jangan lama-lama diamnya, ya.",
          next: "c5"
        },
        c5: {
          speaker: "Rizka", submood: "Menghela Napas Kecil",
          rizkaExp: "tired", camShot: "close_rizka",
          text: "...Nadine ada benarnya. Kurapikan sisa alat di meja ini dulu sambil tenangkan pikiran.",
          next: null
        }
      }
    },

    s4_stored: {
      start: "st1",
      nodes: {
        st1: {
          speaker: "Rizka", submood: "Melirik ke Arah Jendela",
          rizkaExp: "worried", kaelExp: "look_window", camShot: "wide",
          text: "Kael masih diam menghadap jendela. Coba kuperhatikan dulu sebelum bicara.",
          next: null
        }
      }
    },

    s4_reconcile: {
      start: "r_choice",
      nodes: {
        r_choice: {
          speaker: "Rizka", submood: "Pilih Cara Menyampaikan",
          choices: [
            {
              label: "Tanya langsung dengan tenang dan jujur",
              next: "r_direct1",
              effects: { openness: 3, trust: 2, affection: 2, flag: { s4_approach: "direct" }, resonance: "Kejujuran tanpa menyalahkan..." }
            },
            {
              label: "Berdiri di sampingnya dan beri jeda tenang dulu",
              next: "r_space1",
              effects: { comfort: 3, affection: 2, flag: { s4_approach: "space" }, resonance: "Nyaman bahkan di dalam diam..." }
            },
            {
              label: "Cairkan suasana dengan candaan ringan",
              next: "r_humor1",
              effects: { comfort: 2, trust: 2, affection: 1, flag: { s4_approach: "humor" }, resonance: "Tawa kecil meruntuhkan gengsi..." }
            }
          ]
        },
        r_direct1: {
          speaker: "Rizka", submood: "Jujur dan Tenang",
          rizkaExp: "small_smile", kaelExp: "calm", camShot: "two_shot",
          text: "Aku senang kamu bantu, Kael. Aku cuma pengin kita kerja bareng, bukan kamu yang menanggung sendiri.",
          next: "r_direct2"
        },
        r_direct2: {
          speaker: "Kael", submood: "Menoleh Pelan",
          kaelExp: "gentle_smile", camShot: "close_kael",
          text: "Maaf ya. Aku terlalu terbiasa buru-buru pasang badan. Lain kali aku tanya dulu.",
          next: "r_end"
        },
        r_space1: {
          speaker: "Rizka", submood: "Menatap Cahaya Sore Bersama",
          rizkaExp: "subtle_blush", kaelExp: "calm", camShot: "two_shot",
          text: "...Langit sorenya bagus ya. Maaf tadi nadaku ketus.",
          next: "r_space2"
        },
        r_space2: {
          speaker: "Kael", submood: "Bahu Lebih Rileks",
          kaelExp: "gentle_smile", camShot: "close_kael",
          text: "Aku yang salah baca situasi. Padahal kamu memang lagi berusaha bagi tugas, bukan memaksakan diri.",
          next: "r_end"
        },
        r_humor1: {
          speaker: "Rizka", submood: "Menggoda Pelan",
          rizkaExp: "teasing", kaelExp: "confused", camShot: "two_shot",
          text: "Kalau semua kardus kamu angkut sendiri, nanti Bu Mira kira aku cuma mandor galak.",
          next: "r_humor2"
        },
        r_humor2: {
          speaker: "Kael", submood: "Tertawa Kecil",
          kaelExp: "laugh", kaelAct: "laugh", rizkaExp: "happy", camShot: "two_shot",
          text: "Mandornya memang agak galak barusan. Oke, lain kali kita bagi rata.",
          next: "r_end"
        },
        r_end: {
          speaker: "Kael", submood: "Acaranya Hampir Selesai",
          kaelExp: "small_smile", rizkaExp: "happy", camShot: "two_shot",
          text: "Tunggu aku di halaman depan nanti ya. Kita pulang bareng.",
          next: null
        }
      }
    },

    /* ==================== SCENE 5 ==================== */
    s5_meet_yard: {
      start: "y1",
      nodes: {
        y1: {
          speaker: "Kael", submood: "Halaman Sekolah Mulai Sepi",
          kaelExp: "gentle_smile", rizkaExp: "small_smile", camShot: "two_shot",
          text: "Acaranya lancar. Nggak ada satu pun pita panggung yang jatuh.",
          next: "y2"
        },
        y2: {
          speaker: "Rizka", submood: "Tersenyum Lega",
          rizkaExp: "teasing", camShot: "ots_kael",
          text: "Jelas dong, kan mandor dan asistennya kompak.",
          next: "y3"
        },
        y3: {
          speaker: "Kael", submood: "Melangkah ke Gerbang",
          kaelExp: "small_smile", camShot: "wide",
          text: "Ayo pulang sebelum makin gelap.",
          next: null
        }
      }
    },

    s5_bench_drink: {
      start: "bd1",
      nodes: {
        bd1: {
          speaker: "Kael", submood: "Menyodorkan Minuman Botol",
          kaelExp: "gentle_smile", kaelAct: "gesture", rizkaExp: "happy", camShot: "two_shot",
          text: "Nih, susu lemon hangat dari mesin dekat gerbang. Upah panitia dekorasi.",
          next: "bd2"
        },
        bd2: {
          speaker: "Rizka", submood: "Menerima dengan Hangat",
          rizkaExp: "laugh", rizkaAct: "laugh", camShot: "close_rizka",
          text: "Tahu saja aku haus. Entah kenapa, pulang lewat jalan ini bareng kamu sekarang jadi kebiasaan.",
          next: null
        }
      }
    },

    s5_notice_board: {
      start: "nb1",
      nodes: {
        nb1: {
          speaker: "Rizka", submood: "Membaca Papan Lingkungan",
          rizkaExp: "small_smile", kaelExp: "calm", camShot: "two_shot",
          text: "\"Pekan depan diperkirakan hujan sore lagi, disusul malam budaya lingkungan.\"",
          next: "nb2"
        },
        nb2: {
          speaker: "Kael", submood: "Nada Ringan",
          kaelExp: "teasing", rizkaExp: "subtle_blush", camShot: "two_shot",
          text: "Kali ini payungmu sudah balik di rak Unit 302, kan?",
          next: null
        }
      }
    },

    s5_ending: {
      start: "e1",
      nodes: {
        e1: {
          speaker: "Kael", submood: "Di Bawah Lampu Jalan",
          kaelExp: "gentle_smile", rizkaExp: "small_smile", camShot: "two_shot",
          textFn: (ctx) => ctx.s4Approach === "direct"
            ? "Makasih ya soal di kelas tadi. Aku lebih tenang kalau kamu langsung bilang apa yang kamu rasakan."
            : ctx.s4Approach === "humor"
              ? "Hari ini capek, tapi anehnya seru gara-gara omelan mandor di aula."
              : "Hari ini rasanya beda. Kita nggak perlu banyak bicara buat saling ngerti.",
          next: "e2"
        },
        e2: {
          speaker: "Rizka", submood: "Tersenyum Tulus",
          rizkaExp: "subtle_blush", camShot: "close_rizka",
          text: "Aku juga. Masih banyak hal yang belum biasa kuucapkan... tapi pelan-pelan saja, ya.",
          next: "e3"
        },
        e3: {
          speaker: "Ponsel Rizka", submood: "Getar Singkat • Pesan Masuk",
          rizkaExp: "worried", kaelExp: "calm", camShot: "close_rizka",
          text: "Ayah: \"Rizka, akhir pekan ini Ayah pulang ke apartemen. Ada yang perlu kita bicarakan soal rencana semester depan.\"",
          next: "e4"
        },
        e4: {
          speaker: "Kael", submood: "Memperhatikan Wajah Rizka",
          kaelExp: "calm", rizkaExp: "small_smile", camShot: "two_shot",
          text: "Dari rumah? Kamu nggak perlu cerita sekarang kalau belum siap.",
          next: "e5"
        },
        e5: {
          speaker: "Rizka", submood: "Jembatan Menuju Chapter 6",
          rizkaExp: "happy", kaelExp: "gentle_smile", camShot: "two_shot",
          text: "Nggak apa-apa. Ceritanya kusimpan buat besok pagi di depan pintu, ya—jadi jangan kesiangan.",
          next: "e6"
        },
        e6: {
          speaker: "Kael", submood: "Senyum Hangat",
          kaelExp: "gentle_smile", rizkaExp: "happy", camShot: "wide",
          text: "Janji. Yuk, sedikit lagi sampai apartemen.",
          next: null
        }
      }
    }
  }
};
