/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   MIKHAEL / KAEL (1.77m) — ULTRA-HD HERO CHARACTER BUILDER
   (assets/characters/kael/kael_builder.js)
   - Kontinuitas identitas 100% dengan Chapter 1–3
   - 7 Ekspresi Wajah Penuh: neutral (calm), small_smile, confused, awkward,
     worried, noticing_rizka, serious
   - Poni berlapis di atas alis (kedua mata slate-sapphire 100% jelas),
     blazer terbuka rapi, dasi slate-blue, jam tangan, & tangan 10 jari
============================================================================ */
"use strict";

window.Ch4KaelBuilder = (function () {
  const SPEC = {
    id: "kael",
    fullName: "Mikhael (Kael)",
    heightM: 1.77,
    headRadius: 0.116,
    palette: {
      skinBase: "#EED1BF",
      hairRoot: "#161922",
      hairMain: "#202532",
      hairTip: "#343D50",
      hairHalo: "#798CA8",
      irisTop: "#1F2938",
      irisMid: "#5B7B9C",
      irisGold: "#A9CBE8",
      blazer: "#1C2940",
      shirt: "#F4F2ED",
      tie: "#5B7FA6",
      trousers: "#232934",
      shoe: "#E4E7EC"
    }
  };

  function build() {
    const Core = window.Ch4CharacterCore;
    const Shader = window.Ch4AnimeShader;
    const P = SPEC.palette;
    const R = SPEC.headRadius;

    const root = new THREE.Group();
    root.name = "Kael_Ch4_Root";
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const cr = new THREE.Group();
    bodyPivot.add(cr);

    const skinMat = Shader.createSkinMaterial({ color: P.skinBase });
    const faceTex = Core.createFaceSkinTexture({ id: "kael_ch4", female: false, skinBase: P.skinBase, beautyMark: false });
    const faceSkinMat = Shader.createSkinMaterial({ map: faceTex, color: 0xffffff });
    const hairMat = Shader.createHairMaterial({ color: P.hairMain, haloColor: P.hairHalo, roughness: 0.46 });
    const hairDarkMat = Shader.createHairMaterial({ color: P.hairRoot, haloColor: P.hairHalo, roughness: 0.50 });
    const hairTipMat = Shader.createHairMaterial({ color: P.hairTip, haloColor: P.hairHalo, roughness: 0.42 });

    const blazerMat = Shader.createClothMaterial({ color: P.blazer, roughness: 0.74 });
    const shirtMat = Shader.createClothMaterial({ color: P.shirt, roughness: 0.76 });
    const tieMat = Shader.createClothMaterial({ color: P.tie, roughness: 0.58, noWeave: true });
    const trousersMat = Shader.createClothMaterial({ color: P.trousers, roughness: 0.76 });
    const shoeMat = Shader.createClothMaterial({ color: P.shoe, roughness: 0.52, noWeave: true });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x222834, roughness: 0.72 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd8e2ef, roughness: 0.22, metalness: 0.80 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xdcb868, roughness: 0.28, metalness: 0.72 });

    // HIPS (y = 0.965)
    const hips = new THREE.Group();
    hips.position.set(0, 0.965, 0);
    cr.add(hips);

    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.138, 0.115, 22), trousersMat);
    pelvis.scale.set(1.04, 1, 0.76);
    pelvis.position.y = -0.02;
    hips.add(pelvis);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.144, 0.144, 0.028, 22), new THREE.MeshStandardMaterial({ color: 0x1e222b, roughness: 0.45 }));
    belt.scale.set(1.04, 1, 0.77);
    belt.position.y = 0.025;
    const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.026, 0.012), silverMat);
    beltBuckle.position.set(0, 0.025, 0.112);
    hips.add(belt, beltBuckle);

    // SPINE & BROAD MASCULINE CHEST
    const spine = new THREE.Group();
    spine.position.set(0, 0.045, 0);
    hips.add(spine);

    const chest = new THREE.Group();
    chest.position.set(0, 0.155, 0);
    spine.add(chest);

    const mTorsoProfile = [
      new THREE.Vector2(0.136, -0.175),
      new THREE.Vector2(0.140, -0.060),
      new THREE.Vector2(0.158, 0.085),
      new THREE.Vector2(0.174, 0.205),
      new THREE.Vector2(0.168, 0.242),
      new THREE.Vector2(0.120, 0.264),
      new THREE.Vector2(0.052, 0.282)
    ];
    const innerTorso = new THREE.Mesh(new THREE.LatheGeometry(mTorsoProfile, 30), shirtMat);
    innerTorso.scale.set(1.06, 1.0, 0.74);
    innerTorso.castShadow = true;
    innerTorso.receiveShadow = true;
    chest.add(innerTorso);

    // Open Academy Blazer + Lapels + Pocket + Gold Buttons
    const jacketGroup = new THREE.Group();
    const mjProfile = [
      new THREE.Vector2(0.148, -0.195),
      new THREE.Vector2(0.150, -0.060),
      new THREE.Vector2(0.168, 0.085),
      new THREE.Vector2(0.184, 0.208),
      new THREE.Vector2(0.178, 0.244),
      new THREE.Vector2(0.128, 0.266)
    ];
    const jacketShell = new THREE.Mesh(new THREE.LatheGeometry(mjProfile, 30, 0.30, Math.PI * 2 - 0.60), blazerMat);
    jacketShell.scale.set(1.06, 1.0, 0.76);
    jacketShell.castShadow = true;
    jacketShell.receiveShadow = true;
    jacketGroup.add(jacketShell);

    [-1, 1].forEach((s) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.385, 0.020), blazerMat);
      panel.position.set(s * 0.068, 0.020, 0.112);
      panel.rotation.y = s * 0.16;
      panel.castShadow = true;
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.215, 0.016), blazerMat);
      lapel.position.set(s * 0.056, 0.145, 0.123);
      lapel.rotation.set(-0.08, s * 0.20, s * -0.18);
      jacketGroup.add(panel, lapel);
      if (s === 1) {
        const btnA = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.006, 10), goldMat);
        btnA.rotation.x = Math.PI / 2;
        btnA.position.set(0.045, 0.015, 0.122);
        const btnB = btnA.clone();
        btnB.position.y = -0.055;
        jacketGroup.add(btnA, btnB);
      } else {
        const breastPocket = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.012, 0.008), blazerMat);
        breastPocket.position.set(-0.082, 0.118, 0.116);
        breastPocket.rotation.y = -0.22;
        jacketGroup.add(breastPocket);
      }
    });
    chest.add(jacketGroup);

    // Shirt Collar & Effortlessly Loosened Tie
    const tieGroup = new THREE.Group();
    const kCollarBack = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.060, 0.024, 20, 1, true, Math.PI * 0.20, Math.PI * 1.60), shirtMat.clone());
    kCollarBack.material.side = THREE.DoubleSide;
    kCollarBack.position.set(0, 0.272, -0.002);
    kCollarBack.userData.noOutline = true;
    tieGroup.add(kCollarBack);
    [-1, 1].forEach((s) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.026, 0.044), shirtMat);
      col.position.set(s * 0.032, 0.264, 0.030);
      col.rotation.set(0.28, s * 0.36, s * -0.30);
      col.userData.noOutline = true;
      tieGroup.add(col);
    });
    const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.028, 0.020), tieMat);
    tieKnot.position.set(0, 0.236, 0.082);
    const tieBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.023, 0.245, 4), tieMat);
    tieBlade.rotation.y = Math.PI / 4;
    tieBlade.scale.set(1.2, 1, 0.28);
    tieBlade.position.set(0.004, 0.105, 0.114);
    tieBlade.rotation.x = -0.10;
    tieBlade.rotation.z = 0.04;
    tieGroup.add(tieKnot, tieBlade);
    chest.add(tieGroup);

    // NECK & SCULPTED HEAD (y = 1.605)
    const neck = new THREE.Group();
    neck.position.set(0, 0.275, 0);
    chest.add(neck);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.115, 20), skinMat);
    neckMesh.position.y = 0.048;
    neckMesh.castShadow = true;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.set(0, 0.165, 0.005);
    neck.add(head);

    const headMesh = new THREE.Mesh(Core.buildHeroHeadGeometry(R, false), faceSkinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);
    head.add(Core.buildAnimeEars(R, false, skinMat, false));

    // Slate-Sapphire 1K Anime Eyes
    const eyeCfg = { id: "kael_ch4", female: false, irisTop: P.irisTop, irisMid: P.irisMid, irisGold: P.irisGold, irisGlow: "#D9ECFF" };
    const eyeL = Core.buildHeroEye(1, R, false, Core.createHeroEyeTexture(eyeCfg, false), P.skinBase, 0x161b24);
    const eyeR = Core.buildHeroEye(-1, R, false, Core.createHeroEyeTexture(eyeCfg, true), P.skinBase, 0x161b24);
    head.add(eyeL.group, eyeR.group);

    const buildBrow = (sideSign, isRight) => {
      const bx = sideSign * R * 0.375, by = R * 0.235;
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(R * 0.42, R * 0.13),
        new THREE.MeshBasicMaterial({ map: Core.createEyebrowTexture(P.hairRoot, isRight, 1.18), transparent: true, depthWrite: false })
      );
      b.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, false) + 0.0024);
      b.rotation.y = sideSign * 0.20;
      b.userData.noOutline = true;
      b.renderOrder = 4;
      return b;
    };
    const browL = buildBrow(1, false);
    const browR = buildBrow(-1, true);
    head.add(browL, browR);

    const blushTex = Core.createSoftBlushTexture();
    const mkBlush = (sideSign) => {
      const mat = new THREE.MeshBasicMaterial({ map: blushTex, transparent: true, opacity: 0.0, depthWrite: false });
      const bx = sideSign * R * 0.50, by = -R * 0.22;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.038, 0.022), mat);
      m.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, false) + 0.0020);
      m.rotation.y = sideSign * 0.42;
      m.userData.noOutline = true;
      m.renderOrder = 3;
      return { mesh: m, mat };
    };
    const blL = mkBlush(1), blR = mkBlush(-1);
    head.add(blL.mesh, blR.mesh);

    const mouth = Core.buildHeroMouth(R, false);
    head.add(mouth);

    // TOUSLED LAYERED IKEMEN HAIR (Swept Diagonal Fringe + Natural Crown Volume, Eyes 100% Clear!)
    const messyGrp = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.085, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    cap.position.set(0, 0.017, -0.012);
    cap.rotation.x = -0.58;
    cap.scale.set(0.97, 1.05, 1.05);
    cap.castShadow = true;
    messyGrp.add(cap);

    const napeGroup = new THREE.Group();
    for (let i = -4; i <= 4; i++) {
      const ang = (i / 4) * 1.18;
      const sx = Math.sin(ang), cz = -Math.cos(ang);
      napeGroup.add(Core.createHairLock([
        [sx * 0.088, 0.045, 0.022 + cz * 0.065],
        [sx * 0.108, -0.028, 0.018 + cz * 0.082],
        [sx * 0.096, -0.105, 0.014 + cz * 0.086]
      ], 0.025, 0.026, 0.0022, Math.abs(i) % 2 ? hairTipMat : hairDarkMat, 0.44, 16));
    }
    messyGrp.add(napeGroup);

    [-1, 1].forEach((s) => {
      messyGrp.add(Core.createHairLock([
        [s * 0.082, 0.088, 0.028],
        [s * 0.106, 0.032, 0.042],
        [s * 0.102, -0.048, 0.030],
        [s * 0.092, -0.096, 0.022]
      ], 0.021, 0.023, 0.0018, hairMat, 0.38, 16));
    });

    const messyLocks = [
      [[-0.014, 0.108, 0.030], [-0.004, 0.096, 0.092], [ 0.008, 0.056, 0.114], [ 0.016, 0.010, 0.114]],
      [[-0.022, 0.110, 0.028], [-0.036, 0.098, 0.089], [-0.044, 0.058, 0.105], [-0.042, 0.018, 0.101]],
      [[-0.034, 0.108, 0.024], [-0.062, 0.092, 0.082], [-0.078, 0.050, 0.092], [-0.082, 0.010, 0.084]],
      [[-0.048, 0.102, 0.018], [-0.088, 0.080, 0.068], [-0.104, 0.036, 0.072], [-0.106, -0.012, 0.060]],
      [[ 0.014, 0.110, 0.028], [ 0.036, 0.098, 0.089], [ 0.052, 0.060, 0.104], [ 0.062, 0.020, 0.098]],
      [[ 0.030, 0.108, 0.024], [ 0.064, 0.092, 0.081], [ 0.082, 0.052, 0.091], [ 0.090, 0.012, 0.082]],
      [[ 0.048, 0.102, 0.018], [ 0.088, 0.080, 0.068], [ 0.104, 0.038, 0.072], [ 0.106, -0.010, 0.060]],
      [[-0.018, 0.122, -0.005], [-0.048, 0.128, -0.022], [-0.078, 0.104, -0.040]],
      [[ 0.016, 0.124, -0.008], [ 0.046, 0.132, -0.026], [ 0.074, 0.108, -0.046]]
    ];
    messyLocks.forEach((pts, idx) => {
      const isCenter = idx === 0;
      const lk = Core.createHairLock(pts, isCenter ? 0.012 : 0.016, isCenter ? 0.017 : 0.025, 0.0010, idx % 2 === 0 ? hairMat : hairTipMat, 0.26, 20);
      lk.userData.noOutline = true;
      lk.castShadow = false;
      messyGrp.add(lk);
    });
    head.add(messyGrp);

    // ARMS, WRISTWATCH & ARTICULATED 10-FINGER HANDS
    function buildArm(sideSign) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sideSign * 0.170, 0.224, 0);
      chest.add(shoulder);

      const capM = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 12), blazerMat);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.255, 16), blazerMat);
      upper.position.y = -0.125;
      upper.castShadow = true;
      shoulder.add(capM, upper);

      const forearm = new THREE.Group();
      forearm.position.set(0, -0.252, 0);
      shoulder.add(forearm);

      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.029, 0.235, 16), blazerMat);
      lower.position.y = -0.115;
      lower.castShadow = true;
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.027, 0.026, 16), shirtMat);
      cuff.position.y = -0.224;
      forearm.add(lower, cuff);

      // Silver-leather wristwatch on Kael's left wrist (sideSign = +1)
      if (sideSign === 1) {
        const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.0285, 0.0285, 0.014, 16), new THREE.MeshStandardMaterial({ color: 0x2c221e, roughness: 0.5 }));
        strap.position.y = -0.230;
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.006, 14), silverMat);
        dial.rotation.z = Math.PI / 2;
        dial.position.set(0.028, -0.230, 0.004);
        forearm.add(strap, dial);
      }

      const hand = Core.buildAnimeHand(sideSign, skinMat, 1.08);
      hand.position.set(0, -0.238, 0);
      forearm.add(hand);

      return { shoulder, forearm, hand };
    }
    const armL = buildArm(1);
    const armR = buildArm(-1);

    // LEGS & TWO-TONE SNEAKERS
    function buildLeg(sideSign) {
      const thigh = new THREE.Group();
      thigh.position.set(sideSign * 0.088, -0.045, 0);
      hips.add(thigh);

      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.054, 0.435, 18), trousersMat);
      upper.position.y = -0.218;
      upper.castShadow = true;
      thigh.add(upper);

      const shin = new THREE.Group();
      shin.position.set(0, -0.435, 0);
      thigh.add(shin);

      const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.042, 0.425, 18), trousersMat);
      lower.position.y = -0.212;
      lower.castShadow = true;
      shin.add(lower);

      const foot = new THREE.Group();
      foot.position.set(0, -0.425, 0);
      shin.add(foot);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.022, 0.195), soleMat);
      sole.position.set(0, -0.049, 0.042);
      const shoeBody = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.048, 0.175), shoeMat);
      shoeBody.position.set(0, -0.022, 0.034);
      shoeBody.castShadow = true;
      const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.039, 14, 10), shoeMat);
      shoeToe.scale.set(1.0, 0.68, 1.18);
      shoeToe.position.set(0, -0.026, 0.118);
      const heelTab = new THREE.Mesh(new THREE.BoxGeometry(0.080, 0.022, 0.042), blazerMat);
      heelTab.position.set(0, -0.012, -0.035);
      foot.add(sole, shoeBody, shoeToe, heelTab);

      return { thigh, shin, foot };
    }
    const legL = buildLeg(1);
    const legR = buildLeg(-1);

    Shader.applyAnimeCelPass(cr, 0x161b26, 0.0020);

    // 7 EXPRESSION DEFINITIONS FOR KAEL
    const EXPR = {
      neutral:        { m: -1, byL: R * 0.235, byR: R * 0.235, btL:  0.02, btR: -0.02, es: 1.00, bl: 0.04, gx: 0.0,    gy: 0.0 },
      calm:           { m: -1, byL: R * 0.238, byR: R * 0.238, btL:  0.01, btR: -0.01, es: 0.98, bl: 0.04, gx: 0.0,    gy: 0.0 },
      small_smile:    { m:  0, byL: R * 0.246, byR: R * 0.246, btL: -0.02, btR:  0.02, es: 0.96, bl: 0.14, gx: 0.0,    gy: 0.0 },
      confused:       { m:  5, byL: R * 0.228, byR: R * 0.258, btL:  0.12, btR:  0.08, es: 1.03, bl: 0.06, gx: 0.010,  gy: 0.0 },
      awkward:        { m:  1, byL: R * 0.232, byR: R * 0.238, btL:  0.15, btR: -0.11, es: 0.93, bl: 0.48, gx: -0.016, gy: -0.01 },
      worried:        { m:  5, byL: R * 0.226, byR: R * 0.226, btL:  0.17, btR: -0.17, es: 0.94, bl: 0.06, gx: 0.0,    gy: 0.0 },
      noticing_rizka: { m: -1, byL: R * 0.248, byR: R * 0.248, btL:  0.08, btR: -0.08, es: 1.06, bl: 0.08, gx: 0.008,  gy: 0.0 },
      serious:        { m:  3, byL: R * 0.218, byR: R * 0.218, btL: -0.14, btR:  0.14, es: 0.90, bl: 0.04, gx: 0.0,    gy: 0.0 }
    };

    const st = { expr: "neutral", blinkTimer: 3.1, blinkP: 0, blinking: false, t: 0.7 };

    const rig = {
      id: "kael",
      name: "Kael",
      isFemale: false,
      root,
      bodyPivot,
      spinePivot: spine,
      chestPivot: chest,
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
      longHairPivot: napeGroup,
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

    rig.studioUpdate = (dt) => {
      st.t += dt;
      if (!st.blinking) {
        st.blinkTimer -= dt;
        if (st.blinkTimer <= 0) {
          st.blinking = true;
          st.blinkP = 0;
          st.blinkTimer = 2.8 + Math.random() * 3.1;
        }
      }
      let ba = 0;
      if (st.blinking) {
        st.blinkP += dt * 12.5;
        if (st.blinkP >= Math.PI) st.blinking = false;
        else ba = Math.sin(st.blinkP);
      }
      const E = EXPR[st.expr] || EXPR.neutral;
      [eyeL, eyeR].forEach((e) => {
        e.upperLid.scale.y = Math.max(0.001, ba);
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
            tg = rig.talking ? Math.max(0, Math.sin(st.t * 13.5) * 0.55 + Math.sin(st.t * 20.5) * 0.45) * 0.84 : 0;
          }
          inf[i] += (tg - inf[i]) * k;
        }
      }
      browL.position.y += (E.byL - browL.position.y) * sm;
      browR.position.y += (E.byR - browR.position.y) * sm;
      browL.rotation.z += (E.btL - browL.rotation.z) * sm;
      browR.rotation.z += (E.btR - browR.rotation.z) * sm;
      eyeL.mesh.scale.y += (E.es - eyeL.mesh.scale.y) * sm;
      eyeR.mesh.scale.y += (E.es - eyeR.mesh.scale.y) * sm;
      blL.mat.opacity += (E.bl - blL.mat.opacity) * sm;
      blR.mat.opacity += (E.bl - blR.mat.opacity) * sm;

      chest.scale.z = 1.0 + Math.sin(st.t * 1.9) * 0.010;
    };

    return rig;
  }

  return { SPEC, build };
})();
