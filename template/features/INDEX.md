# Feature catalog

Features are switches in `site.config.json` under `"features"`, plus the HTML blocks they control (`<!-- feature:name --> ... <!-- /feature:name -->`). Turning a feature on is a one-line config change plus any content the feature needs. The owner never has to do this themselves: they say "turn on the gallery" to their AI assistant and it handles the rest.

**Defaults:** contactForm, announcementBanner, faq, gallery, menu, testimonials, and analytics are on in the template. heroPhoto, blog, booking, and emailSignup are off (heroPhoto waits for a real photo). (`analytics` only controls the privacy policy's mention of visitor stats; the stats themselves are one click in Cloudflare, see `rules/analytics.md`.)

| Feature | Flag | Doc | What it adds |
|---|---|---|---|
| Contact form | `contactForm` | [contact-form.md](contact-form.md) | Contact section + Pages Function that emails via Resend |
| Announcement banner | `announcementBanner` | [announcement-banner.md](announcement-banner.md) | One-sentence banner for news and specials (closures go in `site.closedOn`) |
| Hero photo | `heroPhoto` | [hero-photo.md](hero-photo.md) | The big photo at the top of the homepage (off: the initial as a seal) |
| Photo gallery | `gallery` | [gallery.md](gallery.md) | Photo grid, lazy-loaded, optimized |
| Testimonials | `testimonials` | [testimonials.md](testimonials.md) | Customer quotes section |
| Menu / price list | `menu` | [menu.md](menu.md) | Structured list of items and prices |
| FAQ | `faq` | [faq.md](faq.md) | Expandable questions (also feeds SEO) |
| Blog | `blog` | [blog.md](blog.md) | Simple dated posts, no CMS (**not built yet**) |
| Booking link | `booking` | [booking.md](booking.md) | "Book now" buttons pointing at your booking tool |
| Email signup | `emailSignup` | [email-signup.md](email-signup.md) | Newsletter capture, needs Supabase + a sender (**not built yet**) |

## How toggling works

1. Flip the flag in `site.config.json` (`true`/`false`), or run `npm run preset <name>` for a bundle.
2. Add the content the feature needs (photos in `public/images/`, quotes from the owner, menu items).
3. `npm run build` strips disabled features' HTML entirely: off means zero bytes shipped, not hidden with CSS.
4. Ship via the normal flow (`rules/deploy.md`): its own branch and preview link → owner says "ship it" → merge.

## Adding a new feature

1. Wrap its HTML in `<!-- feature:yourname --> ... <!-- /feature:yourname -->`.
2. Add the flag to `site.config.json` and `site.schema.json`.
3. Write `features/yourname.md` following the format below.
4. Add a row to the table above.

Feature docs answer: what it is, how to turn it on, what the owner must provide, what it costs (usually $0), how to customize it, and what can go wrong.
