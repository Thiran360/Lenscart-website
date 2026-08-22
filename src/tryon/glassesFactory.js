import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DEFAULT_SHAPE_PROFILE, SHAPE_PROFILES } from './constants';

// ─── Color & Tint Maps ─────────────────────────────────────────────────────────

const colorMap = {
  black: 0x1a1a1a,
  grey: 0x666666,
  gray: 0x666666,
  silver: 0xd0d0d0,
  gold: 0xd4af37,
  red: 0xaa1111,
  blue: 0x1e3799,
  green: 0x10683c,
  pink: 0xe84393,
  brown: 0x5c3a21,
  transparent: 0xf1f2f6,
  white: 0xfafafa,
  yellow: 0xfbc531,
  purple: 0x6c5ce7,
  tortoise: 0x3d2314,
};

const sunTintMap = {
  black: 0x0a1018,
  grey: 0x1a2028,
  gray: 0x1a2028,
  gold: 0x1c1400,
  brown: 0x1a0e04,
  blue: 0x021028,
  green: 0x021c0c,
  red: 0x240206,
  pink: 0x200214,
};

function resolveColor(product, selectedColor) {
  const name = (selectedColor || product?.colors?.[0] || 'black').toLowerCase();
  return colorMap[name] ?? 0x1a1a1a;
}

function resolveSunTint(selectedColor) {
  const name = (selectedColor || 'black').toLowerCase();
  return sunTintMap[name] ?? 0x0a1018;
}

function resolveProfile(product) {
  const shape = (product?.shape || 'rectangle').toLowerCase();
  for (const [key, profile] of Object.entries(SHAPE_PROFILES)) {
    if (shape.includes(key)) return profile;
  }
  return DEFAULT_SHAPE_PROFILE;
}

function isMetalColor(hex) {
  return hex === 0xd0d0d0 || hex === 0xd4af37 || hex === 0x666666;
}

// ─── Materials ─────────────────────────────────────────────────────────────────

function createFrameMaterial(color) {
  const metal = isMetalColor(color);
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal ? 0.85 : 0.12,
    roughness: metal ? 0.22 : 0.32,
  });
}

function createLensMaterial(isSunglasses, sunTintColor) {
  if (isSunglasses) {
    return new THREE.MeshStandardMaterial({
      color: sunTintColor ?? 0x0a1018,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      side: THREE.DoubleSide,
      metalness: 0.1,
      roughness: 0.05,
    });
  }
  // Clear optical lens: subtle AR coating cyan/blue tint, 100% pupil/face visibility
  return new THREE.MeshStandardMaterial({
    color: 0xd0f0ff,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
    metalness: 0.0,
    roughness: 0.03,
  });
}

// ─── Dynamic Canvas Textures for Photorealism ─────────────────────────────────

let cachedShadowTexture = null;
function getShadowTexture() {
  if (cachedShadowTexture) return cachedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dual radial shadow (soft drop shadows under left and right lenses/bridge)
  const gradL = ctx.createRadialGradient(160, 128, 10, 160, 128, 140);
  gradL.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  gradL.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
  gradL.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradL;
  ctx.beginPath();
  ctx.arc(160, 128, 140, 0, Math.PI * 2);
  ctx.fill();

  const gradR = ctx.createRadialGradient(352, 128, 10, 352, 128, 140);
  gradR.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  gradR.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
  gradR.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradR;
  ctx.beginPath();
  ctx.arc(352, 128, 140, 0, Math.PI * 2);
  ctx.fill();

  cachedShadowTexture = new THREE.CanvasTexture(canvas);
  return cachedShadowTexture;
}

