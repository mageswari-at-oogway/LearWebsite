import { resourceArticles as fallbackResourceArticles } from "../resourceArticles.js";
import { siteBodyClasses, sitePages } from "../content/pages.js";

const env = import.meta.env || {};
const strapiUrl = (env.STRAPI_URL || env.PUBLIC_STRAPI_URL || "").replace(/\/$/, "");
const strapiToken = env.STRAPI_API_TOKEN || "";
const strictMode = env.STRAPI_STRICT === "true";

function isEnabled() {
  return Boolean(strapiUrl);
}

function normalizePath(slugOrPath) {
  if (!slugOrPath || slugOrPath === "home" || slugOrPath === "/") {
    return "/";
  }

  return slugOrPath.startsWith("/") ? slugOrPath : `/${slugOrPath}`;
}

function unwrapEntry(entry) {
  return entry?.attributes ? { id: entry.id, ...entry.attributes } : entry;
}

function mediaUrl(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const media = unwrapEntry(value?.data || value);
  const url = media?.url || media?.formats?.large?.url || media?.formats?.medium?.url || media?.formats?.thumbnail?.url;
  if (!url) {
    return "";
  }

  return url.startsWith("http") ? url : `${strapiUrl}${url}`;
}

async function fetchStrapi(endpoint) {
  if (!isEnabled()) {
    return null;
  }

  const url = `${strapiUrl}${endpoint}`;
  const headers = strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {};

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Strapi returned ${response.status} for ${endpoint}`);
    }
    return response.json();
  } catch (error) {
    if (strictMode) {
      throw error;
    }
    console.warn(`[strapi] ${error.message}. Falling back to local Astro content.`);
    return null;
  }
}

function normalizeSeo(attributes) {
  const seo = unwrapEntry(attributes.seo || {});
  return {
    title: seo.title || seo.metaTitle || attributes.seoTitle || attributes.title,
    description: seo.description || seo.metaDescription || attributes.seoDescription,
    keywords: seo.keywords || attributes.seoKeywords,
    image: mediaUrl(seo.image || seo.metaImage || attributes.seoImage),
  };
}

function normalizePage(entry) {
  const attributes = unwrapEntry(entry);
  const path = normalizePath(attributes.path || attributes.slug);
  return {
    path,
    bodyClass: attributes.bodyClass || siteBodyClasses[path] || siteBodyClasses["/"],
    html: sitePages[path],
    seo: normalizeSeo(attributes),
  };
}

function normalizeResourceArticle(entry) {
  const attributes = unwrapEntry(entry);
  const published = attributes.isoDate || attributes.date || attributes.publishedAt;
  const date = attributes.displayDate || attributes.dateLabel || fallbackDisplayDate(published);
  const category = attributes.category || "Resource";

  return {
    title: attributes.title,
    date,
    isoDate: published ? String(published).slice(0, 10) : "",
    category,
    categoryValue: attributes.categoryValue || category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    pdf: mediaUrl(attributes.pdf || attributes.file || attributes.download),
    image: mediaUrl(attributes.image || attributes.thumbnail || attributes.cover),
  };
}

function fallbackDisplayDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export async function getSitePages() {
  const fallbackPages = Object.fromEntries(
    Object.keys(sitePages).map((path) => [
      path,
      {
        path,
        bodyClass: siteBodyClasses[path],
        html: sitePages[path],
        seo: {},
      },
    ])
  );

  const response = await fetchStrapi("/api/pages?pagination[pageSize]=100&populate=*");
  const cmsPages = response?.data?.map(normalizePage).filter((page) => page.path && page.html) || [];

  for (const page of cmsPages) {
    fallbackPages[page.path] = {
      ...fallbackPages[page.path],
      ...page,
      seo: {
        ...(fallbackPages[page.path]?.seo || {}),
        ...(page.seo || {}),
      },
    };
  }

  return fallbackPages;
}

export async function getPage(path) {
  const pages = await getSitePages();
  return pages[path];
}

export async function getResourceArticles() {
  const response = await fetchStrapi("/api/resource-articles?pagination[pageSize]=100&populate=*");
  const cmsArticles = response?.data?.map(normalizeResourceArticle).filter((article) => article.title && article.pdf && article.image) || [];
  const articles = [...cmsArticles, ...fallbackResourceArticles];
  const uniqueArticles = articles.filter((article, index, list) => {
    const key = `${article.title}|${article.pdf}`;
    return list.findIndex((item) => `${item.title}|${item.pdf}` === key) === index;
  });

  uniqueArticles.sort((a, b) => String(b.isoDate || "").localeCompare(String(a.isoDate || "")));

  return uniqueArticles;
}

export const strapiConfig = {
  enabled: isEnabled(),
  url: strapiUrl,
};
