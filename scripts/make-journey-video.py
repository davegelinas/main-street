#!/usr/bin/env python3
"""Build the journey video: the everyday loop of changing your website.

What it shows (36 seconds, no sound): the owner of Maple Street Bakery taps
the Edit my website button on their phone, says what they want in plain
words, gets a preview link, looks at the change on their phone, says
"ship it" (live in about a minute), and later says "undo that".

How it is made: programmatic kinetic typography. Every on-screen word is an
exact string in this file (STEPS, CLOSE, the chat, DEMO_*), drawn with Pillow
and encoded with ffmpeg, so nothing can be garbled. The phone screen that shows
the website is a real screenshot: the script scaffolds a throwaway site from
template/ (scripts/new-site.mjs), fills in the demo bakery below, builds it,
and photographs it at phone size (390 px wide, 2x) with Chrome's headless
shell. So the video always shows the template as it is today.

Visual language follows template/src/styles.css (terracotta theme): paper
background, ink text, terracotta accent, Fraunces display headlines (the
site's own font file), a system sans for everything else. House rules: no em
dashes on screen, and no jargon beyond "preview link", "ship it" and
"undo that".

Regenerate (from the toolkit root, macOS or Linux):

    python3 -m venv /tmp/ms-video && /tmp/ms-video/bin/pip install Pillow
    /tmp/ms-video/bin/python scripts/make-journey-video.py

Needs ffmpeg, Node and npm (the throwaway site runs npm install), and Chrome's
headless shell (`npx playwright install chromium` puts it where this script
looks; or set MAIN_STREET_CHROME to its path). Pass --shots DIR to keep the
screenshots and reuse them on the next run, and --frames DIR to write a still
every 2 seconds instead of a video, for checking.

Fonts are found automatically: Fraunces from template/public/fonts, then
SF Pro or Helvetica Neue on macOS, Noto or DejaVu on Linux. Override with
MAIN_STREET_VIDEO_SERIF, MAIN_STREET_VIDEO_SANS and MAIN_STREET_VIDEO_SANS_BOLD
(paths to .ttf, .otf or .woff2 files). If your Pillow can't read .woff2,
`pip install fonttools brotli` lets the script convert Fraunces itself;
without it the headlines fall back to a system serif.

The engine (everything above the story section) is shared with
make-end-to-end-video.py. Keep the two copies in sync.

Outputs (defaults):
  template/docs/assets/journey.mp4
  template/docs/assets/journey-poster.png
"""

import argparse
import functools
import glob
import http.server
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import threading

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
except ImportError:
    sys.exit("Pillow is missing. Install it in a virtual environment:\n"
             "  python3 -m venv /tmp/ms-video && /tmp/ms-video/bin/pip install Pillow")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- palette ---
# template/src/styles.css, terracotta theme.
BG = (250, 246, 239)           # --bg
BG_ALT = (243, 236, 223)       # --bg-alt
SURFACE = (255, 253, 248)      # --surface
INK = (46, 38, 32)             # --ink
INK_SOFT = (92, 81, 72)        # --ink-soft
ACCENT = (169, 78, 41)         # --accent
ACCENT_DEEP = (135, 57, 27)    # --accent-deep
ACCENT_TEXT = (154, 67, 35)    # --accent-text
ACCENT_SOFT = (240, 221, 208)  # --accent-soft
HIGHLIGHT = (201, 154, 46)     # --highlight
LINE = (229, 217, 200)         # --line
WHITE = (255, 255, 255)
BEZEL = (31, 25, 21)

W, H = 1280, 720
FPS = 30

# ------------------------------------------------------------------ fonts ---
FRAUNCES = os.path.join(REPO, "template/public/fonts/fraunces-latin.woff2")
SFNS = "/System/Library/Fonts/SFNS.ttf"
HELVETICA_NEUE = "/System/Library/Fonts/HelveticaNeue.ttc"
LINUX_FONT_DIRS = [
    "/usr/share/fonts/truetype/noto", "/usr/share/fonts/opentype/noto",
    "/usr/share/fonts/noto", "/usr/share/fonts/google-noto",
    "/usr/share/fonts/truetype/dejavu", "/usr/share/fonts/dejavu",
]


def _linux(*names):
    return [(os.path.join(d, n), 0, None) for n in names for d in LINUX_FONT_DIRS]


