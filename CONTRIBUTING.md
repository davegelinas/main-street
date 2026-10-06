# Contributing

Thanks for wanting to help. This project exists so small businesses can have a great website for about $12 a year, and every contribution should serve that goal: simpler, friendlier, harder to break.

## How to contribute

1. **Fork the repo** and create a branch for your change.
2. **Make the change.** If it touches the template, validate it the way we do: scaffold a throwaway site with `node scripts/new-site.mjs /tmp/throwaway`, then `npm install`, `npm run setup`, `npm run build`, and the audit (`node scripts/audit-site.mjs` against a local preview). CI runs the same steps on your pull request.
3. **Open a pull request** against `main`. Describe what you changed and why, in plain language. If you walked through it as a non-technical owner would, say so.
4. **Review.** Every PR is reviewed before merging. Expect questions, especially about wording: owner-facing copy must stay jargon-free and em dash free.

## Ground rules

- **Owners first.** If a change makes something more powerful but harder to understand, it needs to work harder to justify itself.
- **Tool-agnostic.** The docs and instructions must work with any AI assistant, never just one.
- **Preview first, ship it after.** Never propose a change that lets edits skip the preview link, or that asks anyone to loosen the lock on `main`.
- **No secrets in PRs.** API keys, tokens, and credentials never belong in files, logs, or screenshots.
- **Be kind.** See the [Code of Conduct](CODE_OF_CONDUCT.md).

## What helps most right now

- Trying the setup as a non-technical person would and reporting every confusion.
- New business-type presets (`template/presets/`).
- Plain-language improvements to any doc an owner reads.
- Bug reports with the exact steps to reproduce (see the issue template).
