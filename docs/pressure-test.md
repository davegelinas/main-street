# Pressure test: the adversarial review

This document records what happens when the system is used badly, interrupted, neglected, or attacked. Every test below was actually run (or, where marked, reviewed by reading the docs as a stranger would). Fixes are listed with what changed; unresolved findings carry a one-line rationale. Last run: **2026-09-27**, against a fresh scaffold (`new-site.mjs` → `npm install` → `npm run setup` → preset → build → audit: **8/8**).

## Phase 1 prototype (not yet live-tested): Workers and keyless email

The template moves from Cloudflare Pages to Cloudflare Workers static assets, setup starts with a Deploy to Cloudflare button, and the contact form sends through Cloudflare Email Routing with no Resend key. Where the sections below talk about Pages, `pages.dev`, or Resend, they describe the model they tested. What changes for abuse: the form can only email the owner's own verified inbox, so there's no third-party quota to burn, and past the free 100,000 code runs a day only the form stops, never the pages. Evidence and the live checklist: [phase-1-plan.md](phase-1-plan.md).

## Update 2026-10-05: setup and shipping redesign

Findings and changes since the 2026-09-27 run. Earlier sections are history and are not rewritten; where they describe the old model they are marked superseded.

- **Staging branch replaced by one pull request per change.** Every change gets its own branch, pull request, and Cloudflare preview link. "Ship it" merges that pull request; "undo that" prepares a revert as a new preview. No shared staging site, no staging subdomain.
- **noindex moved from a per-request Function to `_headers`.** The free `pages.dev` address and preview links are hidden from Google by static headers; the middleware Function is gone.
- **`_headers` comment block fixed.** A comment block in `_headers` was likely parsed as a rule, so the security headers may not have applied. It is fixed.
- **`CF_ANALYTICS_TOKEN` removed.** Visitor stats are one click in the Cloudflare dashboard (Enable Web Analytics). No key.
- **Photo GPS stripping.** `npm run optimize-images` strips hidden location data (script), and CI strips it on every change, because the repo is now public.
- **Public repos with a ruleset on `main`.** Only public repos get GitHub's free ruleset: require a pull request, block force pushes and deletion, empty bypass list. Replaces the old branch-protection advice.
- **`AGENTS.md` is the single manual.** `CLAUDE.md` is a pointer to it.
- **Owner-alone, AI-driven setup.** `AI-SETUP.md` and `SETUP.md` let the owner's own AI run setup in about two hours, much of it waiting; a helper is optional. Free plans use the slower browser-only path.
- **Contact form only sends from the verified domain,** so it needs the owner's own domain and is tested on the live site, never on a preview or `pages.dev`.
- **Dashboard rollback must be followed by a revert,** or the next ship re-publishes the bad change. It is a helper's emergency brake, not the owner's undo.

## Robustness tests

### Setup wizard vs. hostile input

| Test | Result |
|---|---|
| All answers empty (just press Enter) | PASS: every prompt falls back to its default; config written unchanged. |
| Emoji / Unicode business name (`🔧 Acme Plumbing 🔧`) | PASS: accepted and stored; JSON and the build handle Unicode natively. |
| 200-character business name | **FIXED**: was silently accepted (would have broken the header layout). The wizard now rejects names over 80 characters with a plain-language message and re-prompts. |
| Invalid email, then corrected | PASS: reprompts with "That does not look like an email address, try again." No infinite loop: any valid entry moves on. |
| Invalid domain, then corrected | PASS: same reprompt pattern; `www.`/`https://` prefixes are stripped automatically. |
| Ctrl-C mid-run, then rerun | PASS: the wizard writes `site.config.json` only at the very end, so interrupting leaves the previous config byte-identical (verified by checksum). Rerunning starts clean. |

### Broken states

| Test | Result |
|---|---|
| Corrupt `site.config.json` (invalid JSON) → `npm run build` | **FIXED**: was a raw Vite stack trace. The build plugin now throws a plain-language error first: what happened, the likely cause (stray comma or quote), and that the last working version is in git. |
| Deleted `site.config.json` → `npm run build` | **FIXED**: same fix: "site.config.json is missing from the site folder… the last working version is saved in git." |
| Missing images (referenced file deleted) | Build still passes; the page shows a broken image. **Not fixed** (see rationale below). |
| Feature enabled with no real content (gallery/testimonials on, placeholders intact) | **PARTIALLY FIXED**: the audit now prints a non-failing INFO line naming the placeholder phrases found ("Your photo here", "Example service", …) and telling the owner to replace them before shipping. It doesn't block the build: blocking would punish legitimate in-progress work. |
| `npm run build` with no `node_modules` | npm prints its own jargon (`vite: not found`). **Not fixed** (see rationale below). |

### The Saturday 9pm test

*Superseded 2026-10-05: there is no staging branch any more, and the owner's undo is saying "undo that" to their AI (the dashboard rollback is a helper's emergency brake, always followed by a revert). See the update section below. The original run is kept as written.*

Scenario: the owner broke something at 9pm on a Saturday, no developer reachable, docs only.

