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
  if (!track || !backgroundTrack || !dotsWrap || !slider) return;

  const state = {
    activeIndex: 0,
    foregroundOffset: 0,
    backgroundOffset: 0,
    foregroundSetWidth: 1,
    backgroundSetWidth: 1,
    itemPitch: 1,
    cardWidth: 1,
    foregroundSpeed: 0,
    backgroundSpeed: 0,
    lastFrame: 0,
    ready: false,
    pauseUntil: 0,
    detailOpen: false,
    detailLookIndex: 0,
    selectedDetailImage: null,
    manualTransitionTimer: null,
    animationFrame: 0,
    layoutTimer: 0,
    descriptionTimer: 0,
    detailEntryTimer: 0
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
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();

    if (event.key === "Home") {
      selectLook(0, { pause: true, animate: true });
      return;
    }

    if (event.key === "End") {
      selectLook(looks.length - 1, { pause: true, animate: true });
      return;
    }

    const direction = event.key === "ArrowRight" ? 1 : -1;
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

      const title = document.createElement("span");
      title.className = "catalog-card-title";
      title.textContent = look.title;

      card.append(image, title);
      card.addEventListener("click", () => openDetail(look.index));
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
    const centerOffset = (window.innerWidth - state.cardWidth) / 2;
    state.activeIndex = normalizedIndex;
    state.foregroundOffset = selectionOffset(normalizedIndex * state.itemPitch - centerOffset, state.foregroundSetWidth);
    state.backgroundOffset = selectionOffset(normalizedIndex * window.innerWidth, state.backgroundSetWidth);

    if (options.pause) {
      state.pauseUntil = performance.now() + 10000;
    }

    setTrackTransition(Boolean(options.animate));
    renderTracks();
    renderActiveState();
  }

  function openDetail(index) {
    selectLook(index, { pause: true, animate: true });
    const look = looks[normalizeIndex(index)];
    state.detailOpen = true;
    state.detailLookIndex = look.index;
    state.selectedDetailImage = look.src;
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

    const slotImages = [
      {
        src: look.src,
        title: `${look.title} ORIGINAL`,
        isOriginal: true
      },
      ...Array.from({ length: 4 }, (_, slotIndex) => ({
        src: `assets/images/Looks/${look.index + 1}/look ${look.index + 1}-${slotIndex + 1}.png`,
        title: `${look.title} IMAGE ${slotIndex + 1}`,
        isOriginal: false
      }))
    ];

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

    const cardBox = firstCard.getBoundingClientRect();
    const setBox = firstSet.getBoundingClientRect();
    const backgroundSetBox = secondSet.getBoundingClientRect();
    const gap = Number.parseFloat(getComputedStyle(firstSet).columnGap || "0") || 0;
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const foregroundSpeed = isMobile ? 9 : 14;

    state.cardWidth = Math.max(1, cardBox.width);
    state.itemPitch = Math.max(1, cardBox.width + gap);
    state.foregroundSetWidth = Math.max(1, setBox.width);
    state.backgroundSetWidth = Math.max(1, backgroundSetBox.width);
    state.foregroundSpeed = foregroundSpeed;
    state.backgroundSpeed = foregroundSpeed * (state.backgroundSetWidth / state.foregroundSetWidth);
  }

  function updateActiveFromOffset() {
    const centerPoint = normalizeOffset(state.foregroundOffset + (window.innerWidth - state.cardWidth) / 2, state.foregroundSetWidth);
    const nextIndex = normalizeIndex(Math.round(centerPoint / state.itemPitch));
    if (nextIndex === state.activeIndex) return;

    state.activeIndex = nextIndex;
    renderActiveState();
  }

  function renderTracks() {
    track.style.transform = `translate3d(${-state.foregroundOffset}px, 0, 0)`;
    backgroundTrack.style.transform = `translate3d(${-state.backgroundOffset}px, 0, 0) scale(1.04)`;
  }

  function renderActiveState() {
    document.documentElement.style.setProperty("--active-index", String(state.activeIndex));
    document.documentElement.style.setProperty("--active-position", `${(state.activeIndex / (looks.length - 1)) * 100}%`);
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
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    return Math.round(ratio * (looks.length - 1));
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