# role: (override env var, weight for variable fonts, [(path, ttc index, style)])
FONT_ROLES = {
    "serif": ("MAIN_STREET_VIDEO_SERIF", 640,
              [(FRAUNCES, 0, None),
               ("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 0, None)]
              + _linux("NotoSerif-SemiBold.ttf", "NotoSerif-Bold.ttf", "DejaVuSerif-Bold.ttf")),
    "sans": ("MAIN_STREET_VIDEO_SANS", 400,
             [(SFNS, 0, None), (HELVETICA_NEUE, 0, "Regular")]
             + _linux("NotoSans-Regular.ttf", "DejaVuSans.ttf")),
    "bold": ("MAIN_STREET_VIDEO_SANS_BOLD", 600,
             [(SFNS, 0, None), (HELVETICA_NEUE, 1, "Bold")]
             + _linux("NotoSans-SemiBold.ttf", "NotoSans-Bold.ttf", "DejaVuSans-Bold.ttf")),
}


@functools.lru_cache(maxsize=None)
def _woff2_to_ttf(path):
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        raise OSError("this Pillow can't read .woff2 and fontTools isn't installed (pip install fonttools brotli)")
    out = os.path.join(tempfile.mkdtemp(prefix="ms-font-"), os.path.basename(path).rsplit(".", 1)[0] + ".ttf")
    f = TTFont(path)
    f.flavor = None
    f.save(out)
    return out


def _open_font(path, index, size):
    try:
        return ImageFont.truetype(path, size, index=index)
    except OSError:
        if not path.endswith(".woff2"):
            raise
        return ImageFont.truetype(_woff2_to_ttf(path), size, index=index)


@functools.lru_cache(maxsize=None)
def _face(role):
    env, _weight, cands = FONT_ROLES[role]
    if os.environ.get(env):
        cands = [(os.environ[env], 0, None)]
    tried = []
    for path, index, style in cands:
        if not os.path.exists(path):
            tried.append(f"{path} (not found)")
            continue
        try:
            f = _open_font(path, index, 24)
        except OSError as e:
            tried.append(f"{path} ({e})")
            continue
        if style and f.getname()[1] != style:
            tried.append(f"{path} (face {index} is {f.getname()[1]}, wanted {style})")
            continue
        return path, index
    sys.exit(f"No usable font for {role} text. Tried:\n  " + "\n  ".join(tried)
             + f"\nSet {env}=/path/to/font.ttf, or on Linux install Noto (apt install fonts-noto-core).")


@functools.lru_cache(maxsize=None)
def font(role, size):
    path, index = _face(role)
    f = _open_font(path, index, size)
    try:
        axes = f.get_variation_axes()
    except Exception:  # static font, or a FreeType without variable-font support
        return f
    vals = []
    for a in axes:
        name = a["name"].decode() if isinstance(a["name"], bytes) else a["name"]
        v = a["default"]
        if name == "Weight":
            v = FONT_ROLES[role][1]
        elif name == "Optical Size":
            v = size
        vals.append(max(a["minimum"], min(a["maximum"], v)))
    try:
        f.set_variation_by_axes(vals)
    except Exception:
        pass
    return f


# ---------------------------------------------------------------- helpers ---
def clamp01(t):
    return max(0.0, min(1.0, t))


def ease_out(t):
    t = clamp01(t)
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    t = clamp01(t)
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def ease_back(t):
    """Overshoots a little, then settles: for things that pop in."""
    t = clamp01(t)
    c = 1.9
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def mix(a, b, p):
    return tuple(int(round(x + (y - x) * p)) for x, y in zip(a, b))


@functools.lru_cache(maxsize=256)
def _alpha_lut(a255):
    return [v * a255 // 255 for v in range(256)]


def put(base, sprite, x, y, alpha=1.0):
    """Alpha-composite an RGBA sprite onto base at (x, y), clipped, faded."""
    if alpha <= 0.004:
        return
    x, y = int(round(x)), int(round(y))
    sw, sh = sprite.size
    l, t = max(0, -x), max(0, -y)
    r, b = min(sw, base.width - x), min(sh, base.height - y)
    if r <= l or b <= t:
        return
    if (l, t, r, b) != (0, 0, sw, sh):
        sprite = sprite.crop((l, t, r, b))
    if alpha < 0.996:
        sprite = sprite.copy()
        sprite.putalpha(sprite.getchannel("A").point(_alpha_lut(int(alpha * 255))))
    base.alpha_composite(sprite, (x + l, y + t))


def scaled(sprite, s):
    if abs(s - 1) < 0.01:
        return sprite
    w, h = max(1, int(sprite.width * s)), max(1, int(sprite.height * s))
    return sprite.resize((w, h), Image.LANCZOS)


# ------------------------------------------------------------------- text ---
def text_w(s, role, size):
    return font(role, size).getlength(s)


@functools.lru_cache(maxsize=8192)
def text_sprite(s, role, size, color):
    f = font(role, size)
    l, t, r, b = f.getbbox(s, anchor="ls")
    img = Image.new("RGBA", (r - l + 4, b - t + 4), color + (0,))
    ImageDraw.Draw(img).text((2 - l, 2 - t), s, font=f, fill=color + (255,), anchor="ls")
    return img, l - 2, t - 2


def draw_text(base, x, y, s, role, size, color, alpha=1.0, align="l"):
    """Draw s with its baseline at y; align is l, m or r."""
    img, ox, oy = text_sprite(s, role, size, color)
    if align != "l":
        x -= text_w(s, role, size) / (2 if align == "m" else 1)
    put(base, img, x + ox, y + oy, alpha)


def spaced_w(s, role, size, track):
    return sum(text_w(ch, role, size) + track for ch in s) - track


def draw_spaced(base, x, y, s, role, size, color, track, alpha=1.0):
    """Letter-spaced small caps, like the site's eyebrow labels."""
    for ch in s:
        if ch != " ":
            draw_text(base, x, y, ch, role, size, color, alpha)
        x += text_w(ch, role, size) + track


def _greedy(words, role, size, max_w):
    lines, cur = [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if text_w(trial, role, size) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    return lines + ([cur] if cur else [])


def wrap(s, role, size, max_w, max_lines=None, mode="pretty"):
    """Word wrap that refuses to overflow. A newline in s forces a break.

    mode "pretty" avoids a lone word on the last line; "balance" evens out
    the line lengths (like CSS text-wrap: balance). Raises if a word is wider
    than max_w or the text needs more than max_lines.
    """
    if "\n" in s:
        lines = [ln for part in s.split("\n") for ln in wrap(part, role, size, max_w, None, mode)]
        if max_lines and len(lines) > max_lines:
            raise ValueError(f"text needs {len(lines)} lines, max {max_lines}: {s!r}")
        return lines
    words = s.split()
    for word in words:
        if text_w(word, role, size) > max_w:
            raise ValueError(f"word too wide for {max_w}px: {word!r} in {s!r}")
    lines = _greedy(words, role, size, max_w)
    n = len(lines)
    if n > 1 and (mode == "balance" or len(lines[-1].split()) == 1):
        lo, hi = max_w * 0.4, max_w
        while hi - lo > 2:
            mid = (lo + hi) / 2
            if len(_greedy(words, role, size, mid)) == n:
                hi = mid
            else:
                lo = mid
        trial = _greedy(words, role, size, hi)
        if mode == "balance":
            lines = trial
        else:  # pretty: only narrow as far as it takes to lose the orphan
            w_ = max_w
            while w_ > hi:
                trial = _greedy(words, role, size, w_)
                if len(trial) == n and len(trial[-1].split()) > 1:
                    lines = trial
                    break
                w_ -= 4
    if max_lines and len(lines) > max_lines:
        raise ValueError(f"text needs {len(lines)} lines, max {max_lines}: {s!r}")
    return lines


def check_fits(s, role, size, max_w):
    if text_w(s, role, size) > max_w:
        raise ValueError(f"text too wide for {max_w}px: {s!r}")


def rich_words(s):
    """Split a headline into (word, accent) pairs; {braces} mark accent words."""
    out, accent = [], False
    for word in s.split():
        start = word.startswith("{")
        end = word.endswith("}")
        out.append((word.strip("{}"), accent or start))
        accent = (accent or start) and not end
    return out


# ----------------------------------------------------------------- shapes ---
SS = 4  # supersampling for smooth edges


@functools.lru_cache(maxsize=4096)
def rrect(w, h, r, fill, outline=None, ow=0):
    w, h = int(round(w)), int(round(h))
    r = min(r, w / 2, h / 2)
    big = Image.new("RGBA", (w * SS, h * SS), (fill or outline) + (0,))
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, w * SS - 1, h * SS - 1], int(r * SS),
        fill=fill + (255,) if fill else None,
        outline=outline + (255,) if outline else None, width=int(ow * SS))
    return big.resize((w, h), Image.BOX)


@functools.lru_cache(maxsize=1024)
def disc(d, fill, outline=None, ow=0):
    d = int(round(d))
    big = Image.new("RGBA", (d * SS, d * SS), (fill or outline) + (0,))
    ImageDraw.Draw(big).ellipse(
        [0, 0, d * SS - 1, d * SS - 1], fill=fill + (255,) if fill else None,
        outline=outline + (255,) if outline else None, width=int(ow * SS))
    return big.resize((d, d), Image.BOX)


@functools.lru_cache(maxsize=64)
def shadow(w, h, r, blur, strength):
    """Soft drop shadow sprite; returns (sprite, pad)."""
    pad = blur * 3
    m = Image.new("L", (w + 2 * pad, h + 2 * pad), 0)
    ImageDraw.Draw(m).rounded_rectangle([pad, pad, pad + w, pad + h], r, fill=int(255 * strength))
    m = m.filter(ImageFilter.GaussianBlur(blur))
    img = Image.new("RGBA", m.size, INK + (0,))
    img.putalpha(m)
    return img, pad


def _glyph_canvas(size):
    big = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    return big, ImageDraw.Draw(big), size * SS / 24.0  # drawn on a 24-unit grid


def _glyph_done(big, size):
    return big.resize((size, size), Image.BOX)


@functools.lru_cache(maxsize=64)
def glyph(name, size, color):
    """Small line icons drawn on a 24-unit grid (like the site's SVG icons)."""
    big, d, u = _glyph_canvas(size)
    c = color + (255,)
    sw = int(2.2 * u)

    def line(pts, w=sw):
        d.line([(x * u, y * u) for x, y in pts], fill=c, width=w, joint="curve")
        for x, y in (pts[0], pts[-1]):
            d.ellipse([x * u - w / 2, y * u - w / 2, x * u + w / 2, y * u + w / 2], fill=c)

    if name == "check":
        line([(5.5, 12.5), (10, 17), (18.5, 7.5)], int(3 * u))
    elif name == "lock":
        d.rounded_rectangle([5 * u, 10.5 * u, 19 * u, 21 * u], int(2.5 * u), fill=c)
        d.arc([8 * u, 3.5 * u, 16 * u, 14.5 * u], 180, 360, fill=c, width=int(2.4 * u))
        d.line([(8 * u + 1.2 * u, 9 * u), (8 * u + 1.2 * u, 11 * u)], fill=c, width=int(2.4 * u))
        d.line([(16 * u - 1.2 * u, 9 * u), (16 * u - 1.2 * u, 11 * u)], fill=c, width=int(2.4 * u))
    elif name == "pencil":
        # a pencil pointing down-left: body, tip, and eraser band
        d.polygon([(6.2 * u, 15.4 * u), (15.6 * u, 6 * u), (18 * u, 8.4 * u), (8.6 * u, 17.8 * u)], fill=c)
        d.polygon([(6.2 * u, 15.4 * u), (8.6 * u, 17.8 * u), (4.6 * u, 19.4 * u)], fill=c)
        d.polygon([(16.4 * u, 5.2 * u), (17.4 * u, 4.2 * u), (19.8 * u, 6.6 * u), (18.8 * u, 7.6 * u)], fill=c)
    elif name == "mic":
        d.rounded_rectangle([9 * u, 3 * u, 15 * u, 14 * u], int(3 * u), fill=c)
        d.arc([5.5 * u, 6 * u, 18.5 * u, 17.5 * u], 0, 180, fill=c, width=sw)
        line([(12, 17.5), (12, 21)])
    elif name == "arrow":
        line([(5, 12), (18, 12)])
        line([(13, 7), (18, 12), (13, 17)])
    elif name == "spark":
        d.polygon([(12 * u, 2 * u), (14 * u, 10 * u), (22 * u, 12 * u), (14 * u, 14 * u),
                   (12 * u, 22 * u), (10 * u, 14 * u), (2 * u, 12 * u), (10 * u, 10 * u)], fill=c)
    elif name == "phone":
        d.polygon([(5 * u, 4 * u), (8.5 * u, 4 * u), (10.3 * u, 8.6 * u), (8 * u, 10.1 * u),
                   (13.9 * u, 16 * u), (15.4 * u, 13.7 * u), (20 * u, 15.5 * u), (20 * u, 19 * u),
                   (18 * u, 21 * u), (3 * u, 6 * u)], fill=c)
    else:
        raise ValueError(name)
    return _glyph_done(big, size)


def ripple(img, cx, cy, since, color=WHITE):
    """A tap: a soft ring that grows and fades over half a second."""
    if since < 0 or since > 0.6:
        return
    p = since / 0.6
    d = 14 + 70 * ease_out(p)
    put(img, disc(int(d), color), cx - d / 2, cy - d / 2, 0.45 * (1 - p))
    dot = disc(26, color)
    put(img, dot, cx - 13, cy - 13, 0.5 * clamp01(1 - since / 0.3))


# ------------------------------------------------------------------ phone ---
SW, SH = 296, 640          # screen
BZ = 12                    # bezel
PW, PH = SW + 2 * BZ, SH + 2 * BZ
PCX = 930                  # phone center x
PX, PY = PCX - PW // 2, (H - PH) // 2
STATUS_H = 38
SEAL_R = 292               # the big soft circle behind the phone


@functools.lru_cache(maxsize=None)
def phone_parts():
    body = rrect(PW, PH, 54, BEZEL, (78, 66, 57), 1.5)
    mask = rrect(SW, SH, 42, WHITE).getchannel("A")
    sh, pad = shadow(PW, PH, 54, 22, 0.32)
    return body, mask, sh, pad


def draw_phone(base, screen, dy=0.0, alpha=1.0):
    body, mask, sh, pad = phone_parts()
    layer = Image.new("RGBA", (PW + 2 * pad, PH + 2 * pad + 18), (0, 0, 0, 0))
    layer.alpha_composite(sh, (0, 18))
    layer.alpha_composite(body, (pad, pad))
    layer.paste(screen.convert("RGB"), (pad + BZ, pad + BZ), mask)
    put(base, layer, PX - pad, PY - pad + dy, alpha)


def status_bar(img, bg, light=False):
    """Time, island and battery along the top of the screen."""
    img.paste(bg + (255,), (0, 0, SW, STATUS_H))
    fg = WHITE if light else INK
    draw_text(img, 34, 26, "9:41", "bold", 13, fg)
    put(img, rrect(86, 25, 12.5, (12, 10, 9)), (SW - 86) / 2, 9)
    put(img, rrect(23, 12, 3.5, None, fg, 1.2), SW - 50, 16)
    put(img, rrect(17, 7, 2, fg), SW - 47, 18.5)


def screen_with_status(bg, light=False):
    img = Image.new("RGBA", (SW, SH), bg + (255,))
    status_bar(img, bg, light)
    return img


def push(a, b, p, back=False):
    """iOS-style push: b slides over a from the right (or a returns, if back)."""
    p = ease_in_out(p)
    if back:
        a, b, p = b, a, 1 - p
    out = Image.new("RGBA", (SW, SH))
    out.paste(a, (int(-SW * 0.28 * p), 0))
    put(out, rrect(SW, SH, 1, INK), 0, 0, 0.12 * p)
    sh, pad = shadow(SW, SH, 0, 8, 0.25)
    bx = int(SW * (1 - p))
    put(out, sh, bx - pad, -pad)
    out.paste(b, (bx, 0))
    return out


def zoom_open(back, front, rect, p):
    """Open front from rect (an icon or button) to the full screen."""
    p = ease_in_out(p)
    x, y, w, h = rect
    nx, ny = x * (1 - p), y * (1 - p)
    nw, nh = w + (SW - w) * p, h + (SH - h) * p
    out = back.copy()
    put(out, rrect(SW, SH, 1, INK), 0, 0, 0.18 * p)
    small = front.resize((max(1, int(nw)), max(1, int(nh))), Image.LANCZOS)
    m = rrect(int(nw), int(nh), 14 + 28 * p, WHITE).getchannel("A")
    small.putalpha(m.point(_alpha_lut(int(255 * clamp01(p * 3)))))
    out.alpha_composite(small, (int(nx), int(ny)))
    return out


def crossfade(a, b, p):
    return Image.blend(a, b, ease_in_out(p))


# ------------------------------------------------------------ site screen ---
class Shot:
    """A real screenshot, scaled to the phone screen's width."""

    HEADER_CSS = 65  # the sticky site header, in CSS pixels

    def __init__(self, path):
        with Image.open(path) as f:
            src = f.convert("RGB")
        self.scale = SW / src.width
        self.img = src.resize((SW, int(src.height * self.scale)), Image.LANCZOS).convert("RGBA")
        self.top = self.img.getpixel((3, 3))[:3]
        self.header = self.img.crop((0, 0, SW, int(round(self.HEADER_CSS * 2 * self.scale))))

    def css(self, px):
        return px * 2 * self.scale


def site_screen(shot, scroll=0.0, url=None, url_p=0.0, ring=0.0):
    light = sum(shot.top) < 380
    img = screen_with_status(shot.top, light)
    s = int(round(scroll))
    img.paste(shot.img.crop((0, s, SW, s + SH - STATUS_H)), (0, STATUS_H))
    if s > 0:  # the site header is sticky
        img.paste(shot.header, (0, STATUS_H))
    if ring > 0:  # point at the notices band along the top
        put(img, rrect(SW - 8, int(shot.css(37)) + 2, 8, None, HIGHLIGHT, 3), 4, STATUS_H, ring)
    if url and url_p > 0:
        pw, ph = 262, 40
        y = SH - 18 - ph + (1 - ease_out(url_p)) * 70
        sh, pad = shadow(pw, ph, 20, 8, 0.22)
        put(img, sh, (SW - pw) / 2 - pad, y - pad + 4, url_p)
        put(img, rrect(pw, ph, 20, WHITE), (SW - pw) / 2, y, url_p)
        check_fits(url, "sans", 13, pw - 48)
        tw = text_w(url, "sans", 13) + 18
        x = (SW - tw) / 2
        put(img, glyph("lock", 13, INK_SOFT), x, y + 13, url_p)
        draw_text(img, x + 18, y + 25, url, "sans", 13, INK, url_p)
    return img


# ------------------------------------------------------------ home screen ---
HOME_ICON = (19, 386, 54, 54)  # x, y, w, h of the Edit my website icon
HOME_LABEL = "Edit my website"
APP_TONES = [(247, 238, 226), (226, 200, 176), (197, 160, 132), (236, 222, 205),
             (214, 182, 154), (250, 244, 236), (186, 146, 118), (230, 212, 192)]


@functools.lru_cache(maxsize=None)
def home_base():
    """A generic phone home screen in the theme's warm tones. No real apps."""
    img = Image.new("RGBA", (SW, SH))
    top, bot = (240, 222, 207), (199, 141, 108)
    grad = Image.new("RGBA", (1, SH))
    for y in range(SH):
        grad.putpixel((0, y), mix(top, bot, y / SH) + (255,))
    img.paste(grad.resize((SW, SH)), (0, 0))
    status_bar(img, (240, 222, 207))
    # a widget, then two rows of app icons
    put(img, rrect(SW - 38, 130, 24, WHITE), 19, 64, 0.34)
    put(img, disc(46, WHITE), 37, 84, 0.6)
    put(img, rrect(120, 9, 4.5, WHITE), 37, 146, 0.7)
    put(img, rrect(84, 9, 4.5, WHITE), 37, 164, 0.5)
    k = 0
    for row in range(2):
        for col in range(4):
            x, y = 19 + col * 68, 214 + row * 86
            put(img, rrect(54, 54, 13, APP_TONES[k % len(APP_TONES)]), x, y)
            put(img, rrect(34, 5, 2.5, WHITE), x + 10, y + 63, 0.7)
            k += 3
    for i in range(2):
        put(img, disc(7, WHITE), SW / 2 - 9 + i * 12, 516, 0.9 if i == 0 else 0.45)
    dock_y = SH - 100
    put(img, rrect(SW - 24, 84, 32, WHITE), 12, dock_y, 0.32)
    for col in range(4):
        put(img, rrect(54, 54, 13, APP_TONES[(col * 5 + 1) % len(APP_TONES)]), 19 + col * 68, dock_y + 15)
    return img


@functools.lru_cache(maxsize=None)
def edit_icon():
    icon = rrect(54, 54, 13, ACCENT).copy()
    put(icon, glyph("pencil", 30, WHITE), 12, 12)
    return icon


def home_screen(pop=1.0, tap_since=-1.0):
    """Home screen; pop is the Edit my website icon's arrival (0 to 1)."""
    img = home_base().copy()
    x, y, w, h = HOME_ICON
    if pop > 0:
        s = ease_back(pop)
        if 0 <= tap_since <= 0.25:  # pressed
            s *= 1 - 0.08 * math.sin(math.pi * tap_since / 0.25)
        icon = scaled(edit_icon(), s)
        put(img, icon, x + (w - icon.width) / 2, y + (h - icon.height) / 2, clamp01(pop * 2))
        check_fits(HOME_LABEL, "bold", 11, 2 * (x + w / 2) - 4)
        draw_text(img, x + w / 2, y + 71, HOME_LABEL, "bold", 11, WHITE, clamp01(pop * 2 - 0.6), "m")
    ripple(img, x + w / 2, y + h / 2, tap_since)
    return img


# ------------------------------------------------------------------- chat ---
BUBBLE_TEXT_W = 190
BUBBLE_SIZE, BUBBLE_LH = 13, 18
CHAT_HEAD_H = 56
INPUT_PLACEHOLDER = "Reply..."
TYPE_CPS = 26


@functools.lru_cache(maxsize=256)
def bubble(who, text, chip=None):
    lines = wrap(text, "sans", BUBBLE_SIZE, BUBBLE_TEXT_W, 6)
    tw = max(text_w(ln, "sans", BUBBLE_SIZE) for ln in lines)
    if chip:
        check_fits(chip, "bold", 13, 150)
        tw = max(tw, 176)
    w = int(tw + 26)
    h = int(len(lines) * BUBBLE_LH + 18 + (46 if chip else 0))
    me = who == "me"
    img = rrect(w, h, 17, ACCENT if me else BG_ALT).copy()
    for i, ln in enumerate(lines):
        draw_text(img, 13, 22 + i * BUBBLE_LH, ln, "sans", BUBBLE_SIZE, WHITE if me else INK)
    if chip:
        cy = h - 46
        put(img, rrect(w - 16, 38, 11, SURFACE, LINE, 1), 8, cy)
        put(img, disc(24, ACCENT_SOFT), 16, cy + 7)
        put(img, glyph("arrow", 14, ACCENT_TEXT), 21, cy + 12)
        draw_text(img, 48, cy + 24, chip, "bold", 13, ACCENT_TEXT)
    return img


@functools.lru_cache(maxsize=None)
def typing_bubble():
    return rrect(56, 34, 17, BG_ALT)


class Chat:
    """A chat with your AI. Times are seconds on the video's global clock.

    msgs: (t, who, text, chip) with who "ai" or "me". The AI "types" for a
    moment before each of its messages.
    draft: optional (t_open, t_type, t_send, prefill, typed): the message box
    holds prefill from t_open, the owner types from t_type, and the whole
    thing is sent as a "me" message at t_send.
    mic_hint: optional (t0, t1) while the voice-note button glows.
    """

    def __init__(self, msgs, draft=None, mic_hint=None):
        self.msgs = list(msgs)
        self.draft = draft
        self.mic_hint = mic_hint  # (t0, t1): pulse the voice-note button
        if draft:
            _, _, t_send, prefill, typed = draft
            self.msgs.append((t_send, "me", prefill + typed, None))
        self.msgs.sort(key=lambda m: m[0])
        self.chip_at = None  # where the newest preview link sits, for taps
        for _, who, text, chip in self.msgs:
            bubble(who, text, chip)  # fail early if anything doesn't fit

    def _has_chip(self, sprite):
        return any(chip and bubble(who, text, chip) is sprite for _, who, text, chip in self.msgs)

    def input_text(self, t):
        if not self.draft:
            return ""
        t_open, t_type, t_send, prefill, typed = self.draft
        if not (t_open <= t < t_send):
            return ""
        n = int(clamp01((t - t_type) * TYPE_CPS / max(1, len(typed))) * len(typed)) if t >= t_type else 0
        return prefill + typed[:n]

    def render(self, t):
        img = screen_with_status(SURFACE)
        # header: who you're talking to, and which site
        hy = STATUS_H
        put(img, disc(32, ACCENT_SOFT), 16, hy + 11)
        put(img, glyph("spark", 16, ACCENT), 24, hy + 19)
        draw_text(img, 58, hy + 24, "Your AI", "bold", 14, INK)
        draw_text(img, 58, hy + 41, "maple-street-bakery", "sans", 11, INK_SOFT)
        img.paste(LINE + (255,), (0, hy + CHAT_HEAD_H - 1, SW, hy + CHAT_HEAD_H))

        # message box, growing upward with its text
        draft = self.input_text(t)
        lines = wrap(draft, "sans", 13, 206, 5) if draft else [INPUT_PLACEHOLDER]
        ih = max(40, len(lines) * 18 + 20)
        iy = SH - 22 - ih
        put(img, rrect(SW - 24, ih, 20, BG, LINE, 1), 12, iy)
        for i, ln in enumerate(lines):
            draw_text(img, 28, iy + 25 + i * 18, ln, "sans", 13, INK if draft else INK_SOFT)
        if draft and self.draft and t < self.draft[1] + len(self.draft[4]) / TYPE_CPS + 0.6 and (t * 2.4) % 1 < 0.6:
            cx = 28 + text_w(lines[-1], "sans", 13) + 1
            img.paste(ACCENT + (255,), (int(cx), iy + 13 + (len(lines) - 1) * 18, int(cx) + 2, iy + 29 + (len(lines) - 1) * 18))
        mic = INK_SOFT
        if self.mic_hint and self.mic_hint[0] <= t < self.mic_hint[1]:
            k = clamp01(min(t - self.mic_hint[0], self.mic_hint[1] - t) / 0.25)
            grow = ((t - self.mic_hint[0]) % 0.9) / 0.9
            d = 30 + 14 * grow
            put(img, disc(32, ACCENT_SOFT), SW - 53, iy + ih - 37, k)
            put(img, disc(int(d), None, ACCENT, 1.5), SW - 37 - d / 2, iy + ih - 21 - d / 2, k * (1 - grow))
            mic = ACCENT_TEXT if k > 0.5 else INK_SOFT
        put(img, glyph("mic", 18, mic), SW - 46, iy + ih - 30)

        # messages, newest at the bottom; older ones scroll up and away
        top, bottom = hy + CHAT_HEAD_H, iy - 10
        items = []
        for mt, who, text, chip in self.msgs:
            if t >= mt:
                items.append((bubble(who, text, chip), who, clamp01((t - mt) / 0.35)))
            elif who == "ai" and t >= mt - 0.9:
                items.append((None, "ai", clamp01((t - mt + 0.9) / 0.2)))
        gap = 10
        total = 12 + sum((s.height if s else 34) * ease_out(p) + gap for s, _, p in items)
        area = Image.new("RGBA", (SW, bottom - top), SURFACE + (255,))
        y = 12 - max(0, total - area.height)
        for s, who, p in items:
            e = ease_out(p)
            if s is None:  # the AI is typing
                put(area, typing_bubble(), 14, y, p)
                for i in range(3):
                    a = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(t * 9 - i * 0.9))
                    put(area, disc(7, INK_SOFT), 14 + 14 + i * 11, y + 14, p * a)
                y += 34 * e + gap
                continue
            x = SW - 14 - s.width if who == "me" else 14
            put(area, s, x, y + (1 - e) * 14, p)
            if who == "ai" and s.height > 60 and self._has_chip(s):
                self.chip_at = (x + s.width / 2, top + y + s.height - 27)
            y += s.height * e + gap
        img.alpha_composite(area, (0, top))
        return img


# ------------------------------------------------------------ guide screen ---
def guide_screen(rows_done, t, guide, tap_since=-1.0):
    """The setup guide on a phone: steps so far ticked, the big link, what's next."""
    img = screen_with_status(SURFACE)
    check_fits(guide["title"], "serif", 25, SW - 40)
    draw_text(img, 20, STATUS_H + 46, guide["title"], "serif", 25, INK)
    draw_text(img, 20, STATUS_H + 69, guide["sub"], "sans", 12, INK_SOFT)
    y = STATUS_H + 88

    def row(y, label, done, dim=False):
        check_fits(label, "sans", 13, SW - 76)
        put(img, disc(24, LINE), 20, y + 11)
        if done > 0:
            dd = scaled(disc(24, ACCENT), ease_back(done))
            put(img, dd, 32 - dd.width / 2, y + 23 - dd.height / 2)
            put(img, glyph("check", 16, WHITE), 24, y + 15, clamp01(done * 2 - 0.5))
        draw_text(img, 56, y + 28, label, "sans", 13, INK_SOFT if dim else INK)
        img.paste(LINE + (255,), (20, y + 45, SW - 20, y + 46))

    for i, label in enumerate(guide["done"]):
        row(y, label, clamp01(rows_done - i))
        y += 46
    cy = y + 16
    put(img, rrect(SW - 32, 146, 18, BG_ALT), 16, cy)
    draw_spaced(img, 34, cy + 30, guide["card_kicker"], "bold", 10, ACCENT_TEXT, 2.2)
    check_fits(guide["card_title"], "serif", 18, SW - 68)
    draw_text(img, 34, cy + 57, guide["card_title"], "serif", 18, INK)
    check_fits(guide["button"], "bold", 14, SW - 90)
    bx, by, bw, bh = 30, cy + 78, SW - 60, 46
    put(img, rrect(bw, bh, 23, ACCENT), bx, by)
    draw_text(img, SW / 2, by + 28, guide["button"], "bold", 14, WHITE, 1.0, "m")
    ripple(img, SW / 2, by + bh / 2, tap_since)
    y = cy + 146 + 8
    for label in guide["next"]:
        row(y, label, 0, dim=True)
        y += 46
    return img, (bx, by, bw, bh)


# ------------------------------------------------------- slide furniture ---
BRAND = "Main Street"
TEXT_X, TEXT_W = 96, 540
HEAD_SIZE, HEAD_LH = 54, 60
SUB_SIZE, SUB_LH = 23, 35
HEAD_SUB_GAP = 54  # last headline baseline to first sub baseline
TEXT_EXIT = 0.4


@functools.lru_cache(maxsize=None)
def slide_bg(seal=True):
    img = Image.new("RGBA", (W, H), BG + (255,))
    if seal:  # the site's hero seal: a soft disc with a fine ring
        put(img, disc(SEAL_R * 2, BG_ALT), PCX - SEAL_R, H / 2 - SEAL_R)
        r2 = SEAL_R - 26
        put(img, disc(r2 * 2, None, LINE, 1.5), PCX - r2, H / 2 - r2)
    put(img, disc(36, ACCENT), TEXT_X, 38)
    draw_text(img, TEXT_X + 18, 63, "M", "serif", 21, WHITE, 1.0, "m")
    draw_text(img, TEXT_X + 48, 64, BRAND, "serif", 23, INK)
    return img


def eyebrow(img, x, y, label, alpha, center=False):
    tw = spaced_w(label, "bold", 15, 3.2)
    if center:
        x = (W - tw) / 2
        put(img, rrect(26, 2, 1, ACCENT), x - 40, y - 6, alpha)
        put(img, rrect(26, 2, 1, ACCENT), x + tw + 14, y - 6, alpha)
    else:
        put(img, rrect(26, 2, 1, ACCENT), x, y - 6, alpha)
        x += 40
    draw_spaced(img, x, y, label, "bold", 15, ACCENT_TEXT, 3.2, alpha)


@functools.lru_cache(maxsize=None)
def block_layout(head, sub):
    """Headline lines as [(word, accent, x offset)], sub lines, and the top y."""
    lines = []
    for part in head.split("\n"):  # {braces} must open and close within a line
        words = rich_words(part)
        k = 0
        for ln in wrap(" ".join(w for w, _ in words), "serif", HEAD_SIZE, TEXT_W):
            row, n = [], len(ln.split())
            for j in range(n):
                word, acc = words[k + j]
                prefix = " ".join(w for w, _ in words[k:k + j])
                row.append((word, acc, text_w(prefix + " ", "serif", HEAD_SIZE) if j else 0.0))
            lines.append(row)
            k += n
    if len(lines) > 3:
        raise ValueError(f"headline needs {len(lines)} lines, max 3: {head!r}")
    sub_lines = wrap(sub, "sans", SUB_SIZE, TEXT_W, 4)
    height = 30 + HEAD_SIZE * 0.86 + (len(lines) - 1) * HEAD_LH + HEAD_SUB_GAP + (len(sub_lines) - 1) * SUB_LH + 8
    top = (H - height) / 2 + 4
    return lines, sub_lines, top


def text_block(img, label, head, sub, t, dur):
    lines, sub_lines, top = block_layout(head, sub)
    out = 1 - ease_in_out((t - (dur - TEXT_EXIT)) / TEXT_EXIT)
    lift = -10 * (1 - out)
    eyebrow(img, TEXT_X, top + 14 + lift, label, clamp01(t / 0.4) * out)
    y = top + 30 + HEAD_SIZE * 0.86
    k = 0
    for i, line in enumerate(lines):
        for word, acc, dx in line:
            p = ease_out((t - 0.15 - k * 0.06) / 0.5)
            draw_text(img, TEXT_X + dx, y + 22 * (1 - p) + lift, word, "serif", HEAD_SIZE,
                      ACCENT_TEXT if acc else INK, p * out)
            k += 1
        if i < len(lines) - 1:
            y += HEAD_LH
    y += HEAD_SUB_GAP
    for j, ln in enumerate(sub_lines):
        p = ease_out((t - 0.55 - j * 0.1) / 0.55)
        draw_text(img, TEXT_X, y + 14 * (1 - p) + lift, ln, "sans", SUB_SIZE, INK_SOFT, p * out)
        y += SUB_LH


def progress(img, idx, n, p):
    seg, gap, y = 30, 8, 650
    for i in range(n):
        x = TEXT_X + i * (seg + gap)
        put(img, rrect(seg, 4, 2, LINE), x, y)
        fill = 1.0 if i < idx else (p if i == idx else 0)
        if fill * seg >= 4:
            put(img, rrect(int(fill * seg), 4, 2, ACCENT), x, y)


def veil(img, a):
    if a > 0.004:
        put(img, rrect(W, H, 1, BG), 0, 0, a)


def centered_card(img, t, dur, kicker, head, sub, tag=None, head_size=76):
    """Title and closing cards: centered type over the soft seal."""
    put(img, disc(580, BG_ALT), W / 2 - 290, H / 2 - 290, 0.9)
    lines = wrap(head, "serif", head_size, 1000, 2, "balance")
    sub_lines = wrap(sub, "sans", 26, 800, 2, "balance")
    lh = head_size * 1.1
    height = ((40 if kicker else 0) + head_size * 0.78 + (len(lines) - 1) * lh + 36 + 52
              + (len(sub_lines) - 1) * 40 + (62 if tag else 0) + 8)
    y = (H - height) / 2 + 10
    if kicker:
        eyebrow(img, 0, y + 14, kicker, clamp01(t / 0.4), center=True)
        y += 40
    y += head_size * 0.78
    for i, ln in enumerate(lines):
        p = ease_out((t - 0.2 - i * 0.12) / 0.6)
        draw_text(img, W / 2, y + 30 * (1 - p), ln, "serif", head_size, INK, p, "m")
        if i < len(lines) - 1:
            y += lh
    y += 36
    p2 = clamp01((t - 0.75) / 0.6)
    rw = 110 * ease_out(p2)
    if rw > 4:
        put(img, rrect(int(rw), 5, 2.5, HIGHLIGHT), W / 2 - rw / 2, y - 2)
    y += 52
    for i, ln in enumerate(sub_lines):
        draw_text(img, W / 2, y, ln, "sans", 26, INK_SOFT, p2, "m")
        if i < len(sub_lines) - 1:
            y += 40
    if tag:
        p3 = clamp01((t - 1.4) / 0.6)
        tw = spaced_w(tag, "bold", 16, 3.4)
        draw_spaced(img, (W - tw) / 2, y + 62, tag, "bold", 16, ACCENT_TEXT, 3.4, p3)


# ------------------------------------------------------------ screenshots ---
def find_chrome():
    if os.environ.get("MAIN_STREET_CHROME"):
        return os.environ["MAIN_STREET_CHROME"]
    for pat in ("~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell",
                "~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell",
                "~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-mac*/headless_shell",
                "~/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux*/headless_shell"):
        hits = sorted(glob.glob(os.path.expanduser(pat)))
        if hits:
            return hits[-1]
    found = shutil.which("chrome-headless-shell")
    if found:
        return found
    sys.exit("Chrome's headless shell wasn't found. Install it with `npx playwright install chromium`,\n"
             "or set MAIN_STREET_CHROME=/path/to/chrome-headless-shell. (Regular headless Chrome won't\n"
             "do: it widens a 390 px window to 500 px, so the phone screenshots come out wrong.)")


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def build_shots(out_dir, variants):
    """Scaffold the demo site, then build and photograph each variant.

    variants: (name, announcement, css_height). Each becomes out_dir/name.png
    at 390 CSS px wide, 2x.
    """
    for tool in ("node", "npm"):
        if not shutil.which(tool):
            sys.exit(f"{tool} is needed to build the demo site for the screenshots.")
    chrome = find_chrome()
    try:
        _build_shots(out_dir, variants, chrome)
    except subprocess.CalledProcessError as e:
        sys.exit(f"Building the demo site for the screenshots failed while running:\n  {' '.join(map(str, e.cmd))}\n"
                 "npm install needs a network connection. Or pass --shots DIR pointing at earlier screenshots.")


def _build_shots(out_dir, variants, chrome):
    with tempfile.TemporaryDirectory(prefix="ms-video-site-") as work:
        site = os.path.join(work, "site")
        print("building the demo site for screenshots ...", flush=True)
        subprocess.run(["node", os.path.join(REPO, "scripts/new-site.mjs"), site, "--no-git"],
                       check=True, stdout=subprocess.DEVNULL)
        index = os.path.join(site, "index.html")
        with open(index, encoding="utf-8") as f:
            html = f.read()
        for old, new in DEMO_COPY:
            if old not in html:
                sys.exit(f"The template changed: this placeholder is gone from index.html, so update DEMO_COPY:\n  {old}")
            html = html.replace(old, new, 1)
        with open(index, "w", encoding="utf-8") as f:
            f.write(html)
        subprocess.run(["npm", "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=site, check=True)
        cfg_path = os.path.join(site, "site.config.json")
        for name, announcement, css_h in variants:
            with open(cfg_path, encoding="utf-8") as f:
                cfg = json.load(f)
            for key, vals in DEMO_CONFIG.items():
                cfg.setdefault(key, {}).update(vals)
            cfg["site"]["announcement"] = announcement
            with open(cfg_path, "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=2)
            subprocess.run(["npm", "run", "build", "--silent"], cwd=site, check=True, stdout=subprocess.DEVNULL)
            handler = functools.partial(_QuietHandler, directory=os.path.join(site, "dist"))
            srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
            threading.Thread(target=srv.serve_forever, daemon=True).start()
            out = os.path.join(out_dir, name + ".png")
            cmd = [chrome, "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                   f"--window-size=390,{css_h}", "--virtual-time-budget=4000",
                   f"--screenshot={out}", f"http://127.0.0.1:{srv.server_port}/"]
            if hasattr(os, "geteuid") and os.geteuid() == 0:
                cmd.insert(1, "--no-sandbox")
            try:
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
            finally:
                srv.shutdown()
            print("  screenshot:", out, flush=True)


def load_shots(shots_dir, variants):
    want = [os.path.join(shots_dir, v[0] + ".png") for v in variants]
    if not all(os.path.exists(p) for p in want):
        os.makedirs(shots_dir, exist_ok=True)
        build_shots(shots_dir, variants)
    return {v[0]: Shot(p) for v, p in zip(variants, want)}


# ---------------------------------------------------------- encode / main ---
def render_video(scenes, mp4, crf):
    total = sum(int(round(s["dur"] * FPS)) for s in scenes)
    print(f"rendering {total} frames ({total / FPS:.1f}s at {FPS}fps) ...", flush=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", str(crf),
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    i = 0
    for sc in scenes:
        n = int(round(sc["dur"] * FPS))
        for f in range(n):
            proc.stdin.write(sc["frame"](f / FPS).convert("RGB").tobytes())
            i += 1
            if i % 300 == 0:
                print(f"  {i}/{total}", flush=True)
    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg failed")


def save_poster(img, path):
    """A 256-color PNG: looks the same here, at well under half the size."""
    img.convert("RGB").quantize(256, method=Image.Quantize.MEDIANCUT,
                                dither=Image.Dither.FLOYDSTEINBERG).save(path, optimize=True)


def check_ffmpeg():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed (macOS: brew install ffmpeg; Debian/Ubuntu: apt install ffmpeg).")


# ======================================================================
# The story. Everything below is specific to this video.
# ======================================================================
DEMO_CONFIG = {
    "business": {
        "name": "Maple Street Bakery",
        "tagline": "Butter croissants and sourdough, baked at 5am",
        "phone": "(555) 555-0142",
        "email": "hello@example.com",
        "address": {"street": "214 Maple Street", "city": "Fairview", "state": "OH", "zip": "44000"},
        # "Every day" keeps "Today: ..." the same whatever day this runs.
        "hours": [{"days": "Every day", "time": "6:30 AM to 2:00 PM"}],
    },
    # Version 1, as SETUP.md builds it: nothing fake, so no photos, reviews,
    # FAQ answers, or contact form yet.
    "features": {
        "menu": True, "announcementBanner": True, "analytics": True,
        "gallery": False, "heroPhoto": False, "testimonials": False,
        "contactForm": False, "faq": False, "booking": False, "blog": False, "emailSignup": False,
    },
    "site": {
        "theme": "terracotta",
        "description": "Maple Street Bakery: butter croissants and sourdough, baked at 5am. 214 Maple Street, Fairview, OH.",
    },
}


def _menu_item(n, name, desc, price):
    return (f'Example service {n}<span class="desc">A one-line description.</span></span><span class="price">$0</span>',
            f'{name}<span class="desc">{desc}</span></span><span class="price">${price}</span>')


# (template placeholder, the bakery's words), replaced in index.html.
DEMO_COPY = [
    ("A clear headline about what you do.", "Warm bread on Maple Street, every morning."),
    ("This short paragraph is placeholder copy. Replace it with two or three sentences about your business: what you offer, who it is for, and why customers choose you.",
     "Grandma's recipes, real butter, and coffee from down the street. Come early: the cinnamon rolls go first."),
    ("This section is placeholder copy. Tell your story here: who you are, how you started, and what makes your business different. A few honest sentences beat a long polished paragraph.",
     "I started baking in my apartment kitchen and selling loaves at the Saturday market. In 2021 we opened the shop on Maple Street."),
    ("Write like you talk. Customers can tell when the words are yours.",
     "The oven goes on at 4. The doors open at 6:30. Come say hi."),
    ("Services and prices</h2>", "Bread and pastry</h2>"),
    ("Replace this list with your real services or products, each with its real price.",
     "Baked fresh every morning. Custom cakes need 72 hours' notice."),
    ("<h3>Category one</h3>", "<h3>Bread</h3>"),
    ("<h3>Category two</h3>", "<h3>Pastry</h3>"),
    _menu_item("one", "Sourdough loaf", "Three-day ferment, crackly crust.", 8),
    _menu_item("two", "Seeded rye", "Caraway, sunflower, and flax.", 9),
    _menu_item("three", "Baguette", "Baked twice a day.", 4),
    _menu_item("four", "Butter croissant", "Real butter, folded by hand.", 4),
    _menu_item("five", "Cinnamon roll", "Gone by ten most days.", 5),
    _menu_item("six", "Morning bun", "Orange zest and brown sugar.", 5),
]

# (name, announcement, CSS height of the capture)
SHOT_VARIANTS = [
    ("pumpkin-note", "Pumpkin bread is back for fall.", 844),
]

CLOSE = dict(
    kicker=None,
    head="Nothing goes live until\nyou say \u201cship it.\u201d",
    sub="A professional website for your small business,\nfor about $12 a year.",
    tag="EVERY CHANGE GETS ITS OWN PREVIEW LINK",
)

# One entry per step. Headline {braces} are drawn in the accent color.
STEPS = [
    dict(key="tap", dur=5.0,
         head="Tap {Edit my website}",
         sub="The button on your home screen opens your AI, with your site already chosen."),
    dict(key="say", dur=6.5,
         head="Say what you want",
         sub="In plain words, the way you'd tell a person.\nType it, or send a voice note."),
    dict(key="link", dur=5.5,
         head="Get a {preview link}",
         sub="Every change gets its own preview link.\nNothing is live yet."),
    dict(key="look", dur=5.0,
         head="Look on your phone",
         sub="It's your real site, with the change.\nNot quite right? Say what to change."),
    dict(key="ship", dur=5.0,
         head="Say {\u201cship it\u201d}",
         sub="Your live site updates in about a minute."),
    dict(key="undo", dur=5.0,
         head="Changed your mind?\nSay {\u201cundo that\u201d}",
         sub="The latest change comes right back off.\nEvery version is saved."),
]
CLOSE_LEN = 4.0
INTRO_SETTLED = 1.6  # seconds of text animation already played at the first frame

PREFILL = "Here's what I'd like to change on my website: "
REQUEST = "add a note at the top saying pumpkin bread is back for fall."
PREVIEW_MSG = "Here's your preview link. Open it on your phone and check the top of the page."
PREVIEW_CHIP = "Open preview link"


def build_scenes(shots):
    starts, t = {}, 0.0
    for st in STEPS:
        starts[st["key"]] = t
        t += st["dur"]

    def at(key, offset):
        return starts[key] + offset

    tap = 2.2  # the Edit my website tap, in the first step
    chat = Chat([
        (at("link", 1.2), "ai", PREVIEW_MSG, PREVIEW_CHIP),
        (at("ship", 1.0), "me", "ship it", None),
        (at("ship", 2.3), "ai", "Shipped! It's on your live site in about a minute.", None),
        (at("undo", 0.9), "me", "undo that", None),
        (at("undo", 2.2), "ai", "Done: it's back the way it was. Live in about a minute.", None),
    ], draft=(at("tap", tap), at("say", 1.6), at("say", 4.6), PREFILL, REQUEST),
        mic_hint=(at("say", 0.3), at("say", 1.5)))
    site = shots["pumpkin-note"]

    def v_tap(img, t, tg):
        home = home_screen(1.0, t - tap)
        screen = home if t < tap + 0.25 else zoom_open(home, chat.render(tg), HOME_ICON, (t - tap - 0.25) / 0.5)
        draw_phone(img, screen)

    def v_chat(img, t, tg):
        draw_phone(img, chat.render(tg))

    def v_link(img, t, tg):
        screen = chat.render(tg)
        if t > 4.4 and chat.chip_at:  # tap the preview link
            ripple(screen, *chat.chip_at, t - 4.4, ACCENT)
        draw_phone(img, screen)

    def v_look(img, t, tg):
        page = site_screen(site, ring=0.9 * clamp01(1 - abs(t - 2.4) / 1.3))
        screen = push(chat.render(tg), page, t / 0.55) if t < 0.55 else page
        draw_phone(img, screen)

    def v_ship(img, t, tg):
        c = chat.render(tg)
        screen = push(c, site_screen(site), t / 0.55, back=True) if t < 0.55 else c
        draw_phone(img, screen)

    visuals = dict(tap=v_tap, say=v_chat, link=v_link, look=v_look, ship=v_ship, undo=v_chat)

    scenes = []
    n = len(STEPS)
    for i, st in enumerate(STEPS):
        label = f"STEP {i + 1} OF {n}"

        def frame(t, i=i, st=st, label=label):
            img = slide_bg().copy()
            visuals[st["key"]](img, t, starts[st["key"]] + t)
            # The first step starts fully drawn, so the very first frame
            # (what a video player shows before you press play) says something.
            text_block(img, label, st["head"], st["sub"], t + (INTRO_SETTLED if i == 0 else 0), st["dur"] + (INTRO_SETTLED if i == 0 else 0))
            progress(img, i, n, t / st["dur"])
            if i == n - 1:
                veil(img, 1 - clamp01((st["dur"] - t) / 0.4))
            return img

        scenes.append(dict(dur=st["dur"], frame=frame, key=st["key"]))

    def close_frame(t):
        img = slide_bg(False).copy()
        centered_card(img, t, CLOSE_LEN, CLOSE["kicker"], CLOSE["head"], CLOSE["sub"], CLOSE["tag"], head_size=66)
        veil(img, 1 - clamp01(t / 0.4))
        return img

    scenes.append(dict(dur=CLOSE_LEN, frame=close_frame))
    return scenes


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--mp4", default=os.path.join(REPO, "template/docs/assets/journey.mp4"))
    ap.add_argument("--poster", default=os.path.join(REPO, "template/docs/assets/journey-poster.png"))
    ap.add_argument("--shots", help="folder for the site screenshots; reused if they're already there")
    ap.add_argument("--crf", type=int, default=23, help="x264 quality: lower is sharper and bigger (23 keeps this near 0.6 MB)")
    ap.add_argument("--frames", help="write PNGs every N seconds to this folder instead of a video (for checking)")
    ap.add_argument("--every", type=float, default=2.0)
    args = ap.parse_args()

    check_ffmpeg()
    for role in FONT_ROLES:
        print(f"font {role}: {_face(role)[0]}")
    if args.shots:
        shots = load_shots(args.shots, SHOT_VARIANTS)
    else:
        with tempfile.TemporaryDirectory(prefix="ms-video-shots-") as tmp:
            shots = load_shots(tmp, SHOT_VARIANTS)
    scenes = build_scenes(shots)

    if args.frames:
        os.makedirs(args.frames, exist_ok=True)
        total = sum(sc["dur"] for sc in scenes)
        k, tg = 0, 0.0
        while tg < total:
            t0 = 0.0
            for sc in scenes:
                if tg < t0 + sc["dur"]:
                    sc["frame"](tg - t0).convert("RGB").save(os.path.join(args.frames, f"f{k:03d}_{tg:05.1f}s.png"))
                    break
                t0 += sc["dur"]
            k += 1
            tg = round(tg + args.every, 3)
        return

    for p in (args.mp4, args.poster):
        os.makedirs(os.path.dirname(os.path.abspath(p)), exist_ok=True)
    render_video(scenes, args.mp4, args.crf)
    # Poster: the change on the phone, text settled.
    look = next(sc for sc in scenes if sc.get("key") == "look")
    save_poster(look["frame"](2.4), args.poster)
    print("wrote", args.mp4)
    print("wrote", args.poster)


if __name__ == "__main__":
    main()
