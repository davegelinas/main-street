// Builds dist/favicon.svg (the browser-tab icon) and dist/apple-touch-icon.png
// (180 x 180, the icon "Add to Home Screen" uses) from the business's initial
// and the theme's accent color, so every site gets its own icon. Then renders
// whichever favicon.svg ships (made here or the owner's own) as
// dist/favicon-32.png, for older Safari, which can't show SVG tab icons.
// - The letters are pre-traced (monogram-glyphs.json), so the icons look the
//   same on every build server, with or without fonts installed.
// - Only while public/favicon.svg is the template's stock icon (it carries the
//   STOCK_MARK comment). Once the owner has a real logo icon there, the build
//   leaves both icons alone.
// - Accents are dropped (É uses E). An initial with no traced letter (CJK,
//   for example), or a missing sharp, keeps the plain icons from public/, so
//   the icons always match each other and never show an empty box.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { themeColors } from "./share-image.ts";

type Glyph = { b: [number, number, number, number]; d: string };
type Glyphs = { serif: Record<string, Glyph>; sans: Record<string, Glyph> };

export const STOCK_MARK = "main-street:stock-icon";

// The letter, scaled so a capital H would be `cap` tall, centered in a
// size x size box. Only pre-traced letters: live text would depend on the
// build server's fonts and can come out as an empty box.
function letter(glyphs: Glyphs, ch: string, sans: boolean, size: number, cap: number, color: string): string | null {
  const face = sans ? glyphs.sans : glyphs.serif;
  const g = face[ch.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()];
  if (!g) return null;
  const [x0, y0, x1, y1] = g.b;
  const h = face.H.b[3] - face.H.b[1];
  const s = Math.min(cap / h, (size * 0.72) / (x1 - x0));
  const tx = (size - (x1 - x0) * s) / 2 - x0 * s;
  const ty = (size - (y1 - y0) * s) / 2 - y0 * s;
  return `<path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})" fill="${color}" d="${g.d}"/>`;
}

export async function writeIcons(root: string, outDir: string, cfg: Record<string, any>, initial: string, sans: boolean): Promise<void> {
  await writeMonogramIcons(root, outDir, cfg, initial, sans);
  try {
    const sharp = (await import("sharp")).default;
    await sharp(resolve(outDir, "favicon.svg"), { density: 300 }).resize(32, 32).png().toFile(resolve(outDir, "favicon-32.png"));
  } catch (err) {
    console.warn(`site-config: could not make favicon-32.png: ${(err as Error).message}`);
  }
}

async function writeMonogramIcons(root: string, outDir: string, cfg: Record<string, any>, initial: string, sans: boolean): Promise<void> {
  try {
    if (!initial || !readFileSync(resolve(root, "public/favicon.svg"), "utf8").includes(STOCK_MARK)) return;
    const glyphs = JSON.parse(readFileSync(resolve(root, "plugins/monogram-glyphs.json"), "utf8")) as Glyphs;
    const c = themeColors(root, String(cfg.site?.theme ?? ""));
    const accent = c.accent ?? "#a94e29";
    const ink = c["on-accent"] ?? "#ffffff";

    // Tab icon: the same badge as the header, round (or a rounded square in
    // sans themes, like their brand mark).
    const tabLetter = letter(glyphs, initial, sans, 64, 34, ink);
    const touchLetter = letter(glyphs, initial, sans, 180, 84, ink);
    if (!tabLetter || !touchLetter) return; // no traced letter: keep the plain icons
    const shape = sans ? `<rect width="64" height="64" rx="14" fill="${accent}"/>` : `<circle cx="32" cy="32" r="32" fill="${accent}"/>`;

    // Home-screen icon first: a full square (iPhones round the corners
    // themselves). Only if it renders does the tab icon change too, so the
    // two always match.
    const sharp = (await import("sharp")).default;
    const touch = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" fill="${accent}"/>${touchLetter}</svg>`;
    const touchPng = await sharp(Buffer.from(touch)).png().toBuffer();
    writeFileSync(resolve(outDir, "apple-touch-icon.png"), touchPng);
    writeFileSync(resolve(outDir, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shape}${tabLetter}</svg>\n`);
  } catch (err) {
    console.warn(`site-config: could not make the site icons (favicon.svg, apple-touch-icon.png): ${(err as Error).message}`);
  }
}
