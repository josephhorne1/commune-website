const root = document.documentElement;
const progress = document.querySelector(".scroll-progress span");
const heroParallax = document.querySelector("[data-parallax]");
const compare = document.querySelector(".compare");
const compareRange = document.querySelector("#compare-range");
const productRange = document.querySelector("#product-range");
const productStage = document.querySelector(".product-viewer__stage");

const products = [
  {
    name: "Alga Tanah",
    translation: "Land Algae",
    image: "assets/aira/alga-tanah.webp",
    alt: "Black and earth-toned Alga Tanah sandal",
    description: "A multi-strap sandal built around a hemp canvas upper and algae-foam outsole.",
  },
  {
    name: "Tapak Rimau",
    translation: "Tiger’s Footprint",
    image: "assets/aira/tapak-rimau.webp",
    alt: "Black and brown Tapak Rimau terrain shoe",
    description: "A water-resistant, vented terrain shoe focused on durable traction and tropical breathability.",
  },
  {
    name: "Bayu Aira",
    translation: "Water Breeze",
    image: "assets/aira/bayu-aira.webp",
    alt: "Black Bayu Aira water shoe",
    description: "A close-to-barefoot water shoe with a mesh sock upper, sturdy inner shank, and heavy-traction outsole.",
  },
];

function updateScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.transform = `scaleX(${ratio})`;

  if (heroParallax && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const offset = Math.min(window.scrollY * 0.08, 64);
    heroParallax.style.setProperty("--py", `${offset}px`);
  }
}

window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

if (heroParallax && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 20;
    const y = (event.clientY / window.innerHeight - 0.5) * 12 + Math.min(window.scrollY * 0.08, 64);
    heroParallax.style.setProperty("--px", `${x}px`);
    heroParallax.style.setProperty("--py", `${y}px`);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

if (compare && compareRange) {
  const setReveal = (value) => compare.style.setProperty("--reveal", `${value}%`);
  compareRange.addEventListener("input", () => setReveal(compareRange.value));
  setReveal(compareRange.value);
}

function setProduct(index) {
  const product = products[index];
  const image = document.querySelector("#product-image");
  productStage.classList.add("is-changing");

  window.setTimeout(() => {
    image.src = product.image;
    image.alt = product.alt;
    document.querySelector("#product-name").textContent = product.name;
    document.querySelector("#product-translation").textContent = product.translation;
    document.querySelector("#product-description").textContent = product.description;
    document.querySelector("#product-count").textContent = `0${index + 1} / 03`;
    document.querySelector(".product-viewer__number").textContent = `0${index + 1}`;
    image.addEventListener("load", () => productStage.classList.remove("is-changing"), { once: true });
    if (image.complete) productStage.classList.remove("is-changing");
  }, 220);
}

if (productRange) {
  productRange.addEventListener("input", () => setProduct(Number(productRange.value)));
}

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    const marker = detail.querySelector("summary span:last-child");
    if (marker && (marker.textContent === "+" || marker.textContent === "−")) {
      marker.textContent = detail.open ? "−" : "+";
    }
  });
});
