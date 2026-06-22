import { getSitePages } from "../cms/strapi.js";

const siteUrl = ((import.meta.env || {}).PUBLIC_SITE_URL || "https://lear-medical-website.pages.dev").replace(/\/$/, "");
const updatedDate = "2026-06-18";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function priorityForPath(path) {
  if (path === "/") {
    return "1.0";
  }
  if (path === "/services") {
    return "0.9";
  }
  if (path === "/about" || path === "/resources") {
    return "0.8";
  }
  if (path === "/contact") {
    return "0.7";
  }
  return "0.5";
}

function changefreqForPath(path) {
  return path === "/" || path === "/services" || path === "/resources" ? "weekly" : "monthly";
}

export async function GET() {
  const pages = await getSitePages();
  const paths = [...Object.keys(pages), "/llms.txt"].sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });

  const urls = paths
    .map((path) => {
      const loc = `${siteUrl}${path === "/" ? "/" : path}`;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${updatedDate}</lastmod>
    <changefreq>${changefreqForPath(path)}</changefreq>
    <priority>${priorityForPath(path)}</priority>
  </url>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
