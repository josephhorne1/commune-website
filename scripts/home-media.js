import {
  practiceGridImages,
  volumeImages
} from "../assets/media/home-collections/manifest.js";
import { featuredRecords, recordHref } from "../data/portfolio.js";
import {
  getPracticeMosaicColumnCount,
  getPracticeMosaicSlotCount
} from "./practice-mosaic-layout.js";
import {
  createCarouselInteraction,
  manualResponseForSpeed,
  smoothCarouselPosition,
  moveWithinBounds
} from "./carousel-interaction.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isMotionPaused = () => document.body.dataset.motionPaused === "true";

function initialiseMotionToggle(button) {
  const update = (paused) => {
    document.body.dataset.motionPaused = String(paused);
    button.setAttribute("aria-pressed", String(paused));
    button.textContent = paused ? "Resume motion" : "Pause motion";
    window.dispatchEvent(
      new CustomEvent("portfolio-motion-change", { detail: { paused } })
    );
  };

  button.addEventListener("click", () => update(!isMotionPaused()));
  update(isMotionPaused());
}

const createImage = (definition, className, alt = "") => {
  const image = document.createElement("img");
  image.className = className;
  image.src = definition.src;
  image.alt = alt;
  image.width = definition.width;
  image.height = definition.height;
  image.decoding = "async";
  image.draggable = false;
  return image;
};

const shuffled = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

const imageReady = (image) => {
  if (image.complete) {
    return Promise.resolve(image.naturalWidth > 0);
  }

  return new Promise((resolve) => {
    image.addEventListener("load", () => resolve(true), { once: true });
    image.addEventListener("error", () => resolve(false), { once: true });
  });
};

function initialiseProjectTicker(root) {
  const track = root.querySelector("[data-project-ticker-track]");
  const primaryGroup = root.querySelector("[data-project-ticker-group]");
  if (!track || !primaryGroup || !featuredRecords.length) return;

  const records = shuffled(featuredRecords);
  const buildGroup = (isClone = false) => {
    const group = document.createElement("ul");
    group.className = "project-ticker__group";
    if (isClone) {
      group.dataset.projectTickerClone = "";
      group.setAttribute("aria-hidden", "true");
    } else {
      group.dataset.projectTickerGroup = "";
    }

    records.forEach((record, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = recordHref(record);
      link.textContent = `${String(index + 1).padStart(2, "0")} / ${record.title}`;
      link.dataset.record = record.id;
      if (isClone) link.tabIndex = -1;
      item.append(link);
      group.append(item);
    });

    return group;
  };

  const hydratedPrimaryGroup = buildGroup();
  primaryGroup.replaceWith(hydratedPrimaryGroup);
  const clonedGroup = buildGroup(true);
  track.append(clonedGroup);

  const updateDuration = () => {
    const groupWidth = hydratedPrimaryGroup.scrollWidth;
    if (groupWidth <= 0) return;
    const duration = Math.max(16, groupWidth / 140);
    root.style.setProperty("--project-ticker-duration", `${duration.toFixed(2)}s`);
  };

  const markReady = () => {
    updateDuration();
    root.dataset.state = "ready";
  };

  if (document.fonts?.ready) document.fonts.ready.then(markReady, markReady);
  else window.requestAnimationFrame(markReady);

  const resizeObserver = new ResizeObserver(updateDuration);
  resizeObserver.observe(root);
}

