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
    metalness: metal ? 0.85 : 0.08,
    roughness: metal ? 0.22 : 0.38,
  });
}

function createLensMaterial(isSunglasses, sunTintColor) {
  if (isSunglasses) {
    return new THREE.MeshStandardMaterial({
      color: sunTintColor ?? 0x0a1018,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      side: THREE.DoubleSide,
      metalness: 0.1,
      roughness: 0.08,
    });
  }
  // Clear optical lens: subtle glass tint, 100% pupil/face visibility
  return new THREE.MeshStandardMaterial({
    color: 0xd0e8ff,
    transparent: true,
    opacity: 0.10,
    depthWrite: false,
    side: THREE.DoubleSide,
    metalness: 0.0,
    roughness: 0.05,
  });
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
      // Classic Aviator teardrop shape
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
      // Rectangle with rounded corners
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
  const tubeGeo = new THREE.TubeGeometry(curve3D, pts2D.length, rimRadius, 8, true);
  return new THREE.Mesh(tubeGeo, material);
}

// ─── Temple Arms ───────────────────────────────────────────────────────────────

function createTempleArm(side, frameMat, hingeX, armLen) {
  const group = new THREE.Group();
  group.name = side < 0 ? 'temple-left' : 'temple-right';

  // Start at hinge (outer edge of front frame).
  // Curve gently INWARD (-side * offset) to wrap around temples toward ears,
  // then hook downward at the ear tip.
  const p0 = new THREE.Vector3(hingeX,                  0.005,      0.01);
  const p1 = new THREE.Vector3(hingeX - side * 0.03,   -0.008,     -armLen * 0.30);
  const p2 = new THREE.Vector3(hingeX - side * 0.06,   -0.025,     -armLen * 0.68);
  const p3 = new THREE.Vector3(hingeX - side * 0.08,   -0.075,     -armLen * 0.95);

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'chordal', 0.5);
  const tubeRadius = 0.013;
  const tubeGeo = new THREE.TubeGeometry(curve, 20, tubeRadius, 8, false);
  const arm = new THREE.Mesh(tubeGeo, frameMat.clone());
  group.add(arm);

  // Hinge joint sphere
  const hingeGeo = new THREE.SphereGeometry(tubeRadius * 1.3, 8, 8);
  const hinge = new THREE.Mesh(hingeGeo, frameMat.clone());
  hinge.position.copy(p0);
  group.add(hinge);

  return group;
}

// ─── Nose Bridge ───────────────────────────────────────────────────────────────

function createNoseBridge(leftInnerX, rightInnerX, bridgeY, frameMat) {
  const span = rightInnerX - leftInnerX;
  const sagitta = span * 0.22; // slight upward arch

  const p0 = new THREE.Vector3(leftInnerX,  bridgeY,           0.015);
  const p1 = new THREE.Vector3(0,           bridgeY + sagitta, 0.022);
  const p2 = new THREE.Vector3(rightInnerX, bridgeY,           0.015);

  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.013, 8, false);
  return new THREE.Mesh(tubeGeo, frameMat);
}

// ─── Main Procedural AR Glasses Model ─────────────────────────────────────────

/**
 * Construct a 3D AR glasses model.
 * Model Space Normalization:
 *   Left lens center is placed at X = -0.50
 *   Right lens center is placed at X = +0.50
 *   Distance between lens centers = exactly 1.0 unit (IPD = 1.0).
 *   When renderer sets scale = eyeDistancePx, the 3D lens centers land
 *   exactly over the user's pupils!
 */
