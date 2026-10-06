// Reads site.config.json and transforms every .html page:
//   1. strips <!-- feature:name --> blocks whose flag is off
//   2. replaces {{dot.path}} tokens, plus computed ones: {{year}}, {{jsonld}},
//      {{faqJsonld}}, {{phoneHref}} (a dialable tel: link), {{directionsUrl}}
//      (Google Maps link for the address), {{siteUrl}} (https://your-domain,
//      or empty until a domain is connected), {{monogram}} (the name's first
//      letter, for the round brand mark shown until there is a logo),
//      {{instagramUrl}} and {{facebookUrl}} (full links from business.social)
//   3. on build, emits sitemap.xml, robots.txt, llms.txt, the link-preview
//      picture (images/share.jpg, see share-image.ts) and the site icons
//      (favicon.svg, apple-touch-icon.png, see icons.ts) into dist/
// Pages are found automatically (htmlPages): a new page is a new folder with
// an index.html, and the build and sitemap pick it up with no config change.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";
import { writeIcons } from "./icons.ts";
import { writeShareImage } from "./share-image.ts";

type Config = Record<string, any>;
type Hours = { days: string; time: string };

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

// Top-level folders that hold tooling, docs or raw assets, never pages.
const NOT_PAGES = new Set(["content", "dist", "docs", "features", "functions", "node_modules", "plugins", "presets", "public", "rules", "scripts", "src", "supabase"]);

// Every page in the site: index.html in the root or in any page folder,
// plus 404.html. Used for the build input list and the sitemap, so a page
// that works in `npm run dev` also ships.
export function htmlPages(root: string): Record<string, string> {
  const pages: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith(".") || e.name === "node_modules" || (dir === root && NOT_PAGES.has(e.name))) continue;
        walk(full);
      } else if (e.isFile() && e.name === "index.html") {
        pages[relative(root, dir).split(sep).join("/") || "main"] = full;
      }
    }
  };
  walk(root);
  if (existsSync(join(root, "404.html"))) pages.notFound = join(root, "404.html");
  return pages;
}

// The domain is empty until the owner connects one (the site starts on its
// free *.pages.dev address). Absolute URLs (canonical, og:url, sitemap) are
// only emitted once a real domain exists, so shares never point at a
// placeholder.
function liveDomain(cfg: Config): string {
  const d = String(cfg.site?.domain ?? "").trim();
  return d === "example.com" ? "" : d;
}

function siteUrl(cfg: Config): string {
  return liveDomain(cfg) ? `https://${liveDomain(cfg)}` : "";
}

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

// Safe in text and in quoted attributes (a business called Joe's "Best"
// must not break an aria-label or a meta tag).
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// The config is hand-edited (often by an AI), so a missing or malformed
// hours list renders as "no hours" instead of failing the build.
function hoursList(cfg: Config): Hours[] {
  const raw = cfg.business?.hours;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((h: any) => ({ days: String(h?.days ?? "").trim(), time: String(h?.time ?? "").trim() }))
    .filter((h) => h.days || h.time);
}

// Structured-data hours. "Mon – Fri", "Saturday to Sunday", "Mon, Wed, Fri",
// "Daily", "7am - 3pm", "9:00 AM – 12:00 PM, 1:00 PM – 5:00 PM" all work.
// Anything this can't read with confidence is left out rather than guessed:
// wrong hours in Google cost more than missing ones.
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const RANGE = /\s*(?:–|—|-|\bto\b|\bthrough\b|\bthru\b|\buntil\b)\s*/i;
const LIST = /\s*(?:,|&|;|\band\b)\s*/i;

function dayIndex(word: string): number {
  const w = word.trim().toLowerCase().replace(/\.$/, "");
  if (!/^[a-z]{2,}$/.test(w)) return -1;
  return DAYS.findIndex((d) => {
    const day = d.toLowerCase();
    return day.startsWith(w) || (w.length <= 5 && w.slice(0, 3) === day.slice(0, 3));
  });
}

