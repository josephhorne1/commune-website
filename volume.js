import * as THREE from "three";
import { FBXLoader } from "./assets/vendor/three/loaders/FBXLoader.js";

const layer = document.querySelector(".volume-layer");
const field = document.querySelector("#garment-field");
const canvas = field?.querySelector(".garment-stage");
const nodes = field ? [...field.querySelectorAll(".garment-node")] : [];

if (layer && field && canvas && nodes.length) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  camera.position.set(0, 0, 15);

  scene.add(new THREE.HemisphereLight(0xfffdf3, 0x77746c, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 3.8);
  key.position.set(4, 7, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdde7ff, 1.8);
  fill.position.set(-6, 1, 5);
  scene.add(fill);

  const garments = Array.from({ length: nodes.length }, (_, index) => ({
    id: String(index + 1).padStart(2, "0"),
    node: nodes[index],
    root: null,
    target: new THREE.Vector3(),
    speed: (0.12 + (index % 7) * 0.018) * (index % 3 === 0 ? -1 : 1),
    phase: index * 0.73,
    loaded: false
  }));

  let started = false;
  let expanded = false;
  let expansion = 0;
  let lastTime = performance.now();

  function resize() {
    const width = Math.max(field.clientWidth, 1);
    const height = Math.max(field.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const distance = camera.position.z;
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
    const visibleWidth = visibleHeight * camera.aspect;
    const compact = camera.aspect < 0.78;
    const columns = compact ? 4 : 5;
    const rows = Math.ceil(garments.length / columns);
    const gridWidth = visibleWidth * (compact ? 0.79 : 0.82);
    const gridHeight = visibleHeight * (compact ? 0.78 : 0.71);

    garments.forEach((garment, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      garment.target.set(
        columns === 1 ? 0 : (column / (columns - 1) - 0.5) * gridWidth,
        rows === 1 ? 0 : (0.5 - row / (rows - 1)) * gridHeight,
        (index % 4 - 1.5) * 0.08
      );
    });
  }

  function normalizeModel(model, index) {
    model.traverse((object) => {
      if (object.isLight || object.isCamera) object.visible = false;
      if (!object.isMesh) return;
      object.frustumCulled = false;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        material.side = THREE.DoubleSide;
        material.transparent = false;
        material.opacity = 1;
        material.alphaTest = 0;
        material.depthWrite = true;
        if (material.color) material.color.set(0xb8b2a6);
        if (material.emissive) {
          material.emissive.set(0x171613);
          material.emissiveIntensity = 0.18;
        }
        if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
        material.needsUpdate = true;
      });
    });

    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);
    const targetSize = camera.aspect < 0.78 ? 1.05 : 1.58;
    const normalizationScale = targetSize / largestDimension;
    model.scale.setScalar(normalizationScale);
    model.position.copy(centre).multiplyScalar(-normalizationScale);

    const root = new THREE.Group();
    root.rotation.x = THREE.MathUtils.degToRad(-4 + (index % 5) * 2);
    root.scale.setScalar(0.001);
    root.add(model);
    scene.add(root);
    return root;
  }

  function loadGarment(garment, index) {
    const base = `assets/volume/ground-zero/${garment.id}/`;
    const loader = new FBXLoader();
    loader.setResourcePath(base);
    return new Promise((resolve) => {
      loader.load(
        `${base}model.fbx`,
        (model) => {
          garment.root = normalizeModel(model, index);
          garment.loaded = true;
          garment.node.classList.add("is-model-ready");
          garment.node.querySelector("i").textContent = "3D garment";
          resolve();
        },
        undefined,
        (error) => {
          console.warn(`Ground Zero ${garment.id} could not be loaded.`, error);
          garment.node.classList.add("is-model-error");
          garment.node.querySelector("i").textContent = "Load unavailable";
          resolve();
        }
      );
    });
  }

  async function loadAllGarments() {
    if (started) return;
    started = true;
    const queue = [...garments.entries()];
    const worker = async () => {
      while (queue.length) {
        const [index, garment] = queue.shift();
        await loadGarment(garment, index);
      }
    };
    await Promise.all(Array.from({ length: 3 }, worker));
  }

  function render(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const desiredExpansion = expanded ? 1 : 0;
    expansion = THREE.MathUtils.damp(expansion, desiredExpansion, expanded ? 5.4 : 7.5, delta);
    if (Math.abs(expansion - desiredExpansion) < 0.001) expansion = desiredExpansion;
    const eased = expansion * expansion * (3 - 2 * expansion);

    garments.forEach((garment, index) => {
      if (!garment.root) return;
      garment.root.position.copy(garment.target).multiplyScalar(eased);
      const displayScale = camera.aspect < 0.78 ? 28 : 42;
      garment.root.scale.setScalar(Math.max(eased * displayScale, 0.001));
      garment.root.rotation.y += delta * garment.speed;
      garment.root.rotation.z = Math.sin(time * 0.00024 + garment.phase) * 0.035;
      garment.root.visible = layer.classList.contains("is-open") || expansion > 0.001;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  const observer = new MutationObserver(() => {
    expanded = layer.classList.contains("is-expanded");
    if (expanded) loadAllGarments();
  });
  observer.observe(layer, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(render);
}
