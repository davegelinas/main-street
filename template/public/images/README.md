# Site photos go here

The starter images (`hero.svg`, `gallery-1.svg`, …) are placeholders. Replace them with real photos of your business as JPG, PNG, or WebP files. Just keep the same filenames, or update the `src` paths in `index.html` to match.

Guidelines that keep the site fast:

- Aim for under 400 KB per file and no wider than 1600 px. Phone photos are usually fine after a quick export at 80% quality.
- Name files descriptively: `hero.jpg`, `gallery-team.jpg`, not `IMG_4829.jpg`.
- Every photo shown on the site needs descriptive `alt` text in the HTML (it is how screen readers and Google "see" the image).

Then run `npm run optimize-images`. If the `sharp` package is available it will convert everything to WebP and resize oversized files automatically. If not, the script prints a plain-English report of what needs shrinking, and you can ask your AI assistant to handle it.

Phone photos can carry hidden GPS location data, and your site's files are public. `npm run optimize-images` strips it, and an automatic check on every change catches anything that slips through.
