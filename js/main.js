const products = window.MOTONOMER_CATALOG || [];

window.MOTONOMER_CONFIG = {
  telegram: "https://t.me/motonomer",
  vk: "https://vk.ru/motonomerr",
  whatsapp: "https://wa.me/79933536940"
};

window.MOTONOMER_PRODUCTS = products;

window.formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";

const formatPrice = window.formatPrice;
const PRODUCT_CART_KEY = "motonomer-cart";

function getProductQuantity(productId) {
  try {
    const cart = JSON.parse(localStorage.getItem(PRODUCT_CART_KEY)) || [];
    return cart.find((item) => item.id === productId)?.quantity || 0;
  } catch {
    return 0;
  }
}

function getProductMeta(product) {
  if (product.category === "small") {
    return { badge: `${product.size} MM`, label: "Маленькая рамка", detail: `${product.size} мм` };
  }
  if (product.category === "large") {
    return { badge: `${product.size} MM`, label: "Большая рамка", detail: `${product.size} мм` };
  }
  if (product.category === "accessories") {
    return { badge: "ACCESSORY", label: "Аксессуар", detail: product.subtitle || "" };
  }
  if (product.category === "plates") {
    return { badge: `${product.size} MM`, label: "Изготовление номера", detail: product.subtitle || `${product.size} мм` };
  }
  return { badge: "", label: "", detail: "" };
}

window.getProductMeta = getProductMeta;

function productCard(product) {
  const meta = getProductMeta(product);
  const quantity = getProductQuantity(product.id);
  return `
    <article class="product-card">
      <span class="product-badge">${meta.badge}</span>
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" width="900" height="900" loading="lazy">
      </div>
      <div class="product-info">
        <p class="product-meta">${meta.label}</p>
        <h3>${product.name}</h3>
        ${meta.detail ? `<p class="product-detail">${meta.detail}</p>` : ""}
        <div class="product-buy">
          <span class="product-price">${formatPrice(product.price)}</span>
          ${quantity > 0 ? `
            <div class="product-quantity" aria-label="Количество товара ${product.name}">
              <button class="product-quantity-button" type="button" data-product-quantity="decrease" data-id="${product.id}" aria-label="Уменьшить количество ${product.name}">−</button>
              <span class="product-quantity-value">${quantity}</span>
              <button class="product-quantity-button product-quantity-button-accent" type="button" data-product-quantity="increase" data-id="${product.id}" aria-label="Увеличить количество ${product.name}">+</button>
            </div>
          ` : `<button class="add-to-cart" type="button" data-add-to-cart="${product.id}" aria-label="Добавить ${product.name} в корзину">+</button>`}
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  document.querySelectorAll("[data-products]").forEach((grid) => {
    const type = grid.dataset.products;
    let list = products;

    if (type === "featured") {
      list = products.filter((product) => product.category === "small" || product.category === "large").slice(0, 6);
    } else {
      list = products.filter((product) => product.category === type);
    }

    grid.innerHTML = list.map(productCard).join("");
  });
}

window.renderProductGrids = renderProducts;

function setupMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!button || !nav) return;

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Открыть меню");
  };

  button.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("menu-open")) return;
    closeMenu();
    button.focus();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

function setupHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupAccordion() {
  document.querySelectorAll(".accordion-button").forEach((button, index) => {
    const content = button.nextElementSibling;
    const contentId = `faq-answer-${index + 1}`;
    if (content) {
      content.id = contentId;
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", `faq-question-${index + 1}`);
    }
    button.id = `faq-question-${index + 1}`;
    button.setAttribute("aria-controls", contentId);
    button.addEventListener("click", () => {
      const item = button.closest(".accordion-item");
      const isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  elements.forEach((element) => observer.observe(element));
}

function setupExternalLinks(selector, url) {
  document.querySelectorAll(selector).forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function setupSocialLinks() {
  const config = window.MOTONOMER_CONFIG || {};
  setupExternalLinks("[data-telegram]", config.telegram || "https://t.me/motonomer");
  setupExternalLinks("[data-vk]", config.vk || "https://vk.ru/motonomerr");
  setupExternalLinks("[data-whatsapp]", config.whatsapp || "https://wa.me/79933536940");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  setupMenu();
  setupHeader();
  setupAccordion();
  setupSocialLinks();
  setupReveal();
});
