import { resourceArticles, renderResourceCard } from "../resourceArticles.js";

const loginUrl = "https://insights.learmedical.com/login";
const routes = new Set(["/", "/about", "/services", "/resources", "/contact"]);

function normalizePath(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return routes.has(path) ? path : "/";
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("show");
  modal.style.display = "";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach((node) => node.remove());
}

function openModal(selector) {
  const modal = document.querySelector(selector);
  if (!modal) return;
  modal.classList.add("show");
  modal.style.display = "block";
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  document.body.classList.add("modal-open");
  if (!document.querySelector(".modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }
}

function closeOffcanvas() {
  const panel = document.querySelector(".offcanvas.show");
  if (panel) panel.classList.remove("show");
  document.body.classList.remove("offcanvas-open");
  document.querySelectorAll(".offcanvas-backdrop").forEach((node) => node.remove());
}

function openOffcanvas(selector) {
  const panel = document.querySelector(selector);
  if (!panel) return;
  panel.classList.add("show");
  document.body.classList.add("offcanvas-open");
  if (!document.querySelector(".offcanvas-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "offcanvas-backdrop fade show";
    document.body.appendChild(backdrop);
  }
}

function activateStaticSwipers() {
  document.querySelectorAll(".swiper").forEach((swiper) => {
    const wrapper = swiper.querySelector(".swiper-wrapper");
    if (!wrapper || swiper.dataset.staticSwiper === "true") return;
    swiper.dataset.staticSwiper = "true";
    const slides = [...wrapper.querySelectorAll(".swiper-slide")];
    if (swiper.classList.contains("mediaSwiper")) {
      slides.forEach((slide) => {
        const isWidgetOnly = slide.querySelector('[class*="elfsight-app"]')
          && !slide.querySelector("img")
          && !slide.textContent.trim();
        if (isWidgetOnly) slide.style.display = "none";
      });
    }
    wrapper.style.transform = "translate3d(0, 0, 0)";
    const firstVisible = slides.findIndex((slide) => getComputedStyle(slide).display !== "none");
    const activeIndex = firstVisible >= 0 ? firstVisible : 0;
    slides.forEach((slide, index) => {
      slide.classList.toggle("swiper-slide-active", index === activeIndex);
      slide.classList.toggle("swiper-slide-next", index === activeIndex + 1);
    });
  });
}

function loadResourceWidgets(path) {
  if (path !== "/resources") return;
  if (!document.querySelector('script[data-lear-elfsight="true"]')) {
    const script = document.createElement("script");
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    script.dataset.learElfsight = "true";
    document.body.appendChild(script);
  }
  window.setTimeout(() => {
    document.querySelectorAll('[class*="elfsight-app"]').forEach((widget) => {
      if (widget.children.length || widget.textContent.trim()) return;
      const fallback = document.createElement("div");
      fallback.className = "lear-social-fallback";
      fallback.innerHTML = `
        <img src="/wp-content/uploads/2026/02/1eb905717a6ca186042290a3bfcb9ce7cb8ff851.png" alt="Lear Medical social media post">
        <div class="featured-content mt-3">
          <div class="meta mb-2">
            <span class="pill video">Social Media</span>
            <span class="date">February 17, 2026</span>
          </div>
          <h2 class="allart-heading">Lear Medical insights at the intersection of aviation and healthcare</h2>
        </div>`;
      widget.replaceWith(fallback);
      const slide = fallback.closest(".swiper-slide");
      if (slide) {
        slide.style.display = "";
        const swiper = slide.closest(".swiper");
        if (swiper) delete swiper.dataset.staticSwiper;
        activateStaticSwipers();
      }
    });
  }, 1200);
}

function setupResourceArticles(path) {
  if (path !== "/resources") return;
  const form = document.getElementById("resourceFilterForm");
  const results = document.getElementById("resourceResults");
  const skeleton = document.getElementById("resourceSkeleton");
  const resetBtn = document.getElementById("resetFilters");
  if (!form || !results || form.dataset.localResourceFilter === "true") return;

  form.dataset.localResourceFilter = "true";

  const getSortValue = () => {
    const visibleSort = [...form.querySelectorAll('[name="sort"]')]
      .find((node) => getComputedStyle(node).display !== "none");
    return visibleSort?.value || "DESC";
  };

  const hasActiveFilters = () => {
    const data = new FormData(form);
    return Boolean(
      data.get("s")
      || data.get("from_date")
      || data.get("to_date")
      || data.get("category")
      || getSortValue() !== "DESC"
    );
  };

  const render = () => {
    const data = new FormData(form);
    const search = String(data.get("s") || "").trim().toLowerCase();
    const fromDate = String(data.get("from_date") || "");
    const toDate = String(data.get("to_date") || "");
    const category = String(data.get("category") || "");
    const sort = getSortValue();

    let articles = resourceArticles.filter((article) => {
      const matchesSearch = !search || article.title.toLowerCase().includes(search);
      const matchesCategory = !category || article.categoryValue === category;
      const matchesFrom = !fromDate || article.isoDate >= fromDate;
      const matchesTo = !toDate || article.isoDate <= toDate;
      return matchesSearch && matchesCategory && matchesFrom && matchesTo;
    });

    articles = articles.sort((a, b) => {
      const comparison = a.isoDate.localeCompare(b.isoDate);
      return sort === "ASC" ? comparison : -comparison;
    });

    skeleton?.classList.add("d-none");
    results.classList.remove("d-none");
    results.innerHTML = articles.length
      ? articles.map(renderResourceCard).join("")
      : `<div class="resource-card"><h5 class="article-heading-lear mb-0">No resources found.</h5></div>`;
    resetBtn?.classList.toggle("d-none", !hasActiveFilters());
  };

  let debounceTimer;
  form.addEventListener("change", render);
  form.addEventListener("input", (event) => {
    if (event.target?.name !== "s") return;
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(render, 250);
  });
  form.addEventListener("keyup", (event) => {
    if (event.target?.name !== "s") return;
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(render, 250);
  });
  resetBtn?.addEventListener("click", () => {
    form.reset();
    render();
  });

  render();
}

function scheduleResourceArticles(path) {
  if (path !== "/resources") return;
  let attempts = 0;
  const setup = () => {
    setupResourceArticles(path);
    const form = document.getElementById("resourceFilterForm");
    if (form?.dataset.localResourceFilter === "true" || attempts >= 12) return;
    attempts += 1;
    window.setTimeout(setup, 50);
  };
  window.setTimeout(setup, 0);
}

function setupScrollTop() {
  const button = document.getElementById("scrollTopBtn");
  if (!button) return;
  const update = () => button.classList.toggle("show", window.scrollY > 400);
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function setupQueryScroll() {
  const targetId = new URLSearchParams(window.location.search).get("scroll");
  if (!targetId) return;
  window.setTimeout(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
}

function setupClickHandlers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const dismiss = target.closest("[data-bs-dismiss]");
    if (dismiss?.getAttribute("data-bs-dismiss") === "modal") {
      event.preventDefault();
      closeModal(dismiss.closest(".modal"));
      return;
    }
    if (dismiss?.getAttribute("data-bs-dismiss") === "offcanvas") {
      event.preventDefault();
      closeOffcanvas();
      return;
    }

    const toggle = target.closest("[data-bs-toggle]");
    if (toggle?.getAttribute("data-bs-toggle") === "modal") {
      event.preventDefault();
      openModal(toggle.getAttribute("data-bs-target") || toggle.getAttribute("href"));
      return;
    }
    if (toggle?.getAttribute("data-bs-toggle") === "offcanvas") {
      event.preventDefault();
      openOffcanvas(toggle.getAttribute("data-bs-target") || toggle.getAttribute("href"));
      return;
    }

    const loginButton = target.closest(".btn-login");
    if (loginButton) {
      event.preventDefault();
      window.open(loginUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const link = target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("javascript:")) {
      event.preventDefault();
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin && routes.has(normalizePath(url.pathname))) {
      closeOffcanvas();
      closeModal(document.querySelector(".modal.show"));
    }
  });
}

function setupPage() {
  const path = normalizePath(window.location.pathname);
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
  requestAnimationFrame(activateStaticSwipers);
  requestAnimationFrame(() => {
    loadResourceWidgets(path);
    scheduleResourceArticles(path);
  });
  setupScrollTop();
  setupQueryScroll();
  setupClickHandlers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPage, { once: true });
} else {
  setupPage();
}
