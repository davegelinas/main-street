# Contributing

Thanks for wanting to help. This project exists so small businesses can have a great website for about $12 a year, and every contribution should serve that goal: simpler, friendlier, harder to break.

## What's in this repo

```
template/            The pristine generated site. Scaffold it, don't edit it in place.
  index.html         Homepage (neutral placeholder copy; the owner's AI fills it in)
  site.config.json   Business facts + feature flags (neutral defaults, schema-validated)
  scripts/           Setup wizard, presets, post-deploy audit, image optimizer
  AGENTS.md          The operating manual every AI reads (CLAUDE.md points to it)
  SETUP.md           The setup checklist the owner's AI works through
  rules/             Focused instruction files the AI loads on demand
  features/          One doc per toggleable feature
  presets/           Business-type bundles (bakery, restaurant, home-services, ...)
  docs/              Owner guides: setup, your AI, examples, FAQ
  wrangler.jsonc     How Cloudflare serves the site (static assets + one small Worker)
  src/worker.ts      The contact form: emails the owner through Cloudflare Email Routing
AI-SETUP.md          Bootstrap instructions for an owner's AI setting up a new site
START-HERE.md        Terminal setup for helpers
scripts/
  new-site.mjs       The scaffolder: template/ → new customer repo
  make-journey-video.py      Regenerates the 36-second everyday-loop video
  make-end-to-end-video.py   Regenerates the 70-second owner-alone setup video
                             (both: Pillow + ffmpeg; they build a demo site with
                             Node and screenshot it with Chrome's headless shell)
docs/
  the-12-dollar-stack.md   The honest bill
  for-agencies.md          The per-client playbook
  upgrading.md             Moving a pre-October-2026 site to the current model
  pressure-test.md         The adversarial review
```

The knowledge base (`rules/`, `features/`, `presets/`) lives **only** in `template/`: every customer site carries its own copy, so each site is self-sufficient and its AI never needs this toolkit.

## How to contribute

1. **Fork the repo** and create a branch for your change.
2. **Make the change in `template/`** (or in the toolkit docs). Validate it the way CI does: scaffold a throwaway site with `node scripts/new-site.mjs /tmp/throwaway`, then in that folder run `npm install`, `npm run setup`, `npm run typecheck`, `npm run build`, and `npm run audit <url>` against `npm run preview` or a Cloudflare preview link.
3. **Open a pull request** against `main`. Describe what you changed and why, in plain language. If you walked through it as a non-technical owner would, say so.
4. **Review.** Every PR is reviewed before merging. Expect questions, especially about wording: owner-facing copy must stay jargon-free and em dash free.

Existing customer sites pick up template improvements through their AI (or a manual copy). There is deliberately no auto-update: an owner's live site never changes without them saying so.

## Ground rules

- **Owners first.** If a change makes something more powerful but harder to understand, it needs to work harder to justify itself.
- **Tool-agnostic.** The docs and instructions must work with any capable AI assistant, never just one.
- **Preview first, ship it after.** Never propose a change that lets edits skip the preview link, or that asks anyone to loosen the lock on `main`.
- **One fact, one home.** If two owner docs say the same thing, one of them links to the other. Copies drift.
- **No secrets in PRs.** API keys, tokens, and credentials never belong in files, logs, or screenshots.
- **Be kind.** See the [Code of Conduct](CODE_OF_CONDUCT.md).

## What helps most right now

- Trying the setup as a non-technical person would and reporting every confusion.
- New business-type presets (`template/presets/`).
- Plain-language improvements to any doc an owner reads.
- Bug reports with the exact steps to reproduce (see the issue template).
