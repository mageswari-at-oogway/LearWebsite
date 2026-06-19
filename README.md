# Lear Medical Platform

This repository is organized as a two-app workspace:

- `frontend/` - Astro static website deployed to Cloudflare Pages.
- `cms/` - Strapi CMS backend deployed to Strapi Cloud.

## Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

Cloudflare Pages should use:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

## CMS

```bash
cd cms
npm install
npm run develop
```

Strapi Cloud should use:

- Root directory: `cms`
- Branch: `main`

Editors add resource articles in Strapi. The Astro frontend reads published CMS content during build using `STRAPI_URL` and `STRAPI_API_TOKEN`.
