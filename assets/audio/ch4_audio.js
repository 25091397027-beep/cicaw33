/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   MODUL AUDIO ATMOSFERIK MURNI WEB AUDIO API (assets/audio/ch4_audio.js)
   - Mendukung mode Unified Single-AudioContext bersama AudioManager utama
     (bebas duplikasi AudioContext di iOS/Android, bebas musik bertumpuk,
      mewarisi anti-crackle limiter & pengaturan volume/mute utama)
   - 5 Mood Musik Orisinal Chapter 4:
     1. night_call   (Scene 1: Piano malam hening & pad hangat)
     2. morning_soft (Scene 2: Akustik elektrik pagi sekolah)
     3. window_warm  (Scene 3: Harmoni lembut dekat jendela kelas)
     4. overcast     (Scene 4: Nada sore mendung reflektif)
     5. golden_hour  (Scene 5: Puncak emosional senja keemasan)
============================================================================ */
"use strict";

window.Ch4Audio = (function () {
  const NOTE_IDX = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  const noteHz = (n) => {
    if (typeof n === "number") return n;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    return m ? 440 * Math.pow(2, ((+m[2] + 1) * 12 + NOTE_IDX[m[1]] - 69) / 12) : 440;
  };

  const MOODS = {
    night_call: {
      bpm: 64, ambFreq: 720, ambVol: 0.022,
      prog: [["D3", "F3", "A3", "C4", "E4"], ["Bb2", "D3", "F3", "A3", "C4"], ["F3", "A3", "C4", "E4"], ["C3", "E3", "G3", "B3"]],
      mel: ["A4", "G4", "F4", "E4", "D4", "C5"]
    },
    morning_soft: {
      bpm: 84, ambFreq: 1850, ambVol: 0.018,
      prog: [["F3", "A3", "C4", "E4"], ["G3", "B3", "D4", "F4"], ["E3", "G3", "B3", "D4"], ["A3", "C4", "E4", "G4"]],
      mel: ["C5", "E5", "D5", "A4", "G4", "C5"]
    },
    window_warm: {
      bpm: 74, ambFreq: 1400, ambVol: 0.016,
      prog: [["C3", "E3", "G3", "B3", "D4"], ["A2", "C3", "E3", "G3", "B3"], ["F3", "A3", "C4", "E4"], ["G3", "B3", "D4", "F4"]],
      mel: ["E5", "D5", "C5", "B4", "G4", "A4"]
    },
    overcast: {
      bpm: 68, ambFreq: 960, ambVol: 0.024,
      prog: [["A2", "C3", "E3", "G3"], ["F2", "A2", "C3", "E3"], ["D3", "F3", "A3", "C4"], ["E3", "G#3", "B3", "D4"]],
      mel: ["E4", "A4", "G4", "F4", "E4", "D4"]
    },
    golden_hour: {
      bpm: 76, ambFreq: 1600, ambVol: 0.028,
      prog: [["F3", "A3", "C4", "E4", "G4"], ["G3", "B3", "D4", "G4"], ["E3", "G3", "B3", "D4", "F#4"], ["A3", "C4", "E4", "G4", "B4"]],
      mel: ["E5", "G5", "A5", "G5", "E5", "D5"]
    }
  };

  let host = null; // Reference to main Cicaww33 AudioManager when unified
  let active = !window.__CICAWW_UNIFIED__;
  let ctx = null;
  let initialized = false;
  let muted = false;
  let masterVol = 0.88;
  let bgmVol = 0.74;
  let sfxVol = 0.85;
  let activeMood = "night_call";
  let barIdx = 0;
  let nextBarTime = null;
  let nodes = {};
  let noiseBuf = null;
  let ringTimer = null;
  let lastBlipMs = 0;

  function _isMuted() {
    return host ? !!host.muted : muted;
  }

  function _makeSeamlessPinkNoise(c, seconds) {
    const sr = c.sampleRate, N = Math.floor(sr * seconds), X = Math.floor(sr * 0.5), M = N + X;
    const raw = new Float32Array(M);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < M; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.06;
      b1 = 0.985 * b1 + w * 0.12;
      b2 = 0.920 * b2 + w * 0.28;
      raw[i] = (b0 + b1 + b2 + w * 0.18) * 0.22;
    }
    const buf = c.createBuffer(1, N, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = raw[i];
    for (let i = 0; i < X; i++) {
      const a = (i / X) * Math.PI * 2;
      d[i] = raw[i] * Math.sin(a) + raw[N + i] * Math.cos(a);
    }
    return buf;
  }

  function _ensureContext() {
    try {
      if (host) {
        host.initOnGesture();
        if (!host.ctx || !host.initialized) return false;
        ctx = host.ctx;
        if (!initialized) _buildGraphShared();
        return initialized;
      }
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        try { ctx = new AC({ latencyHint: "playback" }); } catch (_) { ctx = new AC(); }
      }
      if (ctx.state !== "running") {
        const p = ctx.resume();
        if (p && p.catch) p.catch(() => {});
      }
      if (!initialized) _buildGraphStandalone();
      return initialized;
    } catch (_) {
      return false;
    }
  }

  function _buildGraphShared() {
    const hn = host.nodes;
    nodes.bgm = ctx.createGain();
    nodes.bgm.gain.value = active ? 1.0 : 0.0001;
    nodes.bgm.connect(hn.warm || hn.bgmGain);

    nodes.sfx = ctx.createGain();
    nodes.sfx.gain.value = 1.0;
    nodes.sfx.connect(hn.sfxGain);

    nodes.revGain = hn.revSend || null;
    noiseBuf = _makeSeamlessPinkNoise(ctx, 6);

    const ambSrc = ctx.createBufferSource();
    ambSrc.buffer = noiseBuf;
    ambSrc.loop = true;
    nodes.ambFilter = ctx.createBiquadFilter();
    nodes.ambFilter.type = "bandpass";
    nodes.ambFilter.frequency.value = 1200;
    nodes.ambGain = ctx.createGain();
    nodes.ambGain.gain.value = 0.0001;
    ambSrc.connect(nodes.ambFilter);
    nodes.ambFilter.connect(nodes.ambGain);
    nodes.ambGain.connect(nodes.bgm);
    ambSrc.start();

    initialized = true;
    if (active) _applyMoodAmbience();
  }

  function _buildGraphStandalone() {
    nodes.master = ctx.createGain();
    nodes.master.gain.value = muted ? 0.0001 : masterVol;
    nodes.comp = ctx.createDynamicsCompressor();
    nodes.comp.threshold.value = -14;
    nodes.comp.ratio.value = 3;
    nodes.lim = ctx.createDynamicsCompressor();
    nodes.lim.threshold.value = -3;
    nodes.lim.knee.value = 0;
    nodes.lim.ratio.value = 20;
    nodes.master.connect(nodes.comp);
    nodes.comp.connect(nodes.lim);
    nodes.lim.connect(ctx.destination);

    nodes.bgm = ctx.createGain();
    nodes.bgm.gain.value = bgmVol;
    nodes.bgm.connect(nodes.master);

    nodes.sfx = ctx.createGain();
    nodes.sfx.gain.value = sfxVol;
    nodes.sfx.connect(nodes.master);

    const len = Math.floor(ctx.sampleRate * 1.8);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
    nodes.rev = ctx.createConvolver();
    nodes.rev.buffer = ir;
    nodes.revGain = ctx.createGain();
    nodes.revGain.gain.value = 0.42;
    nodes.revGain.connect(nodes.rev);
    nodes.rev.connect(nodes.bgm);

    noiseBuf = _makeSeamlessPinkNoise(ctx, 6);

    const ambSrc = ctx.createBufferSource();
    ambSrc.buffer = noiseBuf;
    ambSrc.loop = true;
    nodes.ambFilter = ctx.createBiquadFilter();
    nodes.ambFilter.type = "bandpass";
    nodes.ambFilter.frequency.value = 1200;
    nodes.ambGain = ctx.createGain();
    nodes.ambGain.gain.value = 0.02;
    ambSrc.connect(nodes.ambFilter);
    nodes.ambFilter.connect(nodes.ambGain);
    nodes.ambGain.connect(nodes.bgm);
    ambSrc.start();

    initialized = true;
    applyVolumes();
  }

  function _applyMoodAmbience() {
    if (!initialized || !ctx || !nodes.ambFilter || !nodes.ambGain) return;
    const m = MOODS[activeMood] || MOODS.morning_soft;
    try {
      nodes.ambFilter.frequency.setTargetAtTime(m.ambFreq, ctx.currentTime, 0.4);
      nodes.ambGain.gain.setTargetAtTime(active ? m.ambVol : 0.0001, ctx.currentTime, 0.4);
    } catch (_) {}
  }

  function applyVolumes() {
    if (!initialized || !ctx) return;
    if (host) {
      host.applyVolumes();
      return;
    }
    const t = ctx.currentTime;
    try {
      nodes.master.gain.setTargetAtTime(muted ? 0.0001 : Math.max(0.0001, masterVol), t, 0.05);
      nodes.bgm.gain.setTargetAtTime(Math.max(0.0001, bgmVol), t, 0.05);
      nodes.sfx.gain.setTargetAtTime(Math.max(0.0001, sfxVol), t, 0.05);
    } catch (_) {}
    const btn = document.getElementById("btn-ch4-audio");
    if (btn) btn.textContent = muted ? "🔇" : "🔊";
  }

  function _tone({ t, f, type = "sine", att = 0.01, dec = 0.6, sus = 0.04, rel = 0.5, vol = 0.1, dest, sendRev = false, fm = null, lp = 0 }) {
    if (!initialized || !ctx) return;
    const end = t + att + dec + rel;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    if (fm) {
      const m = ctx.createOscillator();
      m.frequency.value = f * fm[0];
      const mg = ctx.createGain();
      mg.gain.setValueAtTime(f * fm[1], t);
      mg.gain.exponentialRampToValueAtTime(0.5, t + att + dec);
      m.connect(mg);
      mg.connect(osc.frequency);
      m.start(t);
      m.stop(end + 0.04);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + att);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * sus), t + att + dec);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    if (lp > 0) {
      const flt = ctx.createBiquadFilter();
      flt.type = "lowpass";
      flt.frequency.value = lp;
      osc.connect(flt);
      flt.connect(g);
    } else {
      osc.connect(g);
    }
    g.connect(dest || nodes.bgm);
    if (sendRev && nodes.revGain) {
      const sg = ctx.createGain();
      sg.gain.value = 0.35;
      g.connect(sg);
      sg.connect(nodes.revGain);
    }
    osc.start(t);
    osc.stop(end + 0.05);
  }

  function _scheduleBar(time) {
    const m = MOODS[activeMood] || MOODS.morning_soft;
    const beat = 60 / m.bpm;
    const barDur = beat * 4;
    const chord = m.prog[barIdx % m.prog.length];

    chord.forEach((nt, idx) => {
      _tone({
        t: time + idx * 0.035,
        f: noteHz(nt),
        type: "sine",
        att: 0.025,
        dec: barDur * 0.65,
        sus: 0.12,
        rel: 0.9,
        vol: idx === 0 ? 0.070 : 0.042,
        dest: nodes.bgm,
        sendRev: true,
        fm: [2.0, 0.55],
        lp: 2800
      });
    });

    [0, 1.5, 2.5, 3.25].forEach((bOff, k) => {
      const nt = m.mel[(barIdx * 3 + k) % m.mel.length];
      _tone({
        t: time + bOff * beat,
        f: noteHz(nt),
        type: "triangle",
        att: 0.012,
        dec: 0.55,
        sus: 0.08,
        rel: 0.55,
        vol: 0.048,
        dest: nodes.bgm,
        sendRev: true,
        lp: 3200
      });
    });

    barIdx++;
    return barDur;
  }

  setInterval(() => {
    if (!active || !initialized || !ctx || ctx.state !== "running" || _isMuted()) return;
    if (nextBarTime === null || nextBarTime < ctx.currentTime - 0.1) {
      nextBarTime = ctx.currentTime + 0.08;
    }
    let guard = 0;
    while (nextBarTime < ctx.currentTime + 1.1 && guard++ < 2) {
      nextBarTime += _scheduleBar(nextBarTime);
    }
  }, 160);

  if (!window.__CICAWW_UNIFIED__) {
    ["pointerdown", "keydown", "touchend"].forEach((ev) => {
      window.addEventListener(ev, () => { if (active) _ensureContext(); }, { passive: true, once: false });
    });
  }

  return {
    bindHostAudio(audioManager) {
      host = audioManager;
    },
    isActive() {
      return active;
    },
    setActive(on) {
      active = !!on;
      if (!active) {
        this.startPhoneVibrate(false);
        nextBarTime = null;
        if (initialized && ctx && nodes.bgm) {
          try {
            nodes.bgm.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
            if (nodes.ambGain) nodes.ambGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
          } catch (_) {}
        }
        if (host) {
          host._externalBgmActive = false;
          if (host.initialized && host.ctx && host.nodes.music) {
            try {
              host.nodes.music.gain.cancelScheduledValues(host.ctx.currentTime);
              host.nodes.music.gain.setTargetAtTime(1.0, host.ctx.currentTime + 0.15, 0.25);
            } catch (_) {}
          }
          host.applyVolumes();
        }
        return;
      }

      if (host) {
        host._externalBgmActive = true;
        host.setRainAudible(false);
        _ensureContext();
        if (host.initialized && host.ctx && host.nodes.music) {
          try {
            host.nodes.music.gain.cancelScheduledValues(host.ctx.currentTime);
            host.nodes.music.gain.setTargetAtTime(0.0001, host.ctx.currentTime, 0.08);
          } catch (_) {}
        }
      } else {
        _ensureContext();
      }
      barIdx = 0;
      nextBarTime = null;
      if (initialized && ctx && nodes.bgm) {
        try {
          nodes.bgm.gain.cancelScheduledValues(ctx.currentTime);
          nodes.bgm.gain.setTargetAtTime(host ? 1.0 : bgmVol, ctx.currentTime, 0.18);
        } catch (_) {}
      }
      _applyMoodAmbience();
    },
    initOnGesture() {
      _ensureContext();
    },
    toggleAmbience() {
      _ensureContext();
      if (host) {
        const m = host.toggleMute();
        return !m;
      }
      muted = !muted;
      applyVolumes();
      return !muted;
    },
    setVolumes({ master, bgm, sfx }) {
      if (master !== undefined) masterVol = master;
      if (bgm !== undefined) bgmVol = bgm;
      if (sfx !== undefined) sfxVol = sfx;
      applyVolumes();
    },
    setMood(moodKey) {
      if (!MOODS[moodKey]) return;
      activeMood = moodKey;
      barIdx = 0;
      nextBarTime = null;
      _applyMoodAmbience();
    },
    playClick() {
      if (host) { host.playClick(); return; }
      if (!_ensureContext() || _isMuted()) return;
      _tone({ t: ctx.currentTime + 0.005, f: noteHz("G5"), type: "triangle", att: 0.002, dec: 0.07, rel: 0.03, vol: 0.18, dest: nodes.sfx });
    },
    playBlip(who = "rizka") {
      const nowMs = performance.now();
      if (nowMs - lastBlipMs < 80) return;
      lastBlipMs = nowMs;
      if (!_ensureContext() || _isMuted()) return;
      const nt = who === "kael" ? "C4" : who === "nadine" ? "B4" : "A4";
      _tone({ t: ctx.currentTime + 0.004, f: noteHz(nt), type: "triangle", att: 0.004, dec: 0.055, rel: 0.025, vol: 0.075, dest: nodes.sfx, lp: 2600 });
    },
    playWarmChime() {
      if (host) { host.playWarmChime(); return; }
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      ["C5", "E5", "G5", "B5"].forEach((nt, i) => {
        _tone({ t: t + i * 0.08, f: noteHz(nt), type: "sine", att: 0.005, dec: 0.45, rel: 0.4, vol: 0.13, dest: nodes.sfx, sendRev: true });
      });
    },
    playMissionBanner(isFail = false) {
      if (isFail && window.__cicawwAudio) { try { window.__cicawwAudio.playMistake(false); return; } catch (_) {} }
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      const seq = isFail ? ["E4", "C4"] : ["F4", "C5", "E5"];
      seq.forEach((nt, i) => {
        _tone({ t: t + i * 0.10, f: noteHz(nt), type: "triangle", att: 0.006, dec: 0.35, rel: 0.3, vol: 0.13, dest: nodes.sfx, sendRev: true, lp: 3000 });
      });
    },
    playFootstep(running = false) {
      if (host) { host.playFootstep(running); return; }
      if (!initialized || !ctx || ctx.state !== "running" || _isMuted()) return;
      const t = ctx.currentTime + 0.005;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = running ? 720 : 520;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(running ? 0.09 : 0.06, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
      src.connect(f);
      f.connect(g);
      g.connect(nodes.sfx);
      src.start(t, Math.random() * 1.5);
      src.stop(t + 0.09);
    },
    startPhoneVibrate(enable) {
      clearInterval(ringTimer);
      ringTimer = null;
      if (!enable) return;
      const pulse = () => {
        if (!active || !_ensureContext() || _isMuted()) return;
        const t = ctx.currentTime + 0.01;
        _tone({ t, f: 145, type: "sine", att: 0.02, dec: 0.28, rel: 0.06, vol: 0.15, dest: nodes.sfx, lp: 900 });
        _tone({ t: t + 0.36, f: 145, type: "sine", att: 0.02, dec: 0.28, rel: 0.06, vol: 0.15, dest: nodes.sfx, lp: 900 });
      };
      pulse();
      ringTimer = setInterval(pulse, 1900);
    }
  };
})();
