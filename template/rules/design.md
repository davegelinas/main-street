# Design rules

## Philosophy

This site should look like the business, not like a template. Warm, confident, uncluttered. A customer should feel the place before they read a word.

## The system

- **No CSS framework.** Hand-written CSS in `src/styles.css`. The whole site's styling should stay small enough that a curious owner can read it.
- **Tokens:** every color, font, and corner radius is a variable at the top of `src/styles.css`. Change the look by changing tokens, never by sprinkling new colors through the rules.
- **Contrast:** keep text at 4.5:1 and form borders at 3:1. Check the numbers, don't eyeball them. Accent-colored words use `--accent-text`, not `--accent`, so a brighter button color can't make links and labels unreadable.
- **Type:** a distinctive display face for headlines + system stack for body. Two faces max. Never more. Fraunces is self-hosted in `public/fonts/` (license file beside it) with its `@font-face` at the top of `src/styles.css`; no Google Fonts links. `harbor` uses the system sans and skips the font download (`SANS_THEMES` in `plugins/site-config.ts`: add any new sans theme there). A new face goes the same way: its .woff2 files and license in `public/fonts/`.
- **Color:** a tight palette. Paper background, ink text, one confident accent. Muted, earthy tones suit most local businesses. No purple-blue gradients, no neon, no glassmorphism. If it looks like a SaaS landing page, it's wrong.
- **Space:** generous whitespace. One idea per section. Let it breathe. Sections alternate paper and tint automatically; the reviews section is a dark band (`band-dark`).
- **Motion:** subtle or none. Always respect `prefers-reduced-motion`. Nothing should move for decoration alone.

## Rules

- **Mobile first.** Design at 390px, then scale up. Tap targets at least 44px. Phone number is always a tap-to-call link: use `{{phoneHref}}`, and `{{directionsUrl}}` for map links (both handle odd characters safely).
- **The first phone screen** must show what the business is, a main action, today's hours, and where it is. Don't push those below a photo.
- **Real HTML.** Semantic elements (`header`, `nav`, `main`, `section`, `footer`), real buttons and links, proper heading order. No div soup.
- **No stock look.** Avoid generic hero layouts (centered headline + two buttons + abstract shapes). Use the business's real photos, real voice, real details. Asymmetry and restraint beat symmetry and noise.
- **Images:** optimized (see `rules/content.md`), sized for their slot, never stretched. `loading="lazy"` below the fold.
- **No placeholders live.** Never ship the "Your photo here" pictures; `npm run audit` flags them. No photo yet means `heroPhoto` off (below).
- **Performance budget:** the homepage's first load stays under about 100 KB before photos (the heading font is most of it), plus the hero photo: aim for under 200 KB. `npm run optimize-images` usually gets a landscape phone photo there (1200 px wide, WebP). If a change blows past that, say so before shipping.
- **Dark mode:** not required. A local business site doesn't need it; skip it rather than doing it badly. Pages declare `color-scheme: only light` so phones that force-darken websites leave the owner's colors and photos alone.

## Brand pieces

Most of the brand comes from `site.config.json` and is built for you. Change the config, not the output.

- **Theme.** `site.theme` picks a palette and heading style: `terracotta` (warm; food and craft), `harbor` (navy and clear blue, sturdy sans; trades and offices), `sage` (green; florists, wellness, garden), `plum` (salons and spas). The preset sets it; the owner can switch any time. "Make it navy and gold" means: start from the closest theme, then adjust its tokens in `src/styles.css`.
- **Monogram.** The first letter or digit of `business.name`, skipping a leading "The" (`{{monogram}}`). It's the round badge in the header and footer, the seal in the hero, and the site icons. Until there is a logo, it is the logo.
- **Hero photo.** `features.heroPhoto`. On: the owner's best real photo. Off: the monogram as a seal on wide screens; phones show words and buttons. Off is right until a real photo exists (`features/hero-photo.md`).
- **Notices.** Closures (`site.closedOn`) and the announcement share one band at the top of the homepage: one short line each, closures first, soonest first. The build writes the closure lines from the dates and they come and go on their own (`features/announcement-banner.md`). Never squeeze several closures into the announcement.
- **Link previews.** The build makes `images/share.jpg` (1200 x 630) from the hero photo, or a calm landscape in the theme colors when there is none. `og:image` already points at it. Don't hand-edit it.
- **Site icons.** The build makes `favicon.svg` (browser tab) and `apple-touch-icon.png` (Add to Home Screen) from the monogram in the theme's accent color, plus `favicon-32.png` from whichever `favicon.svg` ships (older Safari can't show SVG tab icons). It only does this while `public/favicon.svg` is the stock icon (it contains `main-street:stock-icon`). Replace that file and the build keeps yours.

### Swapping in a real logo

1. Copy the logo into `public/images/` (SVG is best; a PNG at least 400 px tall, then `npm run optimize-images`). The original stays in `content/brand/logo/`.
2. Header, on every page (`index.html`, `404.html`, `privacy-policy/`, `terms-of-service/`): replace `<span class="brand-mark" aria-hidden="true">{{monogram}}</span>` with `<img class="brand-logo" src="/images/logo.svg" alt="">`. If the logo already spells the name, delete the `brand-name` span too and set `alt="{{business.name}}"`.
3. Footer: it's a dark band, so use a light version of the logo there, or keep the monogram.
4. Hero seal (only shows while `heroPhoto` is off): replace the `hero-seal-mark` span with `<img class="hero-seal-logo" src="/images/logo.svg" alt="">`.
5. Icons: replace `public/favicon.svg` with a simple square version of the logo, and `public/apple-touch-icon.png` with a 180 x 180 PNG with no transparent corners. The build then leaves both alone.
6. Preview on a phone. Logos often need a size tweak (`.brand-logo { height: ... }`).

## Changing the design

Small business sites die by a thousand "quick redesigns." Rules:

- Content changes (words, photos, hours) are always welcome and low-risk.
- Switching `site.theme` is a one-line change: still preview it on a phone first.
- Styling changes: do them on a preview branch, check phone + desktop, and get explicit approval. The owner approves with their eyes.
- Never redesign the whole site because a trend changed. This design is meant to age well.
