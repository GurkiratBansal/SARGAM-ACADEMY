# Sargam Academy

A Vite + React landing page for a fictional six-week Hindustani music cohort.
Every sound on the page is synthesised with the Web Audio API — there are no audio
files. The hero's WebGL layer uses Three.js / React Three Fiber and is lazy-loaded.

## Scripts

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm run build     # production build to dist/
npm run preview   # http://127.0.0.1:4173
```

## Placeholders to replace before launch

All site copy, pricing, cohort dates and media paths live in `src/lib/site.js`.

- `SITE.cohortLabel` / `SITE.cohortShort` — cohort date and time.
- `SITE.seats` — number of seats.
- `SITE.location` / `SITE.email` — venue and contact email.
- `SITE.formEndpoint` — **empty by default.** While empty, registrations are saved to
  `localStorage` only (demo mode). Set this to a POST endpoint that accepts JSON
  (`name`, `email`, `goal`, `experience`, `cohort`) to go live.
- `SITE.reelSrc` — **empty by default.** While empty, the intro reel dialog shows a
  placeholder poster. Set this to a video URL to embed the reel.
- `public/media/instructor-portrait.svg`, `public/media/reel-poster.svg` — replace
  with real artwork (keep the 800×800 and 1200×675 aspect ratios).
- `public/og.png` — 1200×630 social card.
- `public/favicon.svg` — brand mark.

## Accessibility and motion

- Sound is **off by default**. The nav toggle enables a single `AudioContext` with a
  master gain and a dynamics compressor; all tones are scheduled through it.
- The microphone demo is opt-in, runs entirely in the browser, and is never recorded,
  stored or uploaded.
- Reduced motion is honoured from `prefers-reduced-motion` and can be toggled from the
  footer. It disables the cursor spring, the pinned stage curtain and the vinyl spin.
- Low-power devices (≤2 cores, ≤2 GB memory, save-data) skip WebGL and use the CSS
  fallback orb. WebGL is deferred until interaction or 30 s of idle time.
- WebGL uses a DPR cap of 2 and pauses when the tab is hidden or the scene leaves view.

## Performance notes

- Main bundle is ~457 kB (≈149 kB gzipped); the Three.js chunk (~927 kB / 245 kB
  gzipped) is loaded lazily.
- `npm run build` is the production check. Run `npm run preview` and Lighthouse
  against `http://127.0.0.1:4173`.
- Lighthouse targets: Accessibility, Best Practices and SEO 90+, mobile Performance 75+.

## Structure

```
src/
  components/   sections, instruments, overlays
  context/      preferences, sound, wave transition
  hooks/        voice input, in-view, section navigation, smooth scroll
  lib/          audio engine, notes, site config, scroll helpers, reveal
  styles/       CSS partials imported by src/index.css
  webgl/        lazy HeroScene (R3F)
public/         static assets, robots.txt, og.png
```
