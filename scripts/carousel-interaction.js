export const MANUAL_RESUME_DELAY_MS = 3000;
export const MAXIMUM_WHEEL_ACCELERATION = 6;
export const MAXIMUM_MOTION_BLUR_PX = 4.5;

const WHEEL_VISUAL_SETTLE_MS = 220;
const SWIPE_AXIS_THRESHOLD_PX = 8;
const CLICK_SUPPRESSION_MS = 650;

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

export function normalizeWheelDelta(
  delta,
  deltaMode = 0,
  lineHeight = 16,
  pageHeight = 800
) {
  if (!Number.isFinite(delta)) return 0;
  if (deltaMode === 1) return delta * lineHeight;
  if (deltaMode === 2) return delta * pageHeight;
  return delta;
}

export function exponentialWheelMultiplier(
  burstCount,
  isDesktop = true,
  maximum = MAXIMUM_WHEEL_ACCELERATION
) {
  if (!isDesktop) return 1;
  const exponent = clamp(Number(burstCount) || 0, 0, 12) / 4;
  return Math.min(maximum, 2 ** exponent);
}

export function nextWheelEnergy(
  previousEnergy,
  delta,
  elapsed,
  sameDirection = true
) {
  const impulse = Math.min(2.8, Math.abs(Number(delta) || 0) / 40);
  if (!sameDirection || !Number.isFinite(elapsed) || elapsed > 260) {
    return impulse * 0.25;
  }
  const decay = Math.exp(-clamp(elapsed, 0, 500) / 260);
  return clamp((Number(previousEnergy) || 0) * decay + impulse, 0, 12);
}

export function exponentialWheelSpeedForEnergy(
  energy,
  isDesktop = true,
  maximum = MAXIMUM_WHEEL_ACCELERATION
) {
  if (!isDesktop) return 1;
  const exponent = clamp(
    ((Number(energy) || 0) - 1.25) / 1.35,
    0,
    Math.log2(maximum)
  );
  return Math.min(maximum, 2 ** exponent);
}

export function motionBlurForSpeed(
  speed,
  maximumSpeed = MAXIMUM_WHEEL_ACCELERATION,
  maximumBlur = MAXIMUM_MOTION_BLUR_PX
) {
  const normalized = clamp(
    ((Number(speed) || 1) - 1) / Math.max(1, maximumSpeed - 1),
    0,
    1
  );
  return maximumBlur * normalized ** 0.72;
}

export function manualResponseForSpeed(speed) {
  return clamp(132 / Math.sqrt(Math.max(1, Number(speed) || 1)), 48, 132);
}

export function smoothCarouselPosition(
  current,
  target,
  elapsed,
  response = 110
) {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return target;
  const distance = target - current;
  if (Math.abs(distance) <= 0.001) return target;
  const frameTime = clamp(Number(elapsed) || 0, 0, 80);
  const factor = 1 - Math.exp(-frameTime / Math.max(16, response));
  return current + distance * factor;
}

export function moveWithinBounds(position, delta, minimum, maximum) {
  const safePosition = clamp(position, minimum, maximum);
  const next = clamp(safePosition + delta, minimum, maximum);
  const applied = next - safePosition;
  return {
    next,
    applied,
    residual: delta - applied,
    consumed: Math.abs(applied) > 0.001,
    atStart: next <= minimum + 0.001,
    atEnd: next >= maximum - 0.001
  };
}

