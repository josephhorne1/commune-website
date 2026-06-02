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
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalDisplay = document.getElementById("cart-total");
    const clearButton = document.getElementById("clear-cart");
    const checkoutButton = document.getElementById("checkout-button");
    const homeButton = document.getElementById("home-button");

    let cart = readCart();

    function renderCart() {
      cartItemsContainer.replaceChildren();

      if (!cart.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "cart-empty";
        emptyState.textContent = "Your cart is empty.";
        cartItemsContainer.appendChild(emptyState);
        cartTotalDisplay.textContent = "Total: $0";
        checkoutButton.disabled = true;
        clearButton.disabled = true;
        saveCart(cart);
        return;
      }

      let total = 0;
      cart.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        cartItemsContainer.appendChild(createCartRow(item, index, lineTotal));
      });

      cartTotalDisplay.textContent = `Total: $${total}`;
      checkoutButton.disabled = false;
      clearButton.disabled = false;
      saveCart(cart);
    }

    function createCartRow(item, index, lineTotal) {
      const row = document.createElement("div");
      row.className = "cart-item";

      const details = document.createElement("div");
      details.className = "item-details";

      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item.product;

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.textContent = `${item.size} / $${item.price} each`;

      details.append(name, meta);

      const controls = document.createElement("div");
      controls.className = "item-controls";
      controls.append(
        createActionButton("minus", index, "-"),
        createQuantity(item.quantity),
        createActionButton("plus", index, "+")
      );

      const itemTotal = document.createElement("div");
      itemTotal.className = "item-total";
      itemTotal.textContent = `$${lineTotal}`;

      const removeButton = createActionButton("remove", index, "Remove");
      removeButton.className = "remove-button";

      row.append(details, controls, itemTotal, removeButton);
      return row;
    }

    function createActionButton(action, index, label) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.action = action;
      button.dataset.index = String(index);
      button.textContent = label;
      if (action === "plus" || action === "minus") {
        button.className = `qty-btn ${action}`;
      }
      return button;
    }

    function createQuantity(quantity) {
      const quantityDisplay = document.createElement("span");
      quantityDisplay.className = "quantity";
      quantityDisplay.textContent = String(quantity);
      return quantityDisplay;
    }

    cartItemsContainer.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const index = Number.parseInt(button.dataset.index, 10);
      if (!Number.isFinite(index) || !cart[index]) return;

      if (button.dataset.action === "plus") {
        cart[index].quantity += 1;
      }

      if (button.dataset.action === "minus") {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
      }

      if (button.dataset.action === "remove") {
        cart.splice(index, 1);
      }

      renderCart();
    });

    clearButton.addEventListener("click", () => {
      cart = [];
      localStorage.removeItem(CART_KEY);
      renderCart();
    });

    checkoutButton.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });

    homeButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    renderCart();
  });

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
