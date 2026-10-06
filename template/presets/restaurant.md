# Preset: Restaurant / Cafe

Apply with: `npm run preset restaurant`

Theme: `terracotta` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| menu | **on** (the menu is the site) |
| gallery | on (food, room, people) |
| faq | on (parking, reservations, dietary, hours) |
| contactForm | on |
| announcementBanner | on |
| testimonials | on |
| booking | on if they take reservations (set `integrations.bookingUrl`) |
| blog | off |
| emailSignup | off |

## Content scaffold

- Homepage leads with hours, location, and the menu. A hungry visitor on a phone decides in 10 seconds: what food, what price, where, when.
- Menu page: categories, items, prices, dietary labels. Confirm every price and label with the owner.
- Private events / catering gets a section if they do it, pointing at the contact form.

## Voice defaults

Warm, specific, hungry-making. Name dishes, name ingredients, name the farmer if there is one. Never "a culinary journey."

## Schema

LocalBusiness subtype: `Restaurant` (or `CafeOrCoffeeShop`, `Bakery`). Include `servesCuisine`, `priceRange`, and opening hours in the JSON-LD.

## Watch for

- Menu drift (printed menu vs site). Ask whenever prices come up.
- Holiday hours: restaurants live and die by them. Put every closure in `site.closedOn`; the site announces it three weeks ahead and takes it down by itself.