function parseDays(text: string): string[] | null {
  const t = text.trim().toLowerCase();
  if (/^(daily|every ?day|all week|7 days( a week)?)$/.test(t)) return DAYS;
  if (t === "weekdays") return DAYS.slice(0, 5);
  if (t === "weekends" || t === "weekend") return DAYS.slice(5);
  const out: string[] = [];
  for (const part of t.split(LIST).filter(Boolean)) {
    const ends = part.split(RANGE);
    if (ends.length > 2) return null;
    const a = dayIndex(ends[0]);
    const b = dayIndex(ends[ends.length - 1]);
    if (a < 0 || b < 0) return null;
    for (let i = a; ; i = (i + 1) % 7) {
      out.push(DAYS[i]);
      if (i === b) break;
    }
  }
  return out.length ? [...new Set(out)] : null;
}

// "9am", "9:30 PM", "17:00", "noon" -> "HH:MM". A bare "9" is ambiguous
// (morning or evening?), so it is not guessed.
function to24(t: string, closing = false): string | null {
  const s = t.trim().toLowerCase().replace(/\./g, "");
  if (s === "noon") return "12:00";
  if (s === "midnight") return closing ? "23:59" : "00:00";
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m || (!m[2] && !m[3])) return null;
  let h = parseInt(m[1], 10);
  if (m[3]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (m[3] === "pm" ? 12 : 0);
  }
  if (h > 23 || parseInt(m[2] ?? "0", 10) > 59) return null;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

function parseTimes(text: string): Array<[string, string]> | null {
  if (/^open\s*24\s*hours$|^24\s*hours$/i.test(text.trim())) return [["00:00", "23:59"]];
  const out: Array<[string, string]> = [];
  for (const part of text.split(LIST).filter(Boolean)) {
    const ends = part.split(RANGE);
    if (ends.length !== 2) return null;
    const opens = to24(ends[0]);
    const closes = to24(ends[1], true);
    if (!opens || !closes) return null;
    out.push([opens, closes]);
  }
  return out.length ? out : null;
}

function openingHours(hours: Hours[]): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  for (const h of hours) {
    if (/closed/i.test(h.time)) continue;
    const days = parseDays(h.days);
    const times = parseTimes(h.time);
    if (!days || !times) {
      console.warn(`site-config: left "${h.days}: ${h.time}" out of the Google hours data (could not read it for sure). The page still shows it as written.`);
      continue;
    }
    for (const [opens, closes] of times) out.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes });
  }
  return out;
}

// Drop empty values, so search engines never see "telephone": "".
function prune(v: any): any {
  if (Array.isArray(v)) {
    const a = v.map(prune).filter((x) => x !== undefined);
    return a.length ? a : undefined;
  }
  if (v && typeof v === "object") {
    const o: Record<string, any> = {};
    for (const [k, x] of Object.entries(v)) {
      const p = prune(x);
      if (p !== undefined) o[k] = p;
    }
    return Object.keys(o).some((k) => !k.startsWith("@")) ? o : undefined;
  }
  if (typeof v === "string") return v.trim() ? v : undefined;
  return v ?? undefined;
}

