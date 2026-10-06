// Reads site.config.json and transforms every .html page:
//   1. strips <!-- feature:name --> blocks whose flag is off
//   2. replaces {{dot.path}} tokens (plus {{hours}}, {{jsonld}}, {{year}})
//   3. on build, emits sitemap.xml and robots.txt into dist/
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

type Config = Record<string, any>;

function loadConfig(root: string): Config {
  const configPath = resolve(root, "site.config.json");
  let raw: string;
  try {
    raw = readFileSync(configPath, "utf8");
  } catch {
    throw new Error(
      "site.config.json is missing from the site folder. " +
      "If it was deleted by accident, ask your AI assistant to restore it. " +
      "the last working version is saved in git."
    );
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "site.config.json is not valid JSON: usually a stray comma or quote. " +
      "Open the file and fix the marked spot, or ask your AI assistant to repair it. " +
      "Nothing is lost: the last working version is saved in git."
    );
  }
}

// The domain is empty until the owner connects one (the site starts on its
// free *.workers.dev address). Absolute URLs (canonical, og:url, sitemap) are
// only emitted once a real domain exists, so shares never point at a
// placeholder.
function liveDomain(cfg: Config): string {
  const d = String(cfg.site?.domain ?? "").trim();
  return d === "example.com" ? "" : d;
}

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// "Monday to Friday" -> ["Monday",...]; "7:00 AM to 6:00 PM" -> "07:00-18:00"
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_CODE: Record<string, string> = { Monday: "Mo", Tuesday: "Tu", Wednesday: "We", Thursday: "Th", Friday: "Fr", Saturday: "Sa", Sunday: "Su" };

function to24(t: string): string {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!m) return t.trim();
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

function openingHours(hours: Array<{ days: string; time: string }>): string[] {
  const out: string[] = [];
  for (const h of hours) {
    if (/closed/i.test(h.time)) continue;
    const range = h.days.split(/–|-/).map((d) => d.trim());
    let days = range;
    if (range.length === 2) {
      const a = DAY_ORDER.indexOf(range[0]);
      const b = DAY_ORDER.indexOf(range[1]);
      if (a >= 0 && b >= a) days = DAY_ORDER.slice(a, b + 1);
    }
    const [open, close] = h.time.split(/–|-/).map((t) => t.trim());
    if (open && close) out.push(`${days.map((d) => DAY_CODE[d] ?? d).join(",")} ${to24(open)}-${to24(close)}`);
  }
  return out;
}

function jsonLd(cfg: Config): string {
  const b = cfg.business ?? {};
  const a = b.address ?? {};
  const data = {
    "@context": "https://schema.org",
    "@type": b.type || "LocalBusiness",
    name: b.name,
    description: cfg.site?.description,
    telephone: b.phone,
    email: b.email,
    url: liveDomain(cfg) ? `https://${liveDomain(cfg)}` : undefined,
    foundingDate: b.founded,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.zip,
    },
    openingHours: openingHours(b.hours ?? []),
  };
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

