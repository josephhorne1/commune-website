import {
  FASHION_TURNTABLE_CYCLE_MS,
  fashionTurntables
} from "../assets/media/fashion-turntables/manifest.js";
import {
  createCarouselInteraction,
  manualResponseForSpeed,
  smoothCarouselPosition,
  moveWithinBounds
} from "./carousel-interaction.js";
import {
  playbackRateTier,
  retimeAnimatedWebp
} from "./animated-webp-rate.js";

const IMAGE_LOAD_TIMEOUT_MS = 8000;
const MAXIMUM_CACHED_LOOKS = 10;
const MAXIMUM_CACHED_ANIMATION_BUFFERS = 10;
const VISIBLE_LOOK_COUNT = 5;
const DISPLAY_OFFSETS = Object.freeze([-2, -1, 0, 1, 2, 3, 4, 5, 6]);
const CACHE_OFFSETS = Object.freeze([...DISPLAY_OFFSETS, 7]);

const procession = document.querySelector("[data-fashion-procession]");

if (procession) {
  procession.dataset.state = "booting";
  initialiseFashionProcession(procession).catch((error) => {
    console.error("Fashion turntable procession could not start.", error);
    procession.dataset.state = "unavailable";
    procession.dataset.error = error?.message || "Unknown image error";
  });
}

