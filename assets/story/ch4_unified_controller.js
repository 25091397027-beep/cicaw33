/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   UNIFIED ENGINE CONTROLLER, DIALOGUE, & CHALLENGE ORCHESTRATOR
   (assets/story/ch4_unified_controller.js)
   - Terintegrasi langsung ke Cicaww33App (Single WebGLRenderer, Scene, Camera,
     EffectComposer ACES PostFX, InputHandler, SettingsManager, AudioManager,
     & SaveManager) tanpa duplikasi canvas atau AudioContext.
============================================================================ */
"use strict";

(function () {
  /* -------------------------------------------------------------------------
     1. CHAPTER 4 DIALOGUE CONTROLLER (Typewriter + 3D Lip-Sync + 5-State Choices)
  ------------------------------------------------------------------------- */
  const Ch4Dialogue = {
    host: null,
    active: false,
    tree: null,
    node: null,
    fullText: "",
    shown: 0,
    typing: false,
    timer: 0,
    cps: 54,
    onComplete: null,

    openTree(treeId, onComplete = null) {
      const tree = window.CH4_STORY_DATA?.dialogues?.[treeId];
      if (!tree) { if (onComplete) onComplete(); return; }
      this.tree = tree;
      this.onComplete = onComplete;
      this.active = true;
      if (this.host?.app) this.host.app.game.state = "DIALOGUE";
      if (this.host) this.host.state = "DIALOGUE";
      document.body.classList.add("ch4-dlg-open", "dialogue-open");
      const ov = document.getElementById("ch4-dialogue-overlay");
      if (ov) { ov.classList.remove("hidden"); ov.classList.add("flex"); }
      this._enterNode(tree.start);
    },

    openCustom(cfg, onComplete = null) {
      this.tree = {
        start: "custom",
        nodes: {
          custom: {
            speaker: cfg.speaker || "Rizka",
            portrait: cfg.portraitId || "rizka",
            expression: cfg.expression || "small_smile",
            mood: cfg.mood || "",
            text: cfg.text || "",
            choices: (cfg.choices || []).map((c) => ({
              label: c.label,
              state: c.state || "normal",
              next: null,
              openEnding: !!c.openEnding
            })),
            next: null
          }
        }
      };
      this.onComplete = onComplete;
      this.active = true;
      if (this.host?.app) this.host.app.game.state = "DIALOGUE";
      if (this.host) this.host.state = "DIALOGUE";
      document.body.classList.add("ch4-dlg-open", "dialogue-open");
      const ov = document.getElementById("ch4-dialogue-overlay");
      if (ov) { ov.classList.remove("hidden"); ov.classList.add("flex"); }
      this._enterNode("custom");
    },

    _enterNode(nodeId) {
      if (!nodeId || !this.tree || !this.tree.nodes[nodeId]) {
        this.close();
        return;
      }
      const n = this.tree.nodes[nodeId];
      this.node = n;

      if (n.rizkaExp && this.host?.rizka) this.host.setRizkaExpression(n.rizkaExp);
      if (n.kaelExp && this.host?.kael) this.host.setKaelExpression(n.kaelExp);
      if (n.nadineExp && this.host?.nadine) this.host.nadine.setExpression(n.nadineExp);

      const pId = (n.portrait || "narasi").toLowerCase();
      const spkEl = document.getElementById("ch4-dialogue-speaker");
      if (spkEl) {
        spkEl.textContent = n.speaker || "Cerita";
        spkEl.dataset.speaker = pId;
      }
      const moodEl = document.getElementById("ch4-dialogue-submood");
      if (moodEl) moodEl.textContent = n.mood || "";
      const portEl = document.getElementById("ch4-dialogue-portrait");
      if (portEl && window.Ch4CharacterCore) {
        portEl.innerHTML = Ch4CharacterCore.getPortraitSVG(pId, n.expression || "neutral");
      }

      const chBox = document.getElementById("ch4-choices-container");
      if (chBox) { chBox.innerHTML = ""; chBox.classList.add("hidden"); chBox.classList.remove("flex"); }
      document.getElementById("ch4-dialogue-caret")?.classList.add("hidden");

      this.fullText = n.text || "";
      this.shown = 0;
      this.timer = 0;
      this.typing = true;
      const txtEl = document.getElementById("ch4-dialogue-text");
      if (txtEl) txtEl.textContent = "";
      const hintEl = document.getElementById("ch4-dialogue-hint");
      if (hintEl) hintEl.textContent = "Ketuk / Spasi untuk percepat teks";
      this._syncTalking(true);
    },

    _syncTalking(isTypingNow) {
      const pId = this.node ? (this.node.portrait || "").toLowerCase() : "";
      if (this.host?.rizka) this.host.rizka.talking = isTypingNow && pId === "rizka";
      if (this.host?.kael) this.host.kael.talking = isTypingNow && pId === "kael";
      if (this.host?.nadine) this.host.nadine.talking = isTypingNow && pId === "nadine";
    },

    update(dt) {
      if (!this.active || !this.typing) return;
      this.timer += dt * this.cps;
      const nextCount = Math.min(this.fullText.length, Math.floor(this.timer));
      if (nextCount > this.shown) {
        this.shown = nextCount;
        const txtEl = document.getElementById("ch4-dialogue-text");
        if (txtEl) txtEl.textContent = this.fullText.slice(0, this.shown);
        if (this.shown % 4 === 0 && this.node) {
          Ch4Audio.playBlip((this.node.portrait || "rizka").toLowerCase());
        }
      }
      if (this.shown >= this.fullText.length) {
        this._finishTyping();
      }
    },

    _finishTyping() {
      this.typing = false;
      this._syncTalking(false);
      const txtEl = document.getElementById("ch4-dialogue-text");
      if (txtEl) txtEl.textContent = this.fullText;
      if (this.node && this.node.choices && this.node.choices.length > 0) {
        this._renderChoices(this.node.choices);
        const hintEl = document.getElementById("ch4-dialogue-hint");
        if (hintEl) hintEl.textContent = "Pilih salah satu respons di atas";
      } else {
        document.getElementById("ch4-dialogue-caret")?.classList.remove("hidden");
        const hintEl = document.getElementById("ch4-dialogue-hint");
        if (hintEl) hintEl.textContent = "Ketuk / Spasi untuk lanjut";
      }
    },

    _renderChoices(choices) {
      const chBox = document.getElementById("ch4-choices-container");
      if (!chBox) return;
      chBox.innerHTML = "";
      choices.forEach((ch) => {
        const btn = document.createElement("button");
        btn.className = "ch4-choice-btn" + (ch.state === "selected" ? " is-selected" : "");
        btn.disabled = ch.state === "disabled";
        btn.textContent = ch.label;
        btn.onclick = (e) => {
          e.stopPropagation();
          if (btn.disabled) return;
          Ch4Audio.playClick();
          chBox.querySelectorAll(".ch4-choice-btn").forEach((b) => b.classList.remove("is-selected"));
          btn.classList.add("is-selected");
          if (ch.effects && this.host) this.host.applyChoiceEffects(ch.effects);
          if (ch.openEnding && this.host) {
            this.close(true);
            this.host.showChapterEnding();
            return;
          }
          if (ch.next) this._enterNode(ch.next);
          else this.close();
        };
        chBox.appendChild(btn);
      });
      chBox.classList.remove("hidden");
      chBox.classList.add("flex");
    },

    advance() {
      if (!this.active) return;
      if (this.typing) {
        this._finishTyping();
        return;
      }
      if (this.node && this.node.choices && this.node.choices.length > 0) return;
      Ch4Audio.playClick();
      const triggerEnd = this.node && this.node.triggerChapterEnd;
      const nextId = this.node ? this.node.next : null;
      if (triggerEnd && this.host) {
        this.close(true);
        this.host.showChapterEnding();
        return;
      }
      this._enterNode(nextId);
    },

    skipToChoiceOrEnd() {
      let guard = 0;
      while (this.active && this.node && guard++ < 30) {
        if (this.node.choices && this.node.choices.length > 0) {
          this._finishTyping();
          return;
        }
        if (this.node.triggerChapterEnd && this.host) {
          this.close(true);
          this.host.showChapterEnding();
          return;
        }
        if (!this.node.next) {
          this.close();
          return;
        }
        this._enterNode(this.node.next);
      }
    },

    close(silentAbort = false) {
      this._syncTalking(false);
      this.active = false;
      this.tree = null;
      this.node = null;
      this.typing = false;
      document.body.classList.remove("ch4-dlg-open", "dialogue-open");
      const ov = document.getElementById("ch4-dialogue-overlay");
      if (ov) { ov.classList.add("hidden"); ov.classList.remove("flex"); }
      if (!silentAbort && this.host?.active) {
        this.host.state = "PLAYING";
        if (this.host.app && this.host.app.game.state === "DIALOGUE") {
          this.host.app.game.state = "PLAYING";
        }
      }
      const cb = this.onComplete;
      this.onComplete = null;
      if (!silentAbort && cb) cb();
    }
  };

  /* -------------------------------------------------------------------------
     2. INTERACTIVE CHALLENGE CONTROLLER (Clue Observation & Calm Breath Sync)
  ------------------------------------------------------------------------- */
  /* ---- v12: tantangan interaktif Chapter 4 (memakai pustaka mini-game Ch3Mini) ---- */
  const CH4_MINI = {
    cues: { kicker: "Setelah Telepon", title: "Baca Bahasa Tubuh Rizka", how: "Ketuk 3 tanda Rizka sedang tertekan. Hindari pengecoh.", need: 3, time: 14, sid: "s1_cues", slabel: "Baca bahasa tubuh",
      items: [{ i: "📱", l: "Genggam ponsel erat", ok: true }, { i: "😬", l: "Senyum tegang", ok: true }, { i: "👀", l: "Menghindari tatapan", ok: true }, { i: "🎀", l: "Pita rapi" }, { i: "🚪", l: "Pintu tertutup" }, { i: "👟", l: "Sepatu bersih" }] },
    books: { kicker: "Pagi di Sekolah", title: "Cari Buku di Loker", how: "Ketuk jilid berurutan: 1 → 5.", time: 14, sid: "s2_books", slabel: "Susun buku loker",
      items: [{ i: "📕", l: "Jilid 1" }, { i: "📗", l: "Jilid 2" }, { i: "📘", l: "Jilid 3" }, { i: "📙", l: "Jilid 4" }, { i: "📓", l: "Jilid 5" }] },
    greet: { kicker: "Pintu Kelas 11-A", title: "Menyapa Kael", how: "Spontan! Pilih sebelum waktu habis.", time: 6, fallback: 2, sid: "s2_greet", slabel: "Sapaan spontan",
      options: [{ i: "😊", l: "Sapa seperti biasa", key: "normal", pts: 70, eff: { trust: 1 } }, { i: "🌤️", l: "Sapa pelan, apa adanya", key: "honest", pts: 100, eff: { openness: 2, affection: 1, resonance: "Sapaan yang terasa lebih jujur..." } }, { i: "📚", l: "Pura-pura sibuk membaca", key: "avoid", pts: 55, eff: {} }] },
    seeNadine: { kicker: "Koridor Sore", title: "Melihat Kael & Nadine", how: "Reaksi pertamamu? Cepat!", time: 6, fallback: 2, sid: "s4_react", slabel: "Reaksi spontan",
      options: [{ i: "🚶", l: "Mendekat dan menyapa", key: "approach", pts: 100, eff: { trust: 1, affection: 1 } }, { i: "😮‍💨", l: "Tarik napas dulu", key: "breath", pts: 85, eff: { openness: 1 } }, { i: "🙈", l: "Pura-pura tidak lihat", key: "avoid", pts: 55, eff: {} }] },
    notes: { kicker: "Catatan Kelompok", title: "Susun Halaman Catatan", how: "Ketuk halaman berurutan: 1 → 4.", time: 14, sid: "s4_notes", slabel: "Susun catatan",
      items: [{ i: "📄", l: "Halaman 1" }, { i: "📑", l: "Halaman 2" }, { i: "📃", l: "Halaman 3" }, { i: "📋", l: "Halaman 4" }] },
    words: { kicker: "Golden Hour", title: "Kata yang Jujur", how: "Ketuk 4 kata yang benar-benar ingin kamu ucapkan. Buang topengnya.", need: 4, time: 14, sid: "s5_words", slabel: "Keberanian bicara jujur",
      items: [{ i: "💛", l: "Jujur", ok: true }, { i: "😔", l: "Lelah", ok: true }, { i: "🤝", l: "Percaya", ok: true }, { i: "🌤️", l: "Nyaman", ok: true }, { i: "🎭", l: "Baik-baik saja" }, { i: "🙂", l: "Biasa saja" }, { i: "🔒", l: "Nggak apa-apa" }, { i: "🏆", l: "Sempurna" }] },
  };
  const Ch4Mini = {
    run(kind, cfg, done) {
      const host = Ch4Challenge.host, c = Object.assign({}, cfg);
      if (host) host.state = "CHALLENGE"; if (host && host.app) host.app.game.state = "CUTSCENE";
      c.onDone = (r) => { if (host && host.active) { host.state = "PLAYING"; host.app.game.state = "PLAYING"; } if (done) done(r || {}); };
      const M = (typeof Ch3Mini !== "undefined") ? Ch3Mini : null;
      if (!M || !M[kind]) { c.onDone({ ok: true }); return; }
      M[kind](c);
    },
  };

  const Ch4Challenge = {
    host: null,
    active: false,
    _timer: null,
    _pos: 12,
    _dir: 1,
    _onDone: null,

    open(mode, onDone = null) {
      this.stop();
      this.active = true;
      this._onDone = onDone;
      if (this.host) this.host.state = "CHALLENGE";
      if (this.host?.app) this.host.app.game.state = "CUTSCENE";

      const ov = document.getElementById("ch4-challenge-overlay");
      const kicker = document.getElementById("ch4-chal-kicker");
      const title = document.getElementById("ch4-chal-title");
      const desc = document.getElementById("ch4-chal-desc");
      const body = document.getElementById("ch4-chal-body");
      const status = document.getElementById("ch4-chal-status");
      if (!ov || !body) { this.finish(); return; }

      if (mode === "clue_finder") {
        kicker.textContent = "OBSERVATION CHALLENGE • SCENE 1";
        title.textContent = "Perubahan Kecil yang Terlihat";
        desc.textContent = "Meski Rizka tersenyum dan berkata ia baik-baik saja setelah telepon dari Ayah, detail bahasa tubuh mana yang disadari Kael?";
        status.textContent = "Pilih 1 petunjuk bahasa tubuh yang tepat";
        const clues = [
          { icon: "📱", label: "Jari tangan Rizka masih menggenggam erat ponselnya hingga gemetar", ok: true },
          { icon: "🎀", label: "Pita rambut biru langitnya terpasang rapi seperti biasa", ok: false },
          { icon: "🚪", label: "Pintu Unit 302 tertutup rapat di belakangnya", ok: false }
        ];
        body.innerHTML = clues.map((c) => `
          <button onclick="Ch4Challenge.pickClue(${c.ok})" class="ch4-choice-btn flex items-center gap-3">
            <span class="text-lg">${c.icon}</span>
            <span>${c.label}</span>
          </button>
        `).join("");
      } else {
        kicker.textContent = "EMOTIONAL TIMING • SCENE 3";
        title.textContent = "Menyelaraskan Keheningan";
        desc.textContent = "Ketuk tombol saat indikator cahaya berada di dalam Zona Emas agar suasana di dekat jendela kelas terasa tenang dan hangat.";
        status.textContent = "Hentikan indikator tepat di tengah (Spasi / Klik)";
        body.innerHTML = `
          <div class="p-4 rounded-2xl bg-[#0d1424] border border-amber-200/20 space-y-3">
            <div class="relative h-5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
              <div class="absolute top-0 bottom-0 left-[34%] w-[32%] bg-amber-400/35 border-x border-amber-300"></div>
              <div id="ch4-timing-cursor" class="absolute top-0 bottom-0 w-2.5 bg-[#fff8ee] shadow-[0_0_12px_#f4c57a]" style="left: 12%"></div>
            </div>
            <button onclick="Ch4Challenge.checkTiming()" class="game-btn game-btn-primary w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#fff8ee]">
              ✨ Hentikan Tepat di Zona Emas
            </button>
          </div>
        `;
        this._pos = 12;
        this._dir = 1;
        this._timer = setInterval(() => {
          this._pos += this._dir * 2.1;
          if (this._pos >= 94) { this._pos = 94; this._dir = -1; }
          if (this._pos <= 4) { this._pos = 4; this._dir = 1; }
          const cur = document.getElementById("ch4-timing-cursor");
          if (cur) cur.style.left = `${this._pos}%`;
        }, 24);
      }

      ov.classList.remove("hidden");
      ov.classList.add("flex");
    },

    pickClue(ok) {
      if (ok) {
        Ch4Audio.playWarmChime();
        if (this.host) this.host.applyChoiceEffects({ trust: 2, affection: 2, resonance: "Kael peka membaca bahasa tubuh Rizka..." });
        this.finish();
      } else {
        Ch4Audio.playMissionBanner(true);
        const st = document.getElementById("ch4-chal-status");
        if (st) st.textContent = "Kurang tepat — perhatikan benda yang masih digenggam Rizka.";
      }
    },

    checkTiming() {
      this.stop();
      const hit = this._pos >= 32 && this._pos <= 68;
      if (hit) {
        Ch4Audio.playWarmChime();
        if (this.host) this.host.applyChoiceEffects({ affection: 3, openness: 2, resonance: "Keheningan hangat menyelimuti bangku jendela..." });
        this.finish();
      } else {
        Ch4Audio.playMissionBanner(true);
        const st = document.getElementById("ch4-chal-status");
        if (st) st.textContent = "Sedikit terburu-buru — coba hentikan di zona emas tengah!";
        setTimeout(() => { if (this.active) this.open("breath_timing", this._onDone); }, 450);
      }
    },

    stop() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },

    finish(silentAbort = false) {
      this.stop();
      this.active = false;
      const ov = document.getElementById("ch4-challenge-overlay");
      if (ov) { ov.classList.add("hidden"); ov.classList.remove("flex"); }
      if (!silentAbort && this.host?.active) {
        this.host.state = "PLAYING";
        if (this.host.app) this.host.app.game.state = "PLAYING";
      }
      const cb = this._onDone;
      this._onDone = null;
      if (!silentAbort && cb) cb();
    }
  };

  /* -------------------------------------------------------------------------
     3. UNIFIED CHAPTER 4 CONTROLLER (`Chapter4Controller` / `window.Ch4Game`)
  ------------------------------------------------------------------------- */
  class Chapter4Controller {
    constructor(app) {
      this.app = app;
      this.SAVE_KEY = "cicaww33_ch4_save_v1";
      this.TUTORIAL_KEY = "cicaww33_ch4_tutorial_seen";

      this.active = false;
      this.state = "IDLE"; // IDLE | PLAYING | DIALOGUE | CHALLENGE | PAUSED | CUTSCENE
      this.quality = this._mapQuality(app.settings.data.graphics);

      this.group = null;
      this.rizka = null;
      this.kael = null;
      this.nadine = null;
      this.activeEnv = null;
      this.activeSceneId = "scene_1";
      this._rizkaOutfit = "uniform";
      this._orbitMode = null;

      this.rel = { affection: 18, trust: 14, openness: 10 };
      this.flags = {};
      this.stepDone = [];
      this.interactables = [];
      this.nearestSpot = null;
      this.bannerTimer = null;

      this.velocity = new THREE.Vector3();
      this.camYaw = 1.32;
      this.camPitch = 0.18;
      this.camDist = 3.2;
      this._yawTarget = 1.32;
      this._pitchTarget = 0.18;
      this._distTarget = 3.2;
      this.camTarget = new THREE.Vector3(0, 1.32, 0);
      this.camLookOverride = null;
      this.lastFootstepIdx = 0;
      this._savedPcHintHTML = null;

      Ch4Dialogue.host = this;
      Ch4Challenge.host = this;
      if (window.Ch4Audio) Ch4Audio.bindHostAudio(app.audio);

      this._injectDOM();
      this._bindLocalKeyboard();

      window.Ch4Dialogue = Ch4Dialogue;
      window.Ch4Challenge = Ch4Challenge;
      window.Ch4Game = this;
      window.CicawwCh4VisualAPI = {
        setScenePreset: (id) => this.loadScene(id, false),
        setRizkaExpression: (exp) => this.setRizkaExpression(exp),
        setKaelExpression: (exp) => this.setKaelExpression(exp),
        setPosePreset: (pose) => this.applyPosePreset(pose),
        toggleIncomingCallOverlay: (show) => this.toggleIncomingCall(show),
        renderDialogueUI: (cfg) => Ch4Dialogue.openCustom(cfg),
        showMissionNotification: (cfg) => this.showMissionBanner(cfg),
        openChallengeUI: (mode) => Ch4Challenge.open(mode),
        pulseRelationshipResonance: (msg) => this.pulseResonance(msg),
        showEndingScreen: () => this.showChapterEnding(),
        showTitleCard: () => this.returnToTitle()
      };
    }

    _mapQuality(gfx) {
      if (gfx === "low") return "low";
      if (gfx === "medium") return "medium";
      return "high";
    }

    _injectDOM() {
      if (document.getElementById("ch4-injected-styles")) return;
      const st = document.createElement("style");
      st.id = "ch4-injected-styles";
      st.textContent = `
        .aaa-mission-card {
          position: relative;
          background: linear-gradient(135deg, rgba(18, 27, 45, 0.90) 0%, rgba(29, 37, 58, 0.86) 65%, rgba(44, 34, 48, 0.88) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(244, 197, 122, 0.36);
          box-shadow: 0 16px 40px rgba(5, 9, 18, 0.58), inset 0 0 0 1px rgba(255, 248, 238, 0.08);
        }
        .gfx-low .aaa-mission-card { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
        .ch4-choice-btn {
          position: relative;
          width: 100%;
          text-align: left;
          padding: 0.78rem 1.05rem;
          border-radius: 0.95rem;
          font-size: 0.84rem;
          line-height: 1.42;
          color: #fff8ee;
          background: linear-gradient(135deg, rgba(24, 36, 58, 0.92), rgba(18, 27, 45, 0.95));
          border: 1px solid rgba(244, 197, 122, 0.28);
          box-shadow: 0 6px 18px rgba(8, 12, 24, 0.45);
          transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .ch4-choice-btn:hover:not(:disabled):not(.is-selected) {
          transform: translateX(4px);
          background: linear-gradient(135deg, rgba(46, 68, 102, 0.96), rgba(34, 48, 76, 0.98));
          border-color: rgba(244, 197, 122, 0.85);
          box-shadow: 0 10px 24px rgba(244, 197, 122, 0.22);
        }
        .ch4-choice-btn:active:not(:disabled) {
          transform: scale(0.985);
          background: linear-gradient(135deg, rgba(217, 140, 95, 0.38), rgba(40, 56, 86, 0.96));
          border-color: #f4c57a;
        }
        .ch4-choice-btn.is-selected {
          background: linear-gradient(135deg, rgba(217, 140, 95, 0.45), rgba(184, 106, 75, 0.38));
          border-color: #f4c57a;
          box-shadow: 0 0 22px rgba(244, 197, 122, 0.35), inset 0 0 0 1px rgba(255, 248, 238, 0.28);
          color: #fff8ee;
        }
        .ch4-choice-btn:disabled {
          opacity: 0.44;
          cursor: not-allowed;
          background: rgba(18, 25, 40, 0.68);
          border-color: rgba(148, 163, 184, 0.18);
          color: #94a3b8;
          box-shadow: none;
        }
        @keyframes missionBannerIn {
          0% { opacity: 0; transform: translateY(-18px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes missionBannerOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-14px) scale(0.97); }
        }
        .mission-banner-enter { animation: missionBannerIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .mission-banner-exit { animation: missionBannerOut 0.35s ease-in forwards; }
        @keyframes phonePulseRing {
          0% { transform: scale(0.95); opacity: 0.75; }
          70% { transform: scale(1.38); opacity: 0; }
          100% { transform: scale(1.38); opacity: 0; }
        }
        @keyframes subtlePhoneVibrate {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-1.4deg); }
          40% { transform: rotate(1.4deg); }
          60% { transform: rotate(-1deg); }
          80% { transform: rotate(1deg); }
        }
        .call-ring-wave { animation: phonePulseRing 2s infinite cubic-bezier(0.2, 0.7, 0.3, 1); }
        .phone-vibrate { animation: subtlePhoneVibrate 0.45s infinite ease-in-out; }
        @keyframes resonanceFloat {
          0% { opacity: 0; transform: translateY(8px) scale(0.94); }
          20% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(-2px) scale(1); }
          100% { opacity: 0; transform: translateY(-10px) scale(0.96); }
        }
        .resonance-toast-anim { animation: resonanceFloat 3.4s forwards ease-out; }
        body.ch4-active #game-hud > div > div.glass-soft:first-child {
          display: none !important;
        }
        body.ch4-active #game-hud > div > div:last-child {
          margin-left: auto !important;
        }
        @media (hover: none) and (pointer: coarse), (max-height: 520px) {
          #pc-hint-bar { display: none !important; }
        }
        body.ch4-dlg-open #pc-hint-bar,
        body.ch4-dlg-open #interact-prompt,
        body.ch4-dlg-open #ch4-guide {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        #ch4-dialogue-speaker[data-speaker="kael"] { background: rgba(125, 175, 224, 0.22); border-color: rgba(155, 188, 224, 0.45); color: #dceeff; }
        #ch4-dialogue-speaker[data-speaker="nadine"] { background: rgba(232, 162, 122, 0.24); border-color: rgba(244, 197, 152, 0.45); color: #ffeedd; }
        #ch4-dialogue-speaker[data-speaker="ayah"] { background: rgba(148, 163, 184, 0.22); border-color: rgba(203, 213, 225, 0.4); color: #e2e8f0; }
        #ch4-dialogue-speaker[data-speaker="narasi"] { background: rgba(244, 197, 122, 0.14); border-color: rgba(244, 197, 122, 0.28); color: #f6dec0; font-style: italic; }
        @media (max-width: 640px) {
          #ch4-quest-card { top: calc(3.65rem + env(safe-area-inset-top)) !important; width: 214px !important; }
          #ch4-mission-banner { top: calc(17.6rem + env(safe-area-inset-top)) !important; }
        }
        @media (orientation: landscape) and (max-height: 520px) {
          #ch4-quest-card { top: 0.65rem !important; width: 205px !important; padding: 7px 10px !important; }
          #ch4-quest-card #hud-ch4-substeps { font-size: 10px !important; margin-top: 4px !important; }
          #ch4-guide { bottom: 68px !important; transform: translateX(-50%) scale(.86) !important; }
          #ch4-mission-banner { top: 3.55rem !important; max-width: 250px !important; }
        }
      `;
      document.head.appendChild(st);

      const wrap = document.createElement("div");
      wrap.id = "ch4-ui-layer";
      wrap.innerHTML = `
        <!-- Resonance Floating Pill -->
        <div id="ch4-resonance-slot" class="fixed top-[148px] sm:top-[146px] left-1/2 -translate-x-1/2 z-[42] pointer-events-none"></div>

        <!-- Mission Banner (Non-overlapping on Mobile Portrait, Landscape, & Desktop) -->
        <div id="ch4-mission-banner" class="fixed top-[184px] sm:top-4 left-1/2 -translate-x-1/2 z-[38] hidden pointer-events-none w-[88%] max-w-xs sm:max-w-sm">
          <div id="ch4-mission-banner-card" class="aaa-mission-card rounded-2xl px-4 py-2.5 text-center">
            <div class="flex items-center justify-center gap-2 mb-0.5">
              <span class="h-px w-6 bg-gradient-to-r from-transparent to-amber-300/70"></span>
              <span id="mission-banner-type" class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-200 font-semibold">MAIN MISSION • CHAPTER 4</span>
              <span class="h-px w-6 bg-gradient-to-l from-transparent to-amber-300/70"></span>
            </div>
            <div id="mission-banner-title" class="font-serif-title text-base sm:text-lg text-[#fff8ee] font-semibold tracking-wide"></div>
            <div id="mission-banner-desc" class="text-[11px] text-slate-200/85 mt-0.5"></div>
          </div>
        </div>

        <!-- Chapter 4 Active Quest Card (Top-left unified card, zero double-stacking!) -->
        <div id="ch4-quest-card" class="hidden fixed left-3 sm:left-4 top-3 sm:top-4 z-[25] w-[166px] sm:w-[196px] aaa-mission-card rounded-xl px-2.5 py-2 text-[#fff8ee] pointer-events-none transition-all duration-300">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-amber-200 font-semibold truncate">
              <span class="text-amber-300">◆</span><span id="hud-ch4-chapter">CH. 4 • SCENE 1/5</span>
            </div>
            <span id="hud-ch4-progress-pill" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 shrink-0">0/3</span>
          </div>
          <div id="hud-ch4-objective" class="font-serif-title text-xs sm:text-sm font-semibold text-[#fff8ee] mt-0.5 leading-snug"></div>
          <div id="hud-ch4-subloc" class="text-[10px] text-sky-200/85 mt-0.5 truncate"></div>
          <div class="h-1 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div id="hud-ch4-prog-bar" class="h-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-300" style="width:0%"></div>
          </div>
          <div id="hud-ch4-substeps" class="mt-2 space-y-1 text-[11px] leading-snug"></div>
        </div>

        <!-- Directional Compass Guide -->
        <div id="ch4-guide" class="hidden fixed left-1/2 -translate-x-1/2 bottom-[148px] sm:bottom-[116px] z-[25] pointer-events-none flex-col items-center text-[#fff8ee] transition-opacity duration-200">
          <svg id="ch4-guide-arrow" width="36" height="36" viewBox="0 0 40 40" style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.6))">
            <path id="ch4-guide-path" d="M20 4 L34 30 L20 23 L6 30 Z" fill="#f4c57a" stroke="#fff8ee" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>
          <div id="ch4-guide-label" class="text-[11px] font-medium glass-soft rounded-full px-3 py-0.5 mt-0.5 whitespace-nowrap text-amber-100"></div>
        </div>

        <!-- Drawer: Chapter 4 Scene Selector & Camera Inspection -->
        <div id="ch4-drawer-scenes" class="hidden fixed top-16 right-3 sm:top-[4.5rem] sm:right-4 w-[295px] sm:w-[340px] max-h-[72vh] glass-panel rounded-2xl p-3.5 pointer-events-auto flex-col gap-2.5 custom-scroll text-xs z-[35]">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <div class="font-semibold text-amber-200 text-xs uppercase tracking-wider">Chapter 4 • Babak &amp; Kamera</div>
              <div class="text-[10px] text-slate-300">Mainkan berurutan atau lompat ke Scene 1–5</div>
            </div>
            <button onclick="Ch4Game.closeAllDrawers()" class="w-7 h-7 rounded-lg glass-soft text-slate-300 hover:text-white">✕</button>
          </div>
          <div id="ch4-scene-buttons-list" class="space-y-1.5"></div>
          <div class="pt-2 border-t border-white/10 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-emerald-300 text-[11px]">🔍 Sudut Inspeksi Kamera</span>
              <label class="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                <input type="checkbox" id="chk-cutaway-wall" checked onchange="Ch4Game.toggleCutawayWalls(this.checked)" class="accent-amber-300" />
                <span>Dinding Utuh</span>
              </label>
            </div>
            <div class="grid grid-cols-4 gap-1 text-[10px]">
              <button onclick="Ch4Game.setCameraPreset('front')" class="pill-btn py-1.5 rounded-lg text-center">Depan</button>
              <button onclick="Ch4Game.setCameraPreset('back')" class="pill-btn py-1.5 rounded-lg text-center">Belakang</button>
              <button onclick="Ch4Game.setCameraPreset('left')" class="pill-btn py-1.5 rounded-lg text-center">Kiri</button>
              <button onclick="Ch4Game.setCameraPreset('right')" class="pill-btn py-1.5 rounded-lg text-center">Kanan</button>
              <button onclick="Ch4Game.setCameraPreset('diagonal')" class="pill-btn py-1.5 rounded-lg text-center">Diagonal</button>
              <button onclick="Ch4Game.setCameraPreset('closeup')" class="pill-btn py-1.5 rounded-lg text-center">Wajah</button>
              <button onclick="Ch4Game.setCameraPreset('high')" class="pill-btn py-1.5 rounded-lg text-center">Atas</button>
              <button onclick="Ch4Game.setCameraPreset('play')" class="pill-btn py-1.5 rounded-lg text-center text-amber-200">Play</button>
            </div>
          </div>
        </div>

        <!-- Drawer: Chapter 4 Character Expression & Outfit Inspector -->
        <div id="ch4-drawer-characters" class="hidden fixed top-16 right-3 sm:top-[4.5rem] sm:right-4 w-[295px] sm:w-[340px] max-h-[72vh] glass-panel rounded-2xl p-3.5 pointer-events-auto flex-col gap-3 custom-scroll text-xs z-[35]">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <div class="font-semibold text-sky-200 text-xs uppercase tracking-wider">Ekspresi &amp; Kostum Chapter 4</div>
              <div class="text-[10px] text-slate-300">Sinkron langsung pada wajah 3D (9 Morphs)</div>
            </div>
            <button onclick="Ch4Game.closeAllDrawers()" class="w-7 h-7 rounded-lg glass-soft text-slate-300 hover:text-white">✕</button>
          </div>
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-[#fce4c8]">Rizka Alifia Putri (161 cm)</span>
              <span class="text-[10px] font-mono text-amber-200/85" id="lbl-rizka-exp">neutral</span>
            </div>
            <div id="rizka-exp-pills" class="grid grid-cols-3 gap-1"></div>
            <div class="flex gap-1.5 pt-1">
              <button onclick="Ch4Game.setRizkaOutfit('uniform')" id="btn-out-uniform" class="pill-btn active flex-1 py-1.5 rounded-lg text-[11px]">Seragam Navy</button>
              <button onclick="Ch4Game.setRizkaOutfit('cardigan')" id="btn-out-cardigan" class="pill-btn flex-1 py-1.5 rounded-lg text-[11px]">Cardigan Krem</button>
            </div>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-sky-200">Mikhael / Kael (177 cm)</span>
              <span class="text-[10px] font-mono text-sky-200/85" id="lbl-kael-exp">neutral</span>
            </div>
            <div id="kael-exp-pills" class="grid grid-cols-2 gap-1"></div>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="font-semibold text-emerald-200 text-[11px]">Inspeksi Orbit 360° &amp; Bantuan</div>
            <div class="grid grid-cols-3 gap-1.5">
              <button onclick="Ch4Game.toggleOrbit('char')" class="pill-btn py-1.5 rounded-lg">Orbit Karakter</button>
              <button onclick="Ch4Game.toggleOrbit('env')" class="pill-btn py-1.5 rounded-lg">Orbit Ruang</button>
              <button onclick="Ch4Game.closeAllDrawers(); Ch4Game.openModal('modal-ch4-tutorial')" class="pill-btn py-1.5 rounded-lg text-amber-200">Panduan</button>
            </div>
          </div>
        </div>

        <!-- Incoming Call Overlay ("Ayah") — Scene 1 Opening Beat -->
        <section id="ch4-incoming-call-overlay" class="fixed inset-0 z-[45] hidden items-center justify-center bg-[#090e1a]/76 backdrop-blur-md p-4 overflow-y-auto pointer-events-auto">
          <div class="glass-panel w-full max-w-xs max-h-[92vh] custom-scroll my-auto rounded-[2.2rem] p-5 sm:p-6 text-center flex flex-col items-center gap-3.5 border-amber-300/45 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
            <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-sky-200/90">Panggilan Masuk • Scene 1</div>
            <div class="phone-vibrate relative w-20 h-20 flex items-center justify-center my-1 shrink-0">
              <div class="call-ring-wave absolute inset-0 rounded-full border-2 border-amber-300/60"></div>
              <div class="w-16 h-16 rounded-full bg-[#24324d] border-2 border-amber-300 flex items-center justify-center font-serif-title text-2xl font-bold text-[#fff8ee]">A</div>
            </div>
            <div>
              <h3 class="font-serif-title text-2xl text-[#fff8ee]">Ayah</h3>
              <p class="text-[11px] text-slate-300 mt-0.5">Ponsel Rizka bergetar di koridor lantai 3...</p>
            </div>
            <div class="grid grid-cols-2 gap-3 w-full pt-2">
              <button onclick="Ch4Game.resolveIncomingCall('hesitate')" class="game-btn py-2.5 px-3 rounded-2xl text-xs font-semibold text-rose-200 border-rose-300/35">Diamkan Dulu</button>
              <button onclick="Ch4Game.resolveIncomingCall('answer')" class="game-btn game-btn-primary py-2.5 px-3 rounded-2xl text-xs font-semibold text-[#fff8ee]">Angkat Telepon</button>
            </div>
          </div>
        </section>

        <!-- Interactive Challenge Overlay -->
        <section id="ch4-challenge-overlay" class="fixed inset-0 z-[52] hidden items-center justify-center bg-[#090e1a]/78 backdrop-blur-md p-4 overflow-y-auto pointer-events-auto">
          <div class="aaa-mission-card w-full max-w-lg max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div id="ch4-chal-kicker" class="text-[10px] font-mono uppercase tracking-[0.24em] text-amber-200">OBSERVATION CHALLENGE</div>
                <h3 id="ch4-chal-title" class="font-serif-title text-xl text-[#fff8ee] mt-0.5">Perhatikan Detail Kecil</h3>
              </div>
            </div>
            <p id="ch4-chal-desc" class="text-xs sm:text-sm text-slate-200/90 leading-relaxed"></p>
            <div id="ch4-chal-body" class="space-y-2.5"></div>
            <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span id="ch4-chal-status" class="text-slate-300">Pilih detail yang paling tepat</span>
            </div>
          </div>
        </section>

        <!-- Chapter 4 Dialogue Overlay (5-State Choices + Portrait + Skip) -->
        <section id="ch4-dialogue-overlay" class="fixed inset-0 z-[44] hidden flex-col justify-end p-3 sm:p-6 md:p-8 pointer-events-auto">
          <button onclick="Ch4Dialogue.skipToChoiceOrEnd()" class="fixed top-20 right-4 z-[46] px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#fff8ee] bg-[#0f172a]/75 border border-amber-200/30 hover:border-amber-200 cursor-pointer">
            Lewati ⏭
          </button>
          <div onclick="Ch4Dialogue.advance()" class="flex-1 w-full"></div>
          <div id="ch4-choices-container" class="w-full max-w-2xl mx-auto mb-3 hidden flex-col gap-2"></div>
          <div onclick="Ch4Dialogue.advance()" class="glass-panel w-full max-w-3xl mx-auto rounded-2xl p-4 sm:p-5 border-amber-200/35 cursor-pointer">
            <div class="flex items-start gap-3.5 sm:gap-4">
              <div id="ch4-dialogue-portrait" class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1a2438] border border-amber-200/40 overflow-hidden shadow-inner"></div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span id="ch4-dialogue-speaker" class="inline-block px-3 py-0.5 rounded-lg bg-amber-400/20 border border-amber-200/35 text-amber-100 font-semibold text-xs sm:text-sm">Rizka</span>
                  <span id="ch4-dialogue-submood" class="text-[11px] text-sky-200/85 italic truncate max-w-full"></span>
                </div>
                <p id="ch4-dialogue-text" class="text-sm sm:text-base text-[#fff8ee] leading-relaxed min-h-[2.8em]"></p>
                <div class="flex items-center justify-between mt-2 text-[11px] text-amber-200/80">
                  <span id="ch4-dialogue-hint">Ketuk / Spasi untuk lanjut</span>
                  <span id="ch4-dialogue-caret" class="text-amber-300 font-bold animate-caret">▼</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Tutorial Modal -->
        <div id="modal-ch4-tutorial" class="fixed inset-0 z-[58] hidden items-center justify-center bg-[#090e1a]/80 backdrop-blur-md p-4 overflow-y-auto pointer-events-auto">
          <div class="glass-panel w-full max-w-md max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 sm:p-6 flex flex-col gap-3.5 text-xs sm:text-sm">
            <div class="text-center space-y-1">
              <div class="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-200">Panduan Singkat • Chapter 4</div>
              <h3 class="font-serif-title text-2xl text-[#fff8ee]">A Little Closer</h3>
            </div>
            <div class="space-y-2.5 text-slate-200 leading-relaxed">
              <div class="p-3 rounded-2xl bg-[#131d31] border border-white/10">
                <div class="font-semibold text-amber-200 mb-1">💻 Desktop &amp; Laptop</div>
                <p>Gunakan <strong>WASD / Panah</strong> untuk berjalan, <strong>Shift</strong> untuk berlari, <strong>Drag Mouse / Scroll</strong> untuk kamera, serta <strong>E / Spasi</strong> untuk berinteraksi.</p>
              </div>
              <div class="p-3 rounded-2xl bg-[#131d31] border border-white/10">
                <div class="font-semibold text-sky-200 mb-1">📱 Smartphone &amp; Tablet</div>
                <p>Gunakan <strong>Joystick Kiri</strong> untuk berjalan, geser layar untuk kamera, dan ketuk tombol <strong>Act</strong> saat penanda interaksi menyala.</p>
              </div>
              <div class="p-3 rounded-2xl bg-[#131d31] border border-amber-200/20 text-[11px] text-amber-100">
                Ikuti <strong>Panah Kompas Emas</strong> di bagian bawah layar dan daftar objektif di kiri atas untuk memainkan Scene 1 hingga Scene 5.
              </div>
            </div>
            <button onclick="Ch4Game.dismissTutorial()" class="game-btn game-btn-primary py-3 rounded-2xl font-semibold text-sm text-[#fff8ee]">Mengerti, Mulai Bermain</button>
          </div>
        </div>

        <!-- Chapter 4 Ending Modal -->
        <div id="modal-ch4-ending" class="fixed inset-0 z-[68] hidden items-center justify-center bg-[#090e1a]/88 backdrop-blur-md p-4 overflow-y-auto pointer-events-auto">
          <div class="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-3.5 border-amber-300/40 my-auto">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/25 to-rose-400/20 border border-amber-200/45 flex items-center justify-center">
              <span class="text-2xl">🌇</span>
            </div>
            <div class="text-[11px] uppercase tracking-[0.28em] text-amber-200 font-semibold">Cicaww33 • Chapter 4 Selesai</div>
            <h2 id="ending-ch4-heading" class="font-serif-title text-2xl sm:text-3xl text-[#fff8ee]">Perasaan yang Tak Lagi Bisa Disembunyikan</h2>
            <p id="ending-ch4-summary" class="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Di bawah langit senja yang perlahan meredup, Rizka menyadari bahwa senyum yang paling sulit ia jaga bukanlah senyum di depan seluruh sekolah—melainkan senyumnya saat berdiri tepat di samping Kael.
            </p>
            <div id="ending-ch4-stats" class="text-xs font-mono text-sky-200/90 px-3.5 py-1.5 rounded-full bg-sky-400/10 border border-sky-200/20"></div>
            <div class="w-full p-3.5 rounded-2xl bg-[#141e30]/90 border border-amber-200/20 text-xs text-sky-100">
              <div class="text-[10px] uppercase tracking-widest text-amber-200/90 mb-1">Kisah Berlanjut</div>
              <div class="font-serif-title italic text-base text-[#fff8ee]">Chapter 1–4 Telah Diselesaikan • Terima Kasih Telah Bermain</div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
              <button onclick="Ch4Game.replayChapter4()" class="game-btn flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm whitespace-nowrap text-[#fff8ee]">↻ Ulangi Ch. 4</button>
              <button onclick="Ch4Game.openChaptersFromEnding()" class="game-btn flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm whitespace-nowrap text-amber-100">☰ Pilih Chapter</button>
              <button onclick="Ch4Game.returnToTitle()" class="game-btn game-btn-primary flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm whitespace-nowrap font-semibold text-[#fff8ee]">🏠 Menu Utama</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap);
      this._populateDrawers();
    }

    _populateDrawers() {
      const sList = document.getElementById("ch4-scene-buttons-list");
      if (sList && window.CH4_STORY_DATA) {
        sList.innerHTML = Object.values(window.CH4_STORY_DATA.scenes).map((sc) => `
          <button data-ch4-scene-id="${sc.id}" onclick="Ch4Game.closeAllDrawers(); Ch4Game.loadScene('${sc.id}')" class="pill-btn w-full text-left p-2.5 rounded-xl flex flex-col gap-0.5">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-amber-200">${sc.shortTitle}</span>
              <span class="text-[9px] font-mono text-emerald-300">Playable</span>
            </div>
            <span class="text-[11px] text-slate-300">${sc.subtitle}</span>
          </button>
        `).join("");
      }
      const rPills = document.getElementById("rizka-exp-pills");
      if (rPills && window.CH4_STORY_DATA) {
        rPills.innerHTML = window.CH4_STORY_DATA.rizkaExpressions.map((e) => `
          <button data-rizka-exp="${e.id}" onclick="Ch4Game.setRizkaExpression('${e.id}')" class="pill-btn py-1.5 px-2 rounded-lg text-left text-[10px] truncate">${e.label}</button>
        `).join("");
      }
      const kPills = document.getElementById("kael-exp-pills");
      if (kPills && window.CH4_STORY_DATA) {
        kPills.innerHTML = window.CH4_STORY_DATA.kaelExpressions.map((e) => `
          <button data-kael-exp="${e.id}" onclick="Ch4Game.setKaelExpression('${e.id}')" class="pill-btn py-1.5 px-2 rounded-lg text-left text-[10px] truncate">${e.label}</button>
        `).join("");
      }
    }

    _bindLocalKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (!this.active) return;
        if (Ch4Dialogue.active) {
          if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            e.stopImmediatePropagation();
            Ch4Dialogue.advance();
          }
          return;
        }
        if (Ch4Challenge.active && e.code === "Space") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (Ch4Challenge._timer) Ch4Challenge.checkTiming();
          return;
        }
        if (e.code === "Space" && this.state === "PLAYING" && this.nearestSpot && this.app.game.state === "PLAYING") {
          e.preventDefault();
          this.triggerInteraction();
        }
      }, true);
    }

    _ensureCastBuilt() {
      if (this.group) return;
      Ch4Textures.setQuality(this.quality, this.app.renderer);
      this.group = new THREE.Group();
      this.group.name = "Chapter4Root";
      this.rizka = Ch4RizkaBuilder.build();
      this.kael = Ch4KaelBuilder.build();
      this.nadine = Ch4NadineBuilder.build();
      this.group.add(this.rizka.root, this.kael.root, this.nadine.root);
      this.app.scene.add(this.group);
    }

    /* ---------------- START / STOP / EXPORT / RESUME ---------------- */
    start({ carryAffection = 18, resumeState = null } = {}) {
      this._ensureCastBuilt();
      this.active = true;
      this._orbitMode = null;
      this.quality = this._mapQuality(this.app.settings.data.graphics);
      Ch4Textures.setQuality(this.quality, this.app.renderer);

      // Hide Ch.1-3 world sets & characters cleanly
      const w = this.app.world;
      w.courtyardGroup.visible = false;
      w.apartmentGroup.visible = false;
      if (w.rainSystem) w.rainSystem.visible = false;
      if (w.skyDome) w.skyDome.visible = false;
      w.rizkaRig.root.visible = false;
      w.kaelRig.root.visible = false;
      if (this.app.world3) this.app.world3.group.visible = false;
      this.app.interactions.update(w.rizkaRig.root.position, false, "__ch4__");

      // Tight shadow frustum for Ultra-HD Chapter 4 interiors & rooftop
      const sc = 11.5;
      const sh = w.dirLight.shadow;
      sh.camera.left = -sc; sh.camera.right = sc; sh.camera.top = sc; sh.camera.bottom = -sc;
      sh.camera.near = 0.5; sh.camera.far = 42;
      sh.camera.updateProjectionMatrix();

      this.group.visible = true;
      document.body.classList.add("ch4-active");
      Ch4Audio.setActive(true);

      const qCard = document.getElementById("ch4-quest-card");
      if (qCard) qCard.classList.remove("hidden");

      const pcHint = document.getElementById("pc-hint-bar");
      if (pcHint) {
        if (this._savedPcHintHTML === null) this._savedPcHintHTML = pcHint.innerHTML;
        pcHint.innerHTML = `<span><strong class="text-sky-200">Scenes</strong> Babak &amp; Kamera</span><span>•</span><span><strong class="text-amber-200">WASD / Shift</strong> Jalan / Lari</span><span>•</span><span><strong class="text-amber-200">Drag / Scroll</strong> Kamera</span><span>•</span><span><strong class="text-emerald-200">E</strong> Interaksi</span>`;
      }

      if (resumeState && resumeState.sceneId) {
        this.rel = resumeState.rel ? { ...resumeState.rel } : { affection: Math.max(18, carryAffection), trust: 14, openness: 10 };
        this.flags = resumeState.flags ? { ...resumeState.flags } : {};
        this.loadScene(resumeState.sceneId, true);
        if (Array.isArray(resumeState.stepDone) && resumeState.stepDone.length === this.stepDone.length) {
          this.stepDone = [...resumeState.stepDone];
          this._refreshObjectiveHUD();
        }
        if (resumeState.rizkaOutfit) this.setRizkaOutfit(resumeState.rizkaOutfit);
        if (resumeState.playerPos && typeof resumeState.playerPos.x === "number") {
          this.rizka.root.position.set(resumeState.playerPos.x, 0, resumeState.playerPos.z);
          this.camTarget.set(resumeState.playerPos.x, 1.34, resumeState.playerPos.z);
        }
        if (this.activeSceneId === "scene_1" && !this.flags.s1_call_handled) {
          setTimeout(() => { if (this.active) this.toggleIncomingCall(true); }, 360);
        } else {
          this.state = "PLAYING";
          this.app.game.state = "PLAYING";
        }
      } else {
        this.rel = { affection: Math.max(18, carryAffection), trust: 14, openness: 10 };
        this.flags = {};
        this.setRizkaOutfit("uniform");
        this.loadScene("scene_1", true);
        setTimeout(() => {
          if (!this.active) return;
          const seenTut = localStorage.getItem(this.TUTORIAL_KEY);
          if (false && !seenTut) {
            this.state = "CUTSCENE";
            this.app.game.state = "CUTSCENE";
            this.openModal("modal-ch4-tutorial");
          } else {
            this.toggleIncomingCall(true);
          }
        }, 380);
      }
    }

    stop() {
      const wasActive = this.active;
      this.active = false;
      document.body.classList.remove("ch4-active");
      this.state = "IDLE";
      this._orbitMode = null;
      clearTimeout(this.bannerTimer);

      Ch4Dialogue.close(true);
      Ch4Challenge.finish(true);
      this.toggleIncomingCall(false);
      this.closeAllDrawers();
      this.closeModal("modal-ch4-tutorial");
      this.closeModal("modal-ch4-ending");

      document.getElementById("ch4-quest-card")?.classList.add("hidden");
      const gEl = document.getElementById("ch4-guide");
      if (gEl) gEl.style.display = "none";
      document.getElementById("ch4-mission-banner")?.classList.add("hidden");
      const rSlot = document.getElementById("ch4-resonance-slot");
      if (rSlot) rSlot.innerHTML = "";
      this._updateHUDInteractPrompt(null);

      this._disposeActiveEnv();
      if (this.group) this.group.visible = false;
      Ch4Audio.setActive(false);

      if (wasActive) {
        const w = this.app.world;
        if (w.skyDome) w.skyDome.visible = true;
        w.rizkaRig.root.visible = true;
        w.rimLight.position.set(-10, 9, -14);
        w.charFillLight.color.setHex(0xfff4ea);
        w.charFillLight.intensity = 0.19;
        w.charFillLight.position.set(-7, 11, 9);
        const d = 18, sh = w.dirLight.shadow;
        sh.camera.left = -d; sh.camera.right = d; sh.camera.top = d; sh.camera.bottom = -d;
        sh.camera.near = 1.5; sh.camera.far = 65;
        sh.camera.updateProjectionMatrix();
      }

      const pcHint = document.getElementById("pc-hint-bar");
      if (pcHint && this._savedPcHintHTML !== null) {
        pcHint.innerHTML = this._savedPcHintHTML;
      }
    }

    exportState() {
      return {
        sceneId: this.activeSceneId,
        rel: { ...this.rel },
        flags: { ...this.flags },
        stepDone: [...this.stepDone],
        rizkaOutfit: this._rizkaOutfit || "uniform",
        completed: !!this.flags.ch4_completed,
        playerPos: this.rizka ? { x: this.rizka.root.position.x, y: 0, z: this.rizka.root.position.z } : null
      };
    }

    saveProgress(silent = false) {
      if (!this.active) return false;
      this.app.game.currentChapter = "chapter_04";
      this.app.game.relationships.kael = Math.max(this.app.game.relationships.kael || 0, Math.min(100, this.rel.affection));
      const pos = this.rizka ? this.rizka.root.position : null;
      const ok = this.app.saveManager.save(this.app.game.exportSaveData(pos));
      try {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify({
          version: 1,
          ...this.exportState(),
          savedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }));
      } catch (_) {}
      if (!silent && ok) this.pulseResonance("💾 Progres Chapter 4 berhasil disimpan");
      return ok;
    }

    onGraphicsQualityChanged(gfx) {
      const nq = this._mapQuality(gfx);
      if (nq === this.quality) return;
      this.quality = nq;
      Ch4Textures.setQuality(this.quality, this.app.renderer);
      if (this.active && this.activeEnv && this.rizka) {
        const curPos = this.rizka.root.position.clone();
        const curRot = this.rizka.root.rotation.y;
        const savedSteps = [...this.stepDone];
        this.loadScene(this.activeSceneId, true);
        this.rizka.root.position.copy(curPos);
        this.rizka.root.rotation.y = curRot;
        this.stepDone = savedSteps;
        this._refreshObjectiveHUD();
      }
    }

    /* ---------------- SCENE LOADING & LIGHTING ---------------- */
    _disposeActiveEnv() {
      if (!this.activeEnv) return;
      this.interactables.forEach((it) => {
        if (it.marker && it.marker.parent) it.marker.parent.remove(it.marker);
      });
      this.interactables = [];
      if (this.group) this.group.remove(this.activeEnv.root);
      this.activeEnv.root.traverse((obj) => {
        if (obj.isPoints && obj.geometry) obj.geometry.dispose();
      });
      this.activeEnv = null;
    }

    loadScene(sceneId, instant = false) {
      if (!this.active) {
        this.app._startChapter4(false, { sceneId });
        return;
      }
      const sc = window.CH4_STORY_DATA.scenes[sceneId] || window.CH4_STORY_DATA.scenes.scene_1;
      const doSetup = () => {
        this._disposeActiveEnv();
        const rSlot = document.getElementById("ch4-resonance-slot");
        if (rSlot) rSlot.innerHTML = "";
        this.activeSceneId = sc.id;
        this.app.game.currentChapter = "chapter_04";
        this.app.game.activeScenePreset = "ch4_" + sc.id;
        this.camLookOverride = null;
        this._orbitMode = null;
        this.velocity.set(0, 0, 0);
        this.rizka.poseOverride = null;
        this.kael.poseOverride = null;
        this.nadine.poseOverride = null;

        if (sc.id === "scene_1") this.activeEnv = Ch4Scene1Apartment.build(this.quality);
        else if (sc.id === "scene_2") this.activeEnv = Ch4Scene2And4Corridor.build("morning", this.quality);
        else if (sc.id === "scene_3") this.activeEnv = Ch4Scene3Classroom.build(this.quality);
        else if (sc.id === "scene_4") this.activeEnv = Ch4Scene2And4Corridor.build("overcast", this.quality);
        else this.activeEnv = Ch4Scene5Rooftop.build(this.quality);

        this.group.add(this.activeEnv.root);
        this._applyLighting(this.activeEnv.lighting);
        Ch4Audio.setMood(sc.moodAudio);

        this.rizka.root.position.set(sc.spawn.x, 0, sc.spawn.z);
        this.rizka.root.rotation.y = sc.spawn.rotY;
        this.setRizkaExpression(sc.rizkaInit.exp);
        this.rizka.setPhoneState(!!sc.rizkaInit.phone, sc.rizkaInit.phoneMode || "ended");

        this.kael.root.visible = !!sc.kael.visible;
        if (sc.kael.visible) {
          this.kael.root.position.set(sc.kael.x, 0, sc.kael.z);
          this.kael.root.rotation.y = sc.kael.rotY;
          this.setKaelExpression(sc.kael.exp);
        }

        this.nadine.root.visible = !!sc.nadine.visible;
        if (sc.nadine.visible) {
          this.nadine.root.position.set(sc.nadine.x, 0, sc.nadine.z);
          this.nadine.root.rotation.y = sc.nadine.rotY;
          this.nadine.setExpression(sc.nadine.exp || "friendly_smile");
        }

        this.camYaw = this._yawTarget = sc.camera.yaw;
        this.camPitch = this._pitchTarget = sc.camera.pitch;
        this.camDist = this._distTarget = sc.camera.dist;
        this.camTarget.set(sc.spawn.x, 1.34, sc.spawn.z);
        this.app.input.consumeCameraDelta();

        this.stepDone = sc.steps.map(() => false);
        this._setupSceneInteractables(sc.id);
        this._refreshObjectiveHUD();
        this._syncDrawerActiveStates();

        // Update top-left shared HUD card harmoniously
        const hc = document.getElementById("hud-chapter");
        const ho = document.getElementById("hud-objective");
        const hm = document.getElementById("hud-rizka-mode");
        if (hc) hc.textContent = "Cicaww33 • Ch. 4: A Little Closer";
        if (ho) ho.textContent = sc.shortTitle;
        if (hm) hm.textContent = sc.subtitle;

        this.state = "PLAYING";
        this.app.game.state = "PLAYING";
        this.saveProgress(true);
        this.showMissionBanner({
          type: `CHAPTER 4 • SCENE ${sc.order}/5`,
          title: sc.missionTitle,
          desc: sc.subtitle,
          tone: "main"
        });
      };

      if (instant) {
        doSetup();
      } else {
        this.state = "CUTSCENE";
        this.app.game.state = "CUTSCENE";
        this.app._transitionWithFade(sc.shortTitle, sc.subtitle, doSetup);
      }
    }

    _applyLighting(L) {
      const w = this.app.world;
      this.app.scene.background = new THREE.Color(L.bg);
      this.app.scene.fog = new THREE.FogExp2(L.fog, L.fogDensity);
      w.hemiLight.color.setHex(L.hemiSky);
      w.hemiLight.groundColor.setHex(L.hemiGround);
      w.hemiLight.intensity = L.hemiIntensity;
      w.dirLight.color.setHex(L.dirColor);
      w.dirLight.intensity = L.dirIntensity;
      w.dirLight.position.set(...L.dirPos);
      w.rimLight.color.setHex(L.rimColor);
      w.rimLight.intensity = L.rimIntensity;
      w.rimLight.position.set(...L.rimPos);
      w.charFillLight.color.setHex(0xfff2e2);
      w.charFillLight.intensity = 0.26;
      w.charFillLight.position.set(-4, 5, 6);
    }

    /* ---------------- SCENE INTERACTABLES & PROGRESSION ---------------- */
    _addSpot({ id, label, x, y = 1.35, z, radius = 2.1, color = 0xf4c57a, isOptional = false, isActive, onUse }) {
      const marker = new THREE.Group();
      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.11, 0),
        new THREE.MeshBasicMaterial({ color })
      );
      diamond.scale.set(0.85, 1.35, 0.85);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.23, 24),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -y + 0.04;
      marker.add(diamond, ring);
      marker.position.set(x, y, z);
      this.activeEnv.root.add(marker);

      this.interactables.push({ id, label, x, y, z, radius, isOptional, isActive, onUse, marker, baseY: y });
    }

    _setupSceneInteractables(sceneId) {
      if (sceneId === "scene_1") {
        this._addSpot({
          id: "s1_window", label: "Tarik Napas di Jendela Galeri", x: 1.55, z: -1.85, radius: 2.2,
          isActive: () => !this.stepDone[0],
          onUse: () => { Ch4Mini.run("breath", { cycles: 2, sid: "s1_breath", slabel: "Tarik napas" }, () => { this._markStep(0); Ch4Dialogue.openTree("s1_window_breath"); }); }
        });
        this._addSpot({
          id: "s1_kael", label: "Bicara dengan Kael", x: -0.95, z: 2.05, y: 1.85, radius: 2.3,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            Ch4Mini.run("pick", CH4_MINI.cues, () => {
              Ch4Dialogue.openTree("s1_kael_talk", () => {
                this._markStep(1);
                this.rizka.setPhoneState(false);
              });
            });
          }
        });
        this._addSpot({
          id: "s1_door302", label: "Masuk ke Unit 302 (Selesai Malam Ini)", x: -1.75, z: -1.55, radius: 2.1, color: 0x6ee7b7,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this._markStep(2);
            Ch4Dialogue.openTree("s1_enter_302", () => this.loadScene("scene_2"));
          }
        });
      } else if (sceneId === "scene_2") {
        this._addSpot({
          id: "s2_board", label: "Amati Papan Pengumuman (Opsional)", x: -1.95, z: 4.35, radius: 2.1, color: 0x9bbce0, isOptional: true,
          isActive: () => !this.flags.s2_board_seen,
          onUse: () => {
            this.flags.s2_board_seen = true;
            this.showMissionBanner({
              type: "SIDE OBSERVATION",
              title: "Peringkat & Jadwal Piket 11-A",
              desc: "Rizka melihat daftar peringkat #1 dan jadwal koordinator catatan bersama Nadine.",
              tone: "side"
            });
            Ch4Dialogue.openTree("s2_board_side");
          }
        });
        this._addSpot({
          id: "s2_locker", label: "Ambil Buku Catatan di Loker", x: -1.55, z: -2.2, radius: 2.25,
          isActive: () => !this.stepDone[0],
          onUse: () => { Ch4Mini.run("tapnum", CH4_MINI.books, () => { this._markStep(0); Ch4Audio.playWarmChime(); Ch4Dialogue.openTree("s2_locker"); }); }
        });
        this._addSpot({
          id: "s2_kael", label: "Sapa Kael di Pintu Kelas 11-A", x: -0.95, z: 1.55, y: 1.85, radius: 2.3, color: 0x6ee7b7,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            this._markStep(1);
            Ch4Mini.run("react", CH4_MINI.greet, (r) => { this.applyChoiceEffects(r && r.opt && r.opt.eff); Ch4Dialogue.openTree("s2_kael_morning", () => this.loadScene("scene_3")); });
          }
        });
      } else if (sceneId === "scene_3") {
        this._addSpot({
          id: "s3_desk", label: "Letakkan Buku di Meja Dekat Jendela", x: -0.35, z: -3.25, radius: 2.2,
          isActive: () => !this.stepDone[0],
          onUse: () => { this._markStep(0); Ch4Dialogue.openTree("s3_desk"); }
        });
        this._addSpot({
          id: "s3_drink", label: "Periksa Kaleng Teh Hangat", x: 0.15, z: -3.35, radius: 2.2,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => { this._markStep(1); Ch4Audio.playWarmChime(); Ch4Dialogue.openTree("s3_drink"); }
        });
        this._addSpot({
          id: "s3_kael", label: "Berbincang dengan Kael di Sisi Jendela", x: 1.15, z: -3.45, y: 1.85, radius: 2.3, color: 0x6ee7b7,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            Ch4Mini.run("breath", { cycles: 2, sid: "s3_breath", slabel: "Selaraskan keheningan" }, () => {
              this._markStep(2);
              Ch4Dialogue.openTree("s3_window_talk", () => this.loadScene("scene_4"));
            });
          }
        });
      } else if (sceneId === "scene_4") {
        this._addSpot({
          id: "s4_approach", label: "Dekati Kael & Nadine", x: -0.5, z: 1.2, y: 1.80, radius: 2.5,
          isActive: () => !this.stepDone[0],
          onUse: () => { Ch4Mini.run("react", CH4_MINI.seeNadine, (r) => { this.applyChoiceEffects(r && r.opt && r.opt.eff); this.flags.s4_reaction = r && r.opt ? r.opt.key : "none"; this._markStep(0); Ch4Dialogue.openTree("s4_see_nadine"); }); }
        });
        this._addSpot({
          id: "s4_table", label: "Letakkan Catatan Kelompok di Meja Konsol", x: -1.65, z: 6.85, radius: 2.3,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            Ch4Mini.run("tapnum", CH4_MINI.notes, () => {
            this._markStep(1);
            Ch4Dialogue.openTree("s4_put_notes", () => {
              this.nadine.root.visible = false;
              this.kael.root.position.set(-0.65, 0, 4.5);
              this.kael.root.rotation.y = 0.25;
            });
            });
          }
        });
        this._addSpot({
          id: "s4_kael", label: "Dengarkan Penjelasan Kael", x: -0.65, z: 4.5, y: 1.85, radius: 2.4, color: 0x6ee7b7,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this._markStep(2);
            Ch4Dialogue.openTree("s4_kael_clarify", () => this.loadScene("scene_5"));
          }
        });
      } else if (sceneId === "scene_5") {
        this._addSpot({
          id: "s5_overlook", label: "Tatap Langit Senja dari Tepi Pagar", x: -0.45, z: -4.85, radius: 2.3,
          isActive: () => !this.stepDone[0],
          onUse: () => { Ch4Mini.run("pick", CH4_MINI.words, (r) => { if (r && r.ok) this.applyChoiceEffects({ openness: 3, affection: 2, resonance: "Kata-kata jujur akhirnya keluar..." }); this._markStep(0); Ch4Dialogue.openTree("s5_railing_view"); }); }
        });
        this._addSpot({
          id: "s5_can", label: "Ambil Minuman Hangat dari Kael", x: 0.05, z: -5.05, radius: 2.2,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => { this._markStep(1); Ch4Audio.playWarmChime(); Ch4Dialogue.openTree("s5_warm_can"); }
        });
        this._addSpot({
          id: "s5_confess", label: "Bicara Jujur pada Kael", x: 0.48, z: -4.65, y: 1.85, radius: 2.4, color: 0xf4c57a,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this._markStep(2);
            this.rizka.root.position.set(-0.36, 0, -4.65);
            this.rizka.root.rotation.y = 1.08;
            this.kael.root.position.set(0.42, 0, -4.72);
            this.kael.root.rotation.y = -1.12;
            this.camYaw = this._yawTarget = 0.06;
            this.camPitch = this._pitchTarget = 0.09;
            this.camDist = this._distTarget = 2.35;
            this.camLookOverride = new THREE.Vector3(0.03, 1.38, -4.68);
            Ch4Dialogue.openTree("s5_climax_confession");
          }
        });
      }
    }

    _markStep(idx) {
      if (this.stepDone[idx] !== undefined) {
        this.stepDone[idx] = true;
        this._refreshObjectiveHUD();
        this.saveProgress(true);
      }
    }

    _refreshObjectiveHUD() {
      const sc = window.CH4_STORY_DATA?.scenes?.[this.activeSceneId];
      if (!sc) return;
      const doneCount = this.stepDone.filter(Boolean).length;
      const total = sc.steps.length;
      const chEl = document.getElementById("hud-ch4-chapter");
      const obEl = document.getElementById("hud-ch4-objective");
      const slEl = document.getElementById("hud-ch4-subloc");
      const plEl = document.getElementById("hud-ch4-progress-pill");
      const brEl = document.getElementById("hud-ch4-prog-bar");
      const stEl = document.getElementById("hud-ch4-substeps");
      if (chEl) chEl.textContent = `CH. 4 • SCENE ${sc.order}/5`;
      if (obEl) obEl.textContent = sc.missionTitle;
      if (slEl) slEl.textContent = sc.subtitle;
      if (plEl) plEl.textContent = `${doneCount}/${total}`;
      if (brEl) brEl.style.width = `${Math.round((doneCount / Math.max(1, total)) * 100)}%`;

      const curIdx = this.stepDone.findIndex((d) => !d);
      if (stEl) {
        stEl.innerHTML = sc.steps.map((txt, i) => [txt, i]).filter(([_, i]) => i === (curIdx < 0 ? sc.steps.length - 1 : curIdx)).map(([txt, i]) => `
          <div class="flex items-start gap-1.5 ${this.stepDone[i] ? "text-emerald-300/80 line-through" : i === curIdx ? "text-amber-100 font-medium" : "text-slate-400"}">
            <span class="shrink-0 mt-0.5 text-[10px]">${this.stepDone[i] ? "✓" : i === curIdx ? "◆" : "◇"}</span>
            <span>${txt}</span>
          </div>
        `).join("");
      }
    }

    /* ---------------- INCOMING CALL, EFFECTS, BANNER, & ENDING ---------------- */
    toggleIncomingCall(show) {
      const el = document.getElementById("ch4-incoming-call-overlay");
      if (el) {
        el.classList.toggle("hidden", !show);
        el.classList.toggle("flex", show);
      }
      Ch4Audio.startPhoneVibrate(show);
      if (show && this.active) {
        this.state = "CUTSCENE";
        this.app.game.state = "CUTSCENE";
        if (this.rizka) this.rizka.setPhoneState(true, "ringing");
      }
    }

    resolveIncomingCall(action) {
      Ch4Audio.playClick();
      this.flags.s1_call_handled = true;
      this.toggleIncomingCall(false);
      if (this.rizka) this.rizka.setPhoneState(true, "ended");
      if (action === "answer") {
        this.applyChoiceEffects({ openness: 2 });
        Ch4Dialogue.openTree("s1_answered");
      } else {
        this.applyChoiceEffects({ trust: 1 });
        Ch4Dialogue.openTree("s1_hesitated");
      }
    }

    applyChoiceEffects(eff) {
      if (!eff) return;
      if (eff.affection) {
        this.rel.affection += eff.affection;
        this.app.game.relationships.kael = Math.min(100, Math.max(this.app.game.relationships.kael || 0, this.rel.affection));
      }
      if (eff.trust) this.rel.trust += eff.trust;
      if (eff.openness) this.rel.openness += eff.openness;
      if (eff.resonance) {
        Ch4Audio.playWarmChime();
        this.pulseResonance(eff.resonance);
      }
    }

    pulseResonance(message) {
      const slot = document.getElementById("ch4-resonance-slot");
      if (!slot) return;
      slot.innerHTML = `
        <div class="resonance-toast-anim glass-soft px-4 py-1.5 rounded-full border-rose-300/45 text-[11px] sm:text-xs text-rose-100 flex items-center gap-2 shadow-lg">
          <span class="text-amber-300">✦</span>
          <span>${message}</span>
        </div>
      `;
    }

    showMissionBanner({ type = "MAIN MISSION", title = "", desc = "", tone = "main" }) {
      const wrap = document.getElementById("ch4-mission-banner");
      const card = document.getElementById("ch4-mission-banner-card");
      if (!wrap || !card) return;
      const tones = {
        main: { border: "rgba(244, 197, 122, 0.65)", badge: "#f4c57a" },
        side: { border: "rgba(155, 188, 224, 0.65)", badge: "#9bbce0" },
        success: { border: "rgba(110, 231, 183, 0.72)", badge: "#6ee7b7" },
        fail: { border: "rgba(232, 143, 147, 0.72)", badge: "#fda4af" }
      };
      const t = tones[tone] || tones.main;
      card.style.borderColor = t.border;
      const typeEl = document.getElementById("mission-banner-type");
      if (typeEl) { typeEl.style.color = t.badge; typeEl.textContent = type; }
      const titleEl = document.getElementById("mission-banner-title");
      if (titleEl) titleEl.textContent = title;
      const descEl = document.getElementById("mission-banner-desc");
      if (descEl) descEl.textContent = desc;

      wrap.classList.remove("hidden");
      card.classList.remove("mission-banner-exit");
      card.classList.add("mission-banner-enter");
      Ch4Audio.playMissionBanner(tone === "fail");

      clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => {
        card.classList.remove("mission-banner-enter");
        card.classList.add("mission-banner-exit");
        setTimeout(() => wrap.classList.add("hidden"), 360);
      }, 3400);
    }

    showChapterEnding() {
      setTimeout(() => { try { Score.showCard("chapter_04"); } catch (_) {} }, 900);
      Ch4Audio.playWarmChime();
      this.flags.ch4_completed = true;
      this.app.game.setFlag("ch4_completed", true);
      this.app.game.completeChapter("chapter_04");
      this.saveProgress(true);

      const score = this.rel.affection + this.rel.trust + this.rel.openness;
      const heading = score >= 82
        ? "Selangkah Lebih Dekat Tanpa Topeng"
        : "Kehangatan yang Mulai Tumbuh";
      const hEl = document.getElementById("ending-ch4-heading");
      if (hEl) hEl.textContent = heading;
      const sEl = document.getElementById("ending-ch4-stats");
      if (sEl) sEl.textContent = `Kedekatan ${this.rel.affection} • Kepercayaan ${this.rel.trust} • Keterbukaan ${this.rel.openness}`;
      this.openModal("modal-ch4-ending");
      this.state = "PAUSED";
      this.app.game.state = "PAUSED";
    }

    replayChapter4() {
      this.closeModal("modal-ch4-ending");
      this.app._startChapter4(false, null);
    }

    openChaptersFromEnding() {
      this.closeModal("modal-ch4-ending");
      this.app._populateChapterModal();
      this.app._toggleModal("modal-chapters", true);
    }

    returnToTitle() {
      this.closeModal("modal-ch4-ending");
      this.app._returnToMainMenu();
    }

    dismissTutorial() {
      Ch4Audio.playClick();
      try { localStorage.setItem(this.TUTORIAL_KEY, "1"); } catch (_) {}
      this.closeModal("modal-ch4-tutorial");
      if (this.activeSceneId === "scene_1" && !this.flags.s1_call_handled) {
        this.toggleIncomingCall(true);
      } else {
        this.state = "PLAYING";
        this.app.game.state = "PLAYING";
      }
    }

    /* ---------------- EXPRESSIONS, POSES, DRAWERS & MODALS ---------------- */
    setRizkaExpression(exp) {
      if (!this.rizka) return;
      this.rizka.setExpression(exp);
      const lbl = document.getElementById("lbl-rizka-exp");
      if (lbl) lbl.textContent = exp;
      this._syncDrawerActiveStates();
    }

    setKaelExpression(exp) {
      if (!this.kael) return;
      this.kael.setExpression(exp);
      const lbl = document.getElementById("lbl-kael-exp");
      if (lbl) lbl.textContent = exp;
      this._syncDrawerActiveStates();
    }

    setRizkaOutfit(variant) {
      this._rizkaOutfit = variant;
      if (this.rizka) this.rizka.setOutfitVariant(variant);
      document.getElementById("btn-out-uniform")?.classList.toggle("active", variant === "uniform");
      document.getElementById("btn-out-cardigan")?.classList.toggle("active", variant === "cardigan");
    }

    applyPosePreset(poseId) {
      if (poseId === "after_call") this.loadScene("scene_1");
      else if (poseId === "morning_hallway") this.loadScene("scene_2");
      else if (poseId === "different_distance") this.loadScene("scene_3");
      else if (poseId === "misunderstanding") this.loadScene("scene_4");
      else if (poseId === "golden_hour_ending") this.loadScene("scene_5");
    }

    toggleCutawayWalls(showFull) {
      if (!this.activeEnv || !this.activeEnv.cutawayMeshes) return;
      this.activeEnv.cutawayMeshes.forEach((m) => { m.visible = showFull; });
    }

    toggleOrbit(kind) {
      this._orbitMode = this._orbitMode === kind ? null : kind;
      Toast.show(this._orbitMode ? `Orbit ${kind === "char" ? "Karakter" : "Ruang"} 360° aktif` : "Orbit dihentikan", "info", 1600);
    }

    setCameraPreset(mode) {
      if (!this.rizka) return;
      this._orbitMode = null;
      const p = this.rizka.root.position;
      if (mode === "play") {
        this.camLookOverride = null;
        this.camDist = this._distTarget = 3.2;
        this.camPitch = this._pitchTarget = 0.20;
        return;
      }
      if (mode === "closeup") {
        this.camYaw = this._yawTarget = this.rizka.root.rotation.y;
        this.camPitch = this._pitchTarget = 0.06;
        this.camDist = this._distTarget = 1.15;
        this.camLookOverride = new THREE.Vector3(p.x, 1.43, p.z);
        return;
      }
      const map = {
        front:    [this.rizka.root.rotation.y, 0.16, 2.8],
        back:     [this.rizka.root.rotation.y + Math.PI, 0.18, 3.0],
        left:     [this.rizka.root.rotation.y - Math.PI / 2, 0.16, 2.9],
        right:    [this.rizka.root.rotation.y + Math.PI / 2, 0.16, 2.9],
        diagonal: [this.rizka.root.rotation.y + 0.68, 0.22, 3.2],
        high:     [this.rizka.root.rotation.y + 0.45, 0.62, 4.4]
      };
      const cfg = map[mode] || map.diagonal;
      this.camYaw = this._yawTarget = cfg[0];
      this.camPitch = this._pitchTarget = cfg[1];
      this.camDist = this._distTarget = cfg[2];
      this.camLookOverride = null;
    }

    _syncDrawerActiveStates() {
      document.querySelectorAll("[data-ch4-scene-id]").forEach((b) => b.classList.toggle("active", b.dataset.ch4SceneId === this.activeSceneId));
      document.querySelectorAll("[data-rizka-exp]").forEach((b) => b.classList.toggle("active", b.dataset.rizkaExp === this.rizka?.currentExpr));
      document.querySelectorAll("[data-kael-exp]").forEach((b) => b.classList.toggle("active", b.dataset.kaelExp === this.kael?.currentExpr));
    }

    toggleDrawer(id) {
      Ch4Audio.playClick();
      const el = document.getElementById(id);
      if (!el) return;
      const hidden = el.classList.contains("hidden");
      this.closeAllDrawers();
      if (hidden) {
        el.classList.remove("hidden");
        el.classList.add("flex");
        this._syncDrawerActiveStates();
      }
    }

    closeAllDrawers() {
      ["ch4-drawer-scenes", "ch4-drawer-characters"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) { el.classList.add("hidden"); el.classList.remove("flex"); }
      });
    }

    openModal(id) {
      const m = document.getElementById(id);
      if (m) { m.classList.remove("hidden"); m.classList.add("flex"); }
    }

    closeModal(id) {
      const m = document.getElementById(id);
      if (m) { m.classList.add("hidden"); m.classList.remove("flex"); }
    }

    /* ---------------- INTERACTION & MAIN FRAME UPDATE ---------------- */
    triggerInteraction() {
      if (!this.active || this.state !== "PLAYING" || this.app.game.state !== "PLAYING" || !this.nearestSpot) return;
      Ch4Audio.playClick();
      this.nearestSpot.onUse();
    }

    _updateHUDInteractPrompt(spot) {
      const prompt = document.getElementById("interact-prompt");
      const promptText = document.getElementById("interact-prompt-text");
      const touchBtn = document.getElementById("btn-touch-interact");
      if (!prompt || !promptText || !touchBtn) return;
      if (spot) {
        promptText.textContent = spot.label;
        prompt.classList.remove("opacity-0", "translate-y-2");
        touchBtn.classList.add("touch-interact-ready");
        touchBtn.classList.remove("opacity-60");
      } else {
        prompt.classList.add("opacity-0", "translate-y-2");
        touchBtn.classList.remove("touch-interact-ready");
        touchBtn.classList.add("opacity-60");
      }
    }

    update(dt, elapsed) {
      if (!this.active || !this.rizka) return;

      if (this.activeEnv && this.activeEnv.update) {
        this.activeEnv.update(dt, elapsed);
      }
      Ch4Dialogue.update(dt);

      const canMove = this.state === "PLAYING" && this.app.game.state === "PLAYING";
      const camDelta = this.app.input.consumeCameraDelta();
      if (canMove) {
        const sens = 0.0055 * this.app.settings.data.cameraSensitivity;
        const invY = this.app.settings.data.invertY ? -1 : 1;
        this._yawTarget -= camDelta.x * sens;
        this._pitchTarget = Math.max(0.04, Math.min(0.88, this._pitchTarget + camDelta.y * sens * invY));
        this._distTarget = Math.max(1.15, Math.min(6.2, this._distTarget + camDelta.zoom));
      }
      const kCam = Ch4Animator.dampK(20, dt);
      this.camYaw += (this._yawTarget - this.camYaw) * kCam;
      this.camPitch += (this._pitchTarget - this.camPitch) * kCam;
      this.camDist += (this._distTarget - this.camDist) * Ch4Animator.dampK(10, dt);

      const mv = canMove ? this.app.input.getMoveVector(dt) : { x: 0, y: 0 };
      const mag = Math.min(1, Math.hypot(mv.x, mv.y));
      const running = canMove && mag > 0.45 && this.app.input.isSprinting();
      const topSpeed = running ? 5.1 : 3.1;

      let wishX = 0, wishZ = 0;
      if (mag > 0.02) {
        this.camLookOverride = null;
        this._orbitMode = null;
        this.rizka.poseOverride = null;
        const sinY = Math.sin(this.camYaw), cosY = Math.cos(this.camYaw);
        const fx = -sinY, fz = -cosY;
        const rx = cosY, rz = -sinY;
        wishX = (fx * (mv.y / mag) + rx * (mv.x / mag)) * topSpeed * mag;
        wishZ = (fz * (mv.y / mag) + rz * (mv.x / mag)) * topSpeed * mag;
      }

      const kv = Ch4Animator.dampK(mag > 0.02 ? 10 : 12, dt);
      this.velocity.x += (wishX - this.velocity.x) * kv;
      this.velocity.z += (wishZ - this.velocity.z) * kv;
      if (mag <= 0.02 && Math.hypot(this.velocity.x, this.velocity.z) < 0.015) {
        this.velocity.set(0, 0, 0);
      }

      const speed = Math.hypot(this.velocity.x, this.velocity.z);
      const pos = this.rizka.root.position;
      if (speed > 0.15) {
        const wantRot = Math.atan2(this.velocity.x, this.velocity.z);
        this.rizka.root.rotation.y = Ch4Animator.dampAngle(this.rizka.root.rotation.y, wantRot, 11, dt);
      }

      pos.x += this.velocity.x * dt;
      pos.z += this.velocity.z * dt;

      const zn = this.activeEnv ? this.activeEnv.zone : null;
      if (zn) {
        const b = zn.bounds, rr = 0.28;
        const clampB = () => {
          pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
          pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
        };
        clampB();
        for (let pass = 0; pass < 2; pass++) {
          for (const c of zn.colliders) {
            const x0 = c.x0 - rr, x1 = c.x1 + rr, z0 = c.z0 - rr, z1 = c.z1 + rr;
            if (pos.x > x0 && pos.x < x1 && pos.z > z0 && pos.z < z1) {
              const dl = pos.x - x0, dr = x1 - pos.x, dtZ = pos.z - z0, db = z1 - pos.z;
              const m = Math.min(dl, dr, dtZ, db);
              if (m === dl) { pos.x = x0; this.velocity.x = Math.min(0, this.velocity.x); }
              else if (m === dr) { pos.x = x1; this.velocity.x = Math.max(0, this.velocity.x); }
              else if (m === dtZ) { pos.z = z0; this.velocity.z = Math.min(0, this.velocity.z); }
              else { pos.z = z1; this.velocity.z = Math.max(0, this.velocity.z); }
            }
          }
        }
        clampB();
      }

      const wind = this.activeEnv ? this.activeEnv.windStrength : 0.2;
      const kaelHeadTarget = this.kael.root.visible ? new THREE.Vector3(this.kael.root.position.x, 1.56, this.kael.root.position.z) : null;
      const rizkaHeadTarget = new THREE.Vector3(pos.x, 1.44, pos.z);

      Ch4Animator.animateCharacter(this.rizka, dt, { speed, isRunning: running, windStrength: wind, lookTarget: kaelHeadTarget });
      if (this.kael.root.visible) {
        if (pos.distanceToSquared(this.kael.root.position) < 18 && !this.nadine.root.visible) {
          const angToRizka = Math.atan2(pos.x - this.kael.root.position.x, pos.z - this.kael.root.position.z);
          this.kael.root.rotation.y = Ch4Animator.dampAngle(this.kael.root.rotation.y, angToRizka, 2.8, dt);
        }
        Ch4Animator.animateCharacter(this.kael, dt, { speed: 0, windStrength: wind * 0.7, lookTarget: rizkaHeadTarget });
      }
      if (this.nadine.root.visible) {
        Ch4Animator.animateCharacter(this.nadine, dt, { speed: 0, windStrength: wind * 0.6, lookTarget: kaelHeadTarget });
      }

      const stepIdx = Math.floor((this.rizka.walkPhase || 0) / Math.PI);
      if (stepIdx !== this.lastFootstepIdx) {
        this.lastFootstepIdx = stepIdx;
        if (speed > 0.8 && canMove) Ch4Audio.playFootstep(running);
      }

      const cam = this.app.camera;
      if (this._orbitMode && canMove) {
        const rad = this._orbitMode === "char" ? 1.55 : 5.4;
        const ang = elapsed * 0.55;
        const ty = this._orbitMode === "char" ? 1.38 : 1.7;
        cam.position.set(pos.x + Math.sin(ang) * rad, ty + (this._orbitMode === "char" ? 0.08 : 0.85), pos.z + Math.cos(ang) * rad);
        cam.lookAt(pos.x, ty, pos.z);
      } else {
        const desiredLook = this.camLookOverride || new THREE.Vector3(pos.x, 1.34, pos.z);
        this.camTarget.lerp(desiredLook, Ch4Animator.dampK(9, dt));
        const hDist = Math.cos(this.camPitch) * this.camDist;
        const vDist = Math.sin(this.camPitch) * this.camDist;
        cam.position.set(
          this.camTarget.x + Math.sin(this.camYaw) * hDist,
          Math.max(0.45, this.camTarget.y + vDist),
          this.camTarget.z + Math.cos(this.camYaw) * hDist
        );
        if (zn && zn.cam) {
          const cb = zn.cam, cp = cam.position;
          cp.x = Math.max(cb.minX, Math.min(cb.maxX, cp.x));
          cp.z = Math.max(cb.minZ, Math.min(cb.maxZ, cp.z));
          cp.y = Math.min(cp.y, cb.maxY);
        }
        cam.lookAt(this.camTarget);
      }

      this._updateInteractablesAndGuide(elapsed, canMove);
    }

    _updateInteractablesAndGuide(elapsed, canMove) {
      const pos = this.rizka.root.position;
      let nearest = null, minDist = Infinity;
      let primaryGuideSpot = null;

      for (const it of this.interactables) {
        const active = it.isActive ? it.isActive() : true;
        it.marker.visible = active;
        if (!active) continue;

        it.marker.position.y = it.baseY + Math.sin(elapsed * 3.2) * 0.08;
        it.marker.children[0].rotation.y = elapsed * 1.8;

        if (!it.isOptional && !primaryGuideSpot) primaryGuideSpot = it;

        const d = Math.hypot(pos.x - it.x, pos.z - it.z);
        if (d <= it.radius && d < minDist) {
          minDist = d;
          nearest = it;
        }
      }

      if (canMove && nearest) {
        this.nearestSpot = nearest;
        this._updateHUDInteractPrompt(nearest);
      } else {
        this.nearestSpot = null;
        this._updateHUDInteractPrompt(null);
      }

      const guideEl = document.getElementById("ch4-guide");
      if (guideEl) {
        if (canMove && primaryGuideSpot) {
          guideEl.style.display = "flex";
          const dx = primaryGuideSpot.x - pos.x, dz = primaryGuideSpot.z - pos.z;
          const dist = Math.hypot(dx, dz);
          const fwd = new THREE.Vector3();
          this.app.camera.getWorldDirection(fwd);
          const fl = Math.hypot(fwd.x, fwd.z) || 1;
          const fx = fwd.x / fl, fz = fwd.z / fl;
          const dotF = dx * fx + dz * fz;
          const dotR = dx * -fz + dz * fx;
          const arr = document.getElementById("ch4-guide-arrow");
          if (arr) arr.style.transform = `rotate(${Math.atan2(dotR, dotF)}rad)`;
          const isNear = dist <= primaryGuideSpot.radius;
          document.getElementById("ch4-guide-path")?.setAttribute("fill", isNear ? "#6ee7b7" : "#f4c57a");
          const lbl = document.getElementById("ch4-guide-label");
          if (lbl) {
            lbl.textContent = isNear
              ? `✦ ${primaryGuideSpot.label} · Tekan E / Act`
              : `${primaryGuideSpot.label} · ${dist.toFixed(1)} m`;
          }
        } else {
          guideEl.style.display = "none";
        }
      }
    }
  }

  window.Chapter4Controller = Chapter4Controller;
})();
