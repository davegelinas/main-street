# Preset: Professional services (lawyer, accountant, consultant, realtor...)

Apply with: `npm run preset professional`

Theme: `harbor` (colors and heading font; see `rules/design.md`).

## Feature bundle

| Feature | State |
|---|---|
| faq | **on** (process, pricing, what to expect, credentials) |
| testimonials | on (with permission; some professions restrict these) |
| contactForm | on |
| announcementBanner | on |
| gallery | off |
| menu | off |
| booking | off (or on for consultation scheduling) |
| blog | off (consider: a short insights section builds authority, but only if they'll write) |
| emailSignup | off |

## Content scaffold

- Homepage answers: what problems you solve, for whom, and what working together looks like. Credentials stated plainly, no puffery.
- Process page or section: step 1, 2, 3. Clients hire clarity.
- About: the person's actual background, in their actual voice. This is a trust business; the photo should be real and recent.

## Voice defaults

Clear, authoritative, human. Explain like you'd explain to a smart friend outside the field. No industry jargon without translation.

## Compliance note

Some professions (law, finance, health-adjacent) have advertising rules: what you may claim, whether testimonials are allowed, required disclaimers. **Ask the owner about their profession's rules before writing a word of marketing copy**, and note the answers in the repo. When in doubt, underclaim.

## Schema

LocalBusiness subtype: `ProfessionalService` (or `LegalService`, `AccountingService`, `RealEstateAgent` where they exist).