// One-off closures: site.closedOn lists dates ("2026-11-04"), ranges
// ("2026-12-24 to 2026-12-26"), or either with a short note:
// { "dates": "2026-12-24 to 2026-12-26", "note": "for the holidays" }.
// The page uses them for "Closed today" and a notice line at the top of the
// homepage; Google gets them as special hours. Weekly hours stay as they are.
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 864e5;
type Closure = { from: string; to: string; note: string };
function closedRanges(cfg: Config, warn?: (msg: string) => void): Closure[] {
  const out: Closure[] = [];
  for (const raw of Array.isArray(cfg.site?.closedOn) ? cfg.site.closedOn : []) {
    const isObject = typeof raw === "object" && raw !== null;
    const dates = String(isObject ? raw.dates ?? "" : raw);
    const note = isObject ? String(raw.note ?? "").trim().replace(/[.!\s]+$/, "") : "";
    const [from, to = from] = dates.split(/\s+to\s+/i).map((s) => s.trim());
    const start = Date.parse(`${from}T00:00:00Z`);
    const end = Date.parse(`${to}T00:00:00Z`);
    if (!ISO_DAY.test(from) || !ISO_DAY.test(to) || !(end >= start) || end - start > 62 * DAY_MS) {
      warn?.(`site.closedOn: could not read ${isObject ? JSON.stringify(raw) : `"${raw}"`} (write 2026-11-04, or "2026-12-24 to 2026-12-26", up to two months; with a note: { "dates": "2026-11-04", "note": "for the parade" }). Skipped.`);
      continue;
    }
    if (note.length > 60) warn?.(`site.closedOn: the note "${note}" is long. A few words ("for the holidays") keep the notice to one line on a phone.`);
    out.push({ from, to, note });
  }
  return out;
}

// Closures that haven't ended (with a day's grace for time zones), soonest
// first. Past ones drop off the page and out of Google's data by themselves.
function upcomingClosures(cfg: Config, warn?: (msg: string) => void): Closure[] {
  const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
  return closedRanges(cfg, warn)
    .filter(({ to }) => to >= yesterday)
    .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}

// "2026-12-24" -> "Thursday, December 24", or "Thu, Dec 24" when short (en-US,
// the date as written). Ranges use the short form so they fit one phone line.
function dayInWords(iso: string, short = false): string {
  const len = short ? "short" : "long";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: len, month: len, day: "numeric", timeZone: "UTC" });
}

// One short line per closure: "Closed Wednesday, November 4, for the parade."
// or "Closed Thu, Dec 24 to Sat, Dec 26, for the holidays." Hidden until the page script shows the ones
// that start within 21 days (by the visitor's date) and haven't ended.
function closureNotices(cfg: Config, warn?: (msg: string) => void): string {
  return upcomingClosures(cfg, warn)
    .map(({ from, to, note }) => {
      const when = from === to ? dayInWords(from) : `${dayInWords(from, true)} to ${dayInWords(to, true)}`;
      return `<p class="announcement closure" data-from="${from}" data-to="${to}" hidden><strong>Closed</strong> ${esc(when)}${note ? `, ${esc(note)}` : ""}.</p>`;
    })
    .join("\n  ");
}

function closedDays(cfg: Config, warn?: (msg: string) => void): string {
  const days = new Set<string>();
  for (const { from, to } of closedRanges(cfg, warn)) {
    for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
      days.add(new Date(t).toISOString().slice(0, 10));
    }
  }
  return [...days].join(",");
}

function ldScript(data: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function jsonLd(cfg: Config): string {
  const b = cfg.business ?? {};
  const a = b.address ?? {};
  return ldScript(prune({
    "@context": "https://schema.org",
    "@type": b.type || "LocalBusiness",
    name: b.name,
    description: description(cfg),
    telephone: b.phone,
    email: b.email,
    url: siteUrl(cfg) ? `${siteUrl(cfg)}/` : undefined,
    foundingDate: b.founded,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.zip,
    },
    openingHoursSpecification: openingHours(hoursList(cfg)),
    // Closed all day, per schema.org: opens and closes at midnight. Past
    // closures are left out so Google never sees stale ones.
    specialOpeningHoursSpecification: upcomingClosures(cfg)
      .map(({ from, to }) => ({ "@type": "OpeningHoursSpecification", validFrom: from, validThrough: to, opens: "00:00", closes: "00:00" })),
  }));
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c", ndash: "\u2013", mdash: "\u2014", hellip: "\u2026" };

// HTML fragment -> plain text for structured data: no tags, entities
// decoded, whitespace collapsed.
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

// Build FAQPage JSON-LD from native <details> blocks (summary = question,
// everything after it = answer). Runs on the token-filled page, so answers
// that use {{business.phone}} come out with the real number.
function faqJsonLd(html: string): string {
  const mainEntity: unknown[] = [];
  const re = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const q = plainText(m[1]);
    const a = plainText(m[2]);
    if (q && a) mainEntity.push({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } });
  }
  return mainEntity.length ? ldScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity }) : "";
}

