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
  const detailCaption = document.querySelector("[data-look-caption]");
  const backButton = document.querySelector("[data-look-back]");
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
    pauseUntil: 0,
    detailOpen: false,
    manualTransitionTimer: null
  };

  document.documentElement.style.setProperty("--look-count", String(looks.length));
  document.documentElement.style.setProperty("--active-index", "0");
  document.documentElement.style.setProperty("--active-position", "0%");

  buildTracks();
  buildDots();
  updateLayout();
  selectLook(0, { pause: false, animate: false });
  requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    const activeIndex = state.activeIndex;
    updateLayout();
    selectLook(activeIndex, { pause: false, animate: false });
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
    slider.setPointerCapture(event.pointerId);
    selectLook(indexFromPointer(event), { pause: true, animate: true });
  });

  slider.addEventListener("pointermove", event => {
    if (!slider.hasPointerCapture(event.pointerId)) return;
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

    requestAnimationFrame(animate);
  }

  function selectLook(index, options = {}) {
    const normalizedIndex = normalizeIndex(index);
    const centerOffset = (window.innerWidth - state.cardWidth) / 2;
    state.activeIndex = normalizedIndex;
    state.foregroundOffset = normalizeOffset(normalizedIndex * state.itemPitch - centerOffset, state.foregroundSetWidth);
    state.backgroundOffset = normalizeOffset(normalizedIndex * window.innerWidth, state.backgroundSetWidth);

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
    document.body.classList.add("catalog-detail-open");

    if (detailImage) {
      detailImage.src = look.src;
      detailImage.alt = look.title;
    }
    if (detailTitle) detailTitle.textContent = look.title;
    if (detailCaption) detailCaption.textContent = look.title;

    detail?.classList.add("is-open");
    detail?.setAttribute("aria-hidden", "false");
    backButton?.focus({ preventScroll: true });
  }

  function closeDetail() {
    state.detailOpen = false;
    detail?.classList.remove("is-open");
    document.body.classList.remove("catalog-detail-open");
    detail?.setAttribute("aria-hidden", "true");
    state.pauseUntil = 0;
    state.lastFrame = performance.now();
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
    const duration = isMobile ? 115 : 90;

    state.cardWidth = cardBox.width;
    state.itemPitch = cardBox.width + gap;
    state.foregroundSetWidth = setBox.width;
    state.backgroundSetWidth = backgroundSetBox.width;
    state.foregroundSpeed = state.foregroundSetWidth / duration;
    state.backgroundSpeed = state.backgroundSetWidth / duration;
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
});
