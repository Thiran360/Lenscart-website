import * as THREE from 'three';
import { LANDMARKS } from './constants';

/**
 * Compute precise, stable head pose from MediaPipe Face Mesh landmarks.
 *
 * GUARANTEED UPRIGHT ORIENTATION & PERFECT FIT ON FACE:
 *   - Screen pixel space: +X right, +Y DOWN (0 at top of video).
 *   - Three.js orthographic: +X right, +Y UP (0 at center), +Z out towards viewer.
 *   - Screen left eye has smaller X coordinate, Screen right eye has larger X coordinate.
 *   - dx = screenRightEye.x - screenLeftEye.x > 0 (ALWAYS POSITIVE).
 *   - Roll (rotZ) = atan2(screenLeftEye.y - screenRightEye.y, dx)
 *     Guarantees rotZ is ALWAYS bounded within [-45°, +45°] (NEVER upside down or spinning!).
 *   - IPD Scaling: scale = eyeDistance (pixels). 1 model unit = 1 pixel pupil distance.
 *     Left lens center aligns with left eye, right lens center aligns with right eye.
 */
export function computeHeadPose(landmarks, transformMatrix, videoWidth, videoHeight, mirrored) {
  if (!landmarks || landmarks.length < 400) return null;

  const lm = (idx) => landmarks[idx] || landmarks[0];

  const toPixel = (pt) => {
    let x = pt.x * videoWidth;
    const y = pt.y * videoHeight;
    if (mirrored) x = videoWidth - x;
    return { x, y, z: pt.z * videoWidth };
  };

  // ── Eye landmarks ──────────────────────────────────────────────────────────
  const leftEyeOuter  = toPixel(lm(LANDMARKS.leftEyeOuter));
  const leftEyeInner  = toPixel(lm(LANDMARKS.leftEyeInner));
  const rightEyeOuter = toPixel(lm(LANDMARKS.rightEyeOuter));
  const rightEyeInner = toPixel(lm(LANDMARKS.rightEyeInner));

  // Prefer refined iris landmarks (index 468 / 473) when available
  const leftPupilRaw  = landmarks[LANDMARKS.leftPupil];
  const rightPupilRaw = landmarks[LANDMARKS.rightPupil];

  const eyeA = leftPupilRaw
    ? toPixel(leftPupilRaw)
    : { x: (leftEyeOuter.x  + leftEyeInner.x)  / 2,
        y: (leftEyeOuter.y  + leftEyeInner.y)  / 2,
        z: (leftEyeOuter.z  + leftEyeInner.z)  / 2 };

  const eyeB = rightPupilRaw
    ? toPixel(rightPupilRaw)
    : { x: (rightEyeOuter.x + rightEyeInner.x) / 2,
        y: (rightEyeOuter.y + rightEyeInner.y) / 2,
        z: (rightEyeOuter.z + rightEyeInner.z) / 2 };

  // Determine screen-left (smaller X) and screen-right (larger X) eyes
  const screenLeftEye  = eyeA.x <= eyeB.x ? eyeA : eyeB;
  const screenRightEye = eyeA.x <= eyeB.x ? eyeB : eyeA;

  // ── Nose & Temple landmarks ───────────────────────────────────────────────
  const noseBridge = toPixel(lm(LANDMARKS.noseBridge));  // landmark 168: between brows
  const noseTop    = toPixel(lm(LANDMARKS.noseTop));     // landmark 6
  const noseTip    = toPixel(lm(LANDMARKS.noseTip));     // landmark 1
  const templeA    = toPixel(lm(LANDMARKS.leftTemple));
  const templeB    = toPixel(lm(LANDMARKS.rightTemple));

  const screenLeftTemple  = templeA.x <= templeB.x ? templeA : templeB;
  const screenRightTemple = templeA.x <= templeB.x ? templeB : templeA;

  // ── Eye Midpoint & Inter-pupillary distance ────────────────────────────────
  const eyeMidX = (screenLeftEye.x + screenRightEye.x) / 2;
  const eyeMidY = (screenLeftEye.y + screenRightEye.y) / 2;
  const eyeMidZ = (screenLeftEye.z + screenRightEye.z) / 2;

  const dx = screenRightEye.x - screenLeftEye.x;
  const dy = screenRightEye.y - screenLeftEye.y;
  const eyeDistance = Math.hypot(dx, dy) || 1;
  const faceWidth   = Math.hypot(screenRightTemple.x - screenLeftTemple.x, screenRightTemple.y - screenLeftTemple.y) || 1;

  // ── Glasses anchor position ───────────────────────────────────────────────
  // Sits right on nose bridge at pupil baseline
  const bridgeX = eyeMidX;
  const bridgeY = eyeMidY * 0.85 + noseBridge.y * 0.15;

  const cx = videoWidth  / 2;
  const cy = videoHeight / 2;

  const position = {
    x:  bridgeX - cx,
    y: -(bridgeY - cy), // Three.js Y is UP (+Y)
    z: -(noseBridge.z * 0.5),
  };

  // ── Scale ─────────────────────────────────────────────────────────────────
  // Model IPD = 1.0 unit. Setting scale = eyeDistance matches 3D lens centers directly to pupils.
  const scale = eyeDistance;

  // ── Head rotation ─────────────────────────────────────────────────────────
  // 1. Roll (rotZ): Head tilt angle
  // Screen Y is down (+Y down), so screenLeftEye.y - screenRightEye.y gives Three.js (+Y up) delta.
  // dx is guaranteed > 0, so atan2 returns values strictly in [-90°, +90°]. No 180° flips or spinning!
  let rotZ = Math.atan2(screenLeftEye.y - screenRightEye.y, dx);
  rotZ = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotZ));

  // 2. Yaw (rotY): Left-right head turn angle
  const distL = Math.hypot(noseBridge.x - screenLeftTemple.x,  noseBridge.y - screenLeftTemple.y);
  const distR = Math.hypot(screenRightTemple.x - noseBridge.x, screenRightTemple.y - noseBridge.y);
  const yawRatio = (distL - distR) / (distL + distR || 1);
  let rotY = yawRatio * 1.1;
  rotY = Math.max(-0.7, Math.min(0.7, rotY));

  // 3. Pitch (rotX): Up-down head tilt angle
  const eyeNoseSpanY = Math.abs(noseTip.y - eyeMidY) || 1;
  // Subtract baseline nose protrusion (~0.035 * videoWidth) so a forward face has ~0 pitch
  const relNoseZ = (noseTip.z - eyeMidZ) + (videoWidth * 0.035);
  let rotX = Math.atan2(relNoseZ, eyeNoseSpanY) * 0.45;
  rotX = Math.max(-0.45, Math.min(0.45, rotX));

  return {
    position,
    rotation: { x: rotX, y: rotY, z: rotZ },
    scale,
    faceWidth,
    eyeDistance,
    landmarks: { leftEye: screenLeftEye, rightEye: screenRightEye, noseBridge, noseTip, leftTemple: screenLeftTemple, rightTemple: screenRightTemple },
    pixelLandmarks: landmarks.map(toPixel),
  };
}