// Themes whose headings use the system sans instead of Fraunces (src/styles.css).
const SANS_THEMES = new Set(["harbor"]);

function stripFeatures(html: string, cfg: Config, warn: (msg: string) => void): string {
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
    // Not flags either: themes whose headings use the system sans skip the
    // display-font download, and a social link shows only once it's filled in.
    if (name === "displayFont") return SANS_THEMES.has(String(cfg.site?.theme ?? "")) ? "" : body;
    if (name === "instagram" || name === "facebook") return socialUrl(cfg, name) ? body : "";
    if (!(name in (cfg.features ?? {}))) warn(`<!-- feature:${name} --> has no matching flag in site.config.json "features", so the block is hidden.`);
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

function hoursHtml(hours: Hours[]): string {
  // No hours yet: one honest line instead of an empty list under a heading.
  if (!hours.length) return `<p class="hours-empty">Call us for our hours.</p>`;
  return `<dl class="hours">\n${hours.map((h) => `  <div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join("\n")}\n</dl>`;
}

function hoursPlain(hours: Hours[]): string {
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

// An empty meta description fails SEO checks; fall back to name + tagline.
function description(cfg: Config): string {
  const d = String(cfg.site?.description ?? "").trim();
  if (d) return d;
  const name = String(cfg.business?.name ?? "").trim();
  const t = tagline(cfg);
  return t ? `${name ? `${name}: ` : ""}${t}.` : name;
}

// "(555) 123-4567 ext. 2" -> "tel:5551234567,2"; "1-800-FLOWERS" -> "tel:18003569377".
// Spaces and parentheses are not valid in a tel: link.
const KEYPAD = "22233344455566677778889999";
function phoneHref(cfg: Config): string {
  const raw = String(cfg.business?.phone ?? "").trim();
  const ext = raw.match(/\s*(?:ext\.?|extension|x)\s*(\d+)\s*$/i);
  const main = (ext ? raw.slice(0, ext.index) : raw)
    .toUpperCase()
    .replace(/[A-Z]/g, (c) => KEYPAD[c.charCodeAt(0) - 65])
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");
  return main ? `tel:${main}${ext ? `,${ext[1]}` : ""}` : "";
}

function directionsUrl(cfg: Config): string {
  const a = cfg.business?.address ?? {};
  const s = (v: unknown) => String(v ?? "").trim();
  const query = [s(a.street), s(a.city), [s(a.state), s(a.zip)].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// "@littleloaf", "littleloaf", "instagram.com/littleloaf" or a full link ->
// a full profile link. Empty when the owner hasn't given one.
function socialUrl(cfg: Config, network: "instagram" | "facebook"): string {
  const v = String(cfg.business?.social?.[network] ?? "").trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]+\//i.test(v)) return `https://${v}`;
  return `https://www.${network}.com/${encodeURIComponent(v.replace(/^@/, ""))}`;
}

// "The Velvet Chair" -> "V". Skips a leading "The"; empty if there is no letter.
function monogram(cfg: Config): string {
  const name = String(cfg.business?.name ?? "").trim().replace(/^the\s+/i, "");
  return name.match(/[\p{L}\p{N}]/u)?.[0].toUpperCase() ?? "";
}

const TOKEN = /\{\{([a-zA-Z0-9_.]+)\}\}/g;

