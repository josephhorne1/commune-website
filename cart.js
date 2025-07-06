window.onload = function () {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalDisplay = document.getElementById('cart-total');
  let rawCart = JSON.parse(localStorage.getItem('commune-cart')) || [];

  // 🛠 Normalize old cart (strings) into objects
  let cart = [];
  rawCart.forEach(entry => {
    if (typeof entry === 'string') {
      let existing = cart.find(i => i.name === entry);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name: entry, quantity: 1 });
      }
    } else if (entry.name) {
      let existing = cart.find(i => i.name === entry.name);
      if (existing) {
        existing.quantity += entry.quantity;
      } else {
        cart.push(entry);
      }
    }
  });

  const prices = {
    comfort: 100,
    travel: 400,
    sleep: 200,
  };

  function parseItemName(item) {
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      const itemName = parseItemName(item.name);
      const itemPrice = prices[item.name] || 100;
      const itemTotal = itemPrice * item.quantity;

      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="item-name">${itemName}</div>
        <div class="item-controls">
          <button class="qty-btn minus" data-index="${index}">−</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">+</button>
        </div>
        <div class="item-total">$${itemTotal}</div>
        <button class="remove-button" data-index="${index}">Remove</button>
      `;
      cartItemsContainer.appendChild(itemElement);
      total += itemTotal;
    });

    cartTotalDisplay.innerText = `Total: $${total}`;
    localStorage.setItem('commune-cart', JSON.stringify(cart));
  }

  // ➕➖ Quantity Controls
  cartItemsContainer.addEventListener('click', e => {
    const index = parseInt(e.target.getAttribute('data-index'));
    if (isNaN(index)) return;
    if (e.target.classList.contains('plus')) {
      cart[index].quantity += 1;
    } else if (e.target.classList.contains('minus')) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      }
    } else if (e.target.classList.contains('remove-button')) {
      cart.splice(index, 1);
    }
    renderCart();
  });

  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Thank you for your purchase!');
      localStorage.removeItem('commune-cart');
      window.location.reload();
    });
  }

  window.goHome = function () {
    window.location.href = 'index.html';
  };

  renderCart();
};