# Announcement banner and closure notices

A band at the top of the homepage with two kinds of short lines: **closure notices**, which come from `site.closedOn` and look after themselves, and **one announcement** (`site.announcement`) for other news. **On by default**; the band only shows when it has something to say.

## Closures: `site.closedOn`

Every closure gets its own line, written from the dates, soonest first:

- `"2026-11-04"` shows "Closed Wednesday, November 4."
- `{ "dates": "2026-12-24 to 2026-12-26", "note": "for the holidays" }` shows "Closed Thu, Dec 24 to Sat, Dec 26, for the holidays."

Each line appears 21 days before the closure starts and disappears after its last day, by the visitor's own date. On those days the page also says "Closed today", and Google gets them as special hours. No announcement needed, and nothing to take down: a closure that has ended drops off the site by itself, and later closures stay put.

Keep the note to a few words that finish the sentence ("for the holidays", "for the parade", "back Monday"). The build warns when one is long enough to wrap on a phone.

## The announcement: `site.announcement`

Flag: `announcementBanner` in `site.config.json`. The text is `site.announcement`. **Empty string = no announcement**, even with the flag on.

- New offerings, "we moved", special events, limited-time items. Closures go in `site.closedOn` instead.
- Keep it to one sentence. If it needs two, it belongs on a page, not in a banner.
- Put any end date in the words ("Pumpkin bread through October 31"), so a later session or the monthly checkup can see when it has passed and offer to take it down.

## Owner workflow

- "We're closed next Wednesday for the parade": add `{ "dates": "2026-11-04", "note": "for the parade" }` to `site.closedOn` and ship via preview. Several closures are fine: each is its own line.
- "Take the closure down" or "we're open after all": remove that one entry from `site.closedOn`. Leave the others.
- "Put up a banner: now booking spring cleanups": set `site.announcement`.

## Customization

- Style lives with the site CSS (`.notices` and `.announcement`). Keep it noticeable but calm: it should read as information, not an alarm.
- No scheduling machinery beyond the closure dates: boring is reliable.
