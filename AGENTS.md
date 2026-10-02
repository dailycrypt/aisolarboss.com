# AGENTS.md

## Project overview

**aisolarboss.com** — zero-build static site for AI Solar Boss. Hand-crafted HTML/CSS/JS, no framework, no bundler, no build step. The repository IS the deployable artifact.

## Stack

- Static HTML/CSS/JS served from the repo root
- Three.js 0.160, GSAP 3.12, Lenis 1.1 — all loaded from CDNs via import map (no npm install needed)
- Fonts from Fontshare + Google Fonts (CDN)
- No backend, no database, no API

## Running in Base44

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- nginx:alpine serves static files on host port 3000
- Source is bind-mounted read-only; edits are reflected immediately on page refresh (no build step)
- `nginx-base44.conf` handles 404 routing and asset caching
- No secrets or external credentials required

## Key notes

- Pages use root-relative paths (`/assets/...`) — must be served from repo root, not via `file://`
- `index.html` is the home page; subdirectories (`/work/`, `/pricing/`, `/guide/`, `/contact/`) each have their own `index.html`
- `404.html` is the custom error page
- `assets/css/main.css` is the design system; `assets/js/main.js` is the interaction layer; `assets/js/sun.js` is the WebGL hero (home page only)
