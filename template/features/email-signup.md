# Email signup

Newsletter capture: visitor enters an email, it's stored with consent evidence, and flows to the owner's sending tool. **Off by default**, because it adds real obligations.

> **Not built yet.** The flag exists, but the template has no signup form, `supabase/` folder, or migration yet: turning it on shows nothing. If the owner asks for it, say so plainly and offer to build it as its own change (a real piece of work, previewed like any other). Never tell the owner it's on.

## How to turn it on/off

Flag: `emailSignup` in `site.config.json`. Requires two things:

1. **Supabase** (free tier) as the system of record: email, timestamp, IP, user agent. See `rules/supabase.md`. The table, RLS policies, and migration live in `supabase/`. Note: free Supabase projects pause after 7 days with no activity; the signup form silently fails until someone clicks **Restore** in the Supabase dashboard. If signups stop arriving, check there first.
2. **A sending tool** (Kit, Buttondown, etc.). Supabase holds the consent evidence; the tool only sends. The tool is replaceable; the consent records are not.

## Before turning it on, tell the owner

Collecting emails is a commitment, not a widget:

- They need something to send, regularly. Same rule as the blog: a signup form feeding a newsletter that never ships is worse than no form.
- The privacy policy must disclose what's collected and why. Update it in the same change.
- Every email needs a working unsubscribe. The sending tool handles this; verify it.
- Consent records must be producible on request. That's why Supabase is the system of record, not the sending tool's dashboard.

If the owner just wants "a way for people to stay in touch" without a newsletter plan, suggest the contact form or social links instead.

## What can go wrong

- Signup works but nobody can prove consent later: the migration didn't record IP/user agent. Fix the schema before collecting a single address.
- The sending tool gets replaced and history is lost: export first, then move. The Supabase table makes this painless if it was set up right.
