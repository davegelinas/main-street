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
