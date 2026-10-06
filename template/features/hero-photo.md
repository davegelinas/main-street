# Hero photo

The big photo at the top of the homepage, next to the headline. **Off in the template until the owner has a real photo.**

## How to turn it on/off

Flag: `heroPhoto` in `site.config.json`. Off, the hero shows the business's initial as a seal on wide screens (phones show just the words and buttons). Nothing looks missing, so off is the right state until a real photo exists.

## Turning it on

1. Pick the owner's best landscape photo (storefront, the team at work, the product). Copy it into `public/images/` and run `npm run optimize-images`.
2. In `index.html`, point the hero `<img>` at it, write real alt text, and replace the caption (or delete the `<figcaption>`).
3. Set `heroPhoto` to `true` and ship via preview.

The link-preview picture (`images/share.jpg`, what iMessage or Facebook show when someone shares the site) is made from this photo at build time. With no photo it's a plain picture in the theme's colors. Nothing to update by hand.

## What can go wrong

- The placeholder picture ("Your photo here") going live: never turn `heroPhoto` on without a real photo. `npm run audit` flags it.
- A tall portrait photo: the hero crops to 4:3. Check the preview on a phone; pick a different photo if heads get cut off.
