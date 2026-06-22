# Lear Medical Website

Astro static website for Lear Medical with a Strapi CMS backend for resource articles.

## Project Structure

```txt
.
├── astro.config.mjs
├── public/
├── src/
├── cms/
└── docs/
```

- `src/` contains the Astro website source.
- `public/` contains static website assets.
- `cms/` contains the Strapi CMS app.
- `docs/` contains CMS and integration notes.

## Website

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deployment (Cloudflare Pages)

The site builds and deploys on **Cloudflare Pages** when you push to `main`. GitHub Actions is not used for builds.

Connected repository: `oogway-lab/lear-medical-website`

Cloudflare build settings:

- Framework preset: Astro
- Root directory: `/`
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Production branch: `main`

Set these environment variables in Cloudflare Dashboard → Workers & Pages → `lear-medical-website` → Settings → Environment variables:

| Variable | Production | Notes |
|----------|------------|-------|
| `PUBLIC_SITE_URL` | `https://lear-medical-website.pages.dev` | Already configured |
| `STRAPI_STRICT` | `false` | Already configured |
| `STRAPI_URL` | Your Strapi Cloud URL | Add when CMS is live |
| `STRAPI_API_TOKEN` | Read-only token | Mark as encrypted secret |

Preview deployments are enabled for all branches and pull requests.

Manual deploy from your machine (optional):

```bash
npm run deploy
```

## CMS

```bash
cd cms
npm install
npm run develop
```

Strapi Cloud should use:

- Base directory: `cms`
- Branch: `main`
- Build command: `npm run build`
- Start command: `npm run start`

Editors add resource articles in Strapi. The Astro website reads published CMS content during build using `STRAPI_URL` and `STRAPI_API_TOKEN`.

## Environment

Copy `.env.example` to `.env` for local Strapi-backed builds.

```bash
STRAPI_URL=https://your-project.strapiapp.com
STRAPI_API_TOKEN=your-read-token
STRAPI_STRICT=false
PUBLIC_SITE_URL=https://lear-medical-website.pages.dev
```

Do not commit `.env`.

## Forms

Forms submit directly to Formspree from the static Astro website:

- Contact: `https://formspree.io/f/mlgkyyek`
- Brochure downloads: `https://formspree.io/f/xkoallnj`
- Case study downloads: `https://formspree.io/f/xnjykkqg`

Brochure and case study submissions start the relevant PDF download after Formspree accepts the lead. Configure owner notifications inside each Formspree form's settings.
