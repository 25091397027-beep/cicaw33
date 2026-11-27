/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   ULTRA-HD 3D ENVIRONMENT & INTERACTIVE STAGE BUILDER
   (assets/chapter5/environments/ch5_world.js)
   - Integrates ALL 29 Gemini .glb 3D assets (9 Environments + 20 Props) and
     ALL 10 Gemini .json VFX/Lighting presets via Chapter5AssetManager.
   - Enriches each scene with 360°-enclosed anime semi-realistic architecture,
     sky domes, distant backdrops, high-res anisotropic PBR floors/walls,
     volumetric light rays, floating dust/leaves, swaying curtains, and
     glowing interactive 3D mission rings.
============================================================================ */
"use strict";

window.Ch5WorldBuilder = (function () {
  function _markDisposable(obj) {
    obj.traverse((n) => {
      n.userData.ch5Disposable = true;
    });
    return obj;
  }

  function _makeSkyDome(topHex, midHex, botHex) {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 512;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0.0, topHex);
    gr.addColorStop(0.52, midHex);
    gr.addColorStop(1.0, botHex);
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.userData = { ch5Disposable: true };
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false, fog: false });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(62, 28, 20), mat);
    dome.name = "Ch5_SkyDome";
    return _markDisposable(dome);
  }

  function _makePbrBox(w, h, d, kind, repeat, pos, rot, opts = {}) {
    const AM = window.Chapter5AssetManager;
    const set = AM.getHiResPBRSet(kind);
    const map = set.map.clone(); map.repeat.set(repeat[0], repeat[1]); map.needsUpdate = true;
    const nMap = set.normalMap.clone(); nMap.repeat.set(repeat[0], repeat[1]); nMap.needsUpdate = true;
    const rMap = set.roughnessMap.clone(); rMap.repeat.set(repeat[0], repeat[1]); rMap.needsUpdate = true;
    map.userData = { ch5Disposable: true };
    nMap.userData = { ch5Disposable: true };
    rMap.userData = { ch5Disposable: true };

    const mat = new THREE.MeshStandardMaterial({
      map,
      normalMap: nMap,
      normalScale: new THREE.Vector2(opts.normalScale || 0.65, opts.normalScale || 0.65),
      roughnessMap: rMap,
      color: opts.color !== undefined ? opts.color : 0xffffff,
      roughness: opts.roughness !== undefined ? opts.roughness : 0.72,
      metalness: opts.metalness !== undefined ? opts.metalness : 0.05,
      envMapIntensity: opts.envMapIntensity !== undefined ? opts.envMapIntensity : 0.45
    });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    m.castShadow = opts.castShadow !== false;
    m.receiveShadow = true;
    return _markDisposable(m);
  }

  function _makeDustOrLeaves(count, bounds, opts = {}) {
    const pts = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pts[i * 3] = bounds.xMin + Math.random() * (bounds.xMax - bounds.xMin);
      pts[i * 3 + 1] = bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
      pts[i * 3 + 2] = bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const mat = new THREE.PointsMaterial({
      color: opts.color || 0xfff3d6,
      size: opts.size || 0.045,
      transparent: true,
      opacity: opts.opacity || 0.65,
      depthWrite: false
    });
    const p = new THREE.Points(geo, mat);
    p.userData = {
      ch5Disposable: true,
      isParticles: true,
      bounds,
      speedY: opts.speedY || -0.09,
      sway: opts.sway || 0.18
    };
    return p;
  }

  function _makeSunBeam(w, h, colorHex, opacity, pos, rot) {
    const c = document.createElement("canvas");
    c.width = 64; c.height = 256;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0.0, "rgba(255,238,196,0.58)");
    gr.addColorStop(0.55, "rgba(255,232,184,0.22)");
    gr.addColorStop(1.0, "rgba(255,232,184,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.userData = { ch5Disposable: true };
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: colorHex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    m.userData = { ch5Disposable: true };
    return m;
  }

  function _makeSignPlaque(title, subtitle, w = 1.2, h = 0.42, bg = "#1c2940", accent = "#f4c57a") {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 192;
    const ctx = c.getContext("2d");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.strokeRect(10, 10, 492, 172);
    ctx.fillStyle = "#fff8ee"; ctx.font = "bold 40px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText(title, 256, 86);
    ctx.fillStyle = accent; ctx.font = "600 24px sans-serif";
    ctx.fillText(subtitle, 256, 138);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 16;
    tex.userData = { ch5Disposable: true };
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.04),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42 })
    );
    m.castShadow = true;
    return _markDisposable(m);
  }

  function _applySceneLighting(app, presetName) {
    const w = app.world;
    const scene = app.scene;
    const presets = {
      scene_1: {
        fogCol: 0xdce6f2, fogNear: 12, fogFar: 46,
        hemiSky: 0xeef6ff, hemiGround: 0x8a7562, hemiInt: 0.72,
        dirCol: 0xffe4bc, dirInt: 1.32, dirPos: [8, 12, 5],
        rimCol: 0xaed2ff, rimInt: 0.48, rimPos: [-7, 6, -8],
        fillCol: 0xfff5e8, fillInt: 0.28, exposure: 0.98
      },
      scene_2: {
        fogCol: 0xd7e7f7, fogNear: 16, fogFar: 55,
        hemiSky: 0xeaf5ff, hemiGround: 0x7c6f5e, hemiInt: 0.78,
        dirCol: 0xfff6e5, dirInt: 1.36, dirPos: [9, 15, 8],
        rimCol: 0x9ec8f5, rimInt: 0.46, rimPos: [-9, 7, -9],
        fillCol: 0xfff8ef, fillInt: 0.26, exposure: 0.98
      },
      scene_3: {
        fogCol: 0x262134, fogNear: 14, fogFar: 44,
        hemiSky: 0xffe9c8, hemiGround: 0x4b3830, hemiInt: 0.66,
        dirCol: 0xffd79a, dirInt: 1.18, dirPos: [5, 13, 7],
        rimCol: 0xf4c57a, rimInt: 0.52, rimPos: [-6, 6, -8],
        fillCol: 0xffecd2, fillInt: 0.30, exposure: 0.97
      },
      scene_4: {
        fogCol: 0x453344, fogNear: 11, fogFar: 38,
        hemiSky: 0xffd7b0, hemiGround: 0x483636, hemiInt: 0.64,
        dirCol: 0xffb36e, dirInt: 1.34, dirPos: [-10, 8, 2],
        rimCol: 0xffcc94, rimInt: 0.55, rimPos: [-8, 5, -4],
        fillCol: 0xffe6cc, fillInt: 0.25, exposure: 0.96
      },
      scene_5: {
        fogCol: 0x182038, fogNear: 12, fogFar: 48,
        hemiSky: 0x7a93c4, hemiGround: 0x2a2433, hemiInt: 0.56,
        dirCol: 0xffbd82, dirInt: 0.76, dirPos: [-10, 7, -8],
        rimCol: 0xffcf7d, rimInt: 0.62, rimPos: [6, 5, 6],
        fillCol: 0xffe3b8, fillInt: 0.28, exposure: 0.99
      }
    };
    const p = presets[presetName] || presets.scene_1;
    scene.background = new THREE.Color(p.fogCol);
    scene.fog = new THREE.Fog(p.fogCol, p.fogNear, p.fogFar);
    w.hemiLight.color.setHex(p.hemiSky);
    w.hemiLight.groundColor.setHex(p.hemiGround);
    w.hemiLight.intensity = p.hemiInt;
    w.dirLight.color.setHex(p.dirCol);
    w.dirLight.intensity = p.dirInt;
    w.dirLight.position.set(p.dirPos[0], p.dirPos[1], p.dirPos[2]);
    w.rimLight.color.setHex(p.rimCol);
    w.rimLight.intensity = p.rimInt;
    w.rimLight.position.set(p.rimPos[0], p.rimPos[1], p.rimPos[2]);
    w.charFillLight.color.setHex(p.fillCol);
    w.charFillLight.intensity = p.fillInt;
    app.renderer.toneMappingExposure = p.exposure;
  }

  /* =========================================================================
     BUILD SCENE 1 — MORNING APARTMENT CORRIDOR & SUNLIT GALLERY
  ========================================================================= */
  async function buildScene1(app, quality) {
    const AM = window.Chapter5AssetManager;
    await AM.preloadAssetList([
      "ch5_env_apartment_corridor",
      "ch5_env_apartment_courtyard_morning",
      "ch5_prop_school_bag",
      "ch5_prop_notebook",
      "ch5_prop_smartphone",
      "ch5_vfx_morning_sunlight",
      "ch5_vfx_window_light_rays",
      "ch5_vfx_glass_reflection"
    ]);
    _applySceneLighting(app, "scene_1");

    const root = new THREE.Group();
    root.name = "Ch5_Scene1_MorningCorridor";
    const props = {};
    const dynamicUpdaters = [];

    root.add(_makeSkyDome("#7fb2e5", "#cbe2f7", "#ffe8c8"));

    // Core Gemini GLB: Apartment Corridor (Units 302 at z=-1.55 & 301 at z=+1.55)
    const corr = await AM.instantiateGLB("ch5_env_apartment_corridor", { position: [0, 0, 0] });
    root.add(corr);

    // Core Gemini GLB: Morning Apartment Courtyard visible below/outside sunlit gallery!
    const yard = await AM.instantiateGLB("ch5_env_apartment_courtyard_morning", { position: [8.8, -2.4, 0], rotation: [0, -Math.PI / 2, 0] });
    root.add(yard);

    // Enclose right gallery parapet + tall morning glass windows + south stairwell exit wall so 360° camera has zero void!
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xd4ecff, transparent: true, opacity: 0.28, roughness: 0.08, metalness: 0.30 });
    root.add(_makePbrBox(0.22, 1.08, 10.0, "plaster_warm", [4, 1], [2.48, 0.54, 0]));
    root.add(_makePbrBox(0.26, 0.08, 10.0, "wood_warm", [4, 1], [2.48, 1.10, 0]));
    root.add(_makePbrBox(0.22, 0.55, 10.0, "plaster_warm", [4, 1], [2.48, 3.12, 0]));
    [-3.6, -1.2, 1.2, 3.6].forEach((z) => {
      root.add(_makePbrBox(0.14, 1.85, 0.12, "wood_warm", [1, 2], [2.48, 2.0, z]));
    });
    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 1.75), glassMat);
    winGlass.position.set(2.40, 2.0, 0);
    winGlass.rotation.y = -Math.PI / 2;
    root.add(_markDisposable(winGlass));

    // South lobby stairs archway wall (z = +5.0) + exit sign
    root.add(_makePbrBox(5.2, 3.4, 0.24, "plaster_warm", [3, 2], [0, 1.7, 5.0]));
    const stairDoor = _makePbrBox(1.5, 2.35, 0.10, "wood_warm", [1, 2], [0, 1.175, 4.84]);
    root.add(stairDoor);
    const exitSign = _makeSignPlaque("TANGGA LOBI ↓", "Menuju Halaman & Sekolah", 0.95, 0.28, "#1f334d", "#6ee7b7");
    exitSign.position.set(0, 2.62, 4.84);
    exitSign.rotation.y = Math.PI;
    root.add(exitSign);

    // Small entryway console table right by Unit 302 (Rizka's door z = -1.55) holding her school bag & forgotten notebook!
    const consoleTbl = _makePbrBox(0.46, 0.74, 0.88, "wood_warm", [1, 1], [-1.98, 0.37, -2.75]);
    root.add(consoleTbl);

    props.bag = await AM.instantiateGLB("ch5_prop_school_bag", { position: [-1.95, 0.75, -2.58], rotation: [0, Math.PI / 2, 0], uniqueMaterials: true });
    props.phone = await AM.instantiateGLB("ch5_prop_smartphone", { position: [-1.92, 0.75, -2.92], rotation: [-Math.PI / 2, 0, 0.4], uniqueMaterials: true });
    // Forgotten literature/event notebook on the window ledge shelf at z = -3.95
    const windowBench = _makePbrBox(0.52, 0.56, 1.25, "wood_warm", [2, 1], [2.05, 0.28, -3.55]);
    root.add(windowBench);
    props.forgottenBook = await AM.instantiateGLB("ch5_prop_notebook", { position: [2.02, 0.57, -3.55], rotation: [0, -0.35, 0], scale: 1.25, uniqueMaterials: true });
    root.add(props.bag, props.phone, props.forgottenBook);

    // Morning sunbeams streaming across the corridor floor
    [-2.4, 0.4, 2.8].forEach((z) => {
      root.add(_makeSunBeam(1.8, 4.2, 0xffe6b8, 0.16, [0.95, 1.65, z], [0, Math.PI / 2, 0.62]));
    });
    if (quality !== "low") {
      const dust = _makeDustOrLeaves(quality === "medium" ? 45 : 90, { xMin: -2.1, xMax: 2.2, yMin: 0.2, yMax: 3.1, zMin: -4.4, zMax: 4.4 }, { color: 0xfff0c8, size: 0.032, opacity: 0.55 });
      root.add(dust);
      dynamicUpdaters.push(dust);
    }

    return {
      root,
      props,
      dynamicUpdaters,
      bounds: { minX: -1.85, maxX: 1.85, minZ: -4.25, maxZ: 4.35 },
      surface: "tile"
    };
  }

  /* =========================================================================
     BUILD SCENE 2 — SCHOOLYARD, LOCKERS, & CORRIDOR (EVENT PREP HUB)
  ========================================================================= */
  async function buildScene2(app, quality) {
    const AM = window.Chapter5AssetManager;
    await AM.preloadAssetList([
      "ch5_env_school_corridor",
      "ch5_env_school_locker_area",
      "ch5_env_event_prep_room",
      "ch5_prop_school_locker",
      "ch5_prop_bulletin_board",
      "ch5_prop_courtyard_bench",
      "ch5_prop_event_poster",
      "ch5_prop_supply_box",
      "ch5_prop_notebook",
      "ch5_prop_decor_ribbon",
      "ch5_prop_marker_set",
      "ch5_prop_scissors",
      "ch5_prop_cardboard_box",
      "ch5_vfx_tree_shadows",
      "ch5_vfx_glass_reflection"
    ]);
    _applySceneLighting(app, "scene_2");

    const root = new THREE.Group();
    root.name = "Ch5_Scene2_SchoolRoutine";
    const props = {};
    const dynamicUpdaters = [];

    root.add(_makeSkyDome("#5e9be0", "#a8d2f7", "#eef6ff"));

    // Unified spacious school event hub:
    // - North Wing (z = -6.5 .. -2.0): School Corridor + Door to Aula (East x = +5.6)
    // - West Wing (x = -5.8 .. -2.0, z = -1.5 .. +3.5): Locker Area
    // - South Courtyard Terrace (z = +1.5 .. +6.5): Sunny Schoolyard Veranda + Benches + Trees
    root.add(_makePbrBox(14.0, 0.14, 14.0, "tile_corridor", [7, 7], [0, -0.07, 0]));
    // Hardwood corridor runner on North wing
    root.add(_makePbrBox(13.6, 0.03, 4.2, "wood_aula", [7, 2], [0, 0.015, -4.8]));

    const corr = await AM.instantiateGLB("ch5_env_school_corridor", { position: [-0.8, 0.02, -5.0] });
    // Open south colonnade facing courtyard & give corridor windows bright sky reflections
    corr.traverse((n) => {
      if (n.isMesh) {
        if (n.position.z > 1.5) n.visible = false;
        if (n.material && n.material.transparent) {
          n.material = n.material.clone();
          n.material.color.setHex(0xbbe0ff);
          n.material.emissive = new THREE.Color(0x5b8fc4);
          n.material.emissiveIntensity = 0.35;
          n.material.opacity = 0.38;
        }
      }
    });
    const lockers = await AM.instantiateGLB("ch5_env_school_locker_area", { position: [-4.4, 0.02, 1.2], rotation: [0, Math.PI / 2, 0] });
    root.add(corr, lockers);

    // East Wall: Double Doors to Aula Sekolah (Delivery Target #1 for Poster!)
    root.add(_makePbrBox(0.28, 3.6, 13.6, "plaster_school", [5, 2], [6.7, 1.8, 0]));
    const aulaDoor = _makePbrBox(0.14, 2.55, 2.2, "wood_warm", [2, 2], [6.52, 1.275, -3.6]);
    root.add(aulaDoor);
    const aulaSign = _makeSignPlaque("AULA SEKOLAH →", "Area Persiapan Autumn Fest", 1.35, 0.36, "#1c2940", "#f4c57a");
    aulaSign.position.set(6.50, 2.85, -3.6);
    aulaSign.rotation.y = -Math.PI / 2;
    root.add(aulaSign);
    // Poster easel stand right beside Aula entrance!
    const posterStand = _makePbrBox(0.14, 1.45, 0.78, "wood_warm", [1, 1], [6.15, 0.725, -2.05]);
    root.add(posterStand);

    // Bulletin board + Sena's OSIS table (Center-East Corridor)
    props.bulletin = await AM.instantiateGLB("ch5_prop_bulletin_board", { position: [3.45, 1.15, -6.72] });
    const osisTable = _makePbrBox(1.35, 0.74, 0.68, "wood_warm", [1, 1], [2.8, 0.37, -1.0]);
    root.add(props.bulletin, osisTable);

    // Hana's Schoolyard Veranda Table + Benches + Trees (South sunny terrace)
    props.bench1 = await AM.instantiateGLB("ch5_prop_courtyard_bench", { position: [-2.2, 0, 5.1] });
    props.bench2 = await AM.instantiateGLB("ch5_prop_courtyard_bench", { position: [3.2, 0, 5.1] });
    const hanaTable = _makePbrBox(1.45, 0.74, 0.75, "wood_warm", [1, 1], [-1.8, 0.37, 2.85]);
    root.add(props.bench1, props.bench2, hanaTable);

    // Decorative green trees & south courtyard low fence so horizon looks lush & complete
    root.add(_makePbrBox(14.0, 1.05, 0.24, "plaster_warm", [6, 1], [0, 0.525, 6.7]));
    [-5.2, 0.5, 5.2].forEach((x) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.88 }));
      trunk.position.set(x, 1.2, 6.1);
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 1), new THREE.MeshStandardMaterial({ color: 0x458058, roughness: 0.78 }));
      canopy.position.set(x, 3.05, 6.1);
      canopy.castShadow = true;
      root.add(_markDisposable(trunk), _markDisposable(canopy));
    });

    // === 3 INTERACTIVE COLLECTIBLE SUPPLIES (Real Gemini .GLB props!) ===
    // 1. Poster Acara (on Locker Bench, West wing)
    props.itemPoster = await AM.instantiateGLB("ch5_prop_event_poster", { position: [-3.75, 0.50, 1.25], rotation: [-0.35, Math.PI / 2, 0], scale: 0.82, uniqueMaterials: true });
    // 2. Kotak Perlengkapan Dekorasi (on Corridor Prep Cart, North-West)
    const prepCart = _makePbrBox(0.95, 0.68, 0.62, "wood_warm", [1, 1], [-3.2, 0.34, -4.8]);
    root.add(prepCart);
    props.itemDecorBox = await AM.instantiateGLB("ch5_prop_supply_box", { position: [-3.2, 0.69, -4.8], uniqueMaterials: true });
    const extraRibbon = await AM.instantiateGLB("ch5_prop_decor_ribbon", { position: [-2.88, 0.70, -4.75] });
    root.add(extraRibbon);
    // 3. Catatan Susunan Acara (on Bench near Schoolyard Courtyard, South-East)
    const notePedestal = _makePbrBox(0.65, 0.64, 0.52, "wood_warm", [1, 1], [4.5, 0.32, 2.4]);
    root.add(notePedestal);
    props.itemEventNotes = await AM.instantiateGLB("ch5_prop_notebook", { position: [4.5, 0.65, 2.4], scale: 1.35, uniqueMaterials: true });

    // Delivered visual placeholders (hidden until player delivers each item to its right target!)
    props.deliveredPoster = await AM.instantiateGLB("ch5_prop_event_poster", { position: [6.05, 0.88, -2.05], rotation: [0, -Math.PI / 2, 0], scale: 0.92 });
    props.deliveredPoster.visible = false;
    props.deliveredDecor = await AM.instantiateGLB("ch5_prop_supply_box", { position: [-1.8, 0.75, 2.85] });
    props.deliveredDecor.visible = false;
    props.deliveredNotes = await AM.instantiateGLB("ch5_prop_notebook", { position: [2.8, 0.75, -1.0], scale: 1.3 });
    props.deliveredNotes.visible = false;

    root.add(props.itemPoster, props.itemDecorBox, props.itemEventNotes, props.deliveredPoster, props.deliveredDecor, props.deliveredNotes);

    return {
      root,
      props,
      dynamicUpdaters,
      bounds: { minX: -5.6, maxX: 5.9, minZ: -5.6, maxZ: 5.6 },
      surface: "wood"
    };
  }

  /* =========================================================================
     BUILD SCENE 3 — SCHOOL HALL / AULA SEKOLAH (DECORATION PUZZLE)
  ========================================================================= */
  async function buildScene3(app, quality) {
    const AM = window.Chapter5AssetManager;
    await AM.preloadAssetList([
      "ch5_env_school_aula",
      "ch5_env_event_prep_room",
      "ch5_prop_decor_blueprint_clipboard",
      "ch5_prop_event_poster",
      "ch5_prop_decor_ribbon",
      "ch5_prop_decor_cloth",
      "ch5_prop_decor_string_lights",
      "ch5_prop_decor_paper",
      "ch5_prop_aula_table_chair",
      "ch5_prop_cardboard_box",
      "ch5_prop_tape_roll",
      "ch5_vfx_aula_lighting",
      "ch5_vfx_fine_dust_particles"
    ]);
    _applySceneLighting(app, "scene_3");

    const root = new THREE.Group();
    root.name = "Ch5_Scene3_SchoolAula";
    const props = {};
    const dynamicUpdaters = [];

    // Hero Gemini GLB: School Hall / Aula Sekolah (14m x 5.2m x 12m)
    const aula = await AM.instantiateGLB("ch5_env_school_aula", { position: [0, 0, 0] });
    root.add(aula);

    // Enclose East Wall (x = +6.9), South Entrance Wall (z = +5.9), & Vaulted Ceiling (y = 5.25)
    root.add(_makePbrBox(0.28, 5.2, 12.0, "plaster_school", [4, 2], [6.9, 2.6, 0]));
    root.add(_makePbrBox(14.0, 5.2, 0.28, "plaster_school", [5, 2], [0, 2.6, 5.9]));
    root.add(_makePbrBox(14.2, 0.22, 12.2, "plaster_warm", [4, 4], [0, 5.28, 0]));
    // Double wooden entrance doors at South wall
    root.add(_makePbrBox(2.4, 2.6, 0.14, "wood_warm", [2, 2], [0, 1.3, 5.74]));

    // Warm practical stage point lights
    const stageGlow = new THREE.PointLight(0xffcf78, 0.95, 16, 1.5);
    stageGlow.position.set(0, 3.8, -2.6);
    root.add(stageGlow);

    // Extra seating rows & cardboard prep boxes using Gemini GLBs
    const tcLeft = await AM.instantiateGLB("ch5_prop_aula_table_chair", { position: [-4.5, 0, 3.2] });
    const tcRight = await AM.instantiateGLB("ch5_prop_aula_table_chair", { position: [4.5, 0, 3.2] });
    const box1 = await AM.instantiateGLB("ch5_prop_cardboard_box", { position: [-5.6, 0, 0.4], rotation: [0, 0.3, 0] });
    const box2 = await AM.instantiateGLB("ch5_prop_cardboard_box", { position: [5.5, 0, 0.6], rotation: [0, -0.4, 0] });
    root.add(tcLeft, tcRight, box1, box2);

    // === CENTRAL BLUEPRINT DRAFTING PODIUM (Step 1: Periksa Papan Rancangan!) ===
    const blueprintDesk = _makePbrBox(1.15, 0.84, 0.72, "wood_warm", [1, 1], [0, 0.42, 0.2]);
    root.add(blueprintDesk);
    props.blueprint = await AM.instantiateGLB("ch5_prop_decor_blueprint_clipboard", {
      position: [0, 0.86, 0.2],
      rotation: [0.22, 0, 0],
      scale: 1.85,
      uniqueMaterials: true
    });
    const blueprintSign = _makeSignPlaque("PAPAN RANCANGAN AULA", "Periksa Posisi 4 Dekorasi", 1.05, 0.28, "#1c2940", "#f4c57a");
    blueprintSign.position.set(0, 0.52, 0.58);
    root.add(props.blueprint, blueprintSign);

    // === 4 DECORATION ZONES IN THE AULA (Initially SWAPPED / MISPLACED!) ===
    // True Layout Plan:
    // - Zone 1 (Pilar Panggung Kiri, [-3.8, 0, -1.9]): Pita Emas & Merah Panggung (ribbon)
    // - Zone 2 (Meja Sambutan Depan, [-2.6, 0, 1.4]): Taplak Kain Burgundy Rapi (cloth)
    // - Zone 3 (Stand Pengumuman Kanan, [3.8, 0, -1.6]): Poster Utama Autumn Fest (poster)
    // - Zone 4 (Lengkungan Tengah Aula, [2.6, 0, 1.4]): Untaian Lampu Hangat (lights)
    const easelRight = _makePbrBox(0.16, 1.55, 0.82, "wood_warm", [1, 1], [3.8, 0.775, -1.65]);
    const pillarPedLeft = _makePbrBox(0.68, 0.92, 0.68, "wood_warm", [1, 1], [-3.8, 0.46, -1.95]);
    root.add(easelRight, pillarPedLeft);

    // Wrong initial items (visibly swapped!) vs Fixed items (shown as each zone is corrected!)
    props.zone1Wrong = await AM.instantiateGLB("ch5_prop_event_poster", { position: [-3.8, 0.94, -1.95], rotation: [0, 0.35, 0.18], scale: 0.8 });
    props.zone1Right = await AM.instantiateGLB("ch5_prop_decor_ribbon", { position: [-3.8, 0.96, -1.95], scale: 1.9 });
    props.zone1Right.visible = false;

    props.zone2Wrong = await AM.instantiateGLB("ch5_prop_decor_string_lights", { position: [-2.6, 0.82, 1.4], rotation: [Math.PI / 2, 0, 0.2], scale: 0.52 });
    props.zone2Right = await AM.instantiateGLB("ch5_prop_decor_cloth", { position: [-2.6, 0.12, 1.4], scale: 1.05 });
    props.zone2Right.visible = false;

    props.zone3Wrong = await AM.instantiateGLB("ch5_prop_decor_paper", { position: [3.8, 0.82, -1.60], scale: 1.5 });
    props.zone3Right = await AM.instantiateGLB("ch5_prop_event_poster", { position: [3.8, 0.92, -1.52], scale: 0.95 });
    props.zone3Right.visible = false;

    const archFrame = _makePbrBox(2.35, 2.25, 0.12, "wood_warm", [2, 2], [2.6, 1.125, 1.4]);
    root.add(archFrame);
    props.zone4Wrong = await AM.instantiateGLB("ch5_prop_cardboard_box", { position: [2.6, 0.80, 1.4] });
    props.zone4Right = await AM.instantiateGLB("ch5_prop_decor_string_lights", { position: [2.6, 1.82, 1.48], scale: 0.68 });
    props.zone4Right.visible = false;

    root.add(
      props.zone1Wrong, props.zone1Right,
      props.zone2Wrong, props.zone2Right,
      props.zone3Wrong, props.zone3Right,
      props.zone4Wrong, props.zone4Right
    );

    if (quality !== "low") {
      const dust = _makeDustOrLeaves(quality === "medium" ? 65 : 130, { xMin: -6.0, xMax: 6.0, yMin: 0.3, yMax: 4.6, zMin: -5.0, zMax: 5.0 }, { color: 0xffe9b5, size: 0.038, opacity: 0.62 });
      root.add(dust);
      dynamicUpdaters.push(dust);
    }

    return {
      root,
      props,
      dynamicUpdaters,
      bounds: { minX: -6.1, maxX: 6.1, minZ: -1.6, maxZ: 5.1 },
      surface: "hall"
    };
  }

  /* =========================================================================
     BUILD SCENE 4 — EMPTY CLASSROOM (GOLDEN AFTERNOON — A LITTLE SPACE)
  ========================================================================= */
  async function buildScene4(app, quality) {
    const AM = window.Chapter5AssetManager;
    await AM.preloadAssetList([
      "ch5_env_empty_classroom",
      "ch5_prop_scissors",
      "ch5_prop_tape_roll",
      "ch5_prop_marker_set",
      "ch5_prop_decor_paper",
      "ch5_prop_supply_box",
      "ch5_prop_cardboard_box",
      "ch5_vfx_afternoon_sunlight",
      "ch5_vfx_window_light_rays",
      "ch5_vfx_fine_dust_particles",
      "ch5_vfx_gentle_wind"
    ]);
    _applySceneLighting(app, "scene_4");

    const root = new THREE.Group();
    root.name = "Ch5_Scene4_EmptyClassroom";
    const props = {};
    const dynamicUpdaters = [];

    root.add(_makeSkyDome("#3c4b78", "#d9895b", "#ffd79c"));

    // Core Gemini GLB: Empty Classroom (9.0m x 3.4m x 7.4m, windows along West wall x = -4.3)
    const room = await AM.instantiateGLB("ch5_env_empty_classroom", { position: [0, 0, 0] });
    root.add(room);

    // Add sleek steel desk legs under all 9 modular student desks so zero tabletops float
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3648, roughness: 0.38, metalness: 0.68 });
    for (let r = 0; r < 3; r++) {
      for (let c = -1; c <= 1; c++) {
        const dx = c * 1.9, dz = -0.7 + r * 1.6;
        [[-0.29, -0.19], [0.29, -0.19], [-0.29, 0.19], [0.29, 0.19]].forEach(([ox, oz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.70, 8), legMat);
          leg.position.set(dx + ox, 0.35, dz + oz);
          leg.castShadow = true;
          root.add(_markDisposable(leg));
        });
      }
    }

    // Enclose East Corridor Wall (x = +4.4), South Back Storage Wall (z = +3.6), & Ceiling (y = 3.42)
    root.add(_makePbrBox(0.22, 3.4, 7.4, "plaster_school", [4, 2], [4.4, 1.7, 0]));
    root.add(_makePbrBox(9.0, 3.4, 0.22, "plaster_school", [4, 2], [0, 1.7, 3.6]));
    root.add(_makePbrBox(9.2, 0.18, 7.6, "plaster_warm", [3, 3], [0, 3.45, 0]));
    // Sliding wooden classroom door on East wall
    root.add(_makePbrBox(0.10, 2.25, 1.35, "wood_warm", [1, 2], [4.26, 1.125, -2.1]));

    // Back Storage Cabinet Shelf (z = +3.15, x = +2.4) where Rizka returns leftover supplies!
    const storageRack = _makePbrBox(1.85, 1.45, 0.55, "wood_warm", [2, 1], [2.4, 0.725, 3.15]);
    root.add(storageRack);
    const rackLabel = _makeSignPlaque("LEMARI LOGISTIK KELAS", "Simpan Sisa Perlengkapan", 1.15, 0.26, "#243148", "#f4c57a");
    rackLabel.position.set(2.4, 1.72, 3.40);
    rackLabel.rotation.y = Math.PI;
    root.add(rackLabel);

    // Leftover scattered supplies on desk at [0, 0.75, 0.9] (Step 1: Kumpulkan perlengkapan tersisa)
    props.leftoverScissors = await AM.instantiateGLB("ch5_prop_scissors", { position: [-0.14, 0.75, 0.88], scale: 1.35 });
    props.leftoverTape = await AM.instantiateGLB("ch5_prop_tape_roll", { position: [0.06, 0.75, 0.94], scale: 1.25 });
    props.leftoverMarkers = await AM.instantiateGLB("ch5_prop_marker_set", { position: [0.22, 0.75, 0.85], scale: 1.15 });
    props.leftoverPaper = await AM.instantiateGLB("ch5_prop_decor_paper", { position: [-0.05, 0.75, 0.72] });
    props.returnedBox = await AM.instantiateGLB("ch5_prop_supply_box", { position: [2.4, 1.46, 3.15] });
    props.returnedBox.visible = false;
    root.add(props.leftoverScissors, props.leftoverTape, props.leftoverMarkers, props.leftoverPaper, props.returnedBox);

    // Warm golden-hour volumetric sunbeams slanting from West windows (-4.2) across the classroom
    [-1.6, 1.2].forEach((z) => {
      root.add(_makeSunBeam(2.2, 4.6, 0xffc680, 0.19, [-2.1, 1.55, z], [0, Math.PI / 2, -0.58]));
    });

    if (quality !== "low") {
      const dust = _makeDustOrLeaves(quality === "medium" ? 55 : 110, { xMin: -3.9, xMax: 3.6, yMin: 0.2, yMax: 3.0, zMin: -3.0, zMax: 3.0 }, { color: 0xffdca8, size: 0.034, opacity: 0.65 });
      root.add(dust);
      dynamicUpdaters.push(dust);
    }

    return {
      root,
      props,
      dynamicUpdaters,
      bounds: { minX: -3.85, maxX: 3.85, minZ: -2.95, maxZ: 2.85 },
      surface: "wood"
    };
  }

  /* =========================================================================
     BUILD SCENE 5 — DUSK SCHOOLYARD & WALK HOME STREET (AFTER THE NOISE)
  ========================================================================= */
  async function buildScene5(app, quality) {
    const AM = window.Chapter5AssetManager;
    await AM.preloadAssetList([
      "ch5_env_school_courtyard_evening",
      "ch5_env_walk_home_street",
      "ch5_prop_courtyard_bench",
      "ch5_prop_street_lamp",
      "ch5_prop_bottled_drink",
      "ch5_prop_school_bag",
      "ch5_vfx_moving_leaves",
      "ch5_vfx_night_ambient_lights"
    ]);
    _applySceneLighting(app, "scene_5");

    const root = new THREE.Group();
    root.name = "Ch5_Scene5_EveningWalkHome";
    const props = {};
    const dynamicUpdaters = [];

    root.add(_makeSkyDome("#0f172e", "#3b3559", "#e08e67"));

    // North half (z = -6 .. +5.5): Evening School Courtyard & Gate
    const yard = await AM.instantiateGLB("ch5_env_school_courtyard_evening", { position: [0, 0, 0] });
    root.add(yard);

    // South half (z = +5.5 .. +17.5): Homeward Dusk Street rotated along Z so player walks straight out the gate along the lit street!
    const street = await AM.instantiateGLB("ch5_env_walk_home_street", {
      position: [0.6, -0.02, 14.5],
      rotation: [0, Math.PI / 2, 0]
    });
    root.add(street);

    // Seamless stone threshold connecting school gate (z=5.2) to sidewalk/street
    root.add(_makePbrBox(8.0, 0.12, 3.6, "tile_corridor", [4, 2], [0, -0.05, 6.2]));

    // Extra glowing street lamps & cozy warm point lights along the walk home path
    const lampGate = await AM.instantiateGLB("ch5_prop_street_lamp", { position: [-2.35, 0, 6.8], rotation: [0, Math.PI / 2, 0] });
    const lampMid = await AM.instantiateGLB("ch5_prop_street_lamp", { position: [-2.35, 0, 12.8], rotation: [0, Math.PI / 2, 0] });
    const lampEnd = await AM.instantiateGLB("ch5_prop_street_lamp", { position: [-2.35, 0, 18.8], rotation: [0, Math.PI / 2, 0] });
    root.add(lampGate, lampMid, lampEnd);

    [6.8, 12.8, 18.8].forEach((z) => {
      const pl = new THREE.PointLight(0xffcf7d, 0.85, 11, 1.6);
      pl.position.set(-1.6, 3.6, z);
      root.add(pl);
    });

    // Interactive Environmental Object #1: Cozy Wayside Bench + Warm Bottled Drinks (z = 11.4)
    props.streetBench = await AM.instantiateGLB("ch5_prop_courtyard_bench", { position: [-2.25, 0.08, 11.4], rotation: [0, Math.PI / 2, 0] });
    props.drink1 = await AM.instantiateGLB("ch5_prop_bottled_drink", { position: [-2.18, 0.56, 11.15], scale: 1.2 });
    props.drink2 = await AM.instantiateGLB("ch5_prop_bottled_drink", { position: [-2.18, 0.56, 11.35], scale: 1.2 });
    root.add(props.streetBench, props.drink1, props.drink2);

    // Interactive Environmental Object #2: Neighborhood Community Notice Board (z = 16.4)
    const noticeStand = _makePbrBox(0.14, 1.55, 1.15, "wood_warm", [1, 1], [-2.30, 0.85, 16.4]);
    const noticePlaque = _makeSignPlaque("JADWAL PEKAN DEPAN", "Prakiraan Hujan & Malam Budaya", 1.08, 0.42, "#1b2840", "#9bbce0");
    noticePlaque.position.set(-2.20, 1.32, 16.4);
    noticePlaque.rotation.y = Math.PI / 2;
    root.add(noticeStand, noticePlaque);

    // Floating dusk autumn leaves drifting gently in the evening breeze
    if (quality !== "low") {
      const leaves = _makeDustOrLeaves(quality === "medium" ? 28 : 56, { xMin: -4.5, xMax: 4.5, yMin: 0.15, yMax: 4.2, zMin: -2.0, zMax: 20.0 }, { color: 0xe29a68, size: 0.085, opacity: 0.82, speedY: -0.28, sway: 0.55 });
      root.add(leaves);
      dynamicUpdaters.push(leaves);
    }

    return {
      root,
      props,
      dynamicUpdaters,
      bounds: { minX: -2.6, maxX: 2.8, minZ: -2.2, maxZ: 20.2 },
      surface: "street"
    };
  }

  function updateEnvironmentDynamics(stage, dt, elapsed) {
    if (!stage || !stage.dynamicUpdaters) return;
    stage.dynamicUpdaters.forEach((obj) => {
      if (obj.userData && obj.userData.isParticles && obj.geometry && obj.geometry.attributes.position) {
        const pos = obj.geometry.attributes.position;
        const b = obj.userData.bounds;
        const sy = obj.userData.speedY || -0.1;
        const sw = obj.userData.sway || 0.2;
        for (let i = 0; i < pos.count; i++) {
          let x = pos.getX(i) + Math.sin(elapsed * 1.3 + i * 0.7) * sw * dt;
          let y = pos.getY(i) + sy * dt;
          if (y < b.yMin) y = b.yMax;
          if (x > b.xMax) x = b.xMin;
          if (x < b.xMin) x = b.xMax;
          pos.setXY(i, x, y);
        }
        pos.needsUpdate = true;
      }
    });
  }

  async function buildScene(sceneId, app, quality) {
    if (sceneId === "scene_1") return buildScene1(app, quality);
    if (sceneId === "scene_2") return buildScene2(app, quality);
    if (sceneId === "scene_3") return buildScene3(app, quality);
    if (sceneId === "scene_4") return buildScene4(app, quality);
    return buildScene5(app, quality);
  }

  return {
    buildScene,
    updateEnvironmentDynamics
  };
})();
