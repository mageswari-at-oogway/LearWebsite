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

## Forms

Forms submit directly to Formspree from the static Astro frontend:

- Contact: `https://formspree.io/f/mlgkyyek`
- Brochure downloads: `https://formspree.io/f/xkoallnj`
- Case study downloads: `https://formspree.io/f/xnjykkqg`

Brochure and case study submissions start the relevant PDF download after Formspree accepts the lead. Configure owner notifications inside each Formspree form's settings.
