import React, { useEffect, useMemo, useState } from "react";
import { sourceBodyClasses, sourcePages } from "./sourcePages";

const routes = new Set(Object.keys(sourcePages));
const loginUrl = "https://insights.learmedical.com/login";
const resourceArticles = [
  {
    title: "From the Cockpit to Control Room: Engineering Aviation-Grade Safety into Radiology",
    date: "March 24, 2026",
    isoDate: "2026-03-24",
    category: "White Paper",
    categoryValue: "white-paper",
    pdf: "https://learmedical.com/wp-content/uploads/2026/03/From-Cockpit-to-Control-Room_-Engineering-Aviation-Grade-Safety-into-Radiology-Final-Draft-.pdf",
    image: "https://learmedical.com/wp-content/uploads/2026/03/Screenshot-2026-03-24-144752.png",
  },
  {
    title: "Fundamentals of Diagnostic Error in Imaging",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "https://learmedical.com/wp-content/uploads/2026/03/Fundamentals-of-Diagnostic-Error-in-Imaging-1.pdf",
    image: "https://learmedical.com/wp-content/uploads/2026/03/thumbnail-0-2.jpeg",
  },
  {
    title: "Errors and Cost",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "https://learmedical.com/wp-content/uploads/2026/03/Errors-and-Cost.pdf",
    image: "https://learmedical.com/wp-content/uploads/2026/03/download.png",
  },
  {
    title: "An International Survey of Quality and Safety Programs in Radiology",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "https://learmedical.com/wp-content/uploads/2026/03/An-International-Survey-of-Quality-and-Safety-Programs-in-Radiology.pdf",
    image: "https://learmedical.com/wp-content/uploads/2026/03/thumbnail-0.jpeg",
  },
  {
    title: "Clinical Radiology Workforce Census Report",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "https://learmedical.com/wp-content/uploads/2026/03/rcr-2024-clinical-radiology-workforce-census-report.pdf",
    image: "https://learmedical.com/wp-content/uploads/2026/03/Screenshot-2026-03-05-191550.png",
  },
];

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

function renderResourceCard(article) {
  return `
    <div class="resource-card" data-pdf="${article.pdf}" data-title="${article.title}">
      <div class="row align-items-center">
        <div class="col-lg-7 col-8">
          <div class="article-badgeslist mb-3">
            <div class="date-post-lear">${article.date}</div>
            <div class="article-lgcategory">${article.category}</div>
          </div>
          <h5 class="article-heading-lear">${article.title}</h5>
          <div class="mt-4 d-flex gap-3">
            <a href="${article.pdf}" class="anchor-tag downloadpdf" target="_blank" rel="noopener noreferrer">
              <span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 7L7 13M7 13L13 7M7 13L7 0.999999" stroke="#1B2550" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              Download PDF
            </a>
          </div>
        </div>
        <div class="col-lg-5 col-4 text-lg-end">
          <img src="${article.image}" class="img-fluid js-view-pdf thumb-sl-slid" alt="${article.title}" style="pointer-events: none;">
        </div>
      </div>
    </div>`;
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

export function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const html = useMemo(() => sourcePages[path] || sourcePages["/"], [path]);
  const renderedHtml = useMemo(() => {
    if (path !== "/resources") return html;
    const resourceCards = resourceArticles.map(renderResourceCard).join("");
    return html.replace(
      '<div id="resourceResults"></div>',
      `<div id="resourceResults">${resourceCards}</div>`
    );
  }, [path, html]);

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const bodyClass = sourceBodyClasses[path] || sourceBodyClasses["/"] || "";
    document.body.className = bodyClass;
    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(activateStaticSwipers);
    requestAnimationFrame(() => {
      loadResourceWidgets(path);
      scheduleResourceArticles(path);
    });
  }, [path, renderedHtml]);

  useEffect(() => {
    const handleClick = (event) => {
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
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      const url = new URL(href, window.location.href);
      const nextPath = normalizePath(url.pathname);
      const isLocalRoute = url.origin === window.location.origin && routes.has(nextPath);
      if (!isLocalRoute) return;

      event.preventDefault();
      closeOffcanvas();
      closeModal(document.querySelector(".modal.show"));
      window.history.pushState({}, "", nextPath);
      setPath(nextPath);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className="source-site"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}

export default App;