// One token's plain (unescaped) value; undefined when nothing matches.
function tokenValue(path: string, cfg: Config): string | undefined {
  switch (path) {
    case "year": return String(new Date().getFullYear());
    case "business.tagline": return tagline(cfg);
    case "site.description": return description(cfg);
    case "phoneHref": return phoneHref(cfg);
    case "directionsUrl": return directionsUrl(cfg);
    case "siteUrl": return siteUrl(cfg);
    case "monogram": return monogram(cfg);
    case "instagramUrl": return socialUrl(cfg, "instagram");
    case "facebookUrl": return socialUrl(cfg, "facebook");
  }
  const v = getPath(cfg, path);
  return v == null || typeof v === "object" ? undefined : String(v);
}

function replaceTokensPlain(text: string, cfg: Config): string {
  return text.replace(TOKEN, (match, path) => {
    if (path === "business.hours") return hoursPlain(hoursList(cfg));
    if (path === "jsonld" || path === "faqJsonld") return "";
    return tokenValue(path, cfg) ?? "";
  });
}

function replaceTokens(html: string, cfg: Config, warn: (msg: string) => void): string {
  const out = html.replace(TOKEN, (match, path) => {
    if (path === "jsonld") return jsonLd(cfg);
    if (path === "business.hours") return hoursHtml(hoursList(cfg));
    if (path === "faqJsonld") return match; // filled below, from the finished page
    if (path === "closedOn") return esc(closedDays(cfg, warn));
    if (path === "closureNotices") return closureNotices(cfg);
    const v = tokenValue(path, cfg);
    if (v === undefined) warn(`${match} matches nothing in site.config.json, so it renders empty.`);
    return esc(v ?? "");
  });
  return out.includes("{{faqJsonld}}") ? out.replace("{{faqJsonld}}", () => faqJsonLd(out)) : out;
}

export function siteConfig(): Plugin {
  let root = "";
  return {
    name: "site-config",
    configResolved(c) {
      root = c.root;
    },
    transformIndexHtml(html, ctx) {
      const cfg = loadConfig(root);
      // Typos (a misspelled token or flag) build fine but render empty or
      // hidden. Say so in the build log, once per page and message.
      const seen = new Set<string>();
      const warn = (msg: string) => {
        if (!seen.has(msg)) console.warn(`site-config (${ctx.path}): ${msg}`);
        seen.add(msg);
      };
      return replaceTokens(stripFeatures(html, cfg, warn), cfg, warn);
    },
    async writeBundle(options) {
      // Build-only: write sitemap.xml, robots.txt, and the token-filled
      // llms.txt straight to the output dir, overwriting the public/ templates.
      // (options is typed by the Plugin contract; only options.dir is used.)
      const cfg = loadConfig(root);
      const domain = liveDomain(cfg);
      const outDir = options.dir ?? resolve(root, "dist");
      // public/images/README.md guides whoever edits the repo; it isn't part of the site.
      rmSync(resolve(outDir, "images/README.md"), { force: true });
      let robots = "User-agent: *\nAllow: /\n";
      if (domain) {
        // Every built page except 404 and pages marked noindex.
        const pages = Object.values(htmlPages(root))
          .filter((file) => !file.endsWith("404.html") && !/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(readFileSync(file, "utf8")))
          .map((file) => relative(root, dirname(file)).split(sep).join("/"))
          .map((p) => (p ? `${p}/` : ""))
          .sort();
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
      // No share picture: drop the tags that point at it, so link previews
      // show the title alone instead of a broken image.
      if (!(await writeShareImage(root, outDir, cfg))) {
        for (const file of readdirSync(outDir, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".html"))) {
          const path = resolve(outDir, file);
          const html = readFileSync(path, "utf8");
          const out = html.replace(/[ \t]*<meta (?:property="og:image(?::width|:height)?"|name="twitter:(?:card|image)")[^>]*>\n?/g, "");
          if (out !== html) writeFileSync(path, out);
        }
      }
      await writeIcons(root, outDir, cfg, monogram(cfg), SANS_THEMES.has(String(cfg.site?.theme ?? "")));
    },
  };
}
