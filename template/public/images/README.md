# Site photos go here

The starter images (`hero.svg`, `gallery-1.svg`, ...) are placeholders. To use real photos, put JPG or PNG files here (gallery photos in `gallery/`) and point the `<img>` tags in `index.html` at them. Then turn on the matching feature (`heroPhoto`, `gallery`) in `site.config.json`.

- Name files descriptively: `storefront-morning.jpg`, not `IMG_4829.jpg`.
- Every photo shown on the site needs real `alt` text (it is how screen readers and Google "see" the image).
- Run `npm run optimize-images` after adding any photo. It strips hidden camera data (including GPS location), and turns photos over 200 KB or wider than 1200 px into WebP. When it makes a `.webp`, point the `<img>` at it and delete the original.

Your site's files are public. An automatic check also strips camera data on every change, but the original you upload stays in the site's history, so turn location off on your phone before uploading.
