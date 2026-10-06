#!/usr/bin/env node
// Prepares photos for a public website and a public repo.
//   - Strips hidden camera data (GPS location, camera model, dates) from every
//     photo under public/ and content/. Phone photos often carry the exact
//     spot they were taken, which for a home business is the owner's home.
//   - Converts oversized photos under public/ (over 200 KB or 1200px wide) to
//     WebP, max 1200px wide: photo slots are at most about 700 px wide, and
//     the hero photo stays inside the 200 KB budget in rules/design.md.
// Usage: npm run optimize-images        (fix everything it can)
//        npm run check-images           (report only; exits 1 if a photo
//                                        still carries camera data or can't
//                                        be shown on a website)
//        node scripts/optimize-images.mjs --strip
//                                       (only strip camera data, in place;
//                                        what CI runs on every change)
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname, extname, basename, relative, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const stripOnly = process.argv.includes("--strip");
const MAX_BYTES = 200 * 1024;
const MAX_WIDTH = 1200;
const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif"];
const PHONE_ONLY_EXT = [".heic", ".heif"];
const VIDEO_EXT = [".mp4", ".mov", ".m4v"];

function walk(dir) {
  let out = [];
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

const hasCameraData = (meta) => Boolean(meta.exif || meta.xmp || meta.iptc);

// True when the EXIF block holds a GPS location (IFD0 tag 0x8825), so the
// AI and the owner can tell a located photo from ordinary camera data.
function hasGps(exif) {
  if (!exif) return false;
  try {
    const b = exif.toString("latin1", 0, 6) === "Exif\0\0" ? exif.subarray(6) : exif;
    const le = b.toString("latin1", 0, 2) === "II";
    const u16 = (o) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
    const u32 = (o) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
    const ifd0 = u32(4);
    for (let i = 0, n = u16(ifd0); i < n; i++) {
      const e = ifd0 + 2 + i * 12;
      if (u16(e) === 0x8825 && u32(e + 8)) return true;
    }
  } catch { /* unreadable EXIF: treat as no GPS; it is stripped either way */ }
  return false;
}

// Located photos, counted once even when the same file sits in the shoebox
// and in public/images.
const located = new Set();

// Re-encode in the same format with no metadata (sharp drops it by default).
// rotate() first, so photos keep the orientation the phone recorded.
async function encodeSameFormat(input, ext, resizeWidth) {
  let p = sharp(input).rotate();
  if (resizeWidth) p = p.resize({ width: resizeWidth, withoutEnlargement: true });
  if (ext === ".png") p = p.png();
  else if (ext === ".webp") p = p.webp({ quality: 80 });
  else if (ext === ".avif") p = p.avif();
  else if (ext === ".tif" || ext === ".tiff") p = p.tiff();
  else p = p.jpeg({ quality: 90, mozjpeg: true });
  return p.toBuffer();
}

let problems = 0;
let fixed = 0;

const files = [...walk(resolve(root, "public")), ...walk(resolve(root, "content"))];

for (const full of files) {
  const ext = extname(full).toLowerCase();
  const shown = relative(root, full);
  const shipsToSite = shown.startsWith("public");

  if (PHONE_ONLY_EXT.includes(ext)) {
    problems++;
    console.log(`  HEIC       ${shown}: websites can't show this iPhone format, and its hidden camera data can't be removed here. Delete it and upload a JPG instead (iPhone: Settings > Camera > Formats > Most Compatible).`);
    continue;
  }
  if (VIDEO_EXT.includes(ext)) {
    console.log(`  VIDEO      ${shown}: videos can carry the location they were filmed. Make sure location was off when it was recorded or shared.`);
    continue;
  }
  if (!PHOTO_EXT.includes(ext)) continue;

  let meta;
  try {
    meta = await sharp(full).metadata();
  } catch {
    problems++;
    console.log(`  UNREADABLE ${shown}: check that it is a real photo file.`);
    continue;
  }

  const kb = Math.round(statSync(full).size / 1024);
  const dirty = hasCameraData(meta);
  const gps = hasGps(meta.exif);
  if (gps) located.add(createHash("sha1").update(readFileSync(full)).digest("hex"));
  const what = gps ? "its GPS location and other camera data" : "hidden camera data";
  const wide = shipsToSite && (meta.width ?? 0) > MAX_WIDTH;
  const heavy = shipsToSite && kb * 1024 > MAX_BYTES;

  if (checkOnly) {
    if (dirty) {
      problems++;
      console.log(`  ${gps ? "GPS LOCATION" : "CAMERA DATA"} ${shown}: still carries ${what}. Run: npm run optimize-images`);
    } else if (wide || (heavy && ext !== ".webp")) {
      console.log(`  LARGE      ${shown} (${kb} KB): run npm run optimize-images to shrink it.`);
    }
    continue;
  }

  if (stripOnly) {
    if (dirty) {
      writeFileSync(full, await encodeSameFormat(readFileSync(full), ext));
      fixed++;
      console.log(`  CLEANED    ${shown}: removed ${what}.`);
    }
    continue;
  }

  if (shipsToSite && ext !== ".webp" && (wide || heavy)) {
    const out = resolve(dirname(full), `${basename(full, extname(full))}.webp`);
    await sharp(full).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    if (dirty) writeFileSync(full, await encodeSameFormat(readFileSync(full), ext));
    fixed++;
    console.log(`  OPTIMIZED  ${shown} (${kb} KB) -> ${basename(out)} (${Math.round(statSync(out).size / 1024)} KB). Update the <img> tag to use ${basename(out)}, then delete the original.`);
  } else if (wide || dirty) {
    // Same file in and out: read into memory first (sharp can't write over its input).
    writeFileSync(full, await encodeSameFormat(readFileSync(full), ext, wide ? MAX_WIDTH : undefined));
    fixed++;
    console.log(`  ${wide ? "RESIZED   " : "CLEANED   "} ${shown}${dirty ? `: removed ${what}` : ""}.`);
  } else if (heavy) {
    console.log(`  LARGE      ${shown} (${kb} KB): already as small as this script makes it; fine to keep.`);
  } else {
    console.log(`  OK         ${shown} (${kb} KB)`);
  }
}

const summary = checkOnly
  ? (problems === 0 ? "\nAll photos are clean." : `\n${problems} photo(s) need attention (see above).`)
  : `\n${fixed} photo(s) updated${problems ? `, ${problems} need attention (see above)` : ""}.`;
console.log(summary);
if (located.size) console.log(`${located.size} photo(s) had a GPS location (where they were taken). Tell the owner in one line, and see rules/deploy.md, "I uploaded my photos".`);
// --check and --strip fail when something couldn't be made safe, so CI shows it.
process.exit((checkOnly || stripOnly) && problems > 0 ? 1 : 0);
