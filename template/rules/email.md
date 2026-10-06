# Email rules

Two separate systems. Don't confuse them; the owner will.

## Receiving: Cloudflare Email Routing (free)

- `anything@yourdomain.com` forwards to the owner's personal inbox (usually Gmail). There is **no mailbox** on the domain itself; nothing to log into, nothing to check separately.
- Setup is in the Cloudflare dashboard (Email → Email Routing), covered step-by-step in `docs/setup-guide.md`.
- Forwarding only **receives**. It cannot send.

## Sending: Resend (free tier)

- The contact form posts to `functions/api/contact.ts`, a Cloudflare Pages Function that sends via the Resend API.
- Needs one secret: `RESEND_API_KEY`, set in Cloudflare (Pages → Settings → Variables and Secrets → **Production only**, never Preview), plus `CONTACT_TO_EMAIL` (where messages land). Also add the key to `.dev.vars` for local testing.
- **The domain must be verified in Resend.** Mail goes from `noreply@<the site's domain>`, and Resend refuses to send from a domain it hasn't verified. So the form only delivers on the live site at the owner's own domain, never on `*.pages.dev` or a preview link.
- **Graceful degradation is mandatory:** if the key is missing, the function returns 503 and the frontend shows "please email us directly at ..." instead of a broken form. A form that fails silently is worse than no form. Never ship a form that errors on every submission.
- Mail goes **from** the business address (e.g. `noreply@yourdomain.com`) with the visitor's address in `Reply-To`, so replying in Gmail answers the visitor. Never send *as* the visitor's address: that's spoofing and it gets rejected.
- The function has a honeypot field and rejects submissions faster than a human can type. That's enough for most sites. If spam becomes a real problem, add Cloudflare Turnstile (free): it needs two more secrets and a frontend widget. Don't add it preemptively.

## Sending as the business from Gmail (optional)

If the owner wants to *reply* from `you@yourdomain.com` inside Gmail: Gmail → Settings → Accounts → "Send mail as", using Resend's SMTP credentials. Then set up SPF/DKIM/DMARC DNS records (Resend provides them) so the mail doesn't land in spam. This is a one-time setup; document what was done in the repo's docs or the owner's notes.

## Rules

- Never write email credentials into the repo. Ever.
- Never use the owner's personal Gmail address as the public contact. The business address exists for a reason.
- Test the form end-to-end after any change ships: submit once on the live site and confirm the email arrives. (Preview links can't send: no keys there, on purpose.)
