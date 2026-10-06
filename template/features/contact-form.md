# Contact form

A contact section with a working form. Submissions are emailed to the owner through Cloudflare Email Routing (free, no key). **Off until Email Routing is set up** on the owner's domain: setup's first version turns it off (`SETUP.md` step 2), and it comes back on in its own change once email works.

## How to turn it on/off

Flag: `contactForm` in `site.config.json`. The form posts to `/api/contact`, handled by `src/worker.ts`.

## What the owner needs to do

After their own domain is connected: turn on Email Routing and verify their inbox there, and make sure `CONTACT_TO_EMAIL` (a Cloudflare secret the Deploy button asked for) is that same inbox. Step-by-step in `docs/api-keys.md`; the rules are in `rules/email.md`.

While it's off, the contact section still shows the business phone and email (tap-to-call and tap-to-email). If the form is on before email works, anyone who submits sees "Email is not set up yet. Please email us directly." Nothing breaks, but it's a dead end, so keep it off until then. Preview links never have email settings (on purpose), so they always show this note: test real delivery on the live site after shipping.

## How it works

- Frontend validates (name, valid email, message), includes a honeypot field and a submission timer.
- `src/worker.ts` checks the fields, rejects bots (honeypot filled, sent in under 3 seconds by the browser's own clock), then sends with the `send_email` binding: from `noreply@<site domain>` (or `CONTACT_FROM_EMAIL`), to `CONTACT_TO_EMAIL`, `Reply-To` set to the visitor.
- `GET /api/contact` answers `{"ready": true|false}`, so the audit can tell whether the form is ready to try (its settings are in place) without sending anything. Ready isn't proof: only a test message proves Email Routing delivers.
- On success the visitor sees a plain-words confirmation. On failure they see the direct email address. Never a stack trace.

## Costs and limits

Sending to the owner's verified inbox is free on every Cloudflare plan and counts toward no quota. If spam becomes a real problem, add Cloudflare Turnstile (free); see `rules/email.md`. Don't add it preemptively.

## Customization

- Change the recipient: messages go to `CONTACT_TO_EMAIL`, set in Cloudflare. To send them elsewhere, the owner changes that secret (the site → **Settings** → **Variables and Secrets**; saving deploys it) and verifies the new inbox in Email Routing. No code change.
- Extra fields (party size, date): add them to the form (`index.html`, `src/main.ts`) and `src/worker.ts` together, check with `npm run serve` (the email prints in the terminal), and test end-to-end on the live site.

## What can go wrong

- "Nobody's getting the emails": check the inbox is **Verified** in Email Routing and matches `CONTACT_TO_EMAIL` exactly, then the site's logs (the site → **Observability**, "Email Routing refused").
- Form works with `npm run serve` but not live: the local run only simulates sending. See `rules/traps.md`.
