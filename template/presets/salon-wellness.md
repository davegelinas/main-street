# Preset: Salon / Wellness (salon, spa, barbershop, studio...)

Apply with: `npm run preset salon-wellness`

Theme: `plum` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| gallery | **on** (the work is visual: hair, nails, space) |
| menu | on (services & pricing) |
| faq | on (booking policy, cancellations, what to expect) |
| booking | on (set `integrations.bookingUrl`: Vagaro, Square, Booksy...) |
| testimonials | on |
| announcementBanner | on |
| contactForm | on |
| blog | off |
| emailSignup | off |

## Content scaffold

- Booking is the primary action: a "Book now" button in the header, the hero, and after the service list. Every booking button points at the real booking tool (see `features/booking.md`).
- Services & pricing with durations. Cancellation policy stated kindly and clearly.
- Team section if the business wants it: real names, real photos, specialties. Staff turnover means this section needs a maintenance habit.

## Voice defaults

Welcoming, calm, confident. Describe the experience, not just the service. Avoid luxury cliches ("indulge", "pamper yourself") unless that's genuinely their voice.

## Schema

LocalBusiness subtype: `HairSalon`, `BeautySalon`, `DaySpa`, or `HealthAndBeautyBusiness`.

## Watch for

- Booking tool changes: update `integrations.bookingUrl` the same day, check every button.
- Photo consent: staff and client photos need explicit permission. This matters more here than anywhere.
