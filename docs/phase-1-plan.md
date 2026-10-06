# Phase 1: from Cloudflare Pages to Cloudflare Workers

Status: **prototype on branch `phase-1-workers`**, verified locally, not yet smoke-tested on live accounts. Written October 5, 2026. Platform facts below were checked against developers.cloudflare.com on that date; Cloudflare moves fast, so re-check anything marked UNVERIFIED before launch.

## Why

Two wins, both about owners who have no helper:

1. **A Deploy to Cloudflare button.** One click clones `template/` into the owner's GitHub, creates the Cloudflare site, connects the build (Workers Builds), and asks for the one setting. No empty repository, no AI copying files, no Cloudflare "Pages vs Worker" fork in the road, no hidden-file upload trap for browser-only owners. It works the same whichever AI the owner uses, because the AI's first job becomes "read `AGENTS.md`, work through `SETUP.md`." The button only supports Workers applications, not Pages ([Deploy buttons, Limitations](https://developers.cloudflare.com/workers/platform/deploy-buttons/)).
2. **A contact form with no key.** The `send_email` binding sends to the owner's verified Email Routing address for free, on every plan, with no Resend account ([Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).

## What changed

**Template machinery**

| File | Change |
|---|---|
| `template/wrangler.jsonc` | New. `assets.directory: ./dist`, `binding: ASSETS`, `not_found_handling: 404-page`, `run_worker_first: ["/api/*"]`, `send_email: [{name: EMAIL}]` (unrestricted), `workers_dev: true`, `keep_vars: true`, `observability.enabled`, empty `previews: {}`. |
| `template/src/worker.ts` | New (about 100 lines, no dependencies). `POST /api/contact` sends via `env.EMAIL.send()` from `CONTACT_FROM_EMAIL` or `noreply@<host without www.>` to `CONTACT_TO_EMAIL`, `replyTo` the visitor. Same honeypot, timer, and validation as the old Pages Function. Missing binding, missing or malformed `CONTACT_TO_EMAIL`, or a thrown send all return the same friendly 503. `GET /api/contact` returns `{"ready": bool}`. Everything else falls through to `env.ASSETS.fetch()` (404.html). |
| `template/functions/` | Deleted (Pages-only). |
| `template/.dev.vars.example` | New. Declares `CONTACT_TO_EMAIL` so the Deploy button asks for it. |
| `template/package.json` | `wrangler ^4.147.0` added, `@cloudflare/workers-types` bumped to match its peer range. `cloudflare.bindings` descriptions for the Deploy page. `preview` script (`vite preview`) replaced by `serve` (`vite build && wrangler dev`). |
| `template/public/_headers` | `https://:name.:account.workers.dev/*` gets `X-Robots-Tag: noindex` (covers the starter address and `<preview>-<name>.<account>.workers.dev` preview links). The two `pages.dev` rules stay, for the Pages fallback. |
| `template/plugins/site-config.ts`, `site.config.json`, `site.schema.json` | Unused `integrations.resend` removed. New optional `integrations.cloudflareAnalyticsToken`; when set and `features.analytics` is on, the build injects the Web Analytics beacon into every page. |
| `template/src/main.ts` | Generic form error now says "please call or email us directly" (covers hosts with no Worker, like the Pages fallback). |
| `template/scripts/setup.mjs`, `audit-site.mjs` | No more Resend prompt. The audit treats `*.workers.dev` as a free/preview host and reports contact form readiness from `GET /api/contact`. |
| `.github/workflows/ci.yml` (toolkit) | The scaffolded site is now audited under `wrangler dev` (real 404s, headers, redirects, the Worker), plus three contact form and noindex assertions. |

**Docs and AI rules:** `template/rules/deploy.md`, `rules/email.md` (rewritten), `rules/analytics.md`, `traps.md`, `safety.md`, `seo.md`, `supabase.md`, `checkup.md`, `AGENTS.md`, `SETUP.md` (now 6 steps, box 1 is the Deploy button), `features/contact-form.md`, `docs/setup-guide.md` (new opening: accounts, Deploy, check public, connect AI, AI interviews), `docs/api-keys.md` (now "no keys"), `docs/domains-and-dns.md` (nameserver requirement and the Pages fallback), `docs/browser-only.md` (Deploy button replaces the ZIP upload and the Pages connection), toolkit `README.md` (button), `AI-SETUP.md` (two openings), `START-HERE.md`, `llms.txt`, `docs/the-12-dollar-stack.md`, `docs/for-agencies.md`, `docs/upgrading.md` (Pages to Workers migration), `docs/pressure-test.md`.

**Deploy button markup** (in `README.md`, `setup-guide.md`, `browser-only.md`):

```md
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/main/template)
```

To test before merging, push this branch and use `.../tree/phase-1-workers/template`.

## Decisions and why

- **No Resend fallback.** The point of Phase 1 is "no third-party account, no key." A dormant second send path doubles the docs, the AI rules, and the test matrix for a minority case. The two cases it would cover: (1) domains with existing mailboxes, which get Email Routing on a **subdomain** instead ([Subdomains](https://developers.cloudflare.com/email-service/configuration/subdomains/)) plus `CONTACT_FROM_EMAIL`; (2) the Pages fallback, where the form is simply off. If smoke test 9 shows subdomain routing can't coexist with Workspace/M365 on the apex, re-adding Resend is about 15 lines in `worker.ts` behind an optional `RESEND_API_KEY` secret. Decision for Dave below.
- **`CONTACT_TO_EMAIL` is a secret, asked for at deploy time.** A `vars` value or `destination_address` would put the owner's personal inbox in a public repo. Secrets survive every deploy ([Wrangler config, source of truth](https://developers.cloudflare.com/workers/wrangler/configuration/)), and the Deploy page prompts for anything in `.dev.vars.example` ([Deploy buttons, Worker environment variables and secrets](https://developers.cloudflare.com/workers/platform/deploy-buttons/)). Not `secrets.required`: that makes `wrangler deploy` fail when it's missing ([secrets configuration property](https://developers.cloudflare.com/workers/wrangler/configuration/)).
- **Unrestricted binding.** It can only reach verified destination addresses anyway; restricting it would mean committing addresses.
- **Empty `previews` block.** New Workers Builds projects build non-production branches with `wrangler preview`, which needs a `previews` block (it can be empty) and never inherits production settings ([Previews configuration](https://developers.cloudflare.com/workers/previews/configuration/)). So previews have no email and no secrets, exactly like the old "Production only" rule on Pages.
- **`keep_vars: true`.** Without it, a plain-text variable typed in the dashboard (say `CONTACT_FROM_EMAIL`) is wiped by the next deploy ([source of truth](https://developers.cloudflare.com/workers/wrangler/configuration/)).
- **`workers_dev: true` explicitly.** If anyone ever adds `routes`, Wrangler silently turns `workers.dev` off unless this is set ([workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)).
- **Custom domains are added in the dashboard, not in `wrangler.jsonc`.** CONFIRMED in Wrangler 4.147's source: `triggersDeploy` only publishes routes or custom domains when the config lists them, so a deploy never touches dashboard-added domains.
- **No `deploy` or `preview` npm scripts.** The Deploy flow pre-fills its commands from `package.json` scripts ([Deploy buttons, Best practices](https://developers.cloudflare.com/workers/platform/deploy-buttons/)); a `preview` script running `vite preview` (a server that never exits) is a footgun next to a "Preview command."
- **Web Analytics by token.** Docs offer one-click only for Pages; Workers sites get the manual snippet, or automatic injection once the hostname is proxied ([Web Analytics, Get started](https://developers.cloudflare.com/web-analytics/get-started/)). The token works on `workers.dev`, custom domains, and the Pages fallback alike, so it's one path. The owner turns it on with the domain.

## What was verified, and how

| Claim | Source | Status |
|---|---|---|
| Button URL format, subdirectory allowed, subdirectory must be self-contained and becomes the new repo root | [Deploy buttons](https://developers.cloudflare.com/workers/platform/deploy-buttons/) | CONFIRMED (docs) |
| Secrets prompted from `.dev.vars.example` / `.env.example`; binding descriptions from `package.json` `cloudflare.bindings` | same | CONFIRMED (docs) |
| Build/deploy commands pre-filled from `package.json`; default deploy `npx wrangler deploy` | same | CONFIRMED (docs) |
| `send_email` is not in the auto-provisioned resource list | same | CONFIRMED (docs); behavior at deploy UNVERIFIED |
| `_headers` and `_redirects` work on Workers static assets, absolute-URL host rules, placeholders, 100 header rules, not applied to Worker-generated responses | [Headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/) | CONFIRMED (docs + local) |
| `not_found_handling: 404-page` serves nearest `404.html` with 404 | [SSG and 404 pages](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/) | CONFIRMED (docs + local) |
| `run_worker_first` array patterns; unmatched non-navigation requests still reach the Worker; `env.ASSETS.fetch` applies `not_found_handling` | [Binding](https://developers.cloudflare.com/workers/static-assets/binding/), [Worker script](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/) | CONFIRMED (docs + local) |
| Static asset requests are free and unlimited; Worker runs 100,000/day on Free | [Pricing](https://developers.cloudflare.com/workers/platform/pricing/), [Billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) | CONFIRMED (docs) |
| Preview builds run `npx wrangler preview` by default for new Workers; Wrangler ≥ 4.135 | [Build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/), [Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Previews](https://developers.cloudflare.com/workers/previews/) | CONFIRMED (docs) |
| PR comment with the Preview URL on GitHub; same URL across pushes | [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) | CONFIRMED (docs) |
| `workers.dev` Preview URLs carry `X-Robots-Tag: noindex` | [Previews, URLs](https://developers.cloudflare.com/workers/previews/) | CONFIRMED (docs) |
| Previews don't inherit production settings or secrets | [Previews configuration](https://developers.cloudflare.com/workers/previews/configuration/) | CONFIRMED (docs) |
| Sends to verified destination addresses are free on all plans with only Email Routing; only from routing domains; arbitrary recipients need Workers Paid | [Pricing](https://developers.cloudflare.com/email-service/platform/pricing/), [Limits](https://developers.cloudflare.com/email-service/platform/limits/) | CONFIRMED (docs) |
| `send_email` restriction attributes (`destination_address`, `allowed_destination_addresses`, `allowed_sender_addresses`) | [Send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/) | CONFIRMED (docs) |
| `wrangler dev` simulates `send_email` locally (logs, writes text files), `remote: true` sends for real | [Local development, sending](https://developers.cloudflare.com/email-service/local-development/sending/) | CONFIRMED (docs + local) |
| Wrangler config page says Email Routing must be enabled with a verified address "before you can bind an email address" | [Wrangler configuration, Email bindings](https://developers.cloudflare.com/workers/wrangler/configuration/) | CONFIRMED wording; effect on an unrestricted binding at deploy UNVERIFIED |
| `keep_vars` keeps dashboard variables; secrets are never deleted by deploy | [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) | CONFIRMED (docs) |
| Custom domains need an active Cloudflare zone; no CNAME may exist on the hostname; Workers can't use domains outside Cloudflare zones, Pages can (subdomain CNAME) | [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Migrate from Pages](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/), [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) | CONFIRMED (docs) |
| Email Workers (`send_email`) not available on Pages | [Migrate from Pages, compatibility matrix](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) | CONFIRMED (docs) |
| Pages ignores a Wrangler file without `pages_build_output_dir` | [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) | CONFIRMED for `wrangler pages deploy` (docs); for Git builds PLAUSIBLE |
| Web Analytics one-click is a Pages feature; others use snippet or proxied auto-setup | [Web Analytics, Get started](https://developers.cloudflare.com/web-analytics/get-started/) | CONFIRMED (docs) |
| Rollback from dashboard Deployments | [Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/) | CONFIRMED (docs) |

**Local evidence** (Wrangler 4.147.0, no Cloudflare login, scaffolded site in a scratch folder):

- `npm run typecheck` and `npm run build` pass; `wrangler deploy --dry-run` bundles the Worker (2.85 KiB) and lists `env.EMAIL (unrestricted)` and `env.ASSETS`.
- `wrangler dev`: `/` 200 with all four security headers; `/no-such-page` 404 with `404.html` both as a browser navigation and as a plain fetch (headers applied on both); `/home` 301 to `/`; `/privacy-policy` 307 to `/privacy-policy/`; hashed CSS `Cache-Control: public, max-age=31536000, immutable`; `Host: my-website.acct.workers.dev` and `Host: saturday-hours-my-website.acct.workers.dev` get `X-Robots-Tag: noindex`; `Host: www.maplestreetbakery.com` does not; `/_headers` and `/_redirects` are 404.
- Contact, no `CONTACT_TO_EMAIL`: `GET` `{"ready":false}`; valid `POST` 503 with the friendly message; honeypot and too-fast both `{"ok":true}` (nothing sent); bad email 400; non-JSON 400; `PUT` 405 with `Allow: GET, POST`.
- Contact with `.dev.vars` `CONTACT_TO_EMAIL`: `{"ready":true}`; `POST` with `Host: www.maplestreetbakery.com` 200, and Wrangler logged `send_email binding called with MessageBuilder: From: "Website contact form" <noreply@maplestreetbakery.com> To: owner@example.net`; a CR/LF injection attempt in the name was flattened to one line in the subject.
- Config without the binding: `{"ready":false}`, `POST` 503.
- A send that throws (`E_SENDER_NOT_VERIFIED`, simulated in Node because the local simulator never rejects): logged with its code, 503 friendly.
- `npm run audit http://127.0.0.1:<port>`: 8/8 checks pass under `wrangler dev`.
- Analytics: a 32-character token injects the beacon into all pages; an empty or malformed token (quotes, angle brackets) injects nothing.

## Live smoke test (fresh accounts, in this order)

Use a brand-new GitHub account and a brand-new Cloudflare account, on a phone where possible. Record screenshots of every Cloudflare screen for the docs.

1. **Push and point.** Push `phase-1-workers`. Open `https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/phase-1-workers/template`.
2. **Deploy page.** Note every field shown: project name, repository name, private/public choice and its default, `CONTACT_TO_EMAIL` prompt (does the description from `package.json` show? is an empty value accepted? is the field required?), how the `EMAIL` (`send_email`) binding is presented, prefilled build command (`npm run build`), deploy command (`npx wrangler deploy`), any workers.dev subdomain prompt.
3. **First deploy with `send_email` on an account with no zone and no Email Routing.** Does it succeed? If it fails on the binding, remove `send_email` from `wrangler.jsonc` (the code already degrades without it) and move "add the binding" into the email setup step as a pull request. This is the single most important test.
4. **New repository contents.** Root is `template/`'s contents; `.github/workflows/ci.yml`, `.node-version`, `.gitignore`, `.dev.vars.example` all present (the GitHub App may lack `workflows` permission); `wrangler.jsonc` `name` matches what was typed and its comments survived; default branch is `main`; visibility. Make it public if needed and confirm the ruleset in setup guide Step 6 can be created.
5. **Build settings.** Worker → Settings → Build: production branch `main`, **Enable Preview Builds** on, Preview command `npx wrangler preview`, Node version used (from `.node-version`), build time.
6. **Free address.** `npm run audit https://<name>.<account>.workers.dev`: all pass, including `X-Robots-Tag: noindex` and http to https. `GET /api/contact` returns `{"ready": true}` if an address was entered.
7. **Preview loop.** With Claude (claude.ai/code) on the repo: setup prompt from the setup guide, first version to `main`, lock, then a change on a branch. Check: Cloudflare PR comment appears with a Preview URL of the form `<branch>-<name>.<account>.workers.dev`; it's stable across a second push; `curl -sI` shows `X-Robots-Tag: noindex`; the form there says "email us directly"; Cloudflare check run passes; squash merge deploys to production in about a minute; "undo that" revert works; dashboard **Rollback** works. Repeat with a long branch name (Claude in the cloud style, `claude/xxxxxxxx-...`, and a 40-character one) and record what the preview name becomes. Repeat the loop once with ChatGPT Codex.
8. **Domain on Cloudflare.** Buy a cheap domain in Cloudflare Registrar. Add apex and `www` as custom domains in the dashboard. Ship another change and confirm both domains survive the deploy. Check **Always Use HTTPS** default; audit the domain (must not be noindex).
9. **Email.** Enable Email Routing on the domain, verify a Gmail destination equal to `CONTACT_TO_EMAIL`, send from the live form: arrives, From `noreply@<domain>`, Reply-To the visitor, not in spam, SPF/DKIM/DMARC pass in Gmail's "Show original." Then: change `CONTACT_TO_EMAIL` to an unverified address and confirm the friendly 503 plus a logged `E_RECIPIENT_NOT_ALLOWED` (or whatever code) in Observability. Then the mailbox case: a second domain with MX records for an outside provider; enable Email Routing for a **subdomain only** and confirm the apex MX records are untouched, set `CONTACT_FROM_EMAIL=website@mail.<domain>`, send.
10. **Visitor stats.** Web Analytics → Add a site → the domain → copy token → `cloudflareAnalyticsToken` PR → ship. Data appears for both apex and `www`? Does Cloudflare also offer automatic injection for the proxied hostname, and does that double count with the token?
11. **Preview isolation.** Confirm a preview cannot send email even after `CONTACT_TO_EMAIL` is set in production (it should say "email us directly").
12. **Pages fallback.** On a domain whose DNS stays at another registrar: create a Pages project from the same repo (build `npm run build`, output `dist`), confirm the build ignores `wrangler.jsonc`, disconnect Workers Builds, attach `www` by CNAME, confirm `pages.dev` previews are noindexed and the form shows phone and email with `contactForm: false`.
13. **Fallback opening.** Empty repo + AI-SETUP.md + Workers & Pages → Create application → Import a repository, to check the manual path and the "name must match" error message.

## Domains and nameservers

Workers custom domains require the domain to be an **active Cloudflare zone**, which means nameservers on Cloudflare (or Cloudflare Registrar). There is no CNAME-only option on the free plan; Pages had one for subdomains. Consequences:

- Owners who buy the domain from Cloudflare: nothing changes, it's simpler than before.
- Owners with a domain elsewhere: moving nameservers goes from "recommended" to "required." The existing careful flow (screenshot records, MX check, DNSSEC off, compare imported records, switch outside business hours) is unchanged and now sits in front of every such launch.
- Hostnames with an existing CNAME (often `www` pointing at an old site) must have that record deleted before the custom domain can be added.
- Email Routing, and therefore the contact form, also needs the zone on Cloudflare, as before.

## The Pages fallback (owners who won't move nameservers)

Same repository, hosted by Cloudflare Pages instead: Pages ignores `wrangler.jsonc`, builds `dist/`, applies the same `_headers` (whose `pages.dev` rules are kept for exactly this) and `_redirects`, and attaches `www.<domain>` with one CNAME at the owner's current DNS. The bare domain forwards at the registrar. Costs: no contact form email (turned off), no Email Routing. The preview loop, ship it, undo, and stats all still work. Steps are in `template/docs/domains-and-dns.md`, "Keeping your DNS where it is," and the AI-side differences in `rules/deploy.md`. Moving to Workers later is just the nameserver move plus the `docs/upgrading.md` migration.

## Risks, most serious first

1. **The Deploy flow may reject or mishandle the `send_email` binding** on an account with no Email Routing (smoke test 3). Mitigation ready: drop the binding from the template and add it by pull request at email setup.
2. **The new repository may be private by default, or miss `.github/workflows/ci.yml`** (smoke test 4). Private breaks the free ruleset lock on GitHub Free. Mitigations: setup guide Step 3, and the one-tap CI file link already in `AI-SETUP.md`.
3. **Mandatory nameserver move** for owners with outside domains raises the stakes of the riskiest step (email outage). The flow is documented and AI-guided, and the Pages fallback exists, but it's still the scariest moment for a non-technical owner.
4. **Owners with Workspace/M365 on the apex** rely on subdomain Email Routing, UNVERIFIED (smoke test 9). If it fails, those owners get no form until Resend comes back or they accept "email us directly."
5. **Long auto-generated branch names** may break or truncate preview names (63-character DNS label limit on `<preview>-<worker>`) (smoke test 7).
6. **Workers Previews is new** (mid-2026). Behavior, dashboard labels, and PR comment wording may shift; the rules lean on "Preview URL" wording.
7. **`CONTACT_TO_EMAIL` mismatch:** typed at deploy, verified later, possibly different. Docs say "same inbox" in three places and the audit can't detect it; only the test message does.
8. **Always Use HTTPS may be off** on new zones, leaving `http://` pages unredirected and failing the audit. Setup step added.
9. **Bots on missing URLs invoke the Worker** (non-navigation requests), counting toward 100,000/day; past it they get 429s instead of 404s. Pages are never affected (assets are free and unlimited).
10. **Analytics token hostname scope** unknown (smoke test 10).
11. **Docs merge timing:** the button URL points at `main/template`. Merging this branch before the smoke test passes would point every new owner at an unproven flow, and the Phase 0 Pages docs on `main` are the current truth until then.
12. **Toolkit CI's `wrangler dev` step** has only run on macOS, not on a GitHub Ubuntu runner.

## Open decisions for Dave

1. **`send_email` in the template from day one** (zero-step form once email is set up) or **added by pull request at email setup** (safer Deploy)? Default in this branch: day one; flip if smoke test 3 fails.
2. **Ask for `CONTACT_TO_EMAIL` on the Deploy page,** or keep the Deploy page question-free and set it at email setup?
3. **Confirm dropping Resend** entirely, or keep it as an optional fallback for Workspace/M365 domains and the Pages fallback?
4. **Pin the button to a release tag** (`/tree/v1/template`) instead of `main`, so a bad commit on `main` can't break every new owner's first click?
5. **Keep the Pages fallback documented and supported,** or tell owners who won't move nameservers that this toolkit isn't for them?
6. **Analytics:** token in `site.config.json` (this branch), or rely on Cloudflare's automatic injection for proxied domains if smoke test 10 shows it works on Workers?
7. **Re-record `template/docs/examples.md`'s audit transcript and the two videos** against a live Workers demo after the smoke test (left untouched: they show a real Pages run).
