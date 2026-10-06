# Announcement banner

A one-sentence banner at the top of the homepage. The owner's megaphone. **On by default** (it only shows when `site.announcement` has text).

## How to turn it on/off

Flag: `announcementBanner` in `site.config.json`. The text is `site.announcement`. **Empty string = no banner**, even with the flag on. The build strips the block when the flag is off or the text is empty.

## Typical uses

- Holiday closures: "Closed Thanksgiving week. See you Monday, Nov 30."
- Special hours, new offerings, "we moved", limited-time items.
- Keep it to one sentence. If it needs two, it belongs on a page, not in a banner.

## Owner workflow

The owner says "put up a banner: closed next week." The assistant writes the dates into the words ("Closed Nov 24 to 28, back Monday Dec 1"), updates `site.announcement`, and ships via preview. Stale banners are the #1 way a site looks abandoned: because the date is in the words, any later session (and the monthly checkup) can see when it has passed and offer to take it down.

## Customization

- Style lives with the site CSS. Keep it noticeable but calm: it should read as information, not an alarm.
- For scheduled banners (sale dates, events), just set the text when the time comes. No scheduling machinery: boring is reliable.
