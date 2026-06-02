(() => {
  const CART_KEY = "commune-cart";
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
    const homeButton = document.getElementById("home-button");
    const form = document.getElementById("checkout-form");
    const confirmation = document.getElementById("confirmation");

    homeButton?.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    renderCartSummary();

    form?.addEventListener("submit", event => {
      event.preventDefault();
      confirmation.hidden = false;
      form.reset();
    });
  });

  function renderCartSummary() {
    const summary = document.getElementById("checkout-cart-summary");
    if (!summary) return;

    const cart = readCart();
    summary.replaceChildren();

    if (!cart.length) {
      summary.textContent = "No cart items are currently selected.";
      return;
    }

    const list = document.createElement("ul");
    let total = 0;

    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      const row = document.createElement("li");
      row.textContent = `${item.product} / ${item.size} x ${item.quantity} - $${lineTotal}`;
      list.appendChild(row);
    });

    const totalLine = document.createElement("p");
    totalLine.textContent = `Estimated total: $${total}`;

    summary.append(list, totalLine);
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
})();
