#!/usr/bin/env node
// CI regression check for the site build plugin (template/plugins/site-config.ts).
// Real business details are full of quotes, ampersands and emoji, and hours
// get written every which way. This builds a scaffolded site with exactly
// that and checks the HTML stays well-formed and Google's hours data is right.
// Usage: node scripts/check-tricky-config.mjs <site-dir>
// (Restores the site's own site.config.json afterwards; dist/ is left built
// with the test details.)
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

if (!process.argv[2]) {
  console.log("Usage: node scripts/check-tricky-config.mjs <site-dir>");
  process.exit(2);
}
const site = resolve(process.argv[2]);
const configPath = resolve(site, "site.config.json");
const original = readFileSync(configPath, "utf8");
const cfg = JSON.parse(original);

cfg.business.name = `Joe's "Best" Bakery & Café 🍞`;
cfg.business.tagline = `Bread, "buns" & more!`;
cfg.business.phone = "(555) 123-4567 ext. 2";
cfg.business.address = { street: "12 Smith & Sons Plaza #4", city: "Springfield", state: "IL", zip: "62701" };
cfg.business.hours = [
  { days: "Mon – Fri", time: "7am - 3pm" },
  { days: "Saturday to Sunday", time: "8:00 AM – 12:00 PM, 1:00 PM – 4:00 PM" },
  { days: "Holidays" },
];
cfg.site.description = "";
const nextYear = new Date().getFullYear() + 1;
cfg.site.closedOn = [
  `${nextYear}-12-24 to ${nextYear}-12-26`,
  "next tuesday",
  { dates: `${nextYear}-11-04`, note: `for the "Fall" parade & fair.` },
  { dates: "2020-01-01", note: "long gone" },
];
cfg.site.domain = "joes.example.org";

try {
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  execSync("npm run build", { cwd: site, stdio: "inherit" });
  const html = readFileSync(resolve(site, "dist/index.html"), "utf8");

  // Quotes in the name never break out of an attribute.
  assert.ok(html.includes('<meta property="og:title" content="Joe&#39;s &quot;Best&quot; Bakery &amp; Café 🍞">'), "og:title attribute is not escaped");
  assert.ok(!html.includes('"Best" Bakery'), "an unescaped quote reached the HTML");
  // Closed dates reach the page script and Google; unreadable ones are skipped.
  assert.ok(html.includes(`data-closed-on="${nextYear}-12-24,${nextYear}-12-25,${nextYear}-12-26,${nextYear}-11-04,2020-01-01"`), "closed dates not on <html>");
  assert.ok(html.includes(`"validFrom":"${nextYear}-12-24","validThrough":"${nextYear}-12-26","opens":"00:00","closes":"00:00"`), "closed dates missing from structured data");
  assert.ok(html.includes(`"validFrom":"${nextYear}-11-04","validThrough":"${nextYear}-11-04"`), "a closure with a note is missing from structured data");
  assert.ok(!html.includes(`"validFrom":"2020-01-01"`), "an ended closure reached structured data");
  // Each closure gets its own notice line, dates in words, soonest first,
  // notes escaped; ended ones are left out.
  const words = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const parade = `<p class="announcement closure" data-from="${nextYear}-11-04" data-to="${nextYear}-11-04" hidden><strong>Closed</strong> ${words(`${nextYear}-11-04`)}, for the &quot;Fall&quot; parade &amp; fair.</p>`;
  const holidays = `<p class="announcement closure" data-from="${nextYear}-12-24" data-to="${nextYear}-12-26" hidden><strong>Closed</strong> ${words(`${nextYear}-12-24`)} to ${words(`${nextYear}-12-26`)}.</p>`;
  assert.ok(html.includes(parade), "closure notice with a note is missing or not escaped");
  assert.ok(html.includes(holidays), "closure notice for a range is missing");
  assert.ok(html.indexOf(parade) < html.indexOf(holidays), "closure notices are not in date order");
  assert.ok(!html.includes('data-from="2020-01-01"'), "an ended closure still has a notice");
  // An empty description falls back to name + tagline.
  assert.ok(html.includes('<meta name="description" content="Joe&#39;s &quot;Best&quot; Bakery &amp; Café 🍞: Bread, &quot;buns&quot; &amp; more.">'), "meta description fallback missing");
  // A dialable phone link and a fully encoded directions link.
  assert.ok(html.includes('href="tel:5551234567,2"'), "tel: link is not dialable");
  assert.ok(html.includes("query=12%20Smith%20%26%20Sons%20Plaza%20%234%2C%20Springfield%2C%20IL%2062701"), "directions link is not encoded");

  // Mon – Fri means all five days; split shifts stay split; an entry with no
  // time is left out instead of breaking the build.
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  const spec = (dayOfWeek, opens, closes) => ({ "@type": "OpeningHoursSpecification", dayOfWeek, opens, closes });
  assert.deepEqual(ld.openingHoursSpecification, [
    spec(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "07:00", "15:00"),
    spec(["Saturday", "Sunday"], "08:00", "12:00"),
    spec(["Saturday", "Sunday"], "13:00", "16:00"),
  ]);
  assert.equal(ld.name, `Joe's "Best" Bakery & Café 🍞`);
  assert.equal(ld.url, "https://joes.example.org/");

  const sitemap = readFileSync(resolve(site, "dist/sitemap.xml"), "utf8");
  assert.ok(sitemap.includes("<loc>https://joes.example.org/privacy-policy/</loc>"), "sitemap misses a page");
  assert.ok(!sitemap.includes("404"), "sitemap lists the 404 page");
  console.log("\nTricky business details: all checks passed.");
} finally {
  writeFileSync(configPath, original);
}
