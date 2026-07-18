const feed = document.querySelector("[data-image-feed]");
const arrangements = [...document.querySelectorAll(".arrangement")];

if (feed && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      }
    },
    { root: feed, threshold: 0.18 },
  );

  arrangements.forEach((arrangement) => observer.observe(arrangement));
}
