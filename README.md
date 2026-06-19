# Lear Medical Platform

This repository is organized as a two-app workspace:

- `frontend/` - Astro static website deployed to Cloudflare Pages.
- `cms/` - Strapi CMS backend deployed to Strapi Cloud.

## Frontend

```bash
npm install
npm run dev
npm run build
```

Cloudflare Pages should use:

- Root directory: `/`
- Build command: `npm run build`
- Output directory: `frontend/dist`

## CMS

```bash
npm install
npm run cms:develop
```

Strapi Cloud should use:

- Root directory: `/`
- Branch: `main`
- Build command: `npm run cms:build`
- Start command: `npm run cms:start`

Editors add resource articles in Strapi. The Astro frontend reads published CMS content during build using `STRAPI_URL` and `STRAPI_API_TOKEN`.

## Forms

Forms submit directly to Formspree from the static Astro frontend:

- Contact: `https://formspree.io/f/mlgkyyek`
- Brochure downloads: `https://formspree.io/f/xkoallnj`
- Case study downloads: `https://formspree.io/f/xnjykkqg`

Brochure and case study submissions start the relevant PDF download after Formspree accepts the lead. Configure owner notifications inside each Formspree form's settings.
