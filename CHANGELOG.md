# Changelog

## v1.0.0 — 2026-07-09 · Initial build + two iteration passes

### Build
- Full static site: home, /work, /pricing, /guide (+3 briefings), /contact, 404.
- "Carbon & Flare" design system; WebGL shader sun hero; Daybreak scroll transition; kinetic CTA.

### Pass 1 — Design & Craft Audit (logged findings → fixes)
1. **No-JS failure mode**: `.reveal` elements stayed `opacity:0` if JavaScript never ran → hidden states now gated behind an `html.js` class set by an inline head script on every page.
2. **Contrast**: `--cream-faint` (38% cream) measured ≈3.2:1 on carbon for small mono labels → bumped to 46% (≈4.5:1) across labels, tier tags, article meta.
3. **Focus states on light sections**: amber outline was near-invisible on cream → dedicated darker outline color (`#8a4f00`) for `.section--light`.
4. **Mobile stats rhythm**: at ≤480px the 2nd stat lost its top separator due to a cascading tablet rule → explicit border restored in the 480px block.
5. **Daybreak legibility**: cream text sat on the amber sun for a beat during the flip → theme-switch threshold moved from 0.52 → 0.50 progress so ink text lands as the sun reaches the text.
6. **Kinetic CTA without GSAP**: outline text would never fill if the GSAP CDN was blocked → now falls back to the filled state whenever ScrollTrigger is unavailable (not just reduced motion).

### Pass 2 — Elevation Pass (good → exceptional)
1. **Flagship tier signature**: animated conic-gradient border shimmer on the Blueprint card (`@property --ang` + masked conic gradient) — reads as "energized," pauses under reduced motion.
2. **Hero exit choreography**: hero content now scrubs out (fade + rise) as you scroll into the stats strip, instead of being dumbly covered.
3. **Daybreak telemetry**: added the pulsing `T+00:00 · monitoring active` mono caption that appears the moment the page "lights up" — ties the transition to the Command-tier story.
4. **Cross-browser pass**: `-webkit-backdrop-filter` for Safari nav blur; `100vh` fallbacks ahead of `100svh` for older Safari; `-webkit-mask-composite` for the shimmer border; marquee, text-stroke, and importmap verified against current Chrome/Safari/Firefox support.
