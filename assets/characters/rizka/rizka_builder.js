/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   RIZKA ALIFIA PUTRI (1.61m) — ULTRA-HD HERO CHARACTER BUILDER
   (assets/characters/rizka/rizka_builder.js)
   - Kontinuitas identitas 100% dengan Chapter 1–3
   - 9 Ekspresi Wajah Penuh: neutral, small_smile (masking_smile), awkward,
     subtle_blush, holding_back, sad (disappointed), worried, jealous, happy
   - Rambut berlapis dengan bump serat helai + ayunan angin rooftop & jalan
   - Tangan 10 jari berartikulasi menggenggam Smartphone ("Ayah") / Teh Hangat
============================================================================ */
"use strict";

window.Ch4RizkaBuilder = (function () {
  const SPEC = {
    id: "rizka",
    fullName: "Rizka Alifia Putri",
    heightM: 1.61,
    headRadius: 0.110,
    palette: {
      skinBase: "#F9E2D4",
      hairRoot: "#35221F",
      hairMain: "#462E29",
      hairTip: "#68463E",
      hairHalo: "#D8AA92",
      irisTop: "#241317",
      irisMid: "#8A5236",
      irisGold: "#EEB374",
      ribbon: "#9BBCE0",
      ribbonDark: "#5B82AD",
      blazer: "#1C2940",
      shirt: "#F8F6F1",
      cardigan: "#F0E4D4",
      sock: "#1E2434",
      shoe: "#382520",
      gold: "#DEBA64"
    }
  };

  function build() {
    const Core = window.Ch4CharacterCore;
    const Shader = window.Ch4AnimeShader;
    const Tex = window.Ch4Textures;
    const P = SPEC.palette;
    const R = SPEC.headRadius;

    const root = new THREE.Group();
    root.name = "Rizka_Ch4_Root";
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const cr = new THREE.Group();
    bodyPivot.add(cr);

    // Materials
    const skinMat = Shader.createSkinMaterial({ color: P.skinBase });
    const faceTex = Core.createFaceSkinTexture({ id: "rizka_ch4", female: true, skinBase: P.skinBase, beautyMark: true });
    const faceSkinMat = Shader.createSkinMaterial({ map: faceTex, color: 0xffffff });
    const hairMat = Shader.createHairMaterial({ color: P.hairMain, haloColor: P.hairHalo, roughness: 0.40 });
    const hairDarkMat = Shader.createHairMaterial({ color: P.hairRoot, haloColor: P.hairHalo, roughness: 0.46 });
    const hairTipMat = Shader.createHairMaterial({ color: P.hairTip, haloColor: P.hairHalo, roughness: 0.36 });
    const ribbonMat = Shader.createClothMaterial({ color: P.ribbon, roughness: 0.46, noWeave: true });
    const collarBowMat = Shader.createClothMaterial({ color: P.ribbonDark, roughness: 0.45, noWeave: true });
    const goldMat = new THREE.MeshStandardMaterial({ color: P.gold, roughness: 0.44, metalness: 0.45 });
    const pearlMat = new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.16, metalness: 0.25 });
    const blazerMat = Shader.createClothMaterial({ color: P.blazer, roughness: 0.72 });
    const shirtMat = Shader.createClothMaterial({ color: P.shirt, roughness: 0.76 });
    const cardiganMat = Shader.createClothMaterial({ map: Tex.getCableKnit(P.cardigan), color: 0xffffff, roughness: 0.80, noWeave: true });
    const plaidSkirtMat = Shader.createClothMaterial({ map: Tex.getAcademyTartan(), color: 0xffffff, roughness: 0.74, noWeave: true });
    const sockMat = Shader.createClothMaterial({ color: P.sock, roughness: 0.66 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: P.shoe, roughness: 0.30, metalness: 0.12 });

    // HIPS & 22-PLEAT SKIRT WITH WIND PIVOT (y = 0.895)
    const hips = new THREE.Group();
    hips.position.set(0, 0.895, 0);
    cr.add(hips);

    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.104, 22, 16), plaidSkirtMat);
    pelvis.scale.set(1.04, 0.72, 0.80);
    pelvis.position.y = -0.022;
    hips.add(pelvis);

    const skirtPivot = new THREE.Group();
    skirtPivot.position.set(0, 0.018, 0);
    hips.add(skirtPivot);
    const skirtBuilt = Core.buildPleatedSkirt(22, 0.104, 0.170, 0.248, 0.82, plaidSkirtMat);
    skirtPivot.add(skirtBuilt.group);

    // SPINE & CHEST
    const spine = new THREE.Group();
    spine.position.set(0, 0.048, 0);
    hips.add(spine);

    const chest = new THREE.Group();
    chest.position.set(0, 0.135, 0);
    spine.add(chest);

    const torsoProfile = [
      new THREE.Vector2(0.092, -0.145),
      new THREE.Vector2(0.085, -0.055),
      new THREE.Vector2(0.114, 0.065),
      new THREE.Vector2(0.128, 0.158),
      new THREE.Vector2(0.124, 0.194),
      new THREE.Vector2(0.086, 0.218),
      new THREE.Vector2(0.042, 0.236)
    ];
    const innerTorso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 30), shirtMat);
    innerTorso.scale.set(1.04, 1.0, 0.78);
    innerTorso.castShadow = true;
    innerTorso.receiveShadow = true;
    chest.add(innerTorso);

    // Tailored Navy Blazer Shell + 3D Notched Lapels + Pocket Flaps + Crest + Gold Buttons
    const jacketGroup = new THREE.Group();
    const jProfile = [
      new THREE.Vector2(0.104, -0.155),
      new THREE.Vector2(0.096, -0.050),
      new THREE.Vector2(0.122, 0.065),
      new THREE.Vector2(0.136, 0.160),
      new THREE.Vector2(0.132, 0.196),
      new THREE.Vector2(0.094, 0.220)
    ];
    const jacketShell = new THREE.Mesh(new THREE.LatheGeometry(jProfile, 30, 0.34, Math.PI * 2 - 0.68), blazerMat);
    jacketShell.scale.set(1.05, 1.0, 0.80);
    jacketShell.castShadow = true;
    jacketShell.receiveShadow = true;
    jacketGroup.add(jacketShell);

    const lapelMeshes = [jacketShell];
    [-1, 1].forEach((s) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.033, 0.188, 0.015), blazerMat);
      lapel.position.set(s * 0.046, 0.105, 0.095);
      lapel.rotation.set(-0.12, s * 0.22, s * -0.20);
      const hemFront = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.158, 0.016), blazerMat);
      hemFront.position.set(s * 0.042, -0.068, 0.085);
      hemFront.rotation.y = s * 0.18;
      // Pocket flap detail
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.016, 0.008), blazerMat);
      pocket.position.set(s * 0.078, -0.088, 0.072);
      pocket.rotation.y = s * 0.48;
      jacketGroup.add(lapel, hemFront, pocket);
      lapelMeshes.push(lapel, hemFront, pocket);
    });

    const crest = new THREE.Mesh(new THREE.CircleGeometry(0.0125, 14), goldMat);
    crest.position.set(-0.062, 0.096, 0.102);
    crest.rotation.y = -0.25;
    crest.userData.noOutline = true;
    const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0056, 0.0056, 0.006, 12), goldMat);
    btn1.rotation.x = Math.PI / 2;
    btn1.position.set(0.016, -0.015, 0.095);
    const btn2 = btn1.clone();
    btn2.position.y = -0.068;
    const uniformAccents = new THREE.Group();
    uniformAccents.add(crest, btn1, btn2);
    jacketGroup.add(uniformAccents);
    chest.add(jacketGroup);

    // Crisp White Tailored Shirt Collar & Signature Sky-Blue Satin Ribbon Bow
    const collarGroup = new THREE.Group();
    const collarBack = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.052, 0.022, 20, 1, true, Math.PI * 0.22, Math.PI * 1.56), shirtMat);
    collarBack.position.set(0, 0.228, -0.002);
    collarBack.material = shirtMat.clone();
    collarBack.material.side = THREE.DoubleSide;
    collarBack.userData.noOutline = true;
    collarGroup.add(collarBack);
    [-1, 1].forEach((s) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.022, 0.036), shirtMat);
      col.position.set(s * 0.026, 0.220, 0.028);
      col.rotation.set(0.32, s * 0.38, s * -0.34);
      col.userData.noOutline = true;
      collarGroup.add(col);
    });
    const neckBow = Core.buildSatinBow(1.24, collarBowMat, 0.062);
    neckBow.position.set(0, 0.198, 0.080);
    neckBow.rotation.x = -0.14;
    collarGroup.add(neckBow);
    chest.add(collarGroup);

    // NECK & SCULPTED HEAD (y = 1.455)
    const neck = new THREE.Group();
    neck.position.set(0, 0.232, 0);
    chest.add(neck);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.037, 0.096, 20), skinMat);
    neckMesh.position.y = 0.042;
    neckMesh.castShadow = true;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.set(0, 0.145, 0.004);
    neck.add(head);

    const headMesh = new THREE.Mesh(Core.buildHeroHeadGeometry(R, true), faceSkinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);
    head.add(Core.buildAnimeEars(R, true, skinMat, true));

    // Jewel Eyes (1024x1024) + Lashes + Eyelids
    const eyeCfg = { id: "rizka_ch4", female: true, irisTop: P.irisTop, irisMid: P.irisMid, irisGold: P.irisGold, irisGlow: "#FFE6BE" };
    const eyeL = Core.buildHeroEye(1, R, true, Core.createHeroEyeTexture(eyeCfg, false), P.skinBase, 0x1c0f13);
    const eyeR = Core.buildHeroEye(-1, R, true, Core.createHeroEyeTexture(eyeCfg, true), P.skinBase, 0x1c0f13);
    head.add(eyeL.group, eyeR.group);

    // Feathered Arched Eyebrows
    const buildBrow = (sideSign, isRight) => {
      const bx = sideSign * R * 0.365, by = R * 0.255;
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(R * 0.39, R * 0.125),
        new THREE.MeshBasicMaterial({ map: Core.createEyebrowTexture(P.hairRoot, isRight, 0.92), transparent: true, depthWrite: false })
      );
      b.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, true) + 0.0024);
      b.rotation.y = sideSign * 0.20;
      b.userData.noOutline = true;
      b.renderOrder = 4;
      return b;
    };
    const browL = buildBrow(1, false);
    const browR = buildBrow(-1, true);
    head.add(browL, browR);

    // Conformed Soft Blush
    const blushTex = Core.createSoftBlushTexture();
    const mkBlush = (sideSign) => {
      const mat = new THREE.MeshBasicMaterial({ map: blushTex, transparent: true, opacity: 0.24, depthWrite: false });
      const bx = sideSign * R * 0.49, by = -R * 0.22;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.039, 0.024), mat);
      m.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, true) + 0.0020);
      m.rotation.y = sideSign * 0.42;
      m.userData.noOutline = true;
      m.renderOrder = 3;
      return { mesh: m, mat };
    };
    const blL = mkBlush(1), blR = mkBlush(-1);
    head.add(blL.mesh, blR.mesh);

    // 8-Morph Rose-Petal Mouth
    const mouth = Core.buildHeroMouth(R, true);
    head.add(mouth);

    // MULTI-LAYERED SILKY HAIR SYSTEM
    const hairRoot = new THREE.Group();
    head.add(hairRoot);

    const crownCap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.08, 38, 30, 0, Math.PI * 2, 0, Math.PI * 0.54), hairMat);
    crownCap.position.set(0, 0.016, -0.012);
    crownCap.rotation.x = -0.60;
    crownCap.scale.set(0.96, 1.05, 1.05);
    crownCap.castShadow = true;
    hairRoot.add(crownCap);

    const napeFill = new THREE.Mesh(new THREE.SphereGeometry(R * 0.86, 22, 16), hairDarkMat);
    napeFill.position.set(0, -0.026, -0.048);
    napeFill.scale.set(0.88, 0.92, 0.68);
    hairRoot.add(napeFill);

    // Delicate airy crown wisp (angelic silhouette detail)
    const crownWisp = Core.createHairLock(
      [[0.006, 0.120, -0.010], [0.024, 0.146, -0.022], [0.042, 0.132, -0.044]],
      0.007, 0.010, 0.002, hairTipMat, 0.35, 10
    );
    crownWisp.userData.noOutline = true;
    hairRoot.add(crownWisp);

    // Layered Wispy Swept Bangs (Silky pointed tips, both eyes 100% clear!)
    const bangLocks = [
      [[0.026, 0.102, 0.030], [ 0.006, 0.094, 0.088], [-0.012, 0.056, 0.106], [-0.022, 0.012, 0.106]],
      [[0.016, 0.103, 0.028], [-0.020, 0.092, 0.086], [-0.042, 0.054, 0.102], [-0.052, 0.010, 0.098]],
      [[-0.006, 0.100, 0.026], [-0.050, 0.086, 0.079], [-0.072, 0.046, 0.091], [-0.082, 0.002, 0.083]],
      [[-0.030, 0.096, 0.020], [-0.076, 0.076, 0.066], [-0.094, 0.034, 0.076], [-0.100, -0.012, 0.066]],
      [[0.030, 0.102, 0.030], [ 0.048, 0.092, 0.086], [ 0.060, 0.054, 0.100], [ 0.066, 0.014, 0.095]],
      [[0.038, 0.098, 0.024], [ 0.072, 0.084, 0.077], [ 0.088, 0.044, 0.086], [ 0.095, 0.002, 0.076]],
      [[0.024, 0.103, 0.032], [ 0.020, 0.094, 0.090], [ 0.013, 0.058, 0.107], [ 0.008, 0.016, 0.107]]
    ];
    bangLocks.forEach((pts, idx) => {
      const isWispy = idx === 6;
      const lk = Core.createHairLock(pts, isWispy ? 0.009 : 0.015, isWispy ? 0.013 : 0.024, 0.0009, idx % 2 === 0 ? hairMat : hairTipMat, 0.24, 22);
      lk.userData.noOutline = true;
      lk.castShadow = false;
      hairRoot.add(lk);
    });

    // Cheek-Framing Hime Sidelocks (Gently curving inward toward chin & collarbone!)
    const hairSide = [];
    [
      [[[-0.064, 0.096, 0.032], [-0.098, 0.046, 0.056], [-0.102, -0.030, 0.052], [-0.092, -0.125, 0.050], [-0.078, -0.220, 0.054]], 0.020, 0.023, 0.0018],
      [[[ 0.064, 0.096, 0.032], [ 0.098, 0.046, 0.056], [ 0.102, -0.030, 0.052], [ 0.092, -0.125, 0.050], [ 0.078, -0.220, 0.054]], 0.020, 0.023, 0.0018],
      [[[-0.082, 0.082, 0.002], [-0.110, 0.018, 0.018], [-0.112, -0.075, 0.018], [-0.098, -0.195, 0.024]], 0.022, 0.024, 0.0022],
      [[[ 0.082, 0.082, 0.002], [ 0.110, 0.018, 0.018], [ 0.112, -0.075, 0.018], [ 0.098, -0.195, 0.024]], 0.022, 0.024, 0.0022]
    ].forEach(([pts, r0, r1, r2], idx) => {
      const lock = Core.createHairLock(pts, r0, r1, r2, idx < 2 ? hairMat : hairDarkMat, 0.40, 20);
      hairRoot.add(lock);
      hairSide.push(lock);
    });

    // Signature Pale-Blue Ribbon Hairclip (#9BBCE0 + Pearl Pin) neatly pinned on temple
    const hairRibbon = Core.buildSatinBow(0.96, ribbonMat, 0.034);
    hairRibbon.position.set(0.096, 0.062, 0.042);
    hairRibbon.rotation.set(-0.08, 0.86, -0.18);
    const clipPin = new THREE.Mesh(new THREE.SphereGeometry(0.0046, 8, 8), pearlMat);
    clipPin.position.z = 0.008;
    hairRibbon.add(clipPin);
    hairRoot.add(hairRibbon);

    // 13-Strand Flowing Waist-Length Back Canopy
    const hairBack = new THREE.Group();
    hairBack.position.set(0, 0.032, -0.034);
    hairRoot.add(hairBack);
    for (let i = -6; i <= 6; i++) {
      const f = i / 6;
      const ang = f * 1.12;
      const sx = Math.sin(ang), cz = -Math.cos(ang);
      const lenBoost = 1 - f * f * 0.22;
      const pts = [
        [sx * 0.086, 0.055, 0.036 + cz * 0.052],
        [sx * 0.118, -0.045, 0.042 + cz * 0.072],
        [sx * 0.132, -0.185, 0.036 + cz * 0.082],
        [sx * 0.144, -0.355 * lenBoost, 0.032 + cz * 0.086],
        [sx * 0.138, -0.525 * lenBoost, 0.036 + cz * 0.078]
      ];
      const mat = Math.abs(i) % 3 === 1 ? hairTipMat : (Math.abs(i) === 6 ? hairDarkMat : hairMat);
      hairBack.add(Core.createHairLock(pts, 0.028, 0.034, 0.0055, mat, 0.44, 20));
    }
    hairBack.add(Core.createHairLock(
      [[0, 0.04, 0.0], [0, -0.14, -0.022], [0, -0.32, -0.026], [0, -0.46, -0.018]],
      0.075, 0.088, 0.024, hairDarkMat, 0.36, 16
    ));

    // ARMS & ARTICULATED 10-FINGER HANDS
    const sleeveMeshes = [];
    function buildArm(sideSign) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sideSign * 0.128, 0.184, 0);
      chest.add(shoulder);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 12), blazerMat);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.029, 0.225, 16), blazerMat);
      upper.position.y = -0.112;
      upper.castShadow = true;
      shoulder.add(cap, upper);

      const forearm = new THREE.Group();
      forearm.position.set(0, -0.222, 0);
      shoulder.add(forearm);

      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.024, 0.205, 16), blazerMat);
      lower.position.y = -0.102;
      lower.castShadow = true;
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.023, 0.028, 16), shirtMat);
      cuff.position.y = -0.198;
      forearm.add(lower, cuff);
      sleeveMeshes.push(cap, upper, lower);

      const hand = Core.buildAnimeHand(sideSign, skinMat, 0.96);
      hand.position.set(0, -0.212, 0);
      forearm.add(hand);

      return { shoulder, forearm, hand };
    }
    const armL = buildArm(1);
    const armR = buildArm(-1);

    // LEGS, SCULPTED CALVES, KNEE SOCKS & BUCKLED LOAFERS
    function buildLeg(sideSign) {
      const thigh = new THREE.Group();
      thigh.position.set(sideSign * 0.064, -0.045, 0);
      hips.add(thigh);

      const thighSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.041, 0.39, 18), skinMat);
      thighSkin.position.y = -0.195;
      thighSkin.castShadow = true;
      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.040, 14, 12), skinMat);
      kneeJoint.position.y = -0.395;
      thigh.add(thighSkin, kneeJoint);

      const shin = new THREE.Group();
      shin.position.set(0, -0.395, 0);
      thigh.add(shin);

      const upperShinSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.038, 0.065, 16), skinMat);
      upperShinSkin.position.y = -0.032;
      const calfProfile = [
        new THREE.Vector2(0.024, -0.395),
        new THREE.Vector2(0.030, -0.270),
        new THREE.Vector2(0.039, -0.145),
        new THREE.Vector2(0.038, -0.062)
      ];
      const sockMesh = new THREE.Mesh(new THREE.LatheGeometry(calfProfile, 18), sockMat);
      sockMesh.castShadow = true;
      const sockStripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0386, 0.0386, 0.009, 18), ribbonMat);
      sockStripe1.position.y = -0.072;
      const sockStripe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0385, 0.0385, 0.006, 18), shirtMat);
      sockStripe2.position.y = -0.086;
      shin.add(upperShinSkin, sockMesh, sockStripe1, sockStripe2);

      const foot = new THREE.Group();
      foot.position.set(0, -0.395, 0);
      shin.add(foot);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.018, 0.152), new THREE.MeshStandardMaterial({ color: 0x1e1615, roughness: 0.7 }));
      sole.position.set(0, -0.046, 0.032);
      const upperShoe = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.038, 0.138), shoeMat);
      upperShoe.position.set(0, -0.024, 0.028);
      upperShoe.castShadow = true;
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.030, 14, 10), shoeMat);
      toe.scale.set(1.0, 0.68, 1.18);
      toe.position.set(0, -0.026, 0.092);
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.010, 0.022), shoeMat);
      strap.position.set(0, -0.006, 0.042);
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.008, 0.012), goldMat);
      buckle.position.set(0, -0.004, 0.050);
      foot.add(sole, upperShoe, toe, strap, buckle);

      return { thigh, shin, foot };
    }
    const legL = buildLeg(1);
    const legR = buildLeg(-1);

    // Apply Micro-Ink Outline
    Shader.applyAnimeCelPass(cr, 0x281a1c, 0.0018);

    // ATTACHED RIGHT-HAND SMARTPHONE PROP (Scene 1 "After the Call")
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.018, -0.040, 0.032);
    phoneGroup.rotation.set(-0.35, 0.42, -0.28);
    const phoneCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.070, 0.142, 0.009),
      new THREE.MeshStandardMaterial({ color: 0xf4e4da, roughness: 0.36, metalness: 0.25 })
    );
    const camBump = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.024, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x283044, roughness: 0.28, metalness: 0.5 })
    );
    camBump.position.set(-0.018, 0.048, -0.005);
    const phoneScreenMat = new THREE.MeshBasicMaterial({ map: Tex.getPhoneScreen("ended") });
    const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.063, 0.132), phoneScreenMat);
    phoneScreen.position.z = 0.0052;
    const screenLight = new THREE.PointLight(0x9bbce0, 0.0, 1.15);
    screenLight.position.set(0, 0.04, 0.10);
    phoneGroup.add(phoneCase, camBump, phoneScreen, screenLight);
    phoneGroup.visible = false;
    armR.hand.add(phoneGroup);

    // 9 EXPRESSION DEFINITIONS (Morph indices: 0=smallSmile, 1=awkward, 2=shy, 3=holdBack, 4=sad, 5=worried, 6=pout, 7=happy, 8=talk)
    const EXPR = {
      neutral:       { m: -1, by: R * 0.255, btL: -0.03, btR:  0.03, es: 1.00, bl: 0.20, gx: 0.0,    gy: 0.0,   happyLid: false },
      small_smile:   { m:  0, by: R * 0.268, btL: -0.05, btR:  0.05, es: 0.97, bl: 0.30, gx: 0.0,    gy: 0.0,   happyLid: false },
      masking_smile: { m:  0, by: R * 0.252, btL:  0.11, btR: -0.11, es: 0.94, bl: 0.26, gx: 0.0,    gy: -0.01, happyLid: false },
      awkward:       { m:  1, by: R * 0.250, btL:  0.14, btR: -0.08, es: 0.93, bl: 0.50, gx: 0.018,  gy: -0.01, happyLid: false },
      subtle_blush:  { m:  2, by: R * 0.258, btL:  0.09, btR: -0.09, es: 0.94, bl: 0.80, gx: 0.010,  gy: -0.01, happyLid: false },
      holding_back:  { m:  3, by: R * 0.240, btL:  0.19, btR: -0.19, es: 0.86, bl: 0.22, gx: 0.0,    gy: -0.02, happyLid: false },
      sad:           { m:  4, by: R * 0.238, btL:  0.21, btR: -0.21, es: 0.88, bl: 0.16, gx: 0.0,    gy: -0.02, happyLid: false },
      disappointed:  { m:  4, by: R * 0.240, btL:  0.18, btR: -0.18, es: 0.89, bl: 0.18, gx: -0.012, gy: -0.02, happyLid: false },
      worried:       { m:  5, by: R * 0.246, btL:  0.18, btR: -0.18, es: 0.95, bl: 0.20, gx: 0.0,    gy: 0.0,   happyLid: false },
      jealous:       { m:  6, by: R * 0.234, btL: -0.15, btR:  0.15, es: 0.90, bl: 0.46, gx: -0.020, gy: 0.0,   happyLid: false },
      happy:         { m:  7, by: R * 0.276, btL: -0.06, btR:  0.06, es: 0.98, bl: 0.48, gx: 0.0,    gy: 0.0,   happyLid: false }
    };

    const st = { expr: "neutral", blinkTimer: 2.6, blinkP: 0, blinking: false, t: 0 };

    const rig = {
      id: "rizka",
      name: "Rizka",
      isFemale: true,
      root,
      bodyPivot,
      spinePivot: spine,
      chestPivot: chest,
      skirtPivot,
      leftLeg: legL.thigh,
      rightLeg: legR.thigh,
      leftShin: legL.shin,
      rightShin: legR.shin,
      leftArm: armL.shoulder,
      rightArm: armR.shoulder,
      leftForearm: armL.forearm,
      rightForearm: armR.forearm,
      leftHand: armL.hand,
      rightHand: armR.hand,
      headGroup: head,
      longHairPivot: hairBack,
      hairSide,
      phoneGroup,
      phoneScreenMat,
      screenLight,
      holdingRightHandProp: false,
      poseOverride: null,
      talking: false,
      walkPhase: 0,
      currentExpr: "neutral"
    };

    rig.setExpression = (id) => {
      const key = EXPR[id] ? id : "neutral";
      st.expr = key;
      rig.currentExpr = key;
    };

    rig.setPhoneState = (visible, callMode = "ended") => {
      phoneGroup.visible = !!visible;
      rig.holdingRightHandProp = !!visible;
      armR.hand.setGrip(visible ? 0.65 : 0.0);
      if (visible) {
        phoneScreenMat.map = Tex.getPhoneScreen(callMode);
        phoneScreenMat.needsUpdate = true;
        screenLight.intensity = callMode === "ringing" ? 1.35 : 0.95;
      } else {
        screenLight.intensity = 0;
      }
    };

    rig.setOutfitVariant = (variant) => {
      const useCardigan = variant === "cardigan";
      const jMat = useCardigan ? cardiganMat : blazerMat;
      lapelMeshes.forEach((m) => { m.material = jMat; });
      sleeveMeshes.forEach((m) => { m.material = jMat; });
      uniformAccents.visible = !useCardigan;
    };

    rig.studioUpdate = (dt, windStrength = 0.25) => {
      st.t += dt;
      if (!st.blinking) {
        st.blinkTimer -= dt;
        if (st.blinkTimer <= 0) {
          st.blinking = true;
          st.blinkP = 0;
          st.blinkTimer = 2.4 + Math.random() * 2.8;
        }
      }
      let ba = 0;
      if (st.blinking) {
        st.blinkP += dt * 13.0;
        if (st.blinkP >= Math.PI) st.blinking = false;
        else ba = Math.sin(st.blinkP);
      }

      const E = EXPR[st.expr] || EXPR.neutral;
      const lidScale = Math.max(0.001, ba);
      [eyeL, eyeR].forEach((e) => {
        e.upperLid.scale.y = lidScale;
        e.lashClosed.visible = ba > 0.72;
        e.lash3D.visible = ba <= 0.72;
        e.tex.offset.x += (E.gx - e.tex.offset.x) * Math.min(1, dt * 8);
        e.tex.offset.y += (E.gy - e.tex.offset.y) * Math.min(1, dt * 8);
      });

      const k = Math.min(1, dt * 12);
      const sm = Math.min(1, dt * 9);
      const inf = mouth.morphTargetInfluences;
      if (inf) {
        for (let i = 0; i < 9; i++) {
          let tg = i === E.m ? 1 : 0;
          if (i === 8) {
            tg = rig.talking ? Math.max(0, Math.sin(st.t * 14.5) * 0.55 + Math.sin(st.t * 22.0) * 0.45) * 0.86 : 0;
          }
          inf[i] += (tg - inf[i]) * k;
        }
      }

      browL.position.y += (E.by - browL.position.y) * sm;
      browR.position.y += (E.by - browR.position.y) * sm;
      browL.rotation.z += (E.btL - browL.rotation.z) * sm;
      browR.rotation.z += (E.btR - browR.rotation.z) * sm;
      eyeL.mesh.scale.y += (E.es - eyeL.mesh.scale.y) * sm;
      eyeR.mesh.scale.y += (E.es - eyeR.mesh.scale.y) * sm;
      blL.mat.opacity += (E.bl - blL.mat.opacity) * sm;
      blR.mat.opacity += (E.bl - blR.mat.opacity) * sm;

      // Gentle chest breathing & sidelock sway
      chest.scale.z = 1.0 + Math.sin(st.t * 2.1) * 0.012;
      const breeze = Math.sin(st.t * 1.8) * (0.016 + windStrength * 0.032);
      hairSide.forEach((lk, idx) => {
        lk.rotation.z = (idx % 2 === 0 ? -1 : 1) * (0.008 + breeze * 0.65);
        lk.rotation.x = Math.sin(st.t * 1.5 + idx) * (0.012 + windStrength * 0.022);
      });

      if (phoneGroup.visible) {
        screenLight.intensity = 0.52 + Math.sin(st.t * 4.2) * 0.08;
      }
    };

    return rig;
  }

  return { SPEC, build };
})();
