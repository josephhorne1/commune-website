const phaseButtons = [...document.querySelectorAll(".phase-nav [data-target]")];
const phaseSections = phaseButtons
  .map((button) => document.getElementById(button.dataset.target))
  .filter(Boolean);
const showButtons = [...document.querySelectorAll(".show-toggle [data-video]")];
const livestream = document.querySelector("#livestream");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setActivePhase(id) {
  phaseButtons.forEach((button) => {
    const isActive = button.dataset.target === id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
}

phaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

const phaseObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActivePhase(visible.target.id);
  },
  { rootMargin: "-18% 0px -48% 0px", threshold: [0.05, 0.2, 0.45] },
);

phaseSections.forEach((section) => phaseObserver.observe(section));

showButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    showButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    livestream.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}`;
    livestream.title = `Mass Exodus 2024 Show ${index + 1} livestream`;
  });
});

setActivePhase(phaseSections[0]?.id);
