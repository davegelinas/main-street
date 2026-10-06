# The monthly checkup: the site taps you on the shoulder

Websites rot when nobody looks at them. The checkup is the antidote: once a
month (or whenever the owner asks), you review the whole site the way a good
shop manager walks the floor, looking for what's stale, what's missing, and
what's new in the business that the site doesn't say yet.

You are still in beginner mode (`rules/beginner-mode.md`): plain words, one
question at a time, every change ends with a link.

## How it starts

The owner says "run the monthly checkup", or you suggest it: "It's been about
a month. Want me to give the site a once-over?" On AI surfaces that support
reminders or scheduled messages, offer to nudge them monthly. On plain browser
chat, suggest it when it feels timely.

Never run a checkup uninvited and change things. The checkup proposes; the
owner disposes.

## What to review

Go through every item against the actual site files and `site.config.json`.
Say what you checked, even when the answer is "looks fine."

1. **Hours.** Any holiday or special hours with dates in the past? Any upcoming
   holidays in the next 60 days with no hours set? You cannot see their Google
   listing, so ask whether the site still matches their Google Business
   Profile.
2. **Placeholder copy.** Search the pages for leftover starter text (the audit
   script flags visible starter text and placeholder images: "Example
   service", "Your first real customer quote", "Your photo here"). Anything still generic gets rewritten or flagged.
3. **Photos.** Placeholder or stand-in images still in use? Photos the owner
   might want to refresh? Ask, don't assume.
4. **Reviews.** Any new Google, Yelp, or Facebook reviews worth featuring? Ask
   the owner to paste the good ones; add them only with permission.
5. **Contact info.** Phone, email, address, social links: still current? Open
   every outbound link (social profiles, booking URL, directions) and confirm
   it lands somewhere real.
6. **Seasonal.** What's coming in the next 60 to 90 days? Seasonal services,
   holiday closures, price changes, new offerings. Ask one question about it.
7. **Announcement and closures.** Is the announcement still about something
   current? Any closures coming up that aren't in `site.closedOn` yet
   (holidays especially)? Past `site.closedOn` entries no longer show; tidy
   them away in a change of their own (never riding along with another
   change, so an undo of that change can't bring them back).
8. **Analytics (if enabled).** You can't see Cloudflare's numbers yourself.
   Ask the owner for a screenshot of the project's **Metrics** page, then
   summarize in plain English: roughly how many visitors, which pages, one
   suggestion. No screenshot? Skip it in one line. Never estimate.
9. **Broken bits.** Walk the live site yourself: contact form, tap-to-call
   buttons, map links. If the contact form has its keys set, offer to send a
   test message; never send one unasked.
10. **Waiting changes.** List open pull requests. Anything older than 14 days:
    ask ship it, change it, or toss it, one at a time. Close the ones they
    toss.

## How to report

- Lead with the two or three things that matter most, in plain words, and
  ask one question. Offer the rest on request ("I checked eight other things
  and they look fine. Want the full list?"). No wall of text.
- End with a short numbered list of **proposed changes**, each one sentence.
- The owner approves items one by one, or says "do all of them." Every
  approved change goes through the normal loop: its own preview link, owner
  looks, "ship it."
- **Never change anything during a checkup on your own authority.** If
  something is actively broken or embarrassing (wrong phone number, a notice
  for an event that's over), prepare the fix first and tell the owner right
  away. It still needs their "ship it."

## After the checkup

Say when you'll suggest the next one ("I'll nudge you in about a month"). If
the owner wants it regularly and their AI supports reminders, set one up.
