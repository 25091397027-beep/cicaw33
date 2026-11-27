/* ============================================================================
   THREE.GLTFLoader & THREE.GLTFExporter (Khronos glTF 2.0 • Three.js r128)
   Local Offline Vendor Module for Cicaww33 — A Story Beneath the Rain
   Supports Binary .GLB & .GLTF JSON: Scenes, Nodes, PBR Materials, Textures
   (KHR_texture_transform, KHR_materials_unlit), Skins, Morph Targets, & Clips.
============================================================================ */
(function () {
  "use strict";
  if (typeof THREE === "undefined") return;

  const WEBGL_CONST = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_SHORT: 5123,
    UNSIGNED_INT: 5125,
    FLOAT: 5126,
    NEAREST: 9728,
    LINEAR: 9729,
    NEAREST_MIPMAP_NEAREST: 9984,
    LINEAR_MIPMAP_NEAREST: 9985,
    NEAREST_MIPMAP_LINEAR: 9986,
    LINEAR_MIPMAP_LINEAR: 9987,
    CLAMP_TO_EDGE: 33071,
    MIRRORED_REPEAT: 33648,
    REPEAT: 10497
  };

  const COMP_ARRAYS = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
  };

  const TYPE_SIZES = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
  };

  const WRAP_MAP = {
    33071: THREE.ClampToEdgeWrapping,
    33648: THREE.MirroredRepeatWrapping,
    10497: THREE.RepeatWrapping
  };

  const FILTER_MAP = {
    9728: THREE.NearestFilter,
    9729: THREE.LinearFilter,
    9984: THREE.NearestMipmapNearestFilter,
    9985: THREE.LinearMipmapNearestFilter,
    9986: THREE.NearestMipmapLinearFilter,
    9987: THREE.LinearMipmapLinearFilter
  };

  /* -------------------------------------------------------------------------
     1. THREE.GLTFLoader (r128 Compatible)
  ------------------------------------------------------------------------- */
  class GLTFLoader extends THREE.Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      const scope = this;
      let resourcePath;
      if (this.resourcePath !== "") {
        resourcePath = this.resourcePath;
      } else if (this.path !== "") {
        resourcePath = this.path;
      } else {
        resourcePath = THREE.LoaderUtils.extractUrlBase(url);
      }

      this.manager.itemStart(url);
      const _onError = function (e) {
        if (onError) onError(e);
        else console.error("GLTFLoader error:", e);
        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      };

      const loader = new THREE.FileLoader(this.manager);
      loader.setPath(this.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);

      loader.load(
        url,
        function (data) {
          try {
            scope.parse(
              data,
              resourcePath,
              function (gltf) {
                if (onLoad) onLoad(gltf);
                scope.manager.itemEnd(url);
              },
              _onError
            );
          } catch (err) {
            _onError(err);
          }
        },
        onProgress,
        _onError
      );
    }

    loadAsync(url, onProgress) {
      const scope = this;
      return new Promise(function (resolve, reject) {
        scope.load(url, resolve, onProgress, reject);
      });
    }

    parse(data, path, onLoad, onError) {
      try {
        let json = null;
        let binBuffer = null;

        if (data instanceof Uint8Array) {
          data = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        }

        if (data instanceof ArrayBuffer) {
          const dv = new DataView(data);
          const magic = dv.getUint32(0, true);
          if (magic === 0x46546c67) {
            const version = dv.getUint32(4, true);
            if (version !== 2) throw new Error("Unsupported glTF binary version: " + version);
            const totalLen = dv.getUint32(8, true);
            let offset = 12;
            while (offset < totalLen && offset + 8 <= data.byteLength) {
              const chunkLen = dv.getUint32(offset, true);
              const chunkType = dv.getUint32(offset + 4, true);
              offset += 8;
              if (chunkType === 0x4e4f534a) {
                const jsonBytes = new Uint8Array(data, offset, chunkLen);
                json = JSON.parse(new TextDecoder("utf-8").decode(jsonBytes));
              } else if (chunkType === 0x004e4942) {
                binBuffer = data.slice(offset, offset + chunkLen);
              }
              offset += chunkLen;
            }
          } else {
            json = JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(data)));
          }
        } else if (typeof data === "string") {
          json = JSON.parse(data);
        } else if (data && typeof data === "object") {
          json = data;
        }

        if (!json || !json.asset) {
          throw new Error("Invalid glTF 2.0 content");
        }

        this._buildGLTF(json, binBuffer, path || "").then(onLoad).catch(function (err) {
          if (onError) onError(err);
          else console.error(err);
        });
      } catch (err) {
        if (onError) onError(err);
        else console.error(err);
      }
    }

    async _buildGLTF(json, binBuffer, basePath) {
      // 1. Resolve buffers
      const buffers = [];
      const bufDefs = json.buffers || [];
      for (let i = 0; i < bufDefs.length; i++) {
        const b = bufDefs[i];
        if (!b.uri) {
          buffers[i] = binBuffer;
        } else if (b.uri.startsWith("data:")) {
          const b64 = b.uri.split(",")[1] || "";
          const binStr = atob(b64);
          const u8 = new Uint8Array(binStr.length);
          for (let j = 0; j < binStr.length; j++) u8[j] = binStr.charCodeAt(j);
          buffers[i] = u8.buffer;
        } else {
          const resp = await fetch(basePath + b.uri);
          buffers[i] = await resp.arrayBuffer();
        }
      }

      const getBufferViewSlice = (bvIdx) => {
        const bv = json.bufferViews[bvIdx];
        const buf = buffers[bv.buffer || 0];
        const byteOffset = bv.byteOffset || 0;
        return new Uint8Array(buf, byteOffset, bv.byteLength);
      };

      const getAccessorData = (accIdx) => {
        const acc = json.accessors[accIdx];
        const ArrType = COMP_ARRAYS[acc.componentType];
        const itemSize = TYPE_SIZES[acc.type] || 1;
        const count = acc.count;
        const bv = json.bufferViews[acc.bufferView];
        const buf = buffers[bv.buffer || 0];
        const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
        const elemBytes = ArrType.BYTES_PER_ELEMENT;
        const stride = bv.byteStride || 0;

        if (!stride || stride === itemSize * elemBytes) {
          const sliced = buf.slice(byteOffset, byteOffset + count * itemSize * elemBytes);
          return { array: new ArrType(sliced), itemSize, normalized: !!acc.normalized };
        }
        // De-interleave strided bufferView safely
        const out = new ArrType(count * itemSize);
        const dv = new DataView(buf);
        for (let i = 0; i < count; i++) {
          const rowOff = byteOffset + i * stride;
          for (let k = 0; k < itemSize; k++) {
            const o = rowOff + k * elemBytes;
            if (acc.componentType === 5126) out[i * itemSize + k] = dv.getFloat32(o, true);
            else if (acc.componentType === 5123) out[i * itemSize + k] = dv.getUint16(o, true);
            else if (acc.componentType === 5125) out[i * itemSize + k] = dv.getUint32(o, true);
            else if (acc.componentType === 5121) out[i * itemSize + k] = dv.getUint8(o);
            else if (acc.componentType === 5122) out[i * itemSize + k] = dv.getInt16(o, true);
            else out[i * itemSize + k] = dv.getInt8(o);
          }
        }
        return { array: out, itemSize, normalized: !!acc.normalized };
      };

      // 2. Load images
      const images = [];
      const imgDefs = json.images || [];
      for (let i = 0; i < imgDefs.length; i++) {
        const im = imgDefs[i];
        images[i] = await new Promise((resolve) => {
          const imgEl = new Image();
          let objUrl = null;
          imgEl.onload = () => {
            if (objUrl) URL.revokeObjectURL(objUrl);
            resolve(imgEl);
          };
          imgEl.onerror = () => {
            if (objUrl) URL.revokeObjectURL(objUrl);
            resolve(null);
          };
          if (im.bufferView !== undefined) {
            const bytes = getBufferViewSlice(im.bufferView);
            const blob = new Blob([bytes], { type: im.mimeType || "image/png" });
            objUrl = URL.createObjectURL(blob);
            imgEl.src = objUrl;
          } else if (im.uri) {
            imgEl.crossOrigin = "anonymous";
            imgEl.src = im.uri.startsWith("data:") ? im.uri : basePath + im.uri;
          } else {
            resolve(null);
          }
        });
      }

      const buildTexture = (texInfo, isSRGB) => {
        if (!texInfo || texInfo.index === undefined) return null;
        const texDef = (json.textures || [])[texInfo.index];
        if (!texDef) return null;
        const img = images[texDef.source];
        if (!img) return null;
        const tex = new THREE.Texture(img);
        const samp = texDef.sampler !== undefined ? (json.samplers || [])[texDef.sampler] : null;
        tex.wrapS = samp && WRAP_MAP[samp.wrapS] ? WRAP_MAP[samp.wrapS] : THREE.RepeatWrapping;
        tex.wrapT = samp && WRAP_MAP[samp.wrapT] ? WRAP_MAP[samp.wrapT] : THREE.RepeatWrapping;
        if (samp && FILTER_MAP[samp.magFilter]) tex.magFilter = FILTER_MAP[samp.magFilter];
        if (samp && FILTER_MAP[samp.minFilter]) tex.minFilter = FILTER_MAP[samp.minFilter];
        tex.flipY = false;
        tex.anisotropy = 16;
        if (isSRGB) tex.encoding = THREE.sRGBEncoding;
        const xform = texInfo.extensions && texInfo.extensions.KHR_texture_transform;
        if (xform) {
          if (xform.offset) tex.offset.set(xform.offset[0], xform.offset[1]);
          if (xform.scale) tex.repeat.set(xform.scale[0], xform.scale[1]);
          if (typeof xform.rotation === "number") tex.rotation = xform.rotation;
        }
        tex.needsUpdate = true;
        return tex;
      };

      // 3. Build materials
      const materials = (json.materials || []).map((mDef, idx) => {
        const pbr = mDef.pbrMetallicRoughness || {};
        const bcf = pbr.baseColorFactor || [1, 1, 1, 1];
        const color = new THREE.Color(bcf[0], bcf[1], bcf[2]);
        const opacity = bcf[3] !== undefined ? bcf[3] : 1.0;
        const isUnlit = !!(mDef.extensions && mDef.extensions.KHR_materials_unlit);
        const side = mDef.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
        const map = buildTexture(pbr.baseColorTexture, true);

        let mat;
        if (isUnlit) {
          mat = new THREE.MeshBasicMaterial({
            name: mDef.name || "gltf_unlit_" + idx,
            color,
            map,
            opacity,
            transparent: mDef.alphaMode === "BLEND" || opacity < 1,
            side
          });
        } else {
          const mrTex = buildTexture(pbr.metallicRoughnessTexture, false);
          const normTex = buildTexture(mDef.normalTexture, false);
          const aoTex = buildTexture(mDef.occlusionTexture, false);
          const emTex = buildTexture(mDef.emissiveTexture, true);
          const ef = mDef.emissiveFactor || [0, 0, 0];
          const ns = mDef.normalTexture && typeof mDef.normalTexture.scale === "number" ? mDef.normalTexture.scale : 1.0;

          mat = new THREE.MeshStandardMaterial({
            name: mDef.name || "gltf_pbr_" + idx,
            color,
            map,
            metalness: pbr.metallicFactor !== undefined ? pbr.metallicFactor : (mrTex ? 1.0 : 0.0),
            roughness: pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1.0,
            metalnessMap: mrTex,
            roughnessMap: mrTex,
            normalMap: normTex,
            normalScale: new THREE.Vector2(ns, ns),
            aoMap: aoTex,
            emissive: new THREE.Color(ef[0], ef[1], ef[2]),
            emissiveMap: emTex,
            emissiveIntensity: 1.0,
            opacity,
            transparent: mDef.alphaMode === "BLEND" || opacity < 1,
            side
          });
        }
        if (mDef.alphaMode === "MASK") {
          mat.alphaTest = mDef.alphaCutoff !== undefined ? mDef.alphaCutoff : 0.5;
        }
        if (mDef.extras) mat.userData = Object.assign({}, mDef.extras);
        return mat;
      });
      const defaultMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0.05 });

      const attrMap = {
        POSITION: "position",
        NORMAL: "normal",
        TANGENT: "tangent",
        TEXCOORD_0: "uv",
        TEXCOORD_1: "uv2",
        COLOR_0: "color",
        JOINTS_0: "skinIndex",
        WEIGHTS_0: "skinWeight"
      };

      const buildPrimitiveMesh = (prim, meshDef, isSkinned) => {
        const geo = new THREE.BufferGeometry();
        const attrs = prim.attributes || {};
        Object.keys(attrs).forEach((sem) => {
          const targetName = attrMap[sem] || sem.toLowerCase();
          const d = getAccessorData(attrs[sem]);
          geo.setAttribute(targetName, new THREE.BufferAttribute(d.array, d.itemSize, d.normalized));
        });
        if (prim.indices !== undefined) {
          const idxData = getAccessorData(prim.indices);
          geo.setIndex(new THREE.BufferAttribute(idxData.array, 1));
        }
        if (!geo.attributes.normal && geo.attributes.position) {
          geo.computeVertexNormals();
        }
        if (Array.isArray(prim.targets) && prim.targets.length > 0) {
          geo.morphAttributes.position = [];
          prim.targets.forEach((t) => {
            if (t.POSITION !== undefined) {
              const td = getAccessorData(t.POSITION);
              // glTF morph targets are deltas; Three.js r128 morphAttributes are absolute unless morphTargetsRelative is set
              const baseArr = geo.attributes.position.array;
              const absArr = new Float32Array(baseArr.length);
              for (let k = 0; k < baseArr.length; k++) absArr[k] = baseArr[k] + td.array[k];
              geo.morphAttributes.position.push(new THREE.BufferAttribute(absArr, 3));
            }
          });
        }

        const mat = prim.material !== undefined && materials[prim.material] ? materials[prim.material].clone() : defaultMat.clone();
        if (geo.morphAttributes.position && geo.morphAttributes.position.length > 0) {
          mat.morphTargets = true;
        }
        if (isSkinned) {
          mat.skinning = true;
        }

        const mode = prim.mode !== undefined ? prim.mode : 4;
        let obj;
        if (mode === 0) {
          obj = new THREE.Points(geo, new THREE.PointsMaterial({ color: mat.color || 0xffffff, size: 0.05 }));
        } else if (mode === 1) {
          obj = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: mat.color || 0xffffff }));
        } else if (isSkinned) {
          obj = new THREE.SkinnedMesh(geo, mat);
        } else {
          obj = new THREE.Mesh(geo, mat);
        }
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.updateMorphTargets && geo.morphAttributes.position) {
          obj.updateMorphTargets();
          if (Array.isArray(meshDef.weights)) {
            meshDef.weights.forEach((w, wi) => { obj.morphTargetInfluences[wi] = w; });
          }
          if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
            obj.morphTargetDictionary = {};
            meshDef.extras.targetNames.forEach((nm, ni) => { obj.morphTargetDictionary[nm] = ni; });
          }
        }
        return obj;
      };

      // 4. Identify joint nodes for skins
      const jointNodeIndices = new Set();
      (json.skins || []).forEach((sk) => (sk.joints || []).forEach((j) => jointNodeIndices.add(j)));

      // 5. Build nodes
      const nodeDefs = json.nodes || [];
      const nodes = nodeDefs.map((nDef, idx) => {
        let obj;
        if (jointNodeIndices.has(idx)) {
          obj = new THREE.Bone();
        } else if (nDef.mesh !== undefined) {
          const mDef = json.meshes[nDef.mesh];
          const isSkinned = nDef.skin !== undefined;
          const prims = mDef.primitives || [];
          if (prims.length === 1) {
            obj = buildPrimitiveMesh(prims[0], mDef, isSkinned);
          } else {
            obj = new THREE.Group();
            prims.forEach((pr, pi) => {
              const pm = buildPrimitiveMesh(pr, mDef, isSkinned);
              pm.name = (mDef.name || "Mesh") + "_prim_" + pi;
              obj.add(pm);
            });
          }
        } else {
          obj = new THREE.Group();
        }

        obj.name = nDef.name || "Node_" + idx;
        if (nDef.extras) obj.userData = Object.assign({}, obj.userData, nDef.extras);

        if (Array.isArray(nDef.matrix)) {
          const m4 = new THREE.Matrix4().fromArray(nDef.matrix);
          m4.decompose(obj.position, obj.quaternion, obj.scale);
        } else {
          if (Array.isArray(nDef.translation)) obj.position.fromArray(nDef.translation);
          if (Array.isArray(nDef.rotation)) obj.quaternion.fromArray(nDef.rotation);
          if (Array.isArray(nDef.scale)) obj.scale.fromArray(nDef.scale);
        }
        return obj;
      });

      // Assemble parent-child hierarchy
      nodeDefs.forEach((nDef, idx) => {
        if (Array.isArray(nDef.children)) {
          nDef.children.forEach((cIdx) => {
            if (nodes[cIdx]) nodes[idx].add(nodes[cIdx]);
          });
        }
      });

      // Bind skins if present
      nodeDefs.forEach((nDef, idx) => {
        if (nDef.skin !== undefined) {
          const skDef = json.skins[nDef.skin];
          const bones = (skDef.joints || []).map((j) => nodes[j]);
          let boneInverses = undefined;
          if (skDef.inverseBindMatrices !== undefined) {
            const ibmData = getAccessorData(skDef.inverseBindMatrices).array;
            boneInverses = [];
            for (let b = 0; b < bones.length; b++) {
              boneInverses.push(new THREE.Matrix4().fromArray(ibmData, b * 16));
            }
          }
          const skeleton = new THREE.Skeleton(bones, boneInverses);
          nodes[idx].traverse((c) => {
            if (c.isSkinnedMesh) {
              c.updateMatrixWorld(true);
              c.bind(skeleton, c.matrixWorld);
            }
          });
        }
      });

      // 6. Build scenes
      const scenes = (json.scenes || []).map((sDef, sIdx) => {
        const grp = new THREE.Group();
        grp.name = sDef.name || "Scene_" + sIdx;
        (sDef.nodes || []).forEach((nIdx) => {
          if (nodes[nIdx]) grp.add(nodes[nIdx]);
        });
        return grp;
      });
      const scene = scenes[json.scene || 0] || scenes[0] || new THREE.Group();

      // 7. Build AnimationClips
      const animations = (json.animations || []).map((aDef, aIdx) => {
        const tracks = [];
        (aDef.channels || []).forEach((ch) => {
          const samp = aDef.samplers[ch.sampler];
          const targetNode = nodes[ch.target.node];
          if (!samp || !targetNode) return;
          const times = getAccessorData(samp.input).array;
          const values = getAccessorData(samp.output).array;
          const tName = targetNode.uuid;
          const path = ch.target.path;
          const interp = samp.interpolation === "STEP" ? THREE.InterpolateDiscrete : THREE.InterpolateLinear;

          if (path === "translation") {
            tracks.push(new THREE.VectorKeyframeTrack(tName + ".position", times, values, interp));
          } else if (path === "scale") {
            tracks.push(new THREE.VectorKeyframeTrack(tName + ".scale", times, values, interp));
          } else if (path === "rotation") {
            tracks.push(new THREE.QuaternionKeyframeTrack(tName + ".quaternion", times, values, interp));
          } else if (path === "weights") {
            tracks.push(new THREE.NumberKeyframeTrack(tName + ".morphTargetInfluences", times, values, interp));
          }
        });
        return new THREE.AnimationClip(aDef.name || "Clip_" + aIdx, -1, tracks);
      });

      return { scene, scenes, animations, cameras: [], asset: json.asset, userData: json.extras || {} };
    }
  }

  /* -------------------------------------------------------------------------
     2. THREE.GLTFExporter (Binary .GLB Compiler for Three.js r128)
  ------------------------------------------------------------------------- */
  class GLTFExporter {
    parse(input, onDone, options) {
      const opts = options || {};
      const binary = opts.binary !== false;

      const binChunks = [];
      let byteLength = 0;
      const align4 = (n) => (4 - (n % 4)) % 4;

      const appendBytes = (u8, target) => {
        const offset = byteLength;
        binChunks.push(u8);
        byteLength += u8.byteLength;
        const pad = align4(u8.byteLength);
        if (pad > 0) {
          binChunks.push(new Uint8Array(pad));
          byteLength += pad;
        }
        const bvIdx = bufferViews.length;
        const bv = { buffer: 0, byteOffset: offset, byteLength: u8.byteLength };
        if (target) bv.target = target;
        bufferViews.push(bv);
        return bvIdx;
      };

      const bufferViews = [];
      const accessors = [];
      const images = [];
      const textures = [];
      const samplers = [{ magFilter: WEBGL_CONST.LINEAR, minFilter: WEBGL_CONST.LINEAR_MIPMAP_LINEAR, wrapS: WEBGL_CONST.REPEAT, wrapT: WEBGL_CONST.REPEAT }];
      const materials = [];
      const meshes = [];
      const nodes = [];

      const imgCache = new Map();
      const matCache = new Map();

      const exportCanvasOrImage = (tex) => {
        if (!tex || !tex.image) return undefined;
        const src = tex.image;
        let key = tex.uuid;
        if (src && src.__ch5Key) key = src.__ch5Key;
        if (imgCache.has(key)) return imgCache.get(key);

        let c = src;
        if (!(c instanceof HTMLCanvasElement)) {
          c = document.createElement("canvas");
          c.width = src.width || 256;
          c.height = src.height || 256;
          c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
        }
        // Flip Y into glTF UV convention (flipY = false) so UVs match 1:1
        const flipped = document.createElement("canvas");
        const maxSide = opts.maxTextureSize || 256;
        flipped.width = Math.min(maxSide, c.width);
        flipped.height = Math.min(maxSide, c.height);
        const fctx = flipped.getContext("2d");
        fctx.translate(0, flipped.height);
        fctx.scale(1, -1);
        fctx.drawImage(c, 0, 0, flipped.width, flipped.height);

        const dataUrl = flipped.toDataURL("image/png");
        const b64 = dataUrl.split(",")[1];
        const binStr = atob(b64);
        const u8 = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) u8[i] = binStr.charCodeAt(i);
        const bvIdx = appendBytes(u8);
        const imgIdx = images.length;
        images.push({ bufferView: bvIdx, mimeType: "image/png" });
        const texIdx = textures.length;
        textures.push({ sampler: 0, source: imgIdx });
        imgCache.set(key, texIdx);
        return texIdx;
      };

      const makeTexInfo = (tex) => {
        const idx = exportCanvasOrImage(tex);
        if (idx === undefined) return undefined;
        const info = { index: idx };
        if (tex.repeat && (tex.repeat.x !== 1 || tex.repeat.y !== 1 || tex.offset.x !== 0 || tex.offset.y !== 0)) {
          info.extensions = {
            KHR_texture_transform: {
              offset: [tex.offset.x, tex.offset.y],
              scale: [tex.repeat.x, tex.repeat.y]
            }
          };
        }
        return info;
      };

      const exportMaterial = (mat) => {
        if (!mat) return undefined;
        if (matCache.has(mat.uuid)) return matCache.get(mat.uuid);
        const col = mat.color ? [mat.color.r, mat.color.g, mat.color.b, mat.opacity !== undefined ? mat.opacity : 1] : [1, 1, 1, 1];
        const mDef = {
          name: mat.name || "mat_" + materials.length,
          pbrMetallicRoughness: {
            baseColorFactor: col,
            metallicFactor: typeof mat.metalness === "number" ? mat.metalness : 0.0,
            roughnessFactor: typeof mat.roughness === "number" ? mat.roughness : 0.8
          }
        };
        if (mat.map) {
          const ti = makeTexInfo(mat.map);
          if (ti) mDef.pbrMetallicRoughness.baseColorTexture = ti;
        }
        if (mat.normalMap) {
          const ni = makeTexInfo(mat.normalMap);
          if (ni) {
            if (mat.normalScale) ni.scale = mat.normalScale.x;
            mDef.normalTexture = ni;
          }
        }
        if (mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)) {
          const ei = mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 1;
          mDef.emissiveFactor = [Math.min(1, mat.emissive.r * ei), Math.min(1, mat.emissive.g * ei), Math.min(1, mat.emissive.b * ei)];
          if (mat.emissiveMap) {
            const eti = makeTexInfo(mat.emissiveMap);
            if (eti) mDef.emissiveTexture = eti;
          }
        }
        if (mat.isMeshBasicMaterial) {
          mDef.extensions = { KHR_materials_unlit: {} };
        }
        if (mat.transparent || col[3] < 1) {
          mDef.alphaMode = "BLEND";
        } else if (mat.alphaTest > 0) {
          mDef.alphaMode = "MASK";
          mDef.alphaCutoff = mat.alphaTest;
        }
        if (mat.side === THREE.DoubleSide) mDef.doubleSided = true;

        const mIdx = materials.length;
        materials.push(mDef);
        matCache.set(mat.uuid, mIdx);
        return mIdx;
      };

      const exportAccessor = (arr, itemSize, typeStr, compType, target, calcMinMax) => {
        const typed = arr instanceof Float32Array || arr instanceof Uint32Array || arr instanceof Uint16Array ? arr : new Float32Array(arr);
        const u8 = new Uint8Array(typed.buffer.slice(typed.byteOffset, typed.byteOffset + typed.byteLength));
        const bvIdx = appendBytes(u8, target);
        const count = typed.length / itemSize;
        const acc = { bufferView: bvIdx, componentType: compType, count, type: typeStr };
        if (calcMinMax && count > 0) {
          const min = new Array(itemSize).fill(Infinity);
          const max = new Array(itemSize).fill(-Infinity);
          for (let i = 0; i < count; i++) {
            for (let k = 0; k < itemSize; k++) {
              const v = typed[i * itemSize + k];
              if (v < min[k]) min[k] = v;
              if (v > max[k]) max[k] = v;
            }
          }
          acc.min = min;
          acc.max = max;
        }
        const idx = accessors.length;
        accessors.push(acc);
        return idx;
      };

      const exportMesh = (mesh) => {
        let geo = mesh.geometry;
        if (!geo || !geo.isBufferGeometry) return undefined;
        const pos = geo.attributes.position;
        if (!pos || pos.count === 0) return undefined;

        const attrs = {};
        attrs.POSITION = exportAccessor(new Float32Array(pos.array), 3, "VEC3", WEBGL_CONST.FLOAT, 34962, true);
        if (geo.attributes.normal) {
          attrs.NORMAL = exportAccessor(new Float32Array(geo.attributes.normal.array), 3, "VEC3", WEBGL_CONST.FLOAT, 34962, false);
        }
        if (geo.attributes.uv) {
          attrs.TEXCOORD_0 = exportAccessor(new Float32Array(geo.attributes.uv.array), 2, "VEC2", WEBGL_CONST.FLOAT, 34962, false);
        }

        const prim = { attributes: attrs };
        if (geo.index) {
          const ia = geo.index.array;
          const use32 = ia instanceof Uint32Array || pos.count > 65535;
          const typedIdx = use32 ? new Uint32Array(ia) : new Uint16Array(ia);
          prim.indices = exportAccessor(typedIdx, 1, "SCALAR", use32 ? WEBGL_CONST.UNSIGNED_INT : WEBGL_CONST.UNSIGNED_SHORT, 34963, false);
        }
        if (mesh.isPoints) prim.mode = 0;
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const mIdx = exportMaterial(mat);
        if (mIdx !== undefined) prim.material = mIdx;

        const meshIdx = meshes.length;
        meshes.push({ name: mesh.name || "Mesh_" + meshIdx, primitives: [prim] });
        return meshIdx;
      };

      const exportNode = (obj) => {
        const nDef = { name: obj.name || "Node_" + nodes.length };
        if (obj.position && (obj.position.x !== 0 || obj.position.y !== 0 || obj.position.z !== 0)) {
          nDef.translation = [obj.position.x, obj.position.y, obj.position.z];
        }
        if (obj.quaternion && (obj.quaternion.x !== 0 || obj.quaternion.y !== 0 || obj.quaternion.z !== 0 || obj.quaternion.w !== 1)) {
          nDef.rotation = [obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w];
        }
        if (obj.scale && (obj.scale.x !== 1 || obj.scale.y !== 1 || obj.scale.z !== 1)) {
          nDef.scale = [obj.scale.x, obj.scale.y, obj.scale.z];
        }
        if ((obj.isMesh || obj.isPoints) && !obj.userData.isOutline) {
          const mIdx = exportMesh(obj);
          if (mIdx !== undefined) nDef.mesh = mIdx;
        }
        const nIdx = nodes.length;
        nodes.push(nDef);

        const childIndices = [];
        (obj.children || []).forEach((c) => {
          if (c.userData && c.userData.isOutline) return;
          childIndices.push(exportNode(c));
        });
        if (childIndices.length > 0) nDef.children = childIndices;
        return nIdx;
      };

      const rootIdx = exportNode(input);
      const gltfJson = {
        asset: { version: "2.0", generator: "Cicaww33 Chapter 5 Studio GLTFExporter (r128)" },
        extensionsUsed: ["KHR_texture_transform", "KHR_materials_unlit"],
        scene: 0,
        scenes: [{ name: input.name || "Scene", nodes: [rootIdx] }],
        nodes,
        meshes,
        materials,
        accessors,
        bufferViews,
        buffers: [{ byteLength }]
      };
      if (textures.length > 0) {
        gltfJson.textures = textures;
        gltfJson.images = images;
        gltfJson.samplers = samplers;
      }

      if (!binary) {
        onDone(gltfJson);
        return;
      }

      const jsonBytes = new TextEncoder().encode(JSON.stringify(gltfJson));
      const jsonPad = align4(jsonBytes.byteLength);
      const jsonChunkLen = jsonBytes.byteLength + jsonPad;
      const binPad = align4(byteLength);
      const binChunkLen = byteLength + binPad;
      const totalLen = 12 + 8 + jsonChunkLen + (binChunkLen > 0 ? 8 + binChunkLen : 0);

      const outBuf = new ArrayBuffer(totalLen);
      const dv = new DataView(outBuf);
      const outU8 = new Uint8Array(outBuf);

      // Header
      dv.setUint32(0, 0x46546c67, true);
      dv.setUint32(4, 2, true);
      dv.setUint32(8, totalLen, true);

      // JSON chunk
      dv.setUint32(12, jsonChunkLen, true);
      dv.setUint32(16, 0x4e4f534a, true);
      outU8.set(jsonBytes, 20);
      for (let p = 0; p < jsonPad; p++) outU8[20 + jsonBytes.byteLength + p] = 0x20;

      // BIN chunk
      if (binChunkLen > 0) {
        let off = 20 + jsonChunkLen;
        dv.setUint32(off, binChunkLen, true);
        dv.setUint32(off + 4, 0x004e4942, true);
        off += 8;
        binChunks.forEach((chunk) => {
          outU8.set(chunk, off);
          off += chunk.byteLength;
        });
      }

      onDone(outBuf);
    }
  }

  THREE.GLTFLoader = GLTFLoader;
  THREE.GLTFExporter = GLTFExporter;
})();
