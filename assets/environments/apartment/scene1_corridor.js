/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   SCENE 1 ENVIRONMENT: KORIDOR APARTEMEN LT. 3 MALAM HARI ("AFTER THE CALL")
   (assets/environments/apartment/scene1_corridor.js)
   - Arsitektur tertutup rapat 100% (Unit 302 Rizka & Unit 301 Kael, Lobi Lift 3F,
     Jendela Galeri Malam + Panorama Kota Hujan Redup, Lampu Sconce Hangat)
============================================================================ */
"use strict";

window.Ch4Scene1Apartment = {
  build(quality = "high") {
    const P = window.Ch4Props;
    const T = window.Ch4Textures;
    const root = new THREE.Group();
    root.name = "Env_Scene1_ApartmentNight";
    const cutawayMeshes = [];

    const floorMat = new THREE.MeshStandardMaterial({
      map: T.getTerrazzoFloor("#374052", "#3f495e", 3, 9),
      roughness: 0.38,
      metalness: 0.06
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: T.getPlasterWall("#2e374b", "#222a3a", 5, 1),
      roughness: 0.82
    });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x242c3d, roughness: 0.88 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.58 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.68 });

    // Solid Floor & Coffered Ceiling (Length = 16.4m, Width = 4.8m)
    P.addBox(root, 5.0, 0.24, 16.6, floorMat, 0, -0.12, 0, false, true);
    const ceil = P.addBox(root, 5.0, 0.22, 16.6, ceilingMat, 0, 3.51, 0, false, true);
    cutawayMeshes.push(ceil);

    // Ceiling beams & warm recessed ceiling fixtures
    [-5.2, -1.6, 2.0, 5.6].forEach((cz) => {
      const beam = P.addBox(root, 4.8, 0.10, 0.24, trimMat, 0, 3.36, cz, false);
      const lampHousing = P.addBox(root, 0.64, 0.05, 0.32, trimMat, 0, 3.38, cz + 1.8, false);
      const lampGlow = P.addBox(
        root, 0.54, 0.04, 0.24,
        new THREE.MeshStandardMaterial({ color: 0xffe9c2, emissive: 0xffc978, emissiveIntensity: 0.85 }),
        0, 3.36, cz + 1.8, false, false
      );
      cutawayMeshes.push(beam, lampHousing, lampGlow);
    });

    // West Residence Wall (x = -2.40) — Unit 302 (Rizka) & Unit 301 (Kael)
    P.addBox(root, 0.26, 3.42, 16.6, wallMat, -2.40, 1.71, 0);
    P.addBox(root, 0.06, 0.12, 16.2, trimMat, -2.25, 0.06, 0, false);
    P.addBox(root, 0.08, 0.10, 16.2, trimMat, -2.24, 3.34, 0, false);

    const door302 = P.createArchitecturalDoor({ doorColor: 0x4f3b31, frameColor: 0x2c201b, unitNumber: "302", residentTag: "R. Alifia" });
    door302.position.set(-2.26, 0, -1.55);
    door302.rotation.y = Math.PI / 2;
    root.add(door302);

    const door301 = P.createArchitecturalDoor({ doorColor: 0x364356, frameColor: 0x222b38, unitNumber: "301", residentTag: "Mikhael" });
    door301.position.set(-2.26, 0, 2.15);
    door301.rotation.y = Math.PI / 2;
    root.add(door301);

    // Warm wall sconces beside doors + Real PointLights
    [-2.85, 0.35, 3.55].forEach((sz, idx) => {
      const sc = P.createWarmWallSconce();
      sc.position.set(-2.26, 2.18, sz);
      root.add(sc);
      if (quality !== "low" || idx === 1) {
        const pl = new THREE.PointLight(0xffcb85, idx === 1 ? 0.92 : 0.58, 7.5, 1.8);
        pl.position.set(-1.90, 2.18, sz);
        root.add(pl);
      }
    });

    // Small wooden console shelf & umbrella stand outside Unit 302 + Potted Plant
    const standMat = new THREE.MeshStandardMaterial({ color: 0x4e392b, roughness: 0.58 });
    P.addCyl(root, 0.13, 0.11, 0.46, 14, metalMat, -1.98, 0.23, -2.42);
    // Folded pale-blue umbrella resting inside stand!
    P.addCyl(root, 0.024, 0.014, 0.62, 10, new THREE.MeshStandardMaterial({ color: 0x8eb8e5, roughness: 0.45 }), -1.98, 0.36, -2.42);
    const plant1 = P.createPottedPlant(0.95);
    plant1.position.set(-1.92, 0, 0.35);
    root.add(plant1);

    // North Elevator Lobby Wall (z = -8.15) — Brushed Steel Elevator Doors + "3F" Digital Indicator + Call Panel
    P.addBox(root, 5.0, 3.42, 0.26, wallMat, 0, 1.71, -8.15);
    P.addBox(root, 1.82, 2.34, 0.12, trimMat, 0, 1.17, -8.00);
    P.addBox(root, 0.78, 2.20, 0.08, metalMat, -0.40, 1.10, -7.96);
    P.addBox(root, 0.78, 2.20, 0.08, metalMat,  0.40, 1.10, -7.96);
    P.addBox(
      root, 0.34, 0.12, 0.06,
      new THREE.MeshBasicMaterial({ color: 0xf4c57a }),
      0, 2.48, -7.96, false, false
    );
    const plant2 = P.createPottedPlant(1.05);
    plant2.position.set(1.68, 0, -7.35);
    root.add(plant2);

    // South Stairwell & Mailbox Wall (z = +8.15)
    const southWall = P.addBox(root, 5.0, 3.42, 0.26, wallMat, 0, 1.71, 8.15);
    cutawayMeshes.push(southWall);
    const fireDoor = P.createArchitecturalDoor({ doorColor: 0x3b485c, frameColor: 0x222a38, hasTransomGlass: true });
    fireDoor.position.set(-0.6, 0, 8.00);
    fireDoor.rotation.y = Math.PI;
    root.add(fireDoor);
    cutawayMeshes.push(fireDoor);

    // 3D Wall-Mounted Apartment Mailbox Bank on South-West corner
    const mbGroup = new THREE.Group();
    mbGroup.position.set(-2.22, 1.42, 5.6);
    P.addBox(mbGroup, 0.14, 0.76, 1.16, trimMat, 0, 0, 0);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        P.addBox(mbGroup, 0.16, 0.30, 0.32, metalMat, 0.01, -0.18 + r * 0.36, -0.36 + c * 0.36, false);
      }
    }
    root.add(mbGroup);

    // East Gallery Window Wall (x = +2.40) — Framed Windows + Night City Panorama Vista!
    const lowEast = P.addBox(root, 0.26, 0.96, 16.6, wallMat, 2.40, 0.48, 0);
    const topEast = P.addBox(root, 0.26, 0.72, 16.6, wallMat, 2.40, 3.06, 0);
    const sillEast = P.addBox(root, 0.34, 0.06, 16.4, trimMat, 2.38, 0.98, 0);
    cutawayMeshes.push(lowEast, topEast, sillEast);

    [-7.4, -3.7, 0.0, 3.7, 7.4].forEach((pz) => {
      const pil = P.addBox(root, 0.28, 1.76, 0.85, wallMat, 2.40, 1.84, pz);
      cutawayMeshes.push(pil);
    });
    [-5.55, -1.85, 1.85, 5.55].forEach((wz) => {
      const win = P.createFramedWindow({
        width: 2.75,
        height: 1.72,
        frameColor: 0x222c3d,
        glassColor: 0x4c6b94,
        glassOpacity: 0.22,
        emissiveIntensity: 0.16
      });
      win.position.set(2.36, 1.84, wz);
      win.rotation.y = -Math.PI / 2;
      root.add(win);
      cutawayMeshes.push(win);
    });

    // Corridor Bench near East Gallery Window
    const bench = P.createBench(1.52);
    bench.position.set(1.75, 0, -3.65);
    bench.rotation.y = -Math.PI / 2;
    root.add(bench);

    // Night City Skyline Panorama + Neighboring Illuminated Buildings outside East Window
    const nightVista = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 13),
      new THREE.MeshBasicMaterial({ map: T.getSkyVista("night"), fog: false })
    );
    nightVista.position.set(9.5, 2.8, 0);
    nightVista.rotation.y = -Math.PI / 2;
    root.add(nightVista);

    // Cool moonlight directional spill through gallery windows
    const moonLight = new THREE.PointLight(0x7aa6dc, 0.48, 12);
    moonLight.position.set(3.8, 2.6, -1.0);
    root.add(moonLight);

    // Subtle floating night dust motes near gallery light
    const pCount = quality === "low" ? 24 : 52;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.0;
      pos[i * 3 + 1] = 0.4 + Math.random() * 2.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14.0;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: T.getSoftParticleSprite(),
        color: 0xbdd6f2,
        size: 0.036,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      })
    );
    root.add(dust);

    const R = (cx, cz, w, d) => ({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });
    const zone = {
      bounds: { minX: -1.92, maxX: 1.92, minZ: -7.45, maxZ: 7.45 },
      cam: { minX: -2.18, maxX: 2.18, minZ: -7.85, maxZ: 7.85, maxY: 3.18 },
      colliders: [
        R(-1.95, -2.42, 0.45, 0.45),
        R(-1.92, 0.35, 0.48, 0.48),
        R(1.75, -3.65, 0.56, 1.62),
        R(1.68, -7.35, 0.50, 0.50)
      ]
    };

    return {
      root,
      zone,
      cutawayMeshes,
      windStrength: 0.08,
      lighting: {
        bg: 0x0d1526,
        fog: 0x0f182b,
        fogDensity: 0.020,
        hemiSky: 0x7694bd,
        hemiGround: 0x2c2224,
        hemiIntensity: 0.62,
        dirColor: 0x9ec0e8,
        dirIntensity: 0.52,
        dirPos: [8, 9, -2],
        rimColor: 0xf4c57a,
        rimIntensity: 0.62,
        rimPos: [-5, 4, 3]
      },
      update(dt, elapsed) {
        dust.position.y = Math.sin(elapsed * 0.6) * 0.05;
      }
    };
  }
};
