# Analytics rules

## Default: Cloudflare Web Analytics (free, cookieless)

- No cookies, no consent banner needed, GDPR-friendly by design. That's why it's the default.
- Enable: the owner goes to Cloudflare → **Web Analytics** → **Add a site**, types their domain, and copies the snippet Cloudflare shows (steps in `docs/api-keys.md`, "Visitor stats"). Put the `token` value from that snippet in `integrations.cloudflareAnalyticsToken` in `site.config.json`, as a normal pull request. The build adds the beacon to every page. The token is public by design (it ships in every page); it is not a secret.
- Workers sites have no one-click "Enable" switch (that was a Pages feature), so don't send the owner looking for one under **Metrics**.
- The beacon only loads when `features.analytics` is `true` **and** the token is set. `features.analytics` also controls whether the privacy policy mentions analytics: keep it `true` when stats are on, `false` when they're off.
- What it tells the owner: visitors, page views, referrers, countries. Enough for a small business. Explain it in those terms, not in metrics-jargon.

## Don't add Google Analytics unless asked

GA4 needs a consent banner in most jurisdictions, which means building and maintaining a consent banner. That's a real cost for a small business. If the owner explicitly wants GA (usually because someone told them to), explain the tradeoff first: the banner, the maintenance, and the fact that Cloudflare already answers "how many people visited and where from."

If they still want it: load it with consent mode, never hardcode the measurement ID (build-time env var), and update the privacy policy.

## Rules

- Never add analytics that the privacy policy doesn't disclose. The two change together.
- Never sell or share analytics data. There is no reason a small business needs a data pipeline.
- When reporting numbers to the owner, use plain words: "about 200 people visited your site last week, mostly from Google" beats a dashboard screenshot.
