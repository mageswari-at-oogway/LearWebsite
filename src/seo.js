const siteUrl = ((import.meta.env || {}).PUBLIC_SITE_URL || "https://learwebsite.pages.dev").replace(/\/$/, "");
const updatedDate = "2026-06-18";

export const seoDefaults = {
  siteUrl,
  siteName: "Lear Medical",
  organizationName: "Lear Medical",
  defaultImage: "/media/site/uploads/2026/02/banner-main-1.jpg",
  logo: "/media/site/uploads/2025/10/Logo-5.svg",
  phone: "+91 99724 55448",
  email: "info@learmedical.com",
  sameAs: ["https://www.linkedin.com/company/lear-medical/"],
};

export const seoByPath = {
  "/": {
    title: "Lear Medical | Radiology Quality, Safety and Performance",
    description:
      "Lear Medical helps hospitals and radiology teams improve diagnostic quality, productivity, efficiency and safety through aviation-inspired QA programs.",
    keywords:
      "radiology quality assurance, radiology peer review, diagnostic error reduction, radiology performance, healthcare quality improvement",
    type: "website",
  },
  "/about": {
    title: "About Lear Medical | Radiology Quality and Diagnostic Safety",
    description:
      "Learn how Lear Medical applies aviation-inspired safety systems and the S.P.E.Q. framework to improve radiology quality and reporting consistency.",
    keywords:
      "about Lear Medical, radiology quality, diagnostic safety, S.P.E.Q framework, radiology workflow improvement",
  },
  "/services": {
    title: "Radiology QA and Peer Review Services | Lear Medical",
    description:
      "Explore Lear Medical services for enterprise QA transformation, QA assessment, radiology peer review, compliance alignment and efficiency improvement.",
    keywords:
      "radiology QA services, radiology peer review services, NABH radiology compliance, diagnostic imaging quality, teleradiology quality assurance",
  },
  "/resources": {
    title: "Radiology Quality Resources and Case Studies | Lear Medical",
    description:
      "Access Lear Medical resources including white papers, e-books and case studies on diagnostic error, radiology workforce, quality programs and imaging safety.",
    keywords:
      "radiology white papers, diagnostic error resources, radiology case studies, imaging quality e-books, radiology safety research",
  },
  "/contact": {
    title: "Contact Lear Medical | Radiology Quality and QA Consultation",
    description:
      "Contact Lear Medical to discuss radiology quality assurance, peer review services, workflow diagnostics and diagnostic performance improvement programs.",
    keywords:
      "contact Lear Medical, radiology QA consultation, diagnostic imaging quality support, radiology peer review consultation",
  },
};

export function getSeo(path, overrides = {}) {
  const base = seoByPath[path] || seoByPath["/"];
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides || {}).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const imagePath = cleanOverrides.image || base.image || seoDefaults.defaultImage;

  return {
    ...seoDefaults,
    ...base,
    ...cleanOverrides,
    path,
    canonical: `${siteUrl}${path === "/" ? "/" : path}`,
    image: imagePath.startsWith("http") ? imagePath : `${siteUrl}${imagePath}`,
    updatedDate,
  };
}

export function buildJsonLd(seo) {
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const pageId = `${seo.canonical}#webpage`;
  const pathName = seo.path === "/" ? "Home" : seo.path.slice(1).replace(/-/g, " ");

  const organization = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": orgId,
    name: seo.organizationName,
    url: siteUrl,
    logo: `${siteUrl}${seo.logo}`,
    email: seo.email,
    telephone: seo.phone,
    sameAs: seo.sameAs,
    areaServed: ["United Kingdom", "India"],
    knowsAbout: [
      "Radiology quality assurance",
      "Diagnostic error reduction",
      "Radiology peer review",
      "Healthcare workflow diagnostics",
      "Radiology performance improvement",
    ],
    address: [
      {
        "@type": "PostalAddress",
        addressCountry: "GB",
        streetAddress: "Kingsley House, 22-24, Elm Road",
        addressLocality: "Leigh-On-Sea",
        addressRegion: "Essex",
        postalCode: "SS9 1SN",
      },
      {
        "@type": "PostalAddress",
        addressCountry: "IN",
        streetAddress: "Unit No. TF-04, 3rd Floor, 38/17, #1678, Smart Avenue, Nehru Road, Kammanahalli, HRBR Layout",
        addressLocality: "Bangalore",
        postalCode: "560043",
      },
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: seo.siteName,
    url: siteUrl,
    publisher: { "@id": orgId },
    inLanguage: "en",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${seo.canonical}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      ...(seo.path === "/"
        ? []
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: pathName.replace(/\b\w/g, (letter) => letter.toUpperCase()),
              item: seo.canonical,
            },
          ]),
    ],
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": seo.path === "/" ? "WebPage" : "AboutPage",
    "@id": pageId,
    url: seo.canonical,
    name: seo.title,
    description: seo.description,
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
    primaryImageOfPage: seo.image,
    dateModified: seo.updatedDate,
    inLanguage: "en",
    breadcrumb: { "@id": `${seo.canonical}#breadcrumb` },
  };

  if (seo.path === "/services") {
    webPage["@type"] = ["WebPage", "Service"];
    webPage.serviceType = "Radiology quality assurance and peer review services";
    webPage.provider = { "@id": orgId };
    webPage.areaServed = ["United Kingdom", "India"];
    webPage.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Lear Medical Services",
      itemListElement: [
        "Enterprise QA Transformation Program",
        "Basic QA Assessment and Guidance",
        "Standard Radiology Peer Review Services",
        "Compliance Alignment",
        "Radiology Efficiency Improvement",
        "Continuous Learning",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
        },
      })),
    };
  }

  if (seo.path === "/resources") {
    webPage["@type"] = "CollectionPage";
    webPage.name = "Lear Medical Resources";
  }

  if (seo.path === "/contact") {
    webPage["@type"] = "ContactPage";
  }

  return [organization, website, breadcrumb, webPage];
}

const h1LabelsByPath = {
  "/contact": "Contact Lear Medical",
};

function appendClass(attrs, className) {
  if (/\sclass=/.test(attrs)) {
    return attrs.replace(/\sclass=(["'])(.*?)\1/i, (_match, quote, value) => {
      const classes = value.split(/\s+/);
      return classes.includes(className)
        ? ` class=${quote}${value}${quote}`
        : ` class=${quote}${value} ${className}${quote}`;
    });
  }

  return `${attrs} class="${className}"`;
}

function addAltToImage(tag) {
  if (/\salt=/.test(tag)) {
    return tag;
  }

  const src = tag.match(/\ssrc=(["'])(.*?)\1/i)?.[2] || "";
  let alt = "";
  if (src.includes("serv4-2.svg")) {
    alt = "Radiology quality assurance workflow";
  }

  return tag.replace(/>$/, ` alt="${alt}">`);
}

export function prepareSeoHtml(path, html) {
  let prepared = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<section\b(?=[^>]*\bd-none\b)[\s\S]*?<\/section>/gi, "")
    .replace(/<img\b[^>]*>/gi, addAltToImage);

  let h1Seen = false;
  prepared = prepared.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (_match, attrs, content) => {
    if (!h1Seen) {
      h1Seen = true;
      return `<h1${attrs}>${content}</h1>`;
    }

    return `<h2${appendClass(attrs, "h1")}>${content}</h2>`;
  });

  if (!h1Seen && h1LabelsByPath[path]) {
    prepared = `<h1 class="seo-visually-hidden">${h1LabelsByPath[path]}</h1>${prepared}`;
  }

  return prepared;
}
