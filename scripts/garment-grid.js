import { fashionTurntables } from "../assets/media/fashion-turntables/manifest.js";

const gallery = document.querySelector("[data-garment-gallery]");

if (gallery) {
  const grid = gallery.querySelector("[data-garment-gallery-grid]");
  const motionToggle = gallery.querySelector("[data-garment-motion-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection?.saveData);
  const tiles = [];
  let motionPaused = false;

  fashionTurntables.forEach((look, index) => {
    const figure = document.createElement("figure");
    const media = document.createElement("span");
    const image = document.createElement("img");
    const caption = document.createElement("figcaption");
    const number = String(index + 1).padStart(2, "0");

    figure.className = "garment-gallery__item";
    media.className = "garment-gallery__media";
    image.className = "garment-gallery__image";
    image.src = look.poster;
    image.dataset.poster = look.poster;
    image.dataset.animated = look.src;
    image.alt = `Self-directed garment turntable ${number}`;
    image.width = look.width;
    image.height = look.height;
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    caption.innerHTML = `<span>Look ${number}</span><span>Turntable study</span>`;
    media.append(image);
    figure.append(media, caption);
    grid?.append(figure);
    tiles.push({ figure, image, visible: false });
  });

  const showAppropriateSource = ({ image }, visible) => {
    const animate =
      visible && !motionPaused && !reducedMotion.matches && !saveData;
    const source = animate ? image.dataset.animated : image.dataset.poster;
    if (image.getAttribute("src") !== source) image.src = source;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const tile = tiles.find((candidate) => candidate.figure === entry.target);
        if (tile) {
          tile.visible = entry.isIntersecting;
          showAppropriateSource(tile, tile.visible);
        }
      });
    },
    { rootMargin: "12% 0px", threshold: 0.01 }
  );

  tiles.forEach(({ figure }) => observer.observe(figure));
  reducedMotion.addEventListener("change", () => {
    tiles.forEach((tile) => showAppropriateSource(tile, tile.visible));
  });
  motionToggle?.addEventListener("click", () => {
    motionPaused = !motionPaused;
    motionToggle.setAttribute("aria-pressed", String(motionPaused));
    motionToggle.textContent = motionPaused
      ? "Resume motion"
      : "Pause motion";
    tiles.forEach((tile) => showAppropriateSource(tile, tile.visible));
  });
  gallery.dataset.state = "ready";
}
