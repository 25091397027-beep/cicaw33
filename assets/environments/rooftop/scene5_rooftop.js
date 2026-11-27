/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   SCENE 5 ENVIRONMENT: ROOFTOP SEKOLAH SAAT GOLDEN HOUR
   ("THE FEELING I CANNOT HIDE" — PUNCAK VISUAL & EMOSIONAL CHAPTER 4)
   (assets/environments/rooftop/scene5_rooftop.js)
   - Dek atap beton 2K + parapet 4 sisi + pagar pengaman besi tempa sekolah
   - Bangunan akses tangga atap (bulkhead) tertutup penuh + pintu baja + lampu
   - Unit AC condenser dengan kipas berputar, menara tangki air baja, bangku
     kayu atap, pot tanaman, minuman hangat di tepi pagar, & panorama kota
     360° Golden Hour Sunset + sinar keemasan sinematik!
============================================================================ */
"use strict";

window.Ch4Scene5Rooftop = {
  build(quality = "high") {
    const P = window.Ch4Props;
    const T = window.Ch4Textures;
    const root = new THREE.Group();
    root.name = "Env_Scene5_GoldenHourRooftop";
    const fanBlades = [];

    const deckMat = new THREE.MeshStandardMaterial({
      map: T.getRooftopConcrete("#666e80", 6, 5),
      roughness: 0.76
    });
    const parapetMat = new THREE.MeshStandardMaterial({
      map: T.getRooftopConcrete("#7c8496", 8, 1),
      roughness: 0.80
    });
    const bulkheadWallMat = new THREE.MeshStandardMaterial({
      map: T.getPlasterWall("#e6dacb", "#cbbba8", 2, 1),
      roughness: 0.82
    });
    const ironFenceMat = new THREE.MeshStandardMaterial({ color: 0x222b3a, roughness: 0.40, metalness: 0.68 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.72 });

    // Main School Building Upper Mass beneath the Rooftop Deck (so looking over the edge shows a real building, NEVER floating in void!)
    P.addBox(root, 16.4, 8.0, 12.4, bulkheadWallMat, 0, -4.1, 0, false, true);
    P.addBox(root, 16.0, 0.36, 12.0, deckMat, 0, -0.18, 0, false, true);

    // 4-Sided Concrete Parapet Walls (h = 0.58m) + Coping Cap + Tall School Safety Railing (total h = 1.95m on sides/back, 1.28m scenic overlook rail at North z = -5.75!)
    P.addBox(root, 16.2, 0.58, 0.34, parapetMat, 0, 0.29, -5.85);
    P.addBox(root, 16.2, 0.58, 0.34, parapetMat, 0, 0.29,  5.85);
    P.addBox(root, 0.34, 0.58, 12.0, parapetMat, -7.85, 0.29, 0);
    P.addBox(root, 0.34, 0.58, 12.0, parapetMat,  7.85, 0.29, 0);

    // Coping stone ledge along North Scenic Overlook (wide enough to rest hands & warm canned drinks!)
    P.addBox(root, 16.3, 0.07, 0.44, new THREE.MeshStandardMaterial({ color: 0x8d95a5, roughness: 0.65 }), 0, 0.61, -5.85);

    // North Scenic Overlook Handrail & Vertical Balusters (h = 1.24m — frames Rizka & Kael's faces clearly against sunset!)
    P.addBox(root, 15.8, 0.055, 0.055, ironFenceMat, 0, 1.24, -5.82);
    P.addBox(root, 15.8, 0.035, 0.035, ironFenceMat, 0, 0.92, -5.82);
    for (let x = -7.6; x <= 7.6; x += 0.95) {
      P.addCyl(root, 0.022, 0.022, 0.66, 8, ironFenceMat, x, 0.93, -5.82);
    }

    // Tall Safety Fence on East, West, & South perimeters (h = 2.05m)
    [
      [15.8, 0, 5.82, false],
      [11.6, -7.82, 0, true],
      [11.6,  7.82, 0, true]
    ].forEach(([len, fx, fz, rotZ]) => {
      const fg = new THREE.Group();
      fg.position.set(fx, 0, fz);
      if (rotZ) fg.rotation.y = Math.PI / 2;
      P.addBox(fg, len, 0.05, 0.05, ironFenceMat, 0, 2.05, 0);
      P.addBox(fg, len, 0.04, 0.04, ironFenceMat, 0, 1.32, 0);
      for (let p = -len / 2; p <= len / 2; p += 1.45) {
        P.addCyl(fg, 0.024, 0.024, 1.48, 8, ironFenceMat, p, 1.32, 0);
      }
      root.add(fg);
    });

    // Enclosed Stairwell Bulkhead Structure (South-West Quadrant: x = -4.5, z = 2.6)
    const bh = new THREE.Group();
    bh.position.set(-4.5, 0, 2.6);
    P.addBox(bh, 3.6, 2.85, 3.2, bulkheadWallMat, 0, 1.425, 0);
    P.addBox(bh, 3.95, 0.22, 3.55, parapetMat, 0, 2.95, 0); // Overhanging concrete roof slab
    const roofDoor = P.createArchitecturalDoor({ doorColor: 0x3b4d63, frameColor: 0x222c3a, unitNumber: "RF", residentTag: "ROOFTOP" });
    roofDoor.position.set(1.82, 0, 0);
    roofDoor.rotation.y = Math.PI / 2;
    bh.add(roofDoor);
    const sconce = P.createWarmWallSconce();
    sconce.position.set(1.82, 2.38, 0.85);
    bh.add(sconce);
    const doorLamp = new THREE.PointLight(0xffbe73, 0.85, 7.5);
    doorLamp.position.set(2.35, 2.38, 0.85);
    bh.add(doorLamp);
    root.add(bh);

    // 2 Detailed HVAC / AC Condenser Units with Spinning Fans behind Bulkhead!
    [-0.75, 0.55].forEach((az) => {
      const ac = new THREE.Group();
      ac.position.set(-6.85, 0, 2.6 + az);
      P.addBox(ac, 0.56, 0.86, 0.94, new THREE.MeshStandardMaterial({ color: 0xd8d5ce, roughness: 0.55 }), 0, 0.46, 0);
      P.addCyl(ac, 0.26, 0.26, 0.04, 18, ironFenceMat, 0.27, 0.50, 0).rotation.z = Math.PI / 2;
      const fan = new THREE.Group();
      fan.position.set(0.28, 0.50, 0);
      for (let b = 0; b < 3; b++) {
        const bl = P.addBox(fan, 0.015, 0.42, 0.08, ironFenceMat, 0, 0, 0, false);
        bl.rotation.x = (b / 3) * Math.PI;
      }
      ac.add(fan);
      fanBlades.push(fan);
      root.add(ac);
    });

    // Elevated Rooftop Water Tank on Steel Truss Frame (South-East Corner: x = 5.4, z = 3.4)
    const wt = new THREE.Group();
    wt.position.set(5.4, 0, 3.4);
    [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(([lx, lz]) => {
      P.addCyl(wt, 0.045, 0.055, 1.85, 8, ironFenceMat, lx, 0.925, lz);
    });
    P.addBox(wt, 1.65, 0.08, 1.65, ironFenceMat, 0, 1.85, 0);
    P.addCyl(wt, 0.86, 0.86, 1.75, 22, steelMat, 0, 2.76, 0);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.86, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), steelMat);
    dome.position.y = 3.63;
    wt.add(dome);
    root.add(wt);

    // Rooftop Wooden Benches, Planter Boxes, & Two Warm Canned Drinks on Scenic Overlook Ledge!
    const bench1 = P.createBench(1.72);
    bench1.position.set(3.4, 0, -2.2);
    bench1.rotation.y = -0.35;
    const bench2 = P.createBench(1.72);
    bench2.position.set(-3.4, 0, -1.9);
    bench2.rotation.y = 0.42;
    root.add(bench1, bench2);

    const plant1 = P.createPottedPlant(1.1);
    plant1.position.set(-2.35, 0, 2.1);
    const plant2 = P.createPottedPlant(1.0);
    plant2.position.set(5.2, 0, -4.8);
    root.add(plant1, plant2);

    const canRizka = P.createDrinkCan(0xf4c57a);
    canRizka.position.set(-0.24, 0.645, -5.78);
    const canKael = P.createDrinkCan(0x9bbce0);
    canKael.position.set(0.32, 0.645, -5.76);
    root.add(canRizka, canKael);

    // 3D Surrounding Sunset Neighborhood Rooftops below the School Rooftop (Preserves wide open Golden Hour horizon!)
    const houseColors = [0x594356, 0x4d3c52, 0x664b59, 0x43384f];
    const roofColors = [0x38293d, 0x453142, 0x2f2538, 0x4f3846];
    const winWarm = new THREE.MeshBasicMaterial({ color: 0xffcf86 });
    [
      [-16, -11.5, -17, 7.5, 9.2, 7.0],
      [-7,  -11.5, -20, 8.2, 8.4, 6.8],
      [ 4,  -11.5, -22, 9.0, 9.6, 7.5],
      [15,  -11.5, -18, 7.8, 9.0, 7.2],
      [-19, -11.5,  -4, 6.5, 8.8, 8.0],
      [19,  -11.5,  -3, 7.0, 9.2, 8.2]
    ].forEach(([bx, by, bz, bw, bh2, bd], idx) => {
      P.addBox(
        root, bw, bh2, bd,
        new THREE.MeshStandardMaterial({ color: houseColors[idx % 4], roughness: 0.85 }),
        bx, by + bh2 / 2, bz, false, false
      );
      P.addBox(
        root, bw + 0.5, 0.35, bd + 0.5,
        new THREE.MeshStandardMaterial({ color: roofColors[idx % 4], roughness: 0.8 }),
        bx, by + bh2 + 0.17, bz, false, false
      );
      for (let c = -1; c <= 1; c++) {
        if ((idx + c) % 2 === 0) {
          P.addBox(root, 0.68, 0.78, 0.12, winWarm, bx + c * 2.1, by + bh2 - 1.35, bz + bd / 2 + 0.04, false, false);
        }
      }
    });

    // 360-Degree Golden Hour Sunset Sky Cylinder Dome + Glowing Sunset Disc + Warm Volumetric Sun Rays!
    const skyGeo = new THREE.CylinderGeometry(44, 44, 34, 40, 1, true);
    skyGeo.scale(-1, 1, 1); // inward-facing panorama
    const skyDome = new THREE.Mesh(
      skyGeo,
      new THREE.MeshBasicMaterial({ map: T.getSkyVista("sunset"), fog: false })
    );
    skyDome.position.y = 6.5;
    skyDome.rotation.y = Math.PI * 0.65;
    root.add(skyDome);

    const sunDisc = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 36),
      new THREE.MeshBasicMaterial({ color: 0xffe4ad, transparent: true, opacity: 0.72, fog: false })
    );
    sunDisc.position.set(-6.5, 4.8, -36);
    const sunHalo = new THREE.Mesh(
      new THREE.CircleGeometry(10.5, 36),
      new THREE.MeshBasicMaterial({ color: 0xff9e5e, transparent: true, opacity: 0.26, fog: false })
    );
    sunHalo.position.set(-6.5, 4.8, -36.2);
    root.add(sunDisc, sunHalo);

    // Floating Golden Sunset Motes / Warm Breeze Petals
    const pCount = quality === "low" ? 100 : 280;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15.0;
      pos[i * 3 + 1] = 0.3 + Math.random() * 3.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 11.0;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: T.getSoftParticleSprite(),
        color: 0xffd28a,
        size: 0.072,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      })
    );
    root.add(dust);

    const R = (cx, cz, w, d) => ({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 });
    const zone = {
      bounds: { minX: -7.15, maxX: 7.15, minZ: -5.25, maxZ: 5.15 },
      cam: { minX: -7.55, maxX: 7.55, minZ: -5.55, maxZ: 5.55, maxY: 5.80 },
      colliders: [
        R(-4.50, 2.60, 3.85, 3.45), // Stairwell Bulkhead
        R(-6.85, 2.50, 0.75, 2.35), // AC units
        R(5.40, 3.40, 1.85, 1.85),  // Water tank tower
        R(3.40, -2.20, 1.82, 0.68), // Bench 1
        R(-3.40, -1.90, 1.82, 0.68) // Bench 2
      ]
    };

    return {
      root,
      zone,
      cutawayMeshes: [],
      windStrength: 0.82, // Strong gentle Golden Hour breeze moving hair & pleated skirt!
      lighting: {
        bg: 0x432b44,
        fog: 0x5c3648,
        fogDensity: 0.0085,
        hemiSky: 0xffd2a6,
        hemiGround: 0x593c48,
        hemiIntensity: 0.92,
        dirColor: 0xffa666,
        dirIntensity: 1.38,
        dirPos: [-10, 8, -16],
        rimColor: 0xffd98e,
        rimIntensity: 0.95,
        rimPos: [-5, 4, -10]
      },
      update(dt, elapsed) {
        fanBlades.forEach((f) => { f.rotation.x += dt * 7.5; });
        const attr = dust.geometry.attributes.position;
        for (let i = 0; i < attr.count; i++) {
          let x = attr.getX(i) + dt * 0.36;
          let y = attr.getY(i) + Math.sin(elapsed * 1.2 + i) * dt * 0.08;
          if (x > 7.5) x = -7.5;
          attr.setX(i, x);
          attr.setY(i, y);
        }
        attr.needsUpdate = true;
      }
    };
  }
};
