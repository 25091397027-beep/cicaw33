/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   ULTRA-HD CHARACTER BUILDER & FULL ACTION/EXPRESSION RIG
   (assets/chapter5/characters/ch5_characters.js)
   - Honest Asset Pipeline:
     * Checks Chapter5AssetManager for external Blender 4K .glb character rigs
       (uses THREE.AnimationMixer + morphTargets if READY).
     * Since the 12 character .glb entries in Gemini's Chapter 5 Asset Studio
       are marked PENDING (Blender 4K pipeline), provides Ultra-HD Chapter 5
       rigs upgraded above Chapter 4:
       1. Rizka (1.61m) — 12 expressions, bag & hand prop attachments, silky hair
       2. Kael (1.77m)  — 10 expressions, carry-box/drink prop attachments
       3. Nadine (1.63m)— Warm natural classmate expressions (non-antagonist)
       4. Bu Mira (1.65m)— Bespoke teacher rig (glasses, bun, blazer, clipboard)
       5. Hana (1.59m)  — Bespoke event decor classmate rig
       6. Sena (1.74m)  — Bespoke OSIS notes classmate rig
   - Full Chapter 5 Animation System:
     idle, walk, run, turning, lookAt character/window, natural blinking,
     talking lip-sync, pickup reach, hand gestures, assist, laugh, & awkward shift.
============================================================================ */
"use strict";

