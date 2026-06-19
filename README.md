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

The frontend includes a Cloudflare Pages Function at `frontend/functions/api/form.js`.

Add these environment variables in Cloudflare Pages to send contact and brochure-download leads to the site owner:

```bash
RESEND_API_KEY=your-resend-api-key
FORM_OWNER_EMAIL=info@learmedical.com
FORM_FROM_EMAIL="Lear Medical <no-reply@learmedical.com>"
```

Brochure/download forms email the owner first, then start the PDF download for the visitor.
