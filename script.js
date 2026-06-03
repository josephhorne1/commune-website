(() => {
  const CART_KEY = "commune-cart";
  const ENTERED_KEY = "commune-entered";
  const PRODUCT_PRICES = {
    COMFORT: 100,
    BASE: 50,
    UNDER: 25,
    TRAVEL: 400,
    RAIN: 150,
    "MASCOT T-SHIRT": 30
  };
  const DEFAULT_SIZE = "one-size";

  document.addEventListener("DOMContentLoaded", () => {
    setupViewportHeight();
    setupLanding();
    setupNavigation();
    setupIndexDropdowns();
    setupProductModules();
    setupOperaProducts();
    setupSoundControls();
    updateCartCount();
  });

  function setupViewportHeight() {
    const setViewportHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight, { passive: true });
    window.addEventListener("orientationchange", () => {
      window.setTimeout(setViewportHeight, 120);
    }, { passive: true });
    window.visualViewport?.addEventListener("resize", setViewportHeight, { passive: true });
    window.addEventListener("pageshow", setViewportHeight, { passive: true });
  }

  function setupLanding() {
    const landing = document.getElementById("landing");
    const video = document.getElementById("landing-video");
    const audio = document.getElementById("landing-audio");
    const enterButton = document.querySelector(".enter-button");
    const logoTop = document.getElementById("logo-top-center");

    if (!landing) {
      document.body.classList.add("show-ui");
      return;
    }

    if (sessionStorage.getItem(ENTERED_KEY) === "true") {
      landing.style.display = "none";
      document.body.classList.remove("lock-scroll");
      document.body.classList.add("show-ui");

      if (logoTop) {
        logoTop.style.display = "block";
        logoTop.classList.add("visible");
      }
      return;
    }

    document.body.classList.add("lock-scroll");
    video?.play().catch(error => console.warn("Video autoplay blocked", error));

    enterButton?.addEventListener("click", () => {
      if (landing.classList.contains("fade-out")) return;

      sessionStorage.setItem(ENTERED_KEY, "true");
      landing.classList.add("fade-out");
      setTimeout(() => {
        document.body.classList.remove("lock-scroll");
        document.body.classList.add("show-ui");

        if (logoTop) {
          logoTop.style.display = "block";
          requestAnimationFrame(() => logoTop.classList.add("visible"));
        }

        audio?.play().catch(() => console.warn("Audio autoplay blocked"));
      }, 1200);
    });
  }

  function setupNavigation() {
    bindNavButton("home-button", "index.html");
    bindNavButton("cart-button", "cart.html");
    bindNavButton("catalog-button", "catalog.html");
    bindNavButton("opera-button", "opera.html");
    bindNavButton("sound-button", "sound.html");
  }

  function bindNavButton(id, target) {
    const button = document.getElementById(id);
    if (!button) return;

    bindAction(button, () => {
      window.location.href = target;
    });
  }

  function bindAction(element, handler) {
    element.addEventListener("click", handler);
    element.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      handler(event);
    });
  }

  function setupIndexDropdowns() {
    const dropdowns = Array.from(document.querySelectorAll(".site-index-dropdown"));
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncIndexState = () => {
      const isIndexActive = dropdowns.some(dropdown =>
        dropdown.open || dropdown.matches(":hover") || dropdown.matches(":focus-within")
      );
      document.body.classList.toggle("index-open", isIndexActive);
    };

    const closeDropdowns = () => {
      dropdowns.forEach(dropdown => {
        dropdown.open = false;
      });
      document.body.classList.remove("index-open");
    };

    const startIndexTransition = link => {
      const targetUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      currentUrl.hash = "";
      targetUrl.hash = "";

      if (targetUrl.origin !== window.location.origin || targetUrl.href === currentUrl.href) return;

      document.body.classList.add("index-open", "page-transitioning");
      window.setTimeout(() => {
        window.location.href = link.href;
      }, prefersReducedMotion.matches ? 0 : 240);
    };

    document.querySelectorAll(".site-index a[href]").forEach(link => {
      link.addEventListener("click", event => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
        const targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;

        event.preventDefault();
        startIndexTransition(link);
      });
    });

    dropdowns.forEach(dropdown => {
      dropdown.addEventListener("toggle", syncIndexState);
      dropdown.addEventListener("mouseenter", () => {
        if (canHover.matches) dropdown.open = true;
        syncIndexState();
      });
      dropdown.addEventListener("mouseleave", () => {
        window.setTimeout(() => {
          if (canHover.matches && !dropdown.matches(":focus-within")) dropdown.open = false;
          syncIndexState();
        }, 100);
      });
      dropdown.addEventListener("focusin", syncIndexState);
      dropdown.addEventListener("focusout", () => {
        window.setTimeout(syncIndexState, 80);
      });
      dropdown.querySelector("summary")?.addEventListener("click", () => {
        window.setTimeout(syncIndexState, 0);
      });
    });

    document.addEventListener("click", event => {
      if (event.target instanceof Element && event.target.closest(".site-index-dropdown")) return;
      closeDropdowns();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeDropdowns();
    });
  }

  function setupProductModules() {
    document.querySelectorAll(".product-module").forEach(module => {
      setupGallery(module);
      setupModuleCart(module);
    });
  }

  function setupGallery(module) {
    const images = Array.from(module.querySelectorAll("[data-gallery-image]"));
    const dots = Array.from(module.querySelectorAll("[data-gallery-dot]"));

    if (!images.length) return;
    if (!images.some(image => image.classList.contains("active"))) {
      images[0].classList.add("active");
    }
    if (!dots.length) return;

    function showImage(index) {
      if (!images[index]) return;
      images.forEach(image => image.classList.remove("active"));
      dots.forEach(dot => dot.classList.remove("active"));
      images[index].classList.add("active");
      dots[index]?.classList.add("active");
    }

    dots.forEach((dot, fallbackIndex) => {
      dot.addEventListener("click", () => {
        const index = Number.parseInt(dot.dataset.index || String(fallbackIndex), 10);
        if (Number.isFinite(index)) showImage(index);
      });
    });

    const activeIndex = dots.findIndex(dot => dot.classList.contains("active"));
    showImage(activeIndex >= 0 ? activeIndex : 0);
  }

  function setupModuleCart(module) {
    const sizeOptions = Array.from(module.querySelectorAll(".size-option"));
    const cartButton = module.querySelector(".add-to-cart");
    if (!cartButton) return;

    const title = module.querySelector(".product-title")?.textContent || "";
    const product = normalizeProductName(module.dataset.product || title);
    const price = normalizePrice(product, module.dataset.price);
    let selectedSize = null;

    function setSelectedSize(option) {
      sizeOptions.forEach(sizeOption => sizeOption.classList.remove("active"));
      option.classList.add("active");
      selectedSize = normalizeSize(option.dataset.size || option.textContent);
      cartButton.classList.add("active");
    }

    sizeOptions.forEach(option => {
      option.addEventListener("click", () => setSelectedSize(option));
    });

    if (sizeOptions.length === 1) {
      setSelectedSize(sizeOptions[0]);
    }

    cartButton.addEventListener("click", () => {
      if (!selectedSize) return;
      addCartItem({ product, size: selectedSize, price });
      flashAddButton(cartButton);
      bumpCartButton();
    });
  }

  function setupOperaProducts() {
    document.querySelectorAll(".opera-item[data-product]").forEach(item => {
      const button = item.querySelector(".add-button");
      if (!button) return;

      const product = normalizeProductName(item.dataset.product);
      const size = normalizeSize(item.dataset.size || DEFAULT_SIZE);
      const price = normalizePrice(product, item.dataset.price);

      button.addEventListener("click", () => {
        addCartItem({ product, size, price });
        flashAddButton(button);
        bumpCartButton();
      });
    });
  }

  function setupSoundControls() {
    const trackRows = Array.from(document.querySelectorAll(".sound-track"));
    const player = document.getElementById("sound-player");
    const playerTitle = document.getElementById("sound-player-title");
    const playerToggle = document.getElementById("sound-player-toggle");
    const previousButton = document.getElementById("sound-prev");
    const nextButton = document.getElementById("sound-next");
    const scrubber = document.getElementById("sound-scrubber");
    const currentTime = document.getElementById("sound-current-time");
    const duration = document.getElementById("sound-duration");
    if (!trackRows.length) return;

    const tracks = trackRows.map((row, index) => {
      const button = row.querySelector("[data-audio-toggle]");
      const audio = button ? document.getElementById(button.dataset.audioToggle) : null;
      const title = row.querySelector(".sound-controls span")?.textContent?.trim() || `TRACK ${index + 1}`;
      return { row, button, audio, title };
    }).filter(track => track.button && track.audio);

    if (!tracks.length) return;

    let currentIndex = -1;
    let isSeeking = false;

    function resetTrackButtons() {
      tracks.forEach(track => {
        track.button.textContent = "[PLAY]";
        track.row.classList.remove("is-active");
      });
    }

    function showPlayer() {
      if (!player) return;
      player.classList.add("is-visible");
      player.setAttribute("aria-hidden", "false");
    }

    function updatePlayerState(track) {
      if (playerTitle) playerTitle.textContent = track.title;
      updateTimeDisplays(track.audio);
      if (playerToggle) playerToggle.textContent = track.audio.paused ? "[PLAY]" : "[PAUSE]";
    }

    function playTrack(index) {
      const track = tracks[index];
      if (!track) return;

      tracks.forEach(otherTrack => {
        if (otherTrack.audio !== track.audio) {
          otherTrack.audio.pause();
        }
      });

      currentIndex = index;
      resetTrackButtons();
      track.row.classList.add("is-active");
      track.button.textContent = "[PAUSE]";
      showPlayer();
      updatePlayerState(track);
      if (playerToggle) playerToggle.textContent = "[PAUSE]";
      track.audio.play().catch(() => {
        track.button.textContent = "[PLAY]";
        if (playerToggle) playerToggle.textContent = "[PLAY]";
      });
    }

    function pauseCurrentTrack() {
      const track = tracks[currentIndex];
      if (!track) return;

      track.audio.pause();
      track.button.textContent = "[PLAY]";
      if (playerToggle) playerToggle.textContent = "[PLAY]";
    }

    function toggleTrack(index) {
      const track = tracks[index];
      if (!track) return;

      if (currentIndex === index && !track.audio.paused) {
        pauseCurrentTrack();
      } else {
        playTrack(index);
      }
    }

    function playAdjacentTrack(direction) {
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + direction + tracks.length) % tracks.length;
      playTrack(nextIndex);
    }

    function updateTimeDisplays(audio) {
      const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      const safeCurrent = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

      if (currentTime) currentTime.textContent = formatTime(safeCurrent);
      if (duration) duration.textContent = formatTime(safeDuration);
      if (scrubber && !isSeeking) {
        scrubber.max = String(safeDuration || 100);
        scrubber.value = String(safeCurrent);
      }
    }

    function formatTime(seconds) {
      const totalSeconds = Math.max(0, Math.floor(seconds || 0));
      const minutes = Math.floor(totalSeconds / 60);
      const remainder = totalSeconds % 60;
      return `${minutes}:${String(remainder).padStart(2, "0")}`;
    }

    tracks.forEach((track, index) => {
      track.row.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        toggleTrack(index);
      });

      track.button.addEventListener("click", () => {
        toggleTrack(index);
      });

      track.audio.addEventListener("loadedmetadata", () => {
        if (currentIndex === index) updateTimeDisplays(track.audio);
      });

      track.audio.addEventListener("timeupdate", () => {
        if (currentIndex === index) updateTimeDisplays(track.audio);
      });

      track.audio.addEventListener("ended", () => {
        playAdjacentTrack(1);
      });
    });

    playerToggle?.addEventListener("click", () => {
      if (currentIndex < 0) {
        playTrack(0);
        return;
      }

      const track = tracks[currentIndex];
      if (track.audio.paused) {
        playTrack(currentIndex);
      } else {
        pauseCurrentTrack();
      }
    });

    previousButton?.addEventListener("click", () => playAdjacentTrack(-1));
    nextButton?.addEventListener("click", () => playAdjacentTrack(1));

    scrubber?.addEventListener("input", () => {
      const track = tracks[currentIndex];
      if (!track) return;
      isSeeking = true;
      if (currentTime) currentTime.textContent = formatTime(Number(scrubber.value));
    });

    scrubber?.addEventListener("change", () => {
      const track = tracks[currentIndex];
      if (!track) return;
      const nextTime = Number(scrubber.value);
      if (Number.isFinite(nextTime)) {
        track.audio.currentTime = nextTime;
      }
      isSeeking = false;
      updateTimeDisplays(track.audio);
    });
  }

  function flashAddButton(button) {
    const original = button.textContent;
    button.textContent = "added";
    setTimeout(() => {
      button.textContent = original;
    }, 650);
  }

  function bumpCartButton() {
    const cartDisplays = document.querySelectorAll(".site-index-cart");
    cartDisplays.forEach(cartDisplay => {
      cartDisplay.classList.add("bump");
      setTimeout(() => cartDisplay.classList.remove("bump"), 300);
    });
  }

  function addCartItem(nextItem) {
    const cart = readCart();
    const product = normalizeProductName(nextItem.product);
    const size = normalizeSize(nextItem.size);
    const price = normalizePrice(product, nextItem.price);
    const existing = cart.find(item => item.product === product && item.size === size);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product, size, price, quantity: 1 });
    }

    saveCart(cart);
    updateCartCount();
  }

  function readCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return normalizeCart(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.warn("Could not read cart", error);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(cart)));
  }

  function updateCartCount() {
    const count = readCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach(cartDisplay => {
      cartDisplay.textContent = `(${count})`;
    });
  }

  function normalizeCart(rawCart) {
    const grouped = new Map();

    rawCart.forEach(entry => {
      const item = normalizeCartEntry(entry);
      if (!item) return;

      const key = `${item.product}::${item.size}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        grouped.set(key, item);
      }
    });

    return Array.from(grouped.values());
  }

  function normalizeCartEntry(entry) {
    if (typeof entry === "string") {
      return normalizeLegacyName(entry, 1);
    }

    if (!entry || typeof entry !== "object") return null;

    if (entry.product) {
      const product = normalizeProductName(entry.product);
      return {
        product,
        size: normalizeSize(entry.size),
        price: normalizePrice(product, entry.price),
        quantity: normalizeQuantity(entry.quantity)
      };
    }

    if (entry.name) {
      return normalizeLegacyName(entry.name, entry.quantity);
    }

    return null;
  }

  function normalizeLegacyName(value, quantity) {
    const normalized = String(value)
      .replace(/\s*\u00e2\u20ac\u201d\s*/g, " - ")
      .replace(/\s*\u2014\s*/g, " - ")
      .trim();
    const parts = normalized.split(/\s+-\s+/);
    const product = normalizeProductName(parts[0] || normalized);
    const size = normalizeSize(parts.slice(1).join(" - ") || DEFAULT_SIZE);

    return {
      product,
      size,
      price: normalizePrice(product),
      quantity: normalizeQuantity(quantity)
    };
  }

  function normalizeProductName(value) {
    return String(value || "UNKNOWN").trim().toUpperCase();
  }

  function normalizeSize(value) {
    return String(value || DEFAULT_SIZE).trim().toLowerCase();
  }

  function normalizePrice(product, value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    return PRODUCT_PRICES[product] || 0;
  }

  function normalizeQuantity(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  window.CommuneCart = {
    add: addCartItem,
    count: () => readCart().reduce((total, item) => total + item.quantity, 0),
    normalize: normalizeCart,
    read: readCart,
    save: saveCart,
    updateCount: updateCartCount
  };
})();
