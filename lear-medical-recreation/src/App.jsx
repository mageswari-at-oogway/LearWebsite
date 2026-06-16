import React, { useEffect, useMemo, useState } from "react";
import { sourceBodyClasses, sourcePages } from "./sourcePages";

const routes = new Set(Object.keys(sourcePages));
const loginUrl = "https://insights.learmedical.com/login";

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

export function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const html = useMemo(() => sourcePages[path] || sourcePages["/"], [path]);

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
    requestAnimationFrame(() => loadResourceWidgets(path));
  }, [path, html]);

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
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default App;
