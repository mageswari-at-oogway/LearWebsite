import { resourceArticles, renderResourceCard } from "../resourceArticles.js";

const loginUrl = "https://insights.learmedical.com/login";
const formEndpoint = "/api/form";
const brochureFormspreeEndpoint = "https://formspree.io/f/xkoallnj";
const caseStudyFormspreeEndpoint = "https://formspree.io/f/xnjykkqg";
const defaultBrochureUrl = "/media/site/uploads/2026/02/Case-Study-Teleradiology-Service-Provider-V2.pdf";
const routes = new Set(["/", "/about", "/services", "/resources", "/contact"]);
let currentPdfUrl = "";

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
    if (swiper.classList.contains("service-content-slider") || swiper.classList.contains("service-image-slider")) return;
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

function setupServicesCarousel() {
  const contentSlider = document.querySelector(".service-content-slider");
  const imageSlider = document.querySelector(".service-image-slider");
  if (!contentSlider || !imageSlider || contentSlider.dataset.learCarousel === "true") return;

  const contentSlides = [...contentSlider.querySelectorAll(".swiper-slide")];
  const imageSlides = [...imageSlider.querySelectorAll(".swiper-slide")];
  const slideCount = Math.min(contentSlides.length, imageSlides.length);
  if (!slideCount) return;

  contentSlider.dataset.learCarousel = "true";
  imageSlider.dataset.learCarousel = "true";

  const pagination = contentSlider.querySelector(".swiper-pagination");
  let activeIndex = slideCount - 1;
  let rotationTimer;

  pagination?.classList.add("swiper-pagination-vertical", "swiper-pagination-bullets");

  const bullets = pagination
    ? Array.from({ length: slideCount }, (_, index) => {
      const bullet = document.createElement("button");
      bullet.type = "button";
      bullet.className = "swiper-pagination-bullet";
      bullet.setAttribute("aria-label", `Show service ${index + 1}`);
      pagination.appendChild(bullet);
      return bullet;
    })
    : [];

  const applySlideState = () => {
    const previousIndex = (activeIndex - 1 + slideCount) % slideCount;
    const nextIndex = (activeIndex + 1) % slideCount;

    contentSlides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("swiper-slide-active", isActive);
      slide.classList.toggle("swiper-slide-visible", isActive);
      slide.classList.toggle("swiper-slide-fully-visible", isActive);
      slide.classList.toggle("swiper-slide-prev", index === previousIndex);
      slide.classList.toggle("swiper-slide-next", index === nextIndex);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    imageSlides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      const forwardDistance = (index - activeIndex + slideCount) % slideCount;
      const stackDepth = forwardDistance === 0 ? 0 : slideCount - forwardDistance;
      const isNext = forwardDistance === 1;
      const coverflow = [
        { opacity: 1, scale: 1, y: 0, z: 6 },
        { opacity: 1, scale: 0.828, y: -169, z: 5 },
        { opacity: 0, scale: 0.707, y: -288, z: 4 },
        { opacity: 0, scale: 0.616, y: -376, z: 3 },
        { opacity: 0, scale: 0.545, y: -444, z: 2 },
      ];
      const state = isActive ? coverflow[0] : isNext ? coverflow[4] : coverflow[Math.min(stackDepth, 4)];

      slide.classList.toggle("swiper-slide-active", isActive);
      slide.classList.toggle("swiper-slide-visible", isActive);
      slide.classList.toggle("swiper-slide-fully-visible", isActive);
      slide.classList.toggle("swiper-slide-prev", index === previousIndex);
      slide.classList.toggle("swiper-slide-next", index === nextIndex);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      slide.style.opacity = String(state.opacity);
      slide.style.pointerEvents = isActive ? "auto" : "none";
      slide.style.transform = `translateY(${state.y}px) scale(${state.scale})`;
      slide.style.zIndex = String(state.z);
    });

    bullets.forEach((bullet, index) => {
      bullet.classList.toggle("swiper-pagination-bullet-active", index === activeIndex);
      bullet.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  const goTo = (index) => {
    activeIndex = (index + slideCount) % slideCount;
    applySlideState();
  };

  const restartRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = window.setInterval(() => goTo(activeIndex + 1), 4200);
  };

  bullets.forEach((bullet, index) => {
    bullet.addEventListener("click", () => {
      goTo(index);
      restartRotation();
    });
  });

  goTo(activeIndex);
  restartRotation();
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
        <img src="/media/site/uploads/2026/02/1eb905717a6ca186042290a3bfcb9ce7cb8ff851.png" alt="Lear Medical social media post">
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

function setupLoginButtons() {
  document.querySelectorAll(".btn-login[onclick]").forEach((button) => {
    button.removeAttribute("onclick");
  });
}

function setSelectedPdf(url) {
  currentPdfUrl = url || currentPdfUrl;
  const field = document.getElementById("pdf_url");
  if (field && "value" in field) field.value = currentPdfUrl;
}

function openPdfGate() {
  closeModal(document.querySelector("#pdfViewModal.show"));
  setSelectedPdf(currentPdfUrl || defaultBrochureUrl);
  openModal(document.getElementById("casestudy-pop") ? "#casestudy-pop" : "#downloadPopup");
}

function getFormValue(form, names) {
  for (const name of names) {
    const field = form.elements.namedItem(name);
    if (field && "value" in field) return field.value.trim();
  }
  return "";
}

function setFormMessage(form, message, status = "init") {
  const output = form.querySelector(".wpcf7-response-output");
  if (!output) return;
  output.removeAttribute("aria-hidden");
  output.textContent = message;
  form.dataset.status = status;
  form.classList.remove("init", "sent", "failed", "invalid", "submitting");
  form.classList.add(status);
}

function triggerDownload(url) {
  if (!url) return;
  const link = document.createElement("a");
  link.href = url;
  link.download = url.split("/").pop() || "lear-medical-download.pdf";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function submitLeadForm(form) {
  const isDownloadForm = Boolean(form.querySelector('[name="pdf_url"]')) || Boolean(form.closest("#downloadPopup, #casestudy-pop"));
  const isCaseStudyForm = Boolean(form.closest("#casestudy-pop"));
  const pdfUrl = isDownloadForm ? getFormValue(form, ["pdf_url"]) || currentPdfUrl || defaultBrochureUrl : "";
  const payload = {
    type: isDownloadForm ? "download" : "contact",
    name: getFormValue(form, ["your-name", "user-name"]),
    email: getFormValue(form, ["your-email", "user-email"]),
    phone: getFormValue(form, ["your-phone", "phone-number"]),
    organization: getFormValue(form, ["your-organization"]),
    message: getFormValue(form, ["your-message", "user-message"]),
    pdfUrl,
    pageUrl: window.location.href,
    website: getFormValue(form, ["website"]),
  };

  if (!payload.name || !payload.email || !payload.phone) {
    setFormMessage(form, "Please enter your name, email, and phone number.", "invalid");
    return;
  }

  const submitters = [...form.querySelectorAll('[type="submit"]')];
  submitters.forEach((button) => {
    button.disabled = true;
  });
  setFormMessage(form, "Sending...", "submitting");

  try {
    const endpoint = isDownloadForm
      ? isCaseStudyForm
        ? caseStudyFormspreeEndpoint
        : brochureFormspreeEndpoint
      : formEndpoint;
    const requestPayload = isDownloadForm
      ? {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        organization: payload.organization,
        message: payload.message,
        pdf_url: pdfUrl,
        page_url: payload.pageUrl,
        _subject: `${isCaseStudyForm ? "Case study" : "Brochure"} download request: ${payload.name}`,
      }
      : payload;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      const formspreeErrors = Array.isArray(result.errors)
        ? result.errors.map((item) => item.message || item.code).filter(Boolean).join(" ")
        : "";
      throw new Error(formspreeErrors || result.message || "We could not send your request right now. Please try again.");
    }

    setFormMessage(
      form,
      isDownloadForm ? "Thank you. Your download is starting now." : result.message || "Thank you. Your request has been sent.",
      "sent"
    );
    form.reset();

    if (isDownloadForm) {
      triggerDownload(pdfUrl);
      window.setTimeout(() => closeModal(form.closest(".modal")), 900);
    }
  } catch (error) {
    setFormMessage(form, error.message, "failed");
  } finally {
    submitters.forEach((button) => {
      button.disabled = false;
    });
  }
}

function setupLeadForms() {
  document.querySelectorAll("form.wpcf7-form").forEach((form) => {
    if (form.dataset.learFormHandler === "true") return;
    form.dataset.learFormHandler = "true";
    if (form.querySelector('[name="pdf_url"]')) setSelectedPdf(getFormValue(form, ["pdf_url"]) || defaultBrochureUrl);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitLeadForm(form);
    });
  });
}

function setupClickHandlers() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const pdfTrigger = target.closest("[data-pdf]");
    if (pdfTrigger) setSelectedPdf(pdfTrigger.getAttribute("data-pdf"));

    const openDownload = target.closest(".js-open-download");
    if (openDownload) {
      event.preventDefault();
      openPdfGate();
      return;
    }

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
  setupLoginButtons();
  requestAnimationFrame(setupServicesCarousel);
  requestAnimationFrame(activateStaticSwipers);
  requestAnimationFrame(() => {
    loadResourceWidgets(path);
    scheduleResourceArticles(path);
  });
  setupScrollTop();
  setupQueryScroll();
  setupLeadForms();
  setupClickHandlers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPage, { once: true });
} else {
  setupPage();
}