1. **Template README → "Made a mistake?"**: one-click Cloudflare rollback (Deployments → Rollback), no terminal. Discoverable from the README's first-week checklist.
2. **Rollback discoverability**: in the template README's "Made a mistake?" section (part of the first-week checklist) and in `docs/owner-quickstart.md`'s Undo entry. Two independent paths to the same answer; the AI also teaches the rollback line every time it ships.
3. **"What just changed?"**: every change went through the staging loop, so the owner can open the staging link and compare. Git history exists as a last resort, via the AI ("what changed in the last update?").

Verdict: a panicking non-technical owner can get the site back in under 5 minutes with docs alone. The weak link is step 0: the owner has to *remember the README exists*. Mitigation: the golden loop is simple enough to remember ("preview first, ship it after"), and the rollback path is in the first-week checklist they already read.

### Zero-skill documentation walkthrough (reviewed, then executed live)

Read the template README, `docs/examples.md`, and `docs/api-keys.md` as a first-time owner who has never heard of git:
- No terminal commands, no "branch"/"merge"/"repo" vocabulary in the owner path. The owner hears "preview copy" and "ship it."
- Every key-setup page has a copy-paste AI prompt; the doc explicitly says "do this with your AI."
- Honest gap: the *initial* scaffold (`new-site.mjs`, `npm install`) still needs someone comfortable with a terminal (see "Pre-publication limitation" below). The docs don't pretend otherwise.

Update 2026-09-27: the **browser-only path was executed end to end** in a live browser with a disposable private repo (ZIP download, repo creation, pencil edits, staging branch, Cloudflare connect, production deploy, staging preview loop, PR merge to production), then cleaned up. It found and fixed three doc gaps: GitHub's file picker flattens folder structure (docs now require drag-and-drop), Cloudflare has no plain Vite preset (docs say use None), and the staging preview only appears after a post-connection commit (docs reordered). Staging preview wording corrected: unlisted, not access-protected.

## Devil's advocate

### Does the two-repo split simplify ownership or create confusion?

It simplifies **ownership** at the cost of a concept the owner never sees. The split is invisible after site creation: the owner lives entirely in their site repo; the toolkit is for whoever sets sites up (agency, freelancer, technical friend). The confusion risk is real but bounded: it exists only for the *maintainer*, who is by definition technical, and the README's diagram explains it in one picture. The alternative (one repo with template + sites mixed) would leak maintainer machinery into every owner's daily life. That would be worse.

### Top 5 ways an owner gets stuck, and the mitigation

