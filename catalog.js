document.addEventListener("DOMContentLoaded", () => {
  const looks = Array.from({ length: 10 }, (_, index) => ({
    index,
    src: `assets/images/sample-${index + 1}.png`,
    title: `LOOK ${String(index + 1).padStart(3, "0")}`
  }));

  const track = document.querySelector("[data-catalog-track]");
  const backgroundTrack = document.querySelector("[data-catalog-background-track]");
  const dotsWrap = document.querySelector("[data-catalog-dots]");
  const slider = document.querySelector("[data-catalog-slider]");
  const detail = document.querySelector("[data-look-detail]");
  const detailImage = document.querySelector("[data-look-image]");
  const detailTitle = document.querySelector("[data-look-title]");
  const detailDescription = document.querySelector("[data-look-description]");
  const detailSlots = document.querySelector("[data-look-slots]");
  const backButton = document.querySelector("[data-look-back]");
  const detailDescriptionCopy = "This look description will outline the garments, proportions, and styling details included in the selected catalog entry.";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lookImageExtensions = ["png", "jpg", "jpeg", "webp"];
  const maxLookImages = 40;
  if (!track || !backgroundTrack || !dotsWrap || !slider) return;

  const state = {
    activeIndex: 0,
    foregroundOffset: 0,
    backgroundOffset: 0,
    foregroundSetWidth: 1,
    backgroundSetWidth: 1,
    itemPitch: 1,
    cardWidth: 1,
    viewportLength: 1,
    isVertical: false,
    foregroundSpeed: 0,
    backgroundSpeed: 0,
    lastFrame: 0,
    ready: false,
    pauseUntil: 0,
    detailOpen: false,
    detailLookIndex: 0,
    selectedDetailImage: null,
    detailImages: [],
    detailRequestId: 0,
    manualTransitionTimer: null,
    animationFrame: 0,
    layoutTimer: 0,
    descriptionTimer: 0,
    detailEntryTimer: 0,
    dragPointerId: null,
    dragLastPosition: 0,
    dragMoved: false,
    suppressCardClickUntil: 0
  };

  document.documentElement.style.setProperty("--look-count", String(looks.length));
  document.documentElement.style.setProperty("--active-index", "0");
  document.documentElement.style.setProperty("--active-position", "0%");

  buildTracks();
  buildDots();
  initializeCatalog();

  window.addEventListener("resize", scheduleLayoutRefresh, { passive: true });
  window.addEventListener("orientationchange", () => {
    window.setTimeout(scheduleLayoutRefresh, 120);
  }, { passive: true });
  window.addEventListener("pageshow", resumeCatalog, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleLayoutRefresh, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resumeCatalog();
  });

  slider.addEventListener("click", event => {
    selectLook(indexFromPointer(event), { pause: true, animate: true });
  });

  slider.addEventListener("keydown", event => {
    const navigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!navigationKeys.includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") {
      selectLook(0, { pause: true, animate: true });
      return;
    }

    if (event.key === "End") {
      selectLook(looks.length - 1, { pause: true, animate: true });
      return;
    }

    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    selectLook(state.activeIndex + direction, { pause: true, animate: true });
  });

  slider.addEventListener("pointerdown", event => {
    try {
      slider.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Safari can reject capture during fast touch handoff; selection still works without it.
    }
    selectLook(indexFromPointer(event), { pause: true, animate: true });
  });

  slider.addEventListener("pointermove", event => {
    if (slider.hasPointerCapture && !slider.hasPointerCapture(event.pointerId)) return;
    selectLook(indexFromPointer(event), { pause: true, animate: false });
  });

  window.addEventListener("wheel", handleCatalogWheel, { passive: false });
  track.addEventListener("pointerdown", handleTrackPointerDown);
  track.addEventListener("pointermove", handleTrackPointerMove);
  track.addEventListener("pointerup", handleTrackPointerEnd);
  track.addEventListener("pointercancel", handleTrackPointerEnd);

  backButton?.addEventListener("click", closeDetail);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && state.detailOpen) closeDetail();
  });

  function buildTracks() {
    track.replaceChildren(createCatalogSet(false), createCatalogSet(true));
    backgroundTrack.replaceChildren(createBackgroundSet(), createBackgroundSet(true));
  }

  function buildDots() {
    dotsWrap.replaceChildren(
      ...looks.map(look => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "catalog-dot";
        button.dataset.lookIndex = String(look.index);
        button.setAttribute("aria-label", look.title);
        button.addEventListener("click", () => selectLook(look.index, { pause: true, animate: true }));
        return button;
      })
    );
  }

  function createCatalogSet(hidden = false) {
    const set = document.createElement("div");
    set.className = "catalog-set";
    if (hidden) set.setAttribute("aria-hidden", "true");

    looks.forEach(look => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "catalog-card";
      card.dataset.lookIndex = String(look.index);
      card.setAttribute("aria-label", `${look.title} detail`);
      if (hidden) card.setAttribute("tabindex", "-1");

      const image = document.createElement("img");
      image.src = look.src;
      image.alt = look.title;
      image.loading = "eager";
      image.decoding = "async";

      const imageFrame = document.createElement("span");
      imageFrame.className = "catalog-card-image";
      imageFrame.appendChild(image);

      const title = document.createElement("span");
      title.className = "catalog-card-label";
      title.textContent = look.title;

      card.append(imageFrame, title);
      card.addEventListener("click", event => {
        if (performance.now() < state.suppressCardClickUntil) {
          event.preventDefault();
          return;
        }

        openDetail(look.index);
      });
      set.appendChild(card);
    });

    return set;
  }

  function createBackgroundSet(hidden = false) {
    const set = document.createElement("div");
    set.className = "catalog-background-set";
    if (hidden) set.setAttribute("aria-hidden", "true");

    looks.forEach(look => {
      const panel = document.createElement("div");
      panel.className = "catalog-background-panel";
      const image = document.createElement("img");
      image.src = look.src;
      image.alt = "";
      image.decoding = "async";
      panel.appendChild(image);
      set.appendChild(panel);
    });

    return set;
  }

  function animate(timestamp) {
    state.animationFrame = 0;

    if (!state.ready) {
      queueAnimation();
      return;
    }

    if (!state.lastFrame) state.lastFrame = timestamp;
    const delta = Math.min((timestamp - state.lastFrame) / 1000, 0.08);
    state.lastFrame = timestamp;

    if (!state.detailOpen && timestamp >= state.pauseUntil) {
      state.foregroundOffset = normalizeOffset(state.foregroundOffset + state.foregroundSpeed * delta, state.foregroundSetWidth);
      state.backgroundOffset = normalizeOffset(state.backgroundOffset + state.backgroundSpeed * delta, state.backgroundSetWidth);
      setTrackTransition(false);
      renderTracks();
      updateActiveFromOffset();
    }

    queueAnimation();
  }

  function selectLook(index, options = {}) {
    const normalizedIndex = normalizeIndex(index);
    const centerOffset = (state.viewportLength - state.cardWidth) / 2;
    state.activeIndex = normalizedIndex;
    state.foregroundOffset = selectionOffset(normalizedIndex * state.itemPitch - centerOffset, state.foregroundSetWidth);
    state.backgroundOffset = selectionOffset(normalizedIndex * state.viewportLength, state.backgroundSetWidth);

    if (options.pause) {
      state.pauseUntil = performance.now() + 10000;
    }

    setTrackTransition(Boolean(options.animate));
    renderTracks();
    renderActiveState();
  }

  function handleCatalogWheel(event) {
    if (!state.ready || state.detailOpen) return;
    if (event.target.closest?.(".site-index-dropdown, .look-detail")) return;

    const wheelDelta = state.isVertical
      ? event.deltaY
      : (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY);
    if (!wheelDelta) return;

    event.preventDefault();
    const normalizedDelta = normalizeWheelDelta(wheelDelta, event.deltaMode);

    state.pauseUntil = performance.now() + 10000;
    state.lastFrame = performance.now();
    applyManualDelta(normalizedDelta);
  }

  function handleTrackPointerDown(event) {
    if (!state.ready || state.detailOpen || !state.isVertical) return;
    if (event.target.closest?.(".site-index-dropdown, .look-detail")) return;

    state.dragPointerId = event.pointerId;
    state.dragLastPosition = event.clientY;
    state.dragMoved = false;

    try {
      track.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Safari may skip capture during quick gestures; move events still work when delivered.
    }
  }

  function handleTrackPointerMove(event) {
    if (state.dragPointerId !== event.pointerId || !state.isVertical || state.detailOpen) return;

    const delta = state.dragLastPosition - event.clientY;
    if (Math.abs(delta) < 0.5) return;

    event.preventDefault();
    state.dragLastPosition = event.clientY;
    state.dragMoved = state.dragMoved || Math.abs(delta) > 2;
    state.pauseUntil = performance.now() + 10000;
    state.lastFrame = performance.now();
    applyManualDelta(delta);
  }

  function handleTrackPointerEnd(event) {
    if (state.dragPointerId !== event.pointerId) return;

    if (state.dragMoved) {
      state.suppressCardClickUntil = performance.now() + 250;
    }

    state.dragPointerId = null;
    state.dragMoved = false;

    try {
      track.releasePointerCapture?.(event.pointerId);
    } catch (error) {
      // Pointer capture is best-effort only.
    }
  }

  function applyManualDelta(delta) {
    const foregroundDelta = delta * 0.82;
    const backgroundDelta = foregroundDelta * (state.backgroundSetWidth / state.foregroundSetWidth);

    state.foregroundOffset = normalizeOffset(state.foregroundOffset + foregroundDelta, state.foregroundSetWidth);
    state.backgroundOffset = normalizeOffset(state.backgroundOffset + backgroundDelta, state.backgroundSetWidth);

    setTrackTransition(false);
    renderTracks();
    updateActiveFromOffset();
  }

  function openDetail(index) {
    selectLook(index, { pause: true, animate: true });
    const look = looks[normalizeIndex(index)];
    const requestId = state.detailRequestId + 1;
    state.detailOpen = true;
    state.detailLookIndex = look.index;
    state.selectedDetailImage = look.src;
    state.detailImages = [];
    state.detailRequestId = requestId;
    clearDescriptionTimer();
    clearDetailEntryTimer();
    document.querySelectorAll(".site-index-dropdown[open]").forEach(dropdown => {
      dropdown.open = false;
    });
    document.body.classList.remove("index-open");
    document.body.classList.add("catalog-detail-open");
    renderDetail();

    detail?.classList.remove("entry-complete");
    detail?.classList.add("is-open");
    detail?.setAttribute("aria-hidden", "false");
    playDetailDescription();
    state.detailEntryTimer = window.setTimeout(() => {
      detail?.classList.add("entry-complete");
    }, 1300);
    backButton?.focus({ preventScroll: true });

    discoverLookImages(look).then(images => {
      if (!state.detailOpen || state.detailRequestId !== requestId) return;
      state.detailImages = images;
      renderDetailSlots(look, state.selectedDetailImage);
    });
  }

  function renderDetail() {
    const look = looks[state.detailLookIndex];
    const selectedImage = state.selectedDetailImage || look.src;

    updateDetailPrimary(selectedImage);
    if (detailTitle) detailTitle.textContent = look.title;
    if (detailDescription) detailDescription.textContent = prefersReducedMotion.matches ? detailDescriptionCopy : "";

    renderDetailSlots(look, selectedImage);
  }

  function renderDetailSlots(look, selectedImage) {
    if (!detailSlots) return;

    const slotImages = state.detailImages;
    detailSlots.style.setProperty("--look-slot-count", String(Math.max(1, slotImages.length)));

    if (!slotImages.length) {
      detailSlots.replaceChildren();
      return;
    }

    detailSlots.replaceChildren(...slotImages.map((image, index) => createDetailSlot(image, selectedImage, index)));
  }

  function createDetailSlot(image, selectedImage, slotIndex) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "look-slot";
    button.dataset.imageSrc = image.src;
    button.style.setProperty("--slot-index", String(slotIndex));
    button.setAttribute("aria-label", image.title);
    button.classList.toggle("is-selected", image.src === selectedImage);

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.title;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      button.classList.add("is-empty");
      button.disabled = true;
      img.remove();
      button.setAttribute("aria-label", "Image slot pending");
    }, { once: true });

    button.appendChild(img);
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.selectedDetailImage = image.src;
      updateDetailPrimary(image.src);
      updateDetailSlotSelection();
    });

    return button;
  }

  function updateDetailPrimary(src) {
    const look = looks[state.detailLookIndex];
    const selectedTitle = src === look.src ? look.title : `${look.title} IMAGE ${detailImageNumber(src)}`;

    if (detailImage) {
      detailImage.src = src;
      detailImage.alt = selectedTitle;
    }
  }

  function updateDetailSlotSelection() {
    detailSlots?.querySelectorAll(".look-slot").forEach(slot => {
      slot.classList.toggle("is-selected", slot.dataset.imageSrc === state.selectedDetailImage);
    });
  }

  async function discoverLookImages(look) {
    const lookNumber = look.index + 1;
    const images = [];

    // Static pages cannot list folders, so probe the established sequential filename pattern.
    for (let imageNumber = 1; imageNumber <= maxLookImages; imageNumber += 1) {
      const image = await findExistingLookImage(look, lookNumber, imageNumber);
      if (!image) break;
      images.push(image);
    }

    return images;
  }

  async function findExistingLookImage(look, lookNumber, imageNumber) {
    for (const extension of lookImageExtensions) {
      const src = `assets/images/Looks/${lookNumber}/look ${lookNumber}-${imageNumber}.${extension}`;
      if (await imageExists(src)) {
        return {
          src,
          title: `${look.title} IMAGE ${imageNumber}`
        };
      }
    }

    return null;
  }

  function imageExists(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  function playDetailDescription() {
    clearDescriptionTimer();
    if (!detailDescription) return;

    if (prefersReducedMotion.matches) {
      detailDescription.textContent = detailDescriptionCopy;
      return;
    }

    let characterIndex = 0;
    const startDelay = 520;
    const stepDelay = 18;

    const typeNextCharacter = () => {
      detailDescription.textContent = detailDescriptionCopy.slice(0, characterIndex);
      characterIndex += 1;

      if (characterIndex <= detailDescriptionCopy.length) {
        state.descriptionTimer = window.setTimeout(typeNextCharacter, stepDelay);
      }
    };

    state.descriptionTimer = window.setTimeout(typeNextCharacter, startDelay);
  }

  function clearDescriptionTimer() {
    window.clearTimeout(state.descriptionTimer);
    state.descriptionTimer = 0;
  }

  function clearDetailEntryTimer() {
    window.clearTimeout(state.detailEntryTimer);
    state.detailEntryTimer = 0;
  }

  function closeDetail() {
    state.detailOpen = false;
    detail?.classList.remove("is-open", "entry-complete");
    document.body.classList.remove("catalog-detail-open");
    detail?.setAttribute("aria-hidden", "true");
    clearDescriptionTimer();
    clearDetailEntryTimer();
    state.pauseUntil = 0;
    state.lastFrame = performance.now();
  }

  async function initializeCatalog() {
    await waitForCatalogAssets();
    await nextFrame();
    updateLayout();
    state.ready = true;
    selectLook(0, { pause: false, animate: false });
    state.lastFrame = performance.now();
    queueAnimation();
  }

  async function waitForCatalogAssets() {
    const imagePromises = Array.from(track.querySelectorAll("img"))
      .slice(0, looks.length)
      .map(image => {
        if (image.complete) return Promise.resolve();
        return new Promise(resolve => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      });

    const fontPromise = document.fonts?.ready?.catch(() => undefined) || Promise.resolve();
    await Promise.race([
      Promise.all([...imagePromises, fontPromise]),
      delay(1400)
    ]);
  }

  function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }

  function delay(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  function queueAnimation() {
    if (state.animationFrame) window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = requestAnimationFrame(animate);
  }

  function scheduleLayoutRefresh() {
    window.clearTimeout(state.layoutTimer);
    state.layoutTimer = window.setTimeout(refreshLayout, 90);
  }

  function refreshLayout() {
    if (!state.ready) return;
    const activeIndex = state.activeIndex;
    updateLayout();
    selectLook(activeIndex, { pause: false, animate: false });
    state.lastFrame = performance.now();
  }

  function resumeCatalog() {
    if (!state.ready) return;
    refreshLayout();
    queueAnimation();
  }

  function updateLayout() {
    const firstSet = track.querySelector(".catalog-set");
    const secondSet = backgroundTrack.querySelector(".catalog-background-set");
    const firstCard = track.querySelector(".catalog-card");
    if (!firstSet || !secondSet || !firstCard) return;

    const isVertical = window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
    const setStyles = getComputedStyle(firstSet);
    const gap = Number.parseFloat((isVertical ? setStyles.rowGap : setStyles.columnGap) || "0") || 0;
    const foregroundSpeed = prefersReducedMotion.matches ? 0 : (isVertical ? 13.95 : 21.7);
    const cardLength = measureLength(firstCard, isVertical);
    const setLength = measureLength(firstSet, isVertical, true);
    const backgroundSetLength = measureLength(secondSet, isVertical, true);
    const viewportLength = isVertical
      ? (window.visualViewport?.height || window.innerHeight)
      : window.innerWidth;

    state.isVertical = isVertical;
    document.body.classList.toggle("catalog-vertical", isVertical);
    slider.setAttribute("aria-orientation", isVertical ? "vertical" : "horizontal");

    state.viewportLength = Math.max(1, viewportLength);
    state.cardWidth = Math.max(1, cardLength);
    state.itemPitch = Math.max(1, cardLength + gap);
    state.foregroundSetWidth = Math.max(1, setLength);
    state.backgroundSetWidth = Math.max(1, backgroundSetLength);
    state.foregroundSpeed = foregroundSpeed;
    state.backgroundSpeed = foregroundSpeed * (state.backgroundSetWidth / state.foregroundSetWidth);
  }

  function updateActiveFromOffset() {
    const centerPoint = normalizeOffset(state.foregroundOffset + (state.viewportLength - state.cardWidth) / 2, state.foregroundSetWidth);
    const nextIndex = normalizeIndex(Math.round(centerPoint / state.itemPitch));
    if (nextIndex === state.activeIndex) return;

    state.activeIndex = nextIndex;
    renderActiveState();
  }

  function renderTracks() {
    if (state.isVertical) {
      track.style.transform = `translate3d(0, ${-state.foregroundOffset}px, 0)`;
      backgroundTrack.style.transform = `translate3d(0, ${-state.backgroundOffset}px, 0) scale(1.04)`;
      return;
    }

    track.style.transform = `translate3d(${-state.foregroundOffset}px, 0, 0)`;
    backgroundTrack.style.transform = `translate3d(${-state.backgroundOffset}px, 0, 0) scale(1.04)`;
  }

  function renderActiveState() {
    document.documentElement.style.setProperty("--active-index", String(state.activeIndex));
    const activePosition = `${(state.activeIndex / (looks.length - 1)) * 100}%`;
    document.documentElement.style.setProperty("--active-position", activePosition);
    slider.setAttribute("aria-valuenow", String(state.activeIndex + 1));
    slider.setAttribute("aria-valuetext", looks[state.activeIndex].title);

    dotsWrap.querySelectorAll(".catalog-dot").forEach((dot, index) => {
      dot.classList.toggle("is-active", index === state.activeIndex);
    });

    track.querySelectorAll(".catalog-card").forEach(card => {
      card.classList.toggle("is-active", Number(card.dataset.lookIndex) === state.activeIndex);
    });
  }

  function setTrackTransition(enabled) {
    window.clearTimeout(state.manualTransitionTimer);

    if (!enabled) {
      track.style.transition = "none";
      backgroundTrack.style.transition = "none";
      return;
    }

    track.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
    backgroundTrack.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
    state.manualTransitionTimer = window.setTimeout(() => {
      track.style.transition = "none";
      backgroundTrack.style.transition = "none";
    }, 800);
  }

  function indexFromPointer(event) {
    const box = slider.getBoundingClientRect();
    const pointerPosition = state.isVertical
      ? (event.clientY - box.top) / box.height
      : (event.clientX - box.left) / box.width;
    const ratio = Math.min(1, Math.max(0, pointerPosition));
    return Math.round(ratio * (looks.length - 1));
  }

  function measureLength(element, vertical, includeScroll = false) {
    const rect = element.getBoundingClientRect();
    if (vertical) return includeScroll ? (element.scrollHeight || rect.height) : (element.offsetHeight || rect.height);
    return includeScroll ? (element.scrollWidth || rect.width) : (element.offsetWidth || rect.width);
  }

  function normalizeWheelDelta(delta, deltaMode) {
    if (deltaMode === WheelEvent.DOM_DELTA_LINE) return delta * 16;
    if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * window.innerHeight;
    return delta;
  }

  function normalizeIndex(index) {
    return ((index % looks.length) + looks.length) % looks.length;
  }

  function normalizeOffset(offset, width) {
    if (!width) return 0;
    return ((offset % width) + width) % width;
  }

  function selectionOffset(offset, width) {
    if (!Number.isFinite(offset) || !width) return 0;
    return Math.min(Math.max(0, offset), Math.max(0, width - 1));
  }

  function detailImageNumber(src) {
    const match = src.match(/-(\d+)\.png$/);
    return match ? match[1] : "";
  }
});
