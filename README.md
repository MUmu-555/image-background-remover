# Image Background Remover

A free AI-powered background removal tool built with **Next.js 14** and deployed on **Cloudflare Pages**.

🔗 **Live Demo**: Coming soon

## Features

- ✅ Drag & drop or click to upload (JPG, PNG, WEBP, max 20MB)
- ✅ AI removes background in 2–5 seconds (powered by Remove.bg)
- ✅ Side-by-side before/after comparison
- ✅ One-click PNG download with transparency
- ✅ Images never stored — processed in memory only
- ✅ Fully responsive (mobile-first)
- ✅ SEO optimized

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| API Runtime | Edge Runtime |
| Background AI | Remove.bg API |
| Deployment | Cloudflare Pages |
| Storage | None (in-memory only) |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/MUmu-555/image-background-remover.git
cd image-background-remover
npm install
```

### 2. Set Up API Key

Get a free API key at [remove.bg/api](https://www.remove.bg/api), then:

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your key:
# REMOVEBG_API_KEY=your_key_here
```

### 3. Run Locally

```bash
npm run dev
# Visit http://localhost:3000
```

## Deploy to Cloudflare Pages

```bash
# Build
npm run build

# Deploy (first time will prompt login)
npx wrangler pages deploy .next

# Or connect your GitHub repo in Cloudflare Dashboard for auto-deploy
```

**Set environment variable in Cloudflare Dashboard:**
- Pages → Your Project → Settings → Environment Variables
- Add: `REMOVEBG_API_KEY` = `your_key_here`

## Project Structure

```
src/
└── app/
    ├── page.tsx              # Main UI (upload / processing / result / error states)
    ├── layout.tsx            # Root layout + SEO metadata
    ├── globals.css           # Tailwind + custom styles
    └── api/
        └── remove-bg/
            └── route.ts      # Edge API route → Remove.bg proxy
```

## Remove.bg Pricing

| Plan | Price | Credits |
|------|-------|---------|
| Free | $0 | 50/month (preview quality) |
| Pay-as-you-go | From $0.20/image | No expiry |
| Subscription | From $9/month | 40 HD images/month |

## License

MIT
