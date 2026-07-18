const gallery = document.querySelector("[data-horizontal-gallery]");
const desktop = window.matchMedia("(min-width: 761px)");

gallery?.addEventListener(
  "wheel",
  (event) => {
    if (!desktop.matches || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    gallery.scrollLeft += event.deltaY;
  },
  { passive: false },
);
