/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   NADINE (1.63m) — BESPOKE CLASSMATE CHARACTER BUILDER
   (assets/characters/nadine/nadine_builder.js)
   - Desain orisinal 100% terpisah dari Rizka & Kael, konsisten dengan dunia Cicaww33:
     * Rambut bob bergelombang cokelat madu (#7A523A -> #9C6D4E) melengkung ke dalam
       dengan dua jepit rambut amber/krem di pelipis kiri
     * Mata hazel-olive hangat sedikit terangkat ramah (catTilt: 0.45)
     * Vest rajut sekolah V-neck krem (#EAE0D0) berlist navy-emas di atas kemeja putih
       lengan gulung + pita dasi terakota-koral (#C96F5B)
     * Rok lipit abu-navy gelap, kaos kaki putih pendek, penny loafers, &
       Map Presensi Kelas 11-A di tangan
============================================================================ */
"use strict";

window.Ch4NadineBuilder = (function () {
  const SPEC = {
    id: "nadine",
    fullName: "Nadine",
    heightM: 1.63,
    headRadius: 0.109,
    palette: {
      skinBase: "#F6DCCD",
      hairRoot: "#5E3D2B",
      hairMain: "#7A523A",
      hairTip: "#9C6D4E",
      hairHalo: "#EBC69E",
      irisTop: "#2B2618",
      irisMid: "#7D743B",
      irisGold: "#D8C972",
      vest: "#EAE0D0",
      shirt: "#F8F6F1",
      ribbon: "#C96F5B",
      skirt: "#323E52",
      sock: "#F4F1EA",
      shoe: "#4A3126"
    }
  };

  function build() {
    const Core = window.Ch4CharacterCore;
    const Shader = window.Ch4AnimeShader;
    const Tex = window.Ch4Textures;
    const P = SPEC.palette;
    const R = SPEC.headRadius;

    const root = new THREE.Group();
    root.name = "Nadine_Ch4_Root";
    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const cr = new THREE.Group();
    bodyPivot.add(cr);

    const skinMat = Shader.createSkinMaterial({ color: P.skinBase });
    const faceTex = Core.createFaceSkinTexture({ id: "nadine_ch4", female: true, skinBase: P.skinBase, beautyMark: false });
    const faceSkinMat = Shader.createSkinMaterial({ map: faceTex, color: 0xffffff });
    const hairMat = Shader.createHairMaterial({ color: P.hairMain, haloColor: P.hairHalo, roughness: 0.42 });
    const hairDarkMat = Shader.createHairMaterial({ color: P.hairRoot, haloColor: P.hairHalo, roughness: 0.48 });
    const hairTipMat = Shader.createHairMaterial({ color: P.hairTip, haloColor: P.hairHalo, roughness: 0.38 });

    const vestMat = Shader.createClothMaterial({ map: Tex.getCableKnit(P.vest), color: 0xffffff, roughness: 0.80, noWeave: true });
    const shirtMat = Shader.createClothMaterial({ color: P.shirt, roughness: 0.74 });
    const navyTrimMat = Shader.createClothMaterial({ color: 0x243148, roughness: 0.70, noWeave: true });
    const coralMat = Shader.createClothMaterial({ color: P.ribbon, roughness: 0.52, noWeave: true });
    const skirtMat = Shader.createClothMaterial({ color: P.skirt, roughness: 0.74 });
    const sockMat = Shader.createClothMaterial({ color: P.sock, roughness: 0.70 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: P.shoe, roughness: 0.32, metalness: 0.12 });
    const pinGoldMat = new THREE.MeshStandardMaterial({ color: 0xf4c57a, roughness: 0.25, metalness: 0.65 });
    const pinCreamMat = new THREE.MeshStandardMaterial({ color: 0xfff4df, roughness: 0.28, metalness: 0.20 });

    // HIPS & PLEATED SKIRT (y = 0.905 — 1.63m stature)
    const hips = new THREE.Group();
    hips.position.set(0, 0.905, 0);
    cr.add(hips);

    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.103, 20, 16), skirtMat);
    pelvis.scale.set(1.03, 0.72, 0.80);
    pelvis.position.y = -0.02;
    hips.add(pelvis);

    const skirtPivot = new THREE.Group();
    skirtPivot.position.set(0, 0.016, 0);
    hips.add(skirtPivot);
    const skirtBuilt = Core.buildPleatedSkirt(20, 0.103, 0.165, 0.252, 0.82, skirtMat);
    skirtPivot.add(skirtBuilt.group);

    // SPINE & CREAM KNIT V-NECK VEST TORSO
    const spine = new THREE.Group();
    spine.position.set(0, 0.048, 0);
    hips.add(spine);

    const chest = new THREE.Group();
    chest.position.set(0, 0.138, 0);
    spine.add(chest);

    // Inner Crisp White Blouse Torso + Open-V Cream Cable-Knit Vest Shell (Zero protruding pyramid!)
    const innerBlouseProfile = [
      new THREE.Vector2(0.092, -0.145),
      new THREE.Vector2(0.086, -0.055),
      new THREE.Vector2(0.114, 0.065),
      new THREE.Vector2(0.126, 0.158),
      new THREE.Vector2(0.122, 0.194),
      new THREE.Vector2(0.085, 0.218),
      new THREE.Vector2(0.042, 0.236)
    ];
    const innerBlouse = new THREE.Mesh(new THREE.LatheGeometry(innerBlouseProfile, 28), shirtMat);
    innerBlouse.scale.set(1.03, 1.0, 0.78);
    innerBlouse.castShadow = true;
    innerBlouse.receiveShadow = true;
    chest.add(innerBlouse);

    const vestProfile = [
      new THREE.Vector2(0.101, -0.152),
      new THREE.Vector2(0.094, -0.055),
      new THREE.Vector2(0.121, 0.065),
      new THREE.Vector2(0.134, 0.158),
      new THREE.Vector2(0.129, 0.196),
      new THREE.Vector2(0.092, 0.220)
    ];
    // Open V-front knit vest shell wrapping back/sides and closing at lower torso!
    const vestUpper = new THREE.Mesh(new THREE.LatheGeometry(vestProfile, 28, 0.34, Math.PI * 2 - 0.68), vestMat);
    vestUpper.scale.set(1.04, 1.0, 0.80);
    vestUpper.castShadow = true;
    vestUpper.receiveShadow = true;
    const vestLowerFront = new THREE.Mesh(new THREE.CylinderGeometry(0.116, 0.098, 0.22, 24), vestMat);
    vestLowerFront.scale.set(1.04, 1.0, 0.80);
    vestLowerFront.position.y = -0.042;
    vestLowerFront.castShadow = true;
    const hemTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.100, 0.101, 0.022, 28), navyTrimMat);
    hemTrim.scale.set(1.05, 1, 0.81);
    hemTrim.position.y = -0.142;
    [-1, 1].forEach((s) => {
      const vRib = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.165, 0.014), navyTrimMat);
      vRib.position.set(s * 0.036, 0.142, 0.092);
      vRib.rotation.set(-0.14, s * 0.18, s * -0.24);
      chest.add(vRib);
    });
    chest.add(vestUpper, vestLowerFront, hemTrim);

    // Tailored Shirt Collar + Coral-Terracotta Ribbon Bow
    const collarBack = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.052, 0.022, 20, 1, true, Math.PI * 0.22, Math.PI * 1.56), shirtMat.clone());
    collarBack.material.side = THREE.DoubleSide;
    collarBack.position.set(0, 0.228, -0.002);
    collarBack.userData.noOutline = true;
    chest.add(collarBack);
    [-1, 1].forEach((s) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.022, 0.036), shirtMat);
      col.position.set(s * 0.026, 0.220, 0.028);
      col.rotation.set(0.32, s * 0.38, s * -0.34);
      col.userData.noOutline = true;
      chest.add(col);
    });
    const coralTie = Core.buildSatinBow(1.18, coralMat, 0.056);
    coralTie.position.set(0, 0.196, 0.082);
    coralTie.rotation.x = -0.12;
    chest.add(coralTie);

    // NECK & HEAD
    const neck = new THREE.Group();
    neck.position.set(0, 0.234, 0);
    chest.add(neck);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.037, 0.095, 18), skinMat);
    neckMesh.position.y = 0.042;
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.set(0, 0.145, 0.004);
    neck.add(head);

    const headMesh = new THREE.Mesh(Core.buildHeroHeadGeometry(R, true), faceSkinMat);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);
    head.add(Core.buildAnimeEars(R, true, skinMat, false));

    // Upturned Hazel-Olive Jewel Eyes (catTilt: 0.45 -> distinctly different eye shape from Rizka!)
    const eyeCfg = {
      id: "nadine_ch4", female: true, catTilt: 0.45, irisRx: 126, irisRy: 136,
      irisTop: P.irisTop, irisMid: P.irisMid, irisGold: P.irisGold, irisGlow: "#FFF2BD"
    };
    const eyeL = Core.buildHeroEye(1, R, true, Core.createHeroEyeTexture(eyeCfg, false), P.skinBase, 0x241812);
    const eyeR = Core.buildHeroEye(-1, R, true, Core.createHeroEyeTexture(eyeCfg, true), P.skinBase, 0x241812);
    head.add(eyeL.group, eyeR.group);

    const buildBrow = (sideSign, isRight) => {
      const bx = sideSign * R * 0.365, by = R * 0.262;
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(R * 0.38, R * 0.12),
        new THREE.MeshBasicMaterial({ map: Core.createEyebrowTexture(P.hairRoot, isRight, 0.95), transparent: true, depthWrite: false })
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

    const blushTex = Core.createSoftBlushTexture();
    const mkBlush = (sideSign) => {
      const mat = new THREE.MeshBasicMaterial({ map: blushTex, transparent: true, opacity: 0.28, depthWrite: false });
      const bx = sideSign * R * 0.49, by = -R * 0.22;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.022), mat);
      m.position.set(bx, by, Core.surfaceZAtFace(bx, by, R, true) + 0.0020);
      m.rotation.y = sideSign * 0.42;
      m.userData.noOutline = true;
      m.renderOrder = 3;
      return { mesh: m, mat };
    };
    const blL = mkBlush(1), blR = mkBlush(-1);
    head.add(blL.mesh, blR.mesh);

    const mouth = Core.buildHeroMouth(R, true);
    head.add(mouth);

    // WAVY HONEY-CARAMEL BOB HAIRSTYLE + DOUBLE HAIRPINS
    const hairRoot = new THREE.Group();
    head.add(hairRoot);

    const crownCap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.09, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    crownCap.position.set(0, 0.017, -0.012);
    crownCap.rotation.x = -0.58;
    crownCap.scale.set(0.98, 1.05, 1.05);
    crownCap.castShadow = true;
    hairRoot.add(crownCap);

    // Side-parted airy bangs (parted on left +X, sweeping across to -X)
    [
      [[ 0.042, 0.102, 0.026], [ 0.012, 0.096, 0.088], [-0.020, 0.064, 0.104], [-0.042, 0.024, 0.098]],
      [[ 0.032, 0.104, 0.026], [-0.012, 0.094, 0.086], [-0.048, 0.058, 0.098], [-0.072, 0.018, 0.086]],
      [[ 0.005, 0.100, 0.022], [-0.048, 0.086, 0.078], [-0.078, 0.048, 0.086], [-0.094, 0.006, 0.072]],
      [[ 0.048, 0.100, 0.024], [ 0.068, 0.088, 0.080], [ 0.082, 0.054, 0.088], [ 0.088, 0.022, 0.078]]
    ].forEach((pts, idx) => {
      const lk = Core.createHairLock(pts, 0.016, 0.026, 0.0026, idx % 2 === 0 ? hairMat : hairTipMat, 0.28, 15);
      lk.userData.noOutline = true;
      lk.castShadow = false;
      hairRoot.add(lk);
    });

    // Double Amber & Cream Hairpins on Nadine's left temple (+X)
    const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.006, 0.004), pinGoldMat);
    pin1.position.set(0.082, 0.048, 0.072);
    pin1.rotation.set(0.1, -0.58, -0.28);
    pin1.userData.noOutline = true;
    const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.0055, 0.004), pinCreamMat);
    pin2.position.set(0.084, 0.034, 0.069);
    pin2.rotation.set(0.1, -0.58, -0.22);
    pin2.userData.noOutline = true;
    hairRoot.add(pin1, pin2);

    // 15 Inward-Curling Wavy Bob Locks + Dark Under-Bob Volume Cap (Zero neck gaps!)
    const bobGroup = new THREE.Group();
    hairRoot.add(bobGroup);
    const underBob = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.098, 0.21, 20, 1, false, Math.PI * 0.42, Math.PI * 1.16), hairDarkMat);
    underBob.position.set(0, -0.068, -0.018);
    bobGroup.add(underBob);
    for (let i = -7; i <= 7; i++) {
      const ang = (i / 7) * 1.44;
      const sx = Math.sin(ang), cz = -Math.cos(ang);
      const isLeftTucked = i >= 6;
      const pts = [
        [sx * 0.088, 0.062, 0.018 + cz * 0.056],
        [sx * (isLeftTucked ? 0.104 : 0.120), -0.018, 0.018 + cz * 0.074],
        [sx * (isLeftTucked ? 0.102 : 0.118), -0.105, 0.022 + cz * 0.070],
        [sx * 0.082, -0.168, 0.028 + cz * 0.048]
      ];
      const mat = Math.abs(i) % 2 === 1 ? hairTipMat : (Math.abs(i) === 7 ? hairDarkMat : hairMat);
      bobGroup.add(Core.createHairLock(pts, 0.026, 0.032, 0.0024, mat, 0.44, 18));
    }

    // WHITE BLOUSE SLEEVES (Rolled Cuffs at Forearm!) & HANDS
    function buildArm(sideSign) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sideSign * 0.128, 0.184, 0);
      chest.add(shoulder);

      const capM = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 12), shirtMat);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.029, 0.22, 16), shirtMat);
      upper.position.y = -0.11;
      upper.castShadow = true;
      shoulder.add(capM, upper);

      const forearm = new THREE.Group();
      forearm.position.set(0, -0.22, 0);
      shoulder.add(forearm);

      // Rolled blouse sleeve to mid-forearm + bare forearm skin!
      const halfSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.028, 0.085, 16), shirtMat);
      halfSleeve.position.y = -0.042;
      const rollCuff = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.006, 8, 18), shirtMat);
      rollCuff.rotation.x = Math.PI / 2;
      rollCuff.position.y = -0.084;
      const bareForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.020, 0.13, 16), skinMat);
      bareForearm.position.y = -0.145;
      bareForearm.castShadow = true;
      forearm.add(halfSleeve, rollCuff, bareForearm);

      const hand = Core.buildAnimeHand(sideSign, skinMat, 0.96);
      hand.position.set(0, -0.212, 0);
      forearm.add(hand);

      return { shoulder, forearm, hand };
    }
    const armL = buildArm(1);
    const armR = buildArm(-1);

    // LEGS + WHITE QUARTER SOCKS + LOAFERS
    function buildLeg(sideSign) {
      const thigh = new THREE.Group();
      thigh.position.set(sideSign * 0.064, -0.045, 0);
      hips.add(thigh);

      const thighSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.040, 0.40, 18), skinMat);
      thighSkin.position.y = -0.20;
      thighSkin.castShadow = true;
      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.039, 14, 12), skinMat);
      kneeJoint.position.y = -0.40;
      thigh.add(thighSkin, kneeJoint);

      const shin = new THREE.Group();
      shin.position.set(0, -0.40, 0);
      thigh.add(shin);

      const bareCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.028, 0.27, 18), skinMat);
      bareCalf.position.y = -0.135;
      bareCalf.castShadow = true;
      const quarterSock = new THREE.Mesh(new THREE.CylinderGeometry(0.029, 0.025, 0.135, 16), sockMat);
      quarterSock.position.y = -0.335;
      shin.add(bareCalf, quarterSock);

      const foot = new THREE.Group();
      foot.position.set(0, -0.40, 0);
      shin.add(foot);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.018, 0.152), new THREE.MeshStandardMaterial({ color: 0x221714, roughness: 0.7 }));
      sole.position.set(0, -0.046, 0.032);
      const upperShoe = new THREE.Mesh(new THREE.BoxGeometry(0.060, 0.038, 0.138), shoeMat);
      upperShoe.position.set(0, -0.024, 0.028);
      upperShoe.castShadow = true;
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.030, 14, 10), shoeMat);
      toe.scale.set(1.0, 0.68, 1.18);
      toe.position.set(0, -0.026, 0.092);
      foot.add(sole, upperShoe, toe);

      return { thigh, shin, foot };
    }
    const legL = buildLeg(1);
    const legR = buildLeg(-1);

    Shader.applyAnimeCelPass(cr, 0x2a1c1a, 0.0018);

    // CLASS 11-A ATTENDANCE BINDER IN RIGHT HAND
    const binderGroup = new THREE.Group();
    binderGroup.position.set(0.025, -0.035, 0.055);
    binderGroup.rotation.set(-0.62, 0.35, -0.25);
    const folderCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.25, 0.018),
      Shader.createClothMaterial({ color: 0x6b95c2, roughness: 0.55, noWeave: true })
    );
    const paperSheet = new THREE.Mesh(
      new THREE.BoxGeometry(0.175, 0.235, 0.020),
      new THREE.MeshStandardMaterial({ color: 0xfffaf2, roughness: 0.8 })
    );
    paperSheet.position.set(0.004, 0, 0);
    const clipTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.022, 0.026),
      new THREE.MeshStandardMaterial({ color: 0xd8e2ef, metalness: 0.75, roughness: 0.25 })
    );
    clipTop.position.set(0, 0.12, 0);
    binderGroup.add(folderCover, paperSheet, clipTop);
    armR.hand.add(binderGroup);
    armR.hand.setGrip(0.55);

    const EXPR = {
      neutral:        { m: -1, by: R * 0.262, bt: -0.04, es: 1.00, bl: 0.26 },
      friendly_smile: { m:  0, by: R * 0.274, bt: -0.06, es: 0.98, bl: 0.34 },
      polite:         { m:  0, by: R * 0.266, bt: -0.03, es: 0.96, bl: 0.28 },
      surprised:      { m:  5, by: R * 0.292, bt:  0.04, es: 1.08, bl: 0.24 },
      awkward:        { m:  1, by: R * 0.256, bt:  0.12, es: 0.94, bl: 0.42 }
    };
    const st = { expr: "friendly_smile", blinkTimer: 2.2, blinkP: 0, blinking: false, t: 1.4 };

    const rig = {
      id: "nadine",
      name: "Nadine",
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
      longHairPivot: bobGroup,
      binderGroup,
      holdingRightHandProp: true,
      poseOverride: null,
      talking: false,
      walkPhase: 0,
      currentExpr: "friendly_smile"
    };

    rig.setExpression = (id) => {
      const key = EXPR[id] ? id : "friendly_smile";
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
          st.blinkTimer = 2.5 + Math.random() * 2.8;
        }
      }
      let ba = 0;
      if (st.blinking) {
        st.blinkP += dt * 13.0;
        if (st.blinkP >= Math.PI) st.blinking = false;
        else ba = Math.sin(st.blinkP);
      }
      [eyeL, eyeR].forEach((e) => {
        e.upperLid.scale.y = Math.max(0.001, ba);
        e.lashClosed.visible = ba > 0.72;
        e.lash3D.visible = ba <= 0.72;
      });

      const E = EXPR[st.expr] || EXPR.friendly_smile;
      const k = Math.min(1, dt * 12);
      const sm = Math.min(1, dt * 9);
      const inf = mouth.morphTargetInfluences;
      if (inf) {
        for (let i = 0; i < 9; i++) {
          let tg = i === E.m ? 1 : 0;
          if (i === 8) {
            tg = rig.talking ? Math.max(0, Math.sin(st.t * 14.0) * 0.55 + Math.sin(st.t * 21.0) * 0.45) * 0.82 : 0;
          }
          inf[i] += (tg - inf[i]) * k;
        }
      }
      browL.position.y += (E.by - browL.position.y) * sm;
      browR.position.y += (E.by - browR.position.y) * sm;
      browL.rotation.z += (E.bt - browL.rotation.z) * sm;
      browR.rotation.z += (-E.bt - browR.rotation.z) * sm;
      eyeL.mesh.scale.y += (E.es - eyeL.mesh.scale.y) * sm;
      eyeR.mesh.scale.y += (E.es - eyeR.mesh.scale.y) * sm;
      blL.mat.opacity += (E.bl - blL.mat.opacity) * sm;
      blR.mat.opacity += (E.bl - blR.mat.opacity) * sm;

      chest.scale.z = 1.0 + Math.sin(st.t * 2.0) * 0.011;
    };

    return rig;
  }

  return { SPEC, build };
})();