export function createProceduralGlasses(product, selectedColor) {
  const profile = resolveProfile(product);
  const frameColor = resolveColor(product, selectedColor);
  const isSunglasses = product?.type === 'sunglasses';
  const sunTint = resolveSunTint(selectedColor);

  const group = new THREE.Group();
  group.name = 'glasses-root';

  const frameMat = createFrameMaterial(frameColor);
  const lensMat = createLensMaterial(isSunglasses, isSunglasses ? sunTint : null);

  // Lens centers at -0.50 and +0.50 → IPD = 1.0 unit
  const leftCenterX  = -0.50;
  const rightCenterX =  0.50;

  const lensShape = buildLensPath(profile);
  const lensGeo   = new THREE.ShapeGeometry(lensShape, 64);

  // ── Lenses ──
  const leftLens = new THREE.Mesh(lensGeo, lensMat.clone());
  leftLens.position.set(leftCenterX, 0, 0.005);
  leftLens.name = 'lens-left';
  group.add(leftLens);

  const rightLens = new THREE.Mesh(lensGeo.clone(), lensMat.clone());
  rightLens.position.set(rightCenterX, 0, 0.005);
  rightLens.name = 'lens-right';
  group.add(rightLens);

  // ── Rims ──
  if (profile.lensShape !== 'rimless') {
    const rimTubeR = 0.018;
    const leftRim = createShapeRim(lensShape, rimTubeR, frameMat.clone());
    leftRim.position.set(leftCenterX, 0, 0.012);
    leftRim.name = 'rim-left';
    group.add(leftRim);

    const rightRim = createShapeRim(lensShape, rimTubeR, frameMat.clone());
    rightRim.position.set(rightCenterX, 0, 0.012);
    rightRim.name = 'rim-right';
    group.add(rightRim);
  } else {
    // Rimless screw mounts
    const dotMat = frameMat.clone();
    [leftCenterX, rightCenterX].forEach((cx) => {
      const dot1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), dotMat.clone());
      dot1.position.set(cx - 0.18, 0, 0.015);
      group.add(dot1);
      const dot2 = dot1.clone();
      dot2.position.set(cx + 0.18, 0, 0.015);
      group.add(dot2);
    });
  }

  // ── Inner & Outer rim boundaries ──
  const lensRadius = profile.lensRadius || 0.26;
  const leftInnerX  = leftCenterX  + lensRadius * 0.85; // ~ -0.28
  const rightInnerX = rightCenterX - lensRadius * 0.85; // ~ +0.28
  const leftOuterX  = leftCenterX  - lensRadius * 1.15; // ~ -0.80
  const rightOuterX = rightCenterX + lensRadius * 1.15; // ~ +0.80

  // ── Nose Bridge ──
  const bridgeY = profile.lensShape === 'aviator' ? lensRadius * 0.45 : lensRadius * 0.35;
  const mainBridge = createNoseBridge(leftInnerX, rightInnerX, bridgeY, frameMat.clone());
  group.add(mainBridge);

  // Double bridge top bar for Aviator style
  if (profile.lensShape === 'aviator') {
    const topBarY = lensRadius * 0.65;
    const topBar = createNoseBridge(leftInnerX - 0.05, rightInnerX + 0.05, topBarY, frameMat.clone());
    group.add(topBar);
  }

  // ── Nose Pads ──
  const padMat = new THREE.MeshStandardMaterial({
    color: 0xfffffe,
    transparent: true,
    opacity: 0.65,
    roughness: 0.2,
  });
  [-1, 1].forEach((side) => {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), padMat);
    pad.position.set(side * (rightInnerX * 0.7), -lensRadius * 0.25, 0.02);
    group.add(pad);
  });

  // ── Temple Arms ──
  const armLength = 0.95;
  group.add(createTempleArm(-1, frameMat, leftOuterX,  armLength));
  group.add(createTempleArm( 1, frameMat, rightOuterX, armLength));

  group.userData = {
    type: 'procedural',
    profile,
    frameColor,
    isSunglasses,
    ipdModel: 1.0, // exactly 1.0 unit between lens centers
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

// ─── PNG Overlay Fallback ──────────────────────────────────────────────────────

export async function createPNGGlasses(product, selectedColor) {
  const profile = resolveProfile(product);
  const group = new THREE.Group();
  group.name = 'glasses-root';

  try {
    const loader = new THREE.TextureLoader();
    const texture = await loader.loadAsync(product.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const imgW = texture.image?.width || 600;
    const imgH = texture.image?.height || 200;
    const aspect = imgW / imgH;

    const planeWidth = 2.0;
    const planeHeight = planeWidth / aspect;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0.01);
    mesh.name = 'png-front';
    group.add(mesh);

    group.userData = { type: 'png', url: product.image, ipdModel: 1.0 };
    return group;
  } catch (err) {
    console.warn('[TryOn] PNG texture load failed, using procedural:', err);
    return createProceduralGlasses(product, selectedColor);
  }
}

// ─── Model Resolver ────────────────────────────────────────────────────────────

export async function resolveGlassesModel(product, selectedColor) {
  if (product?.tryOnModel) {
    try {
      return await loadGlassesModel(product.tryOnModel);
    } catch (err) {
      console.warn('[TryOn] GLB load failed, falling back to procedural:', err);
    }
  }

  // Always use 3D procedural AR model:
  // - 100% upright & properly proportioned
  // - 1.0 unit IPD pupil alignment
  // - Extruded 3D rims + nose bridge + silicone nose pads + 3D temple arms
  // - Fully transparent optical lenses (eyes/face visible)
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