function initialiseVolumeMarquee(root) {
  const track = root.querySelector("[data-volume-marquee-track]");
  if (!track || !volumeImages.length) return;

  root.dataset.state = "loading";
  root.dataset.carouselControl = reducedMotion.matches ? "static" : "interactive";
  let groupWidth = 0;
  let position = 0;
  let targetPosition = 0;
  let manualMinimum = null;
  let manualMaximum = null;
  let manualOrigin = null;
  let manualDirection = 0;
  let animationFrame = 0;
  let previousFrameTime = 0;
  let carouselIsVisible = false;
  let interactionPaused = false;
  let manualSpeed = 1;
  const automaticSpeed = 52;

  const groups = [0, 1].map((copyIndex) => {
    const group = document.createElement("span");
    group.className = "volume-marquee__group";
    group.setAttribute("aria-hidden", "true");

    volumeImages.forEach((definition, index) => {
      const item = document.createElement("span");
      item.className = "volume-marquee__item";
      item.dataset.image = definition.id;
      const image = createImage(definition, "volume-marquee__image");
      image.loading = "eager";
      item.append(image);
      group.append(item);
    });

    track.append(group);
    return group;
  });

  const updateDuration = () => {
    const nextWidth = groups[0].scrollWidth;
    if (nextWidth <= 0) return;
    const previousWidth = groupWidth;
    groupWidth = nextWidth;
    if (previousWidth > 0) {
      const widthRatio = groupWidth / previousWidth;
      position *= widthRatio;
      targetPosition *= widthRatio;
      if (manualMinimum !== null) manualMinimum *= widthRatio;
      if (manualMaximum !== null) manualMaximum *= widthRatio;
      if (manualOrigin !== null) manualOrigin *= widthRatio;
    } else {
      targetPosition = position;
    }
    const minimum = manualMinimum ?? 0;
    const maximum = manualMaximum ?? groupWidth;
    position = Math.min(maximum, Math.max(minimum, position));
    targetPosition = Math.min(maximum, Math.max(minimum, targetPosition));
    const duration = Math.max(42, groupWidth / automaticSpeed);
    root.style.setProperty("--volume-duration", `${duration.toFixed(2)}s`);
    applyPosition();
  };

  const applyPosition = () => {
    if (reducedMotion.matches || groupWidth <= 0) return;
    const displayPosition =
      ((position % groupWidth) + groupWidth) % groupWidth;
    track.style.transform = `translate3d(${(displayPosition - groupWidth).toFixed(3)}px, 0, 0)`;
    root.dataset.carouselPosition = position.toFixed(2);
    root.dataset.carouselPhase = displayPosition.toFixed(2);
  };

  const renderingAllowed = () =>
    root.dataset.state === "ready" &&
    carouselIsVisible &&
    !reducedMotion.matches &&
    (interactionPaused || !isMotionPaused()) &&
    !document.hidden;

  const renderFrame = (time) => {
    animationFrame = 0;
    if (!renderingAllowed()) return;
    if (!previousFrameTime) previousFrameTime = time;
    const elapsed = Math.min(80, Math.max(0, time - previousFrameTime));
    previousFrameTime = time;
    if (interactionPaused) {
      position = smoothCarouselPosition(
        position,
        targetPosition,
        elapsed,
        manualResponseForSpeed(manualSpeed)
      );
      if (Math.abs(targetPosition - position) <= 0.04) {
        position = targetPosition;
        applyPosition();
        return;
      }
    } else {
      position += (automaticSpeed * elapsed) / 1000;
      if (position >= groupWidth) position %= groupWidth;
      targetPosition = position;
      manualMinimum = null;
      manualMaximum = null;
    }
    applyPosition();
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  const stop = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
  };

  const start = () => {
    if (animationFrame || !renderingAllowed()) return;
    previousFrameTime = 0;
    animationFrame = window.requestAnimationFrame(renderFrame);
  };

  createCarouselInteraction(root, {
    isEnabled: () =>
      root.dataset.state === "ready" && !reducedMotion.matches,
    isDesktop: () =>
      window.matchMedia(
        "(min-width: 64.01rem) and (hover: hover) and (pointer: fine)"
      ).matches,
    isMotionSettled: () =>
      !carouselIsVisible ||
      document.hidden ||
      Math.abs(targetPosition - position) <= 0.04,
    onStart: () => {
      interactionPaused = true;
      targetPosition = position;
      manualMinimum = null;
      manualMaximum = null;
      manualOrigin = null;
      manualDirection = 0;
      manualSpeed = 1;
      previousFrameTime = 0;
      start();
    },
    onMove: (delta, detail) => {
      if (groupWidth <= 0) return { consumed: false };
      const direction = Math.sign(delta) || detail.direction || 1;
      const reversesUncommittedLane =
        manualDirection !== 0 &&
        direction !== manualDirection &&
        manualOrigin !== null &&
        Math.abs(targetPosition - manualOrigin) <= root.clientWidth * 0.12;
      if (
        manualMinimum === null ||
        manualMaximum === null ||
        reversesUncommittedLane
      ) {
        if (reversesUncommittedLane) targetPosition = position;
        manualOrigin = position;
        manualDirection = direction;
        if (direction > 0) {
          manualMinimum = position;
          manualMaximum = position + groupWidth;
        } else {
          manualMinimum = position - groupWidth;
          manualMaximum = position;
        }
      }
      const movement = moveWithinBounds(
        targetPosition,
        delta,
        manualMinimum,
        manualMaximum
      );
      targetPosition = movement.next;
      manualSpeed = detail.speed;
      if (detail.source === "swipe") {
        position = targetPosition;
        applyPosition();
      } else {
        start();
      }

      if (
        detail.source === "wheel" &&
        !movement.consumed &&
        Math.abs(targetPosition - position) > 0.04
      ) {
        return { ...movement, consumed: true };
      }
      return movement;
    },
    onSpeed: (speed) => {
      manualSpeed = speed;
      if (interactionPaused) start();
    },
    onResume: () => {
      interactionPaused = false;
      manualSpeed = 1;
      position = targetPosition;
      position = ((position % groupWidth) + groupWidth) % groupWidth;
      targetPosition = position;
      manualMinimum = null;
      manualMaximum = null;
      manualOrigin = null;
      manualDirection = 0;
      applyPosition();
      start();
    }
  });

  Promise.all(
    [...track.querySelectorAll("img")].map((image) => imageReady(image))
  ).then(() => {
    updateDuration();
    root.dataset.state = "ready";
    applyPosition();
    start();
  });

  const resizeObserver = new ResizeObserver(updateDuration);
  resizeObserver.observe(root);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      carouselIsVisible = Boolean(entry?.isIntersecting);
      if (carouselIsVisible) start();
      else stop();
    },
    { rootMargin: "15% 0px", threshold: 0.01 }
  );
  visibilityObserver.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  reducedMotion.addEventListener("change", () => {
    root.dataset.carouselControl = reducedMotion.matches
      ? "static"
      : "interactive";
    if (reducedMotion.matches) {
      stop();
      track.style.removeProperty("transform");
    } else {
      applyPosition();
      start();
    }
  });
  window.addEventListener("portfolio-motion-change", (event) => {
    if (event.detail?.paused && !interactionPaused) stop();
    else start();
  });
}

