# For agencies and freelancers

Main Street is owner-first: an owner can set it up alone with their own AI in about two hours. It's also a great way to deliver client sites for owners who'd rather hand it off. Set up a professional site for each client, hand the client something they can actually run themselves, and stop being their webmaster for every hours change.

## The per-client playbook

1. **Scaffold their site** from the toolkit ([START-HERE.md](../START-HERE.md)), then push it to a **public** repo in the client's GitHub account (or your agency org, then transfer it). Nothing private goes in it. Their site, their repo, their Cloudflare: you are never the single point of failure.
2. **Run the setup wizard together** (`npm run setup`) on a 15-minute call, and apply the closest preset (`npm run preset restaurant`). The client watches their business appear on screen; it sells itself.
3. **Collect real content:** photos, prices, the words they actually say to customers. Put photos in `public/images/` and run `npm run optimize-images` (it strips hidden GPS data; CI strips it on every pull request too). The repo is public and an upload's original stays in its history, so have them turn location off on the phone first.
4. **Connect their accounts**, screensharing so they learn where things live. All in the site's `docs/setup-guide.md`:
   - Cloudflare: Pages, then Web Analytics (one click).
   - GitHub: the "Protect live site" ruleset and settings (Step 6).
   - Later, when they're ready: custom domain, Email Routing (not if they already have mailboxes), and the one Resend key, which needs their own domain.
5. **Hand over the loop.** Connect the client's own AI account (setup guide, Step 3), put the **Edit my website** button on their phone (Step 7), and have *them* ship two small changes while you watch ("change the Saturday hours," "add a holiday banner"), plus one "undo that." This 10-minute demo is the handoff.
6. **Hand over their site's `README.md`** (written for the owner) and walk away. They own it now.

## Customizing the AI instructions

- `site.config.json` holds their business facts. The AI reads these automatically.
- `AGENTS.md` is the single manual every AI reads (`CLAUDE.md` just points to it). It reads the business from `site.config.json`; no editing needed.
- Optional: add a `rules/client-notes.md` with client-specific context (their booking tool, their review links, things to never touch) and add it to the triggers table in `AGENTS.md`. Don't bloat the core rules.
- Keep the beginner-mode rules intact. Your client is the beginner this was built for.
- No custom GPT or plugin is needed. The manual inside the repo plus the client's AI is the whole interface.

## What to charge

A suggestion, not a rule: a flat setup fee for steps 1 to 5 (the value is the working system, not the hours), and optionally a small monthly "I'm here if you need me" retainer. The pitch writes itself: "Your site costs $12 a year to run, and you can update it yourself just by asking. I'm here for the big stuff."

Don't charge for the template. It's free and public. Charge for your judgment.

## Managing multiple clients

- One repo per client. Never put two clients in one repo; the day they need different things, you'll be glad.
- Keep a private checklist of your own (your Cloudflare walkthrough notes, favorite presets). The template stays generic; your process stays yours.
- When the template improves upstream, bring over what matters, one pull request per client, through the normal preview and "ship it." Never auto-merge template changes into a live client site.

## Boundaries

- The client owns their repo, their Cloudflare account, and their domain. Set everything up *in their accounts*, not yours. If they ever leave, everything goes with them. That's a selling point, not a risk.
- Never hold credentials. The client enters their own contact-form key in Cloudflare (Production only). You guide, they type.
