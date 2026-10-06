// Builds dist/images/share.jpg: the 1200 x 630 picture that link previews
// (iMessage, Facebook, WhatsApp, X) show when someone shares the site.
// - With a real hero photo (heroPhoto on, not the placeholder), it's that
//   photo, cropped to fit.
// - Without one, it's a calm landscape in the theme's own colors, read from
//   src/styles.css. No words on it: previews already print the business name
//   next to the picture, and text would need fonts the build server may lack.
// Uses sharp (already installed for optimize-images). If anything goes wrong
// the build still succeeds, and the caller removes the tags that point at
// the missing picture.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type Config = Record<string, any>;

// The page's colors: :root tokens, overridden by the active theme's block.
export function themeColors(root: string, theme: string): Record<string, string> {
  const css = readFileSync(resolve(root, "src/styles.css"), "utf8");
  const vars = (block: string | undefined) =>
    Object.fromEntries([...(block ?? "").matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8})\b/gi)].map((m) => [m[1], m[2]]));
  const safe = theme.replace(/[^\w-]/g, "");
  return {
    ...vars(css.match(/:root\s*\{([^}]*)\}/)?.[1]),
    ...(safe ? vars(css.match(new RegExp(`\\[data-theme="${safe}"\\]\\s*\\{([^}]*)\\}`))?.[1]) : {}),
  };
}

// The hero photo's file, or "" when the hero shows no photo or the placeholder.
function heroPhoto(root: string, outDir: string): string {
  const html = readFileSync(resolve(outDir, "index.html"), "utf8");
  const src = html.match(/<figure class="hero-media">[\s\S]*?<img[^>]*\ssrc="([^"]+)"/)?.[1] ?? "";
  if (!src.startsWith("/") || /\.svg$/i.test(src)) return "";
  const file = resolve(root, "public", `.${decodeURI(src)}`);
  return existsSync(file) ? file : "";
}

function landscape(c: Record<string, string>): string {
  const bg = c["bg-alt"] ?? "#f3ecdf";
  const soft = c["accent-soft"] ?? "#f0ddd0";
  const accent = c.accent ?? "#a94e29";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  <circle cx="850" cy="235" r="120" fill="${soft}"/>
  <path d="M0 450c190-85 370-96 550-38s370 66 650-34V630H0z" fill="${accent}" opacity=".3"/>
  <path d="M0 528c230-58 470-50 690-12s330 18 510-22V630H0z" fill="${accent}"/>
</svg>`;
}

// Returns true when images/share.jpg was written. A hero photo sharp can't
// read falls back to the theme picture rather than to no picture.
export async function writeShareImage(root: string, outDir: string, cfg: Config): Promise<boolean> {
  const out = resolve(outDir, "images/share.jpg");
  const warn = (err: unknown) =>
    console.warn(`site-config: could not make the link-preview picture from the hero photo, so it uses the theme picture: ${(err as Error).message}`);
  try {
    const sharp = (await import("sharp")).default;
    mkdirSync(dirname(out), { recursive: true });
    const make = (input: string | Buffer) =>
      sharp(input)
        .rotate()
        .resize(1200, 630, { fit: "cover", position: "attention" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(out);
    const photo = heroPhoto(root, outDir);
    if (photo) {
      try {
        await make(photo);
        return true;
      } catch (err) {
        warn(err);
      }
    }
    await make(Buffer.from(landscape(themeColors(root, String(cfg.site?.theme ?? "")))));
    return true;
  } catch (err) {
    console.warn(`site-config: could not make the link-preview picture (images/share.jpg): ${(err as Error).message}`);
    return false;
  }
}
