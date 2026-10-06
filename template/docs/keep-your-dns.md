# Keeping your domain's DNS where it is

Your site runs on Cloudflare, and it can only use a domain whose DNS (the internet's phone book) Cloudflare holds. For most owners, moving it is one careful change ([domains-and-dns.md](domains-and-dns.md)). But sometimes it can't or shouldn't move: an IT company controls the domain, the registrar is a website builder that makes it hard, or the email setup is too precious to touch. That's a fair call, and there's a fallback. Know what it costs first.

| | DNS on Cloudflare (recommended) | DNS stays where it is |
|---|---|---|
| Your site runs on | Cloudflare Workers | Cloudflare **Pages** (same files, same repository) |
| Your address | `yourbusiness.com` and `www` | `www.yourbusiness.com`; the bare domain forwards to it with your registrar's "domain forwarding" |
| Contact form | Emails you, no key | **Off.** Your phone and email show instead |
| `hello@` forwarding | Free, with Email Routing | Whatever your registrar offers |
| Preview links, "ship it", "undo that" | Yes | Yes |
| Visitor stats | Turn on with the domain | One click in the Pages project |

You can switch to the recommended setup later by moving your DNS; nothing about the site has to change.

## How your AI sets it up (one time, about 20 minutes)

Say to your AI: **"I'm keeping my DNS where it is. Set my site up on Pages."** It walks you through this:

1. Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** → your site's repository. Settings: production branch `main`, framework preset **None**, build command `npm run build`, build output directory `dist`. **Save and Deploy.** (Pages ignores `wrangler.jsonc`: on Pages your site is just its files.)
2. Turn off the Workers copy, so two copies don't build every change: your Workers site → **Settings** → **Build** → **Disconnect**.
3. Your AI turns the contact form off (`contactForm: false`) as a normal change.
4. Pages project → **Custom domains** → **Set up a custom domain** → `www.yourbusiness.com`. Cloudflare shows one **CNAME** record to add where your DNS lives now (`www` pointing at `<project>.pages.dev`). Add exactly that, nothing else. Your AI can read it off a screenshot.
5. At your registrar, forward `yourbusiness.com` to `https://www.yourbusiness.com` (most call it "domain forwarding" or "redirect").
6. Visitor stats: your Pages project → **Metrics** → **Enable** under Web Analytics. One click; counting starts after your next change ships.

Preview links then look like `https://<branch>.<project>.pages.dev`, and they're hidden from Google by the same `public/_headers`. Everything else (say what you want, look at the preview, "ship it") stays exactly the same.
