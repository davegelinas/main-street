# Preset: Retail (flower shops, boutiques, gift shops...)

Apply with: `npm run preset retail`

Theme: `sage` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| gallery | **on** (your products are visual: arrangements, displays, the shop) |
| testimonials | on (trust is everything for local shops) |
| contactForm | on (custom orders, questions) |
| announcementBanner | on (seasonal hours, holiday ordering deadlines) |
| faq | on (delivery area, same-day cutoff, freshness guarantee) |
| analytics | on |
| menu | off (or on as an "occasions & pricing" list for standard arrangements) |
| booking | off (most retail takes walk-ins and calls, not bookings) |
| blog | off |
| emailSignup | off (turn on for a newsletter or holiday reminders list) |

## Content scaffold

- Keep the homepage visual: a strong hero photo of your best work, then the gallery. Prices go on a simple list (use the menu feature) or "call for today's selection", both are honest; pick whichever the owner can keep up to date.
- Flower shops live and die by seasons (Valentine's, Mother's Day, weddings). The announcement banner is the fastest way to post a holiday ordering deadline.

## Voice defaults

Warm, specific, sensory. Name the flowers, not just the colors. "Peonies, garden roses, and ranunculus" beats "beautiful blooms."

## Schema

LocalBusiness subtype: `Store` (or `Florist` where it exists). A delivery area isn't generated into the structured data yet: put it in plain words on the page and in the FAQ. If they have Instagram, fill in `business.social.instagram` so it shows in the footer.

## Watch for

- Never invent arrangement names or prices. Ask the owner what's actually in the cooler this week.
- Photos beat words here. After any photo swap, run `npm run optimize-images`.
