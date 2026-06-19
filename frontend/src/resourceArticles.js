export const resourceArticles = [
  {
    title: "From the Cockpit to Control Room: Engineering Aviation-Grade Safety into Radiology",
    date: "March 24, 2026",
    isoDate: "2026-03-24",
    category: "White Paper",
    categoryValue: "white-paper",
    pdf: "/media/site/uploads/2026/03/From-Cockpit-to-Control-Room_-Engineering-Aviation-Grade-Safety-into-Radiology-Final-Draft-.pdf",
    image: "/media/site/uploads/2026/03/Screenshot-2026-03-24-144752.png",
  },
  {
    title: "Fundamentals of Diagnostic Error in Imaging",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/media/site/uploads/2026/03/Fundamentals-of-Diagnostic-Error-in-Imaging-1.pdf",
    image: "/media/site/uploads/2026/03/thumbnail-0-2.jpeg",
  },
  {
    title: "Errors and Cost",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/media/site/uploads/2026/03/Errors-and-Cost.pdf",
    image: "/media/site/uploads/2026/03/download.png",
  },
  {
    title: "An International Survey of Quality and Safety Programs in Radiology",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/media/site/uploads/2026/03/An-International-Survey-of-Quality-and-Safety-Programs-in-Radiology.pdf",
    image: "/media/site/uploads/2026/03/thumbnail-0.jpeg",
  },
  {
    title: "Clinical Radiology Workforce Census Report",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/media/site/uploads/2026/03/rcr-2024-clinical-radiology-workforce-census-report.pdf",
    image: "/media/site/uploads/2026/03/Screenshot-2026-03-05-191550.png",
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeAssetUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw, "https://lear.local");
    const isLocal = url.origin === "https://lear.local";
    const isStrapiMedia = /^https?:\/\//.test(raw);
    if (!isLocal && !isStrapiMedia) return "";
    return isLocal ? `${url.pathname}${url.search}` : raw;
  } catch {
    return "";
  }
}

export function normalizeResourceArticle(article) {
  const category = article.category || "Resource";
  return {
    title: String(article.title || "Untitled resource"),
    date: String(article.date || ""),
    isoDate: String(article.isoDate || ""),
    category: String(category),
    categoryValue: String(article.categoryValue || category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
    pdf: safeAssetUrl(article.pdf),
    image: safeAssetUrl(article.image),
  };
}

export function renderResourceCard(article) {
  const safeArticle = normalizeResourceArticle(article);
  const title = escapeHtml(safeArticle.title);
  const date = escapeHtml(safeArticle.date);
  const category = escapeHtml(safeArticle.category);
  const pdf = escapeHtml(safeArticle.pdf);
  const image = escapeHtml(safeArticle.image);

  return `
    <div class="resource-card" data-pdf="${pdf}" data-title="${title}">
      <div class="row align-items-center">
        <div class="col-lg-7 col-8">
          <div class="article-badgeslist mb-3">
            <div class="date-post-lear">${date}</div>
            <div class="article-lgcategory">${category}</div>
          </div>
          <h5 class="article-heading-lear">${title}</h5>
          <div class="mt-4 d-flex gap-3">
            <a href="#" class="anchor-tag downloadpdf js-open-download" data-pdf="${pdf}">
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
          <img src="${image}" class="img-fluid js-view-pdf thumb-sl-slid" alt="${title}" style="pointer-events: none;">
        </div>
      </div>
    </div>`;
}

export function injectResourceArticles(html, articles = resourceArticles) {
  const cards = articles.map(normalizeResourceArticle).filter((article) => article.pdf && article.image).map(renderResourceCard).join("");
  const nextHtml = html.replace(
    /<div([^>]*\s)?id=(["'])resourceResults\2([^>]*)><\/div>/,
    `<div id="resourceResults">${cards}</div>`
  );

  return nextHtml === html ? `${html}<div id="resourceResults">${cards}</div>` : nextHtml;
}
