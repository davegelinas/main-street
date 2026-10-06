#!/usr/bin/env node
// Apply a business-type preset: flips feature flags and sets the theme in
// site.config.json.
// Usage: node scripts/preset.mjs <bakery|restaurant|home-services|retail|salon-wellness|professional>
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "site.config.json");

export const PRESETS = {
  bakery: {
    theme: "terracotta",
    type: "Bakery",
    features: {
      menu: true, gallery: true, testimonials: true, faq: true, contactForm: true,
      announcementBanner: true, analytics: true, blog: false, booking: false, emailSignup: false,
    },
  },
  restaurant: {
    theme: "terracotta",
    type: "Restaurant",
    features: {
      menu: true, gallery: true, faq: true, contactForm: true,
      announcementBanner: true, analytics: true, testimonials: false, blog: false, booking: false, emailSignup: false,
    },
  },
  "home-services": {
    theme: "harbor",
    type: "HomeAndConstructionBusiness",
    features: {
      faq: true, testimonials: true, contactForm: true,
      announcementBanner: true, analytics: true, menu: false, gallery: false, blog: false, booking: false, emailSignup: false,
    },
  },
  retail: {
    theme: "sage",
    type: "Store",
    features: {
      gallery: true, testimonials: true, contactForm: true,
      announcementBanner: true, faq: true, analytics: true, menu: false, blog: false, booking: false, emailSignup: false,
    },
  },
  "salon-wellness": {
    theme: "plum",
    type: "HealthAndBeautyBusiness",
    features: {
      gallery: true, menu: true, faq: true, contactForm: true, booking: true, testimonials: true,
      announcementBanner: true, analytics: true, blog: false, emailSignup: false,
    },
  },
  professional: {
    theme: "harbor",
    type: "ProfessionalService",
    features: {
      faq: true, testimonials: true, contactForm: true,
      announcementBanner: true, analytics: true, menu: false, gallery: false, blog: false, booking: false, emailSignup: false,
    },
  },
};

// Returns a list of [flag, before, after] for flags that changed.
export function applyPreset(config, name) {
  const preset = PRESETS[name];
  if (!preset) throw new Error(`Unknown preset "${name}".`);
  config.business = config.business ?? {};
  if (config.business.type !== preset.type) {
    config.business.type = preset.type;
  }
  // The theme (colors, heading font) follows the kind of business too.
  config.site = config.site ?? {};
  config.site.theme = preset.theme;
  config.features = config.features ?? {};
  const changed = [];
  for (const [flag, value] of Object.entries(preset.features)) {
    const before = Boolean(config.features[flag]);
    if (before !== value) changed.push([flag, before, value]);
    config.features[flag] = value;
  }
  return changed;
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);
if (isCli) {
  const name = process.argv[2];
  if (!name || !PRESETS[name]) {
    console.log("Available presets:");
    for (const key of Object.keys(PRESETS)) console.log(`  - ${key}`);
    console.log("\nUsage: node scripts/preset.mjs <preset>");
    process.exit(name ? 1 : 0);
  }
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const changed = applyPreset(config, name);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`Preset "${name}" applied to site.config.json`);
  console.log(`  theme: ${PRESETS[name].theme} (colors and heading font; change "site.theme" any time)`);
  if (!changed.length) {
    console.log("No flags changed (already matching).");
  } else {
    for (const [flag, before, after] of changed) {
      console.log(`  ${flag}: ${before ? "on" : "off"} -> ${after ? "on" : "off"}`);
    }
  }
  console.log("\nRun `npm run build` to see the result, or `npm run dev` to preview.");
}
