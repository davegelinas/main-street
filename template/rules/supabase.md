# Supabase rules (optional; most sites don't need this)

Most Main Street sites never need a database. The contact form sends email; content lives in the repo. Only reach for Supabase when the site must **remember** something: newsletter subscribers with consent records, form submissions worth keeping, user accounts, bookings.

## When it's justified

- Newsletter signup with **consent evidence** (email, timestamp, IP, user agent). This is the classic case: it's the system of record, and the sending tool (Kit, Buttondown, etc.) is replaceable.
- Anything where losing the data would be a real problem.

## When it's not

- Contact form alone (email is fine).
- Blog posts, galleries, menus (they're files in the repo).
- "We might need it later." Later hasn't happened yet.

## Rules

- **Free tier, and say the limits out loud.** Supabase's free tier is generous but not infinite. Tell the owner the limits in plain words before creating anything.
- **Credentials never in the repo.** The anon key is build-safe only if row-level security is correct; the service key never leaves Cloudflare's secrets. When in doubt, keep both server-side in `src/worker.ts` (a new `/api/...` route), with the keys as Cloudflare secrets.
- **Row Level Security on everything.** No table without RLS policies. No exceptions. A public anon key with no RLS is a public database.
- **The database is the system of record.** If a newsletter tool is attached, the tool is a sender, not the source of truth. Consent records live in Postgres and must be producible on request.
- **Migrations live in the repo** (`supabase/migrations/`), applied in order, never hand-edited in the dashboard. If you change the schema by clicking around in the dashboard, you've created a future outage.
- **Backups:** confirm the owner knows free-tier backup limits. For anything load-bearing, say so and propose the fix before it matters.

## Local development

Supabase has a local CLI and a hosted free project. For a small business site, developing against the hosted free project (with a separate dev project if needed) is usually simpler than Docker. Don't over-engineer this.