function initialisePracticeMosaic(root) {
  const grid = root.querySelector("[data-practice-mosaic-grid]");
  const count = root.querySelector("[data-practice-mosaic-count]");
  if (!grid || !practiceGridImages.length) return;

  const slots = [];
  let columnCount = 0;
  let mosaicIsVisible = false;
  let resizeFrame = 0;

  const createSlot = (index) => {
    const definition = practiceGridImages[index % practiceGridImages.length];
    const alternateDefinition =
      practiceGridImages[
        (index + Math.ceil(practiceGridImages.length / 2)) %
          practiceGridImages.length
      ];
    const slot = document.createElement("span");
    const first = createImage(definition, "practice-mosaic__image is-active");
    const second = createImage(alternateDefinition, "practice-mosaic__image");
    first.loading = index < columnCount * 2 ? "eager" : "lazy";
    second.loading = "lazy";
    slot.className = "practice-mosaic__slot";
    slot.style.setProperty("--fade-duration", `${1400 + (index % 6) * 180}ms`);
    slot.append(first, second);
    return {
      element: slot,
      layers: [first, second],
      activeLayer: 0,
      timeout: 0,
      index,
      disposed: false
    };
  };

  const schedule = (slot, opening = false) => {
    window.clearTimeout(slot.timeout);
    if (
      slot.disposed ||
      !mosaicIsVisible ||
      document.hidden ||
      reducedMotion.matches ||
      isMotionPaused()
    ) {
      return;
    }
    const index = slot.index;
    const columns = Math.max(1, columnCount);
    const delay = opening
      ? 900 + (index % columns) * 310 + Math.floor(index / columns) * 170
      : 3200 + ((index * 487) % 3600);
    slot.timeout = window.setTimeout(() => swap(slot), delay);
  };

  const swap = async (slot) => {
    if (
      slot.disposed ||
      !mosaicIsVisible ||
      document.hidden ||
      reducedMotion.matches ||
      isMotionPaused()
    ) {
      return;
    }

    const nextLayer = slot.activeLayer === 0 ? 1 : 0;
    const nextImage = slot.layers[nextLayer];
    const ready = await imageReady(nextImage);

    if (
      slot.disposed ||
      !slot.element.isConnected ||
      !mosaicIsVisible ||
      document.hidden ||
      reducedMotion.matches ||
      isMotionPaused()
    ) {
      return;
    }

    if (ready) {
      slot.layers[slot.activeLayer].classList.remove("is-active");
      nextImage.classList.add("is-active");
      slot.activeLayer = nextLayer;
    }
    schedule(slot);
  };

  const stop = () => {
    slots.forEach((slot) => window.clearTimeout(slot.timeout));
  };

  const start = (opening = false) => {
    if (!mosaicIsVisible || document.hidden || reducedMotion.matches) return;
    slots.forEach((slot) => schedule(slot, opening));
  };

  const syncLayout = (width) => {
    if (!Number.isFinite(width) || width <= 0) return;

    const gridStyles = window.getComputedStyle(grid);
    const rootStyles = window.getComputedStyle(document.documentElement);
    const gap = Number.parseFloat(gridStyles.columnGap) || 0;
    const rootFontSize = Number.parseFloat(rootStyles.fontSize) || 16;
    const nextColumnCount = getPracticeMosaicColumnCount(
      width,
      gap,
      rootFontSize
    );
    const slotCount = getPracticeMosaicSlotCount(nextColumnCount);

    if (nextColumnCount === columnCount && slots.length === slotCount) return;

    columnCount = nextColumnCount;
    grid.style.setProperty("--practice-mosaic-columns", String(columnCount));

    while (slots.length > slotCount) {
      const slot = slots.pop();
      slot.disposed = true;
      window.clearTimeout(slot.timeout);
      slot.element.remove();
    }

    while (slots.length < slotCount) {
      const slot = createSlot(slots.length);
      slots.push(slot);
      grid.append(slot.element);
    }

    if (count) count.textContent = `${slotCount} fragments / live sequence`;
    root.dataset.columns = String(columnCount);
    root.dataset.fragments = String(slotCount);
    start(true);
  };

  syncLayout(grid.getBoundingClientRect().width);

  const resizeObserver = new ResizeObserver(([entry]) => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      syncLayout(entry?.contentRect.width ?? grid.getBoundingClientRect().width);
    });
  });
  resizeObserver.observe(grid);

  const observer = new IntersectionObserver(
    ([entry]) => {
      mosaicIsVisible = Boolean(entry?.isIntersecting);
      if (mosaicIsVisible) start(true);
      else stop();
    },
    { rootMargin: "20% 0px", threshold: 0.01 }
  );
  observer.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start(true);
  });
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) stop();
    else start(true);
  });
  window.addEventListener("portfolio-motion-change", (event) => {
    if (event.detail?.paused) stop();
    else start(true);
  });
  root.dataset.state = "ready";
}

document.querySelectorAll("[data-motion-toggle]").forEach(initialiseMotionToggle);

document
  .querySelectorAll("[data-project-ticker]")
  .forEach(initialiseProjectTicker);

document
  .querySelectorAll("[data-volume-marquee]")
  .forEach(initialiseVolumeMarquee);
document
  .querySelectorAll("[data-practice-mosaic]")
  .forEach(initialisePracticeMosaic);