// ── Fine-tuning adjustments ───────────────────────────────────────────────────

export function applyAdjustments(pose, adjustments, videoWidth) {
  const {
    scaleMultiplier  = 1,
    verticalOffset   = 0,
    horizontalOffset = 0,
    tiltOffset       = 0,
  } = adjustments;

  const offsetScale = videoWidth * 0.12;

  return {
    ...pose,
    position: {
      x: pose.position.x + horizontalOffset * offsetScale,
      y: pose.position.y - verticalOffset   * offsetScale,
      z: pose.position.z,
    },
    rotation: {
      ...pose.rotation,
      z: pose.rotation.z + tiltOffset,
    },
    scale: pose.scale * scaleMultiplier,
  };
}

// ── Face occlusion geometry ───────────────────────────────────────────────────

export function landmarksToFaceGeometry(landmarks, videoWidth, videoHeight, mirrored, triangles) {
  const uniqueIndices = new Set();
  triangles.forEach(([a, b, c]) => {
    uniqueIndices.add(a);
    uniqueIndices.add(b);
    uniqueIndices.add(c);
  });

  const indexMap = new Map();
  const verts    = [];
  let vi = 0;

  uniqueIndices.forEach((idx) => {
    indexMap.set(idx, vi++);
    const pt = landmarks[idx] || landmarks[0];
    let x  = pt.x * videoWidth  - videoWidth  / 2;
    let y  = -(pt.y * videoHeight - videoHeight / 2);
    const z = -pt.z * videoWidth * 0.75;
    if (mirrored) x = -x;
    verts.push(x, y, z);
  });

  const indices = [];
  triangles.forEach(([a, b, c]) => {
    indices.push(indexMap.get(a), indexMap.get(b), indexMap.get(c));
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
