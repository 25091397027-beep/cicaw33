/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   CORE ANATOMI ANIME 3D & POTRET EKSPRESI VEKTOR
   (assets/characters/ch4_character_core.js)
   - Geometri kepala anime 72x56 segmen dengan hidung 3D terintegrasi,
     telinga halus, & normal wajah terhaluskan (velvety anime shading).
   - Mata berlian 1024x1024 + kontrol arah tatapan (gaze offset) + bulu mata 3D
     + kelopak kedip & lengkung senyum mata (happy crescent).
   - Mulut 8 Morph Targets mulus (smile, awkward, shy, holdBack, sad, worried,
     pout/jealous, happy/talk) + lip-sync dialog real-time.
   - Tangan anime 10 jari berartikulasi (dapat menggenggam ponsel/buku/minuman).
   - Potret SVG ekspresif konsisten untuk Rizka, Kael, Nadine, dan Ayah.
============================================================================ */
"use strict";

window.Ch4CharacterCore = (function () {
  const _cache = {};
  function cached(k, fn) {
    if (!_cache[k]) _cache[k] = fn();
    return _cache[k];
  }

  // Kontur Z permukaan wajah untuk menempelkan mata, alis, pipi, dan mulut tanpa celah
  function surfaceZAtFace(x, y, R, female) {
    const lat = female ? 0.93 : 0.91;
    const u = x / (R * lat);
    const v = y / R;
    let z = Math.sqrt(Math.max(0.04, 1 - u * u * 0.92 - v * v * 0.86)) * R;
    if (y < 0) {
      const t = Math.min(1, -y / R);
      z *= 1.0 - t * (female ? 0.10 : 0.07);
    }
    if (z > R * 0.34) {
      z = R * 0.34 + (z - R * 0.34) * (female ? 0.80 : 0.83);
    }
    return z;
  }

  // 1. Geometri Kepala Anime High-Detail (72x56) + Hidung Sculpted + Normal Spherized
  function buildHeroHeadGeometry(R, female) {
    const geo = new THREE.SphereGeometry(R, 72, 56);
    const pos = geo.attributes.position;
    const lat = female ? 0.93 : 0.91;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) * lat;
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (y < 0) {
        const t = Math.min(1, -y / R);
        const jawNarrow = female
          ? 1.0 - 0.28 * Math.pow(t, 1.32) - 0.24 * Math.pow(t, 2.4)
          : 1.0 - 0.25 * Math.pow(t, 1.30) - 0.27 * Math.pow(t, 2.5);
        x *= jawNarrow;
        if (z > 0) {
          z *= 1.0 - t * (female ? 0.10 : 0.07);
          if (female && t > 0.14 && t < 0.56) {
            const cheek = Math.sin(((t - 0.14) / 0.42) * Math.PI) * Math.exp(-Math.pow((Math.abs(x) / (R * lat) - 0.44) * 3.0, 2));
            z += cheek * R * 0.038;
          }
        } else {
          z *= 1.0 - t * 0.34;
        }
        y *= female ? 1.05 : 1.09;
      } else {
        const t = Math.min(1, y / R);
        y *= 1.03;
        x *= 1.0 - t * 0.055;
      }

      if (z > R * 0.34) {
        z = R * 0.34 + (z - R * 0.34) * (female ? 0.80 : 0.83);
      }

      // Hidung 3D terintegrasi tanpa jahitan (zero-seam nose bridge & tip)
      if (z > R * 0.55) {
        const nx = x / (R * (female ? 0.102 : 0.118));
        const ny = (y - (-R * 0.22)) / (R * 0.23);
        if (Math.abs(nx) < 1.3 && ny > -0.85 && ny < 1.38) {
          const horiz = Math.exp(-nx * nx * 2.55);
          const tipPeak = Math.exp(-ny * ny * 3.85);
          const bridge = ny > 0 ? Math.exp(-Math.pow((ny - 0.46) * 1.55, 2)) * 0.54 : 0;
          const underCut = ny < -0.15 ? Math.max(0, 1 + (ny + 0.15) * 2.25) : 1;
          const prom = (tipPeak * 0.86 + bridge * 0.46) * horiz * underCut;
          z += prom * R * (female ? 0.125 : 0.154);
        }
      }
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();

    // Spherized Anime Face Normals agar cahaya wajah lembut seperti ilustrasi anime premium
    const nrm = geo.attributes.normal;
    const vTmp = new THREE.Vector3();
    const sTmp = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      if (z > R * 0.20) {
        const blend = Math.min(0.65, ((z / R - 0.20) / 0.65) * 0.65);
        vTmp.set(nrm.getX(i), nrm.getY(i), nrm.getZ(i)).normalize();
        sTmp.set(pos.getX(i) * 0.70, pos.getY(i) * 0.54 + R * 0.06, pos.getZ(i) + R * 0.40).normalize();
        vTmp.lerp(sTmp, blend).normalize();
        nrm.setXYZ(i, vTmp.x, vTmp.y, vTmp.z);
      }
    }
    nrm.needsUpdate = true;
    return geo;
  }

  // Telinga Anime Halus + Anting Opsional
  function buildAnimeEars(R, female, skinMat, withPearlStuds = false) {
    const grp = new THREE.Group();
    const pearlMat = withPearlStuds
      ? new THREE.MeshStandardMaterial({ color: 0xfafcff, roughness: 0.16, metalness: 0.25 })
      : null;
    [-1, 1].forEach((s) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(R * 0.165, 14, 12), skinMat);
      ear.scale.set(0.42, 1.18, 0.72);
      ear.position.set(s * R * (female ? 0.88 : 0.87), -R * 0.08, -R * 0.05);
      ear.rotation.set(0.08, s * 0.28, s * -0.10);
      ear.userData.noOutline = true;
      grp.add(ear);
      if (pearlMat) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.0042, 10, 8), pearlMat);
        stud.position.set(s * R * 0.90, -R * 0.21, -R * 0.02);
        stud.userData.noOutline = true;
        grp.add(stud);
      }
    });
    return grp;
  }

  // 2. Tekstur Kulit Wajah 1024x1024
  function createFaceSkinTexture(cfg) {
    return cached("face_skin_1k_" + cfg.id, () => {
      const S = 1024;
      const c = document.createElement("canvas");
      c.width = S;
      c.height = S;
      const ctx = c.getContext("2d");
      ctx.fillStyle = cfg.skinBase;
      ctx.fillRect(0, 0, S, S);

      const fx = 256, fy = 512;
      const topG = ctx.createLinearGradient(0, 110, 0, 440);
      topG.addColorStop(0, "rgba(232, 178, 162, 0.24)");
      topG.addColorStop(1, "rgba(232, 178, 162, 0)");
      ctx.fillStyle = topG;
      ctx.fillRect(0, 0, S, 440);

      [-54, 54].forEach((dx) => {
        const g = ctx.createRadialGradient(fx + dx, fy + 46, 4, fx + dx, fy + 46, 54);
        g.addColorStop(0, cfg.female ? "rgba(244, 140, 152, 0.30)" : "rgba(226, 138, 130, 0.14)");
        g.addColorStop(0.6, cfg.female ? "rgba(244, 156, 162, 0.12)" : "rgba(226, 138, 130, 0.05)");
        g.addColorStop(1, "rgba(244, 156, 160, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(fx + dx - 60, fy - 12, 120, 120);
      });

      // Soft highlight batang hidung & bayangan ujung hidung
      const noseHi = ctx.createLinearGradient(fx, fy - 8, fx, fy + 40);
      noseHi.addColorStop(0, "rgba(255, 252, 248, 0.45)");
      noseHi.addColorStop(1, "rgba(255, 252, 248, 0.0)");
      ctx.strokeStyle = noseHi;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx, fy - 4);
      ctx.lineTo(fx, fy + 34);
      ctx.stroke();

      const noseTipSh = ctx.createRadialGradient(fx, fy + 48, 1, fx, fy + 48, 14);
      noseTipSh.addColorStop(0, "rgba(196, 126, 112, 0.32)");
      noseTipSh.addColorStop(1, "rgba(196, 126, 112, 0)");
      ctx.fillStyle = noseTipSh;
      ctx.fillRect(fx - 18, fy + 34, 36, 28);

      if (cfg.beautyMark) {
        ctx.fillStyle = "rgba(104, 68, 60, 0.65)";
        ctx.beginPath();
        ctx.arc(fx + 42, fy + 76, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    });
  }

  // 3. Tekstur Mata Berlian Anime 1024x1024 (Detail Iris Kristal, Limbal Ring, & Catchlight)
  function createHeroEyeTexture(cfg, isRightEye) {
    const key = `eye_1k_${cfg.id}_${isRightEye ? "R" : "L"}`;
    return cached(key, () => {
      const S = 1024;
      const c = document.createElement("canvas");
      c.width = S;
      c.height = S;
      const ctx = c.getContext("2d");
      ctx.save();
      ctx.scale(2, 2); // Gambar dalam ruang koordinat presisi 512x512 pada kanvas 1024x1024!

      const fem = cfg.female;
      const catTilt = cfg.catTilt || 0;
      const xIn = isRightEye ? 466 : 46;
      const xOut = isRightEye ? 42 : 470;
      const dir = isRightEye ? -1 : 1;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xIn, fem ? 286 : 288);
      ctx.bezierCurveTo(
        xIn + dir * 88, fem ? 116 : 158,
        xOut - dir * 92, (fem ? 112 : 154) - catTilt * 14,
        xOut, (fem ? 270 : 264) - catTilt * 16
      );
      ctx.bezierCurveTo(
        xOut - dir * 86, fem ? 404 : 366,
        xIn + dir * 96, fem ? 402 : 368,
        xIn, fem ? 286 : 288
      );
      ctx.closePath();

      const sclGrad = ctx.createLinearGradient(0, 140, 0, 390);
      sclGrad.addColorStop(0, "#e6dfea");
      sclGrad.addColorStop(0.28, "#fffdfb");
      sclGrad.addColorStop(1, "#fcf7f5");
      ctx.fillStyle = sclGrad;
      ctx.fill();
      ctx.clip();

      // Bayangan lembut bulu mata atas pada sklera
      const topSh = ctx.createLinearGradient(0, 128, 0, 250);
      topSh.addColorStop(0, "rgba(64, 48, 76, 0.44)");
      topSh.addColorStop(0.6, "rgba(88, 68, 92, 0.14)");
      topSh.addColorStop(1, "rgba(88, 68, 92, 0)");
      ctx.fillStyle = topSh;
      ctx.fillRect(0, 120, 512, 140);

      const cx = isRightEye ? 260 : 252;
      const cy = fem ? 264 : 262;
      const rx = fem ? (cfg.irisRx || 132) : 108;
      const ry = fem ? (cfg.irisRy || 142) : 112;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();

      const baseG = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
      baseG.addColorStop(0.0, cfg.irisTop);
      baseG.addColorStop(0.40, cfg.irisTop);
      baseG.addColorStop(0.72, cfg.irisMid);
      baseG.addColorStop(1.0, cfg.irisGold);
      ctx.fillStyle = baseG;
      ctx.fillRect(cx - rx - 4, cy - ry - 4, rx * 2 + 8, ry * 2 + 8);

      const glowG = ctx.createRadialGradient(cx, cy + ry * 0.56, 8, cx, cy + ry * 0.42, rx * 0.92);
      glowG.addColorStop(0.0, cfg.irisGlow || "#ffe6be");
      glowG.addColorStop(0.45, cfg.irisGold);
      glowG.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.globalAlpha = fem ? 0.86 : 0.74;
      ctx.fillStyle = glowG;
      ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
      ctx.globalAlpha = 1.0;

      // Serat kristal halus radial pada iris
      ctx.strokeStyle = cfg.irisGlow || "#ffdfad";
      ctx.lineWidth = 2.0;
      for (let i = 0; i < 42; i++) {
        const a = (i / 42) * Math.PI * 2;
        const sinA = Math.sin(a);
        ctx.globalAlpha = sinA > 0 ? 0.24 : 0.07;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rx * 0.35, cy + sinA * ry * 0.35);
        ctx.lineTo(cx + Math.cos(a) * rx * 0.89, cy + sinA * ry * 0.89);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Limbal ring tegas
      ctx.strokeStyle = cfg.irisTop;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx - 4, ry - 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Pupil beludru dalam + cincin cahaya hangat
      const pRx = fem ? 45 : 39;
      const pRy = fem ? 51 : 42;
      const pupHalo = ctx.createRadialGradient(cx, cy - 2, pRx * 0.7, cx, cy - 2, pRx * 1.48);
      pupHalo.addColorStop(0, cfg.irisTop);
      pupHalo.addColorStop(0.7, cfg.irisMid);
      pupHalo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.58;
      ctx.fillStyle = pupHalo;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, pRx * 1.48, pRy * 1.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = "#11090d";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, pRx, pRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pantulan busur cahaya bawah iris
      ctx.strokeStyle = "rgba(255, 238, 212, 0.62)";
      ctx.lineWidth = 7.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy + 8, rx * 0.66, 0.22 * Math.PI, 0.78 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Catchlights utama & sekunder
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(cx - 42, cy - 46, fem ? 27 : 22, fem ? 30 : 23, -0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(cx + 46, cy + 38, fem ? 13 : 10, 0, Math.PI * 2);
      ctx.fill();

      if (fem) {
        ctx.fillStyle = "rgba(255, 248, 235, 0.90)";
        ctx.beginPath();
        ctx.arc(cx + 50, cy - 36, 7.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Garis bulu mata atas & sayap bulu mata
      ctx.strokeStyle = fem ? "#1f1115" : "#161b24";
      ctx.lineWidth = fem ? 26 : 20;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(xIn - dir * 4, fem ? 282 : 284);
      ctx.bezierCurveTo(
        xIn + dir * 88, fem ? 112 : 154,
        xOut - dir * 90, (fem ? 108 : 150) - catTilt * 14,
        xOut + dir * (fem ? 18 : 10), (fem ? 258 : 256) - catTilt * 16
      );
      ctx.stroke();

      if (fem) {
        ctx.lineWidth = 8.5;
        [[0.74, 16, -22], [0.88, 24, -16], [0.98, 26, -6]].forEach(([t, ox, oy]) => {
          const lx = xIn + (xOut - xIn) * t;
          const ly = 162 + (t - 0.7) * 245 - catTilt * 10;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.quadraticCurveTo(lx + dir * (ox * 0.6), ly + oy * 0.7, lx + dir * ox, ly + oy);
          ctx.stroke();
        });
      }

      // Lipatan kelopak mata ganda (double-eyelid crease)
      ctx.strokeStyle = fem ? "rgba(128, 78, 74, 0.56)" : "rgba(105, 76, 68, 0.52)";
      ctx.lineWidth = 5.8;
      ctx.beginPath();
      ctx.moveTo(xIn + dir * 30, fem ? 204 : 226);
      ctx.bezierCurveTo(
        xIn + dir * 104, fem ? 88 : 128,
        xOut - dir * 104, (fem ? 86 : 126) - catTilt * 12,
        xOut - dir * 24, (fem ? 196 : 210) - catTilt * 12
      );
      ctx.stroke();

      // Garis mata bawah halus
      ctx.strokeStyle = fem ? "rgba(118, 72, 72, 0.46)" : "rgba(85, 68, 66, 0.40)";
      ctx.lineWidth = 5.2;
      ctx.beginPath();
      ctx.moveTo(xIn + dir * 48, fem ? 356 : 334);
      ctx.quadraticCurveTo((xIn + xOut) * 0.5, fem ? 408 : 374, xOut - dir * 18, fem ? 300 : 288);
      ctx.stroke();

      ctx.restore();
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      tex.needsUpdate = true;
      return tex;
    });
  }

  function createEyebrowTexture(colorHex, isRight, thick = 1.0) {
    return cached(`brow_${colorHex}_${isRight ? "R" : "L"}_${thick}`, () => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 96;
      const ctx = c.getContext("2d");
      const xIn = isRight ? 236 : 20;
      const xOut = isRight ? 18 : 238;
      const grad = ctx.createLinearGradient(xIn, 48, xOut, 48);
      grad.addColorStop(0.0, "rgba(0,0,0,0)");
      grad.addColorStop(0.14, colorHex);
      grad.addColorStop(0.80, colorHex);
      grad.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.90;
      const h = 11.5 * thick;
      ctx.beginPath();
      ctx.moveTo(xIn, 56);
      ctx.quadraticCurveTo(128, 24, xOut, 50);
      ctx.quadraticCurveTo(128, 24 + h, xIn, 56 + h * 0.65);
      ctx.closePath();
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    });
  }

  function createSoftLipTexture(female) {
    return cached("lip_hd_" + (female ? "F" : "M"), () => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext("2d");
      if (female) {
        const g = ctx.createRadialGradient(256, 134, 8, 256, 134, 195);
        g.addColorStop(0.0, "rgba(232, 104, 122, 0.92)");
        g.addColorStop(0.52, "rgba(242, 138, 150, 0.62)");
        g.addColorStop(0.85, "rgba(248, 184, 188, 0.18)");
        g.addColorStop(1.0, "rgba(248, 184, 188, 0.0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(256, 136, 220, 96, 0, 0, Math.PI * 2);
        ctx.fill();

        const lineG = ctx.createLinearGradient(28, 120, 484, 120);
        lineG.addColorStop(0, "rgba(136, 42, 58, 0.0)");
        lineG.addColorStop(0.10, "rgba(136, 42, 58, 0.92)");
        lineG.addColorStop(0.5, "rgba(118, 32, 48, 1.0)");
        lineG.addColorStop(0.90, "rgba(136, 42, 58, 0.92)");
        lineG.addColorStop(1, "rgba(136, 42, 58, 0.0)");
        ctx.strokeStyle = lineG;
        ctx.lineWidth = 24;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(38, 110);
        ctx.quadraticCurveTo(256, 148, 474, 110);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 250, 252, 0.74)";
        ctx.beginPath();
        ctx.ellipse(256, 174, 76, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const g = ctx.createRadialGradient(256, 132, 8, 256, 132, 185);
        g.addColorStop(0.0, "rgba(186, 112, 106, 0.56)");
        g.addColorStop(0.65, "rgba(206, 140, 132, 0.18)");
        g.addColorStop(1.0, "rgba(206, 140, 132, 0.0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(256, 132, 210, 82, 0, 0, Math.PI * 2);
        ctx.fill();

        const lineG = ctx.createLinearGradient(28, 128, 484, 128);
        lineG.addColorStop(0, "rgba(96, 50, 50, 0)");
        lineG.addColorStop(0.10, "rgba(96, 50, 50, 0.95)");
        lineG.addColorStop(0.90, "rgba(96, 50, 50, 0.95)");
        lineG.addColorStop(1, "rgba(96, 50, 50, 0)");
        ctx.strokeStyle = lineG;
        ctx.lineWidth = 22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(38, 122);
        ctx.quadraticCurveTo(256, 140, 474, 122);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    });
  }

  function createSoftBlushTexture() {
    return cached("soft_blush_hd", () => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 160;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(128, 80, 8, 128, 80, 114);
      g.addColorStop(0.0, "rgba(246, 114, 136, 0.85)");
      g.addColorStop(0.52, "rgba(248, 142, 158, 0.40)");
      g.addColorStop(1.0, "rgba(248, 142, 158, 0.0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 160);
      ctx.strokeStyle = "rgba(236, 78, 108, 0.40)";
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      [-28, 0, 28].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(128 + dx - 8, 98);
        ctx.lineTo(128 + dx + 8, 62);
        ctx.stroke();
      });
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    });
  }

  // 4. Mulut Anime Conformed dengan 8 Morph Targets Mulus + Lip-Sync
  // Morph indices:
  // 0: small_smile, 1: awkward (asymmetric), 2: shy_blush, 3: hold_back (tight),
  // 4: sad, 5: worried / confused (parted), 6: pout / jealous, 7: happy_wide, 8: talk_open
  function buildHeroMouth(R, female) {
    const segs = 24;
    const baseW = R * (female ? 0.205 : 0.225);
    const yCenter = -R * (female ? 0.465 : 0.475);
    const makeAttr = (fn) => {
      const arr = [];
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i <= segs; i++) {
          const u = (i / segs) * 2 - 1;
          const [dx, dy, dzOff] = fn(u, row);
          const px = dx;
          const py = yCenter + dy;
          const pz = surfaceZAtFace(px, py, R, female) + 0.0022 + (dzOff || 0);
          arr.push(px, py, pz);
        }
      }
      return new THREE.Float32BufferAttribute(arr, 3);
    };

    const neutralAttr = makeAttr((u, row) => {
      const x = u * baseW;
      const arch = 0.0014 * u * u;
      const h = (row === 0 ? 0.0056 : -0.0066) * Math.pow(Math.max(0, 1 - u * u), 0.72);
      return [x, arch + h, 0];
    });
    const m0_smallSmile = makeAttr((u, row) => {
      const x = u * baseW * 1.18;
      const curve = 0.0052 * u * u - 0.0011;
      const h = (row === 0 ? 0.0060 : -0.0072) * Math.pow(Math.max(0, 1 - u * u), 0.70);
      return [x, curve + h, 0.0002];
    });
    const m1_awkward = makeAttr((u, row) => {
      const x = u * baseW * 0.96;
      const wave = 0.0022 * Math.sin(u * Math.PI * 1.15) + 0.0012 * u;
      const h = (row === 0 ? 0.0050 : -0.0056) * Math.pow(Math.max(0, 1 - u * u), 0.74);
      return [x, wave + h, 0];
    });
    const m2_shy = makeAttr((u, row) => {
      const x = u * baseW * 0.90;
      const curve = 0.0036 * u * u - 0.0006;
      const h = (row === 0 ? 0.0052 : -0.0062) * Math.pow(Math.max(0, 1 - u * u), 0.74);
      return [x, curve + h, 0.0002];
    });
    const m3_holdBack = makeAttr((u, row) => {
      const x = u * baseW * 0.86;
      const curve = -0.0030 * u * u + 0.0008;
      const h = (row === 0 ? 0.0038 : -0.0042) * Math.pow(Math.max(0, 1 - u * u), 0.78);
      return [x, curve + h, 0];
    });
    const m4_sad = makeAttr((u, row) => {
      const x = u * baseW * 0.98;
      const curve = -0.0058 * u * u + 0.0018;
      const h = (row === 0 ? 0.0048 : -0.0056) * Math.pow(Math.max(0, 1 - u * u), 0.75);
      return [x, curve + h, 0];
    });
    const m5_worried = makeAttr((u, row) => {
      const x = u * baseW * 0.82;
      const curve = -0.0038 * u * u + 0.0006;
      const h = (row === 0 ? 0.0074 : -0.0082) * Math.sqrt(Math.max(0.06, 1 - u * u));
      return [x, curve + h, 0.0004];
    });
    const m6_pout = makeAttr((u, row) => {
      const x = u * baseW * 0.74;
      const curve = -0.0028 * u * u + 0.0012;
      const h = (row === 0 ? 0.0056 : -0.0068) * Math.pow(Math.max(0, 1 - u * u), 0.68);
      return [x, curve + h, 0.0008];
    });
    const m7_happy = makeAttr((u, row) => {
      const x = u * baseW * 1.30;
      const curve = 0.0078 * u * u - 0.0018;
      const h = (row === 0 ? 0.0068 : -0.0092) * Math.pow(Math.max(0, 1 - u * u), 0.68);
      return [x, curve + h, 0.0005];
    });
    const m8_talk = makeAttr((u, row) => {
      const x = u * baseW * 1.06;
      const h = (row === 0 ? 0.0074 : -0.0120) * Math.sqrt(Math.max(0.06, 1 - u * u));
      return [x, h, 0.0006];
    });

    const uvs = [];
    const indices = [];
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i <= segs; i++) uvs.push(i / segs, row === 0 ? 1 : 0);
    }
    for (let i = 0; i < segs; i++) {
      const a = i, b = i + 1, c = segs + 1 + i, d = segs + 1 + i + 1;
      indices.push(a, c, b, b, c, d);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", neutralAttr);
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.morphAttributes.position = [
      m0_smallSmile, m1_awkward, m2_shy, m3_holdBack,
      m4_sad, m5_worried, m6_pout, m7_happy, m8_talk
    ];
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      map: createSoftLipTexture(female),
      transparent: true,
      depthWrite: false,
      morphTargets: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.noOutline = true;
    mesh.renderOrder = 3;
    mesh.updateMorphTargets();
    return mesh;
  }

  // 5. Mata Anime Conformed + 3D Eyelashes + Feathered Soft Blink Lid + Gaze UV Control
  function createSoftEyelidTexture(skinHex) {
    return cached("soft_lid_" + skinHex, () => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 192;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(128, 96, 42, 128, 96, 122);
      g.addColorStop(0.0, skinHex);
      g.addColorStop(0.72, skinHex);
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 192);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    });
  }

  function buildHeroEye(sideSign, R, female, texBase, skinHex, lashHex) {
    const tex = texBase.clone();
    tex.needsUpdate = true;
    const cx = sideSign * R * (female ? 0.345 : 0.338);
    const cy = R * (female ? -0.048 : -0.042);
    const w = R * (female ? 0.475 : 0.455);
    const h = R * (female ? 0.395 : 0.318);

    const group = new THREE.Group();
    group.userData.noOutline = true;

    const makeConformedPlane = (pw, ph, zOff, segX = 14, segY = 10) => {
      const g = new THREE.PlaneGeometry(pw, ph, segX, segY);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const lx = p.getX(i), ly = p.getY(i);
        const wx = cx + lx, wy = cy + ly;
        p.setXYZ(i, wx, wy, surfaceZAtFace(wx, wy, R, female) + zOff);
      }
      g.computeVertexNormals();
      return g;
    };

    const eyeMesh = new THREE.Mesh(
      makeConformedPlane(w, h, 0.0017),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, depthWrite: false })
    );
    eyeMesh.userData.noOutline = true;
    eyeMesh.renderOrder = 2;
    group.add(eyeMesh);

    const lashPts = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const lx = sideSign * (-w * 0.44 + u * w * 0.92);
      const arch = Math.sin(u * Math.PI) * h * 0.42 + (u - 0.5) * h * (female ? 0.03 : 0.04);
      const ly = arch + h * 0.03;
      const wx = cx + lx, wy = cy + ly;
      lashPts.push(new THREE.Vector3(wx, wy, surfaceZAtFace(wx, wy, R, female) + 0.0030));
    }
    const lash3D = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lashPts), 14, female ? 0.0021 : 0.0019, 5, false),
      new THREE.MeshBasicMaterial({ color: lashHex })
    );
    lash3D.userData.noOutline = true;
    lash3D.renderOrder = 4;
    group.add(lash3D);

    const lidPivot = new THREE.Group();
    lidPivot.position.set(cx, cy + h * 0.5, surfaceZAtFace(cx, cy + h * 0.2, R, female) + 0.0036);
    const lidGeo = new THREE.PlaneGeometry(w * 1.16, h * 1.18, 8, 4);
    lidGeo.translate(0, -h * 0.58, 0);
    const lp = lidGeo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      const lx = lp.getX(i), ly = lp.getY(i);
      const wx = cx + lx, wy = cy + h * 0.5 + ly;
      lp.setZ(i, surfaceZAtFace(wx, wy, R, female) - surfaceZAtFace(cx, cy + h * 0.2, R, female) + 0.0006);
    }
    const upperLid = new THREE.Mesh(
      lidGeo,
      new THREE.MeshBasicMaterial({ map: createSoftEyelidTexture(skinHex), transparent: true, depthWrite: false })
    );
    upperLid.userData.noOutline = true;
    upperLid.renderOrder = 5;
    lidPivot.scale.y = 0.001;
    lidPivot.add(upperLid);
    group.add(lidPivot);

    const closedPts = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8 - 0.5;
      const wx = cx + u * w * 0.88;
      const wy = cy - h * 0.04 - (0.25 - u * u) * h * 0.22;
      closedPts.push(new THREE.Vector3(wx, wy, surfaceZAtFace(wx, wy, R, female) + 0.0048));
    }
    const lashClosed = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(closedPts), 12, 0.0020, 5, false),
      new THREE.MeshBasicMaterial({ color: lashHex })
    );
    lashClosed.visible = false;
    lashClosed.userData.noOutline = true;
    lashClosed.renderOrder = 6;
    group.add(lashClosed);

    return { group, mesh: eyeMesh, tex, lash3D, upperLid: lidPivot, lashClosed, baseCy: cy };
  }

  // 6. Generator Helai Rambut Berbentuk Pita Berlapis (Ribbon-Blade Hair Lock)
  function createHairLock(pointsArr, rRoot, rMid, rTip, mat, flatRatio = 0.45, segs = 22) {
    const curve = new THREE.CatmullRomCurve3(pointsArr.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const radSegs = 8;
    const geo = new THREE.TubeGeometry(curve, segs, 1.0, radSegs, false);
    const pos = geo.attributes.position;
    const center = new THREE.Vector3();
    const radialOut = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const sideAxis = new THREE.Vector3();

    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      curve.getPointAt(t, center);
      curve.getTangentAt(t, tangent);

      radialOut.set(center.x, center.y * 0.35, center.z + 0.015);
      if (radialOut.lengthSq() < 1e-6) radialOut.set(0, 0, 1);
      radialOut.addScaledVector(tangent, -radialOut.dot(tangent)).normalize();
      sideAxis.crossVectors(tangent, radialOut).normalize();

      const env = t < 0.38
        ? rRoot + (rMid - rRoot) * Math.sin((t / 0.38) * Math.PI * 0.5)
        : rMid * Math.pow(Math.max(0, 1 - (t - 0.38) / 0.62), 0.82) + rTip * ((t - 0.38) / 0.62);

      for (let j = 0; j <= radSegs; j++) {
        const idx = i * (radSegs + 1) + j;
        const ang = (j / radSegs) * Math.PI * 2;
        const w = Math.cos(ang) * env;
        const ridge = Math.sin(ang) > 0 ? Math.pow(Math.sin(ang), 0.75) : Math.sin(ang) * 0.65;
        const th = ridge * env * flatRatio;
        pos.setXYZ(
          idx,
          center.x + sideAxis.x * w + radialOut.x * th,
          center.y + sideAxis.y * w + radialOut.y * th,
          center.z + sideAxis.z * w + radialOut.z * th
        );
      }
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // 7. Tangan Anime 10 Jari Berartikulasi (Dengan Kontrol Genggaman Jari!)
  function buildAnimeHand(sideSign, skinMat, scale = 1.0) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.025 * scale, 12, 10), skinMat);
    palm.scale.set(0.92, 1.18, 0.45);
    palm.position.set(0, -0.024 * scale, 0);
    palm.userData.noOutline = true;
    g.add(palm);

    const thumb = new THREE.Group();
    thumb.position.set(sideSign * -0.020 * scale, -0.018 * scale, 0.007 * scale);
    thumb.rotation.set(0.24, 0, sideSign * -0.56);
    const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0056 * scale, 0.0044 * scale, 0.029 * scale, 8), skinMat);
    tMesh.position.y = -0.014 * scale;
    tMesh.userData.noOutline = true;
    thumb.add(tMesh);
    g.add(thumb);

    const fingers = [];
    [
      [-0.014, 0.037, 0.0048],
      [-0.005, 0.041, 0.0050],
      [0.005, 0.039, 0.0047],
      [0.014, 0.032, 0.0042]
    ].forEach(([fx, fl, fr]) => {
      const fb = new THREE.Group();
      fb.position.set(sideSign * fx * scale, -0.045 * scale, 0);
      fb.rotation.x = 0.18;
      const s1 = new THREE.Mesh(new THREE.CylinderGeometry(fr * scale, fr * 0.82 * scale, fl * 0.56 * scale, 8), skinMat);
      s1.position.y = -fl * 0.28 * scale;
      s1.userData.noOutline = true;
      const ft = new THREE.Group();
      ft.position.y = -fl * 0.54 * scale;
      ft.rotation.x = 0.24;
      const s2 = new THREE.Mesh(new THREE.CylinderGeometry(fr * 0.80 * scale, fr * 0.56 * scale, fl * 0.46 * scale, 8), skinMat);
      s2.position.y = -fl * 0.23 * scale;
      s2.userData.noOutline = true;
      ft.add(s2);
      fb.add(s1, ft);
      g.add(fb);
      fingers.push({ base: fb, tip: ft });
    });

    g.setGrip = (curl = 0.0) => {
      fingers.forEach((f, idx) => {
        f.base.rotation.x = 0.18 + curl * (0.85 + idx * 0.05);
        f.tip.rotation.x = 0.24 + curl * 0.92;
      });
      thumb.rotation.x = 0.24 + curl * 0.55;
    };
    return g;
  }

  // 8. Rok Lipit Pisau (Knife-Pleated Skirt) 22 Lipit dengan Modesty Liner
  function buildPleatedSkirt(pleats, rWaist, rHem, height, zScale, mat) {
    const grp = new THREE.Group();
    const parts = [];
    const waistband = new THREE.Mesh(new THREE.CylinderGeometry(rWaist * 0.99, rWaist * 1.03, 0.042, 32), mat);
    waistband.scale.set(1, 1, zScale);
    waistband.position.y = 0.012;
    waistband.castShadow = true;
    grp.add(waistband);
    parts.push(waistband);

    const liner = new THREE.Mesh(new THREE.CylinderGeometry(rWaist * 0.94, rHem * 0.90, height * 0.96, 28), mat);
    liner.scale.set(1, 1, zScale);
    liner.position.y = -height * 0.48;
    liner.castShadow = true;
    grp.add(liner);
    parts.push(liner);

    for (let i = 0; i < pleats; i++) {
      const aMid = ((i + 0.55) / pleats) * Math.PI * 2;
      const wBot = ((2 * Math.PI * rHem) / pleats) * 1.18;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(wBot * 0.96, height, 0.012), mat);
      const rMid = (rWaist + rHem) * 0.5;
      const flare = Math.atan2((rHem - rWaist) * 0.95, height);
      blade.position.set(Math.sin(aMid) * rMid, -height * 0.50, Math.cos(aMid) * rMid * zScale);
      blade.rotation.order = "YXZ";
      blade.rotation.y = aMid + 0.14;
      blade.rotation.x = -flare;
      blade.castShadow = true;
      blade.receiveShadow = true;
      grp.add(blade);
      parts.push(blade);
    }
    return { group: grp, parts };
  }

  // 9. Pita Satin 3D
  function buildSatinBow(scale, mat, tailLen = 0.045) {
    const g = new THREE.Group();
    [-1, 1].forEach((s) => {
      const loop = new THREE.Mesh(new THREE.SphereGeometry(0.018 * scale, 14, 10), mat);
      loop.scale.set(1.35, 0.72, 0.42);
      loop.position.set(s * 0.019 * scale, 0.003 * scale, 0);
      loop.rotation.z = s * 0.22;
      loop.userData.noOutline = true;
      g.add(loop);
      if (tailLen > 0) {
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.011 * scale, tailLen * scale, 0.004 * scale), mat);
        tail.position.set(s * 0.011 * scale, -tailLen * 0.48 * scale, -0.002 * scale);
        tail.rotation.z = s * -0.26;
        tail.userData.noOutline = true;
        g.add(tail);
      }
    });
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.0085 * scale, 10, 8), mat);
    knot.scale.set(0.9, 1.0, 0.75);
    knot.position.z = 0.003 * scale;
    knot.userData.noOutline = true;
    g.add(knot);
    return g;
  }

  // 10. Potret SVG Ekspresif Resolusi Tajam untuk Kotak Dialog (Rizka, Kael, Nadine, Ayah, Narasi)
  function getPortraitSVG(who, exp = "neutral") {
    const id = (who || "").toLowerCase();

    if (id === "rizka") {
      const blushOp =
        exp === "subtle_blush" || exp === "happy" ? 0.78 :
        exp === "awkward" || exp === "jealous" ? 0.52 :
        exp === "small_smile" || exp === "masking_smile" ? 0.30 : 0.16;
      const mouthPath =
        exp === "happy" ? "M34.2 50.2 Q40 55.4 45.8 50.2" :
        exp === "small_smile" || exp === "masking_smile" ? "M35.2 50.6 Q40 53.4 44.8 50.6" :
        exp === "subtle_blush" ? "M35.5 50.6 Q40 53.0 44.5 50.6" :
        exp === "awkward" ? "M35.8 51.2 Q38.5 50.0 41.2 51.6 Q43.2 52.2 44.5 50.8" :
        exp === "jealous" ? "M37.0 51.4 Q40 49.8 43.0 51.4" :
        exp === "holding_back" || exp === "sad" || exp === "worried" || exp === "disappointed" ? "M36.0 52.0 Q40 49.6 44.0 52.0" :
        "M36.0 51.0 Q40 52.2 44.0 51.0";
      const browL =
        exp === "jealous" ? "M26.5 29.4 L34.5 31.8" :
        exp === "worried" || exp === "holding_back" || exp === "sad" || exp === "awkward" || exp === "masking_smile" ? "M26.5 31.8 Q30.5 29.8 34.5 29.0" :
        "M26.5 30.2 Q30.5 28.4 34.5 30.0";
      const browR =
        exp === "jealous" ? "M45.5 31.8 L53.5 29.4" :
        exp === "worried" || exp === "holding_back" || exp === "sad" || exp === "awkward" || exp === "masking_smile" ? "M45.5 29.0 Q49.5 29.8 53.5 31.8" :
        "M45.5 30.0 Q49.5 28.4 53.5 30.2";
      const eyeRy = exp === "holding_back" ? 4.1 : exp === "happy" ? 4.5 : 4.9;
      const uid = exp.replace(/[^a-z0-9]/gi, "");

      return `<svg viewBox="0 0 80 80" class="w-full h-full">
        <defs>
          <linearGradient id="rzBg4_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22304a"/><stop offset="100%" stop-color="#352b3d"/></linearGradient>
          <linearGradient id="rzIr4_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#241317"/><stop offset="55%" stop-color="#7c4830"/><stop offset="100%" stop-color="#efb576"/></linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#rzBg4_${uid})"/>
        <circle cx="64" cy="16" r="18" fill="#f4c57a" opacity="0.12"/>
        <path d="M14 38 C14 11 66 11 66 38 L69 80 L11 80 Z" fill="#3a2622"/>
        <path d="M18 40 C18 16 62 16 62 40 L64 80 L16 80 Z" fill="#49312b"/>
        <path d="M15 80 C18 59 62 59 65 80 Z" fill="#233047"/>
        <path d="M30 60 L40 73 L50 60 Z" fill="#f8f6f1"/>
        <path d="M34 65 L40 68.5 L46 65 L44 71 L40 69.5 L36 71 Z" fill="#6b95c2"/>
        <rect x="36" y="53" width="8" height="9" rx="3" fill="#ecc4b4"/>
        <path d="M23.5 36 C23.5 22 56.5 22 56.5 36 C56.5 47 48.5 56.5 40 57.5 C31.5 56.5 23.5 47 23.5 36 Z" fill="#f9e2d4"/>
        <ellipse cx="28.5" cy="45.5" rx="4.6" ry="2.5" fill="#f28b97" opacity="${blushOp}"/>
        <ellipse cx="51.5" cy="45.5" rx="4.6" ry="2.5" fill="#f28b97" opacity="${blushOp}"/>
        <circle cx="48.5" cy="48.8" r="0.65" fill="#6b463e" opacity="0.72"/>
        <ellipse cx="31.5" cy="39.8" rx="4.8" ry="${eyeRy}" fill="#fffdfb"/>
        <ellipse cx="48.5" cy="39.8" rx="4.8" ry="${eyeRy}" fill="#fffdfb"/>
        <ellipse cx="31.8" cy="40.0" rx="3.9" ry="${eyeRy * 0.92}" fill="url(#rzIr4_${uid})"/>
        <ellipse cx="48.2" cy="40.0" rx="3.9" ry="${eyeRy * 0.92}" fill="url(#rzIr4_${uid})"/>
        <ellipse cx="31.8" cy="40.0" rx="1.7" ry="${eyeRy * 0.42}" fill="#14090d"/>
        <ellipse cx="48.2" cy="40.0" rx="1.7" ry="${eyeRy * 0.42}" fill="#14090d"/>
        <circle cx="30.2" cy="38.0" r="1.45" fill="#ffffff"/><circle cx="46.6" cy="38.0" r="1.45" fill="#ffffff"/>
        <circle cx="33.2" cy="41.8" r="0.7" fill="#fff6e5"/><circle cx="49.6" cy="41.8" r="0.7" fill="#fff6e5"/>
        <path d="M26.2 37.2 Q31.5 33.4 36.4 37.0" stroke="#1d1014" stroke-width="2.1" fill="none" stroke-linecap="round"/>
        <path d="M43.6 37.0 Q48.5 33.4 53.8 37.2" stroke="#1d1014" stroke-width="2.1" fill="none" stroke-linecap="round"/>
        <path d="${browL}" stroke="#3b2622" stroke-width="1.35" fill="none" stroke-linecap="round"/>
        <path d="${browR}" stroke="#3b2622" stroke-width="1.35" fill="none" stroke-linecap="round"/>
        <path d="M39.6 43.2 L40.2 45.2" stroke="#d9a496" stroke-width="1.0" stroke-linecap="round"/>
        <path d="${mouthPath}" stroke="#b84a5e" stroke-width="1.75" fill="none" stroke-linecap="round"/>
        <path d="M19 38 C19 15 61 15 61 38 L58 30 Q52 22 45 29 Q42 21 38 30 Q33 21 28 30 Q23 24 21 36 Z" fill="#462e29"/>
        <path d="M18 34 Q17 52 21 68 L24.5 66 Q22.5 50 23.5 35 Z" fill="#462e29"/>
        <path d="M62 34 Q63 52 59 68 L55.5 66 Q57.5 50 56.5 35 Z" fill="#462e29"/>
        <path d="M25 22 Q40 17 55 22" stroke="#d8aa92" stroke-width="2.2" fill="none" opacity="0.52" stroke-linecap="round"/>
        <g transform="translate(54,22) rotate(16)">
          <ellipse cx="-3.6" cy="0" rx="4.2" ry="2.4" fill="#9bbce0"/>
          <ellipse cx="3.6" cy="0" rx="4.2" ry="2.4" fill="#9bbce0"/>
          <circle cx="0" cy="0" r="1.8" fill="#eef6ff"/>
        </g>
      </svg>`;
    }

    if (id === "kael") {
      const blushOp = exp === "awkward" ? 0.46 : exp === "small_smile" ? 0.16 : 0.08;
      const eyeRy = exp === "noticing_rizka" ? 4.0 : exp === "serious" ? 3.3 : 3.7;
      const mouthPath =
        exp === "small_smile" ? "M35.0 50.6 Q40 53.5 45.0 50.4" :
        exp === "confused" ? "M36.5 51.4 Q40 49.8 43.5 51.2" :
        exp === "awkward" ? "M35.8 51.4 Q38.8 50.2 44.0 51.5" :
        exp === "worried" || exp === "serious" ? "M36.0 51.8 Q40 50.6 44.0 51.8" :
        "M35.8 51.2 Q40 51.8 44.2 51.2";
      const browL =
        exp === "worried" ? "M26.5 33.0 L35.2 31.0" :
        exp === "confused" ? "M26.5 33.2 L35.2 31.6" :
        exp === "serious" ? "M26.5 31.2 L35.2 32.8" :
        "M26.5 32.0 L35.2 32.4";
      const browR =
        exp === "worried" ? "M44.8 31.0 L53.5 33.0" :
        exp === "confused" ? "M44.8 30.8 L53.5 30.4" :
        exp === "serious" ? "M44.8 32.8 L53.5 31.2" :
        "M44.8 32.4 L53.5 32.0";
      const uid = exp.replace(/[^a-z0-9]/gi, "");

      return `<svg viewBox="0 0 80 80" class="w-full h-full">
        <defs>
          <linearGradient id="klBg4_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#182234"/><stop offset="100%" stop-color="#263349"/></linearGradient>
          <linearGradient id="klIr4_${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1f2938"/><stop offset="60%" stop-color="#5b7b9c"/><stop offset="100%" stop-color="#a9cbe8"/></linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#klBg4_${uid})"/>
        <path d="M13 80 C16 58 64 58 67 80 Z" fill="#233047"/>
        <path d="M30 60 L40 74 L50 60 Z" fill="#f4f2ed"/>
        <path d="M38.2 64 L41.8 64 L42.5 76 L37.5 76 Z" fill="#5b7fa6"/>
        <rect x="35.5" y="53" width="9" height="9" rx="3" fill="#dfc0ae"/>
        <path d="M23.5 35 C23.5 21 56.5 21 56.5 35 C56.5 47 48 56.8 40 58 C32 56.8 23.5 47 23.5 35 Z" fill="#eed1bf"/>
        <ellipse cx="29" cy="45.5" rx="4.2" ry="2.2" fill="#de8682" opacity="${blushOp}"/>
        <ellipse cx="51" cy="45.5" rx="4.2" ry="2.2" fill="#de8682" opacity="${blushOp}"/>
        <ellipse cx="31.8" cy="39.8" rx="4.4" ry="${eyeRy}" fill="#fffdfb"/>
        <ellipse cx="48.2" cy="39.8" rx="4.4" ry="${eyeRy}" fill="#fffdfb"/>
        <ellipse cx="32" cy="40" rx="3.4" ry="${eyeRy * 0.9}" fill="url(#klIr4_${uid})"/>
        <ellipse cx="48" cy="40" rx="3.4" ry="${eyeRy * 0.9}" fill="url(#klIr4_${uid})"/>
        <circle cx="32" cy="40" r="1.5" fill="#121822"/><circle cx="48" cy="40" r="1.5" fill="#121822"/>
        <circle cx="30.6" cy="38.5" r="1.15" fill="#ffffff"/><circle cx="46.6" cy="38.5" r="1.15" fill="#ffffff"/>
        <path d="M26.8 37.2 Q32 35.2 36.4 37.4" stroke="#161b24" stroke-width="2.0" fill="none" stroke-linecap="round"/>
        <path d="M43.6 37.4 Q48 35.2 53.2 37.2" stroke="#161b24" stroke-width="2.0" fill="none" stroke-linecap="round"/>
        <path d="${browL}" stroke="#161922" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="${browR}" stroke="#161922" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M39.8 42.5 L40.3 45.2" stroke="#c99c8c" stroke-width="1.1" stroke-linecap="round"/>
        <path d="${mouthPath}" stroke="#9e645c" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        <path d="M18 39 C19 12 61 12 62 39 L58 30 L53 35 L48 26 L41 35 L39 26 L33 34 L27 27 L22 35 Z" fill="#1e2330"/>
        <path d="M26 21 Q40 17 54 22" stroke="#798ca8" stroke-width="2.0" fill="none" opacity="0.45" stroke-linecap="round"/>
      </svg>`;
    }

    if (id === "nadine") {
      const mouthPath = exp === "surprised" ? "M38 50.8 A2 2.2 0 1 0 42 50.8 A2 2.2 0 1 0 38 50.8" : "M34.8 50.2 Q40 54.4 45.2 50.2";
      return `<svg viewBox="0 0 80 80" class="w-full h-full">
        <defs>
          <linearGradient id="ndBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2c2635"/><stop offset="100%" stop-color="#3c3342"/></linearGradient>
          <linearGradient id="ndIr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2b2618"/><stop offset="58%" stop-color="#7d743b"/><stop offset="100%" stop-color="#d8c972"/></linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#ndBg)"/>
        <!-- Honey-caramel wavy bob -->
        <path d="M16 38 C15 13 65 13 64 38 C66 52 62 60 55 62 L25 62 C18 60 14 52 16 38 Z" fill="#7a523a"/>
        <!-- Cream knit vest + white shirt + coral ribbon -->
        <path d="M16 80 C19 60 61 60 64 80 Z" fill="#eae0d0"/>
        <path d="M30 60 L40 73 L50 60 Z" fill="#f8f6f1"/>
        <path d="M36 65 L40 68 L44 65 L42.5 72 L37.5 72 Z" fill="#c96f5b"/>
        <rect x="36" y="53" width="8" height="9" rx="3" fill="#ecc6b4"/>
        <path d="M24 36 C24 22 56 22 56 36 C56 47 48.5 56 40 57 C31.5 56 24 47 24 36 Z" fill="#f6dccd"/>
        <ellipse cx="29" cy="45" rx="4.2" ry="2.2" fill="#f0938c" opacity="0.38"/>
        <ellipse cx="51" cy="45" rx="4.2" ry="2.2" fill="#f0938c" opacity="0.38"/>
        <ellipse cx="32" cy="39.8" rx="4.5" ry="4.5" fill="#fffdfb"/>
        <ellipse cx="48" cy="39.8" rx="4.5" ry="4.5" fill="#fffdfb"/>
        <ellipse cx="32" cy="40" rx="3.6" ry="3.9" fill="url(#ndIr)"/>
        <ellipse cx="48" cy="40" rx="3.6" ry="3.9" fill="url(#ndIr)"/>
        <circle cx="32" cy="40" r="1.55" fill="#18140e"/><circle cx="48" cy="40" r="1.55" fill="#18140e"/>
        <circle cx="30.6" cy="38.3" r="1.3" fill="#fff"/><circle cx="46.6" cy="38.3" r="1.3" fill="#fff"/>
        <path d="M26.5 37.2 Q31.8 33.8 36.4 37.2" stroke="#241914" stroke-width="2.0" fill="none" stroke-linecap="round"/>
        <path d="M43.6 37.2 Q48.2 33.8 53.5 36.6" stroke="#241914" stroke-width="2.0" fill="none" stroke-linecap="round"/>
        <path d="M27 30.2 Q31 28.4 35 30.2" stroke="#5e3d2b" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M45 30.2 Q49 28.4 53 30.2" stroke="#5e3d2b" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="${mouthPath}" stroke="#b85458" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        <path d="M19 37 C20 14 60 14 61 37 L57 28 Q47 21 38 28 Q30 22 22 34 Z" fill="#8b5e42"/>
        <!-- Double amber hairpins on left temple -->
        <rect x="22" y="26" width="9" height="2.3" rx="1.1" fill="#f4c57a" transform="rotate(-18 26 27)"/>
        <rect x="23" y="29.5" width="8.5" height="2.1" rx="1.0" fill="#fff3dc" transform="rotate(-14 27 30)"/>
      </svg>`;
    }

    if (id === "ayah") {
      return `<svg viewBox="0 0 80 80" class="w-full h-full">
        <rect width="80" height="80" fill="#121a2b"/>
        <circle cx="40" cy="40" r="24" fill="#1e2c45" stroke="#f4c57a" stroke-width="1.8"/>
        <text x="40" y="48" text-anchor="middle" fill="#fff8ee" font-family="Georgia, serif" font-size="24" font-weight="bold">A</text>
        <path d="M24 22 Q40 12 56 22" stroke="#9bbce0" stroke-width="1.4" fill="none" stroke-dasharray="3 3"/>
      </svg>`;
    }

    return `<svg viewBox="0 0 80 80" class="w-full h-full">
      <rect width="80" height="80" fill="#19253a"/>
      <circle cx="58" cy="20" r="7" fill="#f4c57a" opacity="0.82"/>
      <circle cx="58" cy="20" r="14" fill="#f4c57a" opacity="0.16"/>
      <path d="M18 44 C18 29 27.8 19 40 19 C52.2 19 62 29 62 44 Z" fill="rgba(155,188,224,0.32)" stroke="#9bbce0" stroke-width="2"/>
      <path d="M40 44 V58 C40 61 37.5 63.5 34.8 63.5 C32.4 63.5 31 61.5 31 59" stroke="#fff3dc" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  return {
    surfaceZAtFace,
    buildHeroHeadGeometry,
    buildAnimeEars,
    createFaceSkinTexture,
    createHeroEyeTexture,
    createEyebrowTexture,
    createSoftLipTexture,
    createSoftBlushTexture,
    buildHeroMouth,
    buildHeroEye,
    createHairLock,
    buildAnimeHand,
    buildPleatedSkirt,
    buildSatinBow,
    getPortraitSVG
  };
})();