let cachedGlareTexture = null;
function getGlareTexture() {
  if (cachedGlareTexture) return cachedGlareTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Anti-reflective glare sheen across glass
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.40, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(0.50, 'rgba(255, 255, 255, 0.35)');
  grad.addColorStop(0.60, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedGlareTexture = new THREE.CanvasTexture(canvas);
  return cachedGlareTexture;
}

function createFacialDropShadowMesh() {
  const geo = new THREE.PlaneGeometry(2.4, 1.2);
  const mat = new THREE.MeshBasicMaterial({
    map: getShadowTexture(),
    transparent: true,
    opacity: 0.40,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const shadowMesh = new THREE.Mesh(geo, mat);
  shadowMesh.position.set(0, -0.05, -0.04);
  shadowMesh.name = 'face-drop-shadow';
  return shadowMesh;
}

function createGlassReflectionMesh(centerX, radius, isSunglasses, sunTint) {
  const group = new THREE.Group();
  group.position.set(centerX, 0, 0.008);

  // Curved Glass Lens Base
  const lensGeo = new THREE.SphereGeometry(radius * 1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const lensMat = createLensMaterial(isSunglasses, sunTint);
  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.rotation.x = Math.PI / 2;
  lensMesh.scale.z = 0.01;
  group.add(lensMesh);

  // Anti-reflective Specular Glare Ring
  const glareGeo = new THREE.PlaneGeometry(radius * 2.1, radius * 2.1);
  const glareMat = new THREE.MeshBasicMaterial({
    map: getGlareTexture(),
    transparent: true,
    opacity: isSunglasses ? 0.35 : 0.55,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const glareMesh = new THREE.Mesh(glareGeo, glareMat);
  glareMesh.position.set(0, 0, 0.003);
  group.add(glareMesh);

  return group;
}

// ─── Lens Shape Paths (Centered at pupil origin 0,0) ───────────────────────────

function buildLensPath(profile) {
  const r = profile.lensRadius || 0.26;
  switch (profile.lensShape) {
    case 'round': {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, r, 0, Math.PI * 2, false);
      return shape;
    }
    case 'aviator': {
      const shape = new THREE.Shape();
      const w = r * 1.05;
      const h = r * 0.95;
      shape.moveTo(-w * 0.85, h * 0.55);
      shape.lineTo(w * 0.85, h * 0.55);
      shape.quadraticCurveTo(w * 1.08, -h * 0.25, w * 0.68, -h * 0.95);
      shape.quadraticCurveTo(0, -h * 1.15, -w * 0.68, -h * 0.95);
      shape.quadraticCurveTo(-w * 1.08, -h * 0.25, -w * 0.85, h * 0.55);
      shape.closePath();
      return shape;
    }
    case 'oval': {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, r * 1.12, r * 0.78, 0, Math.PI * 2, false, 0);
      return shape;
    }
    case 'wayfarer': {
      const shape = new THREE.Shape();
      const w = r * 1.08;
      const h = r * 0.88;
      shape.moveTo(-w, h * 0.55);
      shape.lineTo(w, h * 0.55);
      shape.lineTo(w * 0.88, -h * 0.82);
      shape.quadraticCurveTo(0, -h * 1.02, -w * 0.88, -h * 0.82);
      shape.closePath();
      return shape;
    }
    case 'catEye': {
      const shape = new THREE.Shape();
      const w = r * 1.08;
      const h = r * 0.82;
      shape.moveTo(-w, 0);
      shape.quadraticCurveTo(-w * 0.3, h * 1.10, w * 0.70, h * 0.88);
      shape.lineTo(w * 1.08, h * 0.22);
      shape.quadraticCurveTo(w * 0.78, -h * 0.88, 0, -h * 0.88);
      shape.quadraticCurveTo(-w * 0.78, -h * 0.78, -w, 0);
      shape.closePath();
      return shape;
    }
    case 'rimless': {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, r * 0.98, r * 0.72, 0, Math.PI * 2, false, 0);
      return shape;
    }
    default: {
      const shape = new THREE.Shape();
      const w = r * 1.05;
      const h = r * 0.78;
      const cr = r * 0.14;
      shape.moveTo(-w + cr, h);
      shape.lineTo(w - cr, h);
      shape.quadraticCurveTo(w, h, w, h - cr);
      shape.lineTo(w, -h + cr);
      shape.quadraticCurveTo(w, -h, w - cr, -h);
      shape.lineTo(-w + cr, -h);
      shape.quadraticCurveTo(-w, -h, -w, -h + cr);
      shape.lineTo(-w, h - cr);
      shape.quadraticCurveTo(-w, h, -w + cr, h);
      shape.closePath();
      return shape;
    }
  }
}

function shapeToPoints(shape, divisions = 64) {
  return shape.getPoints(divisions);
}

function createShapeRim(lensShape, rimRadius, material) {
  const pts2D = shapeToPoints(lensShape, 80);
  const curve3D = new THREE.CatmullRomCurve3(
    pts2D.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    true,
    'catmullrom',
    0.0
  );
  const tubeGeo = new THREE.TubeGeometry(curve3D, pts2D.length, rimRadius, 10, true);
  return new THREE.Mesh(tubeGeo, material);
}

// ─── Temple Arms ───────────────────────────────────────────────────────────────

function createTempleArm(side, frameMat, hingeX, armLen) {
  const group = new THREE.Group();
  group.name = side < 0 ? 'temple-left' : 'temple-right';

  const p0 = new THREE.Vector3(hingeX,                  0.005,      0.01);
  const p1 = new THREE.Vector3(hingeX - side * 0.03,   -0.008,     -armLen * 0.30);
  const p2 = new THREE.Vector3(hingeX - side * 0.06,   -0.025,     -armLen * 0.68);
  const p3 = new THREE.Vector3(hingeX - side * 0.08,   -0.075,     -armLen * 0.95);

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'chordal', 0.5);
  const tubeRadius = 0.014;
  const tubeGeo = new THREE.TubeGeometry(curve, 24, tubeRadius, 8, false);
  const arm = new THREE.Mesh(tubeGeo, frameMat.clone());
  group.add(arm);

  const hingeGeo = new THREE.SphereGeometry(tubeRadius * 1.3, 10, 10);
  const hinge = new THREE.Mesh(hingeGeo, frameMat.clone());
  hinge.position.copy(p0);
  group.add(hinge);

  return group;
}

// ─── Nose Bridge ───────────────────────────────────────────────────────────────

function createNoseBridge(leftInnerX, rightInnerX, bridgeY, frameMat) {
  const span = rightInnerX - leftInnerX;
  const sagitta = span * 0.22;

  const p0 = new THREE.Vector3(leftInnerX,  bridgeY,           0.015);
  const p1 = new THREE.Vector3(0,           bridgeY + sagitta, 0.022);
  const p2 = new THREE.Vector3(rightInnerX, bridgeY,           0.015);

  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.014, 8, false);
  return new THREE.Mesh(tubeGeo, frameMat);
}

// ─── Zenni-Style Photorealistic HD Frame Model ────────────────────────────────

export async function createHDTexturedGlasses(product, selectedColor) {
  const profile = resolveProfile(product);
  const isSunglasses = product?.type === 'sunglasses';
  const sunTint = resolveSunTint(selectedColor);
  const frameColor = resolveColor(product, selectedColor);

  const group = new THREE.Group();
  group.name = 'glasses-root';

  // 1. Add Facial Drop Shadow Plane (casts dark shadow on nose & cheeks)
  group.add(createFacialDropShadowMesh());

  // Glass Reflection Mesh removed from HD textured glasses to prevent black ovals

  // 3. Load High-Resolution Catalog Product Texture
  try {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(product.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const imgW = texture.image?.width || 600;
    const imgH = texture.image?.height || 200;

    // Detect actual opaque bounds to compensate for transparent/white padding
    const canvas = document.createElement('canvas');
    canvas.width = imgW;
    canvas.height = imgH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0, imgW, imgH);
    const data = ctx.getImageData(0, 0, imgW, imgH).data;

    let minX = imgW, maxX = 0, minY = imgH, maxY = 0;
    let found = false;
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        const i = (y * imgW + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        // Check for non-transparent AND non-white pixels
        const isOpaque = a > 20 && !(r > 240 && g > 240 && b > 240);
        if (isOpaque) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }
    
    if (!found) {
      minX = 0; maxX = imgW; minY = 0; maxY = imgH;
    }

    const contentWidth = maxX - minX;
    const trueCenterX = (minX + maxX) / 2;
    const trueCenterY = (minY + maxY) / 2;

    // Lenses are typically at 25% and 75% of the TRUE glasses width. Distance = 50% of width.
    const ipdPixels = contentWidth * 0.50;
    // We want 1.0 units in 3D to match the distance between lenses
    const unitsPerPixel = 1.0 / ipdPixels;

    const planeWidth = imgW * unitsPerPixel;
    const planeHeight = imgH * unitsPerPixel;

    const frontGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(frameColor).lerp(new THREE.Color(0xffffff), 0.3), // Tint the image with the selected color
      transparent: true,
      alphaTest: 0.02,
      depthWrite: true,
      side: THREE.DoubleSide,
      roughness: 0.25,
      metalness: isMetalColor(frameColor) ? 0.6 : 0.05,
    });

    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    
    // Offset the mesh so the TRUE glasses center is exactly at (0,0)
    const imageCenterX = imgW / 2;
    const imageCenterY = imgH / 2;
    const offsetX = (imageCenterX - trueCenterX) * unitsPerPixel;
    const offsetY = -(imageCenterY - trueCenterY) * unitsPerPixel; // ThreeJS Y is UP

    frontMesh.position.set(offsetX, offsetY, 0.012);
    frontMesh.name = 'hd-front-frame';
    group.add(frontMesh);

  } catch (err) {
    console.warn('[TryOn] HD Product texture load failed, building procedural frame:', err);
  }

  // Procedural arms removed from HD texture model to prevent extra lines

  // Removed 3D components from HD image for a cleaner look

  group.userData = {
    type: 'hd-textured',
    profile,
    frameColor,
    isSunglasses,
    ipdModel: 1.0, // 1.0 unit between lens centers
  };

  return group;
}