async function initialiseFashionProcession(root) {
  const viewport = root.querySelector("[data-fashion-procession-viewport]");
  const fallback = viewport?.querySelector(".fashion-procession__fallback");
  const fallbackImage = fallback?.querySelector("img");
  const fallbackSources = [...(fallback?.querySelectorAll("source") || [])];

  if (!viewport || !fashionTurntables.length) {
    root.dataset.state = "unavailable";
    return;
  }

  root.dataset.lookCount = String(fashionTurntables.length);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactViewport = window.matchMedia("(max-width: 47.99rem)");
  const connection = navigator.connection;
  const lowMemory = Number(navigator.deviceMemory || 4) <= 2;
  const mobileFallbackPoster =
    "/assets/media/fashion-turntables/mobile-grid-poster.webp";

  const modulo = (value, length) => ((value % length) + length) % length;
  const clamp = (value, minimum = 0, maximum = 1) =>
    Math.min(maximum, Math.max(minimum, value));
  const smoothstep = (minimum, maximum, value) => {
    const progress = clamp((value - minimum) / (maximum - minimum));
    return progress * progress * (3 - 2 * progress);
  };

  [...viewport.children].forEach((child) => {
    if (child !== fallback) child.remove();
  });

  const records = new Map();
  const animationBuffers = new Map();
  let playbackApplyTimer = 0;
  let pendingPlaybackRate = 1;
  const cycleDuration =
    Number(root.dataset.cycleMs) || FASHION_TURNTABLE_CYCLE_MS;
  let staticPresentation = null;
  let presentationVersion = 0;
  let dynamicPresentationReady = false;
  let dynamicStartPromise = null;
  let cyclePosition = 0;
  let targetCyclePosition = 0;
  let manualMinimum = null;
  let manualMaximum = null;
  let manualOrigin = null;
  let manualDirection = 0;
  let previousFrameTime = 0;
  let interactionPaused = false;
  let manualSpeed = 1;
  let activePlaybackRate = 1;
  let stageIsVisible = false;
  let userPaused = document.body.dataset.motionPaused === "true";
  let animationFrame = 0;
  let stageWidth = 1;
  let lookStride = 1;
  let renderedBaseIndex = null;

  const shouldUseStaticPresentation = () =>
    reducedMotion.matches || Boolean(connection?.saveData) || lowMemory;

  const setFallbackVisible = (visible) => {
    if (!fallback) return;
    fallback.hidden = !visible;
  };

  fallbackSources.forEach((source) => {
    source.dataset.defaultMedia = source.media;
  });

  const setFallbackPosterMode = (forcePoster) => {
    fallbackSources.forEach((source) => {
      source.media = forcePoster ? "not all" : source.dataset.defaultMedia;
    });

    if (!fallbackImage) return;
    const source =
      forcePoster && compactViewport.matches
        ? mobileFallbackPoster
        : fashionTurntables[0].poster;
    if (fallbackImage.getAttribute("src") !== source) fallbackImage.src = source;
  };

  const loadImageSource = (record, source) =>
    new Promise((resolve) => {
      const { image } = record;
      let settled = false;
      let timeoutId = 0;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError);
        if (record.abortLoad === abort) record.abortLoad = null;
      };

      const finish = (status) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (status !== "ready") image.removeAttribute("src");
        resolve(status);
      };

      const onLoad = () => finish("ready");
      const onError = () => finish("error");
      const abort = () => finish("disposed");

      record.abortLoad = abort;
      image.addEventListener("load", onLoad, { once: true });
      image.addEventListener("error", onError, { once: true });
      timeoutId = window.setTimeout(
        () => finish("timeout"),
        IMAGE_LOAD_TIMEOUT_MS
      );
      image.src = source;

      if (image.complete) {
        queueMicrotask(() =>
          finish(image.naturalWidth > 0 ? "ready" : "error")
        );
      }
    });

  const preloadImageSource = (source) =>
    new Promise((resolve) => {
      const image = new Image();
      let timeoutId = 0;
      const finish = (ready) => {
        window.clearTimeout(timeoutId);
        image.onload = null;
        image.onerror = null;
        resolve(ready);
      };
      image.decoding = "async";
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      timeoutId = window.setTimeout(
        () => finish(false),
        IMAGE_LOAD_TIMEOUT_MS
      );
      image.src = source;
    });

  const animationBufferFor = (source) => {
    const existing = animationBuffers.get(source);
    if (existing) {
      existing.lastUsed = performance.now();
      return existing.promise;
    }

    if (animationBuffers.size >= MAXIMUM_CACHED_ANIMATION_BUFFERS) {
      const oldestSource = [...animationBuffers.entries()].sort(
        (first, second) => first[1].lastUsed - second[1].lastUsed
      )[0]?.[0];
      if (oldestSource) animationBuffers.delete(oldestSource);
    }

    const entry = {
      lastUsed: performance.now(),
      promise: null
    };
    entry.promise = fetch(source, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to prepare ${source} for variable playback.`);
        }
        return response.arrayBuffer();
      })
      .catch((error) => {
        if (animationBuffers.get(source) === entry) {
          animationBuffers.delete(source);
        }
        throw error;
      });
    animationBuffers.set(source, entry);
    return entry.promise;
  };

  const requestRecordPlaybackRate = async (record, requestedRate) => {
    const rate = [1, 1.5, 2, 3, 4].includes(requestedRate)
      ? requestedRate
      : playbackRateTier(requestedRate);
    const retryIsCoolingDown =
      record.failedPlaybackRate === rate &&
      performance.now() < record.playbackRetryAt;
    if (
      record.disposed ||
      record.requestedPlaybackRate === rate ||
      retryIsCoolingDown
    ) {
      return;
    }
    record.requestedPlaybackRate = rate;
    const request = ++record.playbackRequest;
    const requestIsCurrent = () =>
      !record.disposed && request === record.playbackRequest;
    const releaseFailedRequest = () => {
      if (requestIsCurrent()) {
        record.requestedPlaybackRate = record.appliedPlaybackRate;
        record.failedPlaybackRate = rate;
        record.playbackRetryAt = performance.now() + 5000;
      }
    };
    const commitRate = () => {
      record.appliedPlaybackRate = rate;
      record.failedPlaybackRate = null;
      record.playbackRetryAt = 0;
      record.element.dataset.playbackRate = String(rate);
    };

    await record.ready;
    if (!requestIsCurrent()) return;
    if (record.media !== "animated") await warmAnimatedRecord(record);
    if (!requestIsCurrent()) return;
    if (record.media !== "animated") {
      releaseFailedRequest();
      return;
    }

    if (rate === 1) {
      if (!record.playbackBlobUrl) {
        commitRate();
        return;
      }
      const ready = await preloadImageSource(record.definition.src);
      if (!requestIsCurrent()) return;
      if (!ready) {
        releaseFailedRequest();
        return;
      }
      const previousBlobUrl = record.playbackBlobUrl;
      record.playbackBlobUrl = null;
      record.image.src = record.definition.src;
      commitRate();
      URL.revokeObjectURL(previousBlobUrl);
      return;
    }

    try {
      const buffer = await animationBufferFor(record.definition.src);
      if (!requestIsCurrent()) return;
      const retimedBuffer = retimeAnimatedWebp(buffer, rate);
      const blobUrl = URL.createObjectURL(
        new Blob([retimedBuffer], { type: "image/webp" })
      );
      const ready = await preloadImageSource(blobUrl);
      if (!requestIsCurrent()) {
        URL.revokeObjectURL(blobUrl);
        return;
      }
      if (!ready) {
        URL.revokeObjectURL(blobUrl);
        releaseFailedRequest();
        return;
      }

      const previousBlobUrl = record.playbackBlobUrl;
      record.playbackBlobUrl = blobUrl;
      record.image.src = blobUrl;
      commitRate();
      if (previousBlobUrl) URL.revokeObjectURL(previousBlobUrl);
    } catch (error) {
      if (requestIsCurrent()) {
        releaseFailedRequest();
        console.warn("Variable garment playback was unavailable.", error);
      }
    }
  };

  const applyPlaybackRate = (rate) => {
    root.dataset.playbackRate = String(rate);
    if (activePlaybackRate === rate && pendingPlaybackRate === rate) return;
    activePlaybackRate = rate;
    pendingPlaybackRate = rate;
    root.dataset.playbackRate = String(activePlaybackRate);
    records.forEach((record) => {
      const shouldUpdate =
        activePlaybackRate === 1
          ? record.appliedPlaybackRate !== 1 ||
            record.requestedPlaybackRate !== 1 ||
            Boolean(record.playbackBlobUrl)
          : record.visible && record.status === "ready";
      if (shouldUpdate) {
        requestRecordPlaybackRate(record, activePlaybackRate);
      }
    });
  };

  const setPlaybackRate = (speed) => {
    const rate = playbackRateTier(speed);
    if (rate === 1) {
      window.clearTimeout(playbackApplyTimer);
      playbackApplyTimer = 0;
      pendingPlaybackRate = 1;
      delete root.dataset.playbackRatePending;
      applyPlaybackRate(1);
      return;
    }

    pendingPlaybackRate = Math.max(pendingPlaybackRate, rate);
    root.dataset.playbackRatePending = String(pendingPlaybackRate);
    if (activePlaybackRate >= pendingPlaybackRate || playbackApplyTimer) return;
    playbackApplyTimer = window.setTimeout(() => {
      playbackApplyTimer = 0;
      const nextRate = pendingPlaybackRate;
      applyPlaybackRate(nextRate);
      delete root.dataset.playbackRatePending;
    }, 110);
  };

  const createRecord = (index, prefersAnimated = true) => {
    const lookIndex = modulo(index, fashionTurntables.length);
    const definition = fashionTurntables[lookIndex];
    const element = document.createElement("span");
    const image = document.createElement("img");

    element.className = "fashion-procession__item";
    element.dataset.look = definition.id;
    element.dataset.crop = definition.crop;
    element.dataset.playbackRate = "1";
    element.style.setProperty("--look-scale", String(definition.scale));
    element.style.setProperty("--look-y", `${definition.offsetY * 100}%`);
    element.style.visibility = "hidden";

    image.className = "fashion-procession__image";
    image.alt = "";
    image.width = definition.width;
    image.height = definition.height;
    image.decoding = "async";
    image.draggable = false;
    element.append(image);
    viewport.append(element);

    const record = {
      definition,
      element,
      image,
      lastUsed: performance.now(),
      status: "loading",
      media: null,
      disposed: false,
      abortLoad: null,
      animationReady: null,
      appliedPlaybackRate: 1,
      requestedPlaybackRate: 1,
      failedPlaybackRate: null,
      playbackRetryAt: 0,
      playbackRequest: 0,
      playbackBlobUrl: null,
      visible: false,
      ready: null
    };

    record.ready = (async () => {
      const primarySource = prefersAnimated
        ? definition.src
        : definition.poster;
      const secondarySource = prefersAnimated
        ? definition.poster
        : definition.src;
      let status = await loadImageSource(record, primarySource);
      if (record.disposed || status === "disposed") return record;

      if (status === "ready") {
        record.status = "ready";
        record.media = prefersAnimated ? "animated" : "poster";
        element.dataset.media = record.media;
        return record;
      }

      status = await loadImageSource(record, secondarySource);
      if (record.disposed || status === "disposed") return record;

      if (status === "ready") {
        record.status = "ready";
        record.media = prefersAnimated ? "poster" : "animated";
        element.dataset.media = record.media;
        return record;
      }

      record.status = "error";
      console.error(`Unable to load ${definition.sourceName} or its poster.`);
      return record;
    })();
    record.ready.then(
      () => {
        if (
          !record.disposed &&
          records.get(lookIndex) === record &&
          dynamicPresentationReady
        ) {
          renderPosition(performance.now());
        }
      },
      () => {}
    );

    records.set(lookIndex, record);
    return record;
  };

  const warmAnimatedRecord = (record) => {
    if (
      record.disposed ||
      record.media === "animated" ||
      record.animationReady
    ) {
      return record.animationReady;
    }

    record.animationReady = record.ready
      .then(async () => {
        if (record.disposed || record.media === "animated") return true;
        const ready = await preloadImageSource(record.definition.src);
        if (!ready || record.disposed) return false;
        record.image.src = record.definition.src;
        record.media = "animated";
        record.element.dataset.media = record.media;
        return true;
      })
      .finally(() => {
        if (!record.disposed && record.media !== "animated") {
          record.animationReady = null;
        }
      });
    return record.animationReady;
  };

  const ensureRecord = (index, prefersAnimated = true) => {
    const lookIndex = modulo(index, fashionTurntables.length);
    const existing = records.get(lookIndex);
    if (existing) {
      existing.lastUsed = performance.now();
      if (prefersAnimated) warmAnimatedRecord(existing);
      return existing;
    }
    return createRecord(lookIndex, prefersAnimated);
  };

  const disposeRecord = (index, record) => {
    record.disposed = true;
    record.status = "disposed";
    record.playbackRequest += 1;
    record.abortLoad?.();
    record.image.removeAttribute("src");
    if (record.playbackBlobUrl) URL.revokeObjectURL(record.playbackBlobUrl);
    record.element.remove();
    records.delete(index);
  };

  const clearRecords = () => {
    [...records.entries()].forEach(([index, record]) => {
      disposeRecord(index, record);
    });
    window.clearTimeout(playbackApplyTimer);
    playbackApplyTimer = 0;
    pendingPlaybackRate = 1;
    activePlaybackRate = 1;
    root.dataset.playbackRate = "1";
    delete root.dataset.playbackRatePending;
    animationBuffers.clear();
    renderedBaseIndex = null;
  };

  const reconcileCache = (requiredIndexes, animatedIndexes = requiredIndexes) => {
    const required = new Set(
      [...requiredIndexes]
        .map((index) => modulo(index, fashionTurntables.length))
        .slice(0, MAXIMUM_CACHED_LOOKS)
    );
    const animated = new Set(
      [...animatedIndexes].map((index) =>
        modulo(index, fashionTurntables.length)
      )
    );

    [...records.entries()].forEach(([index, record]) => {
      if (!required.has(index)) disposeRecord(index, record);
    });

    required.forEach((index) => ensureRecord(index, animated.has(index)));
    return required;
  };

  const resize = () => {
    const bounds = root.getBoundingClientRect();
    stageWidth = Math.max(1, bounds.width);
    lookStride = stageWidth / VISIBLE_LOOK_COUNT;
  };

  const positionFor = (position) =>
    -stageWidth * 0.42 + position * lookStride;

  const opacityFor = (position) => {
    const centre = 0.5 + positionFor(position) / stageWidth;
    const leftFade = smoothstep(-0.1, 0.04, centre);
    const rightFade = 1 - smoothstep(1.04, 1.18, centre);
    return Math.min(leftFade, rightFade);
  };

  const showRecord = (record, position, opacity, time) => {
    if (record.status !== "ready" || opacity <= 0.01) {
      record.visible = false;
      record.element.style.visibility = "hidden";
      record.element.style.opacity = "0";
      return;
    }

    record.lastUsed = time;
    record.visible = true;
    record.element.style.visibility = "visible";
    record.element.style.opacity = opacity.toFixed(4);
    record.element.style.setProperty("--look-x", `${positionFor(position)}px`);
    if (record.media === "animated") {
      requestRecordPlaybackRate(record, activePlaybackRate);
    }
  };

  const renderPosition = (time) => {
    const baseIndex = Math.floor(cyclePosition);
    const fraction = cyclePosition - baseIndex;
    if (baseIndex !== renderedBaseIndex) {
      const requiredIndexes = CACHE_OFFSETS.map((offset) =>
        modulo(baseIndex + offset, fashionTurntables.length)
      );
      const animatedIndexes = DISPLAY_OFFSETS.filter(
        (offset) => offset >= -1 && offset <= 5
      ).map((offset) =>
        modulo(baseIndex + offset, fashionTurntables.length)
      );

      reconcileCache(requiredIndexes, animatedIndexes);
      DISPLAY_OFFSETS.forEach((offset) => {
        const lookIndex = modulo(baseIndex + offset, fashionTurntables.length);
        const record = records.get(lookIndex);
        if (record) {
          record.element.style.zIndex = String(100 - offset);
        }
      });
      renderedBaseIndex = baseIndex;
    }

    DISPLAY_OFFSETS.forEach((offset) => {
      const lookIndex = modulo(baseIndex + offset, fashionTurntables.length);
      const position = offset - fraction;
      const opacity = opacityFor(position);
      const record = records.get(lookIndex);

      if (record) {
        showRecord(record, position, opacity, time);
      }
    });
    const prefetchedRecord = records.get(
      modulo(baseIndex + CACHE_OFFSETS.at(-1), fashionTurntables.length)
    );
    if (prefetchedRecord) {
      prefetchedRecord.visible = false;
      prefetchedRecord.element.style.visibility = "hidden";
      prefetchedRecord.element.style.opacity = "0";
    }
    root.dataset.carouselPosition = cyclePosition.toFixed(4);
  };

  const renderFrame = (time) => {
    animationFrame = 0;
    if (
      staticPresentation ||
      !dynamicPresentationReady ||
      !stageIsVisible ||
      (userPaused && !interactionPaused) ||
      document.hidden
    ) {
      return;
    }

    if (!previousFrameTime) previousFrameTime = time;
    const elapsed = Math.min(80, Math.max(0, time - previousFrameTime));
    previousFrameTime = time;
    if (interactionPaused) {
      cyclePosition = smoothCarouselPosition(
        cyclePosition,
        targetCyclePosition,
        elapsed,
        manualResponseForSpeed(manualSpeed)
      );
      if (Math.abs(targetCyclePosition - cyclePosition) <= 0.0005) {
        cyclePosition = targetCyclePosition;
        renderPosition(time);
        return;
      }
    } else {
      cyclePosition = modulo(
        cyclePosition +
          (elapsed / cycleDuration) * fashionTurntables.length,
        fashionTurntables.length
      );
      targetCyclePosition = cyclePosition;
    }
    renderPosition(time);

    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const resume = () => {
    if (
      staticPresentation ||
      !dynamicPresentationReady ||
      animationFrame ||
      !stageIsVisible ||
      (userPaused && !interactionPaused) ||
      document.hidden
    ) {
      return;
    }
    previousFrameTime = 0;
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const pause = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    previousFrameTime = 0;
  };

  const startDynamicPresentation = async (version) => {
    root.dataset.state = "loading";
    root.dataset.presentation = "animated";
    root.dataset.carouselControl = "interactive";
    dynamicPresentationReady = false;
    setFallbackVisible(true);
    setFallbackPosterMode(false);

    if (!stageIsVisible || document.hidden || userPaused) {
      root.dataset.state = "waiting";
      return;
    }

    const openingIndexes = [-1, 0, 1, 2, 3, 4, 5].map((offset) =>
      modulo(offset, fashionTurntables.length)
    );
    const requiredIndexes = CACHE_OFFSETS.map((offset) =>
      modulo(offset, fashionTurntables.length)
    );

    reconcileCache(requiredIndexes, openingIndexes);
    await Promise.all(
      openingIndexes.map((index) => records.get(index)?.ready)
    );

    if (version !== presentationVersion || staticPresentation) return;

    const hasOpeningLook = openingIndexes.some(
      (index) => records.get(index)?.status === "ready"
    );

    if (!hasOpeningLook) {
      clearRecords();
      root.dataset.state = fallback ? "ready" : "unavailable";
      root.dataset.presentation = "poster-fallback";
      setFallbackVisible(true);
      return;
    }

    cyclePosition = 0;
    targetCyclePosition = 0;
    manualMinimum = null;
    manualMaximum = null;
    manualOrigin = null;
    manualDirection = 0;
    previousFrameTime = 0;
    interactionPaused = false;
    manualSpeed = 1;
    setPlaybackRate(1);
    dynamicPresentationReady = true;
    renderPosition(performance.now());
    setFallbackVisible(false);
    root.dataset.state = "ready";
    resume();
  };

  const requestDynamicStart = () => {
    if (
      !staticPresentation &&
      !dynamicPresentationReady &&
      (!stageIsVisible || document.hidden || userPaused)
    ) {
      setFallbackVisible(true);
      setFallbackPosterMode(userPaused);
      root.dataset.presentation = "animated";
      root.dataset.state = "waiting";
    }

    if (
      staticPresentation ||
      dynamicPresentationReady ||
      dynamicStartPromise ||
      !stageIsVisible ||
      document.hidden ||
      userPaused
    ) {
      return dynamicStartPromise || Promise.resolve();
    }

    const version = presentationVersion;
    const startPromise = startDynamicPresentation(version).catch((error) => {
      if (version !== presentationVersion) return;
      console.error("Fashion turntable presentation could not start.", error);
      clearRecords();
      setFallbackVisible(true);
      root.dataset.presentation = "poster-fallback";
      root.dataset.state = fallback ? "ready" : "unavailable";
    });
    dynamicStartPromise = startPromise;
    startPromise.finally(() => {
      if (dynamicStartPromise === startPromise) dynamicStartPromise = null;
    });
    return startPromise;
  };

  const applyPresentationMode = async (force = false) => {
    const nextStaticPresentation = shouldUseStaticPresentation();
    if (!force && nextStaticPresentation === staticPresentation) {
      if (staticPresentation) {
        setFallbackPosterMode(
          reducedMotion.matches ||
            Boolean(connection?.saveData) ||
            lowMemory ||
            userPaused
        );
      }
      return;
    }

    staticPresentation = nextStaticPresentation;
    ++presentationVersion;
    dynamicStartPromise = null;
    pause();
    dynamicPresentationReady = false;
    clearRecords();
    setFallbackVisible(true);

    if (staticPresentation) {
      cyclePosition = 0;
      targetCyclePosition = 0;
      manualMinimum = null;
      manualMaximum = null;
      manualOrigin = null;
      manualDirection = 0;
      previousFrameTime = 0;
      interactionPaused = false;
      manualSpeed = 1;
      setPlaybackRate(1);
      setFallbackPosterMode(
        reducedMotion.matches ||
          Boolean(connection?.saveData) ||
          lowMemory ||
          userPaused
      );
      root.dataset.presentation = "static";
      root.dataset.carouselControl = "static";
      root.dataset.state = fallback ? "ready" : "unavailable";
      return;
    }

    await requestDynamicStart();
  };

  const requestPresentationUpdate = () => {
    applyPresentationMode().catch((error) => {
      console.error("Fashion turntable presentation could not update.", error);
      clearRecords();
      setFallbackVisible(true);
      root.dataset.presentation = "poster-fallback";
      root.dataset.state = fallback ? "ready" : "unavailable";
    });
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();

  createCarouselInteraction(root, {
    isEnabled: () =>
      !staticPresentation && dynamicPresentationReady && stageWidth > 1,
    isDesktop: () =>
      window.matchMedia(
        "(min-width: 64.01rem) and (hover: hover) and (pointer: fine)"
      ).matches,
    isMotionSettled: () =>
      staticPresentation ||
      !stageIsVisible ||
      document.hidden ||
      Math.abs(targetCyclePosition - cyclePosition) <= 0.0005,
    onStart: () => {
      interactionPaused = true;
      targetCyclePosition = cyclePosition;
      manualMinimum = null;
      manualMaximum = null;
      manualOrigin = null;
      manualDirection = 0;
      manualSpeed = 1;
      previousFrameTime = 0;
      resume();
    },
    onMove: (delta, detail) => {
      if (staticPresentation || !dynamicPresentationReady || lookStride <= 0) {
        return { consumed: false };
      }

      const deltaInLooks =
        detail.source === "swipe" ? -delta / lookStride : delta / lookStride;
      const direction = Math.sign(deltaInLooks) || detail.direction || 1;
      const reversesUncommittedLane =
        manualDirection !== 0 &&
        direction !== manualDirection &&
        manualOrigin !== null &&
        Math.abs(targetCyclePosition - manualOrigin) <= 0.65;
      if (
        manualMinimum === null ||
        manualMaximum === null ||
        reversesUncommittedLane
      ) {
        if (reversesUncommittedLane) targetCyclePosition = cyclePosition;
        manualOrigin = cyclePosition;
        manualDirection = direction;
        if (direction > 0) {
          manualMinimum = cyclePosition;
          manualMaximum = cyclePosition + fashionTurntables.length;
        } else {
          manualMinimum = cyclePosition - fashionTurntables.length;
          manualMaximum = cyclePosition;
        }
      }
      const movement = moveWithinBounds(
        targetCyclePosition,
        deltaInLooks,
        manualMinimum,
        manualMaximum
      );
      targetCyclePosition = movement.next;
      manualSpeed = detail.speed;
      if (detail.source === "swipe") {
        cyclePosition = targetCyclePosition;
        renderPosition(performance.now());
      } else {
        resume();
      }
      if (
        detail.source === "wheel" &&
        !movement.consumed &&
        Math.abs(targetCyclePosition - cyclePosition) > 0.0005
      ) {
        return { ...movement, consumed: true };
      }
      return movement;
    },
    onSpeed: (speed) => {
      manualSpeed = speed;
      setPlaybackRate(speed);
      if (interactionPaused) resume();
    },
    onResume: () => {
      interactionPaused = false;
      manualSpeed = 1;
      cyclePosition = targetCyclePosition;
      cyclePosition = modulo(cyclePosition, fashionTurntables.length);
      targetCyclePosition = cyclePosition;
      manualMinimum = null;
      manualMaximum = null;
      manualOrigin = null;
      manualDirection = 0;
      setPlaybackRate(1);
      previousFrameTime = 0;
      if (dynamicPresentationReady) renderPosition(performance.now());
      resume();
    }
  });

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      stageIsVisible = entries.some((entry) => entry.isIntersecting);
      if (stageIsVisible) {
        requestDynamicStart();
        resume();
      } else {
        pause();
      }
    },
    { rootMargin: "15% 0px", threshold: 0.01 }
  );
  visibilityObserver.observe(root);

  reducedMotion.addEventListener("change", requestPresentationUpdate);
  compactViewport.addEventListener("change", requestPresentationUpdate);
  connection?.addEventListener?.("change", requestPresentationUpdate);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else {
      requestDynamicStart();
      resume();
    }
  });

  window.addEventListener("portfolio-motion-change", (event) => {
    userPaused = Boolean(event.detail?.paused);
    if (staticPresentation) {
      setFallbackPosterMode(
        reducedMotion.matches || Boolean(connection?.saveData) || lowMemory || userPaused
      );
    }
    if (userPaused && !interactionPaused) pause();
    else {
      requestDynamicStart();
      resume();
    }
  });

  await applyPresentationMode(true);
}