export function createCarouselInteraction(root, options) {
  if (!root || typeof options?.onMove !== "function") return null;

  let resumeTimer = 0;
  let speedSettleTimer = 0;
  let interactionActive = false;
  let focusPaused = false;
  let pointerState = null;
  let suppressClickUntil = 0;
  let lastWheelAt = 0;
  let lastWheelDirection = 0;
  let wheelEnergy = 0;

  const isEnabled = () => options.isEnabled?.() !== false;
  const isDesktop = () =>
    options.isDesktop?.() ??
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setSpeed = (speed) => {
    const safeSpeed = Number.isFinite(speed) ? speed : 1;
    const blur = motionBlurForSpeed(safeSpeed);
    root.dataset.carouselSpeed = safeSpeed.toFixed(2);
    root.dataset.carouselMotion = blur > 0.2 ? "accelerated" : "steady";
    root.style?.setProperty(
      "--carousel-motion-blur",
      `${blur.toFixed(2)}px`
    );
    options.onSpeed?.(safeSpeed);
  };

  const settleSpeed = () => {
    if (isEnabled() && options.isMotionSettled?.() === false) {
      speedSettleTimer = window.setTimeout(settleSpeed, 60);
      return;
    }
    speedSettleTimer = 0;
    setSpeed(1);
  };

  const scheduleSpeedSettle = () => {
    window.clearTimeout(speedSettleTimer);
    speedSettleTimer = window.setTimeout(
      settleSpeed,
      WHEEL_VISUAL_SETTLE_MS
    );
  };

  const begin = (source) => {
    window.clearTimeout(resumeTimer);
    resumeTimer = 0;
    delete root.dataset.carouselResume;
    root.dataset.carouselInteraction = source;
    if (interactionActive) return;
    interactionActive = true;
    options.onStart?.(source);
  };

  const resume = () => {
    resumeTimer = 0;
    if (pointerState || focusPaused) return;
    window.clearTimeout(speedSettleTimer);
    speedSettleTimer = 0;
    delete root.dataset.carouselResume;
    interactionActive = false;
    wheelEnergy = 0;
    lastWheelDirection = 0;
    setSpeed(1);
    root.dataset.carouselInteraction = "auto";
    options.onResume?.();
  };

  const scheduleResume = () => {
    window.clearTimeout(resumeTimer);
    root.dataset.carouselResume = "pending";
    resumeTimer = window.setTimeout(resume, MANUAL_RESUME_DELAY_MS);
  };

  const onWheel = (event) => {
    if (!isEnabled() || event.ctrlKey) return;

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    const rawDelta = normalizeWheelDelta(
      dominantDelta,
      event.deltaMode,
      16,
      Math.max(1, window.innerHeight)
    );
    if (Math.abs(rawDelta) < 0.01) return;

    const now = performance.now();
    const direction = Math.sign(rawDelta);
    const elapsedSinceWheel = lastWheelAt ? now - lastWheelAt : Infinity;
    wheelEnergy = nextWheelEnergy(
      wheelEnergy,
      rawDelta,
      elapsedSinceWheel,
      direction === lastWheelDirection
    );
    lastWheelAt = now;
    lastWheelDirection = direction;

    const speed = exponentialWheelSpeedForEnergy(
      wheelEnergy,
      isDesktop()
    );
    const maximumStep = Math.max(64, root.clientWidth * 0.58);
    const acceleratedDelta = clamp(
      rawDelta * speed,
      -maximumStep,
      maximumStep
    );

    begin("wheel");
    const movement = options.onMove(acceleratedDelta, {
      source: "wheel",
      speed,
      rawDelta,
      direction
    });
    if (movement?.consumed || Math.abs(movement?.applied || 0) > 0.001) {
      setSpeed(speed);
    }
    if (movement?.consumed) event.preventDefault();
    scheduleSpeedSettle();
    scheduleResume();
  };

  const onPointerDown = (event) => {
    if (
      !isEnabled() ||
      !event.isPrimary ||
      !["touch", "pen"].includes(event.pointerType)
    ) {
      return;
    }

    const priorInteractionActive = interactionActive;
    if (priorInteractionActive) {
      window.clearTimeout(resumeTimer);
      resumeTimer = 0;
    }
    pointerState = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      axis: null,
      dragged: false,
      priorInteractionActive
    };
  };

  const onPointerMove = (event) => {
    if (!pointerState || event.pointerId !== pointerState.id) return;

    const totalX = event.clientX - pointerState.startX;
    const totalY = event.clientY - pointerState.startY;
    if (!pointerState.axis) {
      if (
        Math.abs(totalX) >= SWIPE_AXIS_THRESHOLD_PX &&
        Math.abs(totalX) > Math.abs(totalY) * 1.12
      ) {
        pointerState.axis = "horizontal";
        pointerState.dragged = true;
        focusPaused = false;
        window.clearTimeout(speedSettleTimer);
        speedSettleTimer = 0;
        begin("swipe");
        wheelEnergy = 0;
        lastWheelDirection = 0;
        setSpeed(1);
        try {
          root.setPointerCapture?.(event.pointerId);
        } catch {
          // Synthetic pointer events and interrupted gestures cannot be captured.
        }
      } else if (
        Math.abs(totalY) >= SWIPE_AXIS_THRESHOLD_PX &&
        Math.abs(totalY) > Math.abs(totalX)
      ) {
        pointerState.axis = "vertical";
      } else {
        return;
      }
    }

    if (pointerState.axis !== "horizontal") return;
    event.preventDefault();
    const delta = event.clientX - pointerState.lastX;
    pointerState.lastX = event.clientX;
    options.onMove(delta, {
      source: "swipe",
      speed: 1,
      rawDelta: delta,
      direction: Math.sign(delta)
    });
  };

  const releasePointer = (event) => {
    if (!pointerState || event.pointerId !== pointerState.id) return;
    const shouldResume =
      pointerState.axis === "horizontal" || pointerState.priorInteractionActive;
    if (pointerState.dragged) {
      suppressClickUntil = performance.now() + CLICK_SUPPRESSION_MS;
    }
    if (root.hasPointerCapture?.(event.pointerId)) {
      try {
        root.releasePointerCapture(event.pointerId);
      } catch {
        // The browser may have released capture before pointercancel arrives.
      }
    }
    pointerState = null;
    if (shouldResume) scheduleResume();
  };

  const onClick = (event) => {
    if (performance.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onFocusIn = () => {
    if (!isEnabled() || pointerState) return;
    focusPaused = true;
    begin("focus");
    setSpeed(1);
  };

  const onFocusOut = () => {
    queueMicrotask(() => {
      if (!root.contains(document.activeElement)) {
        focusPaused = false;
        scheduleResume();
      }
    });
  };

  root.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("pointerdown", onPointerDown, true);
  root.addEventListener("pointermove", onPointerMove, true);
  root.addEventListener("pointerup", releasePointer, true);
  root.addEventListener("pointercancel", releasePointer, true);
  root.addEventListener("click", onClick, true);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  root.dataset.carouselInteraction = "auto";
  setSpeed(1);

  return {
    cancelResume() {
      window.clearTimeout(resumeTimer);
      resumeTimer = 0;
    },
    resume,
    scheduleResume,
    dispose() {
      window.clearTimeout(resumeTimer);
      window.clearTimeout(speedSettleTimer);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("pointermove", onPointerMove, true);
      root.removeEventListener("pointerup", releasePointer, true);
      root.removeEventListener("pointercancel", releasePointer, true);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    }
  };
}
