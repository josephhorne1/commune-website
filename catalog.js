document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "assets/images/sample-1.png",
    "assets/images/sample-2.png",
    "assets/images/sample-3.png",
    "assets/images/sample-4.png",
    "assets/images/sample-5.png",
    "assets/images/sample-6.png",
    "assets/images/sample-7.png",
    "assets/images/sample-8.png",
    "assets/images/sample-9.png",
    "assets/images/sample-10.png",
    "assets/images/sample-11.png",
    "assets/images/sample-12.png",
    "assets/images/sample-13.png"
  ];

  const imgElement = document.getElementById("catalog-image");
  const lookText = document.getElementById("look-text");
  const previousButton = document.getElementById("prev-look");
  const nextButton = document.getElementById("next-look");
  const homeButton = document.getElementById("home-button");
  let currentIndex = 0;

  function showImage(index) {
    currentIndex = (index + images.length) % images.length;
    imgElement.src = images[currentIndex];
    lookText.textContent = `LOOK ${currentIndex + 1}`;
  }

  previousButton.addEventListener("click", () => showImage(currentIndex - 1));
  nextButton.addEventListener("click", () => showImage(currentIndex + 1));
  homeButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  showImage(currentIndex);
});
