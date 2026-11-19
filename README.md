# Amar Music Academy

A Vite + React landing page for **Amar Music Academy**, Ludhiana — *We Create Performers*.
Built from the academy's website profile draft (updated 18 November 2026).

Every sound on the page is synthesised with the Web Audio API — there are no audio files.
The hero's WebGL layer uses Three.js / React Three Fiber and is lazy-loaded.

## Scripts

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm run build     # production build to dist/
npm run preview   # http://127.0.0.1:4173
```

## Deployment

The site is a static Vite build. `render.yaml` describes the Render service:

- Build: `npm ci && npm run build`
- Publish directory: `./dist`
- Node: 22

The existing service is **https://sargam-academy.onrender.com**. Pushing to `main`
triggers a deploy when auto-deploy is enabled in the Render dashboard. The URL still
carries the old “sargam” name; the site itself is Amar Music Academy.

## Read this before publishing

The source document is a **working draft**, not a verified prospectus. It explicitly marks
several facts for confirmation. The site deliberately keeps those statements general, but
these still need sign-off:

- Exact degree titles, award years, and the B.Sc. institution/year.
- AIR FM Gold and Doordarshan role titles and dates.
- Film and television credits (`Sardar Udham`, `Fateh`, `The Diplomat`, Colors, Zee Punjabi),
  including permission to name productions and use any stills. They are currently in the founder
  bio as supplied; remove them until verified if permission is not in place.
- The exact public address and preferred contact number(s).
- Whether each listed course is currently available online, offline or both.
- Current course fees, class duration, batch size and demo scheduling wording.
- Do **not** publish the WhatsApp API number or any credentials.

### Fees and demo copy

`src/lib/site.js` uses these figures:

- Group classes: ₹3,000 / ₹4,000 / ₹5,000 per month by level (beginner / intermediate / advanced).
  Two classes a week, about eight a month.
- Demo class: **free**, 15–30 minutes, online or in person.
- Individual class fees are **not** published; they are quoted on enquiry.

Course fees are still the draft's indicative figures. Keep them labelled “indicative” until
the academy approves the final sheet.

### Registration

Registration is handled by the academy's Google Form, stored in `SITE.registrationUrl`.
Every “Book a demo” / “Register” button opens that form in a new tab. Replace the URL in
`src/lib/site.js` if the form moves.

## Placeholders to replace

All site copy, pricing, contact details and media paths live in `src/lib/site.js`.

- `SITE.registrationUrl` — the live Google Form. Already set; update if the form changes.
- `SITE.reelSrc` — **empty by default.** While empty, the reel dialog shows a still and says the
  reel is in the edit. Set this to a video URL to embed it.
- `SITE.phone` / `SITE.phoneAlt` — supplied numbers; confirm which one should be primary.
- `https://amarmusicacademy.in/` in `index.html` (canonical, Open Graph, JSON-LD),
  `public/robots.txt` and `public/sitemap.xml` — replace with the live domain.
- `public/og.png` — 1200×630 social card, built from the founder portrait.
- `public/favicon.svg` — brand mark.

## Photography

The founder portrait and the three studio / stage / riyaz images were supplied by the academy
(the portrait from the supplied photo; the rest from the academy's Google Photos album). They
show the founder only — no student or family photos were used. Get written consent before
publishing photographs of students, children, audiences or third-party logos.

The broadcast still from the album was **not** used because it carries a third-party channel
logo and news ticker; check permissions before using it.

## Audio notes

The guitar is a real Karplus–Strong string model, generated per pluck. Three bugs were fixed so
the strings actually speak:

1. The delay line read index `-1` on its first sample, producing `NaN`s that spread through the
   buffer; the browser rendered the result as silence. The delay line now wraps to the last
   excitation sample.
2. The AudioContext clock starts at `0`, and the retrigger guard treated a missing timestamp as
   “just played”, swallowing the first pluck after sound was enabled.
3. The hover/click throttle swallowed a click that followed a pointer move over the string.
   Deliberate clicks and strums now force a pluck.

Sound is enabled on the first user gesture (browser autoplay policy). Until then, the guitar and
tabla sections show a one-tap “Start sound” nudge.

## Accessibility and motion

- Sound is on by default as a preference, but the `AudioContext` only starts after the first
  user gesture. A single context, master gain and dynamics compressor handle every tone.
- The microphone demo is opt-in, runs entirely in the browser, and is never recorded, stored or
  uploaded.
- Reduced motion is honoured from `prefers-reduced-motion` and can be toggled from the footer. It
  disables the cursor spring, the pinned stage curtain and the vinyl spin.
- Low-power devices (≤2 cores, ≤2 GB memory, save-data) skip WebGL and use the CSS fallback orb.
- WebGL is deferred until interaction or 30 s of idle time, uses a DPR cap of 2, and pauses when
  the tab is hidden or the scene leaves view.

## Performance notes

- Production build: app chunks `index` 287 kB (≈89 kB gzipped) and shared `site` 122 kB
  (≈48 kB gzipped); the Three.js `HeroScene` chunk is 927 kB (≈246 kB gzipped) and lazy.
- `npm run build` is the production check. Run `npm run preview` and Lighthouse against
  `http://127.0.0.1:4173`.
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
public/         static assets, media, robots.txt, og.png
```
