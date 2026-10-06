# Analytics rules

## Default: Cloudflare Web Analytics (free, cookieless)

- No cookies, no consent banner needed, GDPR-friendly by design. That's why it's the default.
- Enable it with the domain: Cloudflare dashboard → **Web Analytics** → **Add a site** → pick the owner's domain → **Done**. Because the domain runs through Cloudflare, Cloudflare adds its script to the pages as they're served ("automatic setup"). No token, no code, nothing in the repo. Before the domain there's nothing to turn on: the free address is hidden from Google, so there's little to count.
- Never also paste Cloudflare's snippet into the pages: two scripts count every visit twice. (A site kept on Pages, `docs/keep-your-dns.md`, uses the Pages project's **Metrics** → **Enable** instead.)
- `features.analytics` in `site.config.json` only controls whether the privacy policy mentions analytics. Keep it `true` when analytics is on in Cloudflare, `false` when it's off.
- What it tells the owner: visitors, page views, referrers, countries. Enough for a small business. Explain it in those terms, not in metrics-jargon.

## Don't add Google Analytics unless asked

GA4 needs a consent banner in most jurisdictions, which means building and maintaining a consent banner. That's a real cost for a small business. If the owner explicitly wants GA (usually because someone told them to), explain the tradeoff first: the banner, the maintenance, and the fact that Cloudflare already answers "how many people visited and where from."

If they still want it: load it with consent mode, never hardcode the measurement ID (build-time env var), and update the privacy policy.

## Rules

- Never add analytics that the privacy policy doesn't disclose. The two change together.
- Never sell or share analytics data. There is no reason a small business needs a data pipeline.
- When reporting numbers to the owner, use plain words: "about 200 people visited your site last week, mostly from Google" beats a dashboard screenshot.