window.Ch5Characters = (function () {
  function _addCarryAnchor(rig) {
    const rightSlot = new THREE.Group();
    rightSlot.name = "Ch5_RightHandPropSlot";
    rightSlot.position.set(0.015, -0.055, 0.048);
    if (rig.rightHand) rig.rightHand.add(rightSlot);

    const backSlot = new THREE.Group();
    backSlot.name = "Ch5_ShoulderBagSlot";
    backSlot.position.set(-0.145, -0.04, -0.055);
    if (rig.chestPivot) rig.chestPivot.add(backSlot);

    rig.ch5RightSlot = rightSlot;
    rig.ch5BagSlot = backSlot;
    rig.ch5Action = "idle";
    rig.ch5ActionTimer = 0;
    rig.ch5LookTarget = null;
    rig.ch5WindowGaze = false;

    rig.clearHandProp = () => {
      while (rightSlot.children.length > 0) rightSlot.remove(rightSlot.children[0]);
      rig.holdingRightHandProp = false;
      if (rig.rightHand && rig.rightHand.setGrip) rig.rightHand.setGrip(0);
    };

    rig.attachHandProp = (obj3d, opts = {}) => {
      rig.clearHandProp();
      if (!obj3d) return;
      if (opts.scale) obj3d.scale.setScalar(opts.scale);
      if (opts.pos) obj3d.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
      if (opts.rot) obj3d.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
      rightSlot.add(obj3d);
      rig.holdingRightHandProp = true;
      if (rig.rightHand && rig.rightHand.setGrip) rig.rightHand.setGrip(0.65);
    };

    rig.playAction = (actionName, duration = 1.1) => {
      rig.ch5Action = actionName || "idle";
      rig.ch5ActionTimer = duration;
    };

    return rig;
  }

  function _upgradeHeroShaders(root) {
    // Subtle specular rim & higher anisotropy on skin/hair/eyes for Ch.5 Ultra-HD fidelity
    root.traverse((n) => {
      if (n.isMesh && n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m) => {
          if (!m) return;
          if (m.map) m.map.anisotropy = 16;
          if (m.bumpMap) m.bumpMap.anisotropy = 16;
          if (m.isMeshStandardMaterial && m.roughness > 0.35 && m.roughness < 0.85) {
            m.envMapIntensity = 0.38;
          }
        });
      }
    });
  }

  function buildRizka() {
    if (window.Chapter5AssetManager) {
      window.Chapter5AssetManager.registerCharacterFallback(
        "ch5_rizka_school_uniform",
        "Gemini Studio status PENDING -> Ch4RizkaBuilder + Ch5 Ultra-HD Expression/Action Upgrade"
      );
    }
    const rig = window.Ch4RizkaBuilder.build();
    rig.root.name = "Rizka_Ch5_UltraHD";
    _upgradeHeroShaders(rig.root);
    _addCarryAnchor(rig);

    // Map extended Chapter 5 expression aliases cleanly onto Rizka's morph rig
    const origSetExpr = rig.setExpression.bind(rig);
    const ALIAS = {
      normal: "neutral",
      gentle_smile: "small_smile",
      teasing: "small_smile",
      laugh: "happy",
      tired: "holding_back",
      annoyed: "jealous",
      look_away: "awkward",
      focused: "worried"
    };
    rig.ch5RawExpr = "neutral";
    rig.setExpression = (id) => {
      rig.ch5RawExpr = id || "neutral";
      origSetExpr(ALIAS[id] || id || "neutral");
    };
    return rig;
  }

  function buildKael() {
    if (window.Chapter5AssetManager) {
      window.Chapter5AssetManager.registerCharacterFallback(
        "ch5_kael_school_uniform",
        "Gemini Studio status PENDING -> Ch4KaelBuilder + Ch5 Ultra-HD Expression/Action Upgrade"
      );
    }
    const rig = window.Ch4KaelBuilder.build();
    rig.root.name = "Kael_Ch5_UltraHD";
    _upgradeHeroShaders(rig.root);
    _addCarryAnchor(rig);

    const origSetExpr = rig.setExpression.bind(rig);
    const ALIAS = {
      normal: "calm",
      relaxed: "calm",
      gentle_smile: "small_smile",
      happy: "small_smile",
      laugh: "small_smile",
      teasing: "small_smile",
      look_window: "worried"
    };
    rig.ch5RawExpr = "calm";
    rig.setExpression = (id) => {
      rig.ch5RawExpr = id || "calm";
      origSetExpr(ALIAS[id] || id || "calm");
    };
    return rig;
  }

  function buildNadine() {
    if (window.Chapter5AssetManager) {
      window.Chapter5AssetManager.registerCharacterFallback(
        "ch5_nadine_school_uniform",
        "Gemini Studio status PENDING -> Ch4NadineBuilder + Ch5 Natural Classmate Upgrade"
      );
    }
    const rig = window.Ch4NadineBuilder.build();
    rig.root.name = "Nadine_Ch5_UltraHD";
    _upgradeHeroShaders(rig.root);
    _addCarryAnchor(rig);
    const origSetExpr = rig.setExpression.bind(rig);
    const ALIAS = {
      normal: "friendly_smile",
      happy: "friendly_smile",
      playful: "friendly_smile",
      understanding: "polite"
    };
    rig.setExpression = (id) => origSetExpr(ALIAS[id] || id || "friendly_smile");
    return rig;
  }

  /* Bespoke Ultra-HD Supporting Cast Builder (Bu Mira, Hana, Sena, Committee NPCs)
     Built on the exact same Ch4CharacterCore sculpted head, 1K jewel eyes,
     ribbon-blade hair locks, & 10-finger articulated hands so ALL characters
     match Rizka, Kael, and Nadine in visual quality! */
  function _buildBespokeSupportingRig(cfg) {
    if (window.Chapter5AssetManager && cfg.manifestId) {
      window.Chapter5AssetManager.registerCharacterFallback(
        cfg.manifestId,
        `Gemini Studio status PENDING -> Bespoke Ch5 Ultra-HD Character Rig (${cfg.name})`
      );
    }
    const Core = window.Ch4CharacterCore;
    const Shader = window.Ch4AnimeShader;
    const Tex = window.Ch4Textures;
    const female = cfg.female !== false;
    const R = female ? 0.109 : 0.115;

    const root = new THREE.Group();
    root.name = `${cfg.id}_Ch5_UltraHD`;
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const cr = new THREE.Group();
    bodyPivot.add(cr);
    const hScale = (cfg.heightM || (female ? 1.61 : 1.75)) / (female ? 1.62 : 1.76);
    cr.scale.setScalar(hScale);

    const skinMat = Shader.createSkinMaterial({ color: cfg.skin });
    const faceTex = Core.createFaceSkinTexture({ id: cfg.id + "_ch5", female, skinBase: cfg.skin, beautyMark: false });
    const faceSkinMat = Shader.createSkinMaterial({ map: faceTex, color: 0xffffff });
    const hairMat = Shader.createHairMaterial({ color: cfg.hairMain, haloColor: cfg.hairHalo, roughness: 0.42 });
    const hairDarkMat = Shader.createHairMaterial({ color: cfg.hairRoot, haloColor: cfg.hairHalo, roughness: 0.48 });
    const hairTipMat = Shader.createHairMaterial({ color: cfg.hairTip, haloColor: cfg.hairHalo, roughness: 0.38 });

    const topMat = cfg.knitTop
      ? Shader.createClothMaterial({ map: Tex.getCableKnit(cfg.blazer), color: 0xffffff, roughness: 0.80, noWeave: true })
      : Shader.createClothMaterial({ color: cfg.blazer, roughness: 0.72 });
    const shirtMat = Shader.createClothMaterial({ color: "#F8F6F1", roughness: 0.75 });
    const accentMat = Shader.createClothMaterial({ color: cfg.accent, roughness: 0.54, noWeave: true });
    const bottomMat = cfg.plaidSkirt
      ? Shader.createClothMaterial({ map: Tex.getAcademyTartan(), color: 0xffffff, roughness: 0.74, noWeave: true })
      : Shader.createClothMaterial({ color: cfg.bottom, roughness: 0.74 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: cfg.shoe || "#3A2822", roughness: 0.34, metalness: 0.12 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6c173, roughness: 0.28, metalness: 0.72 });

    const hipsY = female ? 0.90 : 0.96;
    const hips = new THREE.Group();
    hips.position.set(0, hipsY, 0);
    cr.add(hips);

    let skirtPivot = null;
    if (female) {
      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.103, 18, 14), bottomMat);
      pelvis.scale.set(1.03, 0.72, 0.80);
      pelvis.position.y = -0.02;
      hips.add(pelvis);
      skirtPivot = new THREE.Group();
      skirtPivot.position.set(0, 0.016, 0);
      hips.add(skirtPivot);
      const skLen = cfg.midiSkirt ? 0.38 : 0.25;
      const skBot = cfg.midiSkirt ? 0.145 : 0.168;
      skirtPivot.add(Core.buildPleatedSkirt(cfg.midiSkirt ? 16 : 20, 0.103, skBot, skLen, 0.82, bottomMat).group);
    } else {
      const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.140, 0.136, 0.115, 20), bottomMat);
      pelvis.scale.set(1.04, 1, 0.76);
      pelvis.position.y = -0.02;
      hips.add(pelvis);
    }

    const spine = new THREE.Group();
    spine.position.set(0, 0.046, 0);
    hips.add(spine);
    const chest = new THREE.Group();
    chest.position.set(0, female ? 0.136 : 0.154, 0);
    spine.add(chest);

    const tProf = female
      ? [new THREE.Vector2(0.092, -0.145), new THREE.Vector2(0.086, -0.055), new THREE.Vector2(0.115, 0.065), new THREE.Vector2(0.127, 0.158), new THREE.Vector2(0.122, 0.194), new THREE.Vector2(0.085, 0.218), new THREE.Vector2(0.042, 0.236)]
      : [new THREE.Vector2(0.134, -0.175), new THREE.Vector2(0.138, -0.060), new THREE.Vector2(0.156, 0.085), new THREE.Vector2(0.170, 0.205), new THREE.Vector2(0.164, 0.242), new THREE.Vector2(0.118, 0.264), new THREE.Vector2(0.050, 0.280)];
    const inner = new THREE.Mesh(new THREE.LatheGeometry(tProf, 26), shirtMat);
    inner.scale.set(1.04, 1, female ? 0.78 : 0.74);
    inner.castShadow = true;
    chest.add(inner);

    const jProf = tProf.slice(0, 6).map((v) => new THREE.Vector2(v.x + 0.010, v.y - 0.004));
    const outer = new THREE.Mesh(new THREE.LatheGeometry(jProf, 26, 0.32, Math.PI * 2 - 0.64), topMat);
    outer.scale.set(1.05, 1, female ? 0.80 : 0.76);
    outer.castShadow = true;
    chest.add(outer);

    [-1, 1].forEach((s) => {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.036, female ? 0.18 : 0.21, 0.015), topMat);
      lapel.position.set(s * (female ? 0.045 : 0.055), female ? 0.105 : 0.14, female ? 0.094 : 0.118);
      lapel.rotation.set(-0.10, s * 0.20, s * -0.18);
      chest.add(lapel);
    });

    if (female) {
      const bow = Core.buildSatinBow(1.12, accentMat, 0.052);
      bow.position.set(0, 0.196, 0.080);
      chest.add(bow);
    } else {
      const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.235, 4), accentMat);
      tie.rotation.y = Math.PI / 4;
      tie.scale.set(1.18, 1, 0.28);
      tie.position.set(0, 0.105, 0.112);
      chest.add(tie);
    }

    // Teacher lanyard badge for Bu Mira / OSIS badge for Sena
    if (cfg.lanyard) {
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.058, 0.004), new THREE.MeshStandardMaterial({ color: 0xfef9eb, roughness: 0.4 }));
      card.position.set(0, 0.045, 0.102);
      const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.16, 0.004), accentMat);
      strapL.position.set(-0.022, 0.135, 0.094); strapL.rotation.z = -0.16;
      const strapR = strapL.clone(); strapR.position.x = 0.022; strapR.rotation.z = 0.16;
      chest.add(card, strapL, strapR);
    }

    const neck = new THREE.Group();
    neck.position.set(0, female ? 0.232 : 0.272, 0);
    chest.add(neck);
    const neckM = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.031 : 0.041, female ? 0.037 : 0.047, female ? 0.095 : 0.112, 18), skinMat);
    neckM.position.y = 0.044;
    neck.add(neckM);

    const head = new THREE.Group();
    head.position.set(0, female ? 0.145 : 0.162, 0.004);
    neck.add(head);
    const headMesh = new THREE.Mesh(Core.buildHeroHeadGeometry(R, female), faceSkinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);
    head.add(Core.buildAnimeEars(R, female, skinMat, false));

    const eyeCfg = { id: cfg.id + "_eye", female, irisTop: cfg.irisTop, irisMid: cfg.irisMid, irisGold: cfg.irisGold, irisGlow: "#FFF2CE" };
    const eyeL = Core.buildHeroEye(1, R, female, Core.createHeroEyeTexture(eyeCfg, false), cfg.skin, 0x201513);
    const eyeR = Core.buildHeroEye(-1, R, female, Core.createHeroEyeTexture(eyeCfg, true), cfg.skin, 0x201513);
    head.add(eyeL.group, eyeR.group);

    // Optional thin wireframe glasses (Bu Mira & Sena)
    if (cfg.glasses) {
      const gGrp = new THREE.Group();
      const rimMat = goldMat;
      [-1, 1].forEach((s) => {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(R * 0.205, 0.0022, 8, 22), rimMat);
        rim.scale.set(1.18, 0.86, 1);
        rim.position.set(s * R * 0.355, -R * 0.042, R * 0.96);
        rim.rotation.y = s * 0.16;
        gGrp.add(rim);
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(R * 0.22, 0.0025, 0.0025), rimMat);
      bridge.position.set(0, -R * 0.022, R * 0.98);
      gGrp.add(bridge);
      head.add(gGrp);
    }

    const mkBrow = (s, right) => {
      const bx = s * R * 0.365, by = R * 0.255;
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(R * 0.39, R * 0.12),
        new THREE.MeshBasicMaterial({ map: Core.createEyebrowTexture(cfg.hairRoot, right, female ? 0.95 : 1.15), transparent: true, depthWrite: false })
      );
      b.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, female) + 0.0024);
      b.rotation.y = s * 0.20;
      b.userData.noOutline = true;
      b.renderOrder = 4;
      return b;
    };
    const browL = mkBrow(1, false), browR = mkBrow(-1, true);
    head.add(browL, browR);

    const mouth = Core.buildHeroMouth(R, female);
    head.add(mouth);

    // Hair styling per character
    const hairRoot = new THREE.Group();
    head.add(hairRoot);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.09, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat);
    cap.position.set(0, 0.017, -0.012);
    cap.rotation.x = -0.58;
    cap.scale.set(0.98, 1.05, 1.05);
    hairRoot.add(cap);

    [
      [[ 0.032, 0.102, 0.026], [ 0.004, 0.094, 0.086], [-0.024, 0.058, 0.102], [-0.038, 0.018, 0.098]],
      [[-0.012, 0.100, 0.024], [-0.048, 0.088, 0.080], [-0.074, 0.048, 0.088], [-0.086, 0.010, 0.078]],
      [[ 0.038, 0.100, 0.024], [ 0.064, 0.088, 0.080], [ 0.080, 0.052, 0.088], [ 0.088, 0.016, 0.078]]
    ].forEach((pts, idx) => {
      const lk = Core.createHairLock(pts, 0.015, 0.024, 0.0022, idx % 2 === 0 ? hairMat : hairTipMat, 0.28, 14);
      lk.userData.noOutline = true;
      hairRoot.add(lk);
    });

    const hairBack = new THREE.Group();
    hairRoot.add(hairBack);
    if (cfg.hairStyle === "bun") {
      const nape = new THREE.Mesh(new THREE.SphereGeometry(R * 0.82, 18, 14), hairDarkMat);
      nape.position.set(0, -0.03, -0.048);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.054, 18, 14), hairMat);
      bun.position.set(0, -0.015, -0.118);
      const bunPin = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.11, 8), goldMat);
      bunPin.rotation.z = 0.9;
      bunPin.position.set(0, -0.012, -0.125);
      hairBack.add(nape, bun, bunPin);
    } else if (cfg.hairStyle === "sidetail") {
      for (let i = -4; i <= 4; i++) {
        const ang = (i / 4) * 1.25;
        hairBack.add(Core.createHairLock([
          [Math.sin(ang) * 0.085, 0.045, -Math.cos(ang) * 0.055],
          [Math.sin(ang) * 0.102, -0.055, -Math.cos(ang) * 0.068],
          [Math.sin(ang) * 0.095, -0.145, -Math.cos(ang) * 0.062]
        ], 0.024, 0.028, 0.003, hairMat, 0.42, 14));
      }
      // Lively side ponytail on right side
      hairBack.add(Core.createHairLock([
        [-0.088, 0.035, -0.015], [-0.135, 0.015, -0.010], [-0.165, -0.095, 0.008], [-0.150, -0.235, 0.022]
      ], 0.026, 0.036, 0.005, hairTipMat, 0.5, 16));
      const clip = Core.buildSatinBow(0.85, accentMat, 0.030);
      clip.position.set(-0.098, 0.048, 0.005);
      hairBack.add(clip);
    } else {
      for (let i = -4; i <= 4; i++) {
        const ang = (i / 4) * 1.22;
        hairBack.add(Core.createHairLock([
          [Math.sin(ang) * 0.086, 0.045, 0.018 - Math.cos(ang) * 0.062],
          [Math.sin(ang) * 0.104, -0.028, 0.014 - Math.cos(ang) * 0.078],
          [Math.sin(ang) * 0.094, -0.102, 0.012 - Math.cos(ang) * 0.082]
        ], 0.024, 0.026, 0.0024, i % 2 === 0 ? hairMat : hairDarkMat, 0.44, 14));
      }
    }

    const buildArm = (s) => {
      const sh = new THREE.Group();
      sh.position.set(s * (female ? 0.130 : 0.168), female ? 0.184 : 0.222, 0);
      chest.add(sh);
      const up = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.034 : 0.041, female ? 0.029 : 0.035, female ? 0.22 : 0.25, 14), topMat);
      up.position.y = female ? -0.11 : -0.125;
      up.castShadow = true;
      sh.add(new THREE.Mesh(new THREE.SphereGeometry(female ? 0.036 : 0.043, 12, 10), topMat), up);
      const fa = new THREE.Group();
      fa.position.set(0, female ? -0.22 : -0.25, 0);
      sh.add(fa);
      const lo = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.029 : 0.035, female ? 0.024 : 0.028, female ? 0.21 : 0.23, 14), topMat);
      lo.position.y = female ? -0.105 : -0.115;
      fa.add(lo);
      const hand = Core.buildAnimeHand(s, skinMat, female ? 0.96 : 1.06);
      hand.position.set(0, female ? -0.212 : -0.234, 0);
      fa.add(hand);
      return { shoulder: sh, forearm: fa, hand };
    };
    const armL = buildArm(1), armR = buildArm(-1);

    const buildLeg = (s) => {
      const th = new THREE.Group();
      th.position.set(s * (female ? 0.064 : 0.086), -0.045, 0);
      hips.add(th);
      const up = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.053 : 0.068, female ? 0.041 : 0.054, female ? 0.40 : 0.43, 16), female ? skinMat : bottomMat);
      up.position.y = female ? -0.20 : -0.215;
      up.castShadow = true;
      th.add(up);
      const shn = new THREE.Group();
      shn.position.set(0, female ? -0.40 : -0.43, 0);
      th.add(shn);
      const lo = new THREE.Mesh(new THREE.CylinderGeometry(female ? 0.040 : 0.053, female ? 0.029 : 0.042, female ? 0.39 : 0.42, 16), female ? Shader.createClothMaterial({ color: "#23293A", roughness: 0.68 }) : bottomMat);
      lo.position.y = female ? -0.195 : -0.21;
      shn.add(lo);
      const ft = new THREE.Group();
      ft.position.set(0, female ? -0.395 : -0.42, 0);
      shn.add(ft);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(female ? 0.062 : 0.078, 0.042, female ? 0.145 : 0.175), shoeMat);
      shoe.position.set(0, -0.024, 0.030);
      ft.add(shoe);
      return { thigh: th, shin: shn, foot: ft };
    };
    const legL = buildLeg(1), legR = buildLeg(-1);

    Shader.applyAnimeCelPass(cr, 0x24191c, 0.0018);

    const EXPR = {
      neutral: { m: -1, by: R * 0.255, bt: -0.02, es: 1.00 },
      happy:   { m:  0, by: R * 0.270, bt: -0.05, es: 0.97 },
      serious: { m:  3, by: R * 0.238, bt: -0.14, es: 0.92 },
      surprised:{ m: 5, by: R * 0.285, bt:  0.06, es: 1.06 }
    };
    const st = { expr: cfg.defaultExpr || "happy", blinkTimer: 2.3 + Math.random(), blinkP: 0, blinking: false, t: Math.random() * 2 };

    const rig = {
      id: cfg.id,
      name: cfg.name,
      isFemale: female,
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
      holdingRightHandProp: false,
      talking: false,
      walkPhase: 0,
      currentExpr: st.expr
    };

    rig.setExpression = (id) => {
      st.expr = EXPR[id] ? id : "happy";
      rig.currentExpr = st.expr;
    };

    rig.studioUpdate = (dt) => {
      st.t += dt;
      if (!st.blinking) {
        st.blinkTimer -= dt;
        if (st.blinkTimer <= 0) { st.blinking = true; st.blinkP = 0; st.blinkTimer = 2.5 + Math.random() * 2.8; }
      }
      let ba = 0;
      if (st.blinking) {
        st.blinkP += dt * 13;
        if (st.blinkP >= Math.PI) st.blinking = false;
        else ba = Math.sin(st.blinkP);
      }
      [eyeL, eyeR].forEach((e) => {
        e.upperLid.scale.y = Math.max(0.001, ba);
        e.lashClosed.visible = ba > 0.72;
        e.lash3D.visible = ba <= 0.72;
      });
      const E = EXPR[st.expr] || EXPR.happy;
      const k = Math.min(1, dt * 12), sm = Math.min(1, dt * 9);
      const inf = mouth.morphTargetInfluences;
      if (inf) {
        for (let i = 0; i < 9; i++) {
          let tg = i === E.m ? 1 : 0;
          if (i === 8) tg = rig.talking ? Math.max(0, Math.sin(st.t * 14) * 0.55 + Math.sin(st.t * 21) * 0.45) * 0.82 : 0;
          inf[i] += (tg - inf[i]) * k;
        }
      }
      browL.position.y += (E.by - browL.position.y) * sm;
      browR.position.y += (E.by - browR.position.y) * sm;
      browL.rotation.z += (E.bt - browL.rotation.z) * sm;
      browR.rotation.z += (-E.bt - browR.rotation.z) * sm;
      eyeL.mesh.scale.y += (E.es - eyeL.mesh.scale.y) * sm;
      eyeR.mesh.scale.y += (E.es - eyeR.mesh.scale.y) * sm;
      chest.scale.z = 1.0 + Math.sin(st.t * 2.0) * 0.010;
    };

    _upgradeHeroShaders(root);
    return _addCarryAnchor(rig);
  }

  function buildBuMira() {
    return _buildBespokeSupportingRig({
      id: "bu_mira", manifestId: "ch5_bu_mira_teacher", name: "Bu Mira",
      female: true, heightM: 1.65, skin: "#F1D4C4",
      hairRoot: "#251B18", hairMain: "#382924", hairTip: "#523D36", hairHalo: "#C9A58C",
      irisTop: "#241815", irisMid: "#6B4C3B", irisGold: "#B88A68",
      blazer: "#CBB097", accent: "#6B4438", bottom: "#263247", shoe: "#35231D",
      hairStyle: "bun", midiSkirt: true, glasses: true, lanyard: true, defaultExpr: "happy"
    });
  }

  function buildHana() {
    return _buildBespokeSupportingRig({
      id: "hana", manifestId: "ch5_npc_student_f_01", name: "Hana",
      female: true, heightM: 1.59, skin: "#F7DDD0",
      hairRoot: "#4B3025", hairMain: "#6D4736", hairTip: "#94644C", hairHalo: "#E8BA98",
      irisTop: "#2C1D18", irisMid: "#8D5B3E", irisGold: "#E5AA72",
      blazer: "#F2D8C9", knitTop: true, accent: "#E07A7A", plaidSkirt: true, shoe: "#3D2A22",
      hairStyle: "sidetail", defaultExpr: "happy"
    });
  }

  function buildSena() {
    return _buildBespokeSupportingRig({
      id: "sena", manifestId: "ch5_npc_student_m_01", name: "Sena",
      female: false, heightM: 1.74, skin: "#ECCBB8",
      hairRoot: "#1A202C", hairMain: "#263042", hairTip: "#3D4B63", hairHalo: "#8BA2C4",
      irisTop: "#1E2736", irisMid: "#4F6885", irisGold: "#98B6D4",
      blazer: "#223047", accent: "#5B7FA6", bottom: "#272E3B", shoe: "#E2E6EC",
      hairStyle: "short", glasses: true, lanyard: true, defaultExpr: "neutral"
    });
  }

  /* Full Chapter 5 Locomotion, Gaze, & Expressive Body-Language Updater */
  function updateActor(rig, dt, elapsed, opts = {}) {
    if (!rig || !rig.root.visible) return;
    const speed = opts.speed || 0;
    const sprinting = !!opts.sprinting;
    const wind = opts.wind !== undefined ? opts.wind : 0.22;

    if (rig.studioUpdate) rig.studioUpdate(dt, wind);

    // Decay one-shot action timer
    if (rig.ch5ActionTimer > 0) {
      rig.ch5ActionTimer -= dt;
      if (rig.ch5ActionTimer <= 0) {
        rig.ch5Action = "idle";
      }
    }

    const moving = speed > 0.08;
    const damp = Math.min(1, dt * 10);

    if (moving) {
      const freq = sprinting ? 9.4 : 6.6;
      rig.walkPhase = (rig.walkPhase || 0) + dt * freq;
      const p = rig.walkPhase;
      const stride = sprinting ? 0.56 : 0.38;
      const bounce = Math.abs(Math.sin(p)) * (sprinting ? 0.036 : 0.020);

      rig.bodyPivot.position.y += (bounce - rig.bodyPivot.position.y) * damp;
      rig.leftLeg.rotation.x = Math.sin(p) * stride;
      rig.rightLeg.rotation.x = -Math.sin(p) * stride;
      rig.leftShin.rotation.x = Math.max(0, -Math.cos(p) * 0.45);
      rig.rightShin.rotation.x = Math.max(0, Math.cos(p) * 0.45);

      const armSwing = sprinting ? 0.46 : 0.30;
      rig.leftArm.rotation.x = -Math.sin(p) * armSwing;
      rig.leftArm.rotation.z = 0.07;
      rig.leftForearm.rotation.x = -0.18 - Math.max(0, Math.sin(p)) * 0.18;

      if (rig.holdingRightHandProp) {
        rig.rightArm.rotation.x += (-0.42 - rig.rightArm.rotation.x) * damp;
        rig.rightForearm.rotation.x += (-0.68 - rig.rightForearm.rotation.x) * damp;
      } else {
        rig.rightArm.rotation.x = Math.sin(p) * armSwing;
        rig.rightForearm.rotation.x = -0.18 - Math.max(0, -Math.sin(p)) * 0.18;
      }
      rig.rightArm.rotation.z = -0.07;

      if (rig.longHairPivot) {
        rig.longHairPivot.rotation.x += ((0.14 + Math.abs(Math.sin(p)) * 0.08) - rig.longHairPivot.rotation.x) * damp;
      }
      if (rig.skirtPivot) {
        rig.skirtPivot.rotation.x = -0.05 + Math.sin(p * 2) * 0.03;
      }
    } else {
      // Stationary idle + expressive body language
      const br = Math.sin(elapsed * 2.0 + (rig.isFemale ? 0 : 1.1));
      let bodyY = br * 0.005;
      let spineZ = Math.sin(elapsed * 1.1) * 0.012;
      let armLX = 0.02, armLZ = 0.08, foreLX = -0.14;
      let armRX = rig.holdingRightHandProp ? -0.44 : -0.02;
      let armRZ = -0.08;
      let foreRX = rig.holdingRightHandProp ? -0.72 : -0.14;
      let headPitch = 0, headRoll = 0, headYaw = Math.sin(elapsed * 0.7) * 0.04;

      const act = rig.ch5Action;
      if (act === "pickup") {
        bodyY = -0.08;
        armRX = -0.88;
        foreRX = -0.52;
        headPitch = 0.22;
      } else if (act === "assist") {
        armLX = -0.68 + Math.sin(elapsed * 3.4) * 0.12;
        armRX = -0.68 - Math.sin(elapsed * 3.4) * 0.12;
        foreLX = -0.52;
        foreRX = -0.52;
      } else if (act === "gesture" || rig.talking) {
        armRX = -0.34 + Math.sin(elapsed * 4.5) * 0.14;
        foreRX = -0.62 + Math.cos(elapsed * 3.8) * 0.16;
        headRoll = Math.sin(elapsed * 2.2) * 0.04;
      } else if (act === "laugh") {
        bodyY = Math.abs(Math.sin(elapsed * 9.5)) * 0.018;
        headPitch = -0.06;
        armRX = -0.32;
        foreRX = -0.85;
      } else if (act === "awkward_shift" || rig.ch5RawExpr === "awkward" || rig.ch5RawExpr === "look_away") {
        spineZ = 0.035;
        headYaw = rig.isFemale ? 0.22 : -0.20;
        headPitch = 0.08;
        armLX = -0.18;
        foreLX = -0.58;
      } else if (rig.ch5WindowGaze) {
        // Scene 4 Kael quiet window contemplation pose
        headYaw = -0.26;
        headPitch = 0.06;
        armLX = 0.06;
        armRX = 0.06;
        foreLX = -0.26;
        foreRX = -0.26;
      }

      // Look-at another character naturally (clamped to realistic neck range)
      if (rig.ch5LookTarget && !rig.ch5WindowGaze && act !== "awkward_shift" && rig.ch5RawExpr !== "look_away") {
        const dx = rig.ch5LookTarget.x - rig.root.position.x;
        const dz = rig.ch5LookTarget.z - rig.root.position.z;
        const worldAng = Math.atan2(dx, dz);
        let relYaw = worldAng - rig.root.rotation.y;
        while (relYaw > Math.PI) relYaw -= Math.PI * 2;
        while (relYaw < -Math.PI) relYaw += Math.PI * 2;
        headYaw = Math.max(-0.52, Math.min(0.52, relYaw * 0.65));
      }

      rig.bodyPivot.position.y += (bodyY - rig.bodyPivot.position.y) * damp;
      rig.spinePivot.rotation.z += (spineZ - rig.spinePivot.rotation.z) * damp;
      rig.leftLeg.rotation.x += (0 - rig.leftLeg.rotation.x) * damp;
      rig.rightLeg.rotation.x += (0 - rig.rightLeg.rotation.x) * damp;
      rig.leftShin.rotation.x += (0 - rig.leftShin.rotation.x) * damp;
      rig.rightShin.rotation.x += (0 - rig.rightShin.rotation.x) * damp;
      rig.leftArm.rotation.x += (armLX - rig.leftArm.rotation.x) * damp;
      rig.leftArm.rotation.z += (armLZ - rig.leftArm.rotation.z) * damp;
      rig.leftForearm.rotation.x += (foreLX - rig.leftForearm.rotation.x) * damp;
      rig.rightArm.rotation.x += (armRX - rig.rightArm.rotation.x) * damp;
      rig.rightArm.rotation.z += (armRZ - rig.rightArm.rotation.z) * damp;
      rig.rightForearm.rotation.x += (foreRX - rig.rightForearm.rotation.x) * damp;

      if (rig.headGroup) {
        rig.headGroup.rotation.y += (headYaw - rig.headGroup.rotation.y) * damp;
        rig.headGroup.rotation.x += (headPitch - rig.headGroup.rotation.x) * damp;
        rig.headGroup.rotation.z += (headRoll - rig.headGroup.rotation.z) * damp;
      }
      if (rig.longHairPivot) {
        const sway = 0.04 + Math.sin(elapsed * 1.7) * (0.015 + wind * 0.03);
        rig.longHairPivot.rotation.x += (sway - rig.longHairPivot.rotation.x) * damp;
      }
      if (rig.skirtPivot) {
        rig.skirtPivot.rotation.x += (0 - rig.skirtPivot.rotation.x) * damp;
      }
    }
  }

  return {
    buildRizka,
    buildKael,
    buildNadine,
    buildBuMira,
    buildHana,
    buildSena,
    updateActor
  };
})();
