/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   MODUL TEKSTUR PROSEDURAL ULTRA-HD ADAPTIF (assets/textures/ch4_textures.js)
   - Resolusi adaptif (2048px pada High, 1024px pada Medium, 512px pada Low)
   - Caching terpusat & fungsi dispose() untuk efisiensi memori GPU
   - Mencakup tekstur serat rambut, kain seragam/rajut, plester wainscoting,
     lantai kayu/teraso + bump map, langit panorama, papan kelas, & layar HP
============================================================================ */
"use strict";

window.Ch4Textures = (function () {
  const _cache = {};
  let _quality = "high";
  let _maxAniso = 8;

  function setQuality(q, renderer) {
    _quality = q || "high";
    if (renderer && renderer.capabilities) {
      const cap = renderer.capabilities.getMaxAnisotropy() || 4;
      _maxAniso = _quality === "low" ? 2 : _quality === "medium" ? Math.min(4, cap) : Math.min(16, cap);
    }
  }

  function _res(base) {
    if (_quality === "low") return Math.max(256, base >> 2);
    if (_quality === "medium") return Math.max(512, base >> 1);
    return base;
  }

  function _make(key, w, h, drawFn, opts = {}) {
    const fullKey = `${key}_${w}x${h}`;
    if (_cache[fullKey]) return _cache[fullKey];
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    drawFn(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = opts.anisotropy || _maxAniso;
    if (opts.repeatX || opts.repeatY) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(opts.repeatX || 1, opts.repeatY || 1);
    }
    if (opts.noMipmaps) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
    }
    tex.needsUpdate = true;
    _cache[fullKey] = tex;
    return tex;
  }

  function _rng(seedInit) {
    let s = seedInit || 137;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // 1. Serat helai rambut longitudinal halus (searah UV.x TubeGeometry agar tidak belang melingkar!)
  function getHairStrandBump() {
    const S = 512;
    return _make("hair_strand_bump_v2", S, S, (ctx, W, H) => {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, W, H);
      const rnd = _rng(311);
      for (let i = 0; i < 140; i++) {
        const y = rnd() * H;
        const h = 1.5 + rnd() * 4.5;
        const v = rnd() > 0.5 ? 168 + Math.floor(rnd() * 36) : 64 + Math.floor(rnd() * 36);
        ctx.fillStyle = `rgba(${v},${v},${v},0.22)`;
        ctx.fillRect(0, y, W, h);
      }
    }, { repeatX: 1, repeatY: 3 });
  }

  // 2. Tartan Rok Akademi Cicaww33 (1024px crisp diagonal twill + ice-blue & gold threads)
  function getAcademyTartan() {
    const S = Math.max(512, _res(1024));
    return _make("academy_tartan", S, S, (ctx, W, H) => {
      ctx.fillStyle = "#263650";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.028)";
      for (let i = -W; i < W * 2; i += 8) ctx.fillRect(i, 0, 3, H);

      const step = W / 8;
      ctx.fillStyle = "rgba(122, 156, 196, 0.30)";
      for (let p = 0; p < W; p += step) {
        ctx.fillRect(p, 0, step * 0.20, H);
        ctx.fillRect(0, p, W, step * 0.20);
      }
      ctx.fillStyle = "rgba(186, 216, 248, 0.48)";
      for (let p = step * 0.5; p < W; p += step) {
        ctx.fillRect(p, 0, Math.max(2, step * 0.04), H);
        ctx.fillRect(0, p, W, Math.max(2, step * 0.04));
      }
      ctx.fillStyle = "rgba(244, 197, 122, 0.36)";
      for (let p = step * 0.58; p < W; p += step) {
        ctx.fillRect(p, 0, Math.max(1.5, step * 0.025), H);
        ctx.fillRect(0, p, W, Math.max(1.5, step * 0.025));
      }
      ctx.fillStyle = "rgba(192, 220, 250, 0.58)";
      ctx.fillRect(0, H - Math.floor(H * 0.045), W, Math.max(3, Math.floor(H * 0.009)));
    }, { repeatX: 2, repeatY: 1 });
  }

  // 3. Rajut Vest / Cardigan Halus (untuk Nadine & Cardigan Rizka)
  function getCableKnit(baseHex = "#eae0d0", shadowRgba = "rgba(155,134,112,0.25)") {
    const S = Math.max(512, _res(1024));
    return _make(`knit_${baseHex}`, S, S, (ctx, W, H) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const colW = W / 16;
      for (let x = 0; x < W; x += colW) {
        const g = ctx.createLinearGradient(x, 0, x + colW, 0);
        g.addColorStop(0, shadowRgba);
        g.addColorStop(0.5, "rgba(255,255,255,0.18)");
        g.addColorStop(1, shadowRgba);
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, colW, H);

        ctx.strokeStyle = "rgba(255,252,246,0.48)";
        ctx.lineWidth = Math.max(1.5, colW * 0.05);
        const stepY = H / 36;
        for (let y = 0; y < H; y += stepY) {
          ctx.beginPath();
          ctx.moveTo(x + colW * 0.18, y + stepY * 0.2);
          ctx.quadraticCurveTo(x + colW * 0.5, y + stepY * 0.85, x + colW * 0.82, y + stepY * 0.2);
          ctx.stroke();
        }
      }
    }, { repeatX: 3, repeatY: 3 });
  }

  // 4. Micro-weave kain blazer / celana sekolah (subtle bump agar kain tidak seperti plastik)
  function getClothWeaveBump() {
    const S = 256;
    return _make("cloth_weave_bump", S, S, (ctx, W, H) => {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let x = 0; x < W; x += 4) ctx.fillRect(x, 0, 1.5, H);
    }, { repeatX: 12, repeatY: 12 });
  }

  // 5. Dinding Plester & Wainscoting Arsitektural 2K
  function getPlasterWall(baseHex = "#efe8dc", wainscotHex = "#d8cebe", repeatX = 4, repeatY = 1) {
    const S = _res(2048);
    return _make(`plaster_${baseHex}_${wainscotHex}_${repeatX}`, S, S, (ctx, W, H) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const rnd = _rng(701);
      for (let i = 0; i < 6500; i++) {
        ctx.fillStyle = i % 2 === 0 ? "rgba(255,252,246,0.045)" : "rgba(42,36,30,0.035)";
        ctx.fillRect(rnd() * W, rnd() * H, 4 + rnd() * 14, 3 + rnd() * 12);
      }
      if (wainscotHex) {
        const wy = Math.floor(H * 0.68);
        ctx.fillStyle = wainscotHex;
        ctx.fillRect(0, wy, W, H - wy);
        ctx.fillStyle = "rgba(58, 46, 36, 0.28)";
        ctx.fillRect(0, wy - Math.floor(H * 0.006), W, Math.floor(H * 0.010));
        ctx.fillStyle = "rgba(255, 250, 244, 0.45)";
        ctx.fillRect(0, wy - Math.floor(H * 0.009), W, Math.floor(H * 0.003));

        const panW = W / 8;
        ctx.strokeStyle = "rgba(52, 42, 34, 0.16)";
        ctx.lineWidth = Math.max(2, W * 0.002);
        for (let x = 0; x < W; x += panW) {
          ctx.strokeRect(x + panW * 0.08, wy + H * 0.03, panW * 0.84, (H - wy) * 0.80);
        }
      }
    }, { repeatX, repeatY });
  }

  // 6. Lantai Parket Kayu Sekolah / Kelas 2K + Bump Map
  function getHardwoodFloor(baseHex = "#ba9872", darkHex = "#967452", repeatX = 4, repeatY = 6) {
    const S = _res(2048);
    const diffuse = _make(`wood_${baseHex}_${repeatX}x${repeatY}`, S, S, (ctx, W, H) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const rows = 12, rh = H / rows;
      const rnd = _rng(409);
      for (let r = 0; r < rows; r++) {
        const y = r * rh;
        const off = (r % 2) * (W * 0.25) + ((r * 73) % 90);
        for (let seg = -1; seg < 4; seg++) {
          const x0 = seg * (W * 0.333) + off;
          const pw = W * 0.333;
          ctx.fillStyle = (r + seg) % 3 === 0 ? darkHex : baseHex;
          ctx.fillRect(x0, y + 1, pw - 2, rh - 2);
          const dv = (rnd() - 0.5) * 16;
          ctx.fillStyle = dv >= 0 ? `rgba(255,242,222,${dv / 110})` : `rgba(42,26,14,${-dv / 110})`;
          ctx.fillRect(x0, y + 1, pw - 2, rh - 2);

          ctx.strokeStyle = "rgba(58, 36, 20, 0.13)";
          ctx.lineWidth = Math.max(1.2, H * 0.0012);
          for (let g = 0; g < 5; g++) {
            const gy = y + rh * (0.14 + g * 0.18);
            ctx.beginPath();
            ctx.moveTo(x0, gy);
            ctx.bezierCurveTo(x0 + pw * 0.33, gy + (rnd() - 0.5) * 10, x0 + pw * 0.66, gy + (rnd() - 0.5) * 10, x0 + pw, gy);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(42, 28, 16, 0.36)";
          ctx.fillRect(x0, y, Math.max(2, W * 0.0016), rh);
        }
        ctx.fillStyle = "rgba(42, 28, 16, 0.36)";
        ctx.fillRect(0, y, W, Math.max(2, H * 0.0016));
      }
    }, { repeatX, repeatY });

    const bump = _make(`wood_bump_${repeatX}x${repeatY}`, 512, 512, (ctx, W, H) => {
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(0, 0, W, H);
      const rows = 12, rh = H / rows;
      ctx.fillStyle = "#303030";
      for (let r = 0; r < rows; r++) {
        ctx.fillRect(0, r * rh, W, 2);
        const off = (r % 2) * (W * 0.25);
        for (let seg = 0; seg < 4; seg++) ctx.fillRect((seg * (W * 0.333) + off) % W, r * rh, 2, rh);
      }
    }, { repeatX, repeatY });

    return { map: diffuse, bumpMap: bump };
  }

  // 7. Lantai Teraso Apartemen Malam 2K + Bump Map
  function getTerrazzoFloor(baseHex = "#3d4659", tileAlt = "#454f63", repeatX = 3, repeatY = 8) {
    const S = _res(2048);
    const map = _make(`terrazzo_${baseHex}_${repeatX}x${repeatY}`, S, S, (ctx, W, H) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const cells = 4, cw = W / cells;
      const rnd = _rng(919);
      for (let gy = 0; gy < cells; gy++) {
        for (let gx = 0; gx < cells; gx++) {
          ctx.fillStyle = (gx + gy) % 2 === 0 ? tileAlt : baseHex;
          ctx.fillRect(gx * cw + 3, gy * cw + 3, cw - 6, cw - 6);
        }
      }
      const chips = ["rgba(255,248,236,0.18)", "rgba(155,188,224,0.16)", "rgba(244,197,122,0.14)", "rgba(20,26,38,0.22)"];
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = chips[i % chips.length];
        ctx.beginPath();
        ctx.ellipse(rnd() * W, rnd() * H, 2 + rnd() * 5, 1.5 + rnd() * 4, rnd() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(18, 24, 36, 0.48)";
      ctx.lineWidth = Math.max(2, W * 0.002);
      for (let i = 0; i <= cells; i++) {
        ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cw); ctx.lineTo(W, i * cw); ctx.stroke();
      }
    }, { repeatX, repeatY });
    return map;
  }

  // 8. Beton Dek Rooftop & Parapet 2K
  function getRooftopConcrete(baseHex = "#626a7c", repeatX = 5, repeatY = 4) {
    const S = _res(1024);
    return _make(`rooftop_conc_${baseHex}_${repeatX}`, S, S, (ctx, W, H) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, W, H);
      const rnd = _rng(523);
      for (let i = 0; i < 3600; i++) {
        ctx.fillStyle = i % 2 === 0 ? "rgba(255,244,230,0.045)" : "rgba(24,28,38,0.065)";
        ctx.fillRect(rnd() * W, rnd() * H, 3 + rnd() * 12, 3 + rnd() * 12);
      }
      const step = W / 4;
      ctx.strokeStyle = "rgba(28, 34, 46, 0.34)";
      ctx.lineWidth = 3;
      for (let p = 0; p <= W; p += step) {
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke();
      }
    }, { repeatX, repeatY });
  }

  // 9. Plat Nomor Unit Apartemen (301 Kael & 302 Rizka)
  function getDoorPlate(unitNumber, residentTag) {
    return _make(`plate_${unitNumber}`, 512, 256, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1d2738");
      g.addColorStop(1, "#2c3a52");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#f4c57a";
      ctx.lineWidth = 10;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.strokeStyle = "rgba(244,197,122,0.35)";
      ctx.lineWidth = 3;
      ctx.strokeRect(28, 28, W - 56, H - 56);
      ctx.fillStyle = "#fff8ee";
      ctx.font = "bold 98px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(unitNumber, W / 2, 138);
      ctx.fillStyle = "#f4c57a";
      ctx.font = "600 32px Inter, sans-serif";
      ctx.fillText(residentTag, W / 2, 198);
    });
  }

  // 10. Layar Smartphone Rizka ("Ayah" Incoming Call / Ended Call)
  function getPhoneScreen(state = "ringing") {
    return _make(`phone_screen_${state}`, 512, 1024, (ctx, W, H) => {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, state === "ringing" ? "#1e3050" : "#141e33");
      grad.addColorStop(1, "#0b1120");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,248,238,0.7)";
      ctx.font = "500 24px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("20:42", W / 2, 68);

      ctx.fillStyle = state === "ringing" ? "#9bbce0" : "#f4c57a";
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillText(state === "ringing" ? "PANGGILAN MASUK" : "PANGGILAN BERAKHIR • 01:14", W / 2, 195);

      ctx.beginPath();
      ctx.arc(W / 2, 375, 92, 0, Math.PI * 2);
      ctx.fillStyle = "#283956";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#f4c57a";
      ctx.stroke();

      ctx.fillStyle = "#fff8ee";
      ctx.font = "bold 88px Georgia, serif";
      ctx.fillText("A", W / 2, 405);
      ctx.font = "bold 62px Georgia, serif";
      ctx.fillText("Ayah", W / 2, 555);

      if (state === "ringing") {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(W * 0.28, 810, 48, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.beginPath(); ctx.arc(W * 0.72, 810, 48, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255,248,238,0.12)";
        ctx.fillRect(42, 635, W - 84, 170);
        ctx.strokeStyle = "rgba(244,197,122,0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(42, 635, W - 84, 170);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "24px Inter, sans-serif";
        ctx.fillText("“Jangan sampai nilaimu turun.", W / 2, 698);
        ctx.fillText("Ayah tidak mau dengar alasan.”", W / 2, 742);
      }
    });
  }

  // 11. Papan Pengumuman Gabus & Papan Tulis Kelas 11-A
  function getNoticeboardTexture() {
    return _make("ch4_cork_board", 1024, 640, (ctx, W, H) => {
      ctx.fillStyle = "#b48758";
      ctx.fillRect(0, 0, W, H);
      const rnd = _rng(211);
      for (let i = 0; i < 1600; i++) {
        ctx.fillStyle = i % 2 ? "rgba(116,74,38,0.18)" : "rgba(238,200,154,0.16)";
        ctx.fillRect(rnd() * W, rnd() * H, 6, 5);
      }
      const notes = [
        [48, 48, 410, 520, "#fffaf0", "#e5b857"],
        [496, 54, 230, 250, "#e8f3ff", "#6aa0d8"],
        [756, 62, 214, 240, "#fff0f3", "#e48b9c"],
        [508, 338, 456, 236, "#f7f3e6", "#7ab896"]
      ];
      notes.forEach(([x, y, w, h, bg, pin]) => {
        ctx.fillStyle = "rgba(28,18,10,0.22)";
        ctx.fillRect(x + 6, y + 8, w, h);
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = pin;
        ctx.beginPath(); ctx.arc(x + w * 0.5, y + 18, 9, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "#233047";
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.fillText("PERINGKAT AKADEMIK XI", 82, 108);
      ctx.fillStyle = "rgba(244,197,122,0.48)";
      ctx.fillRect(72, 130, 362, 42);
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 23px Inter, sans-serif";
      ctx.fillText("1. Rizka Alifia Putri   98.8", 84, 159);
      ctx.fillStyle = "#475569";
      for (let r = 0; r < 7; r++) {
        ctx.fillRect(84, 198 + r * 42, 240, 11);
        ctx.fillRect(356, 198 + r * 42, 54, 11);
      }
      ctx.fillStyle = "#233047";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText("JADWAL PIKET & KOMITE 11-A", 534, 388);
      ctx.font = "19px Inter, sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText("• Koordinator Catatan: Nadine & Rizka", 534, 432);
      ctx.fillText("• Pengumpulan Lembar Presensi Sore", 534, 468);
    });
  }

  function getChalkboardTexture() {
    return _make("ch4_chalkboard", 1024, 512, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#1f4235");
      g.addColorStop(0.6, "#254d3e");
      g.addColorStop(1, "#1c3b2f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Subtle chalk dust smudge
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.beginPath(); ctx.ellipse(480, 250, 320, 140, -0.1, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "rgba(255, 250, 240, 0.88)";
      ctx.font = "bold 30px Georgia, serif";
      ctx.fillText("Sastra & Puisi Modern — Kelas 11-A", 64, 82);
      ctx.strokeStyle = "rgba(244, 197, 122, 0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(64, 98); ctx.lineTo(610, 98); ctx.stroke();

      ctx.fillStyle = "rgba(255, 252, 246, 0.78)";
      ctx.font = "italic 23px Georgia, serif";
      ctx.fillText("“Jarak tidak selalu diukur oleh langkah kaki,", 74, 162);
      ctx.fillText("melainkan oleh hal-hal yang berani kita jujurkan.”", 74, 202);

      ctx.font = "20px Inter, sans-serif";
      ctx.fillStyle = "rgba(190, 226, 255, 0.78)";
      ctx.fillText("Tugas Kelompok: Catatan Refleksi (Kumpulkan Jumat)", 74, 286);
      ctx.fillStyle = "rgba(255, 248, 238, 0.70)";
      ctx.fillText("Piket Hari Ini: Rizka • Kael • Nadine", 74, 342);
    });
  }

  // 12. Sky Panorama Vista (Night City, Morning Clear, Overcast Afternoon, Golden Hour Sunset)
  function getSkyVista(mode = "morning") {
    const W = _res(2048), H = _res(1024);
    return _make(`sky_vista_${mode}`, W, H, (ctx, w, h) => {
      const pals = {
        night:    ["#090e1c", "#121d36", "#1d2d4f", "#2b3d5e"],
        morning:  ["#5f92cb", "#92bee6", "#dfdecb", "#fff2d6"],
        overcast: ["#47566b", "#64758c", "#8998ab", "#b4bec9"],
        sunset:   ["#241f42", "#693b63", "#d46f57", "#ffbe7b"]
      };
      const pal = pals[mode] || pals.morning;
      const g = ctx.createLinearGradient(0, 0, 0, h * 0.78);
      g.addColorStop(0.0, pal[0]);
      g.addColorStop(0.36, pal[1]);
      g.addColorStop(0.72, pal[2]);
      g.addColorStop(1.0, pal[3]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Stars at night or twilight
      if (mode === "night" || mode === "sunset") {
        const rnd = _rng(88);
        const count = mode === "night" ? 220 : 65;
        for (let i = 0; i < count; i++) {
          ctx.fillStyle = `rgba(255,250,240,${(0.25 + rnd() * 0.65) * (mode === "sunset" ? 0.55 : 1)})`;
          ctx.fillRect(rnd() * w, rnd() * h * 0.42, 2.2, 2.2);
        }
      }

      // Sun glow for sunset / morning
      if (mode === "sunset") {
        const sg = ctx.createRadialGradient(w * 0.34, h * 0.66, 12, w * 0.34, h * 0.66, w * 0.24);
        sg.addColorStop(0, "rgba(255, 248, 225, 0.96)");
        sg.addColorStop(0.22, "rgba(255, 198, 122, 0.72)");
        sg.addColorStop(0.6, "rgba(238, 118, 86, 0.28)");
        sg.addColorStop(1, "rgba(238, 118, 86, 0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, w, h);
      }

      // Painterly Anime Clouds
      const cloudCol =
        mode === "night" ? "rgba(62, 84, 122, 0.22)" :
        mode === "overcast" ? "rgba(218, 226, 236, 0.44)" :
        mode === "sunset" ? "rgba(255, 196, 146, 0.44)" :
        "rgba(255, 252, 246, 0.58)";
      ctx.fillStyle = cloudCol;
      for (let i = 0; i < 22; i++) {
        const cx = (i * 173) % w;
        const cy = h * (0.22 + (i % 5) * 0.09);
        const rw = w * (0.055 + (i % 4) * 0.022);
        const rh = h * (0.024 + (i % 3) * 0.014);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + rw * 0.48, cy + rh * 0.2, rw * 0.72, rh * 0.82, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - rw * 0.44, cy + rh * 0.25, rw * 0.66, rh * 0.76, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant Anime City Skyline Silhouette
      const silCol =
        mode === "night" ? "#0b1324" :
        mode === "sunset" ? "#34263d" :
        mode === "overcast" ? "#5c6c80" : "#8098b4";
      ctx.fillStyle = silCol;
      const horizonY = h * 0.76;
      ctx.fillRect(0, horizonY, w, h - horizonY);
      const rndB = _rng(613);
      const bCount = 42;
      for (let i = 0; i < bCount; i++) {
        const bx = i * (w / bCount);
        const bw = (w / bCount) * 0.90;
        const bh = h * (0.04 + rndB() * 0.14);
        ctx.fillStyle = silCol;
        ctx.fillRect(bx, horizonY - bh, bw, bh + 12);
        if (mode === "night" || mode === "sunset") {
          for (let wy = horizonY - bh + 10; wy < horizonY - 12; wy += 16) {
            for (let wx = bx + 6; wx < bx + bw - 8; wx += 12) {
              if (rndB() > 0.46) {
                ctx.fillStyle = mode === "night" ? "rgba(255, 214, 142, 0.68)" : "rgba(255, 216, 152, 0.42)";
                ctx.fillRect(wx, wy, 6, 8);
              }
            }
          }
        }
      }
    });
  }

  // 13. Soft Glow / Dust Sprite Texture (membuat partikel debu bulat lembut, bukan kotak!)
  function getSoftParticleSprite() {
    return _make("soft_particle_sprite", 64, 64, (ctx, W, H) => {
      const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, "rgba(255, 252, 244, 1.0)");
      g.addColorStop(0.4, "rgba(255, 242, 214, 0.55)");
      g.addColorStop(1, "rgba(255, 242, 214, 0.0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }, { noMipmaps: true });
  }

  function disposeUnused() {
    // Disposes non-persistent textures if needed during quality reset
    Object.keys(_cache).forEach((k) => {
      if (_cache[k] && _cache[k].dispose) _cache[k].dispose();
      delete _cache[k];
    });
  }

  return {
    setQuality,
    getHairStrandBump,
    getAcademyTartan,
    getCableKnit,
    getClothWeaveBump,
    getPlasterWall,
    getHardwoodFloor,
    getTerrazzoFloor,
    getRooftopConcrete,
    getDoorPlate,
    getPhoneScreen,
    getNoticeboardTexture,
    getChalkboardTexture,
    getSkyVista,
    getSoftParticleSprite,
    disposeUnused
  };
})();
