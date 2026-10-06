# The $12/year stack: the honest bill

Every service this template uses, what it costs, and where the free tier ends. No surprises is the point.

![Animated bar chart: the domain costs about $12 a year; hosting, contact form email, business email forwarding, and visitor stats all cost $0](assets/stack.svg)

## The bill

| Service | What it does | Cost | Free-tier limit (the part that matters) |
|---|---|---|---|
| **Cloudflare Registrar** | Your domain name | about $10 to $15/year, at cost | It's a domain. Renew yearly. |
| **Cloudflare Workers** (static assets and Workers Builds) | Hosting, CDN, SSL, deploys, preview links | $0 | Page and photo requests are free and unlimited; the contact form's code gets 100,000 runs a day; builds get 3,000 minutes a month. A small business site will never touch these ceilings. |
| **Cloudflare Email Routing** | `you@yourdomain.com` → your Gmail, and contact form messages to you | $0 | Generous daily forwarding limits; fine for human-scale email. Contact form messages to your own verified inbox are free on every plan. (It's forwarding, not a mailbox.) |
| **Cloudflare Web Analytics** | Visitor stats: no cookies, no key, on with the domain | $0 | Unlimited on the free plan. |
| **Cloudflare Turnstile** | Spam protection, if ever needed | $0 | Unlimited. Off by default; add only if spam becomes real. |
| **Supabase** | Database, only if you turn on email signup | $0 | 500MB database. Not needed for most sites. Free projects pause after 7 days idle, and the signup form fails until someone clicks Restore in the Supabase dashboard. |

**Total: about $12 a year** (the domain, plus tax, depending on its ending).

## What "free" actually means here

- **No credit card required** for Cloudflare Workers, Email Routing, Web Analytics, or Turnstile. No other accounts at all.
- **No usage meters to watch.** Nothing here bills by the visit. Your site can go viral on the local news and the bill stays $0.
- **The domain is the only recurring website cost**, and you own it outright. If you ever leave this setup, the domain goes with you.
- **Your AI plan is separate.** The hands-free loop (your AI makes the change, you say "ship it") needs a paid AI plan, about $20 a month (Claude Pro or ChatGPT Plus), which many owners already have. It runs on that subscription, never on API keys or usage billing, so the site has no AI bill of its own.

## What could cost money (and doesn't have to)

- **Booking tools** (Acuity, Calendly, Square): the template links to yours; their pricing is theirs. Most have free tiers.
- **Newsletter senders** (Kit, Buttondown): free tiers cover small lists.
- **A logo or brand design:** optional, one-time, your choice.
- **Someone to set it up for you:** that's what [for-agencies.md](for-agencies.md) is for. Typical: a flat setup fee, then the owner runs it.

## The promise

If a change to this template would introduce a required paid service, that's a design failure. Free-tier-first is a rule, not a preference. See `template/rules/safety.md`: never add a dependency (paid or otherwise) without saying what it costs and getting a yes.
