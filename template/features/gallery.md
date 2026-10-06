# Photo gallery

A simple photo grid: real photos of the real business. **On by default.**

## How to turn it on/off

Flag: `gallery` in `site.config.json`. Photos live in `public/images/gallery/`.

## Adding photos

Where photos live: the owner's originals can sit in the shoebox (`content/brand/photos/`); photos shown on the site live in `public/images/` (gallery photos in `public/images/gallery/`).

0. **Faces? Ask before you commit, not before you ship.** The repo and every preview are public, so a pushed photo is published. Get the owner's okay for any photo showing customers or staff.
1. Put JPG or PNG files in `public/images/gallery/`. Descriptive filenames (`storefront-morning.jpg`).
2. Run `npm run optimize-images`. It strips hidden camera data and converts big photos to WebP. When it makes a `.webp`, point the `<img>` at the `.webp` and delete the original.
3. Add each photo to the gallery markup with real alt text ("Our team finishing a job on Elm Street"), replacing the placeholder `gallery-*.svg` entries.
4. Ship via preview so the owner can see the photos in place.

**Photo attached in chat?** Some cloud AIs can see an attached photo but can't save it as a file. If you can't, ask the owner to upload it on GitHub instead: their repository → `content/brand/photos` → **Add file** → **Upload files** → **Commit changes** (see `docs/browser-only.md`, the photos part). Then take it from there.

That's it. No CMS, no admin panel, no image service. Files in a folder.

## Rules

- **Real photos only.** The actual shop, the actual people, the actual product. One honest photo beats five stock shots (see `rules/core.md`).
- Keep it curated: 6 to 12 photos. A gallery of 40 is a storage unit, not a showcase.
- Every image gets alt text. Decorative-only images don't belong in a gallery.

## What can go wrong

- Giant files slowing the page: the optimize script catches this; run it after every addition.
- "The photos look wrong on my phone": check at 390px before approving. Grid layouts break there first.
