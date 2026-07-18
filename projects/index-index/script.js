const root = document.documentElement;
const progress = document.querySelector(".reading-progress span");
const tensionInput = document.querySelector("#composition-tension");
const tensionOutput = document.querySelector(".control-range output");
const garmentSelect = document.querySelector("#garment-select");
const heroObject = document.querySelector(".hero-object");

const garments = {
  trousers: {
    number: "01",
    category: "Lower body / modular",
    name: "Trousers",
    price: "$740 CAD",
    image: "assets/index-index/trousers.webp",
    alt: "INDEX INDEX technical drawing of transformable trousers",
    description: "A removable asymmetric top layer folds into its own pouch, shifting the trouser between tailored uniform and portable equipment.",
    specs: ["Wide tailored leg", "Packable overlay", "Buckles / zip pouch"],
  },
  blazer: {
    number: "02",
    category: "Upper body / tailored",
    name: "Blazer",
    price: "$800 CAD",
    image: "assets/index-index/blazer.webp",
    alt: "INDEX INDEX technical drawing of an adjustable blazer",
    description: "An opening at the sleeve head releases the shoulder for movement while a rear buckle draws the tailored body back to the waist.",
    specs: ["Single-breasted blazer", "Released sleeve head", "Rear waist buckle"],
  },
  shirt: {
    number: "03",
    category: "Upper body / layered",
    name: "Dress shirt",
    price: "$375 CAD",
    image: "assets/index-index/shirt.webp",
    alt: "INDEX INDEX technical drawing of a transformable dress shirt",
    description: "A concealed placket, adjustable length, and removable top layer let a formal shirt contract, open, and reconfigure around activity.",
    specs: ["Concealed placket", "Adjustable length", "Removable zip layer"],
  },
  shorts: {
    number: "04",
    category: "Lower body / layered",
    name: "Tailored shorts",
    price: "$480 CAD",
    image: "assets/index-index/shorts.webp",
    alt: "INDEX INDEX technical drawing of layered tailored shorts",
    description: "An outer tailored shell adjusts at the waist and detaches from flexible inner shorts through a snap at the back waist.",
    specs: ["Tailored outer shell", "Flexible inner short", "Buckle / snap release"],
  },
  gloves: {
    number: "05",
    category: "Accessory / storage",
    name: "Gloves",
    price: "$285 CAD",
    image: "assets/index-index/gloves.webp",
    alt: "INDEX INDEX technical drawing of long gloves with removable pouches",
    description: "A mid-bicep glove combines a removable arm pouch, concealed mitten release, phone-ready fingertips, and rubber grip tread.",
    specs: ["Extended formal line", "Grip / phone function", "Pouch / mitten release"],
  },
  shoes: {
    number: "06",
    category: "Footwear / detachable",
    name: "Shoes",
    price: "$620 CAD",
    image: "assets/index-index/shoes.webp",
    alt: "INDEX INDEX technical drawing of a modular shoe with detachable sole",
    description: "A slipper-like inner shoe locks into a treaded outer sole, moving between indoor comfort and all-purpose outdoor wear.",
    specs: ["Slipper-like inner", "Treaded outer unit", "Toe box / rear lock"],
  },
};

function setTension(value) {
  const ratio = Number(value) / 100;
  root.style.setProperty("--tension", ratio.toFixed(2));
  root.style.setProperty("--object-scale", (0.96 + ratio * 0.26).toFixed(3));
  root.style.setProperty("--object-rotate", `${-7 + ratio * 10}deg`);
  root.style.setProperty("--stage-shift", `${-3 + ratio * 12}vw`);
  tensionOutput.value = String(value);
  tensionOutput.textContent = String(value);
}

function updateGarment(key) {
  const garment = garments[key];
  const image = document.querySelector("#garment-image");
  image.classList.add("is-changing");

  window.setTimeout(() => {
    image.src = garment.image;
    image.alt = garment.alt;
    document.querySelector("#stage-number").textContent = garment.number;
    document.querySelector("#garment-category").textContent = garment.category;
    document.querySelector("#garment-name").textContent = garment.name;
    document.querySelector("#garment-price").textContent = garment.price;
    document.querySelector("#garment-description").textContent = garment.description;
    document.querySelector("#office-code").textContent = garment.specs[0];
    document.querySelector("#trail-code").textContent = garment.specs[1];
    document.querySelector("#mechanism").textContent = garment.specs[2];
    image.classList.remove("is-changing");
  }, 170);
}

function updateScroll() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = available > 0 ? window.scrollY / available : 0;
  progress.style.transform = `scaleX(${ratio})`;

  if (heroObject && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroObject.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.05, 54)}px`);
  }
}

tensionInput.addEventListener("input", () => setTension(tensionInput.value));
garmentSelect.addEventListener("change", () => updateGarment(garmentSelect.value));
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

setTension(tensionInput.value);
updateScroll();
