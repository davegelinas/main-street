# Phase 1: from Cloudflare Pages to Cloudflare Workers

Status: **prototype on branch `phase-1-workers-v2`**, rebased onto `main` after Phase 0 and PR #43 (equal Claude and ChatGPT setup tracks, `dcee557`). Verified locally; **not yet smoke-tested on live accounts.** Platform facts were checked against developers.cloudflare.com on October 5, 2026. Cloudflare moves fast: re-check anything marked UNVERIFIED before launch.

## Why

1. **A Deploy to Cloudflare button.** One click copies `template/` into the owner's GitHub, creates the site, connects the builds (Workers Builds), and asks for the one setting. No empty repository for the AI to fill, no Cloudflare "Pages or Workers?" fork, no hidden-file upload trap on the browser-only path. The AI's opening becomes the same for every AI: follow `AI-SETUP.md`, then `SETUP.md`. The button only supports Workers, not Pages ([Deploy buttons, Limitations](https://developers.cloudflare.com/workers/platform/deploy-buttons/)).
2. **A contact form with no key.** The `send_email` binding sends to the owner's verified Email Routing inbox for free on every plan, with no Resend account ([Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).

## What changed

**Machinery**

| File | Change |
|---|---|
| `template/wrangler.jsonc` | New. `build.command: npm run build` (watching `src`, `plugins`, `public`), assets from `./dist` (`binding: ASSETS`, `not_found_handling: 404-page`, `run_worker_first: ["/api/*"]`), unrestricted `send_email` binding `EMAIL`, `workers_dev: true`, `keep_vars: true`, observability on, empty `previews: {}`. |
| `template/src/worker.ts` | New, replaces `functions/api/contact.ts` with every behavior kept: 64 KB limit (413), unreadable or `null` body (400), control characters stripped from the name, field validation before the bot checks, `leave_blank` honeypot and browser-measured `elapsed` (pretend success), no sending from `*.workers.dev`/`*.pages.dev` without `CONTACT_FROM_EMAIL`, 503 "not set up", 502 "couldn't send" with the reason logged. Sends via `env.EMAIL.send()` to the `CONTACT_TO_EMAIL` secret, `replyTo` the visitor. New: `GET /api/contact` returns `{"ready": bool}`. Any other path falls through to `env.ASSETS.fetch()` (404.html). |
| `template/functions/` | Deleted. |
| `template/.dev.vars.example` | New: declares `CONTACT_TO_EMAIL`, which makes the Deploy page ask for it. |
| `template/package.json` | `wrangler ^4.147.0`; `@cloudflare/workers-types` raised to its peer range; `cloudflare.bindings` descriptions for the Deploy page; `preview` (`vite preview`) replaced by `serve` (`wrangler dev`, which builds first). |
| `template/public/_headers` | `https://:name.:account.workers.dev/*` gets `noindex` (starter address and `<preview>-<name>.<account>.workers.dev` previews). The `pages.dev` rules stay for the rescue path. |
| `template/scripts/setup.mjs`, `audit-site.mjs` | No Resend prompt; `workers.dev` is a free host; contact readiness from `GET /api/contact`; stats "turn on with your domain." |
| `scripts/new-site.mjs` | Names the Worker after the folder. |
| `.github/workflows/ci.yml` (toolkit) | Audits the scaffold under `wrangler dev`, plus contact-degraded and preview-noindex assertions. `check-tricky-config` unchanged. |

**Docs** (targeted edits, Phase 0 structure kept): `AI-SETUP.md` (Step 0: Deploy-button or empty-repo opening), `template/SETUP.md` (same 8 boxes; 3 is "online at a free address", 4 is now "repository is public", stats moved to "Later"), `docs/setup-guide.md` Steps 2 to 5 and the "Later" sections, `rules/deploy.md`, `rules/email.md`, `features/contact-form.md`, `docs/api-keys.md` (now "no keys"), `docs/domains-and-dns.md`, new `docs/keep-your-dns.md` (the Pages rescue page), `docs/browser-only.md`, `rules/analytics.md`, `traps.md`, `safety.md`, `seo.md`, `supabase.md`, `checkup.md`, `AGENTS.md`, `README.md`s, `START-HERE.md`, `llms.txt`, `the-12-dollar-stack.md`, `for-agencies.md`, `upgrading.md` (Pages-to-Workers move), `CONTRIBUTING.md`, a dated note in `pressure-test.md`.

**Button markup** (README, setup guide, browser-only guide):

```md
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/main/template)
```

To test before merging, push this branch and use `.../tree/phase-1-workers-v2/template`.

## Decisions

- **No Resend fallback.** Phase 1's point is "no third-party account, no key." Domains with Workspace/M365 mail get Email Routing on a **subdomain** ([Subdomains](https://developers.cloudflare.com/email-service/configuration/subdomains/)) plus `CONTACT_FROM_EMAIL`; the Pages rescue path turns the form off. If smoke test 10 fails, Resend comes back in about 15 lines behind an optional secret.
- **`CONTACT_TO_EMAIL` is a secret asked for on the Deploy page.** In the repo it would publish the owner's private inbox. Secrets survive deploys; `.dev.vars.example` makes the Deploy page prompt for it ([Deploy buttons, secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/)). Not `secrets.required`, which fails deploys when it's missing ([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
- **Empty `previews` block.** New Workers Builds projects build branches with `wrangler preview`, which needs the block and never inherits production settings ([Previews configuration](https://developers.cloudflare.com/workers/previews/configuration/)). Previews get no email, as on Pages.
- **`keep_vars: true`, `workers_dev: true`.** Dashboard variables survive deploys; `workers.dev` can't be switched off by a future `routes` entry ([workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)).
- **Custom domains in the dashboard, not in config.** Wrangler 4.147's own code only publishes routes or custom domains when the config lists them, so deploys never touch dashboard-added domains (CONFIRMED by reading `triggersDeploy` in `wrangler-dist/cli.js`).
- **Visitor stats: automatic setup with the domain, no token.** For a hostname proxied through Cloudflare, Web Analytics' automatic setup injects the beacon at the edge; a manual snippet only counts its own apex domain, and both together double count ([Get started](https://developers.cloudflare.com/web-analytics/get-started/), [FAQ](https://developers.cloudflare.com/web-analytics/faq/)). The docs don't say in so many words that this covers Worker-served responses; a public report from 2026-09-24 ([piy-rider issue #41](https://github.com/promptityourself/piy-rider/issues/41)) shows it injected into a Workers + Static Assets site on a custom domain, including 404s, but only for browser-like requests (`Accept: text/html`, browser user agent). PLAUSIBLE, smoke test 11. Before the domain there are no stats (the free address is hidden from Google anyway). The rescue path uses Pages' own one-click switch.
- **Wrangler builds the site itself.** Workers Builds' "Build command" box is optional and not auto-filled when a repository is imported by hand; left blank, the deploy fails with "assets.directory does not exist" (reproduced locally: `wrangler deploy --dry-run` with no `dist/`). With `build.command` in `wrangler.jsonc`, `wrangler deploy --dry-run` ran `npm run build` itself, then read 26 asset files and bundled the Worker (CONFIRMED locally). Wrangler 4.147's source runs the same custom build for `wrangler preview` (its handler calls `getEntry(..., "deploy")`, which calls `runCustomBuild`) and for `wrangler dev` (built once, no rebuild loop). The docs still say "Workers Builds does not honor the configurations set in Custom Builds" ([Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)); that may mean only its own build step. Smoke test 5 settles it. Docs also spell out **Build command: `npm run build`** wherever the repo is imported by hand. Cost: with both, the build runs twice per deploy (seconds).
- **No `deploy` or `preview` npm scripts.** The Deploy flow pre-fills commands from `package.json` scripts; a `vite preview` server next to a "Preview command" is a footgun.

## Verified

| Claim | Source | Status |
|---|---|---|
| Button URL, subdirectory allowed, must be self-contained, becomes the new repo root | [Deploy buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) | CONFIRMED (docs) |
| Secrets prompted from `.dev.vars.example`; descriptions from `package.json` `cloudflare.bindings`; build/deploy commands pre-filled | same | CONFIRMED (docs) |
| `send_email` isn't in the auto-provisioned list | same | CONFIRMED (docs); deploy behavior UNVERIFIED |
| `_headers`/`_redirects` on Workers assets, host rules, not applied to Worker-made responses | [Headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/) | CONFIRMED (docs + local) |
| `404-page`, `run_worker_first` arrays, `env.ASSETS.fetch` applies 404 handling | [SSG and 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/), [Binding](https://developers.cloudflare.com/workers/static-assets/binding/) | CONFIRMED (docs + local) |
| Asset requests free and unlimited; code runs 100,000/day on Free | [Pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) | CONFIRMED (docs) |
| Branch builds run `npx wrangler preview` by default (Wrangler ≥ 4.135); PR comment with Preview URL; `workers.dev` previews send `noindex`; previews don't inherit settings | [Build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/), [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/), [Previews](https://developers.cloudflare.com/workers/previews/) | CONFIRMED (docs) |
| Sends to verified destinations free on all plans, only from routing domains; arbitrary recipients need Workers Paid | [Pricing](https://developers.cloudflare.com/email-service/platform/pricing/), [Limits](https://developers.cloudflare.com/email-service/platform/limits/) | CONFIRMED (docs) |
| Local `send_email` simulation in `wrangler dev` | [Local development](https://developers.cloudflare.com/email-service/local-development/sending/) | CONFIRMED (docs + local) |
| "Enable Email Routing with a verified address before you can bind an email address" | [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) | wording CONFIRMED; effect on an unrestricted binding UNVERIFIED |
| `keep_vars`; deploys never delete secrets | same | CONFIRMED (docs) |
| Custom domains need an active Cloudflare zone and no existing CNAME; Workers can't use outside DNS, Pages can (subdomain CNAME); `send_email` not on Pages | [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) | CONFIRMED (docs) |
| Pages ignores a Wrangler file without `pages_build_output_dir` | [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) | CONFIRMED for `wrangler pages deploy`; Git builds PLAUSIBLE |
| Dashboard rollback | [Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/) | CONFIRMED (docs) |

**Local evidence** (Wrangler 4.147.0, no login, fresh scaffold from `new-site.mjs`, `npm run setup < /dev/null`):

- `new-site.mjs` set `"name": "v2site"` in `wrangler.jsonc`. Typecheck, build, `check-images` pass. Build output includes `images/share.jpg`, `favicon-32.png`, `apple-touch-icon.png`, `favicon.svg`, the self-hosted fonts.
- `wrangler dev`: `/`, `/privacy-policy/`, `/terms-of-service/`, `/?closures` 200; all six security headers (incl. HSTS and CSP) on `/` and on the 404; `/no-such-page` 404 with `404.html` both as a navigation and a plain fetch; `/home` 301; `/privacy-policy` 307 to the slash; fonts and hashed assets `immutable`, images `max-age=0, must-revalidate`; `/_headers` and `/_redirects` 404.
- Closures: with a `site.closedOn` entry next year, the served page carries `data-closed-on` and the `.closure` notice; headless Chrome shows it `hidden` at `/` and visible at `/?closures`.
- Hostnames: `my-website.acct.workers.dev`, `saturday-hours-my-website.acct.workers.dev`, `my-site.pages.dev` get `X-Robots-Tag: noindex`; `www.maplestreetbakery.com` doesn't.
- Contact, no settings: `GET` `{"ready":false}`; valid post 503; honeypot and `elapsed` 800 both `{"ok":true}`; empty name 400 (validation before bot checks); `null` and non-JSON bodies 400; bad email 400; 70 KB body 413; `PUT` 405 with `Allow`.
- With `.dev.vars` `CONTACT_TO_EMAIL`: own-domain host `{"ready":true}`, workers.dev host `{"ready":false}` and post 503; own-domain post 200 and Wrangler logged `send_email binding called with MessageBuilder: From: "Website contact form" <noreply@maplestreetbakery.com> To: owner@example.net`, a BEL/CR/LF in the name flattened to one line.
- Without the binding: ready false, 503. A refused send (simulated in Node; the local simulator never refuses): 502 and `Email Routing refused the message (E_RECIPIENT_NOT_ALLOWED)` logged.
- `npm run audit` 8/8 under `wrangler dev`; `check-tricky-config` all passed.

## Live smoke test (fresh GitHub and Cloudflare accounts, in order)

1. **Push and point** at `https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/phase-1-workers-v2/template`.
2. **Deploy page:** record every field; the private/public choice and its default; whether `CONTACT_TO_EMAIL` shows its description, accepts empty, or is required; how the `EMAIL` binding appears; pre-filled build (`npm run build`) and deploy (`npx wrangler deploy`) commands; any workers.dev subdomain prompt.
3. **First deploy with `send_email` on an account with no zone and no Email Routing.** If it fails on the binding: remove it from `wrangler.jsonc` (the code already degrades) and add it by pull request at email setup. Most important test.
4. **New repo contents:** can the Cloudflare GitHub App create the repository when it's installed with **Only select repositories** (or does it need all repositories, or ask again)? Root is `template/`'s contents incl. `.github/workflows/ci.yml` (cloning `.github/` needs the App's `workflows` permission: record whether the file arrived or the clone failed), `.node-version`, `.dev.vars.example`; `wrangler.jsonc` name matches and comments survived; default branch `main`; visibility. Then run `SETUP.md` box 4 and create the ruleset.
5. **Build settings:** production branch `main`, **Enable Preview Builds** on, Preview command `npx wrangler preview`; the build image honors `.node-version` (Node 22) and loads `sharp` (share image and icons generated); build time. Then clear the **Build command** box and push: does `npx wrangler deploy` still build `dist/` through `build.command` in `wrangler.jsonc`, for production and for a preview?
6. **Free address:** `npm run audit https://<name>.<account>.workers.dev` all pass, including `noindex` and the http to https redirect on `workers.dev`; `GET /api/contact` `{"ready": false}` (workers.dev never sends).
7. **Loop with Claude:** setup prompt, first version to `main`, lock, a branch change. Cloudflare PR comment with a Preview URL `<branch>-<name>.<account>.workers.dev`, stable across pushes, `noindex`, form says "email us directly"; `?closures` works there; squash merge deploys in about a minute; "undo that" revert; dashboard **Rollback**. Repeat with a Claude-in-the-cloud branch (`claude/<slug>-<id>`) and a 40-character one; record how each maps to the preview name and what happens past the 63-character `<preview>-<name>` limit. Repeat once on the browser-only path.
8. **Loop with ChatGPT (Codex cloud)** on a second fresh Deploy-made repo: does Codex accept the repository as is (it already has files and a README, so Phase 0's "Add README" step shouldn't be needed)? Does setup run without the environment's internet switch (the Deploy path doesn't need the toolkit unless `ci.yml` is missing), or is internet with **Package managers** still needed for `npm install` and the build check? Then the pull-request-only flow: **Create PR**, the Workers Builds comment and Preview URL on that page, **Squash and merge** deploys, the undo merged the same way; and how Codex's branch names (`codex/...`) map to the 63-character preview name.
9. **Domain:** buy one in Cloudflare Registrar; add apex and `www` as custom domains; ship a change and confirm both survive; check **Always Use HTTPS** default; audit (must not be noindex); share image and `og:` tags with absolute URLs.
10. **Email:** record the real dashboard path to Email Routing (the docs say **Compute** → **Email Service** → **Email Routing**; the guides also mention the older domain → **Email**). Email Routing on, Gmail destination verified and equal to `CONTACT_TO_EMAIL`, AI turns `contactForm` on, test message arrives (From `noreply@<domain>`, Reply-To the visitor, SPF/DKIM/DMARC pass in "Show original"). Unverified address → 502 and a logged code. Mailbox case: a second domain with outside MX, Email Routing on a **subdomain only**, apex MX untouched, `CONTACT_FROM_EMAIL=website@mail.<domain>`, send.
11. **Stats:** Web Analytics → Add a site → the domain (automatic). From a real phone browser: the beacon is injected into Worker-served responses (page source), visits counted for apex and `www`, 404s too. `npm run audit` may not see the beacon (Node isn't a browser).
12. **Preview isolation:** with `CONTACT_TO_EMAIL` set in production, a preview still can't send.
13. **Rescue path** (`docs/keep-your-dns.md`) on a domain whose DNS stays elsewhere: the Pages Git build skips `wrangler.jsonc` (log line, no failure), the Worker deleted and its `workers.dev` address gone, `www` by CNAME, `pages.dev` previews `noindex`, Pages Metrics analytics, form off.
14. **Empty-repo opening:** `AI-SETUP.md` Step 1 plus Create application → Import a repository; check the "name must match" failure message if mistyped.

## Domains and nameservers

Workers custom domains need the domain to be an **active Cloudflare zone**: nameservers on Cloudflare, or bought from Cloudflare Registrar. There is no CNAME-only option on the free plan (Pages had one for subdomains). So for owners with a domain elsewhere, the careful nameserver move in `domains-and-dns.md` goes from "recommended" to "required." Hostnames with an existing record (often `www` pointing at an old site) need that record deleted first. Email Routing, and so the contact form, needs the zone on Cloudflare too.

## The Pages rescue path

`template/docs/keep-your-dns.md`: same repository, hosted by Cloudflare Pages. Pages ignores `wrangler.jsonc`, builds `dist/`, and applies the same `_headers` (its `pages.dev` rules are kept for this) and `_redirects`. `www` is attached with one CNAME at the current DNS; the bare domain forwards at the registrar. The contact form is off (no `send_email` on Pages, no Email Routing without the zone); stats use the Pages project's one-click switch. Moving to Workers later is the nameserver move plus `docs/upgrading.md`.

## Risks, most serious first

1. **The Deploy flow may reject the `send_email` binding** on an account without Email Routing (smoke test 3). Fallback ready.
2. **The new repo may be private, or miss `.github/workflows/ci.yml`** (smoke test 4). `SETUP.md` box 4 and `AI-SETUP.md`'s one-tap link cover both.
3. **Nameserver move becomes mandatory** for outside domains: the riskiest step for a non-technical owner's email. AI-guided, with the rescue page.
4. **Workspace/M365 domains rely on subdomain Email Routing** (smoke test 10).
5. **Auto-injected analytics on Workers** rests on docs plus one public report (smoke test 11). If it fails, the fallback is the manual snippet in the pages, registered for the custom domain (a snippet only counts its own apex).
6. **Long auto-named branches** vs the 63-character preview label (smoke tests 7 and 8).
7. **Workers Previews is new** (mid-2026); dashboard labels and PR comment wording may shift.
8. **`CONTACT_TO_EMAIL` mismatch** between the Deploy page and the inbox verified later: only the test message catches it.
9. **Always Use HTTPS** may be off on new zones; a setup step now turns it on.
10. **Bots on missing URLs run the code** (non-navigation 404s count toward 100,000/day); past it they get 429s, pages are unaffected.
11. **Merge timing:** the button points at `main/template`; merging before the smoke test points every new owner at an unproven flow.
12. **The toolkit CI's `wrangler dev` step** has only run on macOS, not GitHub's Ubuntu runners.

## Open decisions for Dave

1. `send_email` in the template from day one (current), or added by pull request at email setup (safer first deploy)?
2. Ask for `CONTACT_TO_EMAIL` on the Deploy page (current), or keep that page question-free?
3. Confirm dropping Resend entirely?
4. Pin the button to a release tag instead of `main`?
5. Keep the Pages rescue path supported?

## Before merging Phase 1

- Re-render `template/docs/assets/end-to-end.mp4` (`python3 scripts/make-end-to-end-video.py`) with the Deploy to Cloudflare opening: its storyboard still shows Phase 0's empty-repo-plus-setup-link start. Update its scene strings, regenerate, check frames, and re-upload both videos as GitHub attachments if the README embeds them inline.
- Re-check README, START-HERE and setup-guide screenshots against the live Deploy flow.
