# Contact form

A contact section with a working form. Submissions are emailed to the owner via Resend. **On by default.**

## How to turn it on/off

Flag: `contactForm` in `site.config.json`. The form posts to `functions/api/contact.ts`.

## What the owner needs to do

After their own domain is connected: verify the domain in Resend, then add `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in Cloudflare (Pages → Settings → Variables and Secrets → **Production** only). Step-by-step in `docs/api-keys.md`.

Until then, the section always shows the business phone and email next to the form, and anyone who submits sees "Email is not set up yet. Please email us directly." Nothing breaks. Preview links never have the key (on purpose), so they always show this note: test real delivery on the live site after shipping.

## How it works

- Frontend validates (name, valid email, message), includes a honeypot field and a submission timer.
- The Pages Function rejects bots (honeypot filled, submitted in under 3 seconds), then sends via the Resend API: from the business address, `Reply-To` set to the visitor.
- On success the visitor sees a plain-words confirmation. On failure they see the direct email address. Never a stack trace.

## Costs and limits

Resend's free tier covers far more than a small business contact form will ever send. If spam becomes a real problem, add Cloudflare Turnstile (free); see `rules/email.md`. Don't add it preemptively.

## Customization

- Change the recipient: messages go to `CONTACT_TO_EMAIL`, set in Cloudflare. To send them elsewhere, the owner changes that variable (no code change), then retries the latest deployment.
- Extra fields (party size, date): add them to the form and the function together, and test end-to-end.

## What can go wrong

- "Nobody's getting the emails": check the Resend dashboard first (deliveries log), then that the domain is still **Verified** there, then that both variables are set in Cloudflare's *Production* environment.
- Form works locally but not live: `.dev.vars` has the key but Cloudflare doesn't. See `rules/traps.md`.
