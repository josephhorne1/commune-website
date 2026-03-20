window.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalDisplay = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-button");
  const clearCartBtn = document.getElementById("clear-cart");
  const homeButton = document.getElementById("home-button");

  const rawCart = JSON.parse(localStorage.getItem("commune-cart")) || [];

  const fallbackPrices = {
    COMFORT: 100,
    BASE: 50,
    UNDER: 25,
    TRAVEL: 400,
    RAIN: 150,
  };

  const normalizedCart = [];

  rawCart.forEach(entry => {
    if (typeof entry === "string") {
      const [product, size = "one-size"] = entry.split(" — ");
      normalizedCart.push({
        product: (product || "UNKNOWN").toUpperCase(),
        size,
        price: fallbackPrices[(product || "").toUpperCase()] || 0,
        quantity: 1,
      });
      return;
    }

    if (entry && entry.product && entry.size) {
      normalizedCart.push({
        product: String(entry.product).toUpperCase(),
        size: String(entry.size),
        price: Number(entry.price || fallbackPrices[String(entry.product).toUpperCase()] || 0),
        quantity: Number(entry.quantity || 1),
      });
      return;
    }

    if (entry?.name) {
      const [product, size = "one-size"] = String(entry.name).split(" — ");
      normalizedCart.push({
        product: (product || "UNKNOWN").toUpperCase(),
        size,
        price: fallbackPrices[(product || "").toUpperCase()] || 0,
        quantity: Number(entry.quantity || 1),
      });
    }
  });

  const cart = [];
  normalizedCart.forEach(item => {
    const existing = cart.find(
      current => current.product === item.product && current.size === item.size,
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
  });

  function saveAndRender() {
    localStorage.setItem("commune-cart", JSON.stringify(cart));
    renderCart();
  }

  function createQuantityButton(kind, index, label) {
    const button = document.createElement("button");
    button.className = `qty-btn ${kind}`;
    button.dataset.index = String(index);
    button.type = "button";
    button.textContent = label;
    return button;
  }

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "Your cart is empty.";
      cartItemsContainer.appendChild(empty);
      cartTotalDisplay.innerText = "Total: $0";
      return;
    }

    cart.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      const itemElement = document.createElement("div");
      itemElement.className = "cart-item";

      const itemName = document.createElement("div");
      itemName.className = "item-name";
      itemName.textContent = `${item.product} (${item.size})`;

      const controls = document.createElement("div");
      controls.className = "item-controls";
      controls.appendChild(createQuantityButton("minus", index, "−"));

      const quantity = document.createElement("span");
      quantity.className = "quantity";
      quantity.textContent = String(item.quantity);
      controls.appendChild(quantity);

      controls.appendChild(createQuantityButton("plus", index, "+"));

      const itemTotal = document.createElement("div");
      itemTotal.className = "item-total";
      itemTotal.textContent = `$${lineTotal}`;

      const removeButton = document.createElement("button");
      removeButton.className = "remove-button";
      removeButton.dataset.index = String(index);
      removeButton.type = "button";
      removeButton.textContent = "Remove";

      itemElement.append(itemName, controls, itemTotal, removeButton);
      cartItemsContainer.appendChild(itemElement);
    });

    cartTotalDisplay.innerText = `Total: $${total}`;
  }

  cartItemsContainer?.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Number.parseInt(target.dataset.index || "", 10);
    if (Number.isNaN(index) || !cart[index]) return;

    if (target.classList.contains("plus")) {
      cart[index].quantity += 1;
    } else if (target.classList.contains("minus")) {
      if (cart[index].quantity > 1) cart[index].quantity -= 1;
    } else if (target.classList.contains("remove-button")) {
      cart.splice(index, 1);
    }

    saveAndRender();
  });

  clearCartBtn?.addEventListener("click", () => {
    cart.length = 0;
    localStorage.removeItem("commune-cart");
    renderCart();
  });

  checkoutBtn?.addEventListener("click", () => {
    alert("Thank you for your purchase!");
    localStorage.removeItem("commune-cart");
    window.location.reload();
  });

  homeButton?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  saveAndRender();
});
