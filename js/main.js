const products = [
  {
    id: 1,
    name: "YAMAHA белая",
    category: "small",
    size: "190×145",
    price: 600,
    image: "images/small-yamaha-white.jpg"
  },
  {
    id: 2,
    name: "YAMAHA красная",
    category: "small",
    size: "190×145",
    price: 600,
    image: "images/small-yamaha-red.jpg"
  },
  {
    id: 3,
    name: "СССР",
    category: "small",
    size: "190×145",
    price: 600,
    image: "images/small-ussr.jpg"
  },
  {
    id: 4,
    name: "СССР красная",
    category: "large",
    size: "245×185",
    price: 600,
    image: "images/large-ussr.jpg"
  },
  {
    id: 5,
    name: "Россия белая",
    category: "large",
    size: "245×185",
    price: 600,
    image: "images/large-russia.jpg"
  },
  {
    id: 6,
    name: "Сраный мотоциклист",
    category: "large",
    size: "245×185",
    price: 600,
    image: "images/large-rider.jpg"
  },
  {
    id: 7,
    name: "Подшлемник непродуваемый",
    category: "accessories",
    subtitle: "Защита от ветра",
    price: 700,
    image: "images/accessory-balaclava-wind.jpg"
  },
  {
    id: 8,
    name: "Подшлемник летний MOTONANNY",
    category: "accessories",
    subtitle: "Собственное производство, чёрный",
    price: 1500,
    image: "images/accessory-balaclava-black.jpg"
  },
  {
    id: 9,
    name: "Подшлемник летний MOTONANNY",
    category: "accessories",
    subtitle: "Собственное производство, серый",
    price: 1500,
    image: "images/accessory-balaclava-grey.jpg"
  }
];

window.MOTONOMER_CONFIG = {
  telegram: "https://t.me/motonomer",
  vk: "https://vk.ru/motonomerr"
};

window.MOTONOMER_PRODUCTS = products;

window.formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₽";

const formatPrice = window.formatPrice;

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
  return { badge: "", label: "", detail: "" };
}

window.getProductMeta = getProductMeta;

function productCard(product) {
  const meta = getProductMeta(product);
  return `
    <article class="product-card reveal">
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
          <button class="add-to-cart" type="button" data-add-to-cart="${product.id}" aria-label="Добавить ${product.name} в корзину">+</button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  document.querySelectorAll("[data-products]").forEach((grid) => {
    const type = grid.dataset.products;
    let list = products;

    if (type === "featured") {
      list = products.filter((product) => product.category !== "accessories").slice(0, 6);
    } else {
      list = products.filter((product) => product.category === type);
    }

    grid.innerHTML = list.map(productCard).join("");
  });
}

function setupMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!button || !nav) return;

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
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
  document.querySelectorAll(".accordion-button").forEach((button) => {
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
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  setupMenu();
  setupHeader();
  setupAccordion();
  setupSocialLinks();
  setupReveal();
});
