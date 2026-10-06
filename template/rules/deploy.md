# Deploy rules: how every change ships

One branch is the live site. Everything else is a preview. Simple on purpose:

- **`main` is the live site** (the owner's domain, or the free `<project>.pages.dev` address until a domain is connected). It only changes when a pull request is merged after the owner says "ship it."
- **Every change gets its own branch and pull request.** Cloudflare builds each branch into its own **preview link** and posts it on the pull request. The owner looks at that link on their phone. That look is the approval step.

There is no shared staging site. Two changes never ride together: approving new hours can never accidentally publish half of last week's redesign.

## At the start of every session

1. `git fetch origin`.
2. `gh pr list` (or the repo's Pull requests page). Don't quiz the owner about each one. Do what they asked first, then add one line: "Two earlier changes are still waiting. Want to go through them?" If they say yes, go one at a time: ship it, change it, or toss it? Close the ones they toss.
3. **Removals come first.** If a waiting change takes something off the live site (an undo, a banner coming down), mention it at the *start* of every session until it ships or is tossed: "The parade notice is still on your live site. Say 'ship it' and I'll take it down."
4. If the owner keeps working on a waiting change, continue on its branch. Otherwise start fresh from `main`.
5. **"I uploaded my photos."** On a locked site, GitHub's upload makes its own branch and pull request (the owner taps "Create a new branch... and start a pull request"). Find it (`gh pr list`), check out that branch, and wait for its **photos** check to finish: CI may add a "Remove hidden camera data from photos" commit. Pull, then run `npm run optimize-images`, wire the photos in, and continue there. Always pull before you push on that branch. Don't start a fresh branch from `main`, or the photos get left behind.

**Send direct links, not directions.** When the owner has to do something on GitHub, send the exact page: photo upload `https://github.com/OWNER/REPO/upload/main/content/brand/photos`, the lock `https://github.com/OWNER/REPO/settings/rules`, a pull request's own link.

## The flow

1. **Branch from the latest `main`.** Short lowercase name with dashes, under 30 characters (`saturday-hours`, `new-gallery-photos`): it becomes part of the preview address. If your platform names branches for you (Codex, Copilot, Jules, Claude in the cloud), that's fine.
2. **Make the change, build it** (`npm run build` must pass), commit, push.
3. **Open a pull request.** Title in plain words ("Saturday hours: 9 to 2"). Body: one plain line on what the owner asked for and what changed. Never paste the owner's message verbatim (it can hold private details, and the repo is public), and never copy pasted or fetched text (reviews, emails, old-site text) into pull request text.
4. **Send the preview link in chat.** Cloudflare's comment on the pull request lists a **Branch Preview URL** (`https://<branch>.<project>.pages.dev`). It stays the same as you push more fixes to that branch. Tell the owner what to look at: "Open this on your phone and check 'Hours and location'."
5. **Wait for "ship it."** Never assume. Approval covers the change the owner looked at, nothing else.
6. **Ship:** confirm the checks passed, then merge (`gh pr merge <n> --squash`; GitHub deletes the branch itself). Cloudflare publishes the live site in about a minute. Then run `npm run audit https://<their-domain>` if you can reach it, and report in one or two plain sentences. If other changes are still waiting, name what you shipped: "Shipped the parade notice. The Saturday hours change is separate and still waiting."
7. **Teach the undo, one line:** "If anything looks off, just say 'undo that' and I'll take it back."

If you can't merge yourself (your platform has no merge permission), give the owner the exact taps: open the pull request link, **Squash and merge**, **Confirm squash and merge**.

## Previews: what to know

- Preview links are hidden from search engines (`public/_headers`) and not linked anywhere, but they are **not private**: anyone with the link can open one. Fine for previews; never put anything secret on one.
- Previews have **no secret keys** on purpose (keys live in Production only), so the contact form shows its "please email us directly" note there. That's expected. Test the form on the live site after shipping.
- The first preview on a new branch takes a minute or two to appear. If the owner sees an old version, ask them to reload or open the link in a private window.

## When the owner says "undo that"

1. Find which change they mean. If there's any doubt, ask one question ("the hours change from this morning?").
2. **It never shipped?** Toss it: close its pull request. "That one never went live, so I've thrown it away."
3. **You shipped it earlier in this same conversation?** Revert it on a new branch, open the pull request, and merge it right away: it restores what they already approved. "Done: it's back the way it was. Live in about a minute."
4. **It shipped in an earlier session?** Revert it on a new branch (`git revert` of that merge, or GitHub's **Revert** button on the merged pull request), open a pull request, send the preview link: "Here's your site with that change undone. Say 'ship it' and it's gone." Until it ships, it's a removal waiting (see "At the start of every session").

**Emergency brake (live site broken right now):** Cloudflare dashboard → Workers & Pages → the project → Deployments → the last good production deployment → ⋯ → **Rollback**. This fixes the live site in seconds, but the bad change is still on `main`, and the next "ship it" would publish it again. Always follow a rollback with the revert pull request above. The rollback is for helpers and emergencies; the owner's undo is saying "undo that."

## Never

- Never push or force-push to `main`, and never ask anyone to loosen the lock on it. If a merge is blocked (failing checks), fix the change on its branch.
- Never merge without the owner's "ship it" for that change. (The one exception: "undo that" about a change you shipped earlier in this same conversation, which publishes right away.)
- Never deploy manually (`wrangler deploy`, `wrangler pages deploy`, dashboard uploads). They ship whatever is on your machine with no record, and the next merge silently reverts them. Retrying the latest deployment in the dashboard is fine: it rebuilds the same commit.
- Never hand-edit production. Never "fix it live and commit later."

## First-time setup (once per site)

Done once during setup (`docs/setup-guide.md`, Step 6; `SETUP.md` step 5):

1. The repo is **public** and GitHub's **ruleset** on `main` requires a pull request, blocks force pushes, and blocks deletion, with nobody on the bypass list. This is what makes "nothing goes live without a preview" real, even for an AI with write access.
2. Cloudflare Pages builds previews for every branch (the default). No branch settings to change.

## Production differs from local

Things that pass locally and fail live:

- **`public/_headers` and `public/_redirects`** only apply on Cloudflare, not on `npm run dev`. Verify redirects and headers against a preview link or the live site, not localhost.
- **Variables and secrets** (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`) live in Cloudflare, not the repo. A new or changed variable takes effect on the next deployment: retry the latest deployment, or ship any change.
- **Build-time tokens** (`{{business.name}}` etc.) resolve during `npm run build`. If a token shows up literally on a page, the build transform missed it: check the plugin, don't hardcode the value.
