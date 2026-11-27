/* ============================================================================
   CICAWW33 — CHAPTER 4: A LITTLE CLOSER
   ANIME SHADER KIT v3, ASSET MANAGER & RIG ANIMATOR
   (assets/animations/ch4_shaders_anim.js)
   - Konsisten penuh dengan identitas visual Chapter 1–3 (Three.js r128)
   - Skin Subsurface Scatter (SSS) + Fresnel Rim, Dual-Band Hair Angel-Ring
     + Bump Helai Rambut, Stylized Cloth Cel-Lift + Micro-Weave Bump,
     dan Vertex-Normal Micro-Ink Outline.
   - Mendukung pemuatan opsional GLB eksternal bila dideklarasikan nyata
     tanpa menghasilkan request palsu / 404.
============================================================================ */
"use strict";

window.Ch4AnimeShader = (function () {
  function createSkinMaterial(options = {}) {
    const m = new THREE.MeshStandardMaterial({
      color: options.color !== undefined ? options.color : 0xffffff,
      map: options.map || null,
      roughness: 0.66,
      metalness: 0.0
    });
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <lights_physical_fragment>",
        `#include <lights_physical_fragment>
         material.diffuseColor *= 1.03;`
      );
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <tonemapping_fragment>",
        `#ifndef FLAT_SHADED
           vec3 nV = normalize(vNormal);
           vec3 vDir = normalize(vViewPosition);
           float fres = pow(1.0 - clamp(dot(nV, vDir), 0.0, 1.0), 3.5);
           float lum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
           vec3 sssTint = vec3(1.0, 0.78, 0.72);
           float shadowBand = smoothstep(0.58, 0.16, lum);
           gl_FragColor.rgb = mix(gl_FragColor.rgb, max(gl_FragColor.rgb, material.diffuseColor * vec3(0.87, 0.75, 0.74)), shadowBand * 0.54);
           gl_FragColor.rgb += sssTint * shadowBand * (1.0 - shadowBand) * 0.09;
           gl_FragColor.rgb += vec3(1.0, 0.90, 0.80) * fres * 0.15;
         #endif
         #include <tonemapping_fragment>`
      );
    };
    m.customProgramCacheKey = () => "ch4-anime-skin-v3";
    return m;
  }

  function createHairMaterial(options = {}) {
    const haloCol = new THREE.Color(options.haloColor !== undefined ? options.haloColor : 0xd8aa92);
    const strandBump = window.Ch4Textures ? window.Ch4Textures.getHairStrandBump() : null;
    const m = new THREE.MeshStandardMaterial({
      color: options.color !== undefined ? options.color : 0x462e29,
      map: options.map || null,
      bumpMap: options.bumpMap !== undefined ? options.bumpMap : strandBump,
      bumpScale: options.bumpScale !== undefined ? options.bumpScale : 0.0007,
      roughness: options.roughness !== undefined ? options.roughness : 0.44,
      metalness: 0.03,
      side: options.side || THREE.FrontSide
    });
    m.userData.haloColor = haloCol;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uHaloColor = { value: haloCol };
      sh.fragmentShader = "uniform vec3 uHaloColor;\n" + sh.fragmentShader;
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <tonemapping_fragment>",
        `#ifndef FLAT_SHADED
           vec3 nH = normalize(vNormal);
           vec3 vD = normalize(vViewPosition);
           float hBand1 = exp(-pow((nH.y - 0.26) * 5.4, 2.0));
           float hBand2 = exp(-pow((nH.y - 0.46) * 9.5, 2.0));
           float viewFace = pow(clamp(dot(nH, vD), 0.0, 1.0), 1.4);
           float angelRing = (hBand1 * 0.56 + hBand2 * 0.44) * viewFace;
           float rimH = pow(1.0 - clamp(dot(nH, vD), 0.0, 1.0), 3.1);
           gl_FragColor.rgb += uHaloColor * angelRing * 0.22;
           gl_FragColor.rgb += (uHaloColor * 0.62 + vec3(0.30, 0.26, 0.22)) * rimH * 0.14;
         #endif
         #include <tonemapping_fragment>`
      );
    };
    m.customProgramCacheKey = () => "ch4-anime-hair-v4";
    return m;
  }

  function createClothMaterial(options = {}) {
    const weaveBump = options.noWeave ? null : (window.Ch4Textures ? window.Ch4Textures.getClothWeaveBump() : null);
    const m = new THREE.MeshStandardMaterial({
      color: options.color !== undefined ? options.color : 0xffffff,
      map: options.map || null,
      bumpMap: options.bumpMap !== undefined ? options.bumpMap : weaveBump,
      bumpScale: options.bumpScale !== undefined ? options.bumpScale : 0.0012,
      roughness: options.roughness !== undefined ? options.roughness : 0.76,
      metalness: options.metalness !== undefined ? options.metalness : 0.02,
      side: options.side || THREE.FrontSide
    });
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <tonemapping_fragment>",
        `#ifndef FLAT_SHADED
           vec3 nC = normalize(vNormal);
           vec3 vC = normalize(vViewPosition);
           float rimC = pow(1.0 - clamp(dot(nC, vC), 0.0, 1.0), 3.5);
           float lumC = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
           float coolShadow = smoothstep(0.36, 0.06, lumC);
           gl_FragColor.rgb = mix(gl_FragColor.rgb, max(gl_FragColor.rgb, material.diffuseColor * vec3(0.54, 0.57, 0.66)), coolShadow * 0.28);
           gl_FragColor.rgb += vec3(1.0, 0.90, 0.78) * rimC * 0.08;
         #endif
         #include <tonemapping_fragment>`
      );
    };
    m.customProgramCacheKey = () => "ch4-anime-cloth-v4";
    return m;
  }

  function createOutlineMaterial(outlineColorHex = 0x24191b, width = 0.0020) {
    const mat = new THREE.MeshBasicMaterial({
      color: outlineColorHex,
      side: THREE.BackSide
    });
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uOutlineWidth = { value: width };
      sh.vertexShader = "uniform float uOutlineWidth;\n" + sh.vertexShader;
      sh.vertexShader = sh.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         transformed += normalize(normal) * uOutlineWidth;`
      );
    };
    mat.customProgramCacheKey = () => "ch4-outline-v3-" + width.toFixed(5);
    return mat;
  }

  function applyAnimeCelPass(rootGroup, outlineColorHex = 0x24191b, width = 0.0020) {
    const outlineMat = createOutlineMaterial(outlineColorHex, width);
    const meshes = [];
    rootGroup.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isOutline && !obj.userData.noOutline) {
        meshes.push(obj);
      }
    });
    meshes.forEach((mesh) => {
      if (!mesh.geometry) return;
      const gt = mesh.geometry.type || "";
      if (gt === "PlaneGeometry" || gt === "CircleGeometry" || gt === "RingGeometry") return;
      if (mesh.material && mesh.material.transparent) return;
      const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
      outlineMesh.userData.isOutline = true;
      outlineMesh.castShadow = false;
      outlineMesh.receiveShadow = false;
      mesh.add(outlineMesh);
    });
  }

  return {
    createSkinMaterial,
    createHairMaterial,
    createClothMaterial,
    createOutlineMaterial,
    applyAnimeCelPass
  };
})();

/* ============================================================================
   CHAPTER 4 ASSET MANAGER (Jujur & Bebas Error 404)
   - Memeriksa registry GLB eksternal hanya jika user menaruh file .glb nyata
     dan mendaftarkannya pada window.CH4_EXTERNAL_GLB_FILES.
   - Secara default langsung memakai Rig Prosedural High-Detail + Facial Morph
     Targets yang terbundel penuh di dalam assets/characters/.
============================================================================ */
window.Ch4AssetManager = {
  status: {
    rizka: "HIGH_DETAIL_PROCEDURAL_RIG + 8_MOUTH_MORPH_TARGETS",
    kael: "HIGH_DETAIL_PROCEDURAL_RIG + 7_MOUTH_MORPH_TARGETS",
    nadine: "HIGH_DETAIL_PROCEDURAL_RIG + 5_MOUTH_MORPH_TARGETS",
    environments: "MODULAR_ARCHITECTURAL_PBR_SCENES (5/5)",
    textures: "ADAPTIVE_2K_CANVAS_PBR_CACHED",
    audio: "PURE_WEBAUDIO_PROCEDURAL_SYNTH"
  },
  externalGLBRegistry: window.CH4_EXTERNAL_GLB_FILES || {},

  async tryLoadGLB(key) {
    const path = this.externalGLBRegistry[key];
    if (!path || location.protocol === "file:") return null;
    try {
      if (!THREE.GLTFLoader) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const gltf = await new Promise((res, rej) => new THREE.GLTFLoader().load(path, res, undefined, rej));
      this.status[key] = "EXTERNAL_GLB_LOADED";
      return gltf;
    } catch (_) {
      return null;
    }
  }
};

/* ============================================================================
   UNIFIED CHARACTER LOCOMOTION, POSE, WIND & COMPANION ANIMATOR
============================================================================ */
window.Ch4Animator = {
  dampK(rate, dt) {
    return 1 - Math.exp(-rate * dt);
  },

  dampAngle(cur, target, rate, dt) {
    let diff = Math.atan2(Math.sin(target - cur), Math.cos(target - cur));
    return cur + diff * this.dampK(rate, dt);
  },

  animateCharacter(rig, dt, opts = {}) {
    if (!rig) return;
    const speed = opts.speed || 0;
    const walkSpeed = opts.walkSpeed || 3.1;
    const isRunning = !!opts.isRunning;
    const windStrength = opts.windStrength !== undefined ? opts.windStrength : 0.25;
    const lookTarget = opts.lookTarget || null;

    if (rig.studioUpdate) rig.studioUpdate(dt, windStrength);

    const moving = speed > 0.10 ? Math.min(1, speed / walkSpeed) : 0;
    rig._moveBlend = (rig._moveBlend || 0) + (moving - (rig._moveBlend || 0)) * this.dampK(10, dt);
    rig._runBlend = (rig._runBlend || 0) + ((isRunning ? 1 : 0) - (rig._runBlend || 0)) * this.dampK(7, dt);
    const mb = rig._moveBlend;
    const rb = rig._runBlend;

    // Jika sedang dalam pose cerita khusus dan diam, pertahankan pose tubuh sambil tetap bernapas halus
    if (rig.poseOverride && mb < 0.08) {
      const p = rig.poseOverride;
      const kp = this.dampK(7, dt);
      if (rig.spinePivot) {
        rig.spinePivot.rotation.x += ((p.spineX || 0) - rig.spinePivot.rotation.x) * kp;
        rig.spinePivot.rotation.z += ((p.spineZ || 0) - rig.spinePivot.rotation.z) * kp;
      }
      if (rig.headGroup) {
        rig.headGroup.rotation.x += ((p.headX || 0) - rig.headGroup.rotation.x) * kp;
        rig.headGroup.rotation.y += ((p.headY || 0) - rig.headGroup.rotation.y) * kp;
        rig.headGroup.rotation.z += ((p.headZ || 0) - rig.headGroup.rotation.z) * kp;
      }
      if (rig.leftArm) {
        rig.leftArm.rotation.x += ((p.armLX || 0) - rig.leftArm.rotation.x) * kp;
        rig.leftArm.rotation.z += ((p.armLZ !== undefined ? p.armLZ : 0.09) - rig.leftArm.rotation.z) * kp;
      }
      if (rig.rightArm) {
        rig.rightArm.rotation.x += ((p.armRX || 0) - rig.rightArm.rotation.x) * kp;
        rig.rightArm.rotation.z += ((p.armRZ !== undefined ? p.armRZ : -0.09) - rig.rightArm.rotation.z) * kp;
      }
      if (rig.leftForearm) rig.leftForearm.rotation.x += ((p.foreLX || -0.10) - rig.leftForearm.rotation.x) * kp;
      if (rig.rightForearm) {
        rig.rightForearm.rotation.x += ((p.foreRX || -0.10) - rig.rightForearm.rotation.x) * kp;
        rig.rightForearm.rotation.z += ((p.foreRZ || 0) - rig.rightForearm.rotation.z) * kp;
      }
      if (rig.leftLeg) rig.leftLeg.rotation.x += (0 - rig.leftLeg.rotation.x) * kp;
      if (rig.rightLeg) rig.rightLeg.rotation.x += (0 - rig.rightLeg.rotation.x) * kp;
      if (rig.leftShin) rig.leftShin.rotation.x += (0 - rig.leftShin.rotation.x) * kp;
      if (rig.rightShin) rig.rightShin.rotation.x += (0 - rig.rightShin.rotation.x) * kp;
      const idleBob = Math.sin(performance.now() * 0.0021) * 0.006;
      if (rig.bodyPivot) rig.bodyPivot.position.y += (idleBob - rig.bodyPivot.position.y) * kp;
      this._applyWindToHairAndSkirt(rig, dt, 0, 0, windStrength);
      return;
    }

    // Normal locomotion + natural head tracking
    const freq = speed <= walkSpeed ? 7.3 * (speed / walkSpeed) : 7.3 + (speed - walkSpeed) * 1.5;
    rig.walkPhase = (rig.walkPhase || 0) + dt * freq;

    const amp = (rig.isFemale ? 0.39 : 0.43) + rb * 0.18;
    const swing = Math.sin(rig.walkPhase) * amp * mb;
    const kLimb = this.dampK(16, dt);

    if (rig.spinePivot) {
      const targetSpineX = mb * (0.035 + rb * 0.05);
      rig.spinePivot.rotation.x += (targetSpineX - rig.spinePivot.rotation.x) * this.dampK(6, dt);
      rig.spinePivot.rotation.z += (Math.sin(rig.walkPhase) * 0.018 * mb - rig.spinePivot.rotation.z) * this.dampK(6, dt);
    }

    // Head subtle tracking toward nearby companion/speaker when idle or walking slowly
    if (rig.headGroup) {
      let wantHeadY = 0, wantHeadX = 0;
      if (lookTarget && mb < 0.7) {
        const dx = lookTarget.x - rig.root.position.x;
        const dz = lookTarget.z - rig.root.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq > 0.09 && distSq < 25) {
          const worldAng = Math.atan2(dx, dz);
          let relY = Math.atan2(Math.sin(worldAng - rig.root.rotation.y), Math.cos(worldAng - rig.root.rotation.y));
          if (Math.abs(relY) < 1.15) {
            wantHeadY = Math.max(-0.48, Math.min(0.48, relY * 0.55));
            const dy = (lookTarget.y || 1.5) - (rig.isFemale ? 1.45 : 1.60);
            wantHeadX = Math.max(-0.18, Math.min(0.18, -dy * 0.22));
          }
        }
      }
      rig.headGroup.rotation.y += (wantHeadY - rig.headGroup.rotation.y) * this.dampK(5, dt);
      rig.headGroup.rotation.x += (wantHeadX - rig.headGroup.rotation.x) * this.dampK(5, dt);
      rig.headGroup.rotation.z += (Math.sin(performance.now() * 0.0014) * 0.014 - rig.headGroup.rotation.z) * this.dampK(4, dt);
    }

    if (rig.leftLeg && rig.rightLeg) {
      rig.leftLeg.rotation.x += (swing - rig.leftLeg.rotation.x) * kLimb;
      rig.rightLeg.rotation.x += (-swing - rig.rightLeg.rotation.x) * kLimb;
    }
    if (rig.leftShin && rig.rightShin) {
      const kneeL = Math.max(0, -Math.sin(rig.walkPhase + 0.35)) * (0.52 + rb * 0.26) * mb;
      const kneeR = Math.max(0, Math.sin(rig.walkPhase + 0.35)) * (0.52 + rb * 0.26) * mb;
      rig.leftShin.rotation.x += (kneeL - rig.leftShin.rotation.x) * kLimb;
      rig.rightShin.rotation.x += (kneeR - rig.rightShin.rotation.x) * kLimb;
    }

    const idleSpread = rig.isFemale ? 0.095 : 0.085;
    if (rig.leftArm) {
      const tLX = -0.05 * (1 - mb) + (-swing * 0.62);
      rig.leftArm.rotation.x += (tLX - rig.leftArm.rotation.x) * kLimb;
      rig.leftArm.rotation.z += (idleSpread * (1 - mb * 0.35) - rig.leftArm.rotation.z) * this.dampK(8, dt);
      if (rig.leftForearm) {
        const elbL = (-0.11 * (1 - mb)) + (-0.18 - Math.max(0, -swing) * 0.30) * mb;
        rig.leftForearm.rotation.x += (elbL - rig.leftForearm.rotation.x) * kLimb;
      }
    }

    if (rig.rightArm) {
      if (rig.holdingRightHandProp) {
        rig.rightArm.rotation.x += (-0.82 - rig.rightArm.rotation.x) * this.dampK(9, dt);
        rig.rightArm.rotation.z += (0.28 - rig.rightArm.rotation.z) * this.dampK(9, dt);
        if (rig.rightForearm) {
          rig.rightForearm.rotation.x += (-0.88 - rig.rightForearm.rotation.x) * this.dampK(9, dt);
          rig.rightForearm.rotation.z += (0.34 - rig.rightForearm.rotation.z) * this.dampK(9, dt);
        }
      } else {
        const tRX = -0.05 * (1 - mb) + (swing * 0.62);
        rig.rightArm.rotation.x += (tRX - rig.rightArm.rotation.x) * kLimb;
        rig.rightArm.rotation.z += (-idleSpread * (1 - mb * 0.35) - rig.rightArm.rotation.z) * this.dampK(8, dt);
        if (rig.rightForearm) {
          const elbR = (-0.11 * (1 - mb)) + (-0.18 - Math.max(0, swing) * 0.30) * mb;
          rig.rightForearm.rotation.x += (elbR - rig.rightForearm.rotation.x) * kLimb;
          rig.rightForearm.rotation.z += (0 - rig.rightForearm.rotation.z) * kLimb;
        }
      }
    }

    const idleBob = Math.sin(performance.now() * 0.0022) * 0.0065;
    const stepBob = Math.abs(Math.sin(rig.walkPhase)) * (0.034 + rb * 0.012);
    if (rig.bodyPivot) {
      rig.bodyPivot.position.y += ((idleBob * (1 - mb) + stepBob * mb) - rig.bodyPivot.position.y) * this.dampK(18, dt);
    }

    this._applyWindToHairAndSkirt(rig, dt, mb, swing, windStrength);
  },

  _applyWindToHairAndSkirt(rig, dt, mb, swing, windStrength) {
    const t = performance.now() * 0.001;
    const gust = (Math.sin(t * 1.65) * 0.55 + Math.sin(t * 2.9 + 1.1) * 0.30 + 0.35) * windStrength;
    const hairBackPitch = gust * 0.16 + mb * (0.11 + Math.abs(swing) * 0.20);
    const hairSideRoll = Math.sin(t * 2.1) * 0.045 * windStrength;

    if (rig.longHairPivot) {
      rig.longHairPivot.rotation.x += (hairBackPitch - rig.longHairPivot.rotation.x) * this.dampK(7, dt);
      rig.longHairPivot.rotation.z += (hairSideRoll - rig.longHairPivot.rotation.z) * this.dampK(6, dt);
    }
    if (rig.skirtPivot) {
      const skPitch = gust * 0.055 + mb * 0.04;
      const skRoll = Math.sin(t * 2.3 + 0.6) * 0.028 * windStrength;
      rig.skirtPivot.rotation.x += (skPitch - rig.skirtPivot.rotation.x) * this.dampK(8, dt);
      rig.skirtPivot.rotation.z += (skRoll - rig.skirtPivot.rotation.z) * this.dampK(8, dt);
    }
  }
};
