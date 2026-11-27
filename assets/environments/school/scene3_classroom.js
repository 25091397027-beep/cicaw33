/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   SCENE 3 ENVIRONMENT: RUANG KELAS 11-A DEKAT JENDELA ("A DIFFERENT DISTANCE")
   (assets/environments/school/scene3_classroom.js)
   - Ruang kelas 11-A lengkap (16 set meja-kursi siswa berangkai, papan tulis
     sastra & piket, podium guru, rak buku, loker belakang, tirai kain berayun
     lembut, berkas sinar matahari, & debu keemasan melayang)
============================================================================ */
"use strict";

window.Ch4Scene3Classroom = {
  build(quality = "high") {
    const P = window.Ch4Props;
    const T = window.Ch4Textures;
    const root = new THREE.Group();
    root.name = "Env_Scene3_Classroom11A";
    const cutawayMeshes = [];
    const curtains = [];

    const woodFloor = T.getHardwoodFloor("#b69068", "#92704d", 4, 4);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodFloor.map,
      bumpMap: woodFloor.bumpMap,
      bumpScale: 0.004,
      roughness: 0.46
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: T.getPlasterWall("#f4eee2", "#dad0bf", 4, 1),
      roughness: 0.84
    });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.88 });
    const woodTrim = new THREE.MeshStandardMaterial({ color: 0x734f36, roughness: 0.56 });
    const curtainMat = new THREE.MeshStandardMaterial({
      color: 0xfffaf0,
      roughness: 0.85,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });

    // Classroom Dimensions: Width = 9.6m (x: -4.8..+4.8), Depth = 8.8m (z: -4.4..+4.4)
    // North Window Wall is at z = -4.4; West Front Chalkboard Wall is at x = -4.8!
    P.addBox(root, 9.8, 0.24, 9.0, floorMat, 0, -0.12, 0, false, true);
    const ceil = P.addBox(root, 9.8, 0.22, 9.0, ceilingMat, 0, 3.55, 0, false, true);
    cutawayMeshes.push(ceil);

    // Ceiling fluorescent lights
    [[-1.8, -1.6], [1.8, -1.6], [-1.8, 1.8], [1.8, 1.8]].forEach(([lx, lz]) => {
      const f = P.addBox(
        root, 1.45, 0.045, 0.34,
        new THREE.MeshStandardMaterial({ color: 0xfff8e8, emissive: 0xffefc6, emissiveIntensity: 0.65 }),
        lx, 3.42, lz, false, false
      );
      cutawayMeshes.push(f);
    });

    // West Front Wall (x = -4.80) — Chalkboard + Teacher Podium & Desk
    P.addBox(root, 0.26, 3.45, 9.0, wallMat, -4.80, 1.725, 0);
    P.addBox(root, 0.06, 0.12, 8.6, woodTrim, -4.65, 0.06, 0, false);

    P.addBox(root, 0.08, 1.46, 4.26, woodTrim, -4.63, 1.78, 0);
    const chalk = new THREE.Mesh(
      new THREE.PlaneGeometry(4.10, 1.32),
      new THREE.MeshStandardMaterial({ map: T.getChalkboardTexture(), roughness: 0.68 })
    );
    chalk.rotation.y = Math.PI / 2;
    chalk.position.set(-4.58, 1.78, 0);
    root.add(chalk);
    P.addBox(root, 0.14, 0.05, 4.20, woodTrim, -4.56, 1.04, 0, false); // Chalk tray

    // Teacher's Podium & Lectern
    P.addBox(root, 1.25, 0.12, 2.4, new THREE.MeshStandardMaterial({ color: 0xa67c52, roughness: 0.6 }), -3.85, 0.06, 0);
    P.addBox(root, 0.58, 0.98, 0.76, woodTrim, -3.72, 0.61, -0.35);

    // East Rear Wall (x = +4.80) — Rear Lockers, Bookcase & Bulletin Board
    const eastWall = P.addBox(root, 0.26, 3.45, 9.0, wallMat, 4.80, 1.725, 0);
    cutawayMeshes.push(eastWall);
    const rearLockers = P.createLockerBank(5);
    rearLockers.rotation.y = -Math.PI / 2;
    rearLockers.position.set(4.42, 0, -2.2);
    root.add(rearLockers);

    // Classroom Wooden Bookcase filled with colorful books (East-South corner)
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(4.38, 0, 2.2);
    P.addBox(shelfGroup, 0.44, 1.84, 1.85, woodTrim, 0, 0.92, 0);
    const bookColors = [0xd96c6c, 0x5b82ad, 0xe2be6b, 0x6ea37b, 0x9b7cb8];
    for (let s = 0; s < 3; s++) {
      for (let b = 0; b < 7; b++) {
        P.addBox(
          shelfGroup, 0.24, 0.28, 0.08,
          new THREE.MeshStandardMaterial({ color: bookColors[(s + b) % 5], roughness: 0.7 }),
          -0.08, 0.48 + s * 0.48, -0.68 + b * 0.21, false
        );
      }
    }
    root.add(shelfGroup);

    // South Corridor Wall (z = +4.40) — Classroom 11-A Doorway + Wall Clock
    const southWall = P.addBox(root, 9.8, 3.45, 0.26, wallMat, 0, 1.725, 4.40);
    const classDoor = P.createArchitecturalDoor({ doorColor: 0x76523b, frameColor: 0x4a3325, hasTransomGlass: true });
    classDoor.position.set(-3.1, 0, 4.24);
    classDoor.rotation.y = Math.PI;
    root.add(classDoor);
    cutawayMeshes.push(southWall, classDoor);

    // North Sunlit Window Wall (z = -4.40) — 3 Wide Framed Windows + Swaying Sheer Curtains!
    P.addBox(root, 9.8, 0.92, 0.26, wallMat, 0, 0.46, -4.40);
    P.addBox(root, 9.8, 0.72, 0.26, wallMat, 0, 3.08, -4.40);
    P.addBox(root, 9.6, 0.06, 0.34, woodTrim, 0, 0.94, -4.38);
    [-4.35, -1.55, 1.55, 4.35].forEach((px) => {
      P.addBox(root, 0.85, 1.82, 0.28, wallMat, px, 1.83, -4.40);
    });

    const sunBeams = [];
    [-2.95, 0.0, 2.95].forEach((wx, idx) => {
      const win = P.createFramedWindow({
        width: 2.02,
        height: 1.76,
        frameColor: 0x734f36,
        glassColor: 0xfff7e2,
        glassOpacity: 0.17,
        emissiveIntensity: 0.34
      });
      win.position.set(wx, 1.83, -4.35);
      root.add(win);

      // Curtain rod + 2 swaying sheer cream curtains per window
      P.addCyl(root, 0.014, 0.014, 2.26, 8, woodTrim, wx, 2.76, -4.18, false).rotation.z = Math.PI / 2;
      [-0.98, 0.98].forEach((dx, ci) => {
        const cur = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.02, 0.06), curtainMat);
        cur.position.set(wx + dx, 1.74, -4.18);
        cur.castShadow = false;
        cur.userData.baseX = wx + dx;
        cur.userData.phase = idx * 1.4 + ci * 2.1;
        root.add(cur);
        curtains.push(cur);
      });

      if (quality !== "low") {
        const beam = new THREE.Mesh(
          new THREE.PlaneGeometry(2.05, 4.6),
          new THREE.MeshBasicMaterial({
            color: 0xffe7b8,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        beam.position.set(wx, 1.32, -2.55);
        beam.rotation.x = -0.66;
        root.add(beam);
        sunBeams.push(beam);
      }
    });

    // Exterior Campus Trees & Morning Sky Vista outside North Window!
    [[-3.2, -7.8], [0.4, -8.4], [3.6, -7.6]].forEach(([tx, tz]) => {
      const tr = P.createStylizedTree(1.25);
      tr.position.set(tx, -1.4, tz);
      root.add(tr);
    });
    const skyVista = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 11),
      new THREE.MeshBasicMaterial({ map: T.getSkyVista("morning"), fog: false })
    );
    skyVista.position.set(0, 2.8, -11.5);
    root.add(skyVista);

    // 12 Student Desks & Connected Chairs (3 rows x 4 columns facing West Chalkboard!)
    // Wait: Chalkboard is at West (x = -4.8)! In createStudentDeskSet, chair is at local +Z (+0.58), so local -Z is front of desk!
    // Rotating desk by Math.PI / 2 makes local -Z point toward -X (West Chalkboard), and chair sits on +X side!
    const deskColliders = [];
    const R = (cx, cz, w, d) => ({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });

    const rowZ = [-2.10, -0.10, 1.90]; // Leaves generous sunlit window walkway along z ∈ [-4.02, -2.75] & wide front aisle at x ∈ [-3.15, -2.35]!
    const colX = [-1.95, -0.25, 1.45, 3.05];

    rowZ.forEach((rz, rIdx) => {
      colX.forEach((cx, cIdx) => {
        const isHeroWindowPair = rIdx === 0 && (cIdx === 1 || cIdx === 2);
        const dSet = P.createStudentDeskSet(true, rIdx * 4 + cIdx);
        dSet.position.set(cx, 0, rz);
        dSet.rotation.y = Math.PI / 2;
        root.add(dSet);
        deskColliders.push(R(cx + 0.22, rz, 0.84, 0.66));

        // Special story props on Rizka & Kael's window desks (col 1 & col 2, row 0)!
        if (isHeroWindowPair) {
          const can = P.createDrinkCan(cIdx === 1 ? 0xf4c57a : 0x9bbce0);
          can.position.set(cx - 0.08, 0.762, rz - 0.16);
          root.add(can);
          if (cIdx === 1) {
            const rBag = P.createSchoolBag(0x4a332a);
            rBag.position.set(cx + 0.15, 0, rz - 0.44);
            rBag.rotation.y = 0.25;
            root.add(rBag);
          }
        }
      });
    });

    // Potted plant on window sill corner
    const winPlant = P.createPottedPlant(0.88);
    winPlant.position.set(-4.15, 0, -3.75);
    root.add(winPlant);

    // Warm Floating Sunlit Dust Motes
    const pCount = quality === "low" ? 90 : 250;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = -3.8 + Math.random() * 7.8;
      pos[i * 3 + 1] = 0.35 + Math.random() * 2.85;
      pos[i * 3 + 2] = -4.1 + Math.random() * 5.2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: T.getSoftParticleSprite(),
        color: 0xffebc0,
        size: 0.062,
        transparent: true,
        opacity: 0.64,
        depthWrite: false
      })
    );
    root.add(dust);

    const zone = {
      bounds: { minX: -4.22, maxX: 4.18, minZ: -4.02, maxZ: 3.95 },
      cam: { minX: -4.55, maxX: 4.55, minZ: -4.22, maxZ: 4.22, maxY: 3.24 },
      colliders: deskColliders.concat([
        R(-3.85, -0.35, 1.25, 1.0), // Teacher podium/desk
        R(4.42, -1.10, 0.58, 2.9),  // Rear lockers
        R(4.38, 2.20, 0.52, 1.90)   // Bookcase
      ])
    };

    return {
      root,
      zone,
      cutawayMeshes,
      windStrength: 0.28,
      lighting: {
        bg: 0xd2e2f0,
        fog: 0xdfe9f2,
        fogDensity: 0.008,
        hemiSky: 0xfff8ea,
        hemiGround: 0x876f58,
        hemiIntensity: 0.96,
        dirColor: 0xffe0ac,
        dirIntensity: 1.22,
        dirPos: [2, 11, -14],
        rimColor: 0xffdfa8,
        rimIntensity: 0.65,
        rimPos: [-4, 5, -8]
      },
      update(dt, elapsed) {
        curtains.forEach((c) => {
          const w = Math.sin(elapsed * 1.25 + c.userData.phase);
          c.position.z = -4.16 + Math.max(0, w) * 0.055;
          c.rotation.x = Math.max(0, w) * 0.065;
          c.rotation.z = w * 0.025;
        });
        const attr = dust.geometry.attributes.position;
        for (let i = 0; i < attr.count; i++) {
          let y = attr.getY(i) + dt * 0.028;
          if (y > 3.2) y = 0.35;
          attr.setY(i, y);
          attr.setX(i, attr.getX(i) + Math.sin(elapsed * 0.4 + i) * dt * 0.018);
        }
        attr.needsUpdate = true;
      }
    };
  }
};
