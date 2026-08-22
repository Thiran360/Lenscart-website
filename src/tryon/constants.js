/** MediaPipe Face Landmarker landmark indices used for glasses placement */
export const LANDMARKS = {
  noseTip: 1,
  noseBridge: 168,
  noseTop: 6,
  chin: 152,
  forehead: 10,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  leftTemple: 234,
  rightTemple: 454,
  leftEar: 127,
  rightEar: 356,
  leftCheek: 50,
  rightCheek: 280,
  leftPupil: 468, // if refineLandmarks enabled
  rightPupil: 473, // if refineLandmarks enabled
};

/** Face depth occlusion mesh triangles covering cheeks, temples, ears, and forehead */
export const OCCLUSION_TRIANGLES = [
  // Forehead & Brow
  [10, 338, 297], [338, 10, 109], [109, 10, 151], [151, 10, 337],
  [337, 10, 299], [299, 10, 333], [333, 10, 298], [298, 10, 301],
  [68, 104, 69], [69, 104, 108], [108, 69, 151], [151, 108, 337],
  // Left Temple & Ear Occlusion Zone
  [127, 34, 139], [34, 127, 234], [234, 127, 162], [162, 127, 21],
  [21, 127, 54], [54, 127, 103], [103, 127, 67], [67, 127, 109],
  [234, 93, 132], [93, 234, 127], [50, 101, 36], [101, 50, 123],
  [234, 127, 116], [116, 127, 117], [117, 127, 118], [118, 127, 119],
  // Right Temple & Ear Occlusion Zone
  [356, 264, 368], [264, 356, 454], [454, 356, 389], [389, 356, 251],
  [251, 356, 284], [284, 356, 332], [332, 356, 297], [297, 356, 338],
  [454, 323, 361], [323, 454, 356], [280, 330, 266], [330, 280, 352],
  [454, 356, 345], [345, 356, 346], [346, 356, 347], [347, 356, 348],
  // Jawline & Chin
  [152, 377, 400], [377, 152, 148], [148, 152, 176], [176, 152, 149],
  [176, 149, 150], [150, 149, 136], [136, 149, 172], [172, 149, 58]
];

/** Default fine-tuning adjustments */
export const DEFAULT_ADJUSTMENTS = {
  scaleMultiplier: 1.0,
  verticalOffset: 0.0,
  horizontalOffset: 0.0,
  tiltOffset: 0.0,
};

/** Product shape → procedural 3D model profile */
export const SHAPE_PROFILES = {
  round: { lensShape: 'round', frameWidth: 1.38, lensRadius: 0.28, bridgeWidth: 0.12, thickness: 0.04 },
  rectangle: { lensShape: 'rect', frameWidth: 1.44, lensRadius: 0.25, bridgeWidth: 0.14, thickness: 0.04 },
  wayfarer: { lensShape: 'wayfarer', frameWidth: 1.46, lensRadius: 0.27, bridgeWidth: 0.13, thickness: 0.05 },
  aviator: { lensShape: 'aviator', frameWidth: 1.50, lensRadius: 0.32, bridgeWidth: 0.10, thickness: 0.03 },
  oval: { lensShape: 'oval', frameWidth: 1.40, lensRadius: 0.24, bridgeWidth: 0.12, thickness: 0.04 },
  square: { lensShape: 'rect', frameWidth: 1.42, lensRadius: 0.26, bridgeWidth: 0.14, thickness: 0.05 },
  'cat eye': { lensShape: 'catEye', frameWidth: 1.44, lensRadius: 0.26, bridgeWidth: 0.12, thickness: 0.04 },
  rimless: { lensShape: 'rimless', frameWidth: 1.36, lensRadius: 0.25, bridgeWidth: 0.16, thickness: 0.02 },
};

export const DEFAULT_SHAPE_PROFILE = SHAPE_PROFILES.rectangle;

