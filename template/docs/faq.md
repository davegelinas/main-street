# FAQ

**Do I need to know how to code?**
No. The setup wizard asks plain-language questions, and day-to-day updates happen by talking to an AI assistant or editing text on GitHub.com. Reading this FAQ is the hardest technical thing you'll do.

**What does it actually cost?**
About $10–12/year for the domain name. Everything else is free-tier. Your AI chat subscription (Claude, ChatGPT, or similar) is separate, but a paid plan (about $20/month, Claude Pro or ChatGPT Plus) is needed for the hands-free loop where your AI makes the changes for you. Most owners already pay for one, and this system never adds API usage charges on top of it. (A free plan still works through the slower [browser-only path](browser-only.md).)

**Do I need to buy API access for the AI?**
No. Your AI works on the chat subscription you already pay for, so the AI itself can never run up a usage charge. The site needs no keys at all: the contact form and visitor stats run on your free Cloudflare account, once you have your own domain; see [api-keys.md](api-keys.md).

**Can I really not get a surprise bill?**
Correct. No service here bills by usage on the tiers we use. The domain renews yearly; that's the only charge.

**What if I break something?**
Say "undo that" to your AI. It prepares the undo as a new preview link; check it, say "ship it," and you're back. Every change goes through a preview link you approve first, so breakage is rare.

**Do I own my website?**
Yes. It's your GitHub repo (public, since your website is public anyway, and locked so nothing goes live without your "ship it"), your Cloudflare account, your domain. The template is just the starting point. If you stop using it, everything stays yours.

**What if the AI assistant makes a mistake?**
Tell it what you see in plain words. It can undo anything: just say "undo that." Mistakes here are cheap and reversible by design.

**Can I use my existing booking/scheduling tool?**
Yes. The booking feature links to Acuity, Calendly, Square, Vagaro, whatever you use. The site sends people there; it doesn't replace it.

**Does it work for online stores?**
Not really, and that's deliberate. This is for businesses where the website earns the visit or the call: restaurants, trades, salons, professional services. Real e-commerce (carts, payments, inventory) is a different product with different costs.

**Will my site show up on Google?**
Your free `workers.dev` address is hidden from Google on purpose; your own domain is the launch. The template handles the technical side (structured data, sitemap, speed, mobile). The human side matters more: claim your Google Business Profile, keep hours accurate, get reviews. See `rules/seo.md`.

**Can someone build this for me and hand it over?**
Yes. That's the normal way it happens. A helper is optional, though: you can do the setup yourself with your own AI in about an hour, and your AI walks you through every step. If you'd rather hand it off, a freelancer (or a tech-savvy friend) can do it in your accounts and teach you the update flow in ten minutes. Either way, it's yours.

**What happens if this template disappears?**
Nothing happens to your site. Your repo is a complete, independent copy. It builds with standard open-source tools and deploys to Cloudflare. No part of it phones home.

**Why not just use Squarespace/Wix?**
Those are fine products. This is for people who'd rather pay $12/year than $200+/year, own their site outright, and update it by having a conversation instead of wrestling a page builder.
