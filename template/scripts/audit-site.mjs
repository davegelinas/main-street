#!/usr/bin/env node
// Post-deploy health check. Usage: node scripts/audit-site.mjs https://your-domain.com
// Verifies the live site the way a visitor (and Google) sees it.
// Note: `vite preview` serves the homepage with 200 for unknown paths, so the
// "missing page returns 404" check only means something against Cloudflare,
// where 404.html is served with a real 404 status.

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
// Post-deploy checks target https, but allow plain localhost for local try-outs.
const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base);
if (!/^https:\/\//.test(base) && !isLocal) {
  console.error("Usage: node scripts/audit-site.mjs https://your-domain.com");
  process.exit(2);
}
const host = new URL(base).host;
// The free Cloudflare addresses (*.pages.dev: the starter address and every
// preview link) must stay out of search engines; the owner's domain must
// stay indexable.
const isPreviewHost = host.endsWith(".pages.dev");
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push([true, name, ""]);
    console.log(`  PASS  ${name}`);
  } catch (err) {
    results.push([false, name, String(err?.message ?? err)]);
    console.log(`  FAIL  ${name}: ${err?.message ?? err}`);
  }
}

async function get(path, init) {
  const res = await fetch(base + path, { redirect: "follow", ...init });
  return { res, text: res.ok || res.status === 404 ? await res.text() : "" };
}

console.log(`Auditing ${base}\n`);

await check("homepage returns 200", async () => {
  const { res } = await get("/");
  if (res.status !== 200) throw new Error(`got ${res.status}`);
});

for (const page of ["/privacy-policy/", "/terms-of-service/"]) {
  await check(`${page} returns 200`, async () => {
    const { res } = await get(page);
    if (res.status !== 200) throw new Error(`got ${res.status}`);
  });
}

await check("missing page returns 404", async () => {
  const { res } = await get("/no-such-page-xyz-12345/");
  if (res.status !== 404) throw new Error(`got ${res.status}, expected 404`);
});

if (!isLocal) {
await check("http redirects to https", async () => {
  const res = await fetch(`http://${host}/`, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  if (![301, 302, 307, 308].includes(res.status) || !loc.startsWith("https://")) {
    throw new Error(`got ${res.status} -> ${loc || "(no location)"}`);
  }
});
} else {
  console.log("  SKIP  http redirects to https (localhost only)");
}

if (isPreviewHost) {
await check("free address sends X-Robots-Tag noindex", async () => {
  const { res } = await get("/");
  const tag = res.headers.get("x-robots-tag") ?? "";
  if (!/noindex/i.test(tag)) throw new Error(`got "${tag || "(missing)"}", expected noindex`);
});
} else {
await check("homepage is not noindexed", async () => {
  const { text } = await get("/");
  const m = text.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  if (m && /noindex/i.test(m[0])) throw new Error("robots meta contains noindex");
});

await check("production does not send X-Robots-Tag noindex", async () => {
  const { res } = await get("/");
  const tag = res.headers.get("x-robots-tag") ?? "";
  if (/noindex/i.test(tag)) throw new Error(`got "${tag}" on production`);
});
}

await check("homepage has JSON-LD structured data", async () => {
  const { text } = await get("/");
  if (!/application\/ld\+json/.test(text)) throw new Error("no ld+json script found");
});

await check("homepage has og:title", async () => {
  const { text } = await get("/");
  if (!/<meta[^>]+property=["']og:title["']/i.test(text)) throw new Error("og:title missing");
});

// Informational only: these never fail the audit. They tell the owner what
// the live site can and cannot do yet, based on what is actually served.
console.log("\nIntegrations (info only, see docs/api-keys.md):");
try {
  const { text } = await get("/");
  if (/id="contact-form"/.test(text)) {
    console.log("  INFO  contact form is on this page: messages are delivered only if RESEND_API_KEY and CONTACT_TO_EMAIL are set in Cloudflare (Production) and your domain is verified in Resend; without them visitors are asked to email you directly. The page never breaks.");
  } else {
    console.log("  INFO  no contact form on this page (feature off).");
  }
  if (/cloudflareinsights\.com\/beacon/.test(text)) {
    console.log("  INFO  analytics beacon present, visitor stats are collecting.");
  } else {
    console.log("  INFO  no analytics beacon, visitor stats off. Turn them on with one click (Cloudflare -> Workers & Pages -> your project -> Metrics -> Enable Web Analytics); they start after the next deployment.");
  }
  const starters = ["Your photo here", "Placeholder image", "Placeholder gallery image", "placeholder copy", "Example service", "lorem ipsum", "Your first real customer quote"];
  // Match what visitors can see: HTML comments hold notes for the AI, not page text.
  const visible = text.replace(/<!--[\s\S]*?-->/g, "").toLowerCase();
  const found = starters.filter((s) => visible.includes(s.toLowerCase()));
  if (found.length) {
    console.log(`  INFO  this page still shows starter placeholder text (${found.join("; ")}). Ask your AI to replace it with your own words and photos.`);
  }
} catch {
  console.log("  INFO  could not read the homepage for the integrations summary.");
}

const passed = results.filter(([ok]) => ok).length;
console.log(`\n${passed}/${results.length} checks passed.`);
process.exit(passed === results.length ? 0 : 1);
