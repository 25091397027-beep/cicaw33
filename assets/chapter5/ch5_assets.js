/* ============================================================================
   CICAWW33 — CHAPTER 5: THE THINGS WE DON'T SAY
   CHAPTER 5 ASSET MANAGER (assets/chapter5/ch5_assets.js)
   - Asynchronous GLB & JSON loader compatible with local Three.js r128
   - Supports HTTP/HTTPS fetch + automatic file:// offline pack fallback
   - Performs bounding-box verification, PBR texture anisotropy & normal/roughness
     enhancement, shadow configuration, caching, AnimationMixer detection, and
     clean GPU memory disposal between scenes.
============================================================================ */
"use strict";

window.Chapter5AssetManager = (function () {
  const MANIFEST_URL = "./assets/chapter5/chapter5_asset_manifest.json";

  let manifest = null;
  let qualityTier = "high";
  const glbCache = new Map();
  const vfxCache = new Map();
  const pbrRuntimeCache = new Map();

  const audit = {
    manifestLoaded: false,
    protocol: typeof location !== "undefined" ? location.protocol : "unknown",
    loadedGlbs: {},
    loadedVfx: {},
    characterFallbacks: {},
    errors: []
  };

  function _isFileProtocol() {
    return typeof location !== "undefined" && location.protocol === "file:";
  }

  function _b64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  /* High-resolution procedural PBR maps (1K–2K) matching Gemini Studio material kinds */
  function _generateSobelNormal(heightCanvas, strength) {
    const w = heightCanvas.width, h = heightCanvas.height;
    const src = heightCanvas.getContext("2d").getImageData(0, 0, w, h).data;
    const out = document.createElement("canvas");
    out.width = w; out.height = h;
    const ctx = out.getContext("2d");
    const img = ctx.createImageData(w, h);
    const dst = img.data;
    const s = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const tl = s(x - 1, y - 1), t = s(x, y - 1), tr = s(x + 1, y - 1);
        const l = s(x - 1, y), r = s(x + 1, y);
        const bl = s(x - 1, y + 1), b = s(x, y + 1), br = s(x + 1, y + 1);
        const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * strength;
        const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * strength;
        const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
        const i = (y * w + x) * 4;
        dst[i] = Math.round(((-dx * inv) * 0.5 + 0.5) * 255);
        dst[i + 1] = Math.round(((-dy * inv) * 0.5 + 0.5) * 255);
        dst[i + 2] = Math.round((inv * 0.5 + 0.5) * 255);
        dst[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return out;
  }

  function getHiResPBRSet(kind) {
    const res = qualityTier === "low" ? 256 : qualityTier === "medium" ? 512 : 1024;
    const key = `${kind}_${res}`;
    if (pbrRuntimeCache.has(key)) return pbrRuntimeCache.get(key);

    const aC = document.createElement("canvas"); aC.width = aC.height = res;
    const hC = document.createElement("canvas"); hC.width = hC.height = res;
    const rC = document.createElement("canvas"); rC.width = rC.height = res;
    const a = aC.getContext("2d"), h = hC.getContext("2d"), r = rC.getContext("2d");

    h.fillStyle = "#808080"; h.fillRect(0, 0, res, res);
    r.fillStyle = "#a8a8a8"; r.fillRect(0, 0, res, res);

    if (kind === "wood_aula" || kind === "wood_warm") {
      const base = kind === "wood_aula" ? [178, 134, 88] : [136, 94, 63];
      const planks = 10, ph = res / planks;
      for (let row = 0; row < planks; row++) {
        const y = row * ph, v = ((row * 31) % 20) - 10;
        a.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`;
        a.fillRect(0, y, res, ph);
        r.fillStyle = `rgb(${102 + (row % 3) * 14},${102 + (row % 3) * 14},${102 + (row % 3) * 14})`;
        r.fillRect(0, y, res, ph);
        for (let g = 0; g < 8; g++) {
          a.strokeStyle = "rgba(62,35,16,0.13)";
          a.lineWidth = Math.max(1, res / 320);
          a.beginPath();
          const gy = y + (g + 0.5) * (ph / 8);
          a.moveTo(0, gy);
          a.bezierCurveTo(res * 0.33, gy + 5, res * 0.66, gy - 5, res, gy);
          a.stroke();
        }
        a.fillStyle = "rgba(38,22,12,0.52)";
        a.fillRect(0, y + ph - 2, res, 2);
        h.fillStyle = "#242424";
        h.fillRect(0, y + ph - 2, res, 2);
        const jx = ((row * 197 + 90) % (res - 80)) + 40;
        a.fillRect(jx, y, 2, ph);
        h.fillRect(jx, y, 2, ph);
      }
    } else if (kind === "tile_corridor" || kind === "terrazzo_hall") {
      a.fillStyle = kind === "terrazzo_hall" ? "#dfd8cc" : "#d6cfc4";
      a.fillRect(0, 0, res, res);
      r.fillStyle = "#767676"; r.fillRect(0, 0, res, res);
      const cells = 4, step = res / cells;
      for (let gx = 0; gx < cells; gx++) {
        for (let gy = 0; gy < cells; gy++) {
          a.fillStyle = (gx + gy) % 2 === 0 ? "#ddd6cb" : "#d0c8bc";
          a.fillRect(gx * step + 2, gy * step + 2, step - 4, step - 4);
          h.fillStyle = "#989898";
          h.fillRect(gx * step + 2, gy * step + 2, step - 4, step - 4);
        }
      }
      for (let i = 0; i < 900; i++) {
        const x = (i * 173) % res, y = (i * 311) % res;
        a.fillStyle = i % 3 === 0 ? "rgba(255,252,245,0.22)" : "rgba(120,108,96,0.12)";
        a.fillRect(x, y, 3, 3);
      }
    } else if (kind === "asphalt_evening") {
      a.fillStyle = "#293040"; a.fillRect(0, 0, res, res);
      r.fillStyle = "#8e8e8e"; r.fillRect(0, 0, res, res);
      for (let i = 0; i < 4200; i++) {
        const x = (i * 239) % res, y = (i * 419) % res, b = 34 + (i % 28);
        a.fillStyle = `rgb(${b},${b + 4},${b + 12})`;
        a.fillRect(x, y, 3, 3);
        const hv = 96 + (i % 64);
        h.fillStyle = `rgb(${hv},${hv},${hv})`;
        h.fillRect(x, y, 3, 3);
      }
      a.fillStyle = "rgba(244,197,122,0.52)";
      a.fillRect(res * 0.485, 0, res * 0.03, res * 0.58);
    } else if (kind === "event_poster") {
      const g = a.createLinearGradient(0, 0, 0, res);
      g.addColorStop(0, "#192844");
      g.addColorStop(0.55, "#2b4268");
      g.addColorStop(1, "#d98c5f");
      a.fillStyle = g; a.fillRect(0, 0, res, res);
      a.strokeStyle = "#f4c57a"; a.lineWidth = Math.max(4, res * 0.018);
      a.strokeRect(res * 0.04, res * 0.04, res * 0.92, res * 0.92);
      a.fillStyle = "#fff8ee"; a.textAlign = "center";
      a.font = `bold ${Math.round(res * 0.088)}px Georgia, serif`;
      a.fillText("AUTUMN", res / 2, res * 0.25);
      a.fillStyle = "#f4c57a";
      a.fillText("SCHOOL FEST", res / 2, res * 0.365);
      a.fillStyle = "#e2e8f0";
      a.font = `600 ${Math.round(res * 0.045)}px sans-serif`;
      a.fillText("AULA UTAMA • JUMAT 15:30", res / 2, res * 0.50);
      a.fillStyle = "rgba(255,255,255,0.15)";
      a.fillRect(res * 0.13, res * 0.58, res * 0.74, res * 0.25);
      a.fillStyle = "#fff8ee";
      a.font = `500 ${Math.round(res * 0.038)}px monospace`;
      a.fillText("PANITIA ACARA & BU MIRA", res / 2, res * 0.72);
      r.fillStyle = "#5c5c5c"; r.fillRect(0, 0, res, res);
    } else {
      a.fillStyle = kind === "plaster_warm" ? "#e5dbcd" : "#ece7de";
      a.fillRect(0, 0, res, res);
      r.fillStyle = "#d2d2d2"; r.fillRect(0, 0, res, res);
      for (let i = 0; i < 2600; i++) {
        const x = (i * 197) % res, y = (i * 353) % res;
        a.fillStyle = i % 2 === 0 ? "rgba(120,106,92,0.05)" : "rgba(255,252,246,0.07)";
        a.fillRect(x, y, 4, 4);
        h.fillStyle = i % 2 === 0 ? "#777777" : "#8b8b8b";
        h.fillRect(x, y, 3, 3);
      }
    }

    const nC = _generateSobelNormal(hC, 1.9);
    const mk = (cv, srgb) => {
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 16;
      if (srgb) t.encoding = THREE.sRGBEncoding;
      t.needsUpdate = true;
      return t;
    };
    const set = { map: mk(aC, true), normalMap: mk(nC, false), roughnessMap: mk(rC, false) };
    pbrRuntimeCache.set(key, set);
    return set;
  }

  async function init(quality = "high") {
    qualityTier = quality || "high";
    if (manifest) return manifest;

    if (!_isFileProtocol()) {
      try {
        const resp = await fetch(MANIFEST_URL);
        if (resp.ok) {
          manifest = await resp.json();
          audit.manifestLoaded = true;
          return manifest;
        }
      } catch (err) {
        audit.errors.push("Manifest HTTP fetch fallback: " + err.message);
      }
    }

    if (window.CH5_OFFLINE_PACK && window.CH5_OFFLINE_PACK.manifest) {
      manifest = window.CH5_OFFLINE_PACK.manifest;
      audit.manifestLoaded = true;
      return manifest;
    }

    manifest = { project: "A Story Beneath the Rain", chapter: 5, scenes: [], assets: [] };
    return manifest;
  }

  function setQuality(q) {
    qualityTier = q || "high";
  }

  function getAssetMeta(assetId) {
    if (!manifest || !Array.isArray(manifest.assets)) return null;
    return manifest.assets.find((a) => a.id === assetId) || null;
  }

  async function loadGLB(assetId) {
    if (glbCache.has(assetId)) {
      return glbCache.get(assetId);
    }
    const meta = getAssetMeta(assetId);
    const loader = new THREE.GLTFLoader();
    let gltf = null;
    let sourceMode = "http_glb";

    if (!_isFileProtocol() && meta && meta.path) {
      try {
        gltf = await loader.loadAsync(meta.path);
      } catch (err) {
        audit.errors.push(`GLB HTTP fallback (${assetId}): ${err.message}`);
      }
    }

    if (!gltf && window.CH5_OFFLINE_PACK && window.CH5_OFFLINE_PACK.glb && window.CH5_OFFLINE_PACK.glb[assetId]) {
      sourceMode = _isFileProtocol() ? "offline_pack_glb" : "fallback_pack_glb";
      const buf = _b64ToArrayBuffer(window.CH5_OFFLINE_PACK.glb[assetId]);
      gltf = await new Promise((resolve, reject) => {
        loader.parse(buf, "./assets/chapter5/", resolve, reject);
      });
    }

    if (!gltf) {
      throw new Error("Aset GLB tidak ditemukan: " + assetId);
    }

    // Normalize shadow flags & anisotropy on loaded meshes
    let meshCount = 0;
    let triCount = 0;
    gltf.scene.traverse((n) => {
      if (n.isMesh) {
        meshCount++;
        n.castShadow = qualityTier !== "low";
        n.receiveShadow = true;
        if (n.geometry) {
          triCount += n.geometry.index
            ? Math.round(n.geometry.index.count / 3)
            : (n.geometry.attributes.position ? Math.round(n.geometry.attributes.position.count / 3) : 0);
        }
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m) => {
          if (!m) return;
          ["map", "normalMap", "roughnessMap", "emissiveMap"].forEach((k) => {
            if (m[k]) m[k].anisotropy = 16;
          });
        });
      }
    });

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const sz = box.getSize(new THREE.Vector3());
    audit.loadedGlbs[assetId] = {
      id: assetId,
      fileName: meta ? meta.fileName : assetId + ".glb",
      sourceMode,
      meshes: meshCount,
      tris: triCount,
      animations: gltf.animations ? gltf.animations.length : 0,
      dimensions: [Number(sz.x.toFixed(2)), Number(sz.y.toFixed(2)), Number(sz.z.toFixed(2))]
    };

    glbCache.set(assetId, gltf);
    return gltf;
  }

  async function instantiateGLB(assetId, opts = {}) {
    const gltf = await loadGLB(assetId);
    const clone = gltf.scene.clone(true);
    clone.name = opts.name || assetId;

    // Clone materials per instance if tint/highlight may be applied independently
    if (opts.uniqueMaterials) {
      clone.traverse((n) => {
        if (n.isMesh && n.material) {
          n.material = Array.isArray(n.material) ? n.material.map((m) => m.clone()) : n.material.clone();
        }
      });
    }

    if (opts.position) clone.position.set(opts.position[0], opts.position[1], opts.position[2]);
    if (opts.rotation) clone.rotation.set(opts.rotation[0], opts.rotation[1], opts.rotation[2]);
    if (typeof opts.scale === "number") clone.scale.setScalar(opts.scale);
    else if (Array.isArray(opts.scale)) clone.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);

    if (opts.groundAlign) {
      const box = new THREE.Box3().setFromObject(clone);
      if (isFinite(box.min.y)) {
        clone.position.y -= box.min.y;
        if (opts.position) clone.position.y += opts.position[1];
      }
    }

    let mixer = null;
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(clone);
      mixer.clipAction(gltf.animations[0]).play();
    }
    clone.userData.ch5AssetId = assetId;
    clone.userData.mixer = mixer;
    return clone;
  }

  async function loadVFXConfig(vfxId) {
    if (vfxCache.has(vfxId)) return vfxCache.get(vfxId);
    const meta = getAssetMeta(vfxId);
    let data = null;
    if (!_isFileProtocol() && meta && meta.path) {
      try {
        const resp = await fetch(meta.path);
        if (resp.ok) data = await resp.json();
      } catch (_) {}
    }
    if (!data && window.CH5_OFFLINE_PACK && window.CH5_OFFLINE_PACK.vfx && window.CH5_OFFLINE_PACK.vfx[vfxId]) {
      data = window.CH5_OFFLINE_PACK.vfx[vfxId];
    }
    if (!data && meta && meta.vfxConfig) {
      data = { id: vfxId, status: "READY", config: meta.vfxConfig };
    }
    if (data) {
      audit.loadedVfx[vfxId] = { id: vfxId, loaded: true };
      vfxCache.set(vfxId, data);
    }
    return data;
  }

  async function preloadAssetList(assetIds, onProgress) {
    await init(qualityTier);
    const total = Math.max(1, assetIds.length);
    for (let i = 0; i < assetIds.length; i++) {
      const id = assetIds[i];
      const meta = getAssetMeta(id);
      if (onProgress) onProgress(Math.round(((i + 0.2) / total) * 100), meta ? meta.name : id);
      try {
        if (!meta || meta.format === ".glb") {
          if (!meta || meta.status === "READY") {
            await loadGLB(id);
          } else {
            audit.characterFallbacks[id] = {
              id,
              manifestStatus: meta.status,
              fallbackUsed: "Ch5Characters Ultra-HD Rig (Ch4CharacterCore + Ch5 Upgrade)"
            };
          }
        } else if (meta.format === ".json") {
          await loadVFXConfig(id);
        }
      } catch (err) {
        audit.errors.push(`Preload error (${id}): ${err.message}`);
      }
      if (onProgress) onProgress(Math.round(((i + 1) / total) * 100), meta ? meta.name : id);
    }
  }

  function registerCharacterFallback(id, reason) {
    audit.characterFallbacks[id] = { id, fallbackUsed: reason };
  }

  function disposeGroup(group) {
    if (!group) return;
    group.traverse((n) => {
      // Do not dispose cached shared GLB geometries/textures that belong to glbCache prototypes
      if (n.userData && n.userData.ch5Disposable) {
        if (n.geometry) n.geometry.dispose();
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            if (!m) return;
            ["map", "normalMap", "roughnessMap", "emissiveMap"].forEach((k) => {
              if (m[k] && m[k].userData && m[k].userData.ch5Disposable) m[k].dispose();
            });
            m.dispose();
          });
        }
      }
    });
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  }

  function getAuditReport() {
    return {
      manifestLoaded: audit.manifestLoaded,
      protocol: audit.protocol,
      totalManifestAssets: manifest && manifest.assets ? manifest.assets.length : 0,
      loadedGlbCount: Object.keys(audit.loadedGlbs).length,
      loadedVfxCount: Object.keys(audit.loadedVfx).length,
      characterFallbackCount: Object.keys(audit.characterFallbacks).length,
      loadedGlbs: audit.loadedGlbs,
      loadedVfx: audit.loadedVfx,
      characterFallbacks: audit.characterFallbacks,
      errors: audit.errors
    };
  }

  return {
    init,
    setQuality,
    getAssetMeta,
    getHiResPBRSet,
    loadGLB,
    instantiateGLB,
    loadVFXConfig,
    preloadAssetList,
    registerCharacterFallback,
    disposeGroup,
    getAuditReport
  };
})();
