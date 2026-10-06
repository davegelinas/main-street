# Email rules

Two directions, one Cloudflare feature. Don't confuse them; the owner will.

## Receiving: Cloudflare Email Routing (free)

- `anything@yourdomain.com` forwards to the owner's personal inbox (usually Gmail). There is **no mailbox** on the domain itself; nothing to log into, nothing to check separately.
- Setup is in the Cloudflare dashboard (**Compute** → **Email Service** → **Email Routing**; older dashboards: the domain → **Email**), covered step by step in `docs/setup-guide.md` ("Business email and the contact form"). The owner adds their everyday inbox as a **destination address** and clicks the verification link Cloudflare emails them.
- Forwarding only **receives**. Replying "as" the business from Gmail is a separate, optional setup (below).
- **Needs the domain on Cloudflare** (nameservers pointed at Cloudflare). Email Routing does not exist for domains whose DNS lives elsewhere.

## Sending: the contact form (free, no key)

- The form posts to `/api/contact`, handled by `src/worker.ts`. It sends through the `send_email` binding in `wrangler.jsonc` (named `EMAIL`), which is Cloudflare Email Routing's "send to a verified address" feature. **There is no API key and no third-party account.**
- It can only deliver to addresses verified in the owner's Email Routing, and only from a domain with Email Routing turned on. That's a feature: the form can never be abused to email anyone but the owner, and sends to verified addresses are free on every plan.
- **Settings** (Cloudflare → the site → **Settings** → **Variables and Secrets**, Production):
  - `CONTACT_TO_EMAIL` (secret, required): where messages go. The Deploy to Cloudflare button asked the owner for it. It must be the **same address** they verified as an Email Routing destination, or nothing arrives.
  - `CONTACT_FROM_EMAIL` (optional): the sender. Defaults to `noreply@<the site's domain, without www.>`. Set it only when Email Routing runs on a different name than the site: routing on a subdomain (see below), or a site that lives on a subdomain like `shop.yourdomain.com`.
- **So the form delivers only on the live site at the owner's own domain**, after Email Routing is on and the destination is verified. On the free `workers.dev` address and on preview links it shows "please email us directly." That's expected.
- **Graceful degradation is mandatory:** if anything is missing (binding, `CONTACT_TO_EMAIL`, or Cloudflare refuses the send), the code returns 503 and the page shows "please email us directly" instead of a broken form. A form that fails silently is worse than no form. Never ship a form that errors on every submission.
- **Check without sending:** `GET /api/contact` answers `{"ready": true}` when the binding and `CONTACT_TO_EMAIL` are present (`npm run audit` reports it). "Ready" does not prove the address is verified: after setup, send one real test message on the live site.
- Mail goes **from** the business domain with the visitor's address in `Reply-To`, so replying in Gmail answers the visitor. Never send *as* the visitor's address: that's spoofing and it gets rejected.
- The code has a honeypot field and rejects submissions faster than a human can type. That's enough for most sites. If spam becomes a real problem, add Cloudflare Turnstile (free): it needs a secret and a frontend widget. Don't add it preemptively.
- When a send fails, the reason is logged: Cloudflare → the site → **Observability** → Logs, look for "contact form send failed" and its code (for example `E_SENDER_NOT_VERIFIED`, `E_RECIPIENT_NOT_ALLOWED`). Ask the owner for a screenshot.

## When the domain already has mailboxes

If the owner's domain already has email (Google Workspace, Microsoft 365, or the registrar's mailboxes), **never turn on Email Routing for the main domain**: it replaces the MX records and takes over their mail.

For the contact form, turn Email Routing on for a **subdomain** only (Email Routing → Settings → Subdomains, for example `mail.yourdomain.com`). That leaves the main domain's email alone. Then verify the owner's inbox as a destination and set `CONTACT_FROM_EMAIL` to an address on that subdomain (`website@mail.yourdomain.com`). Explain the risk plainly and get a yes before touching anything; if the dashboard asks to change MX records for the main domain, stop.

(Not yet tested on a live account: see the toolkit's `docs/phase-1-plan.md`. If it doesn't work, the form stays in its "email us directly" mode and nothing breaks.)

## Sending as the business from Gmail (optional)

If the owner wants to *reply* from `you@yourdomain.com` inside Gmail: Gmail → Settings → Accounts → "Send mail as" needs an outgoing mail server (SMTP). Free Email Routing has none. Cloudflare's Email Sending has SMTP but needs the Workers Paid plan (about $5 a month); a mail provider is the other route. That's a real cost: explain it and let the owner decide. Most small businesses are fine replying from Gmail. Document whatever was done in the owner's notes.

## Rules

- Never write email credentials or the owner's personal address into the repo. `CONTACT_TO_EMAIL` is a Cloudflare secret for exactly that reason.
- Never use the owner's personal Gmail address as the public contact. The business address exists for a reason.
- Test the form end to end after any change to it ships: submit once on the live site and confirm the email arrives (check spam the first time). Preview links can't send, on purpose.
