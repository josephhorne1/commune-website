const viewport = document.querySelector(".phase-viewport");
const panels = [...document.querySelectorAll(".phase")];
const buttons = [...document.querySelectorAll(".phase-nav button")];
const progress = document.querySelector(".phase-progress span");
const backButton = document.querySelector(".back-to-concept");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeIndex = 0;
let wheelTotal = 0;
let wheelTimer;
let transitionLocked = false;
let frame;

function panelScroller(index = activeIndex) {
  return panels[index]?.querySelector(".phase-scroll");
}

function setActive(index) {
  activeIndex = Math.max(0, Math.min(panels.length - 1, index));
  buttons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === activeIndex);
    button.setAttribute("aria-current", buttonIndex === activeIndex ? "step" : "false");
  });
  progress.style.transform = `translateX(${activeIndex * 100}%)`;
  buttons[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function goToPhase(index, direction = 0, immediate = false) {
  const nextIndex = Math.max(0, Math.min(panels.length - 1, index));
  if (nextIndex === activeIndex && !immediate) return;
  const nextScroller = panelScroller(nextIndex);
  if (nextScroller) {
    nextScroller.scrollTop = direction < 0 ? nextScroller.scrollHeight : 0;
  }
  setActive(nextIndex);
  viewport.scrollTo({
    left: nextIndex * viewport.clientWidth,
    behavior: immediate || reducedMotion.matches ? "auto" : "smooth",
  });
  transitionLocked = !immediate;
  window.setTimeout(() => { transitionLocked = false; }, reducedMotion.matches ? 20 : 520);
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const direction = index < activeIndex ? -1 : 1;
    goToPhase(index, direction);
  });
});

viewport.addEventListener("scroll", () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const index = Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
    if (index !== activeIndex) setActive(index);
  });
}, { passive: true });

viewport.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const scroller = panelScroller();
  if (!scroller) return;

  const direction = Math.sign(event.deltaY);
  const atTop = scroller.scrollTop <= 1;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  const canMoveInside = direction > 0 ? !atBottom : !atTop;

  if (canMoveInside) {
    event.preventDefault();
    scroller.scrollTop += event.deltaY;
    wheelTotal = 0;
    return;
  }

  if (direction < 0 && activeIndex === 0) return;
  event.preventDefault();
  if (transitionLocked) return;

  wheelTotal += event.deltaY;
  clearTimeout(wheelTimer);
  wheelTimer = window.setTimeout(() => { wheelTotal = 0; }, 180);

  if (Math.abs(wheelTotal) > 55) {
    goToPhase(activeIndex + direction, direction);
    wheelTotal = 0;
  }
}, { passive: false });

viewport.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    goToPhase(activeIndex + 1, 1);
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goToPhase(activeIndex - 1, -1);
  }
  if (event.key === "Home") {
    event.preventDefault();
    goToPhase(0, 1);
  }
  if (event.key === "End") {
    event.preventDefault();
    goToPhase(panels.length - 1, -1);
  }
});

backButton.addEventListener("click", () => {
  panels.forEach((panel) => {
    const scroller = panel.querySelector(".phase-scroll");
    if (scroller) scroller.scrollTop = 0;
  });
  transitionLocked = false;
  goToPhase(0, 1, reducedMotion.matches);
});

window.addEventListener("resize", () => {
  viewport.scrollLeft = activeIndex * viewport.clientWidth;
});

setActive(0);
