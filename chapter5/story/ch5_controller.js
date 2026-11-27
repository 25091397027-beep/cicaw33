/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   UNIFIED PLAYABLE CHAPTER 5 CONTROLLER
   (assets/chapter5/story/ch5_controller.js)
   - Integrates seamlessly into Cicaww33App (shares Three.js r128 scene, camera,
     lights, InputHandler, AudioManager, SaveManager, Feedback, & Score).
   - Implements all 5 playable scenes, varied mission mechanics, cinematic
     camera framing, companion walking AI, save/load resume, & ending cutscene.
============================================================================ */
"use strict";

(function () {
  const CH5_SAVE_KEY = "cicaww33_ch5_save_v1";

  /* -------------------------------------------------------------------------
     1. PORTRAIT SVG / CANVAS BADGES FOR CHAPTER 5 SPEAKERS
  ------------------------------------------------------------------------- */
  const Ch5Portraits = {
    getHTML(speaker, node = {}) {
      if (speaker === "Ponsel Rizka") {
        return `<div class="w-full h-full flex items-center justify-center bg-[#152036] text-2xl">📱</div>`;
      }
      const low = (speaker || "Rizka").toLowerCase();
      if (window.Ch4CharacterCore && typeof Ch4CharacterCore.getPortraitSVG === "function") {
        if (low.includes("rizka")) return Ch4CharacterCore.getPortraitSVG("rizka", node.rizkaExp || "small_smile");
        if (low.includes("kael")) return Ch4CharacterCore.getPortraitSVG("kael", node.kaelExp || "calm");
        if (low.includes("nadine")) return Ch4CharacterCore.getPortraitSVG("nadine", node.nadineExp || "friendly_smile");
      }
      if (window.CharacterArtwork && typeof CharacterArtwork.getPortraitSVG === "function") {
        if (low.includes("mira")) return CharacterArtwork.getPortraitSVG("mira", "neutral", false);
        if (low.includes("hana")) return CharacterArtwork.getPortraitSVG("hana", "happy", false);
        if (low.includes("sena")) return CharacterArtwork.getPortraitSVG("sena", "neutral", false);
      }
      return window.Ch4CharacterCore ? Ch4CharacterCore.getPortraitSVG("rizka", "neutral") : "";
    }
  };

  /* -------------------------------------------------------------------------
     2. CONCISE CINEMATIC DIALOGUE ENGINE FOR CHAPTER 5
  ------------------------------------------------------------------------- */
  const Ch5Dialogue = {
    host: null,
    active: false,
    tree: null,
    nodeId: null,
    onComplete: null,
    fullText: "",
    charIdx: 0,
    typing: false,
    typeAccum: 0,

    open(treeId, onComplete = null) {
      const trees = window.CH5_STORY_DATA && window.CH5_STORY_DATA.dialogues;
      const t = trees && trees[treeId];
      if (!t || !this.host) {
        if (onComplete) onComplete();
        return;
      }
      this.active = true;
      this.tree = t;
      this.onComplete = onComplete;
      this.host.state = "DIALOGUE";
      this.host.app.game.state = "DIALOGUE";
      const ov = document.getElementById("ch5-dialogue-overlay");
      if (ov) { ov.classList.remove("hidden"); ov.classList.add("flex"); }
      this._showNode(t.start);
    },

    _buildCtx() {
      const h = this.host;
      return {
        ch4HighOpenness: (h.rel.openness || 10) >= 14 || (h.rel.affection || 18) >= 26,
        s4Approach: (h.flags && h.flags.s4_approach) || "space"
      };
    },

    _showNode(id) {
      if (!id || !this.tree || !this.tree.nodes[id]) {
        this.close();
        return;
      }
      this.nodeId = id;
      const node = this.tree.nodes[id];
      const h = this.host;

      // Apply character expressions, body gestures, and cinematic camera framing
      if (node.rizkaExp && h.rizka) h.rizka.setExpression(node.rizkaExp);
      if (node.kaelExp && h.kael) h.kael.setExpression(node.kaelExp);
      if (node.nadineExp && h.nadine) h.nadine.setExpression(node.nadineExp);
      if (node.miraExp && h.buMira) h.buMira.setExpression(node.miraExp);
      if (node.hanaExp && h.hana) h.hana.setExpression(node.hanaExp);
      if (node.senaExp && h.sena) h.sena.setExpression(node.senaExp);

      if (node.rizkaAct && h.rizka) h.rizka.playAction(node.rizkaAct, 1.5);
      if (node.kaelAct && h.kael) h.kael.playAction(node.kaelAct, 1.5);
      if (node.camShot) h.applyCinematicShot(node.camShot, node.speaker);

      const choicesBox = document.getElementById("ch5-choices-container");
      const card = document.getElementById("ch5-dialogue-card");

      if (Array.isArray(node.choices) && node.choices.length > 0) {
        this.typing = false;
        this._setTalkingSpeaker(null);
        if (card) card.classList.add("opacity-90");
        const hint = document.getElementById("ch5-dialogue-hint");
        if (hint) hint.textContent = "Pilih respons di atas";
        if (choicesBox) {
          choicesBox.classList.remove("hidden");
          choicesBox.classList.add("flex");
          choicesBox.innerHTML = node.choices.map((c, idx) => `
            <button data-ch5-choice="${idx}" class="glass-panel w-full text-left px-4 py-3 rounded-2xl border border-amber-200/35 hover:border-amber-300 hover:bg-amber-400/15 active:scale-[0.99] transition text-xs sm:text-sm text-[#fff8ee] font-medium flex items-center gap-3 cursor-pointer">
              <span class="w-6 h-6 rounded-lg bg-amber-300/20 border border-amber-200/40 flex items-center justify-center text-xs font-mono text-amber-200 shrink-0">${idx + 1}</span>
              <span>${c.label}</span>
            </button>
          `).join("");
          choicesBox.querySelectorAll("[data-ch5-choice]").forEach((btn) => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const pick = node.choices[Number(btn.dataset.ch5Choice)];
              if (!pick) return;
              window.Ch5Audio && Ch5Audio.playClick();
              choicesBox.classList.add("hidden");
              choicesBox.classList.remove("flex");
              if (card) card.classList.remove("opacity-90");
              if (pick.effects) h.applyChoiceEffects(pick.effects);
              this._showNode(pick.next);
            };
          });
        }
        return;
      }

      if (choicesBox) { choicesBox.classList.add("hidden"); choicesBox.classList.remove("flex"); }
      if (card) card.classList.remove("opacity-90");

      const spk = node.speaker || "Rizka";
      const spkEl = document.getElementById("ch5-dialogue-speaker");
      const subEl = document.getElementById("ch5-dialogue-submood");
      const porEl = document.getElementById("ch5-dialogue-portrait");
      const txtEl = document.getElementById("ch5-dialogue-text");
      const hntEl = document.getElementById("ch5-dialogue-hint");

      if (spkEl) spkEl.textContent = spk;
      if (subEl) subEl.textContent = node.submood || "";
      if (porEl) porEl.innerHTML = Ch5Portraits.getHTML(spk, node);
      if (hntEl) hntEl.textContent = "Ketuk / Spasi untuk lanjut";

      this.fullText = typeof node.textFn === "function" ? node.textFn(this._buildCtx()) : (node.text || "");
      this.charIdx = 0;
      this.typing = true;
      this.typeAccum = 0;
      if (txtEl) txtEl.textContent = "";
      this._setTalkingSpeaker(spk);
    },

    _setTalkingSpeaker(spk) {
      const h = this.host;
      if (!h) return;
      [
        [h.rizka, "Rizka"],
        [h.kael, "Kael"],
        [h.nadine, "Nadine"],
        [h.buMira, "Bu Mira"],
        [h.hana, "Hana"],
        [h.sena, "Sena"]
      ].forEach(([rig, nm]) => {
        if (rig) rig.talking = this.typing && spk === nm;
      });
    },

    update(dt) {
      if (!this.active || !this.typing) return;
      this.typeAccum += dt * 52;
      const nextIdx = Math.min(this.fullText.length, Math.floor(this.typeAccum));
      if (nextIdx !== this.charIdx) {
        this.charIdx = nextIdx;
        const txtEl = document.getElementById("ch5-dialogue-text");
        if (txtEl) txtEl.textContent = this.fullText.slice(0, this.charIdx);
        const node = this.tree && this.tree.nodes[this.nodeId];
        if (window.Ch5Audio) Ch5Audio.playBlip(node ? node.speaker : "Rizka");
      }
      if (this.charIdx >= this.fullText.length) {
        this.typing = false;
        this._setTalkingSpeaker(null);
      }
    },

    advance() {
      if (!this.active) return;
      const node = this.tree && this.tree.nodes[this.nodeId];
      if (!node) { this.close(); return; }
      if (Array.isArray(node.choices) && node.choices.length > 0) return;

      if (this.typing) {
        this.typing = false;
        this.charIdx = this.fullText.length;
        const txtEl = document.getElementById("ch5-dialogue-text");
        if (txtEl) txtEl.textContent = this.fullText;
        this._setTalkingSpeaker(null);
        return;
      }
      window.Ch5Audio && Ch5Audio.playClick();
      if (node.next) this._showNode(node.next);
      else this.close();
    },

    skipToChoiceOrEnd() {
      if (!this.active) return;
      let guard = 24;
      while (this.active && guard-- > 0) {
        const node = this.tree && this.tree.nodes[this.nodeId];
        if (!node || (Array.isArray(node.choices) && node.choices.length > 0)) break;
        if (this.typing) {
          this.typing = false;
          this._setTalkingSpeaker(null);
        }
        if (node.next) this._showNode(node.next);
        else { this.close(); break; }
      }
    },

    close(silent = false) {
      const wasActive = this.active;
      this.active = false;
      this.typing = false;
      this._setTalkingSpeaker(null);
      const ov = document.getElementById("ch5-dialogue-overlay");
      if (ov) { ov.classList.add("hidden"); ov.classList.remove("flex"); }
      if (this.host) {
        this.host.clearCinematicShot();
        if (!silent && this.host.active) {
          this.host.state = "PLAYING";
          this.host.app.game.state = "PLAYING";
        }
      }
      const cb = this.onComplete;
      this.onComplete = null;
      if (wasActive && !silent && cb) cb();
    }
  };

  /* -------------------------------------------------------------------------
     3. STORY-CONNECTED INTERACTIVE CHALLENGES FOR CHAPTER 5
        (Bag Check, Priority Planner, Item Hand-Off, Aula Blueprint & Swap,
         Body-Language Observation)
  ------------------------------------------------------------------------- */
  const Ch5OverlayUI = {
    host: null,
    active: false,

    _openModalShell(html) {
      this.close(true);
      this.active = true;
      if (this.host) {
        this.host.state = "CHALLENGE";
        this.host.app.game.state = "CUTSCENE";
      }
      const wrap = document.getElementById("ch5-challenge-overlay");
      if (!wrap) return null;
      wrap.innerHTML = html;
      wrap.classList.remove("hidden");
      wrap.classList.add("flex");
      return wrap;
    },

    close(keepState = false) {
      this.active = false;
      const wrap = document.getElementById("ch5-challenge-overlay");
      if (wrap) {
        wrap.classList.add("hidden");
        wrap.classList.remove("flex");
        wrap.innerHTML = "";
      }
      if (!keepState && this.host && this.host.active && !Ch5Dialogue.active) {
        this.host.state = "PLAYING";
        this.host.app.game.state = "PLAYING";
      }
    },

    /* SCENE 1: Quick Bag Inspection — Find Which Item Is Missing */
    openBagInspection(onSuccess) {
      let mistakes = 0;
      const options = [
        { key: "pen", icon: "🖊️", label: "Kotak Alat Tulis (Ada di tas)", missing: false },
        { key: "notes", icon: "📓", label: "Buku Catatan Acara (Belum masuk tas!)", missing: true },
        { key: "idcard", icon: "🪪", label: "Kartu Pelajar (Ada di saku)", missing: false },
        { key: "key", icon: "🔑", label: "Kunci Unit 302 (Ada di gantungan)", missing: false }
      ];
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-md max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-200/35">
          <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-300">Scene 1 • Cek Barang Bawaan</div>
          <h3 class="font-serif-title text-xl mt-0.5">Isi Tas Sekolah Rizka</h3>
          <p class="text-xs text-slate-300 mt-1">Ketuk barang penting hari ini yang <strong>ternyata belum ada</strong> di dalam tas.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
            ${options.map((o, idx) => `
              <button data-bag-idx="${idx}" class="game-btn text-left p-3 rounded-2xl flex items-center gap-2.5 text-xs">
                <span class="text-2xl shrink-0">${o.icon}</span>
                <span class="leading-snug">${o.label}</span>
              </button>
            `).join("")}
          </div>
          <div id="ch5-bag-fb" class="text-xs mt-3 min-h-[1.3em] text-amber-200"></div>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelectorAll("[data-bag-idx]").forEach((btn) => {
        btn.onclick = () => {
          const opt = options[Number(btn.dataset.bagIdx)];
          const fb = wrap.querySelector("#ch5-bag-fb");
          if (opt.missing) {
            window.Ch5Audio && Ch5Audio.playPickup();
            window.Feedback && Feedback.right();
            const bonus = this.host && this.host.flags.s1_phone_checked ? 10 : 0;
            const pts = Math.min(100, Math.max(45, 95 - mistakes * 20 + bonus));
            window.Score && Score.record("chapter_05", "s1_morning", "Scene 1 · Cek barang pagi", pts, 100);
            this.close();
            if (onSuccess) onSuccess(pts);
          } else {
            mistakes++;
            this.host.totalMistakes++;
            if (this.host.app && this.host.app.audio) this.host.app.audio.playMistake(false);
            if (fb) { fb.style.color = "#fca5a5"; fb.textContent = "Barang itu sudah tersimpan rapi di dalam tas. Cek yang belum masuk!"; }
          }
        };
      });
    },

    /* SCENE 2: Priority Order Decision */
    openPriorityPlanner(onDone) {
      const plans = [
        {
          key: "optimal",
          icon: "🏛️ → 🎀 → 📋",
          title: "Poster Aula dulu, lalu Dekorasi ke Hana, terakhir Catatan ke Sena",
          sub: "Panitia tahu lokasi lebih awal & Hana langsung bisa mulai merangkai.",
          pts: 100,
          eff: { trust: 2, comfort: 1, resonance: "Pembagian urutan yang sangat efisien!" }
        },
        {
          key: "hana_first",
          icon: "🎀 → 📋 → 🏛️",
          title: "Dekorasi ke Hana dulu, Catatan ke Sena, baru Poster Aula",
          sub: "Teman-teman langsung memegang bahan kerja lebih dulu.",
          pts: 85,
          eff: { openness: 1, comfort: 1 }
        },
        {
          key: "random",
          icon: "📋 → 🏛️ → 🎀",
          title: "Mana saja yang paling dekat sambil lewat",
          sub: "Santai tanpa urutan khusus.",
          pts: 70,
          eff: {}
        }
      ];
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-lg max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-200/35">
          <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-300">Scene 2 • Keputusan Prioritas</div>
          <h3 class="font-serif-title text-xl mt-0.5">Urutan Pengiriman Perlengkapan</h3>
          <p class="text-xs text-slate-300 mt-1">Ketiga perlengkapan sudah terkumpul. Pilih prioritas pengiriman paling efektif:</p>
          <div class="space-y-2 mt-3.5">
            ${plans.map((p, idx) => `
              <button data-plan-idx="${idx}" class="game-btn w-full text-left p-3 rounded-2xl flex flex-col gap-0.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-amber-100">${p.title}</span>
                  <span class="text-xs font-mono shrink-0">${p.icon}</span>
                </div>
                <span class="text-[11px] text-slate-300">${p.sub}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelectorAll("[data-plan-idx]").forEach((btn) => {
        btn.onclick = () => {
          const p = plans[Number(btn.dataset.planIdx)];
          window.Ch5Audio && Ch5Audio.playWarmChime();
          window.Feedback && Feedback.right();
          window.Score && Score.record("chapter_05", "s2_priority", "Scene 2 · Prioritas tugas", p.pts, 100);
          if (p.eff && this.host) this.host.applyChoiceEffects(p.eff);
          this.close();
          if (onDone) onDone(p);
        };
      });
    },

    /* SCENE 2: Item Hand-Off Selector at Delivery Target (with Wrong-Item Feedback & Retry!) */
    openDeliverySelector(targetKey, targetTitle, availableItemIds, onDelivered) {
      const sup = window.CH5_STORY_DATA.scene2Supplies;
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-md max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-200/35">
          <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-sky-300">Antar Perlengkapan • ${targetTitle}</div>
          <h3 class="font-serif-title text-xl mt-0.5">Pilih Barang untuk Diserahkan</h3>
          <p class="text-xs text-slate-300 mt-1">Cocokkan perlengkapan dengan kebutuhan tujuan ini:</p>
          <div class="space-y-2 mt-3.5">
            ${availableItemIds.map((id) => {
              const it = sup[id];
              return `<button data-deliv-id="${id}" class="game-btn w-full text-left p-3 rounded-2xl flex items-center gap-3">
                <span class="text-2xl">${it.icon}</span>
                <span class="text-xs sm:text-sm font-medium text-[#fff8ee]">${it.label}</span>
              </button>`;
            }).join("")}
          </div>
          <div id="ch5-deliv-fb" class="text-xs mt-3 min-h-[1.5em] text-amber-200"></div>
          <button id="ch5-deliv-cancel" class="game-btn w-full mt-2 py-2 rounded-xl text-xs text-slate-300">Kembali</button>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelector("#ch5-deliv-cancel").onclick = () => this.close();
      wrap.querySelectorAll("[data-deliv-id]").forEach((btn) => {
        btn.onclick = () => {
          const itemId = btn.dataset.delivId;
          const it = sup[itemId];
          const fb = wrap.querySelector("#ch5-deliv-fb");
          if (it.target === targetKey) {
            window.Ch5Audio && Ch5Audio.playDecorPlace(true);
            window.Feedback && Feedback.right();
            this.close();
            if (onDelivered) onDelivered(itemId);
          } else {
            this.host.s2WrongCount = (this.host.s2WrongCount || 0) + 1;
            this.host.totalMistakes++;
            if (this.host.app && this.host.app.audio) this.host.app.audio.playMistake(false);
            if (fb) {
              fb.style.color = "#fca5a5";
              fb.textContent = "Kurang tepat: " + it.wrongHint;
            }
          }
        };
      });
    },

    /* SCENE 3: Visual Blueprint Inspection Card */
    openBlueprintCard(onClosed) {
      const bp = window.CH5_STORY_DATA.aulaBlueprint;
      window.Ch5Audio && Ch5Audio.playPaperRustle();
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-lg max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-300/45">
          <div class="flex items-center justify-between gap-2">
            <div>
              <div class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-300">Papan Rancangan • Aula Sekolah</div>
              <h3 class="font-serif-title text-xl mt-0.5">Denah Dekorasi Autumn Fest</h3>
            </div>
            <span class="text-2xl">📐</span>
          </div>
          <p class="text-xs text-slate-300 mt-1">Ingat posisi 4 elemen dekorasi berikut, lalu hampiri titik yang salah di aula:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
            ${bp.map((z) => `
              <div class="p-3 rounded-2xl bg-[#131e33]/90 border border-amber-200/20 flex items-start gap-2.5">
                <span class="text-2xl shrink-0">${z.icon}</span>
                <div class="text-xs">
                  <div class="font-semibold text-amber-200">${z.zoneLabel}</div>
                  <div class="text-emerald-300 font-medium mt-0.5">✓ ${z.correctLabel}</div>
                  <div class="text-[10px] text-rose-300/85 mt-0.5">Saat ini: ${z.wrongLabel}</div>
                </div>
              </div>
            `).join("")}
          </div>
          <button id="ch5-bp-ok" class="game-btn game-btn-primary w-full mt-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#fff8ee]">Mengerti, Mulai Tata Dekorasi</button>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelector("#ch5-bp-ok").onclick = () => {
        window.Ch5Audio && Ch5Audio.playClick();
        this.close();
        if (onClosed) onClosed();
      };
    },

    /* SCENE 3: Decoration Swap Selector at a Misplaced Aula Zone */
    openZoneSwapModal(zoneIdx, onFixed) {
      const z = window.CH5_STORY_DATA.aulaBlueprint[zoneIdx];
      const opts = window.CH5_STORY_DATA.aulaDecorOptions;
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-md max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-200/35">
          <div class="flex items-center justify-between gap-2">
            <div class="text-[10px] font-mono uppercase tracking-[0.20em] text-amber-300">${z.zoneLabel}</div>
            <button id="ch5-zone-hint" class="px-2.5 py-1 rounded-lg bg-sky-400/15 border border-sky-300/30 text-[11px] text-sky-200 cursor-pointer">💡 Hint</button>
          </div>
          <h3 class="font-serif-title text-lg mt-1">Ganti Dekorasi yang Tertukar</h3>
          <div class="text-xs text-rose-200/90 bg-rose-500/10 border border-rose-300/25 rounded-xl px-3 py-2 mt-2">
            Terpasang sekarang: <strong>${z.wrongLabel}</strong>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3">
            ${opts.map((o) => `
              <button data-decor-key="${o.key}" class="game-btn p-3 rounded-2xl flex flex-col items-center gap-1 text-center">
                <span class="text-2xl">${o.icon}</span>
                <span class="text-xs font-medium text-[#fff8ee] leading-tight">${o.label}</span>
              </button>
            `).join("")}
          </div>
          <div id="ch5-zone-fb" class="text-xs mt-3 min-h-[1.4em] text-amber-200"></div>
          <button id="ch5-zone-close" class="game-btn w-full mt-2 py-2 rounded-xl text-xs text-slate-300">Batal</button>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelector("#ch5-zone-close").onclick = () => this.close();
      wrap.querySelector("#ch5-zone-hint").onclick = () => {
        this.host.s3HintsUsed = (this.host.s3HintsUsed || 0) + 1;
        const fb = wrap.querySelector("#ch5-zone-fb");
        if (fb) { fb.style.color = "#bae6fd"; fb.textContent = "Petunjuk Rancangan: " + z.hint; }
      };
      wrap.querySelectorAll("[data-decor-key]").forEach((btn) => {
        btn.onclick = () => {
          const picked = btn.dataset.decorKey;
          const fb = wrap.querySelector("#ch5-zone-fb");
          if (picked === z.correctKey) {
            window.Ch5Audio && Ch5Audio.playDecorPlace(true);
            window.Feedback && Feedback.right();
            this.close();
            if (onFixed) onFixed();
          } else {
            this.host.s3WrongCount = (this.host.s3WrongCount || 0) + 1;
            this.host.totalMistakes++;
            this.host.s3TimeLeft = Math.max(5, (this.host.s3TimeLeft || 60) - 5);
            if (this.host.app && this.host.app.audio) this.host.app.audio.playMistake(false);
            if (fb) {
              fb.style.color = "#fca5a5";
              fb.textContent = "Bukan untuk titik ini (−5 detik). Cek petunjuk bila ragu!";
            }
          }
        };
      });
    },

    /* SCENE 4: Body-Language & Expression Observation Challenge */
    openKaelObservation(onDone) {
      let pickedOk = 0;
      let mistakes = 0;
      const cues = [
        { icon: "🪟", label: "Menatap ke luar jendela (sedang memberi ruang, bukan marah)", ok: true },
        { icon: "🧥", label: "Bahu sedikit turun (merasa bersalah sudah mengambil alih)", ok: true },
        { icon: "🤚", label: "Jari mengetuk kusen pelan (ragu memulai kalimat duluan)", ok: true },
        { icon: "😠", label: "Tangan mengepal kesal ingin berdebat", ok: false },
        { icon: "🚪", label: "Bersiap meninggalkan Rizka sendirian", ok: false }
      ];
      const wrap = this._openModalShell(`
        <div class="glass-panel w-full max-w-md max-h-[92vh] custom-scroll my-auto rounded-3xl p-5 text-[#fff8ee] border border-amber-200/35">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase tracking-[0.20em] text-amber-300">Scene 4 • Observasi Sikap Kael</span>
            <span id="ch5-obs-prog" class="text-xs font-mono text-emerald-300">0/3</span>
          </div>
          <h3 class="font-serif-title text-lg mt-0.5">Perhatikan Bahasa Tubuh Kael</h3>
          <p class="text-xs text-slate-300 mt-1">Pilih <strong>3 tanda bahasa tubuh</strong> yang benar-benar terlihat dari Kael di dekat jendela:</p>
          <div class="space-y-2 mt-3">
            ${cues.map((c, idx) => `
              <button data-obs-idx="${idx}" class="game-btn w-full text-left p-2.5 rounded-2xl flex items-center gap-2.5 text-xs">
                <span class="text-xl shrink-0">${c.icon}</span>
                <span>${c.label}</span>
              </button>
            `).join("")}
          </div>
          <div id="ch5-obs-fb" class="text-xs mt-2.5 min-h-[1.3em] text-amber-200"></div>
        </div>
      `);
      if (!wrap) return;
      wrap.querySelectorAll("[data-obs-idx]").forEach((btn) => {
        btn.onclick = () => {
          if (btn.dataset.used) return;
          btn.dataset.used = "1";
          const c = cues[Number(btn.dataset.obsIdx)];
          const fb = wrap.querySelector("#ch5-obs-fb");
          if (c.ok) {
            pickedOk++;
            btn.style.borderColor = "#6ee7b7";
            btn.style.background = "rgba(52,211,153,0.22)";
            window.Ch5Audio && Ch5Audio.playPickup();
            window.Feedback && Feedback.right();
            wrap.querySelector("#ch5-obs-prog").textContent = `${pickedOk}/3`;
            if (pickedOk >= 3) {
              const pts = Math.max(45, 100 - mistakes * 20);
              window.Score && Score.record("chapter_05", "s4_observe", "Scene 4 · Observasi bahasa tubuh", pts, 100);
              setTimeout(() => {
                this.close();
                if (onDone) onDone(pts);
              }, 320);
            }
          } else {
            mistakes++;
            this.host.totalMistakes++;
            btn.style.opacity = "0.45";
            btn.style.borderColor = "#f87171";
            if (this.host.app && this.host.app.audio) this.host.app.audio.playMistake(false);
            if (fb) { fb.style.color = "#fca5a5"; fb.textContent = "Bukan itu—wajah Kael sama sekali tidak menunjukkan kemarahan."; }
          }
        };
      });
    }
  };

  /* -------------------------------------------------------------------------
     4. MAIN CHAPTER 5 CONTROLLER CLASS
  ------------------------------------------------------------------------- */
  class Chapter5Controller {
    constructor(app) {
      this.app = app;
      this.active = false;
      this.state = "IDLE";
      this.activeSceneId = "scene_1";
      this.quality = "high";

      this.group = null;
      this.envSlot = null;
      this.spotGroup = null;
      this.activeStage = null;

      // Cast
      this.rizka = null;
      this.kael = null;
      this.nadine = null;
      this.buMira = null;
      this.hana = null;
      this.sena = null;

      // Gameplay & Relationship State
      this.rel = { affection: 24, trust: 18, comfort: 16, openness: 14 };
      this.flags = {};
      this.stepDone = [];
      this.spots = [];
      this.nearestSpot = null;
      this.totalMistakes = 0;
      this.idleHintTimer = 0;

      // Scene-specific progress state
      this.s2Collected = { poster: false, decor: false, notes: false };
      this.s2PrioritySet = false;
      this.s2Delivered = { poster: false, decor: false, notes: false };
      this.s2WrongCount = 0;

      this.s3BlueprintRead = false;
      this.s3ZoneFixed = [false, false, false, false];
      this.s3TimerActive = false;
      this.s3TimeLeft = 120;
      this.s3WrongCount = 0;
      this.s3HintsUsed = 0;

      // Third-person & cinematic camera
      this.camYaw = 0;
      this.camPitch = 0.22;
      this.camDist = 3.45;
      this._yawTarget = 0;
      this._pitchTarget = 0.22;
      this._distTarget = 3.45;
      this.camTarget = new THREE.Vector3(0, 1.35, 0);
      this.cinematicShot = null;
      this.endingCutscene = null;

      Ch5Dialogue.host = this;
      Ch5OverlayUI.host = this;
      if (window.Ch5Audio) Ch5Audio.bindHostAudio(app.audio);

      this._injectDOM();
      this._bindKeyboard();
    }

    _injectDOM() {
      if (document.getElementById("ch5-ui-root")) return;
      const css = document.createElement("style");
      css.id = "ch5-ui-styles";
      css.textContent = `
        body.ch5-active #game-hud > div > div.glass-soft:first-child { display: none !important; }
        body.ch5-active #game-hud > div > div:last-child { margin-left: auto !important; }
        @media (hover: none) and (pointer: coarse), (max-height: 520px) {
          body.ch5-active #pc-hint-bar { display: none !important; }
        }
      `;
      document.head.appendChild(css);

      const root = document.createElement("div");
      root.id = "ch5-ui-root";
      root.innerHTML = `
        <!-- Compact Active Mission Card (Top-Left, non-overlapping on both Portrait & Landscape!) -->
        <div id="ch5-quest-card" class="hidden fixed left-3 sm:left-4 top-14 sm:top-4 z-[25] w-[164px] sm:w-[218px] glass-panel rounded-xl px-3 py-2.5 text-[#fff8ee] pointer-events-auto transition-all duration-300 border border-amber-200/30">
          <div class="flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1 text-[10px] tracking-[0.16em] uppercase text-amber-200 font-semibold truncate">
              <span class="text-amber-300">◆</span><span id="hud-ch5-chapter">CH. 5 • SC 1/5</span>
            </div>
            <span id="hud-ch5-prog-pill" class="text-[10px] font-mono text-amber-100/90">0/4</span>
          </div>
          <div id="hud-ch5-title" class="font-serif-title text-xs sm:text-[13px] font-semibold text-[#fff8ee] mt-0.5 leading-snug"></div>
          <div class="h-1 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div id="hud-ch5-prog-bar" class="h-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-300" style="width:0%"></div>
          </div>
          <div id="hud-ch5-active-step" class="mt-1.5 text-[10px] sm:text-[11px] text-amber-100 leading-snug"></div>
          <div id="hud-ch5-extra" class="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] empty:hidden"></div>
        </div>

        <!-- Async GLB Asset Loading Indicator -->
        <div id="ch5-asset-loader" class="hidden fixed top-16 left-1/2 -translate-x-1/2 z-[60] glass-panel px-4 py-2 rounded-full border border-amber-200/40 text-xs text-amber-100 flex items-center gap-2.5 pointer-events-none">
          <span class="animate-spin inline-block">✦</span>
          <span id="ch5-loader-text">Memuat aset 3D Chapter 5...</span>
          <span id="ch5-loader-pct" class="font-mono text-emerald-300">0%</span>
        </div>

        <!-- Subtle Resonance Toast -->
        <div id="ch5-resonance-slot" class="fixed top-36 sm:top-16 left-1/2 -translate-x-1/2 z-[42] pointer-events-none"></div>

        <!-- Bottom Compass / Objective Guide Pill -->
        <div id="ch5-guide-pill" class="hidden fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[24] glass-soft px-3.5 py-1.5 rounded-full border border-amber-200/35 text-[11px] text-amber-100 pointer-events-none items-center gap-1.5 shadow-lg">
          <span id="ch5-guide-arrow" class="text-amber-300 font-bold inline-block">▲</span>
          <span id="ch5-guide-text">Tujuan</span>
        </div>

        <!-- Scene Switcher Drawer (#btn-hud-scenes) -->
        <aside id="ch5-drawer-scenes" class="fixed top-16 right-3 sm:right-4 z-[48] hidden flex-col w-72 max-h-[78vh] glass-panel rounded-2xl p-4 text-[#fff8ee] border border-amber-200/30 pointer-events-auto overflow-y-auto custom-scroll">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <span class="text-xs font-semibold text-amber-200 uppercase tracking-wider">Chapter 5 • Scenes</span>
            <button onclick="Ch5Game.closeDrawers()" class="text-xs text-slate-300 hover:text-white px-2 py-0.5 cursor-pointer">✕</button>
          </div>
          <div id="ch5-scene-drawer-list" class="space-y-1.5 mt-2.5 text-xs"></div>
        </aside>

        <!-- Expression & Camera Preset Drawer (#btn-hud-studio) -->
        <aside id="ch5-drawer-studio" class="fixed top-16 right-3 sm:right-4 z-[48] hidden flex-col w-72 max-h-[78vh] glass-panel rounded-2xl p-4 text-[#fff8ee] border border-amber-200/30 pointer-events-auto overflow-y-auto custom-scroll">
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <span class="text-xs font-semibold text-amber-200 uppercase tracking-wider">Kamera &amp; Ekspresi Ch. 5</span>
            <button onclick="Ch5Game.closeDrawers()" class="text-xs text-slate-300 hover:text-white px-2 py-0.5 cursor-pointer">✕</button>
          </div>
          <div class="text-[11px] text-slate-300 mt-2 mb-1">Preset Kamera Sinematik</div>
          <div class="grid grid-cols-2 gap-1.5 text-[11px]">
            <button onclick="Ch5Game.clearCinematicShot()" class="game-btn py-1.5 rounded-lg">Follow 3rd</button>
            <button onclick="Ch5Game.applyCinematicShot('two_shot')" class="game-btn py-1.5 rounded-lg">Two-Shot</button>
            <button onclick="Ch5Game.applyCinematicShot('close_rizka')" class="game-btn py-1.5 rounded-lg">Close Rizka</button>
            <button onclick="Ch5Game.applyCinematicShot('wide')" class="game-btn py-1.5 rounded-lg">Wide Env</button>
          </div>
          <div class="text-[11px] text-slate-300 mt-3 mb-1">Ekspresi Rizka</div>
          <div class="grid grid-cols-2 gap-1.5 text-[11px]">
            ${["neutral", "small_smile", "happy", "awkward", "subtle_blush", "teasing", "annoyed", "laugh"].map((e) =>
              `<button onclick="Ch5Game.rizka && Ch5Game.rizka.setExpression('${e}')" class="game-btn py-1 rounded-lg">${e}</button>`
            ).join("")}
          </div>
        </aside>

        <!-- Interactive Challenge Modal Container -->
        <div id="ch5-challenge-overlay" class="fixed inset-0 z-[56] hidden items-center justify-center bg-[#090e1a]/75 backdrop-blur-sm p-4 overflow-y-auto pointer-events-auto"></div>

        <!-- Concise Dialogue Overlay -->
        <section id="ch5-dialogue-overlay" class="fixed inset-0 z-[44] hidden flex-col justify-end p-3 sm:p-6 md:p-8 pointer-events-auto">
          <button onclick="Ch5Game.skipDialogue()" class="fixed top-20 right-4 z-[46] px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#fff8ee] bg-[#0f172a]/75 border border-amber-200/30 hover:border-amber-200 cursor-pointer">
            Lewati ⏭
          </button>
          <div onclick="Ch5Game.advanceDialogue()" class="flex-1 w-full"></div>
          <div id="ch5-choices-container" class="w-full max-w-2xl mx-auto mb-3 hidden flex-col gap-2"></div>
          <div id="ch5-dialogue-card" onclick="Ch5Game.advanceDialogue()" class="glass-panel w-full max-w-3xl mx-auto rounded-2xl p-4 sm:p-5 border border-amber-200/35 cursor-pointer">
            <div class="flex items-start gap-3.5 sm:gap-4">
              <div id="ch5-dialogue-portrait" class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1a2438] border border-amber-200/40 overflow-hidden shadow-inner"></div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span id="ch5-dialogue-speaker" class="inline-block px-3 py-0.5 rounded-lg bg-amber-400/20 border border-amber-200/35 text-amber-100 font-semibold text-xs sm:text-sm">Rizka</span>
                  <span id="ch5-dialogue-submood" class="text-[11px] text-sky-200/85 italic truncate max-w-full"></span>
                </div>
                <p id="ch5-dialogue-text" class="text-sm sm:text-base text-[#fff8ee] leading-relaxed min-h-[2.4em]"></p>
                <div class="flex items-center justify-between mt-2 text-[11px] text-amber-200/80">
                  <span id="ch5-dialogue-hint">Ketuk / Spasi untuk lanjut</span>
                  <span class="text-amber-300 font-bold">▼</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Chapter 5 Ending Completion Screen -->
        <div id="modal-ch5-ending" class="fixed inset-0 z-[68] hidden items-center justify-center bg-[#090e1a]/88 backdrop-blur-md p-4 overflow-y-auto pointer-events-auto">
          <div class="glass-panel w-full max-w-lg max-h-[92vh] custom-scroll my-auto rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-3.5 border border-amber-300/40">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/25 to-sky-400/20 border border-amber-200/45 flex items-center justify-center">
              <span class="text-2xl">🌙</span>
            </div>
            <div class="text-[11px] uppercase tracking-[0.28em] text-amber-200 font-semibold">Cicaww33 • Chapter 5 Selesai</div>
            <h2 id="ending-ch5-heading" class="font-serif-title text-2xl sm:text-3xl text-[#fff8ee]">The Things We Don't Say</h2>
            <p id="ending-ch5-summary" class="text-xs sm:text-sm text-slate-200/90 leading-relaxed"></p>
            <div id="ending-ch5-grade-badge" class="text-xs font-mono text-amber-100 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-200/30"></div>
            <div class="w-full p-3.5 rounded-2xl bg-[#141e30]/90 border border-sky-200/20 text-xs text-sky-100">
              <div class="text-[10px] uppercase tracking-widest text-amber-200/90 mb-1">Menuju Chapter 6</div>
              <div class="font-serif-title italic text-sm sm:text-base text-[#fff8ee]">Akhir pekan di apartemen semakin dekat—dan kali ini, Rizka tidak lagi menghadapinya sendirian.</div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
              <button onclick="Ch5Game.showScoreAgain()" class="game-btn flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm text-emerald-200">🏆 Kartu Nilai</button>
              <button onclick="Ch5Game.replayChapter5()" class="game-btn flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm text-[#fff8ee]">↻ Ulangi Ch. 5</button>
              <button onclick="Ch5Game.openChaptersFromEnding()" class="game-btn flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm text-amber-100">☰ Chapter</button>
              <button onclick="Ch5Game.returnToTitle()" class="game-btn game-btn-primary flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold text-[#fff8ee]">🏠 Menu Utama</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(root);

      const sList = document.getElementById("ch5-scene-drawer-list");
      if (sList && window.CH5_STORY_DATA) {
        sList.innerHTML = Object.values(window.CH5_STORY_DATA.scenes).map((sc) => `
          <button onclick="Ch5Game.closeDrawers(); Ch5Game.loadScene('${sc.id}')" class="game-btn w-full text-left p-2.5 rounded-xl flex flex-col gap-0.5">
            <span class="font-semibold text-amber-200">${sc.shortTitle}</span>
            <span class="text-[11px] text-slate-300">${sc.subtitle}</span>
          </button>
        `).join("");
      }
    }

    _bindKeyboard() {
      window.addEventListener("keydown", (e) => {
        if (!this.active) return;
        if (Ch5Dialogue.active) {
          if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            e.stopImmediatePropagation();
            Ch5Dialogue.advance();
          } else if (/^Digit[1-3]$/.test(e.code)) {
            const idx = Number(e.code.slice(5)) - 1;
            const btn = document.querySelector(`[data-ch5-choice="${idx}"]`);
            if (btn) { e.preventDefault(); e.stopImmediatePropagation(); btn.click(); }
          }
          return;
        }
        if (Ch5OverlayUI.active) return;
        if (e.code === "Space" && this.state === "PLAYING" && this.nearestSpot && this.app.game.state === "PLAYING") {
          e.preventDefault();
          this.triggerInteraction();
        }
      }, true);
    }

    _ensureCast() {
      if (this.group) return;
      this.group = new THREE.Group();
      this.group.name = "Chapter5Root";
      this.envSlot = new THREE.Group();
      this.envSlot.name = "Chapter5EnvSlot";
      this.spotGroup = new THREE.Group();
      this.spotGroup.name = "Chapter5SpotMarkers";

      this.rizka = Ch5Characters.buildRizka();
      this.kael = Ch5Characters.buildKael();
      this.nadine = Ch5Characters.buildNadine();
      this.buMira = Ch5Characters.buildBuMira();
      this.hana = Ch5Characters.buildHana();
      this.sena = Ch5Characters.buildSena();

      this.group.add(
        this.envSlot,
        this.spotGroup,
        this.rizka.root,
        this.kael.root,
        this.nadine.root,
        this.buMira.root,
        this.hana.root,
        this.sena.root
      );
      this.app.scene.add(this.group);
    }

    _readCarryoverFromCh4(carryAffection) {
      let ch4 = this.app.game.savedCh4State || null;
      if (!ch4) {
        try { ch4 = JSON.parse(localStorage.getItem("cicaww33_ch4_save_v1") || "null"); } catch (_) {}
      }
      const baseAff = Math.max(20, carryAffection || (ch4 && ch4.rel && ch4.rel.affection) || 22);
      const baseTrust = Math.max(15, (ch4 && ch4.rel && ch4.rel.trust) || 16);
      const baseOpen = Math.max(12, (ch4 && ch4.rel && ch4.rel.openness) || 13);
      return {
        affection: baseAff,
        trust: baseTrust,
        comfort: 16,
        openness: baseOpen
      };
    }

    async start({ carryAffection = 22, resumeState = null } = {}) {
      this._ensureCast();
      this.active = true;
      this.endingCutscene = null;
      this.quality = this.app.settings.data.graphics || "high";
      Chapter5AssetManager.setQuality(this.quality);
      window.Ch4Textures && Ch4Textures.setQuality(this.quality, this.app.renderer);

      // Hide Ch.1–4 world sets cleanly
      const w = this.app.world;
      w.courtyardGroup.visible = false;
      w.apartmentGroup.visible = false;
      if (w.rainSystem) w.rainSystem.visible = false;
      if (w.skyDome) w.skyDome.visible = false;
      w.rizkaRig.root.visible = false;
      w.kaelRig.root.visible = false;
      if (this.app.world3) this.app.world3.group.visible = false;
      this.app.interactions.update(w.rizkaRig.root.position, false, "__ch5__");

      const sh = w.dirLight.shadow;
      sh.camera.left = -14; sh.camera.right = 14; sh.camera.top = 14; sh.camera.bottom = -14;
      sh.camera.near = 0.5; sh.camera.far = 48;
      sh.camera.updateProjectionMatrix();

      this.group.visible = true;
      document.body.classList.add("ch5-active");
      document.getElementById("ch5-quest-card")?.classList.remove("hidden");
      if (window.Ch5Audio) Ch5Audio.setActive(true);

      if (resumeState && resumeState.sceneId && !resumeState.completed) {
        this.rel = resumeState.rel ? { ...resumeState.rel } : this._readCarryoverFromCh4(carryAffection);
        this.flags = resumeState.flags ? { ...resumeState.flags } : {};
        this.totalMistakes = resumeState.totalMistakes || 0;
        this.s2Collected = resumeState.s2Collected ? { ...resumeState.s2Collected } : { poster: false, decor: false, notes: false };
        this.s2PrioritySet = !!resumeState.s2PrioritySet;
        this.s2Delivered = resumeState.s2Delivered ? { ...resumeState.s2Delivered } : { poster: false, decor: false, notes: false };
        this.s2WrongCount = resumeState.s2WrongCount || 0;
        this.s3BlueprintRead = !!resumeState.s3BlueprintRead;
        this.s3ZoneFixed = Array.isArray(resumeState.s3ZoneFixed) ? [...resumeState.s3ZoneFixed] : [false, false, false, false];
        this.s3TimeLeft = typeof resumeState.s3TimeLeft === "number" ? resumeState.s3TimeLeft : 120;
        this.s3WrongCount = resumeState.s3WrongCount || 0;
        this.s3HintsUsed = resumeState.s3HintsUsed || 0;

        await this.loadScene(resumeState.sceneId, true);
        if (Array.isArray(resumeState.stepDone) && resumeState.stepDone.length === this.stepDone.length) {
          this.stepDone = [...resumeState.stepDone];
        }
        this._restoreSceneVisualState();
        if (resumeState.playerPos && typeof resumeState.playerPos.x === "number") {
          this.rizka.root.position.set(resumeState.playerPos.x, 0, resumeState.playerPos.z);
          this.camTarget.set(resumeState.playerPos.x, 1.35, resumeState.playerPos.z);
        }
        this._refreshObjectiveHUD();
        this.state = "PLAYING";
        this.app.game.state = "PLAYING";
      } else {
        this.rel = this._readCarryoverFromCh4(carryAffection);
        this.flags = {};
        this.totalMistakes = 0;
        if (window.Score) { Score.run.chapter_05 = []; Score.finished.chapter_05 = false; }
        await this.loadScene("scene_1", false);
      }
    }

    stop() {
      const wasActive = this.active;
      this.active = false;
      this.state = "IDLE";
      this.s3TimerActive = false;
      this.endingCutscene = null;
      document.body.classList.remove("ch5-active");

      Ch5Dialogue.close(true);
      Ch5OverlayUI.close(true);
      this.closeDrawers();
      this._toggleModal("modal-ch5-ending", false);

      document.getElementById("ch5-quest-card")?.classList.add("hidden");
      document.getElementById("ch5-asset-loader")?.classList.add("hidden");
      const gPill = document.getElementById("ch5-guide-pill");
      if (gPill) { gPill.classList.add("hidden"); gPill.classList.remove("flex"); }
      this._updateInteractHUD(null);

      if (this.envSlot) Chapter5AssetManager.disposeGroup(this.envSlot);
      if (this.spotGroup) Chapter5AssetManager.disposeGroup(this.spotGroup);
      this.activeStage = null;
      if (this.group) this.group.visible = false;
      if (window.Ch5Audio) Ch5Audio.setActive(false);

      if (wasActive) {
        const w = this.app.world;
        if (w.skyDome) w.skyDome.visible = true;
        w.rizkaRig.root.visible = true;
        this.app.renderer.toneMappingExposure = 0.94;
      }
    }

    onGraphicsQualityChanged(q) {
      this.quality = q || "high";
      Chapter5AssetManager.setQuality(this.quality);
    }

    _showLoader(show, pct = 0, label = "") {
      const el = document.getElementById("ch5-asset-loader");
      if (!el) return;
      el.classList.toggle("hidden", !show);
      if (show) {
        const t = document.getElementById("ch5-loader-text");
        const p = document.getElementById("ch5-loader-pct");
        if (t && label) t.textContent = label;
        if (p) p.textContent = `${pct}%`;
      }
    }

    _hideAllNPCs() {
      [this.kael, this.nadine, this.buMira, this.hana, this.sena].forEach((r) => {
        if (!r) return;
        r.root.visible = false;
        r.ch5WindowGaze = false;
        r.ch5LookTarget = null;
        r.clearHandProp();
      });
      if (this.rizka) {
        this.rizka.ch5LookTarget = null;
        this.rizka.clearHandProp();
      }
    }

    async loadScene(sceneId, isResume = false) {
      const sc = window.CH5_STORY_DATA.scenes[sceneId] || window.CH5_STORY_DATA.scenes.scene_1;
      this.activeSceneId = sc.id;
      this.state = "CUTSCENE";
      this.app.game.state = "CUTSCENE";
      this.s3TimerActive = false;
      this.idleHintTimer = 0;
      this.clearCinematicShot();
      Ch5Dialogue.close(true);
      Ch5OverlayUI.close(true);

      this._showLoader(true, 15, `Memuat ${sc.shortTitle}...`);
      if (this.envSlot) Chapter5AssetManager.disposeGroup(this.envSlot);
      if (this.spotGroup) Chapter5AssetManager.disposeGroup(this.spotGroup);
      this.spots = [];
      this.nearestSpot = null;
      this._hideAllNPCs();

      if (window.Ch5Audio) {
        Ch5Audio.setMood(sc.audioMood);
        Ch5Audio.playWarmChime();
      }

      this.activeStage = await Ch5WorldBuilder.buildScene(sc.id, this.app, this.quality);
      this.envSlot.add(this.activeStage.root);
      this._showLoader(false);

      this.stepDone = sc.steps.map(() => false);
      await this._setupSceneActorsAndSpots(sc.id, isResume);
      this._refreshObjectiveHUD();
      this.saveProgress(true);
    }

    async _setupSceneActorsAndSpots(sceneId, isResume) {
      const AM = window.Chapter5AssetManager;
      const P = this.activeStage.props;

      if (sceneId === "scene_1") {
        this.rizka.root.visible = true;
        this.rizka.root.position.set(-1.15, 0, -1.65);
        this.rizka.root.rotation.y = 0.25;
        this.rizka.setExpression("neutral");

        this.kael.root.visible = false;
        this.kael.root.position.set(-1.35, 0, 1.55);
        this.kael.root.rotation.y = 0.85;
        this.kael.setExpression("calm");

        this.camYaw = this._yawTarget = 0.25;
        this.camPitch = this._pitchTarget = 0.20;
        this.camDist = this._distTarget = 3.1;
        this.camTarget.set(-1.15, 1.35, -1.65);

        // Optional phone check spot (bonus points!)
        this._addSpot({
          id: "s1_phone", label: "Cek Pesan Pagi di Ponsel (Opsional)", x: -1.62, z: -2.92, y: 0.95, radius: 1.7, color: 0x7dd3fc, optional: true,
          isActive: () => !this.flags.s1_phone_checked && !this.stepDone[2],
          onUse: () => {
            this.flags.s1_phone_checked = true;
            if (P.phone) P.phone.visible = false;
            Ch5Audio.playPickup();
            Ch5Dialogue.open("s1_phone_msg");
          }
        });

        // Step 0: Check Rizka's bag
        this._addSpot({
          id: "s1_bag", label: "Periksa Tas Sekolah Rizka", x: -1.55, z: -2.55, y: 0.95, radius: 1.9,
          isActive: () => !this.stepDone[0],
          onUse: () => {
            Ch5OverlayUI.openBagInspection(() => {
              this._markStep(0);
              if (P.bag) P.bag.visible = false;
              Ch5Dialogue.open("s1_bag_checked");
            });
          }
        });

        // Step 1: Pick up forgotten book
        this._addSpot({
          id: "s1_book", label: "Ambil Buku Catatan yang Tertinggal", x: 1.58, z: -3.55, y: 0.82, radius: 2.0,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            this._markStep(1);
            Ch5Audio.playPaperRustle();
            this.rizka.playAction("pickup", 1.1);
            if (P.forgottenBook) P.forgottenBook.visible = false;
            this.kael.root.visible = true;
            this.kael.ch5LookTarget = this.rizka.root.position;
            Ch5Dialogue.open("s1_book_picked");
            AM.instantiateGLB("ch5_prop_notebook", { scale: 0.75 }).then((heldBook) => {
              if (this.active && this.activeSceneId === "scene_1" && !this.stepDone[2]) {
                this.rizka.attachHandProp(heldBook, { rot: [-0.4, 0.2, 0] });
              }
            }).catch(() => {});
          }
        });

        // Step 2: Meet Kael at Unit 301
        this._addSpot({
          id: "s1_kael", label: "Sapa Kael di Depan Unit 301", x: -0.45, z: 1.55, y: 1.75, radius: 2.2, color: 0x6ee7b7,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this.rizka.root.position.set(-0.42, 0, 1.52);
            this.rizka.root.rotation.y = -Math.PI / 2;
            this.kael.root.position.set(-1.32, 0, 1.55);
            this.kael.root.rotation.y = Math.PI / 2;
            this.rizka.ch5LookTarget = this.kael.root.position;
            this.kael.ch5LookTarget = this.rizka.root.position;
            Ch5Dialogue.open("s1_meet_kael", () => {
              this._markStep(2);
              this.rizka.clearHandProp();
              this.flags.s1_walk_together = true;
            });
          }
        });

        // Step 3: Walk together to lobby stairs
        this._addSpot({
          id: "s1_exit", label: "Berangkat Bersama ke Sekolah", x: 0, z: 4.15, y: 1.2, radius: 2.1, color: 0xf4c57a,
          isActive: () => this.stepDone[2] && !this.stepDone[3],
          onUse: () => {
            this._markStep(3);
            this.app._transitionWithFade("Scene 2 — A Day Out of Routine", "Halaman, Loker & Koridor Sekolah...", () => {
              return this.loadScene("scene_2", false);
            });
          }
        });

        if (!isResume) {
          Ch5Dialogue.open("s1_intro");
        } else {
          this.state = "PLAYING"; this.app.game.state = "PLAYING";
        }

      } else if (sceneId === "scene_2") {
        if (!isResume) {
          this.s2Collected = { poster: false, decor: false, notes: false };
          this.s2PrioritySet = false;
          this.s2Delivered = { poster: false, decor: false, notes: false };
          this.s2WrongCount = 0;
        }

        this.rizka.root.visible = true;
        this.rizka.root.position.set(-0.15, 0, -0.55);
        this.rizka.root.rotation.y = Math.PI;

        this.kael.root.visible = true;
        this.kael.root.position.set(0.95, 0, -0.65);
        this.kael.root.rotation.y = Math.PI + 0.22;
        this.kael.ch5LookTarget = this.rizka.root.position;

        this.buMira.root.visible = true;
        this.buMira.root.position.set(0.45, 0, -2.35);
        this.buMira.root.rotation.y = 0.05;

        this.nadine.root.visible = true;
        this.nadine.root.position.set(-0.95, 0, -2.25);
        this.nadine.root.rotation.y = 0.25;

        this.hana.root.visible = true;
        this.hana.root.position.set(-1.85, 0, 3.65);
        this.hana.root.rotation.y = Math.PI;

        this.sena.root.visible = true;
        this.sena.root.position.set(3.55, 0, -1.0);
        this.sena.root.rotation.y = -Math.PI / 2;

        this.camYaw = this._yawTarget = 0.06;
        this.camPitch = this._pitchTarget = 0.22;
        this.camDist = this._distTarget = 3.7;
        this.camTarget.set(-0.15, 1.35, -0.55);

        const checkCollectedAll = () => {
          if (this.s2Collected.poster && this.s2Collected.decor && this.s2Collected.notes && !this.stepDone[0]) {
            this._markStep(0);
            Ch5OverlayUI.openPriorityPlanner(() => {
              this.s2PrioritySet = true;
              this._markStep(1);
              this._refreshObjectiveHUD();
            });
          } else {
            this._refreshObjectiveHUD();
          }
        };

        // 3 Collectible Supply Spots
        this._addSpot({
          id: "s2_get_poster", label: "Ambil Poster Acara (Area Loker)", x: -3.55, z: 1.25, y: 0.85, radius: 2.0,
          isActive: () => !this.s2Collected.poster,
          onUse: () => {
            this.s2Collected.poster = true;
            if (P.itemPoster) P.itemPoster.visible = false;
            this.rizka.playAction("pickup", 0.9);
            Ch5Audio.playPaperRustle();
            Ch5Audio.playPickup();
            checkCollectedAll();
          }
        });
        this._addSpot({
          id: "s2_get_decor", label: "Ambil Kotak Dekorasi (Troli Koridor)", x: -3.15, z: -4.45, y: 0.95, radius: 2.0,
          isActive: () => !this.s2Collected.decor,
          onUse: () => {
            this.s2Collected.decor = true;
            if (P.itemDecorBox) P.itemDecorBox.visible = false;
            this.rizka.playAction("pickup", 0.9);
            Ch5Audio.playPickup();
            checkCollectedAll();
          }
        });
        this._addSpot({
          id: "s2_get_notes", label: "Ambil Catatan Susunan Acara (Halaman)", x: 4.35, z: 2.4, y: 0.9, radius: 2.0,
          isActive: () => !this.s2Collected.notes,
          onUse: () => {
            this.s2Collected.notes = true;
            if (P.itemEventNotes) P.itemEventNotes.visible = false;
            this.rizka.playAction("pickup", 0.9);
            Ch5Audio.playPaperRustle();
            Ch5Audio.playPickup();
            checkCollectedAll();
          }
        });

        // Optional Nadine natural chat
        this._addSpot({
          id: "s2_nadine", label: "Sapa Nadine (Info Panitia)", x: -0.95, z: -1.85, y: 1.65, radius: 2.0, color: 0x7dd3fc, optional: true,
          isActive: () => !this.flags.s2_talked_nadine && !this.stepDone[2],
          onUse: () => {
            this.flags.s2_talked_nadine = true;
            Ch5Dialogue.open("s2_nadine_chat");
          }
        });

        // 3 Delivery Target Spots (Poster -> Aula, Decor -> Hana, Notes -> Sena)
        const remainingItems = () => Object.keys(this.s2Delivered).filter((k) => !this.s2Delivered[k]);
        const checkAllDelivered = () => {
          this._refreshObjectiveHUD();
          if (this.s2Delivered.poster && this.s2Delivered.decor && this.s2Delivered.notes && !this.stepDone[2]) {
            const pts = Math.max(35, 100 - (this.s2WrongCount || 0) * 20);
            window.Score && Score.record("chapter_05", "s2_delivery", "Scene 2 · Ketepatan antar barang", pts, 100);
            this._markStep(2);
            Ch5Dialogue.open("s2_done_all", () => {
              this.app._transitionWithFade("Scene 3 — Not Everything Goes as Planned", "Aula Sekolah • Persiapan Acara...", () => {
                return this.loadScene("scene_3", false);
              });
            });
          }
        };

        this._addSpot({
          id: "s2_target_aula", label: "Pasang Perlengkapan di Pintu Aula", x: 5.55, z: -2.35, y: 1.25, radius: 2.2, color: 0x6ee7b7,
          isActive: () => this.s2PrioritySet && !this.s2Delivered.poster,
          onUse: () => {
            Ch5OverlayUI.openDeliverySelector("aula", "Pintu Aula Sekolah", remainingItems(), () => {
              this.s2Delivered.poster = true;
              if (P.deliveredPoster) P.deliveredPoster.visible = true;
              checkAllDelivered();
            });
          }
        });

        this._addSpot({
          id: "s2_target_hana", label: "Serahkan Perlengkapan ke Hana", x: -1.8, z: 2.95, y: 1.55, radius: 2.2, color: 0x6ee7b7,
          isActive: () => this.s2PrioritySet && !this.s2Delivered.decor,
          onUse: () => {
            Ch5OverlayUI.openDeliverySelector("hana", "Hana (Meja Dekorasi)", remainingItems(), () => {
              this.s2Delivered.decor = true;
              if (P.deliveredDecor) P.deliveredDecor.visible = true;
              checkAllDelivered();
            });
          }
        });

        this._addSpot({
          id: "s2_target_sena", label: "Serahkan Perlengkapan ke Sena", x: 2.95, z: -1.0, y: 1.55, radius: 2.2, color: 0x6ee7b7,
          isActive: () => this.s2PrioritySet && !this.s2Delivered.notes,
          onUse: () => {
            Ch5OverlayUI.openDeliverySelector("sena", "Sena (Meja OSIS)", remainingItems(), () => {
              this.s2Delivered.notes = true;
              if (P.deliveredNotes) P.deliveredNotes.visible = true;
              checkAllDelivered();
            });
          }
        });

        if (!isResume) {
          Ch5Dialogue.open("s2_intro");
        } else {
          this.state = "PLAYING"; this.app.game.state = "PLAYING";
        }

      } else if (sceneId === "scene_3") {
        if (!isResume) {
          this.s3BlueprintRead = false;
          this.s3ZoneFixed = [false, false, false, false];
          this.s3TimeLeft = 120;
          this.s3WrongCount = 0;
          this.s3HintsUsed = 0;
        }

        this.rizka.root.visible = true;
        this.rizka.root.position.set(-0.6, 0, 2.8);
        this.rizka.root.rotation.y = Math.PI;

        this.kael.root.visible = true;
        this.kael.root.position.set(0.85, 0, 2.5);
        this.kael.root.rotation.y = Math.PI - 0.25;
        this.kael.ch5LookTarget = this.rizka.root.position;

        this.buMira.root.visible = false;
        this.buMira.root.position.set(0, 0, 3.6);
        this.buMira.root.rotation.y = Math.PI;

        this.camYaw = this._yawTarget = 0.0;
        this.camPitch = this._pitchTarget = 0.22;
        this.camDist = this._distTarget = 4.0;
        this.camTarget.set(-0.6, 1.35, 2.8);

        // Step 0: Read Blueprint Board
        this._addSpot({
          id: "s3_blueprint", label: "Periksa Papan Rancangan Dekorasi", x: 0, z: 0.45, y: 1.15, radius: 2.2, color: 0xf4c57a,
          isActive: () => !this.stepDone[1],
          onUse: () => {
            Ch5OverlayUI.openBlueprintCard(() => {
              if (!this.s3BlueprintRead) {
                this.s3BlueprintRead = true;
                this._markStep(0);
                this.s3TimerActive = true;
                Ch5Dialogue.open("s3_blueprint_read");
              }
            });
          }
        });

        // Step 1: 4 Misplaced Aula Decoration Zones
        const zoneCoords = [
          { idx: 0, x: -3.8, z: -1.55, label: "Perbaiki Dekorasi Pilar Kiri Panggung", wProp: "zone1Wrong", rProp: "zone1Right" },
          { idx: 1, x: -2.6, z: 1.55,  label: "Perbaiki Dekorasi Meja Sambutan Depan", wProp: "zone2Wrong", rProp: "zone2Right" },
          { idx: 2, x:  3.8, z: -1.35, label: "Perbaiki Dekorasi Stand Kanan", wProp: "zone3Wrong", rProp: "zone3Right" },
          { idx: 3, x:  2.6, z: 1.55,  label: "Perbaiki Dekorasi Lengkungan Tengah", wProp: "zone4Wrong", rProp: "zone4Right" }
        ];

        const checkZonesComplete = () => {
          this._refreshObjectiveHUD();
          if (this.s3ZoneFixed.every(Boolean) && !this.stepDone[1]) {
            this.s3TimerActive = false;
            const timeBonus = this.s3TimeLeft >= 65 ? 20 : this.s3TimeLeft >= 30 ? 10 : 0;
            const pts = Math.min(100, Math.max(35, 80 + timeBonus - this.s3WrongCount * 15 - this.s3HintsUsed * 5));
            window.Score && Score.record("chapter_05", "s3_aula", "Scene 3 · Tata ulang dekorasi aula", pts, 100);
            this._markStep(1);
            this.buMira.root.visible = true;
          }
        };

        zoneCoords.forEach((zc) => {
          this._addSpot({
            id: `s3_zone_${zc.idx}`, label: zc.label, x: zc.x, z: zc.z, y: 1.25, radius: 2.25, color: 0xfb7185,
            isActive: () => this.s3BlueprintRead && !this.s3ZoneFixed[zc.idx],
            onUse: () => {
              Ch5OverlayUI.openZoneSwapModal(zc.idx, () => {
                this.s3ZoneFixed[zc.idx] = true;
                if (P[zc.wProp]) P[zc.wProp].visible = false;
                if (P[zc.rProp]) P[zc.rProp].visible = true;
                this.rizka.playAction("assist", 0.9);
                this.kael.playAction("assist", 0.9);
                checkZonesComplete();
              });
            }
          });
        });

        // Step 2: Wrap up with Kael & Bu Mira
        this._addSpot({
          id: "s3_report", label: "Bicara dengan Bu Mira & Kael", x: 0.35, z: 2.95, y: 1.65, radius: 2.4, color: 0x6ee7b7,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this._markStep(2);
            Ch5Dialogue.open("s3_finish", () => {
              this.app._transitionWithFade("Scene 4 — A Little Space", "Ruang Kelas Kosong • Sore Hari...", () => {
                return this.loadScene("scene_4", false);
              });
            });
          }
        });

        if (!isResume) {
          Ch5Dialogue.open("s3_intro");
        } else {
          if (this.s3BlueprintRead && !this.stepDone[1]) this.s3TimerActive = true;
          this.state = "PLAYING"; this.app.game.state = "PLAYING";
        }

      } else if (sceneId === "scene_4") {
        this.rizka.root.visible = true;
        this.rizka.root.position.set(0.95, 0, -0.4);
        this.rizka.root.rotation.y = -0.8;
        this.rizka.setExpression("annoyed");

        // Kael stands quietly facing the sunlit West classroom window!
        this.kael.root.visible = true;
        this.kael.root.position.set(-3.25, 0, -0.65);
        this.kael.root.rotation.y = -Math.PI / 2;
        this.kael.setExpression("look_window");
        this.kael.ch5WindowGaze = true;

        this.nadine.root.visible = !isResume;
        this.nadine.root.position.set(2.45, 0, -1.65);
        this.nadine.root.rotation.y = -1.1;

        this.camYaw = this._yawTarget = 0.68;
        this.camPitch = this._pitchTarget = 0.22;
        this.camDist = this._distTarget = 3.35;
        this.camTarget.set(0.95, 1.35, -0.4);

        // Step 0: Gather leftover supplies on desk
        this._addSpot({
          id: "s4_gather", label: "Kumpulkan Sisa Alat Dekorasi di Meja", x: 0.05, z: 0.85, y: 1.0, radius: 2.1,
          isActive: () => !this.stepDone[0],
          onUse: () => {
            this._markStep(0);
            Ch5Audio.playPickup();
            this.rizka.playAction("pickup", 1.0);
            ["leftoverScissors", "leftoverTape", "leftoverMarkers", "leftoverPaper"].forEach((k) => {
              if (P[k]) P[k].visible = false;
            });
            AM.instantiateGLB("ch5_prop_supply_box", { scale: 0.65 }).then((box) => {
              if (this.active && this.activeSceneId === "scene_4" && !this.stepDone[1]) {
                this.rizka.attachHandProp(box, { pos: [0, -0.02, 0.08] });
              }
            }).catch(() => {});
          }
        });

        // Step 1: Return box to back storage cabinet
        this._addSpot({
          id: "s4_store", label: "Simpan Kotak ke Lemari Belakang", x: 2.35, z: 2.55, y: 1.25, radius: 2.2, color: 0x6ee7b7,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            Ch5Audio.playDecorPlace(true);
            this.rizka.clearHandProp();
            if (P.returnedBox) P.returnedBox.visible = true;
            this._markStep(1);
            Ch5Dialogue.open("s4_stored");
          }
        });

        // Step 2: Approach Kael by the window -> Observation Challenge -> Branching Choice
        this._addSpot({
          id: "s4_kael_window", label: "Dekati Kael di Sisi Jendela", x: -2.45, z: -0.65, y: 1.65, radius: 2.3, color: 0xf4c57a,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            this.rizka.root.position.set(-2.35, 0, -0.15);
            this.rizka.root.rotation.y = -1.15;
            this.applyCinematicShot("close_kael");
            Ch5OverlayUI.openKaelObservation(() => {
              this.kael.ch5WindowGaze = false;
              this.kael.root.rotation.y = 1.65;
              this.kael.ch5LookTarget = this.rizka.root.position;
              this.rizka.ch5LookTarget = this.kael.root.position;
              this._markStep(2);
              Ch5Dialogue.open("s4_reconcile", () => {
                this.app._transitionWithFade("Scene 5 — After the Noise", "Halaman Sekolah Senja & Jalan Pulang...", () => {
                  return this.loadScene("scene_5", false);
                });
              });
            });
          }
        });

        if (!isResume) {
          Ch5Dialogue.open("s4_intro", () => {
            this.nadine.root.visible = false;
          });
        } else {
          this.state = "PLAYING"; this.app.game.state = "PLAYING";
        }

      } else if (sceneId === "scene_5") {
        this.rizka.root.visible = true;
        this.rizka.root.position.set(-0.55, 0, -0.4);
        this.rizka.root.rotation.y = 0.1;
        this.rizka.setExpression("small_smile");

        this.kael.root.visible = true;
        this.kael.root.position.set(0.55, 0, 2.2);
        this.kael.root.rotation.y = Math.PI - 0.2;
        this.kael.setExpression("gentle_smile");

        this.camYaw = this._yawTarget = Math.PI;
        this.camPitch = this._pitchTarget = 0.20;
        this.camDist = this._distTarget = 3.8;
        this.camTarget.set(-0.55, 1.35, -0.4);

        // Step 0: Meet Kael in evening schoolyard
        this._addSpot({
          id: "s5_yard_kael", label: "Temui Kael di Halaman Sekolah", x: 0.35, z: 2.0, y: 1.65, radius: 2.3, color: 0x6ee7b7,
          isActive: () => !this.stepDone[0],
          onUse: () => {
            this._markStep(0);
            this.flags.s5_walk_together = true;
            Ch5Dialogue.open("s5_meet_yard");
          }
        });

        // Step 1: Environmental Object #1 — Wayside Bench & Warm Drink
        this._addSpot({
          id: "s5_bench", label: "Berhenti Sebentar di Bangku Tepi Jalan", x: -1.55, z: 11.35, y: 1.1, radius: 2.4, color: 0xf4c57a,
          isActive: () => this.stepDone[0] && !this.stepDone[1],
          onUse: () => {
            this._markStep(1);
            Ch5Audio.playPickup();
            if (P.drink1) P.drink1.visible = false;
            Ch5Dialogue.open("s5_bench_drink");
            AM.instantiateGLB("ch5_prop_bottled_drink", { scale: 0.9 }).then((bottle) => {
              if (this.active && this.activeSceneId === "scene_5") {
                this.rizka.attachHandProp(bottle);
              }
            }).catch(() => {});
          }
        });

        // Environmental Object #2 (Optional bonus!) — Neighborhood Notice Board
        this._addSpot({
          id: "s5_notice", label: "Lihat Papan Pengumuman Lingkungan", x: -1.55, z: 16.4, y: 1.3, radius: 2.3, color: 0x7dd3fc, optional: true,
          isActive: () => this.stepDone[0] && !this.flags.s5_notice_seen && !this.stepDone[2],
          onUse: () => {
            this.flags.s5_notice_seen = true;
            Ch5Audio.playPaperRustle();
            window.Feedback && Feedback.right();
            Ch5Dialogue.open("s5_notice_board");
          }
        });

        // Step 2: Final Streetlight Conversation & Short Cinematic Ending
        this._addSpot({
          id: "s5_final_lamp", label: "Lanjutkan Obrolan di Bawah Lampu Jalan", x: 0.0, z: 18.4, y: 1.5, radius: 2.5, color: 0xf4c57a,
          isActive: () => this.stepDone[1] && !this.stepDone[2],
          onUse: () => {
            const walkPts = this.flags.s5_notice_seen ? 100 : 80;
            window.Score && Score.record("chapter_05", "s5_walk", "Scene 5 · Eksplorasi jalan pulang", walkPts, 100);
            this._markStep(2);
            this.rizka.root.position.set(-0.42, 0, 18.35);
            this.rizka.root.rotation.y = 1.15;
            this.kael.root.position.set(0.45, 0, 18.42);
            this.kael.root.rotation.y = -1.15;
            Ch5Dialogue.open("s5_ending", () => {
              this._playShortEndingCutscene();
            });
          }
        });

        this.state = "PLAYING";
        this.app.game.state = "PLAYING";
      }
    }

    _restoreSceneVisualState() {
      if (!this.activeStage) return;
      const P = this.activeStage.props;
      if (this.activeSceneId === "scene_1") {
        if (this.stepDone[0] && P.bag) P.bag.visible = false;
        if (this.stepDone[1]) {
          if (P.forgottenBook) P.forgottenBook.visible = false;
          this.kael.root.visible = true;
        }
        if (this.stepDone[2]) this.flags.s1_walk_together = true;
      } else if (this.activeSceneId === "scene_2") {
        if (this.s2Collected.poster && P.itemPoster) P.itemPoster.visible = false;
        if (this.s2Collected.decor && P.itemDecorBox) P.itemDecorBox.visible = false;
        if (this.s2Collected.notes && P.itemEventNotes) P.itemEventNotes.visible = false;
        if (this.s2Delivered.poster && P.deliveredPoster) P.deliveredPoster.visible = true;
        if (this.s2Delivered.decor && P.deliveredDecor) P.deliveredDecor.visible = true;
        if (this.s2Delivered.notes && P.deliveredNotes) P.deliveredNotes.visible = true;
      } else if (this.activeSceneId === "scene_3") {
        this.s3ZoneFixed.forEach((fixed, idx) => {
          const n = idx + 1;
          if (fixed) {
            if (P[`zone${n}Wrong`]) P[`zone${n}Wrong`].visible = false;
            if (P[`zone${n}Right`]) P[`zone${n}Right`].visible = true;
          }
        });
        if (this.stepDone[1]) this.buMira.root.visible = true;
      } else if (this.activeSceneId === "scene_4") {
        if (this.stepDone[0]) {
          ["leftoverScissors", "leftoverTape", "leftoverMarkers", "leftoverPaper"].forEach((k) => { if (P[k]) P[k].visible = false; });
        }
        if (this.stepDone[1] && P.returnedBox) P.returnedBox.visible = true;
      } else if (this.activeSceneId === "scene_5") {
        if (this.stepDone[0]) this.flags.s5_walk_together = true;
        if (this.stepDone[1] && P.drink1) P.drink1.visible = false;
      }
    }

    _addSpot(cfg) {
      const col = cfg.color || 0xf4c57a;
      const grp = new THREE.Group();
      grp.position.set(cfg.x, 0.03, cfg.z);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.44, 28),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.userData.ch5Disposable = true;

      const diamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.095, 0),
        new THREE.MeshBasicMaterial({ color: col })
      );
      diamond.position.y = cfg.y || 1.15;
      diamond.userData.ch5Disposable = true;

      grp.add(ring, diamond);
      this.spotGroup.add(grp);

      this.spots.push({
        id: cfg.id,
        label: cfg.label,
        x: cfg.x,
        z: cfg.z,
        radius: cfg.radius || 2.1,
        optional: !!cfg.optional,
        isActive: cfg.isActive,
        onUse: cfg.onUse,
        marker: grp,
        ring,
        diamond,
        baseY: cfg.y || 1.15
      });
    }

    _markStep(idx) {
      if (this.stepDone[idx] !== undefined) {
        this.stepDone[idx] = true;
        this.idleHintTimer = 0;
        this._refreshObjectiveHUD();
        this.saveProgress(true);
      }
    }

    _refreshObjectiveHUD() {
      const sc = window.CH5_STORY_DATA.scenes[this.activeSceneId];
      if (!sc) return;
      const doneCount = this.stepDone.filter(Boolean).length;
      const total = sc.steps.length;
      const curIdx = this.stepDone.findIndex((d) => !d);
      const activeText = sc.steps[curIdx < 0 ? total - 1 : curIdx] || "";

      const chEl = document.getElementById("hud-ch5-chapter");
      const plEl = document.getElementById("hud-ch5-prog-pill");
      const ttEl = document.getElementById("hud-ch5-title");
      const brEl = document.getElementById("hud-ch5-prog-bar");
      const stEl = document.getElementById("hud-ch5-active-step");
      const exEl = document.getElementById("hud-ch5-extra");

      if (chEl) chEl.textContent = `CH. 5 • SCENE ${sc.order}/5`;
      if (plEl) plEl.textContent = `${doneCount}/${total}`;
      if (ttEl) ttEl.textContent = sc.missionTitle;
      if (brEl) brEl.style.width = `${Math.round((doneCount / Math.max(1, total)) * 100)}%`;
      if (stEl) stEl.innerHTML = `<span class="text-amber-300 mr-1">◆</span>${activeText}`;

      if (exEl) {
        if (this.activeSceneId === "scene_2" && !this.stepDone[2]) {
          const got = Object.values(this.s2Collected).filter(Boolean).length;
          const del = Object.values(this.s2Delivered).filter(Boolean).length;
          exEl.innerHTML = !this.s2PrioritySet
            ? `<span class="text-sky-200">Perlengkapan: <strong>${got}/3</strong> terkumpul</span>`
            : `<span class="text-emerald-200">Terkirim: <strong>${del}/3</strong> lokasi</span>`;
        } else if (this.activeSceneId === "scene_3" && this.s3BlueprintRead && !this.stepDone[1]) {
          const fixed = this.s3ZoneFixed.filter(Boolean).length;
          const sec = Math.max(0, Math.ceil(this.s3TimeLeft));
          const m = Math.floor(sec / 60), s = String(sec % 60).padStart(2, "0");
          const col = sec <= 25 ? "text-rose-300" : "text-amber-200";
          exEl.innerHTML = `<div class="flex items-center justify-between"><span class="${col} font-mono">⏱ ${m}:${s}</span><span class="text-emerald-200 font-mono">${fixed}/4 Rapi</span></div>`;
        } else {
          exEl.innerHTML = "";
        }
      }
    }

    applyChoiceEffects(eff) {
      if (!eff) return;
      if (eff.affection) {
        this.rel.affection += eff.affection;
        this.app.game.relationships.kael = Math.min(100, Math.max(this.app.game.relationships.kael || 0, this.rel.affection));
      }
      if (eff.trust) this.rel.trust += eff.trust;
      if (eff.comfort) this.rel.comfort += eff.comfort;
      if (eff.openness) this.rel.openness += eff.openness;
      if (eff.flag) Object.assign(this.flags, eff.flag);
      if (eff.resonance) {
        window.Ch5Audio && Ch5Audio.playWarmChime();
        const slot = document.getElementById("ch5-resonance-slot");
        if (slot) {
          slot.innerHTML = `<div class="glass-soft px-4 py-1.5 rounded-full border border-amber-200/40 text-xs text-amber-100 shadow-lg">✦ ${eff.resonance}</div>`;
          clearTimeout(this._resTimer);
          this._resTimer = setTimeout(() => { slot.innerHTML = ""; }, 2600);
        }
      }
    }

    /* ---------------- CINEMATIC & THIRD-PERSON CAMERA ---------------- */
    applyCinematicShot(shotName, speakerName) {
      if (!this.rizka) return;
      const rp = this.rizka.root.position;
      const kp = this.kael && this.kael.root.visible ? this.kael.root.position : rp;
      const midX = (rp.x + kp.x) * 0.5;
      const midZ = (rp.z + kp.z) * 0.5;

      if (shotName === "close_rizka") {
        const fwdX = Math.sin(this.rizka.root.rotation.y), fwdZ = Math.cos(this.rizka.root.rotation.y);
        this.cinematicShot = {
          pos: new THREE.Vector3(rp.x + fwdX * 1.35 + 0.25, 1.46, rp.z + fwdZ * 1.35 + 0.25),
          look: new THREE.Vector3(rp.x, 1.42, rp.z)
        };
      } else if (shotName === "close_kael" && this.kael && this.kael.root.visible) {
        this.cinematicShot = {
          pos: new THREE.Vector3(kp.x + 1.45, 1.54, kp.z + 0.85),
          look: new THREE.Vector3(kp.x, 1.48, kp.z)
        };
      } else if (shotName === "ots_rizka" || shotName === "ots_kael") {
        this.cinematicShot = {
          pos: new THREE.Vector3(midX + 1.55, 1.52, midZ + 1.85),
          look: new THREE.Vector3(midX, 1.38, midZ)
        };
      } else if (shotName === "wide") {
        this.cinematicShot = {
          pos: new THREE.Vector3(midX + 2.4, 2.25, midZ + 3.6),
          look: new THREE.Vector3(midX, 1.30, midZ)
        };
      } else {
        // Default balanced medium two-shot
        this.cinematicShot = {
          pos: new THREE.Vector3(midX + 1.25, 1.48, midZ + 2.35),
          look: new THREE.Vector3(midX, 1.38, midZ)
        };
      }

      // Clamp cinematic camera safely inside current room bounds so it never clips outside walls!
      if (this.activeStage && this.activeStage.bounds && this.cinematicShot) {
        const b = this.activeStage.bounds;
        this.cinematicShot.pos.x = Math.max(b.minX + 0.25, Math.min(b.maxX - 0.25, this.cinematicShot.pos.x));
        this.cinematicShot.pos.z = Math.max(b.minZ + 0.25, Math.min(b.maxZ - 0.25, this.cinematicShot.pos.z));
      }
    }

    clearCinematicShot() {
      this.cinematicShot = null;
    }

    _playShortEndingCutscene() {
      this.state = "CUTSCENE";
      this.app.game.state = "CUTSCENE";
      document.body.classList.add("letterbox-active");
      if (window.Ch5Audio) Ch5Audio.playEndingChord();
      this.applyChoiceEffects({ affection: 2, comfort: 2 });

      const rp = this.rizka.root.position;
      this.endingCutscene = {
        startMs: performance.now(),
        durationMs: 2100,
        startPos: this.app.camera.position.clone(),
        endPos: new THREE.Vector3(rp.x + 1.8, 2.65, rp.z - 3.6),
        look: new THREE.Vector3(0, 1.65, rp.z + 0.6)
      };
    }

    showChapterEnding() {
      document.body.classList.remove("letterbox-active");
      this.flags.ch5_completed = true;
      this.app.game.setFlag("ch5_completed", true);
      this.app.game.completeChapter("chapter_05");
      this.app.game.relationships.kael = Math.min(100, Math.max(this.app.game.relationships.kael || 20, this.rel.affection));

      // Ensure all 5 core score items have entries even if player jumped via Scene Drawer
      if (window.Score) {
        const existing = (Score.run.chapter_05 || []).map((x) => x.id);
        if (!existing.includes("s1_morning")) Score.record("chapter_05", "s1_morning", "Scene 1 · Cek barang pagi", 85, 100);
        if (!existing.includes("s2_priority")) Score.record("chapter_05", "s2_priority", "Scene 2 · Prioritas tugas", 85, 100);
        if (!existing.includes("s2_delivery")) Score.record("chapter_05", "s2_delivery", "Scene 2 · Ketepatan antar barang", 85, 100);
        if (!existing.includes("s3_aula")) Score.record("chapter_05", "s3_aula", "Scene 3 · Tata ulang dekorasi aula", 85, 100);
        if (!existing.includes("s4_observe")) Score.record("chapter_05", "s4_observe", "Scene 4 · Observasi bahasa tubuh", 85, 100);
        if (!existing.includes("s5_walk")) Score.record("chapter_05", "s5_walk", "Scene 5 · Eksplorasi jalan pulang", 85, 100);
      }

      const sum = window.Score ? Score.summary("chapter_05") : null;
      this.finalScore = sum ? { grade: sum.grade, pct: sum.pct, pts: sum.pts, max: sum.max } : null;
      this.saveProgress(true);

      const sumEl = document.getElementById("ending-ch5-summary");
      if (sumEl) {
        sumEl.textContent = this.flags.s4_approach === "direct"
          ? "Tanpa kata-kata berlebihan, Rizka dan Kael belajar bahwa kedekatan bukan soal menanggung beban sendirian—melainkan berani bicara jujur saat langkah terasa tidak seirama."
          : "Di sepanjang lampu jalan pulang yang tenang, candaan kecil dan perhatian sederhana sudah cukup mengatakan semua hal yang belum sempat terucap.";
      }
      const badgeEl = document.getElementById("ending-ch5-grade-badge");
      if (badgeEl && sum) {
        badgeEl.textContent = `Nilai Chapter 5: ${sum.grade} (${sum.pct}% • ${sum.pts}/${sum.max} Poin)`;
      }

      this._toggleModal("modal-ch5-ending", true);
      this.state = "PAUSED";
      this.app.game.state = "PAUSED";
      setTimeout(() => { try { window.Score && Score.showCard("chapter_05"); } catch (_) {} }, 550);
    }

    /* ---------------- UPDATE LOOP ---------------- */
    update(dt, elapsed) {
      if (!this.active || !this.rizka || !this.activeStage) return;

      Ch5Dialogue.update(dt);
      Ch5WorldBuilder.updateEnvironmentDynamics(this.activeStage, dt, elapsed);

      // Ending short cinematic pan (wall-clock synced so smooth on all FPS)
      if (this.endingCutscene) {
        const ec = this.endingCutscene;
        const p = Math.min(1, (performance.now() - ec.startMs) / ec.durationMs);
        const smooth = p * p * (3 - 2 * p);
        this.app.camera.position.lerpVectors(ec.startPos, ec.endPos, smooth);
        this.app.camera.lookAt(ec.look);
        this.rizka.root.position.z = Math.min(19.8, this.rizka.root.position.z + dt * 0.45);
        this.kael.root.position.z = Math.min(19.8, this.kael.root.position.z + dt * 0.45);
        this.rizka.root.rotation.y = 0;
        this.kael.root.rotation.y = 0;
        Ch5Characters.updateActor(this.rizka, dt, elapsed, { speed: 0.45, wind: 0.3 });
        Ch5Characters.updateActor(this.kael, dt, elapsed, { speed: 0.45, wind: 0.3 });
        if (p >= 1) {
          this.endingCutscene = null;
          this.showChapterEnding();
        }
        return;
      }

      // Scene 3 generous countdown timer
      if (this.activeSceneId === "scene_3" && this.s3TimerActive && this.state === "PLAYING") {
        this.s3TimeLeft = Math.max(0, this.s3TimeLeft - dt);
        this._refreshObjectiveHUD();
        if (this.s3TimeLeft <= 0) {
          // Gentle timeout recovery: Kael helps finish remaining zones with lower points so player is NEVER soft-locked!
          this.s3TimerActive = false;
          const P = this.activeStage.props;
          this.s3ZoneFixed = [true, true, true, true];
          for (let n = 1; n <= 4; n++) {
            if (P[`zone${n}Wrong`]) P[`zone${n}Wrong`].visible = false;
            if (P[`zone${n}Right`]) P[`zone${n}Right`].visible = true;
          }
          window.Score && Score.record("chapter_05", "s3_aula", "Scene 3 · Tata ulang dekorasi aula", 45, 100);
          this._markStep(1);
          this.buMira.root.visible = true;
          Toast.show("Waktu habis — Kael dan panitia membantu merapikan sisa dekorasi!", "info", 2800);
        }
      }

      const canMove = this.state === "PLAYING" && this.app.game.state === "PLAYING" && !Ch5Dialogue.active && !Ch5OverlayUI.active;
      const inp = this.app.input;

      // Camera drag + zoom (uses Cicaww33 InputHandler.consumeCameraDelta)
      const camDelta = inp.consumeCameraDelta();
      if (canMove && !this.cinematicShot) {
        const sens = 0.0052 * (this.app.settings.data.cameraSensitivity || 1);
        const invY = this.app.settings.data.invertY ? -1 : 1;
        this._yawTarget -= camDelta.x * sens;
        this._pitchTarget = Math.max(0.06, Math.min(0.76, this._pitchTarget + camDelta.y * sens * invY));
        this._distTarget = Math.max(1.85, Math.min(5.6, this._distTarget + camDelta.zoom));
      }
      this.camYaw += (this._yawTarget - this.camYaw) * Math.min(1, dt * 14);
      this.camPitch += (this._pitchTarget - this.camPitch) * Math.min(1, dt * 14);
      this.camDist += (this._distTarget - this.camDist) * Math.min(1, dt * 10);

      // Player movement (uses Cicaww33 InputHandler.getMoveVector(dt) -> { x, y })
      let moveSpeed = 0;
      const mv = canMove ? inp.getMoveVector(dt) : { x: 0, y: 0 };
      const mag = Math.min(1, Math.hypot(mv.x, mv.y));
      const sprinting = canMove && mag > 0.45 && inp.isSprinting();
      if (canMove && mag > 0.02) {
        const maxSpd = sprinting ? 4.85 : 3.05;
        moveSpeed = mag * maxSpd;
        const sinY = Math.sin(this.camYaw), cosY = Math.cos(this.camYaw);
        const fx = -sinY, fz = -cosY;
        const rx = cosY, rz = -sinY;
        const wx = fx * (mv.y / mag) + rx * (mv.x / mag);
        const wz = fz * (mv.y / mag) + rz * (mv.x / mag);
        const b = this.activeStage.bounds;
        this.rizka.root.position.x = Math.max(b.minX, Math.min(b.maxX, this.rizka.root.position.x + wx * moveSpeed * dt));
        this.rizka.root.position.z = Math.max(b.minZ, Math.min(b.maxZ, this.rizka.root.position.z + wz * moveSpeed * dt));

        const targetRot = Math.atan2(wx, wz);
        let diff = targetRot - this.rizka.root.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.rizka.root.rotation.y += diff * Math.min(1, dt * 12);

        if (window.Ch5Audio) Ch5Audio.playFootstep(this.activeStage.surface);
        this.idleHintTimer = 0;
      } else if (canMove) {
        this.idleHintTimer += dt;
      }

      // Companion Kael walking alongside Rizka in Scene 1 (after greeting) & Scene 5 (walk home)!
      let kaelSpeed = 0;
      if (this.kael && this.kael.root.visible && ((this.activeSceneId === "scene_1" && this.flags.s1_walk_together) || (this.activeSceneId === "scene_5" && this.flags.s5_walk_together)) && canMove) {
        const tx = this.rizka.root.position.x + 0.78;
        const tz = this.rizka.root.position.z - 0.35;
        const dx = tx - this.kael.root.position.x;
        const dz = tz - this.kael.root.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.22) {
          kaelSpeed = Math.min(3.8, dist * 2.6);
          const b = this.activeStage.bounds;
          this.kael.root.position.x = Math.max(b.minX, Math.min(b.maxX, this.kael.root.position.x + (dx / dist) * kaelSpeed * dt));
          this.kael.root.position.z = Math.max(b.minZ, Math.min(b.maxZ, this.kael.root.position.z + (dz / dist) * kaelSpeed * dt));
          const kr = Math.atan2(dx, dz);
          let kd = kr - this.kael.root.rotation.y;
          while (kd > Math.PI) kd -= Math.PI * 2;
          while (kd < -Math.PI) kd += Math.PI * 2;
          this.kael.root.rotation.y += kd * Math.min(1, dt * 10);
        }
      }

      const wind = this.activeSceneId === "scene_5" ? 0.34 : this.activeSceneId === "scene_2" ? 0.26 : 0.16;
      Ch5Characters.updateActor(this.rizka, dt, elapsed, { speed: moveSpeed, sprinting, wind });
      Ch5Characters.updateActor(this.kael, dt, elapsed, { speed: kaelSpeed, wind });
      Ch5Characters.updateActor(this.nadine, dt, elapsed, { speed: 0, wind: 0.15 });
      Ch5Characters.updateActor(this.buMira, dt, elapsed, { speed: 0, wind: 0.12 });
      Ch5Characters.updateActor(this.hana, dt, elapsed, { speed: 0, wind: 0.22 });
      Ch5Characters.updateActor(this.sena, dt, elapsed, { speed: 0, wind: 0.15 });

      // Update interaction spots + compass guide
      this._updateSpotsAndGuide(elapsed, canMove);

      // Update camera position smoothly with wall bounds clamp
      if (this.cinematicShot) {
        this.app.camera.position.lerp(this.cinematicShot.pos, Math.min(1, dt * 6.5));
        this.camTarget.lerp(this.cinematicShot.look, Math.min(1, dt * 6.5));
        this.app.camera.lookAt(this.camTarget);
      } else {
        const rp = this.rizka.root.position;
        this.camTarget.x += (rp.x - this.camTarget.x) * Math.min(1, dt * 10);
        this.camTarget.y += (1.36 - this.camTarget.y) * Math.min(1, dt * 10);
        this.camTarget.z += (rp.z - this.camTarget.z) * Math.min(1, dt * 10);

        const hDist = Math.cos(this.camPitch) * this.camDist;
        let cx = this.camTarget.x + Math.sin(this.camYaw) * hDist;
        let cy = this.camTarget.y + Math.sin(this.camPitch) * this.camDist;
        let cz = this.camTarget.z + Math.cos(this.camYaw) * hDist;

        const b = this.activeStage.bounds;
        cx = Math.max(b.minX - 0.35, Math.min(b.maxX + 0.35, cx));
        cz = Math.max(b.minZ - 0.35, Math.min(b.maxZ + 0.35, cz));
        cy = Math.max(0.65, Math.min(3.15, cy));

        this.app.camera.position.set(cx, cy, cz);
        this.app.camera.lookAt(this.camTarget);
      }
    }

    _updateSpotsAndGuide(elapsed, canMove) {
      const rp = this.rizka.root.position;
      let nearest = null;
      let bestDist = Infinity;
      let primaryGuide = null;
      let bestGuideDist = Infinity;

      const pulseBoost = this.idleHintTimer > 14 ? 1.35 : 1.0;

      this.spots.forEach((sp) => {
        const on = sp.isActive();
        sp.marker.visible = on;
        if (!on) return;

        sp.diamond.position.y = sp.baseY + Math.sin(elapsed * 3.0) * 0.06;
        sp.diamond.rotation.y = elapsed * 1.8;
        sp.ring.scale.setScalar((1.0 + Math.sin(elapsed * 3.2) * 0.08) * (sp.optional ? 0.85 : pulseBoost));

        const d = Math.hypot(sp.x - rp.x, sp.z - rp.z);
        if (d <= sp.radius && d < bestDist) {
          bestDist = d;
          nearest = sp;
        }
        if (!sp.optional && d < bestGuideDist) {
          bestGuideDist = d;
          primaryGuide = sp;
        }
      });

      this.nearestSpot = canMove ? nearest : null;
      this._updateInteractHUD(this.nearestSpot);

      const gPill = document.getElementById("ch5-guide-pill");
      if (gPill) {
        if (canMove && primaryGuide && !this.nearestSpot) {
          gPill.classList.remove("hidden");
          gPill.classList.add("flex");
          const dx = primaryGuide.x - rp.x, dz = primaryGuide.z - rp.z;
          const worldAng = Math.atan2(dx, dz);
          const relAng = worldAng - this.camYaw + Math.PI;
          const arr = document.getElementById("ch5-guide-arrow");
          const txt = document.getElementById("ch5-guide-text");
          if (arr) arr.style.transform = `rotate(${Math.round((relAng * 180) / Math.PI)}deg)`;
          if (txt) {
            const distM = Math.max(1, Math.round(bestGuideDist));
            txt.textContent = `${primaryGuide.label} (${distM}m)`;
          }
        } else {
          gPill.classList.add("hidden");
          gPill.classList.remove("flex");
        }
      }
    }

    _updateInteractHUD(spot) {
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

    triggerInteraction() {
      if (!this.active || this.state !== "PLAYING" || !this.nearestSpot) return;
      const sp = this.nearestSpot;
      this.nearestSpot = null;
      this._updateInteractHUD(null);
      sp.onUse();
    }

    /* ---------------- SAVE / EXPORT / DRAWERS / ENDING ACTIONS ---------------- */
    exportState() {
      return {
        sceneId: this.activeSceneId,
        stepDone: [...this.stepDone],
        rel: { ...this.rel },
        flags: { ...this.flags },
        totalMistakes: this.totalMistakes,
        s2Collected: { ...this.s2Collected },
        s2PrioritySet: this.s2PrioritySet,
        s2Delivered: { ...this.s2Delivered },
        s2WrongCount: this.s2WrongCount,
        s3BlueprintRead: this.s3BlueprintRead,
        s3ZoneFixed: [...this.s3ZoneFixed],
        s3TimeLeft: Math.round(this.s3TimeLeft),
        s3WrongCount: this.s3WrongCount,
        s3HintsUsed: this.s3HintsUsed,
        playerPos: this.rizka ? {
          x: Number(this.rizka.root.position.x.toFixed(2)),
          y: 0,
          z: Number(this.rizka.root.position.z.toFixed(2))
        } : null,
        completed: !!this.flags.ch5_completed,
        finalScore: this.finalScore || null
      };
    }

    saveProgress(silent = false) {
      try {
        const st = this.exportState();
        localStorage.setItem(CH5_SAVE_KEY, JSON.stringify(st));
        this.app.game.savedCh5State = st;
        const ok = this.app.saveManager.save(this.app.game.exportSaveData(this.rizka ? this.rizka.root.position : null));
        if (!silent && ok) Toast.show("Progres Chapter 5 tersimpan!", "success", 1800);
        return ok;
      } catch (_) {
        return false;
      }
    }

    toggleDrawer(drawerId) {
      const target = document.getElementById(drawerId);
      if (!target) return;
      const willOpen = target.classList.contains("hidden");
      this.closeDrawers();
      if (willOpen) {
        target.classList.remove("hidden");
        target.classList.add("flex");
      }
    }

    closeDrawers() {
      ["ch5-drawer-scenes", "ch5-drawer-studio"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) { el.classList.add("hidden"); el.classList.remove("flex"); }
      });
    }

    _toggleModal(id, open) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle("hidden", !open);
      el.classList.toggle("flex", open);
    }

    advanceDialogue() { Ch5Dialogue.advance(); }
    skipDialogue() { Ch5Dialogue.skipToChoiceOrEnd(); }

    showScoreAgain() {
      try { window.Score && Score.showCard("chapter_05"); } catch (_) {}
    }

    replayChapter5() {
      this._toggleModal("modal-ch5-ending", false);
      this.app._startChapter5(false, null);
    }

    openChaptersFromEnding() {
      this._toggleModal("modal-ch5-ending", false);
      this.app._populateChapterModal();
      this.app._toggleModal("modal-chapters", true);
    }

    returnToTitle() {
      this._toggleModal("modal-ch5-ending", false);
      this.app._returnToMainMenu();
    }
  }

  window.Chapter5Controller = Chapter5Controller;
})();
