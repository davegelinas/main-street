# Contact form

A contact section with a working form. Submissions are emailed to the owner through Cloudflare Email Routing (free, no key). **On by default.**

## How to turn it on/off

Flag: `contactForm` in `site.config.json`. The form posts to `/api/contact`, handled by `src/worker.ts`.

## What the owner needs to do

After their own domain is connected: turn on Email Routing, verify their inbox as a destination, and make sure `CONTACT_TO_EMAIL` (a Cloudflare secret, asked for by the Deploy button) is that same inbox. Step by step in `docs/api-keys.md`; the rules are in `rules/email.md`.

Until then, the section always shows the business phone and email next to the form, and anyone who submits sees "Email is not set up yet. Please email us directly." Nothing breaks. Preview links never have email (on purpose), so they always show this note: test real delivery on the live site after shipping.

## How it works

- Frontend (`src/main.ts`) validates (name, valid email, message), includes a honeypot field and a submission timer.
- `src/worker.ts` rejects bots (honeypot filled, submitted in under 3 seconds), then sends with the `send_email` binding: from `noreply@<site domain>` (or `CONTACT_FROM_EMAIL`), to `CONTACT_TO_EMAIL`, `Reply-To` set to the visitor.
- On success the visitor sees a plain-words confirmation. On failure they see the direct email address. Never a stack trace.
- `GET /api/contact` returns `{"ready": true|false}` so the audit can tell whether email is configured without sending anything.

## Costs and limits

Sending to the owner's verified addresses is free on every Cloudflare plan and doesn't count toward any sending quota. If spam becomes a real problem, add Cloudflare Turnstile (free); see `rules/email.md`. Don't add it preemptively.

## Customization

- Change the recipient: the owner edits `CONTACT_TO_EMAIL` in Cloudflare (**Settings** → **Variables and Secrets**) and verifies the new inbox in Email Routing. No code change.
- Extra fields (party size, date): add them to the form (`index.html`, `src/main.ts`) and to `src/worker.ts` together, check with `npm run serve` (the simulated email prints in the terminal), and test end to end on the live site after shipping.

## What can go wrong

- "Nobody's getting the emails": check the inbox is **Verified** in Email Routing and matches `CONTACT_TO_EMAIL` exactly, then the Worker's logs (Cloudflare → the site → **Observability**, "contact form send failed").
- Form works with `npm run serve` but not live: the local run only simulates sending. See `rules/traps.md`.
