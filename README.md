# BG Remover

A free AI-powered background removal tool built with Next.js and deployed on Cloudflare Pages.

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **API**: Edge Runtime → Remove.bg API
- **Deploy**: Cloudflare Pages

## Quick Start

### 1. Get API Key
Sign up at [remove.bg](https://www.remove.bg/api) and get your API key.

### 2. Local Development
```bash
npm install
cp .dev.vars.example .dev.vars   # fill in your REMOVEBG_API_KEY
npm run dev
```

### 3. Deploy to Cloudflare Pages

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
npm run build
wrangler pages deploy .next
```

### 4. Set Environment Variable on Cloudflare
Go to **Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables**:
```
REMOVEBG_API_KEY = your_api_key_here
```

## Project Structure
```
src/
  app/
    page.tsx              # Main UI
    layout.tsx            # Root layout + SEO meta
    globals.css           # Tailwind base styles
    api/
      remove-bg/
        route.ts          # Edge API → remove.bg proxy
```

## Notes
- Images are **never stored** — processed in memory and returned directly
- Edge Runtime ensures low latency globally via Cloudflare's network
- Max image size: 20MB
