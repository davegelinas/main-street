# Upgrading a site made before October 2026

Sites made before the October 2026 update use a `staging` branch, a private repository, and an analytics token. Each site carries its own copy of the rules, so nothing changes until someone upgrades it on purpose. Give the owner's AI this page and say "upgrade my site using this."

**AI doing the upgrade:** do it as one pull request with a preview link, like any other change, and confirm each GitHub or Cloudflare setting with the owner as you go.

1. **Copy the new manual and rules** from this toolkit's `template/`: `AGENTS.md`, `CLAUDE.md`, `SETUP.md` (tick everything that's already done), `rules/`, and the owner docs in `docs/`. Keep the site's own words, `site.config.json`, and `content/`.
2. **Copy the new machinery:** `plugins/site-config.ts`, `scripts/`, `public/_headers`, `.github/workflows/ci.yml`, and `package.json` + `package-lock.json` (adds `sharp`). Delete `functions/_middleware.ts`.
3. **Remove the old analytics beacon** from `index.html` (the `<!-- feature:analytics -->` block containing `{{analyticsToken}}`), and wrap the canonical and `og:` tags in `<!-- feature:liveDomain -->` as in the template's `index.html`, `privacy-policy/index.html`, and `terms-of-service/index.html`. If `site.domain` is still `example.com`, set it to `""`.
4. **Run `npm run optimize-images`**, then `npm run build`.
5. **Owner, in Cloudflare:** turn on Web Analytics (project → Metrics → Enable), delete the `CF_ANALYTICS_TOKEN` variable, and move any keys out of the **Preview** environment (Production only).
6. **Owner, on GitHub:** make the repository **Public** (Settings → General → Danger Zone → Change visibility; first make sure nothing private is in it), then add the ruleset and settings from `docs/setup-guide.md` Step 6.
7. **Retire staging:** after the upgrade ships, delete the `staging` branch. If the site had `staging.<domain>`, remove it from the project's Custom domains and delete its DNS record.

## Moving a Pages site to Workers (Phase 1, late 2026)

Sites made before Phase 1 run on Cloudflare Pages with a Resend key. They keep working; move only when the owner wants the keyless contact form or the newer setup. Background and the live checklist: [phase-1-plan.md](phase-1-plan.md). If the owner's domain DNS is **not** on Cloudflare, don't move: Workers can't attach that domain (stay on Pages, see the template's `docs/domains-and-dns.md`, "Keeping your DNS where it is").

1. **One pull request** with the new machinery from `template/`: `wrangler.jsonc` (set `"name"` to a short new site name), `src/worker.ts`, `src/main.ts`, `.dev.vars.example`, `.gitignore`, `public/_headers`, `public/_redirects`, `plugins/site-config.ts`, `scripts/`, `tsconfig.json`, `site.schema.json`, `package.json` + `package-lock.json` (adds `wrangler`), plus `AGENTS.md`, `SETUP.md`, `rules/`, `features/`, and `docs/`. Delete `functions/`. In `site.config.json`, replace `integrations.resend` with `"cloudflareAnalyticsToken": ""`. Ship it: Pages keeps serving it (it ignores `wrangler.jsonc`).
2. **Owner, in Cloudflare:** **Workers & Pages** → **Create application** → **Import a repository** → the same repository, project name exactly as in `wrangler.jsonc`, default build and deploy commands. Then **Settings** → **Variables and Secrets** → add the secret `CONTACT_TO_EMAIL`.
3. **Check the new copy** at its `workers.dev` address: `npm run audit https://<name>.<account>.workers.dev`.
4. **Move the domain, outside business hours** (a few minutes of downtime): the domain → **DNS** → **Records** → delete the two CNAME records that point at `<project>.pages.dev` (the domain and `www`; a Worker can't take a name that already has a CNAME), then Pages project → **Custom domains** → remove both; then the Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**, for both. Turn on **Always Use HTTPS**. Audit the domain.
5. **Email:** make sure Email Routing is on with the owner's inbox verified and matching `CONTACT_TO_EMAIL`; send a test message from the live form. Then delete the Resend key in Resend and the Pages variables. Resend's DNS records can go once nothing else uses them.
6. **Visitor stats:** Pages' one-click analytics doesn't carry over. Follow `docs/api-keys.md`, "Visitor stats."
7. **After a week of calm:** Pages project → **Settings** → delete the project, so only one copy ever builds.
