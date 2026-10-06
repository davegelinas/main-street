# Design rules

## Philosophy

This site should look like the business, not like a template. Warm, confident, uncluttered. A customer should feel the place before they read a word.

## The system

- **No CSS framework.** Hand-written CSS in `src/styles.css`. The whole site's styling should stay small enough that a curious owner can read it.
- **Tokens:** every color, font, and corner radius is a variable at the top of `src/styles.css`. Change the look by changing tokens, never by sprinkling new colors through the rules.
- **Themes:** `site.theme` in `site.config.json` picks a ready-made palette: `terracotta` (warm; food and craft), `harbor` (navy and clear blue with a sturdy sans; trades and offices), `sage` (green; florists, wellness, garden), `plum` (salons and spas). The preset sets it. "Make it navy and gold" means: start from the closest theme, then adjust its tokens. Keep text contrast at 4.5:1 and form borders at 3:1 (check the numbers, don't eyeball them). Accent-colored words use `--accent-text`, not `--accent`, so a brighter button color can't make links and labels unreadable.
- **Type:** a distinctive display face for headlines + system stack for body. Two faces max. Never more. Fraunces is self-hosted in `public/fonts/` (license file beside it) with its `@font-face` at the top of `src/styles.css`; no Google Fonts links. `harbor` uses the system sans and skips the font download (`SANS_THEMES` in `plugins/site-config.ts`: add any new sans theme there). A new face goes the same way: its .woff2 files and license in `public/fonts/`.
- **Color:** a tight palette. Paper background, ink text, one confident accent. Muted, earthy tones suit most local businesses. No purple-blue gradients, no neon, no glassmorphism. If it looks like a SaaS landing page, it's wrong.
- **Brand mark:** until the owner has a logo, the header shows their initial in a round badge (`{{monogram}}`). With a logo, replace the `brand-mark` span with `<img class="brand-logo" src="/images/logo.svg" alt="">` on every page, and make `public/favicon.svg` from it too.
- **Space:** generous whitespace. One idea per section. Let it breathe. Sections alternate paper and tint automatically; the reviews section is a dark band (`band-dark`).
- **Motion:** subtle or none. Always respect `prefers-reduced-motion`. Nothing should move for decoration alone.

## Rules

- **Mobile first.** Design at 390px, then scale up. Tap targets at least 44px. Phone number is always a tap-to-call link: use `{{phoneHref}}`, and `{{directionsUrl}}` for map links (both handle odd characters safely).
- **The first phone screen** must show what the business is, a main action, today's hours, and where it is. Don't push those below a photo.
- **Real HTML.** Semantic elements (`header`, `nav`, `main`, `section`, `footer`), real buttons and links, proper heading order. No div soup.
- **No stock look.** Avoid generic hero layouts (centered headline + two buttons + abstract shapes). Use the business's real photos, real voice, real details. Asymmetry and restraint beat symmetry and noise.
- **Images:** optimized (see `rules/content.md`), sized for their slot, never stretched. `loading="lazy"` below the fold.
- **No photo yet?** Turn `heroPhoto` and `gallery` off (`features/hero-photo.md`): the hero shows the business's initial as a seal and nothing looks missing. Never ship the "Your photo here" placeholders to a live site; `npm run audit` flags them.
- **Link previews** (`images/share.jpg`) are made at build time from the hero photo, or from the theme colors when there is none. Don't hand-edit `og:image`.
- **Performance budget:** first load under ~100KB total on the homepage. If a change blows past that, say so before shipping.
- **Dark mode:** not required. A local business site doesn't need it; skip it rather than doing it badly. Pages declare `color-scheme: only light` so phones that force-darken websites leave the owner's colors and photos alone.

## Changing the design

Small business sites die by a thousand "quick redesigns." Rules:

- Content changes (words, photos, hours) are always welcome and low-risk.
- Switching `site.theme` is a one-line change: still preview it on a phone first.
- Styling changes: do them on a preview branch, check phone + desktop, and get explicit approval. The owner approves with their eyes.
- Never redesign the whole site because a trend changed. This design is meant to age well.