// ─── Procedural 3D Model Fallback ─────────────────────────────────────────────

export function createProceduralGlasses(product, selectedColor) {
  const profile = resolveProfile(product);
  const frameColor = resolveColor(product, selectedColor);
  const isSunglasses = product?.type === 'sunglasses';
  const sunTint = resolveSunTint(selectedColor);

  const group = new THREE.Group();
  group.name = 'glasses-root';

  const frameMat = createFrameMaterial(frameColor);

  // Facial Drop Shadow
  group.add(createFacialDropShadowMesh());

  const leftCenterX  = -0.50;
  const rightCenterX =  0.50;
  const lensRadius = profile.lensRadius || 0.26;

  // Lenses & Reflections
  group.add(createGlassReflectionMesh(leftCenterX, lensRadius, isSunglasses, sunTint));
  group.add(createGlassReflectionMesh(rightCenterX, lensRadius, isSunglasses, sunTint));

  // Rims
  const lensShape = buildLensPath(profile);
  if (profile.lensShape !== 'rimless') {
    const rimTubeR = 0.020;
    const leftRim = createShapeRim(lensShape, rimTubeR, frameMat.clone());
    leftRim.position.set(leftCenterX, 0, 0.014);
    leftRim.name = 'rim-left';
    group.add(leftRim);

    const rightRim = createShapeRim(lensShape, rimTubeR, frameMat.clone());
    rightRim.position.set(rightCenterX, 0, 0.014);
    rightRim.name = 'rim-right';
    group.add(rightRim);
  }

  // Nose Bridge & Arms
  const leftInnerX  = leftCenterX  + lensRadius * 0.85;
  const rightInnerX = rightCenterX - lensRadius * 0.85;
  const bridgeY = profile.lensShape === 'aviator' ? lensRadius * 0.45 : lensRadius * 0.35;
  
  // Nose bridge removed as per user request for style

  const leftOuterX  = leftCenterX  - lensRadius * 1.15;
  const rightOuterX = rightCenterX + lensRadius * 1.15;
  const armLength = 0.95;

  group.add(createTempleArm(-1, frameMat, leftOuterX,  armLength));
  group.add(createTempleArm( 1, frameMat, rightOuterX, armLength));

  group.userData = {
    type: 'procedural',
    profile,
    frameColor,
    isSunglasses,
    ipdModel: 1.0,
  };

  return group;
}

// ─── GLB / GLTF loader ─────────────────────────────────────────────────────────

export async function loadGlassesModel(url) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.name = 'glasses-root';

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = false;
      if (child.material) {
        child.material.side = THREE.DoubleSide;
      }
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.userData = { type: 'gltf', url, ipdModel: size.x * 0.55 };
  return model;
}

// ─── Model Resolver ────────────────────────────────────────────────────────────

export async function resolveGlassesModel(product, selectedColor) {
  if (product?.tryOnModel) {
    try {
      return await loadGlassesModel(product.tryOnModel);
    } catch (err) {
      console.warn('[TryOn] GLB load failed, falling back to photorealistic HD:', err);
    }
  }

  if (product?.image) {
    try {
      return await createHDTexturedGlasses(product, selectedColor);
    } catch (err) {
      console.warn('[TryOn] HD Textured load failed, using procedural fallback:', err);
    }
  }

  return createProceduralGlasses(product, selectedColor);
}

// ─── Disposal ──────────────────────────────────────────────────────────────────

export function disposeGlassesModel(model) {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material?.dispose();
      }
    }
  });
}
