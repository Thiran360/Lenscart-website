const lerp = (a, b, t) => a + (b - a) * t;

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff >  Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

/**
 * Exponential low-pass filter for a scalar value.
 * alpha: smoothing factor in (0, 1]. Higher = faster response, more jitter.
 */
export class SmoothScalar {
  constructor(alpha = 0.2, initial = 0) {
    this.alpha = alpha;
    this.value = initial;
    this.initialized = false;
  }

  update(target) {
    if (!this.initialized || !isFinite(target)) {
      this.value = target;
      this.initialized = true;
    } else {
      this.value = lerp(this.value, target, this.alpha);
    }
    return this.value;
  }

  reset() { this.initialized = false; }
}

/**
 * Exponential low-pass filter for 3D position vectors.
 * X/Y (screen position) use a slightly faster alpha than Z (depth).
 */
export class SmoothVector3 {
  constructor(alphaXY = 0.25, alphaZ = 0.18) {
    this.alphaXY = alphaXY;
    this.alphaZ  = alphaZ;
    this.x = 0; this.y = 0; this.z = 0;
    this.initialized = false;
  }

  update({ x, y, z }) {
    if (!this.initialized) {
      this.x = x; this.y = y; this.z = z;
      this.initialized = true;
    } else {
      this.x = lerp(this.x, x, this.alphaXY);
      this.y = lerp(this.y, y, this.alphaXY);
      this.z = lerp(this.z, z, this.alphaZ);
    }
    return this;
  }

  reset() { this.initialized = false; }
}

/**
 * Exponential low-pass filter for Euler angles with wrap-around handling on Z.
 */
export class SmoothEuler {
  constructor(alphaXY = 0.2, alphaZ = 0.22) {
    this.alphaXY = alphaXY;
    this.alphaZ  = alphaZ;
    this.x = 0; this.y = 0; this.z = 0;
    this.initialized = false;
  }

  update({ x, y, z }) {
    if (!this.initialized) {
      this.x = x; this.y = y; this.z = z;
      this.initialized = true;
    } else {
      this.x = lerp(      this.x, x, this.alphaXY);
      this.y = lerpAngle( this.y, y, this.alphaXY);
      this.z = lerpAngle( this.z, z, this.alphaZ);
    }
    return this;
  }

  reset() { this.initialized = false; }
}

/** Create a fresh set of per-pose smoothers. */
export function createPoseSmoothers() {
  return {
    position: new SmoothVector3(0.28, 0.20),
    rotation: new SmoothEuler(0.22, 0.25),
    scale:    new SmoothScalar(0.18, 1),
  };
}
