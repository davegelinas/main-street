# Email rules

Two directions, both on Cloudflare Email Routing. Don't confuse them; the owner will.

## Receiving: Cloudflare Email Routing (free)

- `anything@yourdomain.com` forwards to the owner's personal inbox (usually Gmail). There is **no mailbox** on the domain itself; nothing to log into, nothing to check separately.
- Setup is in the Cloudflare dashboard (**Compute** → **Email Service** → **Email Routing**; older dashboards: the domain → **Email**), covered step-by-step in `docs/setup-guide.md`. The owner adds their inbox as a **destination address** and clicks the link Cloudflare emails them.
- It needs the domain's nameservers on Cloudflare. A site kept on Pages (`docs/keep-your-dns.md`) has no Email Routing.
- Forwarding only **receives**. It cannot send mail as the business.

## Sending: the contact form (free, no key)

- The form posts to `/api/contact`, handled by `src/worker.ts`. It sends through the `send_email` binding in `wrangler.jsonc` (`EMAIL`): Email Routing's free "send to a verified address." **No API key, no other account.**
- It delivers only to inboxes verified in the owner's Email Routing, and only from a domain with Email Routing on. That's a feature: the form can never be used to email anyone but the owner.
- One secret, `CONTACT_TO_EMAIL`: where messages land. The Deploy to Cloudflare button asked for it; it lives in Cloudflare (the site → **Settings** → **Variables and Secrets**, Production), never in the repo (it's the owner's private inbox) and never on previews. It must be the **same address** the owner verified in Email Routing, or nothing arrives.
- Optional `CONTACT_FROM_EMAIL`: the sender. It defaults to `noreply@<the site's domain, without www.>`. Set it only when Email Routing runs on a different name than the site (a subdomain, below). With no from address, the code never sends from a free `*.workers.dev` or `*.pages.dev` address.
- So the form delivers only on the live site at the owner's own domain, after Email Routing is on: never on the free address or a preview link. Until then turn `contactForm` off (tap-to-call and email still show); turn it on in the same change that follows Email Routing.
- **Check without sending:** `GET /api/contact` answers `{"ready": true}` when the binding, `CONTACT_TO_EMAIL` and a sender are all there (`npm run audit` reports it). "Ready" doesn't prove the inbox is verified: send one real test message.
- **Graceful degradation is mandatory:** when email isn't set up, the code returns 503 and the frontend shows "please email us directly" instead of a broken form; when Cloudflare refuses a send, 502 with the same advice, and the reason is logged (the site → **Observability**, "Email Routing refused", with a code like `E_RECIPIENT_NOT_ALLOWED`). A form that fails silently is worse than no form. Never ship a form that errors on every submission.
- Mail goes **from** the business address (e.g. `noreply@yourdomain.com`) with the visitor's address in `Reply-To`, so replying in Gmail answers the visitor. Never send *as* the visitor's address: that's spoofing and it gets rejected.
- The code has a honeypot field and rejects submissions faster than a human can type. That's enough for most sites. If spam becomes a real problem, add Cloudflare Turnstile (free): it needs two more secrets and a frontend widget. Don't add it preemptively.

## When the domain already has mailboxes

Google Workspace, Microsoft 365, or registrar mailboxes on the domain: **never turn on Email Routing for the domain itself**; it replaces the MX records and takes over their mail. For the contact form, turn Email Routing on for a **subdomain** only (Email Routing → **Settings** → **Subdomains**, for example `mail.yourdomain.com`), verify the owner's inbox, and set `CONTACT_FROM_EMAIL` to an address there (`website@mail.yourdomain.com`). Say the risk plainly and get a yes first; if the dashboard offers to change the main domain's MX records, stop. (Not yet proven on a live account: see the toolkit's `docs/phase-1-plan.md`. If it fails, the form stays in "email us directly" mode and nothing breaks.)

## Sending as the business from Gmail (optional)

If the owner wants to *reply* from `you@yourdomain.com` inside Gmail: Gmail → Settings → Accounts → "Send mail as" needs an outgoing mail server (SMTP), which free Email Routing doesn't have. Cloudflare's Email Sending has one but needs the Workers Paid plan (about $5 a month); a mail provider is the other route. That's a real cost: explain it and let the owner decide. Most are fine replying from Gmail. Document whatever was done in the owner's notes.

## Rules

- Never write email credentials or the owner's private inbox into the repo. Ever. (`CONTACT_TO_EMAIL` is a Cloudflare secret for that reason.)
- Never use the owner's personal Gmail address as the public contact. The business address exists for a reason.
- Test the form end-to-end after any change ships: submit once on the live site and confirm the email arrives. (Preview links can't send: no email settings there, on purpose.)
