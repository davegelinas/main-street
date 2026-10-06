# Traps: things that have bitten before

Read this before debugging anything weird. Each entry cost someone real time.

## Build and deploy

- **`npm run dev` doesn't apply `_headers` or `_redirects`.** Routing and header behavior must be verified against a Cloudflare preview/production URL, not localhost.
- **A token showing literally** (`{{business.name}}` visible on the page) means the build transform didn't run on that file. Check `plugins/site-config.ts` (pages are found automatically: any folder with an `index.html`, plus `404.html`). Don't hardcode the value as a "fix."
- **A feature block visible when it should be off** means the `<!-- feature:name -->` comment syntax drifted (extra spaces, wrong name). The strip is literal: match it exactly.
- **Stale preview:** Cloudflare preview URLs cache aggressively. Hard-refresh (or open in a private window) before declaring something broken.
- **The contact form "doesn't work" on a preview link.** Expected: previews have no secret keys, so the form shows its "email us directly" note. Test it on the live site.
- **A dashboard rollback is not an undo.** It changes what's live, not what's on `main`. The next merge publishes the bad change again unless you also revert it (`rules/deploy.md`).

## Content

- **Never infer a file's contents from its name.** Open it. Names lie; this has shipped wrong photos and dead buttons before.
- **The owner's words win verbatim.** If their edit conflicts with a structural change, the structure adapts, not the words.

## Email

- **Forwarding receives, Resend sends.** If "email isn't working," figure out which direction is broken before touching anything.
- **A form that fails on every submission** is worse than no form. The graceful-degradation path (show the direct email address) must be tested, not assumed.

## DNS and domains

- **DNS changes take time.** Up to a few hours. Don't keep "fixing" something that's just propagating; check with a DNS lookup tool first.
- **The Cloudflare dashboard is the source of truth** for DNS, redirects at the edge, and email routing. The repo can't show you those. Say so when the answer lives there.

## Git

- **Some cloud AIs can't push changes under `.github/workflows/`** (GitHub requires a `workflow` permission their connection doesn't have). The whole push is refused. Leave workflow files out of the commit and give the owner a GitHub link instead: a new file is `https://github.com/OWNER/REPO/new/BRANCH?filename=PATH&value=<URL-encoded contents>`; an existing one is `https://github.com/OWNER/REPO/edit/BRANCH/PATH` (they paste the new contents).

- **More than one machine may edit this repo.** `git fetch origin` at session start and before pushing. Rebase, don't merge, for a clean history.
- **Never amend or force-push `main`.** If a bad commit landed, revert it forward. History is the audit trail.
