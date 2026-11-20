---
name: pfm-retreat-site
description: Maintain and extend the PFM Retreat 2026 website in this repo — editing content or sections, swapping photos, keeping the Netlify deploy folder, zip, and live Artifact preview in sync, and following the established cinematic motion system and color palette. Use whenever asked to edit, redesign, add sections to, swap images on, or redeploy the PFM Retreat 2026 site (pfm-retreat-2026.html).
---

# PFM Retreat 2026 — Site Maintenance

A single-page cinematic landing site for the PFM Retreat 2026 outdoor team retreat
(Gopeng Glamping Park, Malaysia, 3–4 Oct 2026). Tailwind CDN + Alpine.js, no build
step. This skill captures the conventions already established in the repo so edits
stay consistent instead of re-deriving the system from scratch each time.

## File map — there are FOUR copies of this site; keep them in sync

| Path | Role |
|---|---|
| `pfm-retreat-2026.html` | **Source of truth.** Edit this one first. |
| `images/*.jpg` | Real photos referenced by `pfm-retreat-2026.html` via relative `images/...` paths. |
| `netlify-deploy/index.html` + `netlify-deploy/images/` | Exact copy of the above, renamed to `index.html` (Netlify's required entry point), for drag-and-drop deploy at app.netlify.com/drop. |
| `pfm-retreat-netlify.zip` | Zipped copy of `netlify-deploy/` for one-click upload. |
| Live Artifact (see below) | A self-contained single-file variant with the `<!DOCTYPE>/<html>/<head>/<body>` wrapper stripped and every image embedded as a base64 data URI (the Artifact CSP blocks external images and `unpkg.com`). |

**After any content edit to `pfm-retreat-2026.html`, propagate it:**

```bash
cd /home/user/project-status
cp pfm-retreat-2026.html netlify-deploy/index.html
rsync -a --delete images/ netlify-deploy/images/   # or cp -r if rsync unavailable
cd netlify-deploy && zip -r ../pfm-retreat-netlify.zip . -x ".*" && cd ..
```

Then regenerate and republish the Artifact (see "Artifact republish pipeline" below), and commit everything together.

## Design system

Defined in `tailwind.config` inside `pfm-retreat-2026.html` — change colors/fonts
here once and the whole page picks it up:

```js
colors: {
  brand: {
    forest: '#1B3022',   // primary dark background
    olive: '#2C3E2E',    // secondary dark surface
    charcoal: '#1A1D1A', // body text on light backgrounds
    cream: '#F4F1EA',    // primary light background
    creamDark: '#E8E2D5',// secondary light surface
    orange: '#E05A2B',   // primary accent / CTAs
    coral: '#EE6C4D',    // accent hover state
    mustard: '#E0A96D',  // supporting accent
    sky: '#709CA7',      // supporting accent
    pink: '#E892A0',     // supporting accent
  }
},
fontFamily: {
  sans: ['"Plus Jakarta Sans"', 'sans-serif'],  // body text
  display: ['Oswald', 'sans-serif'],             // headlines
  syne: ['Syne', 'sans-serif'],                  // bold statement lines
  hand: ['Caveat', 'cursive'],                   // handwritten accents
}
```

If asked to re-theme the site, only touch this block (plus any hardcoded hex in
the `<style>` block's grain/grid overlays) — never hand-edit dozens of Tailwind
class names across the page.

## Motion system (already built — reuse, don't reinvent)

A full cinematic motion system lives in the `<style>` block and the final
`<script>` block of `pfm-retreat-2026.html`:

- **Preloader → hero handoff**: `#preloader` fades out and `#hero` gets a
  `hero-active` class added by JS (with a 1.6s hard fallback). New hero elements
  that should animate in on load use class `hero-reveal` or `hero-word` plus an
  inline `style="--stagger:N"` for stagger timing — **not** the scroll-triggered
  classes below.
- **Scroll-triggered reveals**: add `class="reveal"` (fade + slide up) or
  `class="reveal-scale"` (fade + scale) to any new section/card, with
  `style="--stagger:N"` (0-indexed, resets per group) to stagger siblings. An
  `IntersectionObserver` in the bottom `<script>` block auto-wires every
  `.reveal`/`.reveal-scale` element — no per-element JS needed.
- **Nav**: `.nav-link` class on desktop nav `<a>` tags gets an active-section
  underline automatically (matched by `href="#id"` against observed sections).
  `#site-nav` switches to a more opaque/solid state via Alpine's `scrolled` flag
  once the user scrolls past 40px.
- **Magnetic buttons**: add `class="magnetic"` to a primary CTA (desktop/
  `pointer:fine` only) for a subtle cursor-follow pull. Keep this to 2-3 buttons
  max — it's reserved for primary CTAs, not every button.
- **Accessibility**: everything above fully respects `prefers-reduced-motion`
  (reveals render instantly visible, preloader/parallax/magnetic all no-op). Any
  new animation must be added to that media-query block too.
- Images should always get `loading="lazy" decoding="async"` (hero has none, but
  everything below the fold does).

When adding a new section, copy the pattern of an existing one (e.g. the
"Four Pillars" cards or the itinerary timeline items) rather than inventing a
new animation style.

## Image workflow

1. Save the new photo into `images/` with a descriptive name
   (`pfm-retreat-<subject>.jpg`) — compress/resize first if it's a large PNG
   (Pillow: resize to ~1000px wide, JPEG quality ~82, this repo doesn't have
   ImageMagick/ffmpeg installed, only Pillow via `pip install Pillow`).
2. Point the relevant `<img src="images/...">` at it in `pfm-retreat-2026.html`.
   Match by the `alt=` text when a `src=` value is reused in more than one
   place (several sections intentionally reuse the same photo).
3. Propagate to `netlify-deploy/` and the zip (see command above).
4. Re-embed into the Artifact copy (see below) — the Artifact never references
   `images/` by relative path, everything is a base64 `data:` URI.

## Artifact republish pipeline

The live Artifact URL for this site: **https://claude.ai/code/artifact/7b8966d6-ec6a-4c3e-92b6-db76900e68fc**
(title "PFM Retreat 2026"). To update it after editing `pfm-retreat-2026.html`:

1. Strip the document wrapper — the Artifact tool rejects `<!DOCTYPE>`, `<html>`,
   `<head>`, `<body>` tags. Turn `<body ...>` into `<div ...>` (same attributes,
   it's just acting as the page root) and drop everything from `<!DOCTYPE html>`
   through `<meta viewport>`, plus the trailing `</body></html>`.
2. Fix the `<title>` — the real site's `<title>` carries a long SEO tagline;
   the Artifact gallery wants a short name, so replace it with
   `<title>PFM Retreat 2026</title>` in the Artifact copy only (don't touch the
   real file's title).
3. Swap the lucide CDN — `unpkg.com` is not on the Artifact's script allowlist.
   Replace `https://unpkg.com/lucide@latest` with a pinned jsdelivr URL, e.g.
   `https://cdn.jsdelivr.net/npm/lucide@0.469.0/dist/umd/lucide.min.js` (verify
   the version resolves with `curl -sIL <url>` before relying on it — pin an
   exact version, never `@latest`, per Artifact CDN rules).
4. Embed every image as a base64 data URI — replace every
   `src="images/<file>.jpg"` with `src="data:image/jpeg;base64,<...>"` by
   base64-encoding the matching file in `images/`. A short Python/`re` pass over
   the file handles this in one go; see git history (commits touching this file)
   for the exact script used previously if you need a working reference.
5. Sanity-check before publishing: div-tag balance
   (`content.count('<div') == content.count('</div>')`), no remaining
   `images.unsplash.com` / `unpkg.com` / `images/` references, exactly one
   `<title>`.
6. Publish with the Artifact tool, passing `url:
   "https://claude.ai/code/artifact/7b8966d6-ec6a-4c3e-92b6-db76900e68fc"` so it
   updates in place rather than creating a new artifact. Read the artifact first
   if this is a fresh conversation that hasn't published it before this session.
7. Optional but recommended: render the updated HTML once with Playwright
   (`/opt/pw-browsers/chromium`) before publishing, to catch obvious breakage —
   see git history for the verification harness pattern (local-asset copy with
   CDN scripts fetched via `curl` into a scratch folder, since the sandboxed
   browser's own CDN fetches can be flaky).

## Git / PR conventions

- Branch: `claude/pfm-retreat-2026-site-lyavsa` (always develop here, never a
  new branch, unless the existing PR has already been merged).
- PR: #2 on `hisamsanip/project-status`, base `main`.
- Commit messages: imperative summary line, blank line, bullet detail if
  non-trivial, ending with the standard
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` +
  `Claude-Session:` footer (see recent commits in this repo for the exact
  format).
- Always `git push origin claude/pfm-retreat-2026-site-lyavsa` after committing
  — the PR auto-updates, no need to touch the PR itself unless asked.

## Don'ts

- Don't touch `index.html` (Kitty Homestay Muar) or `PFMSB_Project_Dashboard.html`
  — unrelated sites sharing this repo.
- Don't reintroduce `unpkg.com` or bare external image URLs into the Artifact
  copy — it'll either fail to publish or silently render blank/unstyled.
- Don't hand-roll a new animation pattern for a new section — extend the
  existing `.reveal` / `.reveal-scale` / `.hero-reveal` / `magnetic` system.
- Don't skip propagating a content edit to `netlify-deploy/` + the zip + the
  Artifact — all four copies are expected to match after any real change.
