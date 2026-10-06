# Updates are easy: a day in the life

Meet **Acme Plumbing**, a fictional plumbing business. Below are five completely ordinary updates, written exactly as they'd happen. In every case the owner types **one message** into their chat AI, opens the **preview link** the AI sends back, glances at their phone, and says two words: **"ship it."**

---

## What a finished site looks like

This is Cedar and Pine Barbershop, the fictional demo site Main Street was built and tested with. Real screenshots of the live site, not mockups.

![Homepage of the Cedar and Pine Barbershop demo site](assets/demo-hero.png)
*The homepage: the owner's own words, one clear button. Every site starts from the same template and ends up sounding like its business.*

![Services and prices on the demo site](assets/demo-services.png)
*The price list. The owner updates it by sending one message, like example 2 below.*

![Contact section and footer on the demo site](assets/demo-visit.png)
*The contact section and footer. The email service isn't connected on this demo, so visitors see the email address instead of a form. Nothing breaks; the page just degrades gracefully.*

## For helpers: what the terminal setup looks like

Owners don't need this: their AI does setup with them in chat ([setup-guide.md](setup-guide.md)). A helper who prefers a terminal can do the same first steps by hand. Below is the real output from a real run, for a fictional bakery. Paths are from the computer where it was recorded.

**1. Create the site folder.**

```
$ node scripts/new-site.mjs ../birch-bakehouse

Done! Your new site is ready at /tmp/birch-bakehouse
  88 files copied and verified.
  Git repository initialized with everything staged.

Next steps (each takes a few minutes):
  1. cd ../birch-bakehouse
  2. npm install        (downloads the build tools, one time only)
  3. npm run setup      (the friendly wizard: your business details)
  4. npm run dev        (see your site at http://localhost:5173)

When it looks right, follow docs/setup-guide.md inside your new site
("For helpers who prefer a terminal"), in the owner's own accounts.

The golden rule: every change gets its own preview link first,
you look at it on your phone, and only then say "ship it".
```

**2. Install the build tools (one time) and answer the wizard.**

```
$ npm install
added 26 packages in 9s

$ npm run setup

Welcome to Main Street! Let us set up your website.
Press Enter to accept the answer in [brackets].

Step 1 of 3: your business
  Business name [Your Business Name]: Birch Bakehouse
  Tagline (one short sentence) [What you do, in one short sentence]: Fresh bread every morning
  Phone number [(555) 000-0000]: (555) 234-5678
  Contact email [hello@example.com]: hello@birchbakehouse.com
  Year founded (optional, Enter to skip): 2019

Step 2 of 3: your address and domain
  Street address [123 Main Street]: 14 Maple Ave
  City [Your City]: Riverton
  State (2 letters) [ST]: NJ
  ZIP code [00000]: 08077
  Domain name, like acmeplumbing.com (no domain yet? press Enter: your site starts on a free Cloudflare address and your AI helps you add a domain later for about $12/year):
  (No domain yet. That's fine: the site works on its free address until you add one.)

Step 3 of 3: pick a starting preset (turns the right features on for your kind of business)
  1. bakery: bakeries, cafes, food shops (menu, photo gallery, reviews)
  ...
  7. Skip (keep current features)
  Choice [7]: 1
Preset "bakery" applied (1 feature flag changed).

Done! site.config.json is updated.
```

**3. Build the site.**

```
$ npm run build

vite v8.3.1 building client environment for production...
transforming...
✓ 8 modules transformed.
rendering chunks...
computing gzip size...
dist/404.html                      1.46 kB │ gzip: 0.71 kB
dist/terms-of-service/index.html   2.61 kB │ gzip: 1.20 kB
dist/privacy-policy/index.html     2.76 kB │ gzip: 1.25 kB
dist/index.html                   13.56 kB │ gzip: 3.73 kB
dist/assets/styles-o4YevkHr.css    8.04 kB │ gzip: 2.41 kB
dist/assets/main-IwUQfXyz.js       1.92 kB │ gzip: 0.97 kB
✓ built in 241ms
```

**4. Audit it.** This is the real check, run here against the live demo barbershop:

```
$ npm run audit https://main-street-dogfood-barbershop.pages.dev

  PASS  homepage returns 200
  PASS  /privacy-policy/ returns 200
  PASS  /terms-of-service/ returns 200
  PASS  missing page returns 404
  PASS  http redirects to https
  PASS  free address sends X-Robots-Tag noindex
  PASS  homepage has JSON-LD structured data
  PASS  homepage has og:title

8/8 checks passed.
```

