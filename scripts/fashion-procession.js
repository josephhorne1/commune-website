let THREE;
let GLTFLoader;
let MeshoptDecoder;
let FASHION_SCULPTURE_CYCLE_MS;
let fashionSculptures;

const procession = document.querySelector("[data-fashion-procession]");

if (procession) {
  procession.dataset.state = "booting";
  initialiseFashionProcession(procession).catch((error) => {
    console.error("Fashion sculpture procession could not start.", error);
    procession.dataset.state = "unavailable";
    procession.dataset.error = error?.message || "Unknown renderer error";
  });
}

async function initialiseFashionProcession(root) {
  const [threeModule, loaderModule, meshoptModule, manifestModule] =
    await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
      import("../assets/models/fashion-sculptures/manifest.js")
    ]);

  THREE = threeModule;
  GLTFLoader = loaderModule.GLTFLoader;
  MeshoptDecoder = meshoptModule.MeshoptDecoder;
  FASHION_SCULPTURE_CYCLE_MS =
    manifestModule.FASHION_SCULPTURE_CYCLE_MS;
  fashionSculptures = manifestModule.fashionSculptures;

  const canvas = root.querySelector("[data-fashion-procession-canvas]");
  if (!canvas || !fashionSculptures.length) return;

  root.dataset.modelCount = String(fashionSculptures.length);
  root.dataset.state = "loading";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactViewport = window.matchMedia("(max-width: 47.99rem)");
  const connection = navigator.connection;
  const lowMemory = Number(navigator.deviceMemory || 4) <= 2;
  const staticPresentation =
    reducedMotion.matches ||
    compactViewport.matches ||
    connection?.saveData ||
    lowMemory;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    premultipliedAlpha: true
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1.25, -1, 0.01, 40);
  camera.position.set(0, 0.08, 8);
  camera.lookAt(0, 0.08, 0);

  scene.add(new THREE.HemisphereLight(0xf6f2e8, 0x747873, 2.5));

  const keyLight = new THREE.DirectionalLight(0xfffbf1, 2.9);
  keyLight.position.set(3.5, 4.5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xaeb8b2, 1.45);
  fillLight.position.set(-4, 1.5, 3);
  scene.add(fillLight);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const modelCache = new Map();
  const maximumCachedModels = staticPresentation ? 1 : 8;
  const cycleDuration = Number(root.dataset.cycleMs) || FASHION_SCULPTURE_CYCLE_MS;
  const modelHeight = 2.22;
  const startTime = performance.now();
  let stageIsVisible = true;
  let animationFrame = 0;
  let stageHalfWidth = 1;

  const modulo = (value, length) => ((value % length) + length) % length;
  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(maximum, Math.max(minimum, value));
  const smoothstep = (minimum, maximum, value) => {
    const progress = clamp((value - minimum) / (maximum - minimum));
    return progress * progress * (3 - 2 * progress);
  };

  const sculptureMaterial = () =>
    new THREE.MeshStandardMaterial({
      color: 0xc7c5bd,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

  const disposeRecord = (record) => {
    if (!record?.group) return;
    scene.remove(record.group);
    record.group.traverse((child) => {
      if (child.isMesh) child.geometry?.dispose();
    });
    record.material?.dispose();
    record.group.clear();
  };

  const prepareModel = (gltf, index) => {
    const content = gltf.scene;
    const material = sculptureMaterial();
    const sourceMaterials = new Set();

    content.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.filter(Boolean).forEach((source) => sourceMaterials.add(source));
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    });

    sourceMaterials.forEach((source) => source.dispose());
    content.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(content);
    const centre = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const normalisation = new THREE.Group();
    const group = new THREE.Group();
    const height = Math.max(size.y, 0.001);
    const scale = modelHeight / height;

    content.position.set(-centre.x, -centre.y, -centre.z);
    normalisation.scale.setScalar(scale);
    normalisation.position.y = 0.075;
    normalisation.add(content);
    group.add(normalisation);
    group.visible = false;
    group.userData.initialYaw = ((index * 137.508) % 360) * (Math.PI / 180);
    group.userData.spinSpeed = 0.022 + ((index * 7) % 9) * 0.002;
    scene.add(group);

    return { group, material };
  };

  const ensureModel = (index) => {
    const modelIndex = modulo(index, fashionSculptures.length);
    const existing = modelCache.get(modelIndex);

    if (existing) {
      existing.lastUsed = performance.now();
      return existing.promise;
    }

    const definition = fashionSculptures[modelIndex];
    const record = {
      definition,
      group: null,
      material: null,
      lastUsed: performance.now(),
      status: "loading",
      promise: null
    };

    record.promise = loader
      .loadAsync(definition.src)
      .then((gltf) => {
        const prepared = prepareModel(gltf, modelIndex);
        record.group = prepared.group;
        record.material = prepared.material;
        record.status = "ready";
        return record;
      })
      .catch((error) => {
        record.status = "error";
        console.error(`Unable to load ${definition.sourceName}.`, error);
        return record;
      });

    modelCache.set(modelIndex, record);
    return record.promise;
  };

  const evictDistantModels = (protectedIndexes) => {
    if (modelCache.size <= maximumCachedModels) return;

    [...modelCache.entries()]
      .filter(([index, record]) => {
        return (
          !protectedIndexes.has(index) &&
          record.status !== "loading" &&
          modelCache.size > maximumCachedModels
        );
      })
      .sort((left, right) => left[1].lastUsed - right[1].lastUsed)
      .forEach(([index, record]) => {
        if (modelCache.size <= maximumCachedModels) return;
        disposeRecord(record);
        modelCache.delete(index);
      });
  };

  const resize = () => {
    const bounds = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const aspect = width / height;
    const verticalSpan = 2.25;

    renderer.setSize(width, height, false);
    stageHalfWidth = (verticalSpan * aspect) / 2;
    camera.left = -stageHalfWidth;
    camera.right = stageHalfWidth;
    camera.top = 1.25;
    camera.bottom = -1;
    camera.updateProjectionMatrix();
  };

  const positionFor = (position) => {
    const primary = -stageHalfWidth * 0.06;

    if (position <= 0) {
      return primary + position * stageHalfWidth * 0.76;
    }

    const numerator = 1 - Math.exp(-1.22 * position);
    const denominator = 1 - Math.exp(-2.44);
    return primary + stageHalfWidth * 0.94 * (numerator / denominator);
  };

  const opacityFor = (position) => {
    if (position < -1.55 || position > 2.35) return 0;
    if (position < -0.55) return smoothstep(-1.55, -0.55, position);
    if (position <= 0.2) return 1;
    if (position <= 1) {
      return THREE.MathUtils.lerp(1, 0.42, (position - 0.2) / 0.8);
    }
    return THREE.MathUtils.lerp(
      0.42,
      0.035,
      clamp((position - 1) / 1.35)
    );
  };

  const renderStaticModel = async () => {
    const record = await ensureModel(0);
    if (!record.group || !record.material) {
      root.dataset.state = "unavailable";
      return;
    }

    record.group.visible = true;
    record.group.position.set(0, 0, 0);
    record.group.rotation.y = record.group.userData.initialYaw;
    record.material.opacity = 1;
    renderer.render(scene, camera);
    root.dataset.state = "ready";
  };

  const renderFrame = (time) => {
    animationFrame = 0;
    if (!stageIsVisible || document.hidden) return;

    const elapsed = time - startTime;
    const cyclePosition =
      ((elapsed % cycleDuration) / cycleDuration) * fashionSculptures.length;
    const baseIndex = Math.floor(cyclePosition);
    const fraction = cyclePosition - baseIndex;
    const protectedIndexes = new Set();

    modelCache.forEach((record) => {
      if (record.group) record.group.visible = false;
    });

    [-1, 0, 1, 2].forEach((offset) => {
      const modelIndex = modulo(baseIndex + offset, fashionSculptures.length);
      const position = offset - fraction;
      const opacity = opacityFor(position);
      const record = modelCache.get(modelIndex);

      protectedIndexes.add(modelIndex);
      ensureModel(modelIndex);

      if (!record?.group || !record.material || opacity <= 0.01) return;

      record.lastUsed = time;
      record.group.visible = true;
      record.group.position.set(
        positionFor(position),
        0,
        position > 0 ? -0.055 * position : 0.035 * -position
      );
      record.group.rotation.y =
        record.group.userData.initialYaw +
        (elapsed / 1000) * record.group.userData.spinSpeed;
      record.group.renderOrder = Math.round((2.5 - position) * 10);
      record.material.opacity = opacity;
      record.material.depthWrite = opacity > 0.82;
    });

    [3, 4].forEach((offset) => {
      const modelIndex = modulo(baseIndex + offset, fashionSculptures.length);
      protectedIndexes.add(modelIndex);
      ensureModel(modelIndex);
    });

    evictDistantModels(protectedIndexes);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const resume = () => {
    if (
      staticPresentation ||
      animationFrame ||
      !stageIsVisible ||
      document.hidden
    ) {
      return;
    }
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const pause = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (staticPresentation) {
      renderer.render(scene, camera);
    }
  });
  resizeObserver.observe(root);
  resize();

  if (staticPresentation) {
    await renderStaticModel();
    return;
  }

  const openingIndexes = [-1, 0, 1, 2].map((offset) =>
    modulo(offset, fashionSculptures.length)
  );
  await Promise.all(openingIndexes.map((index) => ensureModel(index)));
  root.dataset.state = "ready";

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      stageIsVisible = entries.some((entry) => entry.isIntersecting);
      if (stageIsVisible) resume();
      else pause();
    },
    { rootMargin: "15% 0px", threshold: 0.01 }
  );
  visibilityObserver.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resume();
  });

  resume();
}
