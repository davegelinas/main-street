# Deploy rules: how every change ships

One branch is the live site. Everything else is a preview. Simple on purpose:

- **`main` is the live site** (the owner's domain, or the free `https://<name>.<account>.workers.dev` address until a domain is connected; `<name>` is the `name` in `wrangler.jsonc`). It only changes when a pull request is merged after the owner says "ship it."
- **Every change gets its own branch and pull request.** Cloudflare (Workers Builds) builds each branch into its own **preview link** and posts it on the pull request. The owner looks at that link on their phone. That look is the approval step.

There is no shared staging site. Two changes never ride together: approving new hours can never accidentally publish half of last week's redesign.

## At the start of every session

1. `git fetch origin`.
2. `gh pr list` (or the repo's Pull requests page). For each change still waiting, tell the owner in one plain sentence and ask: ship it, change it, or toss it? Close the ones they toss.
3. If the owner keeps working on a waiting change, continue on its branch. Otherwise start fresh from `main`.

Before starting an unrelated change while another is waiting, mention the waiting one once. Don't block on it.

## The flow

1. **Branch from the latest `main`.** Short lowercase name with dashes, under 30 characters (`saturday-hours`, `new-gallery-photos`): it becomes part of the preview address, and the whole first part of that address (branch plus site name) must fit in 63 characters. If your platform names branches for you (Codex, Copilot, Jules, Claude in the cloud), that's fine; if the preview never appears, a long branch name is the first suspect.
2. **Make the change, build it** (`npm run build` must pass), commit, push.
3. **Open a pull request.** Title in plain words ("Saturday hours: 9 to 2"). Body: the owner's request in their own words, and one line on what changed.
4. **Send the preview link in chat.** Cloudflare's comment on the pull request lists a **Preview URL** (`https://<branch>-<name>.<account>.workers.dev`). It stays the same as you push more fixes to that branch. (The comment also lists a Deployment URL that never changes; send the Preview URL.) Tell the owner what to look at: "Open this on your phone and check the hours in the footer."
5. **Wait for "ship it."** Never assume. Approval covers the change the owner looked at, nothing else.
6. **Ship:** confirm the checks passed, then merge (`gh pr merge <n> --squash`; GitHub deletes the branch itself). Cloudflare publishes the live site in about a minute. Then run `npm run audit https://<their-domain>` if you can reach it, and report in one or two plain sentences.
7. **Teach the undo, one line:** "If anything looks off, just say 'undo that.'"

If you can't merge yourself (your platform has no merge permission), give the owner the exact taps: open the pull request link, **Squash and merge**, **Confirm squash and merge**.

## Previews: what to know

- Preview links are hidden from search engines (Cloudflare adds `X-Robots-Tag: noindex` to `workers.dev` preview links, and `public/_headers` does too) and not linked anywhere, but they are **not private**: anyone with the link can open one. Fine for previews; never put anything secret on one.
- Previews get **no settings and no email** on purpose (the `previews` block in `wrangler.jsonc` is empty, and Cloudflare never copies live settings to previews). So the contact form shows its "please email us directly" note there. That's expected. Test the form on the live site after shipping.
- The first preview on a new branch takes a minute or two to appear. If the owner sees an old version, ask them to reload or open the link in a private window.

## When the owner says "undo that"

1. Find which shipped change they mean. If there's any doubt, ask one question ("the hours change from this morning?").
2. Revert it on a new branch (`git revert` of that merge, or GitHub's **Revert** button on the merged pull request), open a pull request, send the preview link.
3. "Here's your site with that change undone. If it looks right, say 'ship it.'"

**Emergency brake (live site broken right now):** Cloudflare dashboard → **Workers & Pages** → the site → **Deployments** → the ⋯ next to the last good version → **Rollback**. This fixes the live site in seconds, but the bad change is still on `main`, and the next "ship it" would publish it again. Always follow a rollback with the revert pull request above. The rollback is for emergencies; the owner's undo is saying "undo that."

## Never

- Never push or force-push to `main`, and never ask anyone to loosen the lock on it. If a merge is blocked (failing checks), fix the change on its branch.
- Never merge without the owner's "ship it" for that change.
- Never deploy by hand (`wrangler deploy`, `wrangler versions upload`, `wrangler preview`, `wrangler pages deploy`, editing code in the Cloudflare dashboard). They ship whatever is on your machine with no record, and the next merge silently reverts them. Retrying a build in the dashboard is fine: it rebuilds the same commit.
- Never add a `deploy` or `preview` script to `package.json`. Cloudflare's build would pick it up instead of its own commands.
- Never hand-edit production. Never "fix it live and commit later."

## First-time setup (once per site)

Done once during setup (`docs/setup-guide.md`; `SETUP.md`):

1. The **Deploy to Cloudflare** button created the repository, the Cloudflare site, and the build connection (Workers Builds) in one go. Production branch `main`; every other branch gets a preview (**Settings** → **Build** → **Branch control** → **Enable Preview Builds** stays on).
2. The repo is **public** and GitHub's **ruleset** on `main` requires a pull request, blocks force pushes, and blocks deletion, with nobody on the bypass list. This is what makes "nothing goes live without a preview" real, even for an AI with write access.

**Sites on the Pages fallback** (the owner kept their DNS elsewhere, `docs/domains-and-dns.md`): the flow is identical, but Cloudflare Pages does the building. Preview links look like `https://<branch>.<project>.pages.dev` (the comment calls it the **Branch Preview URL**), the rollback is under the Pages project's **Deployments**, and there is no contact form email (`contactForm` stays `false`). Never re-enable the Workers build on such a site: two hosts building every change is how the wrong one ends up live.

## Production differs from local

Things that pass locally and fail live (or the other way around):

- **`npm run dev` ignores `public/_headers`, `public/_redirects`, and the contact form code.** `npm run serve` builds the site and runs it the way Cloudflare does (wrangler, entirely on your machine, no login): real 404 page, headers, redirects, and a simulated contact form that logs the email instead of sending it.
- **Settings live in Cloudflare, not the repo:** `CONTACT_TO_EMAIL` (a secret) and the optional `CONTACT_FROM_EMAIL`, under the site's **Settings** → **Variables and Secrets**. Saving a setting there deploys it right away. `keep_vars` in `wrangler.jsonc` keeps the next deploy from wiping it.
- **Build-time tokens** (`{{business.name}}` etc.) resolve during `npm run build`. If a token shows up literally on a page, the build transform missed it: check the plugin, don't hardcode the value.
- **The site's name** (`name` in `wrangler.jsonc`) must match the name in the Cloudflare dashboard, or every build fails. Never change it casually.
