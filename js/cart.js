const CART_KEY = "motonomer-cart";

const DELIVERY_OPTIONS = [
  { id: "post", label: "Почта РФ" },
  { id: "cdek", label: "СДЭК" },
  { id: "pickup", label: "Самовывоз" },
  { id: "courier", label: "Курьером по Москве" }
];

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
  });
}

function showToast(message = "Товар добавлен в корзину") {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function getDetailedCartItems() {
  if (!window.MOTONOMER_PRODUCTS) return [];

  return getCart().map((item) => {
    const product = window.MOTONOMER_PRODUCTS.find((entry) => entry.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (item) item.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart(cart);
  showToast();
}

function changeQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;
  item.quantity += change;
  const nextCart = cart.filter((cartItem) => cartItem.quantity > 0);
  saveCart(nextCart);
  renderCartPage();
  renderCheckoutModal();
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
  renderCartPage();
  renderCheckoutModal();
}

function getCartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCartPage() {
  const root = document.querySelector("[data-cart-page]");
  if (!root || !window.MOTONOMER_PRODUCTS) return;

  const detailedItems = getDetailedCartItems();

  if (!detailedItems.length) {
    root.innerHTML = `
      <div class="empty-cart">
        <h2>В корзине пока ничего нет.</h2>
        <p>Выбери товар в каталоге.</p>
        <a class="button button-accent" href="index.html#catalog">Перейти в каталог</a>
      </div>`;
    closeCheckoutModal();
    return;
  }

  const quantity = detailedItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = getCartTotal(detailedItems);
  const getMeta = window.getProductMeta || (() => ({ detail: "" }));

  root.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${detailedItems.map((item) => {
          const meta = getMeta(item);
          return `
          <article class="cart-item">
            <img src="${item.image}" alt="${item.name}" width="900" height="900">
            <div class="cart-item-info">
              <h3>${item.name}</h3>
              <p>${meta.detail || ""}</p>
            </div>
            <div class="cart-item-actions">
              <div class="quantity" aria-label="Количество товара">
                <button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Уменьшить количество">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Увеличить количество">+</button>
              </div>
              <strong class="item-total">${window.formatPrice(item.price * item.quantity)}</strong>
              <button class="remove-item" type="button" data-cart-action="remove" data-id="${item.id}" aria-label="Удалить ${item.name}">×</button>
            </div>
          </article>`;
        }).join("")}
      </div>
      <aside class="order-summary">
        <h2>Ваш заказ</h2>
        <div class="summary-line"><span>Товары</span><strong>${quantity}</strong></div>
        <div class="summary-line summary-total"><span>Итого</span><strong>${window.formatPrice(total)}</strong></div>
        <button class="button button-accent" type="button" data-checkout-open>Оформить заказ <span>↗</span></button>
        <p class="order-note">Заявка будет отправлена в Telegram.</p>
      </aside>
    </div>`;
}

function renderCheckoutModal() {
  const content = document.querySelector("[data-checkout-content]");
  const modal = document.querySelector("[data-checkout-modal]");
  if (!content || !modal) return;

  const detailedItems = getDetailedCartItems();
  if (!detailedItems.length) {
    closeCheckoutModal();
    return;
  }

  const total = getCartTotal(detailedItems);
  const getMeta = window.getProductMeta || (() => ({ detail: "" }));

  content.innerHTML = `
    <div class="checkout-items">
      ${detailedItems.map((item) => {
        const meta = getMeta(item);
        return `
        <article class="checkout-item">
          <img src="${item.image}" alt="${item.name}" width="900" height="900">
          <div class="checkout-item-info">
            <h3>${item.name}${item.size ? ` ${item.size}` : ""}</h3>
            <p>${meta.detail || "Описание товара"}</p>
          </div>
          <div class="checkout-item-actions">
            <div class="quantity" aria-label="Количество товара">
              <button type="button" data-cart-action="decrease" data-id="${item.id}" aria-label="Уменьшить количество">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-action="increase" data-id="${item.id}" aria-label="Увеличить количество">+</button>
            </div>
            <strong class="item-total">${window.formatPrice(item.price * item.quantity)}</strong>
            <button class="remove-item" type="button" data-cart-action="remove" data-id="${item.id}" aria-label="Удалить ${item.name}">×</button>
          </div>
        </article>`;
      }).join("")}
    </div>
    <div class="checkout-total"><span>Итого</span><strong>${window.formatPrice(total)}</strong></div>
    <form class="checkout-form" data-checkout-form>
      <label class="field">
        <span class="visually-hidden">Ваше имя</span>
        <input type="text" name="name" placeholder="Ваше имя" required autocomplete="name">
      </label>
      <label class="field">
        <span class="visually-hidden">Номер телефона</span>
        <input type="tel" name="phone" placeholder="Номер телефона" required autocomplete="tel">
      </label>
      <fieldset class="delivery-fieldset">
        <legend>Выберите вариант доставки</legend>
        ${DELIVERY_OPTIONS.map((option, index) => `
          <label class="radio-option">
            <input type="radio" name="delivery" value="${option.id}" ${index === 0 ? "checked" : ""} required>
            <span>${option.label}</span>
          </label>`).join("")}
      </fieldset>
      <button class="button button-accent checkout-submit" type="submit">Оставить заявку</button>
      <p class="checkout-legal">Оставляя заявку, вы соглашаетесь на обработку персональных данных.</p>
    </form>`;
}

function openCheckoutModal() {
  const modal = document.querySelector("[data-checkout-modal]");
  if (!modal || !getDetailedCartItems().length) return;

  renderCheckoutModal();
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("checkout-open");

  const firstInput = modal.querySelector("input[name='name']");
  if (firstInput) firstInput.focus();
}

function closeCheckoutModal() {
  const modal = document.querySelector("[data-checkout-modal]");
  if (!modal) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("checkout-open");
}

function buildOrderMessage({ name, phone, deliveryId }) {
  const items = getDetailedCartItems();
  const delivery = DELIVERY_OPTIONS.find((option) => option.id === deliveryId)?.label || deliveryId;
  const total = getCartTotal(items);

  const itemsText = items.map((item) => {
    const meta = window.getProductMeta ? window.getProductMeta(item) : { detail: item.size ? `${item.size} мм` : "" };
    const details = [item.name, meta.detail].filter(Boolean).join(", ");
    return `• ${details} — ${item.quantity} шт. × ${window.formatPrice(item.price)}`;
  }).join("\n");

  return [
    "Новый заказ с сайта MOTONOMER.RU",
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Доставка: ${delivery}`,
    "",
    "Товары:",
    itemsText,
    "",
    `Итого: ${window.formatPrice(total)}`
  ].join("\n");
}

function submitCheckout(form) {
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const deliveryId = String(formData.get("delivery") || "");

  if (!name || !phone || !deliveryId) {
    showToast("Заполните все поля");
    return;
  }

  const telegramUrl = window.MOTONOMER_CONFIG?.telegram || "https://t.me/motonomer";
  const message = buildOrderMessage({ name, phone, deliveryId });
  const orderUrl = `${telegramUrl}?text=${encodeURIComponent(message)}`;

  window.open(orderUrl, "_blank", "noopener,noreferrer");
  saveCart([]);
  closeCheckoutModal();
  renderCartPage();
  showToast("Заявка отправлена в Telegram");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) addToCart(Number(addButton.dataset.addToCart));

  const checkoutOpen = event.target.closest("[data-checkout-open]");
  if (checkoutOpen) {
    event.preventDefault();
    openCheckoutModal();
    return;
  }

  const checkoutClose = event.target.closest("[data-checkout-close]");
  if (checkoutClose) {
    event.preventDefault();
    closeCheckoutModal();
    return;
  }

  const actionButton = event.target.closest("[data-cart-action]");
  if (!actionButton) return;
  const id = Number(actionButton.dataset.id);
  if (actionButton.dataset.cartAction === "increase") changeQuantity(id, 1);
  if (actionButton.dataset.cartAction === "decrease") changeQuantity(id, -1);
  if (actionButton.dataset.cartAction === "remove") removeFromCart(id);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-checkout-form]");
  if (!form) return;
  event.preventDefault();
  submitCheckout(form);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCheckoutModal();
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartPage();
});