1. **"I pasted the key and the form still doesn't work."** → `docs/api-keys.md` "If something goes wrong" section (typo'd key, missing CONTACT_TO_EMAIL, spam folder). The audit's INFO line also states the precondition on every run.
2. **"I said ship it and nothing changed."** → The AI merges the pull request (originally: staging→main); Cloudflare builds (~1 min). If the owner looks too fast they see the old page. Mitigation: docs say "about a minute"; the AI should confirm the deploy finished.
3. **"My staging site shows the wrong content."** *(superseded 2026-10-05: there is no staging site or staging subdomain any more; each change has its own preview link on its pull request.)* → `template/docs/domains-and-dns.md` named the cause: a DNS record flipped to "DNS only" (gray cloud).
4. **"I want X and the AI says it can't."** → `rules/` + `features/` bound what the AI will do (no invented prices, no fake testimonials). The owner experience is "the AI asked me for the real price", that's the system working, not failing.
5. **"Email broke after I moved my DNS."** → The email warning in `template/docs/domains-and-dns.md` (screenshot records *before* switching nameservers). This is the highest-severity stuck scenario and it's addressed before the step that causes it.

### Honest all-in cost

~$12/year is **domain-only**, under current free tiers. Registrar prices vary by TLD ($10–15 typical at Cloudflare Registrar). What can cost extra: an email *mailbox* (forwarding is free; Google Workspace is not), higher usage on paid-optional services, premium AI chat plans, paid booking/payment tools linked from the site, or a designer. Free tiers can also change; Cloudflare and Resend set their own terms. The $12 figure is honest today, not a contract.

### The one-year-abandoned test

The owner launches, then ignores the site for a year. What survives?
- **The static site itself: fully.** HTML/CSS on Cloudflare Pages doesn't rot; there are no servers to patch, no CMS to update. The template's 5 devDependencies only matter at build time.
- **Dependency rot on next edit:** a year-old `package-lock` may fail to install cleanly. Mitigation: `npm install` regenerates; the build is simple enough that upgrades rarely break it. The AI handles this when the owner returns.
- **Expired/revoked API keys:** Resend key revoked → contact form degrades to showing the email address (graceful, by design). Analytics token revoked → beacon 401s silently; page unaffected.
- **Platform changes:** if Cloudflare changes Pages behavior, the AI adapts the config on the owner's next request. The site's simplicity is the hedge, there's very little *to* break.
- **Domain lapse:** if the card on the Cloudflare account expires, the domain lapses and the site goes dark (the `*.pages.dev` address still works). Recovery: update the card, renew the domain, and give DNS up to a day to settle. The site itself is untouched.

### Security once-over

- **Contact-form abuse:** the endpoint has a honeypot field and a time-to-submit check (bots that fill everything instantly are rejected). There is **no IP-based rate limiting** in the default install. A determined attacker could send repeated messages and burn the Resend free quota (3,000/month). Cloudflare's edge absorbs volumetric junk; if form spam becomes real, the documented next step is Cloudflare Turnstile (free, already in the cost table). Deliberately not on by default: it adds friction for real visitors.
- **Environment variables:** secrets live in Cloudflare Pages settings and `.dev.vars` locally. Both are gitignored; `new-site.mjs` and the setup wizard never print a key. The repo contains no secret-shaped strings by default (verified: no `cloudflareAnalyticsToken` anywhere after the refactor).
- **Spam/honeypot limitations:** honeypot + speed check stop dumb bots, not humans or smart bots. Stated honestly in `docs/api-keys.md`'s troubleshooting, not oversold.
- **Default install attack surface:** a static site plus one serverless endpoint (contact form). No database, no auth, no admin panel, no CMS login to brute-force. The smallest surface this kind of site can have.

## Findings deliberately not fixed

- **Missing images pass the build silently**: the golden loop is the check: the owner sees the broken image on the preview link before anything ships (originally "staging preview"; still holds under the 2026-10-05 one-pull-request-per-change model). A build-time image inventory would add machinery for a problem human eyes catch in seconds.
- **`npm` errors without `node_modules` stay jargon-y**: the documented order (install before build) prevents it, and anyone running npm commands is already past the no-terminal owner path. Rewriting npm's errors isn't our job.
- **No public GitHub template repo yet (pre-publication limitation, now resolved differently)**: the repo is public, and the intended owner path is chat-first via [connect-your-ai.md](../template/docs/connect-your-ai.md): the AI scaffolds the site folder with the owner, then [setup-guide.md](../template/docs/setup-guide.md) walks through GitHub and Cloudflare. Initial scaffolding still goes smoothest with the helper (or the owner's AI, if it can reach the site folder), which is stated up front instead of pretending it's zero-touch. (Superseded 2026-10-05: setup is now owner-alone with the owner's own AI via `AI-SETUP.md` and `SETUP.md`; a helper is optional.)

## Test log

| Date | Test | Result |
|---|---|---|
| 2026-09-27 | Fresh scaffold → install → setup (plumbing) → preset → typecheck → build → audit | 8/8 checks pass (1 localhost-only skip); true 404 confirmed |
| 2026-09-27 | Bakery/demo purge grep on fresh scaffold | Zero demo references; 3 deliberate keeps: `bakery` preset name (functional, serves real bakeries), schema.org `Bakery` subtype example, "golden loop" product terminology |
| 2026-09-27 | Analytics token refactor | Beacon absent from HTML without token; zero `cloudflareAnalyticsToken` references in repo; token now build-time env var only |
| 2026-09-27 | Hostile wizard input battery (empty/emoji/200-char/invalid-then-valid/Ctrl-C) | All pass; 200-char rejection + Ctrl-C safety verified |
| 2026-09-27 | Corrupt + deleted config builds | Plain-language errors, verified |
| 2026-09-27 | Audit placeholder INFO | Fires correctly on starter copy; non-failing |
| 2026-10-05 | Fresh scaffold → setup with all defaults → typecheck → build | All pass |
| 2026-10-05 | Built output with and without a domain | No domain: no canonical, no `og:url`, no sitemap. With a domain: canonical, `og:url`, and `sitemap.xml` present |
| 2026-10-05 | GPS-tagged test photo in `public/images` and in `content/brand/photos` | `check-images` flags both; `optimize-images` cleans both and a re-check is clean; `--strip` cleans both in place |
| 2026-09-27 | Browser-only path live test (disposable private repo, deleted after) | PASS end to end: ZIP download, repo creation, pencil edits, staging branch, Cloudflare connect, production + staging preview deploys, PR merge to production. Fixed 3 doc gaps (folder drag-and-drop, Vite preset None, staging preview appears only after post-connection commit) and corrected "private preview" wording |
| 2026-10-06 | Live GitHub test on a throwaway public repo (scaffold, push, ruleset and settings via API, then archived) | PASS: a direct push to `main` is refused ("push declined due to repository rule violations"); a PR adding a GPS-tagged photo got CI's "Remove hidden camera data from photos" commit and the file on the branch had no EXIF; squash merge left one commit on `main`, the branch was auto-deleted, and `main`'s CI was green; `pull_request_creation_policy=collaborators_only` applies via the API |
| 2026-10-06 | GitHub links the docs rely on, as a signed-in owner | The new-file prefill link fills the path and contents (including `#` lines) and keeps them through the sign-in redirect; the upload link on a locked `main` shows "choose your files", "Propose changes", and "Create a new branch for this commit and start a pull request", matching the docs word for word |
| 2026-10-06 | Claude prefill link in a real browser | Opens with the repository, branch, and starting sentence filled in, then rewrites the address to plain `/code`; led to the site's `/edit/` page for the home-screen button |
