document.addEventListener("DOMContentLoaded", () => {
  const homeButton = document.getElementById("home-button");
  homeButton?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