// Build FAQPage JSON-LD from native <details> blocks (summary = question).
function faqJsonLd(html: string): string {
  const items: string[] = [];
  const re = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const q = m[1].replace(/<[^>]+>/g, "").trim();
    const a = m[2].replace(/<[^>]+>/g, "").trim();
    if (q && a) items.push(JSON.stringify({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
  }
  if (!items.length) return "";
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((i) => JSON.parse(i)) }).replace(/</g, "\\u003c")}</script>`;
}

function stripFeatures(html: string, cfg: Config): string {
  // The body pattern refuses to cross another feature opener, so innermost
  // blocks are stripped first; loop until no blocks remain (handles nesting).
  const re = /<!--\s*feature:([A-Za-z]+)\s*-->((?:(?!<!--\s*feature:)[\s\S])*?)<!--\s*\/feature:\1\s*-->/g;
  const once = (text: string) => text.replace(re, (match, name, body) => {
    const on = Boolean(cfg.features?.[name]);
    if (name === "announcementBanner") return on && String(cfg.site?.announcement ?? "").trim() ? body : "";
    // Booking: buttons only render when a real booking URL is configured.
    // Never link a "book now" button to the contact form as a placeholder.
    if (name === "booking") return on && String(cfg.integrations?.bookingUrl ?? "").trim() ? body : "";
    // Not a flag: blocks that need an absolute URL render only once a real
    // domain is set in site.domain.
    if (name === "liveDomain") return liveDomain(cfg) ? body : "";
    return on ? body : "";
  });
  let prev = "";
  let out = html;
  while (out !== prev) {
    prev = out;
    out = once(out);
  }
  return out;
}

function hoursHtml(hours: Array<{ days: string; time: string }>): string {
  return `<dl class="hours">\n${hours.map((h) => `  <div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join("\n")}\n</dl>`;
}

function hoursPlain(hours: Array<{ days: string; time: string }>): string {
  return hours.map((h) => `- ${h.days}: ${h.time}`).join("\n");
}

// The tagline is rendered with template-supplied punctuation (the footer and
// hero add their own period), so strip trailing sentence punctuation here.
// Owners and AIs can write it with or without the period; the output always
// ends up with exactly one.
function tagline(cfg: Config): string {
  return String(cfg.business?.tagline ?? "")
    .trim()
    .replace(/[.!?\u2026]+$/, "");
}

function replaceTokensPlain(text: string, cfg: Config): string {
  return text.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, path) => {
    if (path === "year") return String(new Date().getFullYear());
    if (path === "business.hours") return hoursPlain(cfg.business?.hours ?? []);
    if (path === "jsonld" || path === "faqJsonld") return "";
    if (path === "business.tagline") return tagline(cfg);
    const v = getPath(cfg, path);
    return v == null ? "" : String(v);
  });
}

function replaceTokens(html: string, cfg: Config): string {
  return html.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (match, path) => {
    if (path === "year") return String(new Date().getFullYear());
    if (path === "jsonld") return jsonLd(cfg);
    if (path === "business.hours") return hoursHtml(cfg.business?.hours ?? []);
    if (path === "faqJsonld") return faqJsonLd(html);
    if (path === "business.tagline") return esc(tagline(cfg));
    const v = getPath(cfg, path);
    return v == null ? "" : esc(String(v));
  });
}

// Cloudflare Web Analytics (cookieless). The token is public: it ends up in
// every page anyway. Workers sites have no one-click switch, so the owner
// copies it from Cloudflare -> Web Analytics -> Add a site.
function analyticsBeacon(html: string, cfg: Config): string {
  const token = String(cfg.integrations?.cloudflareAnalyticsToken ?? "").trim();
  if (!cfg.features?.analytics || !/^[A-Za-z0-9]{16,64}$/.test(token)) return html;
  const tag = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script>`;
  return html.replace(/<\/body>/i, `${tag}\n</body>`);
}

export function siteConfig(): Plugin {
  let root = "";
  return {
    name: "site-config",
    configResolved(c) {
      root = c.root;
    },
    transformIndexHtml(html) {
      const cfg = loadConfig(root);
      return analyticsBeacon(replaceTokens(stripFeatures(html, cfg), cfg), cfg);
    },
    writeBundle(options) {
      // Build-only: write sitemap.xml, robots.txt, and the token-filled
      // llms.txt straight to the output dir, overwriting the public/ templates.
      // (options is typed by the Plugin contract; only options.dir is used.)
      const cfg = loadConfig(root);
      const domain = liveDomain(cfg);
      const outDir = options.dir ?? resolve(root, "dist");
      const pages = ["", "privacy-policy/", "terms-of-service/"];
      let robots = "User-agent: *\nAllow: /\n";
      if (domain) {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>https://${domain}/${p}</loc></url>`).join("\n")}\n</urlset>\n`;
        writeFileSync(resolve(outDir, "sitemap.xml"), sitemap);
        robots += `\nSitemap: https://${domain}/sitemap.xml\n`;
      }
      writeFileSync(resolve(outDir, "robots.txt"), robots);
      // llms.txt uses plain-text token replacement (no HTML escaping).
      try {
        const llms = readFileSync(resolve(root, "public/llms.txt"), "utf8");
        writeFileSync(resolve(outDir, "llms.txt"), replaceTokensPlain(llms, cfg));
      } catch {
        // No llms.txt in public/: nothing to do.
      }
    },
  };
}
