# For agencies and freelancers

This template is owner-first: an owner can set it up alone with their own AI in about an hour, so a helper is optional. It's also a great client-delivery vehicle for owners who'd rather hand it off. Spin up a professional site in under an hour, hand the client something they can actually run themselves, and stop being their webmaster for every hours change.

## The per-client playbook

1. **Scaffold their site** from the toolkit: `node scripts/new-site.mjs ../client-name`, then push it to a **public** repo in the client's GitHub account (or your agency org, then transfer). Nothing private goes in it. Their site, their repo, their Cloudflare. You are never the single point of failure.
2. **Run the setup wizard together** (`npm run setup`) on a 15-minute call. Apply the closest preset (`npm run preset restaurant`). The client sees their business appear on screen; it sells itself.
3. **Collect real content**: photos, menu/prices, the words they actually say to customers. Drop photos in `public/images/`, run `npm run optimize-images` (it also strips hidden GPS data; CI strips it on every pull request too). The repo is public and an upload's original stays in its history, so turn location off on the phone before uploading.
4. **Connect their Cloudflare** (their account, their domain): Pages → Web Analytics (one click) → the "Protect live site" ruleset on `main` → custom domain → Email Routing (not if they already have mailboxes) → the one Resend key, which needs their own domain. All in `docs/setup-guide.md`; do it screensharing so they learn where things live.
5. **Introduce the AI.** Open the repo in Claude Code, run through two example changes with them watching ("change the Saturday hours", "add a holiday banner"). Each one is a pull request with a preview link they open and approve with "ship it"; show "undo that" too. This 10-minute demo is the handoff.
6. **Hand over `README.md`** (the owner page) and walk away. They own it now.

## White-labeling the AI instructions

- `site.config.json`: their business facts. The AI reads these automatically.
- `AGENTS.md` is the single manual every AI reads (`CLAUDE.md` just points to it). It reads the business from `site.config.json`; no editing needed.
- Optional: add a `rules/client-notes.md` with client-specific context (their booking tool, their review links, things to never touch) and add it to the triggers table. Don't bloat the core rules.
- Keep the beginner-mode rules intact. Your client is the beginner this was built for.

## What to charge

A suggestion, not a rule: a flat setup fee for steps 1–5 (the value is the working system, not hours), and optionally a small monthly "I'm here if you need me" retainer. The pitch writes itself: "Your site costs $12/year to run, and you can update it yourself by just asking. I'm here for the big stuff."

Don't charge for the template. It's free and public. Charge for your judgment.

## Managing multiple clients

- One repo per client. Never multi-tenant one repo; the day two clients need different things, you'll be glad.
- Keep a private agency checklist of your own (your Cloudflare walkthrough notes, common presets). The template stays generic; your process stays yours.
- When the template improves upstream, cherry-pick what matters into client repos. Don't auto-merge template changes into live client sites.

## Boundaries

- The client owns their repo, their Cloudflare account, and their domain. Set it up *in their accounts*, not yours. If they ever leave, everything goes with them. This is a selling point, not a risk.
- Never hold credentials. The client enters their own contact-form key via Cloudflare's dashboard (Production only). You guide, they type.
