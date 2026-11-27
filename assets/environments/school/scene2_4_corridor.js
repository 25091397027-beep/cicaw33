/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   SCENE 2 & SCENE 4 ENVIRONMENT: KORIDOR SEKOLAH ("THE MORNING AFTER" &
   "A SMALL MISUNDERSTANDING")
   (assets/environments/school/scene2_4_corridor.js)
   - Mode "morning" (Scene 2): Sinar matahari pagi menembus jendela, halaman hijau
   - Mode "overcast" (Scene 4): Sore mendung bernuansa biru-abu sejuk & dramatis
   - Dilengkapi 12 loker baja 3D, papan pengumuman peringkat & piket, pintu 11-A/11-B,
     jam dinding, meja konsol, tanaman pot, bangku, & halaman kampus 3D di luar jendela!
============================================================================ */
"use strict";

window.Ch4Scene2And4Corridor = {
  build(mode = "morning", quality = "high") {
    const isOvercast = mode === "overcast";
    const P = window.Ch4Props;
    const T = window.Ch4Textures;
    const root = new THREE.Group();
    root.name = isOvercast ? "Env_Scene4_CorridorOvercast" : "Env_Scene2_CorridorMorning";
    const cutawayMeshes = [];

    const woodFloor = T.getHardwoodFloor(isOvercast ? "#a68b6d" : "#bc9b76", isOvercast ? "#866c50" : "#997854", 3, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodFloor.map,
      bumpMap: woodFloor.bumpMap,
      bumpScale: 0.004,
      roughness: 0.44
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: T.getPlasterWall(isOvercast ? "#e3dfd8" : "#f2ece0", isOvercast ? "#c7c0b4" : "#d8cebc", 5, 1),
      roughness: 0.84
    });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: isOvercast ? 0xdde2e8 : 0xf6f2ea, roughness: 0.88 });
    const woodTrim = new THREE.MeshStandardMaterial({ color: 0x6b4c35, roughness: 0.56 });

    // Corridor Dimensions: Width = 5.4m (x: -2.7..+2.7), Length = 21.6m (z: -10.8..+10.8)
    P.addBox(root, 5.6, 0.24, 21.8, floorMat, 0, -0.12, 0, false, true);
    const ceil = P.addBox(root, 5.6, 0.22, 21.8, ceilingMat, 0, 3.55, 0, false, true);
    cutawayMeshes.push(ceil);

    // Ceiling fluorescent troffers
    for (let z = -8.0; z <= 8.0; z += 4.0) {
      const f1 = P.addBox(root, 1.32, 0.05, 0.38, woodTrim, 0, 3.43, z, false);
      const f2 = P.addBox(
        root, 1.22, 0.04, 0.30,
        new THREE.MeshStandardMaterial({
          color: 0xfff8eb,
          emissive: isOvercast ? 0xd8e8ff : 0xffecc4,
          emissiveIntensity: isOvercast ? 0.55 : 0.72
        }),
        0, 3.41, z, false, false
      );
      cutawayMeshes.push(f1, f2);
    }

    // West Classroom Wall (x = -2.70) + Baseboard + Crown Trim
    P.addBox(root, 0.26, 3.45, 21.8, wallMat, -2.70, 1.725, 0);
    P.addBox(root, 0.06, 0.12, 21.4, woodTrim, -2.55, 0.06, 0, false);
    P.addBox(root, 0.08, 0.09, 21.4, woodTrim, -2.54, 3.38, 0, false);

    // North & South Corridor End Walls (Watertight, with Stairwell Double Doors)
    P.addBox(root, 5.6, 3.45, 0.26, wallMat, 0, 1.725, -10.8);
    const endDoorN = P.createArchitecturalDoor({ doorColor: 0x5c4636, frameColor: 0x3b2c22, hasTransomGlass: true });
    endDoorN.position.set(0, 0, -10.64);
    root.add(endDoorN);

    const southWall = P.addBox(root, 5.6, 3.45, 0.26, wallMat, 0, 1.725, 10.8);
    const endDoorS = P.createArchitecturalDoor({ doorColor: 0x5c4636, frameColor: 0x3b2c22, hasTransomGlass: true });
    endDoorS.position.set(0, 0, 10.64);
    endDoorS.rotation.y = Math.PI;
    root.add(endDoorS);
    cutawayMeshes.push(southWall, endDoorS);

    // Class 11-A Door (z = 1.8) & Class 11-B Door (z = -7.2) + Hanging Class Signs!
    [
      [1.8, "11-A"],
      [-7.2, "11-B"]
    ].forEach(([dz, label]) => {
      const d = P.createArchitecturalDoor({ doorColor: 0x76523b, frameColor: 0x4a3325, hasTransomGlass: true });
      d.position.set(-2.55, 0, dz);
      d.rotation.y = Math.PI / 2;
      root.add(d);

      // Protruding Japanese-style corridor classroom sign plaque
      P.addBox(root, 0.42, 0.04, 0.04, woodTrim, -2.36, 2.52, dz + 0.65, false);
      const signPlate = P.addBox(
        root, 0.34, 0.18, 0.03,
        new THREE.MeshStandardMaterial({ map: T.getDoorPlate(label, "KELAS XI"), roughness: 0.4 }),
        -2.34, 2.40, dz + 0.65, false
      );
      signPlate.rotation.y = 0;
    });

    // 8-Unit Student Locker Bank along West Wall (z = -4.8 .. -0.6)
    const lockers = P.createLockerBank(8);
    lockers.rotation.y = Math.PI / 2;
    lockers.position.set(-2.32, 0, -0.85); // extends along -Z! Wait: let's check rotation!
    // In createLockerBank, lockers extend along +X (0 .. (count-1)*0.56).
    // With rotation.y = Math.PI / 2: local +X -> world -Z, local +Z (front face) -> world +X (facing into corridor!).
    // So i=0 is at z = -0.85, i=7 is at z = -0.85 - 7*0.56 = -4.77! Front faces +X! Perfect!
    root.add(lockers);

    // Framed Cork Noticeboard (z = 4.35) + Analog Wall Clock
    P.addBox(root, 0.08, 1.24, 1.96, woodTrim, -2.53, 1.66, 4.35);
    const cork = new THREE.Mesh(
      new THREE.PlaneGeometry(1.82, 1.10),
      new THREE.MeshStandardMaterial({ map: T.getNoticeboardTexture(), roughness: 0.85 })
    );
    cork.rotation.y = Math.PI / 2;
    cork.position.set(-2.48, 1.66, 4.35);
    root.add(cork);

    // Analog Hallway Clock
    const clockRim = P.addCyl(root, 0.22, 0.22, 0.05, 24, woodTrim, -2.53, 2.74, 0.45, false);
    clockRim.rotation.z = Math.PI / 2;
    const clockFace = P.addCyl(root, 0.19, 0.19, 0.055, 24, new THREE.MeshBasicMaterial({ color: 0xfffcf5 }), -2.52, 2.74, 0.45, false);
    clockFace.rotation.z = Math.PI / 2;

    // Console Table + Rizka/Student School Bag + Stack of Class Handouts (z = 6.9)
    P.addBox(root, 0.56, 0.045, 1.28, woodTrim, -2.18, 0.76, 6.9);
    [[-0.22, -0.56], [0.22, -0.56], [-0.22, 0.56], [0.22, 0.56]].forEach(([lx, lz]) => {
      P.addBox(root, 0.05, 0.75, 0.05, woodTrim, -2.18 + lx, 0.375, 6.9 + lz);
    });
    const bag1 = P.createSchoolBag(0x52382d);
    bag1.position.set(-2.16, 0.78, 6.65);
    bag1.rotation.y = 1.35;
    root.add(bag1);
    P.addBox(root, 0.24, 0.06, 0.32, new THREE.MeshStandardMaterial({ color: 0xf8f5ee }), -2.15, 0.81, 7.18, false);

    // Potted Plants & Corridor Bench
    const plantA = P.createPottedPlant(1.0);
    plantA.position.set(-2.15, 0, -5.65);
    const plantB = P.createPottedPlant(1.0);
    plantB.position.set(2.12, 0, 8.6);
    const bench = P.createBench(1.62);
    bench.position.set(2.05, 0, -6.2);
    bench.rotation.y = -Math.PI / 2;
    root.add(plantA, plantB, bench);

    // East Window Gallery Wall (x = +2.70) — 5 Framed Windows + Sunbeams + Exterior Courtyard Vista!
    const lowEast = P.addBox(root, 0.26, 0.94, 21.8, wallMat, 2.70, 0.47, 0);
    const topEast = P.addBox(root, 0.26, 0.72, 21.8, wallMat, 2.70, 3.09, 0);
    const sillEast = P.addBox(root, 0.34, 0.06, 21.6, woodTrim, 2.68, 0.96, 0);
    cutawayMeshes.push(lowEast, topEast, sillEast);

    [-10.0, -6.0, -2.0, 2.0, 6.0, 10.0].forEach((pz) => {
      const pil = P.addBox(root, 0.28, 1.82, 0.92, wallMat, 2.70, 1.85, pz);
      cutawayMeshes.push(pil);
    });

    const sunBeams = [];
    [-8.0, -4.0, 0.0, 4.0, 8.0].forEach((wz) => {
      const win = P.createFramedWindow({
        width: 2.95,
        height: 1.76,
        frameColor: 0x6b4c35,
        glassColor: isOvercast ? 0x9bbce0 : 0xfff5dc,
        glassOpacity: isOvercast ? 0.24 : 0.18,
        emissiveIntensity: isOvercast ? 0.18 : 0.32
      });
      win.position.set(2.66, 1.85, wz);
      win.rotation.y = -Math.PI / 2;
      root.add(win);
      cutawayMeshes.push(win);

      if (!isOvercast && quality !== "low") {
        const beam = new THREE.Mesh(
          new THREE.PlaneGeometry(2.6, 4.8),
          new THREE.MeshBasicMaterial({
            color: 0xffe9be,
            transparent: true,
            opacity: 0.11,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        beam.position.set(0.85, 1.35, wz);
        beam.rotation.order = "YXZ";
        beam.rotation.y = Math.PI / 2;
        beam.rotation.x = 0.62;
        root.add(beam);
        sunBeams.push(beam);
      }
    });

    // Exterior 3D Courtyard Lawn, Campus Trees, Opposite Wing Roof, & Sky Vista outside East Windows!
    const extGround = P.addBox(
      root, 14, 0.24, 28,
      new THREE.MeshStandardMaterial({ color: isOvercast ? 0x628062 : 0x7ea86e, roughness: 0.9 }),
      9.6, -1.6, 0, false, true
    );
    [[-6.5, 6.2], [-1.2, 7.4], [4.2, 6.5], [8.5, 7.8]].forEach(([tz, tx]) => {
      const tr = P.createStylizedTree(1.25);
      tr.position.set(tx, -1.5, tz);
      root.add(tr);
    });
    const skyVista = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 15),
      new THREE.MeshBasicMaterial({ map: T.getSkyVista(isOvercast ? "overcast" : "morning"), fog: false })
    );
    skyVista.position.set(15.5, 3.2, 0);
    skyVista.rotation.y = -Math.PI / 2;
    root.add(skyVista);

    // Floating dust motes
    const pCount = quality === "low" ? 70 : 190;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.8;
      pos[i * 3 + 1] = 0.25 + Math.random() * 2.9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 19.0;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: T.getSoftParticleSprite(),
        color: isOvercast ? 0xc2d6ec : 0xffeac0,
        size: 0.055,
        transparent: true,
        opacity: isOvercast ? 0.36 : 0.56,
        depthWrite: false
      })
    );
    root.add(dust);

    const R = (cx, cz, w, d) => ({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });
    const zone = {
      bounds: { minX: -2.18, maxX: 2.22, minZ: -10.0, maxZ: 10.0 },
      cam: { minX: -2.48, maxX: 2.48, minZ: -10.45, maxZ: 10.45, maxY: 3.24 },
      colliders: [
        R(-2.32, -2.82, 0.58, 4.55), // Locker bank
        R(-2.18, 6.90, 0.62, 1.34),  // Console table
        R(-2.15, -5.65, 0.48, 0.48), // Plant A
        R(2.05, -6.20, 0.56, 1.68),  // Bench
        R(2.12, 8.60, 0.48, 0.48)    // Plant B
      ]
    };

    return {
      root,
      zone,
      cutawayMeshes,
      windStrength: isOvercast ? 0.22 : 0.16,
      lighting: isOvercast
        ? {
            bg: 0x3b485c,
            fog: 0x45546a,
            fogDensity: 0.012,
            hemiSky: 0xb6c8de,
            hemiGround: 0x4b4a52,
            hemiIntensity: 0.82,
            dirColor: 0xc9d9ec,
            dirIntensity: 0.74,
            dirPos: [12, 10, 2],
            rimColor: 0x9bbce0,
            rimIntensity: 0.52,
            rimPos: [-6, 5, -4]
          }
        : {
            bg: 0xc8dcf0,
            fog: 0xd9e6f2,
            fogDensity: 0.009,
            hemiSky: 0xfff6e6,
            hemiGround: 0x7c6856,
            hemiIntensity: 0.94,
            dirColor: 0xffe2b4,
            dirIntensity: 1.16,
            dirPos: [14, 12, 3],
            rimColor: 0xffe8c2,
            rimIntensity: 0.58,
            rimPos: [-6, 6, -4]
          },
      update(dt, elapsed) {
        dust.rotation.y = elapsed * 0.015;
        dust.position.y = Math.sin(elapsed * 0.7) * 0.05;
        sunBeams.forEach((b, idx) => {
          b.material.opacity = 0.095 + Math.sin(elapsed * 0.9 + idx) * 0.02;
        });
      }
    };
  }
};
