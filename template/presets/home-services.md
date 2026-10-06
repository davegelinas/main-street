# Preset: Home services (plumber, electrician, HVAC, landscaping...)

Apply with: `npm run preset home-services`

Theme: `harbor` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| contactForm | **on** (quote requests are the business) |
| faq | on (pricing, service area, emergency calls, guarantees) |
| testimonials | on (trust is everything) |
| announcementBanner | on |
| gallery | off (turn on for visual trades: landscaping, remodeling, painting) |
| menu | off (or on as a "services & pricing" list for flat-rate trades) |
| booking | off (most take calls, not bookings) |
| blog | off |
| emailSignup | off |

## Content scaffold

- Homepage answers: what you do, where you go, how to reach you, why trust you. Phone number is the biggest element on mobile: a tap-to-call button, always visible.
- Service area: name the towns. "Serving Maplewood, South Orange, Millburn and surrounding areas" beats "serving the greater metro area." This is also local SEO gold.
- Emergency/after-hours policy stated plainly, with the price implication if there is one.

## Voice defaults

Direct, competent, reassuring. No jargon, no cute. "We answer the phone" is a differentiator; say it if it's true.

## Schema

LocalBusiness subtype: `HomeAndConstructionBusiness` (or `Electrician`, `Plumber`, `LandscapingBusiness` where they exist). Service area in the JSON-LD.

## Watch for

- The quote form is the money feature. Test it end-to-end after every change. A broken quote form is a broken business.
- Reviews: ask the owner about Google reviews early. For trades, reviews ARE the marketing.
