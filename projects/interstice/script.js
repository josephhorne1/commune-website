const root = document.documentElement;
const progress = document.querySelector(".reading-progress span");
const thresholdInput = document.querySelector("#threshold-range");
const thresholdOutput = document.querySelector(".control-range output");
const lookSelect = document.querySelector("#look-select");
const worldRange = document.querySelector("#world-range");
const worldTrack = document.querySelector(".world-track");

const looks = {
  look1: {
    number: "01",
    category: "Shelter / concealment",
    name: "Soft enclosure",
    image: "assets/interstice/look-01.webp",
    alt: "Look one: a masked figure in an oversized pale fur jacket and distressed skirt",
    description: "A large flapped fur puffer and fully obscured face turn softness into distance. Protection expands until it interrupts recognition.",
    specs: ["Puffer / jersey dress", "Shaggy volume / mask", "Protected / unreadable"],
  },
  look2: {
    number: "02",
    category: "Exposure / interruption",
    name: "Interrupted body",
    image: "assets/interstice/look-02.webp",
    alt: "Look two: a masked figure with a cropped wrap fur top, work pants, and oversized leg warmers",
    description: "A cropped wrap exposes the waist while inflated fur leg warmers swallow the lower body. Practical work pants remain visible between two impossible zones of volume.",
    specs: ["Wrap top / work pants", "Inflated leg volume", "Exposed / armored"],
  },
  look3: {
    number: "03",
    category: "Refuge / weight",
    name: "Padded refuge",
    image: "assets/interstice/look-03.webp",
    alt: "Look three: a seated masked figure in oversized pale fur coveralls",
    description: "Loose fur coveralls, a full-head mask, and boot forms create a seated refuge. The body appears comfortable, sealed, and almost immovable.",
    specs: ["Coverall / rubber boot", "Continuous fur surface", "Resting / enclosed"],
  },
};

function setThreshold(value) {
  const number = Number(value);
  const ratio = number / 100;
  root.style.setProperty("--threshold", ratio.toFixed(2));
  root.style.setProperty("--threshold-percent", `${100 - number}%`);
  root.style.setProperty("--threshold-blur", `${(ratio * 1.15).toFixed(2)}px`);
  const panelSpread = Math.round(8 + ratio * 48);
  root.style.setProperty("--panel-spread", `${panelSpread}px`);
  root.style.setProperty("--panel-negative", `${-panelSpread}px`);
  root.style.setProperty("--panel-half", `${Math.round(panelSpread * 0.5)}px`);
  root.style.setProperty("--panel-reverse", `${Math.round(panelSpread * -0.7)}px`);
  root.style.setProperty("--figure-scale", (0.98 + ratio * 0.16).toFixed(3));
  root.style.setProperty("--figure-shift", `${((ratio - 0.5) * 7).toFixed(2)}vw`);
  root.style.setProperty("--hero-saturate", (0.7 + ratio * 0.35).toFixed(3));
  root.style.setProperty("--hero-contrast", (1 + ratio * 0.15).toFixed(3));
  root.style.setProperty("--hero-scale", (1.03 + ratio * 0.045).toFixed(3));
  root.style.setProperty("--veil-opacity", (0.04 + ratio * 0.14).toFixed(3));
  root.style.setProperty("--title-shift", `${(7 + ratio * 11).toFixed(2)}%`);
  root.style.setProperty("--process-rotate", `${((ratio - 0.5) * 3).toFixed(2)}deg`);
  root.style.setProperty("--world-saturate", (0.72 + ratio * 0.35).toFixed(3));
  thresholdOutput.value = String(number);
  thresholdOutput.textContent = String(number);
}

function updateLook(key) {
  const look = looks[key];
  const image = document.querySelector("#look-image");
  image.classList.add("is-changing");

  window.setTimeout(() => {
    image.src = look.image;
    image.alt = look.alt;
    document.querySelector("#look-number").textContent = look.number;
    document.querySelector("#look-category").textContent = look.category;
    document.querySelector("#look-name").textContent = look.name;
    document.querySelector("#look-description").textContent = look.description;
    document.querySelector("#look-base").textContent = look.specs[0];
    document.querySelector("#look-disruption").textContent = look.specs[1];
    document.querySelector("#look-state").textContent = look.specs[2];
    image.classList.remove("is-changing");
  }, 180);
}

function updateWorld() {
  const viewport = document.querySelector(".world-window");
  const available = Math.max(0, worldTrack.scrollWidth - viewport.clientWidth);
  const shift = -(Number(worldRange.value) / 100) * available;
  worldTrack.style.setProperty("--world-shift", `${shift}px`);
}

function updateScroll() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = available > 0 ? window.scrollY / available : 0;
  progress.style.transform = `scaleX(${ratio})`;
}

thresholdInput.addEventListener("input", () => setThreshold(thresholdInput.value));
lookSelect.addEventListener("change", () => updateLook(lookSelect.value));
worldRange.addEventListener("input", updateWorld);
window.addEventListener("resize", updateWorld);
window.addEventListener("scroll", updateScroll, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    const marker = detail.querySelector("summary span:last-child");
    if (marker && (marker.textContent === "+" || marker.textContent === "−")) {
      marker.textContent = detail.open ? "−" : "+";
    }
  });
});

setThreshold(thresholdInput.value);
updateWorld();
updateScroll();
