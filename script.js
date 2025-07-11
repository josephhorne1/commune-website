document.addEventListener("DOMContentLoaded", () => {
  // ===== LANDING SETUP =====
  const landing = document.getElementById("landing");
  const video = document.getElementById("landing-video");
  const audio = document.getElementById("landing-audio");
  const enterButton = document.querySelector(".enter-button");
  const logoTop = document.getElementById("logo-top-center");

  // Prevent scrolling before landing is dismissed
  document.body.classList.add("lock-scroll");

  // Attempt to play background video
  video?.play().catch(e => console.warn("Video autoplay blocked", e));

  // ENTER button click handler
  enterButton.addEventListener("click", () => {
    if (landing.classList.contains("fade-out")) return;
    landing.classList.add("fade-out");

    // After fade transition ends
    setTimeout(() => {
      document.body.classList.remove("lock-scroll");
document.body.classList.add("show-ui"); // <-- ensures UI elements fade in


      if (logoTop) {
        logoTop.style.display = "block";
        requestAnimationFrame(() => logoTop.classList.add("visible"));
      }

      if (audio) {
        audio.play().catch(() => console.warn("Audio autoplay blocked"));
      }
    }, 1200);
  });

  // Force autoplay retry on load
  if (video && video.paused) {
    video.play().catch(e => console.warn('[VIDEO] Autoplay blocked:', e));
  }

  // ===== GALLERY SWITCHING (COMFORT) =====
  const galleryImages = document.querySelectorAll('.comfort-model');
  const dots = document.querySelectorAll('.gallery-dots .dot');
  let currentIndex = 0;

  function showImage(index) {
    galleryImages.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    galleryImages[index].classList.add('active');
    dots[index].classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      if (!isNaN(index)) {
        currentIndex = index;
        showImage(currentIndex);
      }
    });
  });

  showImage(currentIndex);

  // ===== GALLERY SWITCHING (TRAVEL) =====
  const travelImages = document.querySelectorAll('.travel-model');
  const travelDots = document.querySelectorAll('.gallery-dots .dot');

  travelDots.forEach(dot => {
    dot.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      travelImages.forEach(img => img.classList.remove('active'));
      travelDots.forEach(dot => dot.classList.remove('active'));
      travelImages[index].classList.add('active');
      dot.classList.add('active');
    });
  });

  // ===== SIZE SELECTION / CART =====
  const cartDisplay = document.getElementById('cart-button');
  let cart = JSON.parse(localStorage.getItem('commune-cart')) || [];

  // Loop through each product module
  document.querySelectorAll('.product-module').forEach(module => {
    const sizeOptions = module.querySelectorAll('.size-option');
    const cartButton = module.querySelector('.add-to-cart');
    const productTitle = module.querySelector('.product-title')?.innerText || 'UNKNOWN';

    let selectedSize = null;

    sizeOptions.forEach(option => {
      option.addEventListener('click', () => {
        sizeOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectedSize = option.dataset.size;
        cartButton.classList.add('active');
        cartButton.style.cursor = 'pointer';
      });
    });

    cartButton?.addEventListener('click', () => {
  if (!selectedSize) return;
  const cartKey = `${productTitle} — ${selectedSize}`;
  let existing = cart.find(i => i.name === cartKey);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name: cartKey, quantity: 1 });
  }
  localStorage.setItem('commune-cart', JSON.stringify(cart));
  updateCartUI();

  // 🔊 Sound
  const addSound = new Audio('assets/audio/add.mp3');
  addSound.play().catch(() => {});

  // 💥 Bump animation
  cartDisplay.classList.add('bump');
  setTimeout(() => cartDisplay.classList.remove('bump'), 300);
});

  });

  function updateCartUI() {
    cartDisplay.innerText = `CART (${cart.length})`;
  }

  updateCartUI();


  function updateCartUI() {
    cartDisplay.innerText = `CART (${cart.length})`;
  }
  updateCartUI();

  cartDisplay.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });


  window.goHome = function () {
    location.reload();
  };
// ===== GALLERY SWITCHING (BASE) =====
const baseImages = document.querySelectorAll('.base-model');
const baseDots = document.querySelectorAll('.base-dots .dot');

let baseCurrent = 0;

function showBaseImage(index) {
  baseImages.forEach(img => img.classList.remove('active'));
  baseDots.forEach(dot => dot.classList.remove('active'));
  baseImages[index].classList.add('active');
  baseDots[index].classList.add('active');
}

baseDots.forEach(dot => {
  dot.addEventListener('click', function () {
    const index = parseInt(this.getAttribute('data-index'));
    if (!isNaN(index)) {
      baseCurrent = index;
      showBaseImage(baseCurrent);
    }
  });
});

showBaseImage(baseCurrent);

// ===== GALLERY SWITCHING (UNDER) =====
const underImages = document.querySelectorAll('.under-model');
const underDots = document.querySelectorAll('.under-dots .dot');

underDots.forEach(dot => {
  dot.addEventListener('click', function () {
    const index = parseInt(this.getAttribute('data-index'));
    underImages.forEach(img => img.classList.remove('active'));
    underDots.forEach(dot => dot.classList.remove('active'));
    underImages[index].classList.add('active');
    dot.classList.add('active');
  });
});



});
