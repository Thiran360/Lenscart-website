import * as THREE from 'three';
import { OCCLUSION_TRIANGLES } from './constants';
import { createPoseSmoothers } from './smoothing';
import { applyAdjustments, landmarksToFaceGeometry } from './headPose';
import { disposeGlassesModel, resolveGlassesModel } from './glassesFactory';

/**
 * Three.js renderer: transparent overlay on top of webcam video.
 *
 * Renders:
 *   1. Face occlusion mesh (depth write, no color write) — masks temple arms
 *      that pass behind the user's face/ears.
 *   2. Glasses group (color write, depth test) — visible glasses on face.
 *
 * The renderer canvas sits absolutely on top of the <video> element with
 * pointer-events: none, so the video always shows through the transparent
 * canvas background.
 */
export class TryOnRenderer {
  constructor(container) {
    this.container = container;
    this.video     = null;
    this.mirrored  = true;
    this.adjustments = {};
    this.smoothers = createPoseSmoothers();

    this.width  = 640;
    this.height = 480;

    this._initRenderer();
    this._initScene();
  }

  // ── Renderer ───────────────────────────────────────────────────────────────

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha:                true,   // transparent canvas background
      antialias:            true,
      preserveDrawingBuffer: true,  // needed for screenshot capture
      powerPreference:      'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // fully transparent
    this.renderer.outputColorSpace    = THREE.SRGBColorSpace;
    this.renderer.toneMapping         = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.className = 'tryon-webgl-canvas';
    this.container.appendChild(this.renderer.domElement);
  }

  // ── Scene ──────────────────────────────────────────────────────────────────

  _initScene() {
    this.scene = new THREE.Scene();

    // Orthographic camera: 1 unit = 1 video pixel at the default view bounds.
    this.camera = new THREE.OrthographicCamera(
      -this.width  / 2,
       this.width  / 2,
       this.height / 2,
      -this.height / 2,
      0.1,
      3000
    );
    this.camera.position.z = 1000;

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd0e8ff, 0.6);
    fill.position.set(-3, -1, 3);
    this.scene.add(fill);

    const specLight = new THREE.PointLight(0xffffff, 0.8, 1500);
    specLight.position.set(0, 50, 600);
    this.scene.add(specLight);

    // ── Face occlusion mesh ───────────────────────────────────────────────────
    // colorWrite:false means it's invisible but writes to the depth buffer.
    // Renders first (renderOrder:0) so subsequent glasses are depth-tested
    // against the face surface — temple arms that go behind the face/ears
    // are correctly hidden.
    this.faceOcclusionMesh = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        colorWrite: false,
        depthWrite: true,
        side: THREE.DoubleSide,
      })
    );
    this.faceOcclusionMesh.renderOrder = 0;
    this.scene.add(this.faceOcclusionMesh);

    // ── Glasses group ─────────────────────────────────────────────────────────
    this.glassesGroup = new THREE.Group();
    this.glassesGroup.renderOrder = 1;
    this.scene.add(this.glassesGroup);
    this.glassesModel = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  setVideo(video) {
    this.video = video;
  }

  setMirrored(mirrored) {
    this.mirrored = mirrored;
  }

  setAdjustments(adjustments) {
    this.adjustments = adjustments;
  }

  async setProduct(product, selectedColor) {
    // Remove previous model
    if (this.glassesModel) {
      this.glassesGroup.remove(this.glassesModel);
      disposeGlassesModel(this.glassesModel);
      this.glassesModel = null;
    }
    // Load new model
    this.glassesModel = await resolveGlassesModel(product, selectedColor);
    this.glassesGroup.add(this.glassesModel);
    // Reset smoothers so there's no jump from old position
    this.smoothers = createPoseSmoothers();
  }

  // ── Resize / projection sync ───────────────────────────────────────────────

  resize() {
    if (!this.container || !this.video) return;
    const rect = this.container.getBoundingClientRect();
    const cw   = rect.width;
    const ch   = rect.height;
    if (cw === 0 || ch === 0) return;

    const vw = this.video.videoWidth  || 640;
    const vh = this.video.videoHeight || 480;

    this.width  = vw;
    this.height = vh;

    this.renderer.setSize(cw, ch);

    // The webcam video uses object-fit: cover — we must match the same crop.
    const containerAspect = cw / ch;
    const videoAspect     = vw / vh;

    let viewW = vw;
    let viewH = vh;

    if (containerAspect > videoAspect) {
      // Container is wider — video is letterboxed; visible video height is shrunk
      viewH = vw / containerAspect;
    } else {
      // Container is taller — visible video width is shrunk
      viewW = vh * containerAspect;
    }

    // Set orthographic frustum to match visible video area
    // 1 unit = 1 pixel of the video frame
    this.camera.left   = -viewW / 2;
    this.camera.right  =  viewW / 2;
    this.camera.top    =  viewH / 2;
    this.camera.bottom = -viewH / 2;
    this.camera.updateProjectionMatrix();
  }

  // ── Per-frame updates ──────────────────────────────────────────────────────

  updateFaceMesh(landmarks) {
    if (!landmarks) return;
    const oldGeo = this.faceOcclusionMesh.geometry;
    this.faceOcclusionMesh.geometry = landmarksToFaceGeometry(
      landmarks,
      this.width,
      this.height,
      this.mirrored,
      OCCLUSION_TRIANGLES
    );
    oldGeo?.dispose();
  }

  updateGlassesPose(rawPose) {
    if (!rawPose || !this.glassesModel) return;

    const pose  = applyAdjustments(rawPose, this.adjustments, this.width);

    // Smooth all values to eliminate landmark jitter
    const pos   = this.smoothers.position.update(pose.position);
    const rot   = this.smoothers.rotation.update(pose.rotation);
    const scale = this.smoothers.scale.update(pose.scale);

    this.glassesGroup.position.set(pos.x, pos.y, pos.z);
    this.glassesGroup.rotation.set(rot.x, rot.y, rot.z, 'YXZ');
    this.glassesGroup.scale.setScalar(scale);
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  captureDataUrl(type = 'image/jpeg', quality = 0.95) {
    return this.renderer.domElement.toDataURL(type, quality);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  dispose() {
    if (this.glassesModel) {
      this.glassesGroup.remove(this.glassesModel);
      disposeGlassesModel(this.glassesModel);
      this.glassesModel = null;
    }

    if (this.faceOcclusionMesh.geometry.index ||
        this.faceOcclusionMesh.geometry.attributes.position) {
      this.faceOcclusionMesh.geometry.dispose();
    }
    this.faceOcclusionMesh.material.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
