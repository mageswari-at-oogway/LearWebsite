# Strapi CMS Integration

This Astro site can build from Strapi at deploy time while keeping the current local Lear Medical content as a fallback.

## Environment

Copy `.env.example` to `.env` for local work, or add the same variables in Cloudflare Dashboard → Workers & Pages → `lear-medical-website` → Settings → Environment variables:

```bash
STRAPI_URL=https://your-project.strapiapp.com
STRAPI_API_TOKEN=your-read-only-token
STRAPI_STRICT=false
PUBLIC_SITE_URL=https://lear-medical-website.pages.dev
```

If `STRAPI_URL` is empty, the site builds from local static content. If Strapi is configured but unavailable, the build falls back to local content unless `STRAPI_STRICT=true`.

## Suggested Strapi Free Tier Content Types

### Page

Collection type: `page`

- `slug` Text, examples: `home`, `about`, `services`, `resources`, `contact`
- `path` Text, optional override, examples: `/`, `/about`
- `bodyClass` Text
- `html` Rich text or Long text
- `seoTitle` Text
- `seoDescription` Text
- `seoKeywords` Text
- `seoImage` Media
- `seo` Component, optional, with `title`, `description`, `keywords`, `image`

### Resource Article

Collection type: `resource-article`

- `title` Text
- `isoDate` Date
- `displayDate` Text, optional
- `category` Enumeration: `White Paper`, `E-Book`, `Case Study`
- `categoryValue` Text, optional
- `image` Media
- `pdf` Media

## Build Behavior

Astro fetches Strapi during `npm run build`, generates static HTML, and deploys the result to Cloudflare Pages. No client-side CMS dependency is shipped to users.

The existing Astro UI remains the local fallback content, so the site is safe to deploy before editors finish entering CMS content.

Resource articles are merged from Strapi and local content. Strapi articles are shown first by date, local articles remain available, and duplicate articles are removed when the title and PDF URL match.

`/sitemap.xml` is generated during the Astro build and includes Strapi-provided pages automatically.
