/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   MODUL ARSITEKTUR DETAIL & PROPERTI 3D (assets/props/ch4_props.js)
   - Geometry reuse terpusat (_geoCache & _matCache) untuk optimasi draw calls
   - Kusen pintu/jendela 3D berongga (zero solid-box occlusion, zero z-fighting),
     meja & kursi sekolah berangkai penuh, loker baja 3D, tanaman pot, bangku,
     tas sekolah, kaleng minuman hangat, buku catatan, AC unit, & tangki atap
============================================================================ */
"use strict";

window.Ch4Props = (function () {
  const _geo = {};
  function boxGeo(w, h, d) {
    const k = `b_${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`;
    if (!_geo[k]) _geo[k] = new THREE.BoxGeometry(w, h, d);
    return _geo[k];
  }
  function cylGeo(rt, rb, h, seg = 12) {
    const k = `c_${rt.toFixed(3)}_${rb.toFixed(3)}_${h.toFixed(3)}_${seg}`;
    if (!_geo[k]) _geo[k] = new THREE.CylinderGeometry(rt, rb, h, seg);
    return _geo[k];
  }

  function addBox(parent, w, h, d, mat, x, y, z, cast = true, receive = true) {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = receive;
    parent.add(m);
    return m;
  }

  function addCyl(parent, rt, rb, h, seg, mat, x, y, z, cast = true) {
    const m = new THREE.Mesh(cylGeo(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  // 1. Pintu Berbingkai Arsitektural 3D + Panel Relief + Gagang Kuningan + Plat Unit Opsional
  function createArchitecturalDoor({ doorColor = 0x5c4232, frameColor = 0x3b2a22, unitNumber = null, residentTag = "", hasTransomGlass = false }) {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.56 });
    const leafMat = new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.50 });
    const panelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(doorColor).multiplyScalar(0.84), roughness: 0.54 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xe6c167, roughness: 0.25, metalness: 0.78 });

    const w = 1.06, h = 2.20, d = 0.24;
    addBox(g, w + 0.18, 0.09, d, frameMat, 0, h + 0.045, 0);
    addBox(g, 0.09, h, d, frameMat, -w / 2 - 0.045, h / 2, 0);
    addBox(g, 0.09, h, d, frameMat, w / 2 + 0.045, h / 2, 0);
    addBox(g, w, h, 0.075, leafMat, 0, h / 2, 0);

    // Recessed trim panels on both sides of door leaf
    [0.042, -0.042].forEach((sz) => {
      addBox(g, w * 0.74, 0.72, 0.012, panelMat, 0, 1.56, sz, false);
      addBox(g, w * 0.74, 0.68, 0.012, panelMat, 0, 0.62, sz, false);
    });

    if (hasTransomGlass) {
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xdff0ff, emissive: 0x9bbce0, emissiveIntensity: 0.28, roughness: 0.15 });
      addBox(g, w * 0.64, 0.42, 0.09, glassMat, 0, 1.66, 0, false, false);
    }

    // Lever handle on both sides
    addBox(g, 0.04, 0.14, 0.11, brassMat, w * 0.37, 1.02, 0, false);
    addBox(g, 0.12, 0.024, 0.15, brassMat, w * 0.33, 1.02, 0, false);

    if (unitNumber && window.Ch4Textures) {
      const plateMat = new THREE.MeshStandardMaterial({ map: window.Ch4Textures.getDoorPlate(unitNumber, residentTag), roughness: 0.35, metalness: 0.4 });
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), plateMat);
      plate.position.set(0, 1.76, 0.052);
      g.add(plate);
    }
    return g;
  }

  // 2. Jendela Berbingkai 3D Berongga (Mullions + Sill + Stylized Glass)
  function createFramedWindow({ width = 2.2, height = 1.72, frameColor = 0x5c4230, glassColor = 0xdff0ff, glassOpacity = 0.26, emissiveIntensity = 0.22 }) {
    const g = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.55 });
    const t = 0.075, fd = 0.22;

    addBox(g, width + t * 2, t, fd, frameMat, 0, height / 2 + t / 2, 0);
    addBox(g, width + t * 2.5, t * 1.15, fd + 0.08, frameMat, 0, -height / 2 - t / 2, 0.02);
    addBox(g, t, height, fd, frameMat, -width / 2 - t / 2, 0, 0);
    addBox(g, t, height, fd, frameMat, width / 2 + t / 2, 0, 0);
    addBox(g, t * 0.65, height, fd * 0.72, frameMat, 0, 0, 0);
    addBox(g, width, t * 0.55, fd * 0.68, frameMat, 0, height * 0.14, 0);

    const glassMat = new THREE.MeshStandardMaterial({
      color: glassColor,
      emissive: glassColor,
      emissiveIntensity,
      transparent: true,
      opacity: glassOpacity,
      roughness: 0.12,
      metalness: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat);
    g.add(glass);
    return g;
  }

  // 3. Meja & Kursi Siswa Berangkai Penuh (Zero Floating Parts!)
  function createStudentDeskSet(withProps = false, propVariant = 0) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xc29364, roughness: 0.56 });
    const cubbyMat = new THREE.MeshStandardMaterial({ color: 0x9c7248, roughness: 0.65 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x566173, roughness: 0.40, metalness: 0.62 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x45688f, roughness: 0.62 });

    // Desk top + book shelf cubby + 4 tubular steel legs + crossbars + bag hook
    addBox(g, 0.76, 0.042, 0.54, woodMat, 0, 0.74, 0);
    addBox(g, 0.66, 0.10, 0.42, cubbyMat, 0, 0.66, 0, false);
    [[-0.33, -0.21], [0.33, -0.21], [-0.33, 0.21], [0.33, 0.21]].forEach(([lx, lz]) => {
      addCyl(g, 0.017, 0.017, 0.73, 8, steelMat, lx, 0.365, lz);
    });
    [-0.33, 0.33].forEach((lx) => addBox(g, 0.025, 0.025, 0.42, steelMat, lx, 0.18, 0, false));

    // Connected tubular chair behind desk (+Z = +0.58)
    const cz = 0.58;
    addBox(g, 0.42, 0.038, 0.40, seatMat, 0, 0.44, cz);
    addBox(g, 0.42, 0.22, 0.035, seatMat, 0, 0.71, cz + 0.185);
    [[-0.17, -0.16], [0.17, -0.16]].forEach(([lx, lz]) => addCyl(g, 0.015, 0.015, 0.44, 8, steelMat, lx, 0.22, cz + lz));
    [[-0.17, 0.17], [0.17, 0.17]].forEach(([lx, lz]) => addCyl(g, 0.015, 0.015, 0.77, 8, steelMat, lx, 0.385, cz + lz));

    if (withProps) {
      const nbCol = propVariant % 2 === 0 ? 0xf7efe4 : 0xdbeafe;
      const nb = addBox(g, 0.21, 0.020, 0.27, new THREE.MeshStandardMaterial({ color: nbCol, roughness: 0.75 }), -0.12, 0.772, 0.02);
      nb.rotation.y = propVariant % 2 === 0 ? 0.12 : -0.15;
      const pen = addCyl(g, 0.005, 0.005, 0.14, 8, new THREE.MeshStandardMaterial({ color: 0x243148 }), 0.05, 0.768, 0.03, false);
      pen.rotation.z = Math.PI / 2;
      pen.rotation.y = 0.25;
    }
    return g;
  }

  // 4. Bank Loker Baja Sekolah Detail (Ventilasi 3D, Plat Nama, Gagang)
  function createLockerBank(count = 6) {
    const g = new THREE.Group();
    const bodyA = new THREE.MeshStandardMaterial({ color: 0x435d80, roughness: 0.44, metalness: 0.32 });
    const bodyB = new THREE.MeshStandardMaterial({ color: 0x527196, roughness: 0.44, metalness: 0.32 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e2b3d, roughness: 0.6 });
    const tagMat = new THREE.MeshStandardMaterial({ color: 0xf8f5ec, roughness: 0.7 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.28, metalness: 0.75 });

    const unitW = 0.56;
    // Plinth base & top crown cap across bank
    addBox(g, count * unitW + 0.06, 0.08, 0.50, darkMat, ((count - 1) * unitW) / 2, 0.04, 0);
    addBox(g, count * unitW + 0.08, 0.05, 0.52, darkMat, ((count - 1) * unitW) / 2, 1.925, 0);

    for (let i = 0; i < count; i++) {
      const x = i * unitW;
      const mat = i % 2 === 0 ? bodyA : bodyB;
      addBox(g, unitW - 0.02, 1.82, 0.46, mat, x, 0.99, 0);
      addBox(g, 0.36, 0.022, 0.016, darkMat, x, 1.66, 0.235, false);
      addBox(g, 0.36, 0.022, 0.016, darkMat, x, 1.60, 0.235, false);
      addBox(g, 0.36, 0.022, 0.016, darkMat, x, 0.36, 0.235, false);
      addBox(g, 0.15, 0.055, 0.012, tagMat, x, 1.44, 0.236, false);
      addBox(g, 0.024, 0.12, 0.028, handleMat, x + 0.18, 1.06, 0.24, false);
    }
    return g;
  }

  // 5. Tanaman Hias Indoor dalam Pot Keramik
  function createPottedPlant(scale = 1.0) {
    const g = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: 0xd9cbb8, roughness: 0.65 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2b20, roughness: 0.92 });
    const leafA = Ch4AnimeShader.createClothMaterial({ color: 0x4f8a5b, roughness: 0.72, noWeave: true });
    const leafB = Ch4AnimeShader.createClothMaterial({ color: 0x6ba670, roughness: 0.70, noWeave: true });

    addCyl(g, 0.20 * scale, 0.14 * scale, 0.36 * scale, 16, potMat, 0, 0.18 * scale, 0);
    addCyl(g, 0.215 * scale, 0.215 * scale, 0.04 * scale, 16, potMat, 0, 0.35 * scale, 0);
    addCyl(g, 0.185 * scale, 0.185 * scale, 0.02 * scale, 14, soilMat, 0, 0.355 * scale, 0, false);
    addCyl(g, 0.022 * scale, 0.030 * scale, 0.52 * scale, 8, soilMat, 0, 0.58 * scale, 0);

    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const tier = i % 3;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 12, 10), i % 2 === 0 ? leafA : leafB);
      leaf.scale.set(1.35, 0.38, 0.75);
      leaf.position.set(Math.cos(a) * 0.14 * scale, (0.54 + tier * 0.14) * scale, Math.sin(a) * 0.14 * scale);
      leaf.rotation.set(0.28, -a, 0.32);
      leaf.castShadow = true;
      g.add(leaf);
    }
    return g;
  }

  // 6. Bangku Kayu & Besi Tempa (Koridor / Rooftop)
  function createBench(width = 1.65) {
    const g = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x8f623f, roughness: 0.58 });
    const iron = new THREE.MeshStandardMaterial({ color: 0x263142, roughness: 0.42, metalness: 0.62 });

    for (let s = 0; s < 3; s++) {
      addBox(g, width, 0.045, 0.13, wood, 0, 0.46, -0.14 + s * 0.14);
      addBox(g, width, 0.11, 0.038, wood, 0, 0.64 + s * 0.13, -0.23);
    }
    [-width * 0.41, width * 0.41].forEach((lx) => {
      addBox(g, 0.055, 0.46, 0.055, iron, lx, 0.23, 0.15);
      addBox(g, 0.055, 0.94, 0.055, iron, lx, 0.47, -0.22);
      addBox(g, 0.05, 0.045, 0.42, iron, lx, 0.43, -0.03, false);
    });
    return g;
  }

  // 7. Tas Sekolah Kulit Jepang / Satchel
  function createSchoolBag(colorHex = 0x4a332a) {
    const g = new THREE.Group();
    const leather = Ch4AnimeShader.createClothMaterial({ color: colorHex, roughness: 0.52, noWeave: true });
    const metal = new THREE.MeshStandardMaterial({ color: 0xe6c167, roughness: 0.25, metalness: 0.78 });
    addBox(g, 0.38, 0.26, 0.14, leather, 0, 0.13, 0);
    addBox(g, 0.39, 0.09, 0.15, leather, 0, 0.225, 0.004);
    [-0.10, 0.10].forEach((sx) => {
      addBox(g, 0.024, 0.14, 0.156, leather, sx, 0.18, 0.004, false);
      addBox(g, 0.030, 0.024, 0.016, metal, sx, 0.13, 0.082, false);
    });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 16, Math.PI), leather);
    handle.position.set(0, 0.27, 0);
    g.add(handle);
    return g;
  }

  // 8. Kaleng Minuman Teh Hangat / Kopi Susu
  function createDrinkCan(colorHex = 0xf4c57a) {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.28, metalness: 0.48 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.20, metalness: 0.85 });
    addCyl(g, 0.031, 0.031, 0.115, 16, bodyMat, 0, 0.058, 0);
    addCyl(g, 0.030, 0.031, 0.008, 16, rimMat, 0, 0.118, 0, false);
    addCyl(g, 0.031, 0.029, 0.008, 16, rimMat, 0, 0.004, 0, false);
    return g;
  }

  // 9. Pohon Kampus Berlapis (untuk halaman di balik jendela koridor/kelas & sekitar gedung)
  function createStylizedTree(scale = 1.0) {
    const g = new THREE.Group();
    const bark = new THREE.MeshStandardMaterial({ color: 0x5c4232, roughness: 0.90 });
    const l1 = Ch4AnimeShader.createClothMaterial({ color: 0x528f5c, roughness: 0.76, noWeave: true });
    const l2 = Ch4AnimeShader.createClothMaterial({ color: 0x70ad72, roughness: 0.74, noWeave: true });

    addCyl(g, 0.13 * scale, 0.20 * scale, 2.3 * scale, 10, bark, 0, 1.15 * scale, 0);
    [
      [0, 2.8, 0, 1.12, l1],
      [-0.52, 2.5, 0.30, 0.80, l2],
      [0.52, 2.55, -0.28, 0.82, l2],
      [0.15, 2.6, 0.48, 0.74, l1],
      [-0.18, 3.25, -0.14, 0.76, l2]
    ].forEach(([cx, cy, cz, r, mt]) => {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(r * scale, 14, 12), mt);
      sp.scale.set(1.08, 0.88, 1.04);
      sp.position.set(cx * scale, cy * scale, cz * scale);
      sp.castShadow = true;
      g.add(sp);
    });
    return g;
  }

  // 10. Lampu Dinding / Plafon Koridor Hangat
  function createWarmWallSconce() {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x262f40, roughness: 0.45, metalness: 0.65 });
    const shade = new THREE.MeshStandardMaterial({ color: 0xfff3d8, emissive: 0xffcf87, emissiveIntensity: 0.92, roughness: 0.3 });
    addBox(g, 0.05, 0.22, 0.12, metal, 0, 0, 0, false);
    addCyl(g, 0.08, 0.10, 0.24, 14, shade, 0.09, 0.02, 0, false);
    return g;
  }

  return {
    boxGeo,
    cylGeo,
    addBox,
    addCyl,
    createArchitecturalDoor,
    createFramedWindow,
    createStudentDeskSet,
    createLockerBank,
    createPottedPlant,
    createBench,
    createSchoolBag,
    createDrinkCan,
    createStylizedTree,
    createWarmWallSconce
  };
})();
