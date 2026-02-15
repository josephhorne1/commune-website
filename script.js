document.addEventListener("DOMContentLoaded", () => {
  const landing = document.getElementById("landing");
  const video = document.getElementById("landing-video");
  const audio = document.getElementById("landing-audio");
  const enterButton = document.querySelector(".enter-button");
  const logoTop = document.getElementById("logo-top-center");
  const cartButton = document.getElementById("cart-button");
  const homeButton = document.getElementById("home-button");
  const catalogButton = document.getElementById("catalog-button");
  const operaButton = document.getElementById("opera-button");
  const soundButton = document.getElementById("sound-button");

  let cart = JSON.parse(localStorage.getItem("commune-cart")) || [];

  const safePlay = element => element?.play()?.catch(() => {});

  document.body.classList.add("lock-scroll");
  safePlay(video);

  enterButton?.addEventListener("click", () => {
    if (!landing || landing.classList.contains("fade-out")) return;
    landing.classList.add("fade-out");

    setTimeout(() => {
      document.body.classList.remove("lock-scroll");
      document.body.classList.add("show-ui");

      if (logoTop) {
        logoTop.style.display = "block";
        requestAnimationFrame(() => logoTop.classList.add("visible"));
      }

      safePlay(audio);
    }, 1200);
  });

  function updateCartUI() {
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    if (cartButton) cartButton.innerText = `CART (${totalQuantity})`;
  }

  function initGallery(module) {
    const images = module.querySelectorAll("[data-gallery-image]");
    const dots = module.querySelectorAll(".gallery-dots .dot");

    if (images.length <= 1 || dots.length === 0) return;

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = Number.parseInt(dot.dataset.index || "0", 10);
        if (Number.isNaN(index) || !images[index]) return;

        images.forEach(img => img.classList.remove("active"));
        dots.forEach(item => item.classList.remove("active"));
        images[index].classList.add("active");
        dot.classList.add("active");
      });
    });
  }

  function initProductModule(module) {
    const productName = module.dataset.product || "UNKNOWN";
    const productPrice = Number.parseFloat(module.dataset.price || "0");
    const sizeOptions = module.querySelectorAll(".size-option");
    const addToCartButton = module.querySelector(".add-to-cart");

    let selectedSize = null;

    sizeOptions.forEach(option => {
      option.addEventListener("click", () => {
        sizeOptions.forEach(item => item.classList.remove("active"));
        option.classList.add("active");
        selectedSize = option.dataset.size || null;
        addToCartButton?.classList.add("active");
      });
    });

    addToCartButton?.addEventListener("click", () => {
      if (!selectedSize) return;

      const existing = cart.find(
        item => item.product === productName && item.size === selectedSize,
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ product: productName, size: selectedSize, price: productPrice, quantity: 1 });
      }

      localStorage.setItem("commune-cart", JSON.stringify(cart));
      updateCartUI();
      safePlay(new Audio("assets/audio/add.mp3"));
      cartButton?.classList.add("bump");
      setTimeout(() => cartButton?.classList.remove("bump"), 300);
    });

    initGallery(module);
  }

  document.querySelectorAll(".product-module").forEach(initProductModule);

  cartButton?.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  homeButton?.addEventListener("click", () => window.location.reload());
  catalogButton?.addEventListener("click", () => {
    window.location.href = "catalog.html";
  });
  operaButton?.addEventListener("click", () => {
    window.location.href = "opera.html";
  });
  soundButton?.addEventListener("click", () => {
    window.location.href = "sound.html";
  });

  updateCartUI();
});
