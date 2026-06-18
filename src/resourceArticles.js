export const resourceArticles = [
  {
    title: "From the Cockpit to Control Room: Engineering Aviation-Grade Safety into Radiology",
    date: "March 24, 2026",
    isoDate: "2026-03-24",
    category: "White Paper",
    categoryValue: "white-paper",
    pdf: "/mirrored/learmedical/wp-content/uploads/2026/03/From-Cockpit-to-Control-Room_-Engineering-Aviation-Grade-Safety-into-Radiology-Final-Draft-.pdf",
    image: "/mirrored/learmedical/wp-content/uploads/2026/03/Screenshot-2026-03-24-144752.png",
  },
  {
    title: "Fundamentals of Diagnostic Error in Imaging",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/mirrored/learmedical/wp-content/uploads/2026/03/Fundamentals-of-Diagnostic-Error-in-Imaging-1.pdf",
    image: "/mirrored/learmedical/wp-content/uploads/2026/03/thumbnail-0-2.jpeg",
  },
  {
    title: "Errors and Cost",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/mirrored/learmedical/wp-content/uploads/2026/03/Errors-and-Cost.pdf",
    image: "/mirrored/learmedical/wp-content/uploads/2026/03/download.png",
  },
  {
    title: "An International Survey of Quality and Safety Programs in Radiology",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/mirrored/learmedical/wp-content/uploads/2026/03/An-International-Survey-of-Quality-and-Safety-Programs-in-Radiology.pdf",
    image: "/mirrored/learmedical/wp-content/uploads/2026/03/thumbnail-0.jpeg",
  },
  {
    title: "Clinical Radiology Workforce Census Report",
    date: "March 5, 2026",
    isoDate: "2026-03-05",
    category: "E-Book",
    categoryValue: "e-book",
    pdf: "/mirrored/learmedical/wp-content/uploads/2026/03/rcr-2024-clinical-radiology-workforce-census-report.pdf",
    image: "/mirrored/learmedical/wp-content/uploads/2026/03/Screenshot-2026-03-05-191550.png",
  },
];

export function renderResourceCard(article) {
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

export function injectResourceArticles(html, articles = resourceArticles) {
  const cards = articles.map(renderResourceCard).join("");
  const nextHtml = html.replace(
    /<div\s+id=(["'])resourceResults\1\s*><\/div>/,
    `<div id="resourceResults">${cards}</div>`
  );

  if (nextHtml === html) {
    throw new Error("Missing resourceResults container in resources page HTML");
  }

  return nextHtml;
}
