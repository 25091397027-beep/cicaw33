/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   ORIGINAL ATMOSPHERIC & CINEMATIC WEB AUDIO MODULE (assets/chapter5/audio/ch5_audio.js)
   - Shares the single AudioContext of Cicaww33App.audio (zero duplicate
     AudioContext issues on Android/iOS, honors Mute & Master/BGM/SFX sliders)
   - 5 Original Chapter 5 Musical Moods + Scene Ambience:
     1. morning_apt   (Scene 1: Light, warm morning electric piano & breeze)
     2. school_event  (Scene 2: Cheerful, relaxed school acoustic pluck & yard)
     3. hall_active   (Scene 3: Focused, lively rhythmic pulse for Aula puzzle)
     4. quiet_space   (Scene 4: Soft, tender solo piano & afternoon stillness)
     5. dusk_walk     (Scene 5: Warm, memorable evening guitar/pad & crickets)
   - Dedicated SFX: footsteps, object pickup, paper/blueprint rustle, decoration
     placement, natural dialogue transitions, & warm ending chord.
============================================================================ */
"use strict";

window.Ch5Audio = (function () {
  const NOTE_IDX = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  const noteHz = (n) => {
    if (typeof n === "number") return n;
    const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
    return m ? 440 * Math.pow(2, ((+m[2] + 1) * 12 + NOTE_IDX[m[1]] - 69) / 12) : 440;
  };

  const MOODS = {
    morning_apt: {
      bpm: 86, ambFreq: 1750, ambVol: 0.016, wave: "triangle",
      prog: [["G3", "B3", "D4", "F#4"], ["C3", "E3", "G3", "B3"], ["A3", "C4", "E4", "G4"], ["D3", "F#3", "A3", "C4"]],
      mel: ["D5", "B4", "G4", "A4", "B4", "D5", "E5", "D5"]
    },
    school_event: {
      bpm: 96, ambFreq: 2100, ambVol: 0.020, wave: "triangle",
      prog: [["C3", "E3", "G3", "D4"], ["G3", "B3", "D4", "G4"], ["A3", "C4", "E4", "G4"], ["F3", "A3", "C4", "E4"]],
      mel: ["E5", "G5", "D5", "C5", "E5", "D5", "A4", "C5"]
    },
    hall_active: {
      bpm: 106, ambFreq: 1350, ambVol: 0.018, wave: "sine",
      prog: [["D3", "A3", "D4", "F4"], ["Bb2", "F3", "Bb3", "D4"], ["C3", "G3", "C4", "E4"], ["A2", "E3", "A3", "C#4"]],
      mel: ["F5", "E5", "D5", "A4", "D5", "E5", "F5", "G5"]
    },
    quiet_space: {
      bpm: 66, ambFreq: 920, ambVol: 0.014, wave: "sine",
      prog: [["F3", "A3", "C4", "E4"], ["D3", "F3", "A3", "C4"], ["Bb2", "D3", "F3", "A3"], ["C3", "E3", "G3", "Bb3"]],
      mel: ["A4", "C5", "G4", "F4", "E4", "F4", "D4", "C4"]
    },
    dusk_walk: {
      bpm: 78, ambFreq: 1520, ambVol: 0.022, wave: "triangle",
      prog: [["Eb3", "G3", "Bb3", "D4"], ["Ab2", "C3", "Eb3", "G3"], ["Fm" ? "F3" : "F3", "Ab3", "C4", "Eb4"], ["Bb2", "D3", "F3", "Ab3"]],
      mel: ["Bb4", "Eb5", "D5", "C5", "Bb4", "G4", "Ab4", "Bb4"]
    }
  };

  let host = null;
  let active = false;
  let ctx = null;
  let initialized = false;
  let activeMood = "morning_apt";
  let barIdx = 0;
  let nextBarTime = null;
  let nodes = {};
  let noiseBuf = null;
  let lastBlipMs = 0;
  let lastStepMs = 0;

  function _isMuted() {
    return host ? !!host.muted : false;
  }

  function _makeNoise(c, seconds) {
    // derau merah muda yang bisa di-loop TANPA sambungan terdengar (crossfade daya-sama ekor -> kepala)
    const sr = c.sampleRate, N = Math.floor(sr * seconds), X = Math.floor(sr * 0.5), M = N + X;
    const raw = new Float32Array(M);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < M; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.06;
      b1 = 0.985 * b1 + w * 0.12;
      b2 = 0.920 * b2 + w * 0.28;
      raw[i] = (b0 + b1 + b2 + w * 0.18) * 0.20;
    }
    const buf = c.createBuffer(1, N, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = raw[i];
    for (let i = 0; i < X; i++) {
      const ang = (i / X) * Math.PI / 2;
      d[i] = raw[i] * Math.sin(ang) + raw[N + i] * Math.cos(ang);
    }
    return buf;
  }

  function _ensureContext() {
    try {
      if (!host && window.__cicawwAudio) host = window.__cicawwAudio;
      if (host) {
        host.initOnGesture();
        if (!host.ctx || !host.initialized) return false;
        ctx = host.ctx;
        if (!initialized) {
          const hn = host.nodes;
          nodes.bgm = ctx.createGain();
          nodes.bgm.gain.value = active ? 1.0 : 0.0001;
          nodes.bgm.connect(hn.warm || hn.bgmGain);

          nodes.sfx = ctx.createGain();
          nodes.sfx.gain.value = 1.0;
          nodes.sfx.connect(hn.sfxGain);

          nodes.rev = hn.revSend || null;
          noiseBuf = _makeNoise(ctx, 4);

          const amb = ctx.createBufferSource();
          amb.buffer = noiseBuf;
          amb.loop = true;
          nodes.ambFilter = ctx.createBiquadFilter();
          nodes.ambFilter.type = "bandpass";
          nodes.ambFilter.frequency.value = 1500;
          nodes.ambGain = ctx.createGain();
          nodes.ambGain.gain.value = 0.0001;
          amb.connect(nodes.ambFilter);
          nodes.ambFilter.connect(nodes.ambGain);
          nodes.ambGain.connect(nodes.bgm);
          amb.start();

          initialized = true;
          if (active) _applyAmbience();
        }
        return initialized;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  function _applyAmbience() {
    if (!initialized || !ctx || !nodes.ambFilter || !nodes.ambGain) return;
    const m = MOODS[activeMood] || MOODS.morning_apt;
    try {
      nodes.ambFilter.frequency.setTargetAtTime(m.ambFreq, ctx.currentTime, 0.35);
      nodes.ambGain.gain.setTargetAtTime(active ? m.ambVol : 0.0001, ctx.currentTime, 0.35);
    } catch (_) {}
  }

  function _tone({ t, f, type = "sine", att = 0.01, dec = 0.5, sus = 0.05, rel = 0.4, vol = 0.08, dest, rev = false, lp = 0 }) {
    if (!initialized || !ctx) return;
    const end = t + att + dec + rel;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);

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
    if (rev && nodes.rev) {
      const sg = ctx.createGain();
      sg.gain.value = 0.30;
      g.connect(sg);
      sg.connect(nodes.rev);
    }
    osc.start(t);
    osc.stop(end + 0.03);
  }

  function _noiseHit({ t, dur = 0.12, freq = 1600, q = 1.2, vol = 0.08, dest }) {
    if (!initialized || !ctx || !noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.setValueAtTime(freq, t);
    flt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt);
    flt.connect(g);
    g.connect(dest || nodes.sfx);
    src.start(t, Math.random() * 2.0);
    src.stop(t + dur + 0.02);
  }

  function _scheduleBar(bt) {
    const m = MOODS[activeMood] || MOODS.morning_apt;
    const beat = 60 / m.bpm;
    const chord = m.prog[barIdx % m.prog.length];

    // Warm chord pad / electric piano voicing
    chord.forEach((n, idx) => {
      _tone({
        t: bt + idx * 0.045,
        f: noteHz(n),
        type: m.wave || "sine",
        att: 0.035,
        dec: beat * 2.2,
        sus: 0.22,
        rel: beat * 1.4,
        vol: idx === 0 ? 0.052 : 0.034,
        dest: nodes.bgm,
        rev: true,
        lp: activeMood === "quiet_space" ? 1300 : 2400
      });
    });

    // Rhythm pluck on active scenes (Scene 2 & Scene 3)
    if (activeMood === "school_event" || activeMood === "hall_active") {
      for (let s = 0; s < 4; s++) {
        const cn = chord[(s + barIdx) % chord.length];
        _tone({
          t: bt + s * beat + (s % 2 === 1 ? 0.01 : 0),
          f: noteHz(cn) * 2,
          type: "triangle",
          att: 0.006,
          dec: beat * 0.45,
          sus: 0.04,
          rel: 0.14,
          vol: activeMood === "hall_active" ? 0.032 : 0.024,
          dest: nodes.bgm,
          rev: true,
          lp: 2600
        });
      }
    }

    // Gentle melodic motif
    const m1 = m.mel[(barIdx * 2) % m.mel.length];
    const m2 = m.mel[(barIdx * 2 + 1) % m.mel.length];
    _tone({
      t: bt + beat * 0.5,
      f: noteHz(m1),
      type: "sine",
      att: 0.018,
      dec: beat * 1.1,
      sus: 0.08,
      rel: 0.45,
      vol: 0.038,
      dest: nodes.bgm,
      rev: true
    });
    if (barIdx % 2 === 0 || activeMood === "hall_active") {
      _tone({
        t: bt + beat * 2.5,
        f: noteHz(m2),
        type: "sine",
        att: 0.018,
        dec: beat * 1.2,
        sus: 0.08,
        rel: 0.50,
        vol: 0.034,
        dest: nodes.bgm,
        rev: true
      });
    }

    // Soft evening cricket shimmer in Scene 5
    if (activeMood === "dusk_walk" && barIdx % 2 === 1) {
      _tone({ t: bt + beat * 1.75, f: 3950, type: "sine", att: 0.02, dec: 0.09, sus: 0.02, rel: 0.08, vol: 0.007, dest: nodes.bgm });
      _tone({ t: bt + beat * 1.92, f: 4020, type: "sine", att: 0.02, dec: 0.09, sus: 0.02, rel: 0.08, vol: 0.006, dest: nodes.bgm });
    }

    barIdx++;
  }

  setInterval(() => {
    if (!active || !initialized || !ctx || ctx.state !== "running" || _isMuted()) return;
    const m = MOODS[activeMood] || MOODS.morning_apt;
    const barDur = (60 / m.bpm) * 4;
    if (nextBarTime === null || nextBarTime < ctx.currentTime - 0.3) {
      nextBarTime = ctx.currentTime + 0.06;
    }
    let g5 = 0;
    while (nextBarTime < ctx.currentTime + 1.2 && g5++ < 2) {
      _scheduleBar(nextBarTime);
      nextBarTime += barDur;
    }
  }, 160);

  return {
    bindHostAudio(hostAudio) {
      host = hostAudio;
    },
    setActive(on) {
      active = !!on;
      if (host) host._externalBgmActive = active;
      if (active) _ensureContext();
      if (initialized && ctx && nodes.bgm) {
        const now = ctx.currentTime;
        try {
          nodes.bgm.gain.cancelScheduledValues(now);
          nodes.bgm.gain.setTargetAtTime(active ? 1.0 : 0.0001, now, 0.14);
          if (nodes.ambGain) {
            const m = MOODS[activeMood] || MOODS.morning_apt;
            nodes.ambGain.gain.setTargetAtTime(active ? m.ambVol : 0.0001, now, 0.2);
          }
        } catch (_) {}
      }
      if (active) {
        barIdx = 0;
        nextBarTime = null;
      }
    },
    setMood(moodId) {
      if (!MOODS[moodId]) return;
      activeMood = moodId;
      barIdx = 0;
      nextBarTime = null;
      _applyAmbience();
    },
    playFootstep(surface = "wood") {
      if (!_ensureContext() || _isMuted()) return;
      const nowMs = performance.now();
      if (nowMs - lastStepMs < 240) return;
      lastStepMs = nowMs;
      const t = ctx.currentTime + 0.005;
      const fMap = { tile: 1450, wood: 920, hall: 780, street: 1850 };
      _noiseHit({ t, dur: 0.055, freq: fMap[surface] || 1100, q: 1.8, vol: 0.055, dest: nodes.sfx });
      _tone({ t, f: surface === "wood" || surface === "hall" ? 115 : 150, type: "sine", att: 0.003, dec: 0.045, sus: 0.01, rel: 0.03, vol: 0.045, dest: nodes.sfx });
    },
    playPickup() {
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      ["G4", "D5", "G5"].forEach((n, i) => {
        _tone({ t: t + i * 0.055, f: noteHz(n), type: "triangle", att: 0.006, dec: 0.22, sus: 0.05, rel: 0.18, vol: 0.09, dest: nodes.sfx, rev: true });
      });
    },
    playPaperRustle() {
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      _noiseHit({ t, dur: 0.14, freq: 2600, q: 0.9, vol: 0.09, dest: nodes.sfx });
      _noiseHit({ t: t + 0.07, dur: 0.11, freq: 3200, q: 1.1, vol: 0.07, dest: nodes.sfx });
    },
    playDecorPlace(ok = true) {
      if (!ok && host && host.playMistake) {
        host.playMistake(false);
        return;
      }
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      _noiseHit({ t, dur: 0.08, freq: 1900, q: 1.2, vol: 0.06, dest: nodes.sfx });
      ["E4", "B4", "E5"].forEach((n, i) => {
        _tone({ t: t + i * 0.06, f: noteHz(n), type: "sine", att: 0.008, dec: 0.28, sus: 0.06, rel: 0.22, vol: 0.085, dest: nodes.sfx, rev: true });
      });
    },
    playBlip(speaker) {
      if (!_ensureContext() || _isMuted()) return;
      const nowMs = performance.now();
      if (nowMs - lastBlipMs < 62) return;
      lastBlipMs = nowMs;
      const base = speaker === "Kael" ? 285 : speaker === "Bu Mira" ? 345 : speaker === "Sena" ? 310 : 415;
      _tone({ t: ctx.currentTime + 0.004, f: base + (Math.random() - 0.5) * 18, type: "sine", att: 0.004, dec: 0.04, sus: 0.01, rel: 0.025, vol: 0.032, dest: nodes.sfx });
    },
    playClick() {
      if (host && host.playClick) { host.playClick(); return; }
      if (!_ensureContext() || _isMuted()) return;
      _tone({ t: ctx.currentTime + 0.005, f: 660, type: "triangle", att: 0.003, dec: 0.05, sus: 0.01, rel: 0.03, vol: 0.06, dest: nodes.sfx });
    },
    playWarmChime() {
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.01;
      ["F4", "A4", "C5", "G5"].forEach((n, i) => {
        _tone({ t: t + i * 0.075, f: noteHz(n), type: "sine", att: 0.01, dec: 0.45, sus: 0.08, rel: 0.35, vol: 0.08, dest: nodes.sfx, rev: true });
      });
    },
    playEndingChord() {
      if (!_ensureContext() || _isMuted()) return;
      const t = ctx.currentTime + 0.02;
      ["Eb3", "Bb3", "Eb4", "G4", "Bb4", "F5"].forEach((n, i) => {
        _tone({ t: t + i * 0.09, f: noteHz(n), type: "triangle", att: 0.03, dec: 1.4, sus: 0.18, rel: 1.2, vol: 0.075, dest: nodes.sfx, rev: true, lp: 2400 });
      });
    }
  };
})();
