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
cfg.site.domain = "joes.example.org";

try {
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
  execSync("npm run build", { cwd: site, stdio: "inherit" });
  const html = readFileSync(resolve(site, "dist/index.html"), "utf8");

  // Quotes in the name never break out of an attribute.
  assert.ok(html.includes('<meta property="og:title" content="Joe&#39;s &quot;Best&quot; Bakery &amp; Café 🍞">'), "og:title attribute is not escaped");
  assert.ok(!html.includes('"Best" Bakery'), "an unescaped quote reached the HTML");
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
