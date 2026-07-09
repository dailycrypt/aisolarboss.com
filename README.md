# aisolarboss.com

Flagship site for **AI Solar Boss** — AI-powered energy audits, bankable solar PV design, and always-on energy optimization (Manila · worldwide).

## Stack

Zero-build static site. Hand-crafted HTML/CSS/JS — no framework, no bundler, no Node required. Motion stack loads from CDNs:

- **Three.js 0.160** (ES module via import map) — WebGL hero: shader-displaced sun + particle corona
- **GSAP 3.12 + ScrollTrigger** — scroll choreography (Daybreak transition, kinetic CTA, hero exit scrub)
- **Lenis 1.1** — smooth scroll
- **Fonts**: Clash Display + General Sans (Fontshare), IBM Plex Mono (Google Fonts)

Because there is no build step, the repository **is** the deployable artifact.

## Structure

```
/                       Home (WebGL hero, tiers, proof, process, CTA)
/work/                  Case studies (representative engagements)
/pricing/               Full tier detail (Recon / Blueprint / Command) + FAQ
/guide/                 Educational hub
/guide/ai-energy-audits/
/guide/ra-11285/
/guide/solar-feasibility/
/contact/               Brief form (FormSubmit) + direct email
/404.html
/assets/css/main.css    Design system ("Carbon & Flare")
/assets/js/main.js      Interaction layer (Lenis, GSAP, cursor, reveals)
/assets/js/sun.js       WebGL hero module (home only)
```

## Design system — "Carbon & Flare"

- **Palette**: carbon `#0B0C0E` base · warm cream `#F2EDE3` · solar amber `#FFB300` → ember `#FF5C1F` accent ramp · teal `#2ED3B7` reserved for AI/data moments. Rationale: solar heat and light against night-black carbon; editorial single-accent system, deliberately no startup blue/violet.
- **Type**: Clash Display (display) / General Sans (body/UI) / IBM Plex Mono (engineering labels). Fluid `clamp()` scale throughout.
- **Signature motion**: the **Daybreak** section — a scroll-scrubbed sunrise that flips the page from carbon to cream; shader sun in the hero that shifts amber→ember as you scroll; conic-border shimmer on the flagship tier; magnetic buttons; char-split hero reveal; outline-fill kinetic CTA.
- **Assets**: 100% procedural (WebGL shaders, SVG feTurbulence grain, CSS gradients). No stock imagery, nothing to license. *(Substitution note: the image/video-generation asset pipeline from the master prompt was replaced with fully code-generated visuals — the environment had no binary-asset path this session, and procedural assets are lighter and license-free anyway.)*
- **Accessibility**: `prefers-reduced-motion` fully honored (static layout, no Lenis/GSAP/WebGL, Daybreak renders as a static cream panel); reveals gated behind `html.js` so nothing is hidden without JavaScript; skip link, focus-visible states, keyboard-safe nav, WCAG-checked contrast on both themes.

## Local development

Any static server works:

```bash
# Python
python -m http.server 8000
# or Node
npx serve .
```

Open `http://localhost:8000`. **Note:** pages use root-relative paths (`/assets/...`), so serve from the repo root — don't open files via `file://`.

## Deploying to Hostinger

No build step — upload the repo contents as-is.

**Option A — Hostinger Git deployment (recommended)**
1. hPanel → Websites → your site → **Advanced → Git**.
2. Add this repository, branch `main`, deploy path `public_html`.
3. Enable auto-deployment (webhook) so every push goes live.

**Option B — Manual upload**
1. Download this repo as ZIP (GitHub → Code → Download ZIP).
2. hPanel → **File Manager** → `public_html` → upload and extract.
3. Ensure `index.html` sits directly in `public_html`, not in a subfolder.

**After first deploy**
- Point the `aisolarboss.com` domain at Hostinger (DNS A record / nameservers) if not already done.
- Enable the free SSL certificate in hPanel and force HTTPS.
- Set `404.html` as the custom error page (hPanel → Error Pages), or via `.htaccess`: `ErrorDocument 404 /404.html`.

## Things to customize before go-live

| Item | Where | Note |
|---|---|---|
| Contact form email | `contact/index.html` (`formsubmit.co/...`) | Currently `hello@aisolarboss.com`. Create the mailbox, then submit the form once and click FormSubmit's activation email. |
| Indicative pricing | `index.html`, `pricing/index.html` | `from ₱95K` / `from ₱480K` are placeholders — set your real floors. |
| Stats & case figures | `index.html`, `work/index.html` | Marked as representative; replace with your actual engagement numbers as they accrue. |
| OG image | all pages | No raster OG image yet; add a 1200×630 `og.png` and `<meta property="og:image">` when convenient. |

## Performance notes

- WebGL renders only while the hero is on screen (IntersectionObserver pause) with DPR capped at 1.5–1.75 and reduced particle count on mobile.
- Hero degrades to a CSS radial-gradient sun when WebGL is unavailable or reduced motion is set.
- All JS is deferred; fonts are preconnected; there are no image payloads at all — the heaviest asset is Three.js itself, loaded only on the home page.

See `CHANGELOG.md` for the two logged iteration passes.
