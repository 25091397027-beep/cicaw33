/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   DATABASE CERITA, POHON DIALOG, PILIHAN, & DEFINISI 5 SCENE PLAYABLE
   (assets/story/ch4_story_data.js)
   - Mempertahankan naskah, karakter, & tema emosional asli Chapter 4
   - Seluruh 5 scene memiliki objektif jelas, objek interaktif nyata,
     pilihan berdampak pada hubungan (affection, trust, openness),
     serta sinkronisasi ekspresi wajah 3D & potret 2D.
============================================================================ */
"use strict";

window.CH4_STORY_DATA = {
  rizkaExpressions: [
    { id: "neutral", label: "Neutral" },
    { id: "small_smile", label: "Small Smile" },
    { id: "awkward", label: "Awkward" },
    { id: "subtle_blush", label: "Subtle Blush" },
    { id: "holding_back", label: "Holding Back" },
    { id: "sad", label: "Sad" },
    { id: "worried", label: "Worried" },
    { id: "jealous", label: "Jealous" },
    { id: "happy", label: "Happy" }
  ],
  kaelExpressions: [
    { id: "neutral", label: "Neutral" },
    { id: "small_smile", label: "Small Smile" },
    { id: "confused", label: "Confused" },
    { id: "awkward", label: "Awkward" },
    { id: "worried", label: "Worried" },
    { id: "noticing_rizka", label: "Noticing Rizka" },
    { id: "serious", label: "Serious" }
  ],

  scenes: {
    scene_1: {
      id: "scene_1",
      order: 1,
      shortTitle: "Scene 1 — After the Call",
      subtitle: "Koridor Apartemen Lt. 3 • Malam Hari",
      moodAudio: "night_call",
      lightingLabel: "Night Corridor + Phone Screen Glow",
      spawn: { x: -1.15, z: -1.45, rotY: 0.45 },
      camera: { yaw: 1.32, pitch: 0.16, dist: 3.15 },
      kael: { visible: true, x: -0.95, z: 2.05, rotY: 2.95, exp: "noticing_rizka" },
      nadine: { visible: false },
      rizkaInit: { exp: "holding_back", phone: true, phoneMode: "ended" },
      missionTitle: "Setelah Panggilan Malam Itu",
      steps: [
        "Tarik napas di dekat jendela galeri malam",
        "Hampiri Kael yang menunggu di depan Unit 301",
        "Masuk ke Unit 302 untuk beristirahat"
      ]
    },
    scene_2: {
      id: "scene_2",
      order: 2,
      shortTitle: "Scene 2 — The Morning After",
      subtitle: "Koridor Sekolah • Cahaya Pagi",
      moodAudio: "morning_soft",
      lightingLabel: "Soft Morning Sunbeams",
      spawn: { x: 0.35, z: 6.4, rotY: Math.PI },
      camera: { yaw: 0.12, pitch: 0.18, dist: 3.5 },
      kael: { visible: true, x: -0.95, z: 1.55, rotY: 0.35, exp: "small_smile" },
      nadine: { visible: false },
      rizkaInit: { exp: "awkward", phone: false },
      missionTitle: "Pagi Setelah Malam Itu",
      steps: [
        "Ambil buku catatan dari loker Rizka",
        "Sapa Kael di depan pintu Kelas 11-A"
      ]
    },
    scene_3: {
      id: "scene_3",
      order: 3,
      shortTitle: "Scene 3 — A Different Distance",
      subtitle: "Ruang Kelas 11-A • Dekat Jendela",
      moodAudio: "window_warm",
      lightingLabel: "Warm Classroom Window Light",
      spawn: { x: -2.85, z: 2.95, rotY: Math.PI },
      camera: { yaw: -0.22, pitch: 0.22, dist: 3.4 },
      kael: { visible: true, x: 1.35, z: -3.45, rotY: -1.35, exp: "awkward" },
      nadine: { visible: false },
      rizkaInit: { exp: "neutral", phone: false },
      missionTitle: "Jarak yang Terasa Berbeda",
      steps: [
        "Letakkan tas & buku di meja dekat jendela",
        "Periksa kaleng teh hangat di atas meja",
        "Berbincang dengan Kael di sisi jendela kelas"
      ]
    },
    scene_4: {
      id: "scene_4",
      order: 4,
      shortTitle: "Scene 4 — A Small Misunderstanding",
      subtitle: "Koridor Sekolah • Sore Mendung",
      moodAudio: "overcast",
      lightingLabel: "Cool Overcast Afternoon",
      spawn: { x: 0.25, z: -5.2, rotY: 0.0 },
      camera: { yaw: 3.05, pitch: 0.18, dist: 3.7 },
      kael: { visible: true, x: -0.65, z: 1.65, rotY: 0.45, exp: "neutral" },
      nadine: { visible: true, x: -0.35, z: 2.85, rotY: 2.95, exp: "friendly_smile" },
      rizkaInit: { exp: "neutral", phone: false },
      missionTitle: "Kesalahpahaman Kecil",
      steps: [
        "Dekati Kael dan Nadine di depan Kelas 11-A",
        "Letakkan catatan kelompok di meja konsol",
        "Dengarkan penjelasan Kael sebelum pulang"
      ]
    },
    scene_5: {
      id: "scene_5",
      order: 5,
      shortTitle: "Scene 5 — The Feeling I Cannot Hide",
      subtitle: "Rooftop Sekolah • Golden Hour",
      moodAudio: "golden_hour",
      lightingLabel: "Golden Hour Sunset & Rim Light",
      spawn: { x: -1.65, z: 2.45, rotY: 0.25 },
      camera: { yaw: 0.15, pitch: 0.18, dist: 3.55 },
      kael: { visible: true, x: 0.48, z: -4.65, rotY: 3.0, exp: "small_smile" },
      nadine: { visible: false },
      rizkaInit: { exp: "worried", phone: false },
      missionTitle: "Perasaan yang Tak Tersembunyi",
      steps: [
        "Melangkah ke tepi pagar Rooftop menghadap senja",
        "Ambil kaleng teh hangat di tepi pagar",
        "Ungkapkan perasaanmu pada Kael di bawah langit senja"
      ]
    }
  },

  dialogues: {
    // ================= SCENE 1 =================
    s1_answered: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Ayah (Telepon)", portrait: "ayah", expression: "neutral",
          rizkaExp: "holding_back",
          mood: "Suara tegas dari seberang telepon",
          text: "“Rizka. Laporan tengah semester minggu depan tidak boleh meleset sedikit pun. Jangan buang waktumu untuk hal yang tidak perlu.”",
          next: "n2"
        },
        n2: {
          speaker: "Rizka", portrait: "rizka", expression: "holding_back",
          rizkaExp: "holding_back",
          mood: "Menggenggam erat ponselnya saat sambungan terputus",
          text: "“...Baik, Yah. Selamat malam.”",
          next: "n3"
        },
        n3: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "sad",
          mood: "Cahaya layar ponsel perlahan meredup di koridor lantai 3",
          text: "Sambungan terputus. Di ujung koridor yang tenang, Kael masih berdiri menunggu tanpa mendekat terlalu cepat—memberi Rizka ruang untuk bernapas.",
          next: null
        }
      }
    },
    s1_hesitated: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "holding_back",
          rizkaExp: "holding_back",
          mood: "Cahaya layar ponsel meredup di tangannya",
          text: "(Ayah menelepon lagi... Kalau aku mengangkatnya sekarang, aku tidak yakin masih bisa menjaga senyumku di depan Kael.)",
          next: "n2"
        },
        n2: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "worried",
          mood: "Koridor Apartemen Lantai 3 • Malam Hari",
          text: "Getaran ponsel berhenti, menyisakan satu pesan singkat di layar. Di dekat pintu Unit 301, Kael menunggu dengan sabar tanpa mendesak.",
          next: null
        }
      }
    },
    s1_window_breath: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "sad",
          rizkaExp: "sad",
          mood: "Menatap lampu kota malam dari jendela galeri",
          text: "(Udara malam selepas hujan terasa dingin... Biasanya aku langsung mengunci diri di kamar, tapi malam ini Kael masih ada di sini.)",
          next: null
        }
      }
    },
    s1_kael_talk: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "masking_smile",
          rizkaExp: "masking_smile", kaelExp: "noticing_rizka",
          mood: "Mencoba terlihat baik-baik saja setelah panggilan dari Ayah",
          text: "“Aku tidak apa-apa, Kael. Sungguh... cuma telepon biasa dari rumah. Maaf membuatmu ikut berhenti di koridor.”",
          next: "n2"
        },
        n2: {
          speaker: "Kael", portrait: "kael", expression: "worried",
          rizkaExp: "holding_back", kaelExp: "worried",
          mood: "Memperhatikan jari Rizka yang masih menggenggam erat ponselnya",
          text: "“Tanganmu masih gemetar waktu memegang ponsel itu, Rizka.”",
          next: "choice_1"
        },
        choice_1: {
          speaker: "Pilihan Respons", portrait: "kael", expression: "worried",
          mood: "Bagaimana cara menyikapi topeng senyum Rizka?",
          text: "Kael menatap Rizka dengan tenang di bawah lampu koridor yang hangat.",
          choices: [
            {
              label: "“Kamu tidak harus selalu tersenyum kalau memang sedang capek, Rizka.”",
              next: "c1_warm",
              effects: { affection: 4, trust: 4, openness: 3, resonance: "Rizka merasa dilihat apa adanya..." }
            },
            {
              label: "“Mau duduk sebentar? Aku tidak akan bertanya apa-apa kalau kamu belum siap.”",
              next: "c1_patient",
              state: "selected",
              effects: { affection: 5, trust: 5, openness: 2, resonance: "Keheningan yang hangat membuat bahu Rizka rileks..." }
            },
            {
              label: "[Terkunci — Jangan Mendesak] “Apa Ayahmu memarahimu soal nilai lagi?”",
              state: "disabled"
            }
          ]
        },
        c1_warm: {
          speaker: "Rizka", portrait: "rizka", expression: "subtle_blush",
          rizkaExp: "subtle_blush", kaelExp: "small_smile",
          mood: "Senyum tipisnya perlahan berubah lebih jujur",
          text: "“...Curang, ya. Di depan orang lain aku selalu berhasil menyembunyikannya, tapi di depanmu selalu ketahuan.”",
          next: "n_end"
        },
        c1_patient: {
          speaker: "Rizka", portrait: "rizka", expression: "small_smile",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Menghela napas pelan dengan bahu yang mulai turun",
          text: "“Terima kasih, Kael. Berdiri sebentar seperti ini saja... rasanya sudah jauh lebih ringan.”",
          next: "n_end"
        },
        n_end: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Menunjuk pelan ke arah pintu Unit 302",
          text: "“Istirahatlah yang cukup malam ini. Besok pagi... jangan lupa sarapan sebelum berangkat.”",
          next: null
        }
      }
    },
    s1_enter_302: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "small_smile",
          rizkaExp: "small_smile",
          mood: "Memegang gagang pintu Unit 302",
          text: "“Selamat malam, Kael. Sampai ketemu besok pagi.”",
          next: null
        }
      }
    },

    // ================= SCENE 2 =================
    s2_board_side: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "neutral",
          mood: "Papan Pengumuman Kelas XI",
          text: "Nama '1. Rizka Alifia Putri — 98.8' terpampang paling atas, tepat di sebelah jadwal koordinator catatan Kelas 11-A bersama Nadine.",
          next: "n2"
        },
        n2: {
          speaker: "Rizka", portrait: "rizka", expression: "worried",
          rizkaExp: "worried",
          mood: "Menatap angka peringkat itu sejenak",
          text: "(Angka yang selalu membuat semua orang menganggapku sempurna... kecuali satu orang yang melihat betapa lelahnya aku semalam.)",
          next: null
        }
      }
    },
    s2_locker: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "awkward",
          rizkaExp: "awkward",
          mood: "Mengambil buku catatan Sastra dari loker",
          text: "“Buku catatan sudah lengkap... Eh, itu Kael sudah berdiri di depan pintu kelas 11-A.”",
          next: null
        }
      }
    },
    s2_kael_morning: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "awkward", kaelExp: "small_smile",
          mood: "Menyapa pagi dengan tenang di depan kelas 11-A",
          text: "“Pagi, Rizka. Kamu datang lebih awal dari biasanya... sudah sempat sarapan?”",
          next: "choice_2"
        },
        choice_2: {
          speaker: "Rizka", portrait: "rizka", expression: "awkward",
          mood: "Sinar matahari pagi jatuh hangat di koridor",
          text: "Jantung Rizka berdetak sedikit lebih cepat mendengar pertanyaan sederhana yang mengingat janji semalam.",
          choices: [
            {
              label: "“Pagi, Kael. I-iya, sudah kok... terima kasih untuk semalam.”",
              next: "c2_polite",
              effects: { affection: 3, trust: 3, resonance: "Sapaan pagi terasa hangat di antara kalian..." }
            },
            {
              label: "“Sebenarnya baru sempat minum teh hangat saja tadi... tapi aku jauh lebih segar.”",
              next: "c2_honest",
              effects: { affection: 4, openness: 4, trust: 3, resonance: "Rizka mulai berani jujur pada hal-hal kecil..." }
            }
          ]
        },
        c2_polite: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "subtle_blush", kaelExp: "small_smile",
          mood: "Membukakan pintu kelas 11-A",
          text: "“Syukurlah. Ayo masuk dulu, di bangku dekat jendela udaranya lagi segar.”",
          next: null
        },
        c2_honest: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Tersenyum tipis penuh perhatian",
          text: "“Kebetulan aku bawa satu kaleng teh hangat lebih. Aku taruh di mejamu dekat jendela ya.”",
          next: null
        }
      }
    },

    // ================= SCENE 3 =================
    s3_desk: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "small_smile",
          mood: "Meja dekat jendela Kelas 11-A",
          text: "Tirai tipis bergerak pelan tertiup angin pagi, membiarkan debu-debu halus berkilau di atas meja kayu.",
          next: null
        }
      }
    },
    s3_drink: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "subtle_blush",
          rizkaExp: "subtle_blush", kaelExp: "awkward",
          mood: "Menyentuh kaleng teh yang masih hangat di mejanya",
          text: "“Masih hangat... Kael benar-benar menyiapkannya sebelum aku datang.”",
          next: null
        }
      }
    },
    s3_window_talk: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "subtle_blush",
          rizkaExp: "subtle_blush", kaelExp: "awkward",
          mood: "Menyadari jarak berdiri mereka yang lebih dekat dari biasanya",
          text: "“Aneh ya... padahal kita cuma berada di dekat jendela kelas seperti biasa, tapi hari ini rasanya berbeda.”",
          next: "choice_3"
        },
        choice_3: {
          speaker: "Pilihan Respons", portrait: "kael", expression: "awkward",
          mood: "Cahaya hangat membingkai keduanya di sisi jendela",
          text: "Kael menoleh sedikit, sedikit canggung namun tatapannya tetap tulus.",
          choices: [
            {
              label: "“Mungkin karena sekarang kamu tidak sedang berpura-pura jadi siswi sempurna.”",
              next: "c3_a",
              effects: { affection: 4, openness: 4, resonance: "Rizka merasa tidak perlu memakai topeng di dekat Kael..." }
            },
            {
              label: "“Aku juga merasakannya. Tapi... aku nyaman dengan jarak seperti ini.”",
              next: "c3_b",
              effects: { affection: 5, trust: 4, resonance: "Jarak di antara mereka terasa selangkah lebih dekat..." }
            }
          ]
        },
        c3_a: {
          speaker: "Rizka", portrait: "rizka", expression: "small_smile",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Tertawa pelan sambil menunduk tipis",
          text: "“Kalau orang lain dengar, reputasi ‘Malaikat Sekolah’-ku bisa runtuh tahu. Tapi... aku lega kamu yang tahu.”",
          next: null
        },
        c3_b: {
          speaker: "Rizka", portrait: "rizka", expression: "subtle_blush",
          rizkaExp: "subtle_blush", kaelExp: "small_smile",
          mood: "Pipinya merona lembut tertimpa cahaya jendela",
          text: "“...Aku juga nyaman, Kael. Lebih nyaman dari yang kuduga.”",
          next: null
        }
      }
    },

    // ================= SCENE 4 =================
    s4_see_nadine: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Nadine", portrait: "nadine", expression: "friendly_smile",
          rizkaExp: "jealous", kaelExp: "neutral", nadineExp: "friendly_smile",
          mood: "Berbicara ramah sambil menunjukkan map kelas kepada Kael",
          text: "“Terima kasih banget ya sudah mau dicek dulu, Kael! Untung kamu masih di koridor sore ini.”",
          next: "n2"
        },
        n2: {
          speaker: "Rizka", portrait: "rizka", expression: "jealous",
          rizkaExp: "jealous", kaelExp: "noticing_rizka", nadineExp: "surprised",
          mood: "Langkahnya terhenti melihat keakraban itu di bawah langit mendung",
          text: "(Eh...? Kael dan Nadine terlihat akrab sekali. Kenapa dada rasanya sedikit sesak begini?)",
          next: "n3"
        },
        n3: {
          speaker: "Rizka", portrait: "rizka", expression: "masking_smile",
          rizkaExp: "masking_smile", kaelExp: "confused", nadineExp: "polite",
          mood: "Otomatis kembali memasang senyum sopan dan menjaga jarak",
          text: "“Oh... maaf mengganggu kalian. Aku cuma mau meletakkan catatan kelompok di meja belakang, setelah itu aku duluan ya.”",
          next: null
        }
      }
    },
    s4_put_notes: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Nadine", portrait: "nadine", expression: "polite",
          rizkaExp: "sad", kaelExp: "worried", nadineExp: "polite",
          mood: "Menyadari kecanggungan suasana dan berpamitan sopan",
          text: "“Eh, tidak mengganggu sama sekali kok, Rizka! Aku juga cuma menitipkan lembar presensi sore ke Kael. Aku ke ruang guru duluan ya!”",
          next: null
        }
      }
    },
    s4_kael_clarify: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Kael", portrait: "kael", expression: "confused",
          rizkaExp: "jealous", kaelExp: "confused",
          mood: "Menghampiri Rizka setelah Nadine berlalu",
          text: "“Tunggu, Rizka. Kenapa tiba-tiba suaramu kembali seperti bicara sama orang asing begitu?”",
          next: "choice_4"
        },
        choice_4: {
          speaker: "Rizka", portrait: "rizka", expression: "jealous",
          mood: "Langit sore mendung membayang di jendela koridor",
          text: "Rizka menggigit bibirnya pelan, bingung dengan perasaannya sendiri.",
          choices: [
            {
              label: "“Aku tidak bermaksud begitu... aku cuma mengira kalian sedang sibuk berdua.”",
              next: "c4_honest",
              effects: { affection: 4, openness: 4, resonance: "Kejujuran kecil meredakan kesalahpahaman..." }
            },
            {
              label: "“Bukan apa-apa kok, Kael. Aku cuma sedikit kaget saja tadi.”",
              next: "c4_shy",
              effects: { affection: 3, trust: 2, resonance: "Kael menyadari apa yang disembunyikan Rizka..." }
            }
          ]
        },
        c4_honest: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "subtle_blush", kaelExp: "small_smile",
          mood: "Ketegangan di wajah Kael mencair menjadi senyum lembut",
          text: "“Nadine cuma menitipkan presensi karena dia buru-buru piket. ...Ikut aku sebentar ke rooftop, yuk? Langitnya mulai cerah di barat.”",
          next: null
        },
        c4_shy: {
          speaker: "Kael", portrait: "kael", expression: "serious",
          rizkaExp: "worried", kaelExp: "serious",
          mood: "Menatap Rizka dengan lembut namun pasti",
          text: "“Aku tidak mau kita kembali canggung cuma karena salah paham kecil. Ayo ke rooftop sebentar sebelum pulang—ada angin senja yang bagus di atas.”",
          next: null
        }
      }
    },

    // ================= SCENE 5 =================
    s5_railing_view: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Rooftop Sekolah • Golden Hour",
          text: "Awan mendung sore tadi perlahan terbelah oleh cahaya keemasan matahari terbenam. Angin lembut menggerakkan helai rambut dan pita biru Rizka.",
          next: null
        }
      }
    },
    s5_warm_can: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Kael", portrait: "kael", expression: "small_smile",
          rizkaExp: "small_smile", kaelExp: "small_smile",
          mood: "Menggeser satu kaleng minuman hangat di atas tepi parapet",
          text: "“Angin di atap lumayan sejuk. Pegang ini biar tanganmu hangat.”",
          next: null
        }
      }
    },
    s5_climax_confession: {
      start: "n1",
      nodes: {
        n1: {
          speaker: "Rizka", portrait: "rizka", expression: "holding_back",
          rizkaExp: "holding_back", kaelExp: "noticing_rizka",
          mood: "Cahaya senja keemasan membingkai siluet keduanya",
          text: "“Kael... soal di koridor tadi. Maaf kalau aku bersikap kekanak-kanakan.”",
          next: "n2"
        },
        n2: {
          speaker: "Rizka", portrait: "rizka", expression: "subtle_blush",
          rizkaExp: "subtle_blush", kaelExp: "worried",
          mood: "Senja keemasan • Perasaan yang tak lagi bisa disembunyikan",
          text: "“Aku sadar sekarang... aku tidak cemburu karena orang lain, Kael. Aku cuma takut jarak hangat yang baru saja kita bangun menghilang lagi.”",
          next: "choice_5"
        },
        choice_5: {
          speaker: "Pilihan Puncak Chapter 4", portrait: "kael", expression: "serious",
          mood: "Momen penentu di bawah langit Golden Hour",
          text: "Angin senja berembus lembut di atas rooftop sekolah.",
          choices: [
            {
              label: "“Tidak akan menghilang, Rizka. Aku tetap di sini, tepat di sebelahmu.”",
              next: "c5_promise",
              effects: { affection: 6, trust: 6, openness: 5, resonance: "✦ Ikatan hati terasa jauh lebih dekat..." }
            },
            {
              label: "Melangkah setengah langkah lebih dekat dan tersenyum lembut pada Rizka",
              next: "c5_step_closer",
              state: "selected",
              effects: { affection: 7, trust: 5, openness: 6, resonance: "✦ Tanpa kata berlebihan, jarak di antara kalian menghangat..." }
            }
          ]
        },
        c5_promise: {
          speaker: "Rizka", portrait: "rizka", expression: "happy",
          rizkaExp: "happy", kaelExp: "small_smile",
          mood: "Senyum paling tulus tanpa beban di wajah Rizka",
          text: "“...Janji, ya? Terima kasih sudah selalu menunggu sampai aku siap melangkah sedikit lebih dekat.”",
          next: "n_finale"
        },
        c5_step_closer: {
          speaker: "Rizka", portrait: "rizka", expression: "happy",
          rizkaExp: "happy", kaelExp: "small_smile",
          mood: "Bahu mereka hampir bersentuhan menghadap cakrawala emas",
          text: "“Hehe... kalau sedekat ini, sepertinya aku memang tidak bisa menyembunyikan perasaanku lagi.”",
          next: "n_finale"
        },
        n_finale: {
          speaker: "Narasi", portrait: "narasi", expression: "neutral",
          rizkaExp: "happy", kaelExp: "small_smile",
          mood: "Chapter 4: A Little Closer — Selesai",
          text: "Di bawah langit senja yang perlahan meredup, senyum yang paling sulit Rizka jaga bukanlah senyum di depan seluruh sekolah—melainkan senyumnya saat berdiri tepat di samping Kael.",
          triggerChapterEnd: true,
          next: null
        }
      }
    }
  }
};
