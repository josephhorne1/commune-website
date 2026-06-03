(() => {
  // Static pages cannot scan folders. Add new sequential files as "Tile N.png"
  // and update this count when the TILES folder grows.
  const TILE_COUNT = 46;
  const TILE_IMAGES = Array.from(
    { length: TILE_COUNT },
    (_, index) => `assets/images/TILES/Tile ${index + 1}.png`
  );
  const TILE_CYCLE_MS = 12000;
  const TILE_SWAP_POINT = 0.75;
  const PHASE_JITTER_MS = 90;

  let background = null;
  let tiles = [];
  let timers = new Set();
  let resizeTimer = 0;
  let currentGridKey = "";
  let totalSwaps = 0;

  onReady(initTileBackground);

  function initTileBackground() {
    if (!TILE_IMAGES.length || document.querySelector(".volume-tile-background")) return;

    const catalogLayer = document.querySelector(".catalog-page-layer");
    const catalogBackground = document.querySelector(".catalog-background");
    background = document.createElement("div");
    background.className = "volume-tile-background";
    background.setAttribute("aria-hidden", "true");

    if (catalogLayer && catalogBackground) {
      background.classList.add("volume-tile-background--catalog");
      catalogBackground.insertAdjacentElement("afterend", background);
    } else {
      document.body.prepend(background);
    }

    preloadTileImages();
    buildTileGrid();
    setupRuntimeHooks();
  }

  function setupRuntimeHooks() {
    window.addEventListener("resize", scheduleGridRebuild, { passive: true });
    window.addEventListener("orientationchange", () => {
      window.setTimeout(scheduleGridRebuild, 180);
    }, { passive: true });
    window.addEventListener("pageshow", () => {
      scheduleTileImageSwaps();
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") scheduleTileImageSwaps();
    });

    window.CommuneTileBackground = {
      status: () => ({
        animationDriven: true,
        tileCount: tiles.length,
        totalSwaps
      })
    };
  }

  function preloadTileImages() {
    TILE_IMAGES.forEach(src => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }

  function buildTileGrid() {
    if (!background) return;

    const viewportWidth = Math.max(1, window.innerWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    const size = tileSizeForViewport(viewportWidth);
    const columns = Math.max(1, Math.ceil(viewportWidth / size));
    const rows = Math.max(1, Math.ceil(viewportHeight / size));
    const count = columns * rows;
    const nextGridKey = `${columns}x${rows}`;

    background.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    background.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    if (nextGridKey === currentGridKey && tiles.length === count) return;

    clearTimers();
    currentGridKey = nextGridKey;
    tiles = createTiles(count);
    background.replaceChildren(...tiles);
    scheduleTileImageSwaps();
  }

  function createTiles(count) {
    const phaseOrder = shuffledIndexes(count);

    return Array.from({ length: count }, (_, index) => {
      const tile = document.createElement("div");
      const src = TILE_IMAGES[index % TILE_IMAGES.length];
      const phase = phaseForIndex(phaseOrder[index], count);

      tile.className = "volume-tile";
      tile.dataset.currentSrc = src;
      tile.dataset.phase = String(phase);
      tile.style.setProperty("--tile-fade-duration", `${TILE_CYCLE_MS}ms`);
      tile.style.setProperty("--tile-fade-delay", `${-phase}ms`);

      const image = document.createElement("img");
      image.className = "volume-tile-image";
      image.src = src;
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      image.fetchPriority = "low";
      tile.appendChild(image);

      return tile;
    });
  }

  function phaseForIndex(orderIndex, count) {
    const basePhase = count <= 1 ? 0 : (orderIndex / count) * TILE_CYCLE_MS;
    const jitter = randomBetween(-PHASE_JITTER_MS, PHASE_JITTER_MS);
    return normalizeTime(basePhase + jitter, TILE_CYCLE_MS);
  }

  function scheduleGridRebuild() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      buildTileGrid();
    }, 220);
  }

  function scheduleTileImageSwaps() {
    clearTimers();
    tiles.forEach(tile => {
      scheduleNextImageSwap(tile);
    });
  }

  function scheduleNextImageSwap(tile) {
    if (!tile || !tile.isConnected) return;

    const phase = Number(tile.dataset.phase || 0);
    const swapAt = TILE_CYCLE_MS * TILE_SWAP_POINT;
    const delay = normalizeTime(swapAt - phase, TILE_CYCLE_MS);

    setManagedTimeout(function swapAndRepeat() {
      if (!tile.isConnected) return;
      swapTileImage(tile);
      setManagedTimeout(swapAndRepeat, TILE_CYCLE_MS);
    }, delay);
  }

  function swapTileImage(tile) {
    const image = tile.querySelector(".volume-tile-image");
    if (!image) return;

    const nextSrc = nextImageFor(tile.dataset.currentSrc);
    image.src = nextSrc;
    tile.dataset.currentSrc = nextSrc;
    totalSwaps += 1;
  }

  function shuffledIndexes(count) {
    const indexes = Array.from({ length: count }, (_, index) => index);
    for (let index = indexes.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
    }
    return indexes;
  }

  function clearTimers() {
    timers.forEach(timer => window.clearTimeout(timer));
    timers.clear();
  }

  function setManagedTimeout(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function nextImageFor(currentSrc) {
    let nextSrc = currentSrc;
    while (nextSrc === currentSrc) {
      nextSrc = TILE_IMAGES[Math.floor(Math.random() * TILE_IMAGES.length)];
    }
    return nextSrc;
  }

  function normalizeTime(value, duration) {
    return ((value % duration) + duration) % duration;
  }

  function randomBetween(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function tileSizeForViewport(width) {
    if (width < 520) return 60;
    if (width < 900) return 76;
    if (width < 1400) return 96;
    if (width < 1900) return 112;
    return 128;
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }
})();
