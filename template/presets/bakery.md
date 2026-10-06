# Preset: Bakery (bakeries, cafes, donut shops...)

Apply with: `npm run preset bakery`

Theme: `terracotta` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| menu | **on** (the menu is the site, keep prices current) |
| gallery | on (fresh cases, cakes, the shop) |
| testimonials | on (regulars are your marketing) |
| faq | on (custom cake lead times, allergens, pickup vs delivery) |
| contactForm | on (custom orders, wholesale inquiries) |
| announcementBanner | on (holiday pre-orders, sold-out days) |
| analytics | on |
| booking | off (most bakeries take orders, not bookings) |
| blog | off |
| emailSignup | off (turn on for a weekly menu email) |

## Content scaffold

- The menu page answers: what's available today, what needs pre-ordering, and how far ahead. Lead times ("custom cakes need 72 hours") prevent more disappointment than any design choice.
- Allergen information stated plainly. It's a trust and safety issue, not marketing copy.

## Voice defaults

Warm, appetizing, specific. "Butter croissants, baked at 5am" beats "fresh pastries daily."

## Schema

LocalBusiness subtype: `Bakery`. Opening hours and menu URL in the JSON-LD.

## Watch for

- Never invent menu items or prices. Ask the owner what's actually in the case.
- Holiday pre-order deadlines go on the announcement banner, not buried in a paragraph.