That's the terminal part, on paper. Owners never see it: their AI does the equivalent in chat, and the whole setup (GitHub, Cloudflare, your first change) takes about an hour. [The setup guide](setup-guide.md) walks through it click by click, and the domain comes later, whenever you're ready.

---

## 60-second updates: cheat sheet

Copy any of these into your chat AI as-is (swap in your own details):

```
Change my Saturday hours to 9am to 2pm.
```

```
Add drain cleaning for $129 to my services list.
```

```
Put up a banner: Now booking spring cleanups, call for a free estimate.
```

```
Swap the homepage photo for the one I'm attaching. Put it first.
```

```
Add a Reviews page with the three testimonials I pasted below.
```

That's the whole skill. Everything below is just those one-liners, slowed down so you can see what happens.

---

## 1. Changing holiday hours (closed Christmas week)

**You send your AI:**

```
We're closed December 24 through January 1. Update the site.
```

**What your AI does behind the scenes:** it updates your hours in the site's settings, prepares the change as its own preview copy, and sends you the preview link. (2–3 minutes.)

**What you see:** you open the preview link on your phone. The hours section now says "Closed December 24 to January 1." It looks right.

**You reply:** "ship it."

**What "ship it" does:** your AI publishes that one change (it merges the pull request), and the live site updates about a minute later. Done, no phone tag, no waiting on anyone.

---

## 2. Adding a new service with a price

**You send your AI:**

```
Add drain cleaning for $129 to my services list. One-line description:
fast, mess-free drain clearing for sinks, tubs, and showers.
```

**What your AI does behind the scenes:** it adds the new service to your price list on its own preview copy and sends you the preview link. It will never invent a price. The $129 came from you, and it stays exactly as you wrote it.

**What you see:** the preview site's services section has a new row: "Drain cleaning: $129. Fast, mess-free drain clearing for sinks, tubs, and showers."

**You reply:** "ship it."

**What "ship it" does:** the live price list updates. Your next customer sees the new service.

---

## 3. Posting an announcement banner

**You send your AI:**

```
Put up a banner at the top of the site: Now booking spring cleanups,
call for a free estimate.
```

**What your AI does behind the scenes:** it turns on the announcement banner with your exact words and prepares it on its own preview copy, and sends you the preview link.

**What you see:** the preview site has a banner across the top with your message, word for word.

**You reply:** "ship it."

**What "ship it" does:** the banner goes live. When spring is over, you say "take the banner down", same loop, same two words.

---

## 4. Swapping the homepage photo

**You send your AI** (with the photo attached):

```
Use this photo on the homepage instead of the current one.
```

**What your AI does behind the scenes:** it swaps in your photo, resizes it so the site stays fast, and prepares it on its own preview copy. (It also strips hidden location data from the photo, since your site's files are public.) It sends you the preview link.

**What you see:** the preview site's homepage shows your new photo. If it looks wrong (cropped oddly, too dark), you just say so, and your AI fixes it before anything goes live.

**You reply:** "ship it."

**What "ship it" does:** the live homepage updates with your photo.

---

## 5. Adding a brand-new page (a "Reviews" page)

**You send your AI:**

```
Add a Reviews page with these three testimonials:
1. "Fixed our burst pipe at 9pm on a Sunday. Lifesavers." (Maria T.)
2. "Fair price, showed up on time, cleaned up after." (James W.)
3. "Third time using them. Wouldn't call anyone else." (Denise K.)
```

**What your AI does behind the scenes:** it creates the new page, adds it to the site's menu and sitemap, and prepares everything on its own preview copy, then sends you the preview link. (This one takes a few minutes longer; it's a whole page, not a tweak.)

**What you see:** the preview site has a "Reviews" link in the menu, and the page shows your three quotes exactly as you wrote them.

**You reply:** "ship it."

**What "ship it" does:** the new page goes live, and Google picks it up over the next few days.

---

## The pattern

Notice what you never did in any of these: you never opened a dashboard, never touched code, never waited for a developer, and never risked the live site. Every change sat on the preview copy until you approved it with your eyes.

The golden loop, every time:

1. **You say what you want**, in plain words.
2. **Your AI prepares it** as its own preview copy and sends you the preview link.
3. **You look at it on your phone.**
4. **You say "ship it"**, or ask for changes first. Changed your mind later? Say "undo that."

That's the entire job. If you can send a text message, you can run your website.
