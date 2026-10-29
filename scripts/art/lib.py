"""Shared drawing primitives for the New Concept Security coded illustrations.

Every image on the site is composed from these pieces so the set reads as one
system: brand red on black and white, the angular NC mark, officers drawn as
faceless silhouettes, and light surveillance HUD details.
"""
import math
import random
import re

FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
MONO = "ui-monospace,'SF Mono',Menlo,Consolas,'Courier New',monospace"

RED, RED_HI, RED_GLOW, RED_DARK, RED_DEEP = "#a01010", "#c41616", "#ff5a5a", "#7a0c0c", "#4a0606"
BLACK, NIGHT, INK, CHAR, STEEL = "#0a0a0b", "#111114", "#1d1d1f", "#2c2c2e", "#3a3a3c"
SLATE, GREY, FAINT, SILVER = "#48484a", "#636366", "#86868b", "#aeaeb2"
MIST, CLOUD, WHITE = "#d2d2d7", "#f5f5f7", "#ffffff"
SKINS = ["#8d5a3b", "#c68863", "#5a3a28", "#e0ac85", "#a86b47"]

# The cut through the NC mark runs at this slope (dx per dy). Diagonal slashes reuse it.
SLASH = 0.644


# ---------------------------------------------------------------- basics

def n(v):
    if isinstance(v, str):
        return v
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def attrs(kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.rstrip("_").replace("_", "-")
        out.append(f' {k}="{n(v) if isinstance(v, (int, float)) else v}"')
    return "".join(out)


def pts(points):
    return " ".join(f"{n(x)},{n(y)}" for x, y in points)


def poly(points, fill, **kw):
    return f'<polygon points="{pts(points)}" fill="{fill}"{attrs(kw)}/>'


def rect(x, y, w, h, fill, **kw):
    return f'<rect x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}" fill="{fill}"{attrs(kw)}/>'


def circle(cx, cy, r, fill, **kw):
    return f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}" fill="{fill}"{attrs(kw)}/>'


def ellipse(cx, cy, rx, ry, fill, **kw):
    return f'<ellipse cx="{n(cx)}" cy="{n(cy)}" rx="{n(rx)}" ry="{n(ry)}" fill="{fill}"{attrs(kw)}/>'


def line(x1, y1, x2, y2, stroke, sw=1, **kw):
    return (f'<line x1="{n(x1)}" y1="{n(y1)}" x2="{n(x2)}" y2="{n(y2)}" '
            f'stroke="{stroke}" stroke-width="{n(sw)}"{attrs(kw)}/>')


def path(d, fill="none", **kw):
    return f'<path d="{d}" fill="{fill}"{attrs(kw)}/>'


def text(x, y, s, size, fill, weight=600, anchor="start", family=FONT, **kw):
    return (f'<text x="{n(x)}" y="{n(y)}" font-family="{family}" font-size="{n(size)}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{attrs(kw)}>{esc(s)}</text>')


def mono(x, y, s, size, fill, weight=500, anchor="start", **kw):
    return text(x, y, s, size, fill, weight, anchor, MONO, letter_spacing=n(size * 0.08), **kw)


def group(*children, **kw):
    return f"<g{attrs(kw)}>" + "".join(c for c in children if c) + "</g>"


def at(x, y, s=1.0, *children, sx=None):
    sx = s if sx is None else sx
    return f'<g transform="translate({n(x)} {n(y)}) scale({sx:.4f} {s:.4f})">' + "".join(children) + "</g>"


def _rgb(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    ra, rb = _rgb(a), _rgb(b)
    return "#%02x%02x%02x" % tuple(round(x + (y - x) * t) for x, y in zip(ra, rb))


def shade(c, k):
    return mix(c, "#000000", k)


def tint(c, k):
    return mix(c, "#ffffff", k)


# ---------------------------------------------------------------- motion
# Every image loops like a short video. Keyframes are registered here and only the ones a
# drawing uses are written into its <style>. Delays are negative so each element starts
# mid-cycle and nothing pops on load.

KF = {
    "blink": "0%,58%{opacity:1}62%,96%{opacity:.12}100%{opacity:1}",
    "pulse": "0%,100%{opacity:.4}50%{opacity:1}",
    "softpulse": "0%,100%{opacity:.7}50%{opacity:1}",
    "breathe": "0%,100%{transform:scale(1,1)}50%{transform:scale(1.007,1.012)}",
    "glowpulse": "0%,100%{opacity:.55;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}",
    "ring": "0%{opacity:0;transform:scale(.25)}12%{opacity:.85}100%{opacity:0;transform:scale(1.55)}",
    "flicker": "0%,100%{opacity:1}6%{opacity:.35}7%{opacity:1}41%{opacity:1}42%{opacity:.2}44%{opacity:.9}"
               "45%{opacity:.3}47%{opacity:1}",
    "twinkle": "0%,100%{opacity:.12}50%{opacity:.95}",
    "spin": "to{transform:rotate(360deg)}",
    "strobeA": "0%,44%{opacity:1}50%,94%{opacity:.06}100%{opacity:1}",
    "strobeB": "0%,44%{opacity:.06}50%,94%{opacity:1}100%{opacity:.06}",
    "flash": "0%,9%,18%,100%{opacity:.15}4%,13%{opacity:1}",
    "press": "0%,60%,100%{transform:rotate(0)}70%,84%{transform:rotate(14deg)}",
}


def keyframes(name, body):
    KF[name] = body
    return name


def _tag(*values):
    return "_".join(n(v) for v in values).replace("-", "m").replace(".", "p")


def sway(deg):
    return keyframes(f"sway{_tag(deg)}", f"0%,100%{{transform:rotate(-{n(deg)}deg)}}50%{{transform:rotate({n(deg)}deg)}}")


def drift(dx, dy=0):
    return keyframes(f"drift{_tag(dx, dy)}",
                     f"from{{transform:translate(0,0)}}to{{transform:translate({n(dx)}px,{n(dy)}px)}}")


def bob(dy):
    return keyframes(f"bob{_tag(dy)}", f"0%,100%{{transform:translateY(0)}}50%{{transform:translateY({n(dy)}px)}}")


def draw(length):
    L = n(length)
    return keyframes(f"draw{_tag(length)}",
                     f"0%{{stroke-dashoffset:{L}}}40%,78%{{stroke-dashoffset:0}}100%{{stroke-dashoffset:-{L}}}")


def sweep(span):
    s = n(span)
    return keyframes(f"sweep{_tag(span)}", f"0%{{transform:translateX(-{s}px)}}45%,100%{{transform:translateX({s}px)}}")


def motion(name, dur, ease="ease-in-out", delay=0.0, origin=None, direction=""):
    """Inline style for a looping animation. `origin` is a local (x, y) point, or None for the element's centre."""
    if isinstance(origin, tuple):
        o = f"transform-origin:{n(origin[0])}px {n(origin[1])}px;transform-box:view-box"
    else:
        o = f"transform-origin:{origin or '50% 50%'};transform-box:fill-box"
    d = f" {direction}" if direction else ""
    return f"animation:{name} {n(dur)}s {ease} {n(-abs(delay))}s infinite{d};{o}"


def anim(content, name, dur, ease="ease-in-out", delay=0.0, origin=None, direction=""):
    return f'<g style="{motion(name, dur, ease, delay, origin, direction)}">{content}</g>'


# ---------------------------------------------------------------- canvas

class Art:
    def __init__(self, w, h, title):
        self.w, self.h, self.title = w, h, title
        self.defs, self.body, self._n = [], [], 0

    def uid(self, p="d"):
        self._n += 1
        return f"{p}{self._n}"

    def add(self, *els):
        self.body.extend(e for e in els if e)
        return self

    def define(self, el):
        self.defs.append(el)

    @staticmethod
    def _stops(stops):
        out = []
        for st in stops:
            o, c = st[0], st[1]
            a = st[2] if len(st) > 2 else 1
            op = "" if a == 1 else f' stop-opacity="{n(a) if a not in (0, 1) else a}"'
            out.append(f'<stop offset="{o}" stop-color="{c}"{op}/>')
        return "".join(out)

    def lin(self, stops, x1=0, y1=0, x2=0, y2=1, user=False):
        i = self.uid("l")
        u = ' gradientUnits="userSpaceOnUse"' if user else ""
        self.define(f'<linearGradient id="{i}" x1="{n(x1)}" y1="{n(y1)}" x2="{n(x2)}" '
                    f'y2="{n(y2)}"{u}>{self._stops(stops)}</linearGradient>')
        return f"url(#{i})"

    def rad(self, stops, cx=0.5, cy=0.5, r=0.5, user=False, fx=None, fy=None):
        i = self.uid("r")
        u = ' gradientUnits="userSpaceOnUse"' if user else ""
        f = "" if fx is None else f' fx="{n(fx)}" fy="{n(fy)}"'
        self.define(f'<radialGradient id="{i}" cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}"{f}{u}>'
                    f'{self._stops(stops)}</radialGradient>')
        return f"url(#{i})"

    def glow(self, cx, cy, r, color, a=0.5):
        return circle(cx, cy, r, self.rad([(0, color, a), (0.4, color, a * 0.45), (1, color, 0)],
                                          cx, cy, r, user=True))

    def clip(self, *shapes):
        i = self.uid("c")
        self.define(f'<clipPath id="{i}">{"".join(shapes)}</clipPath>')
        return f"url(#{i})"

    def pattern(self, w, h, content, transform=None):
        i = self.uid("p")
        t = f' patternTransform="{transform}"' if transform else ""
        self.define(f'<pattern id="{i}" width="{n(w)}" height="{n(h)}" '
                    f'patternUnits="userSpaceOnUse"{t}>{content}</pattern>')
        return f"url(#{i})"

    def filter(self, content):
        i = self.uid("f")
        self.define(f'<filter id="{i}" x="-20%" y="-20%" width="140%" height="140%">{content}</filter>')
        return f"url(#{i})"

    def render(self):
        body = "\n".join(self.body)
        used = sorted(set(re.findall(r"animation:([A-Za-z0-9_]+) ", body + "".join(self.defs))))
        style = ""
        if used:
            style = ("<style>" + "".join(f"@keyframes {k}{{{KF[k]}}}" for k in used)
                     + "@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>")
        return ('<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" '
                f'width="{self.w}" height="{self.h}" role="img">\n'
                f'<title>{esc(self.title)}</title>\n'
                f'<defs>{style}{"".join(self.defs)}</defs>\n'
                + body + "\n</svg>\n")

    def save(self, file):
        with open(file, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(self.render())


# ---------------------------------------------------------------- brand

MARK_D = ("M0 -185L80 -105L80 84L-56.7 -128.3Z"
          "M0 185L-80 105L-80 -84L56.7 128.3Z"
          "M-183 0L-130 -53L-130 53Z"
          "M183 0L130 -53L130 53Z")


def mark(cx, cy, size, fill=RED, **kw):
    """The NC mark, centred on (cx, cy), `size` tall."""
    s = size / 370
    return f'<path d="{MARK_D}" transform="translate({n(cx)} {n(cy)}) scale({s:.4f})" fill="{fill}"{attrs(kw)}/>'


def wordmark(x, y, size, light=True, anchor="start", sub=True, accent=None):
    c = WHITE if light else INK
    accent = accent or (RED_HI if light else RED)
    out = (f'<text x="{n(x)}" y="{n(y)}" font-family="{FONT}" font-size="{n(size)}" font-weight="800" '
           f'letter-spacing="{n(-size * 0.02)}" text-anchor="{anchor}"><tspan fill="{c}">NEW</tspan>'
           f'<tspan fill="{accent}" font-weight="300">CONCEPT</tspan></text>')
    if sub:
        out += (f'<text x="{n(x)}" y="{n(y + size * 0.66)}" font-family="{FONT}" font-size="{n(size * 0.42)}" '
                f'font-weight="600" letter-spacing="{n(size * 0.5)}" fill="{c}" text-anchor="{anchor}">SECURITY</text>')
    return out


def lockup(x, y, size, light=True, accent=None):
    """Mark plus wordmark; (x, y) is the left edge on the NEWCONCEPT baseline."""
    return mark(x + size * 0.78, y - size * 0.1, size * 1.55, accent or (RED_HI if light else RED)) + wordmark(
        x + size * 1.75, y, size, light, accent=accent)


# ---------------------------------------------------------------- people

_TORSO = "M-13 -331L-42 -323Q-60 -318 -61 -299L-55 -176Q0 -168 55 -176L61 -299Q60 -318 42 -323L13 -331Z"
_COAT = "M-14 -331L-43 -323Q-62 -318 -63 -299L-67 -106Q0 -94 67 -106L63 -299Q62 -318 43 -323L14 -331Z"
_VEST_F = ("M-30 -326L-15 -296L0 -276L15 -296L30 -326L44 -321Q59 -316 60 -298L56 -190"
           "L-56 -190L-60 -298Q-59 -316 -44 -321Z")
_VEST_B = "M-44 -321Q-59 -316 -60 -298L-56 -190L56 -190L60 -298Q59 -316 44 -321L30 -326Q0 -331 -30 -326Z"
_HAIR = "M-22.6 -374Q-25 -399 0 -399Q25 -399 22.6 -374Q21 -388 0 -389Q-21 -388 -22.6 -374Z"

ARMS = {
    "clasped": (["M-55 -303L-64 -238L-15 -203", "M55 -303L64 -238L15 -203"], [(-7, -201), (6, -199)]),
    "side": (["M-57 -303L-67 -236L-66 -180", "M57 -303L67 -236L66 -180"], [(-66, -172), (66, -172)]),
    "radio": (["M-57 -303L-67 -236L-66 -180", "M57 -303L68 -248L26 -286"], [(-66, -172), (24, -288)]),
    "torch": (["M-57 -303L-98 -266L-140 -252", "M57 -303L67 -236L66 -180"], [(-143, -251), (66, -172)]),
    "phone": (["M-57 -303L-67 -236L-66 -180", "M57 -303L96 -284L124 -322"], [(-66, -172), (126, -326)]),
    "clipboard": (["M-57 -303L-66 -238L-26 -226", "M57 -303L67 -236L66 -180"], [(-24, -226), (66, -172)]),
    "behind": (["M-55 -303L-63 -236L-38 -198", "M55 -303L63 -236L38 -198"], []),
}
TORCH_TIP = (-186, -251)
PHONE_AT = (125, -334)
OFF_HAND = (66, -172)


def _figure(c, kind, pose, back, hat, vest, vest_text, armband, sil=False):
    # The rim-light pass skips the legs, otherwise the gap between them reads as piping.
    o = [] if sil else [
        path("M-21 -192L-27 -10M21 -192L27 -10", stroke=c["trousers"], stroke_width=31),
        poly([(-47, -198), (47, -198), (42, -150), (3, -142), (0, -150), (-3, -142), (-42, -150)], c["trousers"]),
        ellipse(-30, -7, 19, 8, c["shoe"]), ellipse(30, -7, 19, 8, c["shoe"])]
    o += [poly([(-9, -348), (9, -348), (11, -322), (-11, -322)], c["skin"]),
          path(_COAT if kind == "overcoat" else _TORSO, c["jacket"])]
    if not sil:
        # Light falls from the upper left: shade the right flank, catch the left shoulder.
        if kind == "overcoat":
            o.append(path("M14 -331L43 -323Q62 -318 63 -299L67 -106Q46 -100 30 -99L28 -300Z", "#000", opacity=0.2))
        else:
            o.append(path("M13 -331L42 -323Q60 -318 61 -299L55 -176Q34 -171 20 -171L26 -300Z", "#000", opacity=0.2))
        o.append(path("M-13 -331L-42 -323Q-60 -318 -61 -299L-58 -262Q-50 -300 -13 -331Z", "#fff", opacity=0.07))
    dk = shade(c["jacket"], 0.55)
    if not sil and not back:
        if kind in ("suit", "overcoat"):
            o.append(poly([(-13, -331), (13, -331), (0, -262)], c["shirt"]))
            o.append(path("M-4.5 -328L4.5 -328L3 -318L6.5 -280L0 -268L-6.5 -280L-3 -318Z", c["tie"]))
            o.append(path("M-13 -331L-27 -300L-17 -293L0 -262M13 -331L27 -300L17 -293L0 -262",
                          stroke=dk, stroke_width=2.2, stroke_linejoin="round"))
            if kind == "suit":
                o.append(circle(0, -240, 2.4, dk) + circle(0, -214, 2.4, dk))
            else:
                o.append(line(0, -262, 0, -106, dk, 2) + circle(-8, -236, 2.6, dk) + circle(-8, -196, 2.6, dk)
                         + circle(-8, -156, 2.6, dk))
        elif kind == "uniform":
            o.append(path("M-13 -331L0 -314L13 -331", stroke=dk, stroke_width=3))
            o.append(line(0, -314, 0, -178, dk, 1.6))
            o.append(poly([(-58, -313), (-34, -323), (-31, -317), (-55, -307)], c["accent"]))
            o.append(poly([(58, -313), (34, -323), (31, -317), (55, -307)], c["accent"]))
            o.append(rect(14, -298, 24, 15, "#e9e9ec", rx=2) + rect(14, -298, 24, 4, c["accent"]))
        elif kind == "scrubs":
            o.append(poly([(-12, -331), (12, -331), (0, -302)], c["skin"]))
            o.append(rect(16, -296, 22, 20, shade(c["jacket"], 0.12), rx=2))
    elif not sil and back:
        o.append(line(0, -326, 0, -180, dk, 1.4))
    if vest:
        if back:
            o.append(path(_VEST_B, c["vest"]))
            o.append(rect(-42, -322, 8, 26, c["band"]) + rect(34, -322, 8, 26, c["band"]))
            if vest_text and not sil:
                size = min(15.0, 104 / (0.66 * len(vest_text)))
                o.append(text(0, -259, vest_text, size, c["band"], 800, "middle", letter_spacing=n(size * 0.06)))
        else:
            o.append(path(_VEST_F, c["vest"]))
            o.append(rect(-42, -320, 8, 70, c["band"]) + rect(34, -320, 8, 70, c["band"]))
        o.append(rect(-57, -250, 114, 8, c["band"]) + rect(-56.5, -222, 113, 8, c["band"]))
        if not sil:
            o.append(path("M24 -322L44 -321Q59 -316 60 -298L56 -190L26 -190Z", "#000", opacity=0.16))
    arms, hands = ARMS[pose]
    for d in arms:
        if sil:
            o.append(path(d, stroke=c["jacket"], stroke_width=23, stroke_linecap="round", stroke_linejoin="round"))
        else:
            o.append(path(d, stroke=dk, stroke_width=23, stroke_linecap="round", stroke_linejoin="round"))
            o.append(path(d, stroke=tint(c["jacket"], 0.06), stroke_width=19,
                          stroke_linecap="round", stroke_linejoin="round"))
    if armband and not sil and not back:
        o.append(rect(-66, -284, 14, 18, "#f1f1f3", rx=2) + rect(-66, -284, 14, 5, c["accent"], rx=1))
    for hx, hy in hands:
        o.append(circle(hx, hy, 9.5, c["skin"]))
    if not sil:
        if pose == "radio":
            o.append(rect(12, -312, 13, 27, "#0d0d0f", rx=3) + line(17, -312, 17, -328, "#0d0d0f", 3))
        elif pose == "torch":
            o.append(rect(-178, -257, 36, 12, "#2a2a2c", rx=3) + rect(-184, -259, 7, 16, "#ececef", rx=2))
        elif pose == "phone":
            o.append(rect(118, -348, 14, 25, "#0d0d0f", rx=3) + rect(120, -345, 10, 18, "#dfe6ee", rx=1.5))
        elif pose == "clipboard":
            o.append(rect(-46, -260, 36, 46, "#e6e6e9", rx=3) + rect(-34, -264, 12, 7, "#55555a", rx=2)
                     + line(-40, -246, -18, -246, "#9a9aa0", 2) + line(-40, -238, -22, -238, "#9a9aa0", 2)
                     + line(-40, -230, -16, -230, "#9a9aa0", 2))
    o.append(ellipse(-22, -367, 4.5, 7.5, c["skin"]) + ellipse(22, -367, 4.5, 7.5, c["skin"]))
    if back:
        o.append(ellipse(0, -369, 22.5, 27.5, c["hair"]))
        if not sil:
            o.append(ellipse(0, -346, 11, 5, c["skin"]))
    else:
        o.append(ellipse(0, -369, 22, 27, c["skin"]))
        if not sil:
            o.append(path("M2 -396Q24 -394 22 -369Q22 -346 2 -342Q14 -369 2 -396Z", "#000", opacity=0.16))
        o.append(path(_HAIR, c["hair"]))
    if hat:
        o.append(path("M-26 -381Q-25 -409 0 -410Q25 -409 26 -381Z", c["hat"])
                 + rect(-33, -384, 66, 6, shade(c["hat"], 0.1), rx=3))
        if not sil:
            o.append(path("M0 -409L0 -384", stroke=shade(c["hat"], 0.15), stroke_width=4))
    if kind in ("suit", "overcoat") and not sil:
        d = "M21 -362C26 -352 22 -344 18 -334" if back else "M21 -361C28 -350 20 -338 17 -326"
        o.append(path(d, stroke="#e8e8ea", stroke_width=1.6, opacity=0.9))
    return "".join(o)


def officer(x, y, h, kind="suit", pose="clasped", skin=SKINS[0], hair="#141211", back=False, hat=False,
            vest=False, vest_text="SECURITY", rim=None, rim_dx=3.5, rim_op=1.0, dark=0.0,
            armband=False, flip=False, breathe=True, jacket=None, trousers=None):
    """A standing officer with feet at (x, y), `h` tall. Faceless by design."""
    s = h / 400
    jacket = jacket or {"suit": "#1f1f22", "overcoat": "#1a1a1d", "uniform": "#161618", "scrubs": "#9aa3ab"}[kind]
    c = dict(jacket=jacket, trousers=trousers or ("#8c959d" if kind == "scrubs" else "#121214"), shirt="#f2f2f4",
             tie=RED_HI, skin=skin, hair=hair, shoe="#0b0b0c", vest=RED_HI, band="#f3f3f5",
             hat="#f3f3f5", accent=RED_HI)
    if dark:
        c = {k: shade(v, dark) for k, v in c.items()}
    inner = ""
    if rim:
        rc = {k: rim for k in c}
        for dx in (rim_dx if isinstance(rim_dx, (list, tuple)) else [rim_dx]):
            inner += (f'<g transform="translate({n(dx)} -1.5)" opacity="{n(rim_op)}">'
                      + _figure(rc, kind, pose, back, hat, vest, None, False, sil=True) + "</g>")
    inner += _figure(c, kind, pose, back, hat, vest, vest_text, armband)
    if breathe:
        inner = anim(inner, "breathe", 4.6, delay=(x * 0.37) % 4.6, origin=(0, 0))
    return at(x, y, s, inner, sx=-s if flip else s)


def opoint(x, y, h, local, flip=False):
    s = h / 400
    lx, ly = local
    return x + (-lx if flip else lx) * s, y + ly * s


def shadow(art, cx, cy, rx, ry=None, a=0.35):
    ry = ry or rx * 0.16
    return ellipse(cx, cy, rx, ry, art.rad([(0, "#000", a), (1, "#000", 0)]))


# ---------------------------------------------------------------- vehicles

def van(art, x, y, s=1.0, lights=False, beam=False, moving=False):
    """Liveried patrol van, side view facing right; (x, y) is the rear wheel ground line."""
    body = art.lin([(0, "#ffffff"), (0.55, "#f0f0f2"), (1, "#c4c4ca")])
    glass = art.lin([(0, "#2b323b"), (1, "#0f1216")], 0, 0, 1, 1)
    o = [ellipse(304, -2, 330, 15, art.rad([(0, "#000", 0.45), (1, "#000", 0)])),
         path("M8 -44L8 -246Q8 -262 24 -262L424 -262Q446 -262 458 -248L522 -158L584 -138"
              "Q600 -132 600 -114L600 -50Q600 -44 594 -44Z", body),
         path("M24 -255H426Q442 -255 452 -244", stroke="#fff", stroke_width=3, opacity=0.9),
         poly([(40, -262), (150, -262), (274, -70), (164, -70)], RED),
         poly([(164, -262), (184, -262), (308, -70), (288, -70)], INK),
         poly([(198, -262), (208, -262), (332, -70), (322, -70)], RED),
         rect(8, -80, 592, 10, RED),
         path("M8 -70L600 -70L600 -50Q600 -44 594 -44L8 -44Z", "#232326"),
         path("M436 -246L452 -246L508 -164L436 -164Z", glass),
         path("M446 -244L456 -244L470 -224L446 -224Z", "#fff", opacity=0.18),
         line(430, -256, 430, -82, "#bdbdc2", 1.5), line(256, -256, 256, -82, "#bdbdc2", 1.5),
         rect(442, -150, 16, 5, "#8e8e93", rx=2), rect(234, -152, 16, 5, "#8e8e93", rx=2),
         rect(510, -192, 16, 26, "#1c1c1e", rx=4),
         mark(373, -210, 50, RED),
         wordmark(322, -148, 16, light=False),
         text(322, -100, "01253 982 211", 13, INK, 700),
         path("M580 -134L598 -127L598 -110L576 -114Z", "#f7f7f9"),
         rect(8, -208, 9, 44, RED_HI, rx=2),
         rect(588, -78, 16, 32, "#2a2a2d", rx=5), rect(0, -76, 16, 28, "#2a2a2d", rx=4),
         rect(300, -276, 124, 15, "#1f1f22", rx=6)]
    reds = "".join(rect(305 + i * 29, -273, 25, 9, RED_HI, rx=3) for i in (0, 2))
    whites = "".join(rect(305 + i * 29, -273, 25, 9, "#f2f2f4", rx=3) for i in (1, 3))
    if lights:
        o.append(rect(305, -273, 112, 9, "#3a3a3e", rx=3))
        o.append(anim(reds, "strobeA", 1.1, "linear", x * 0.01) + anim(whites, "strobeB", 1.1, "linear", x * 0.01))
    else:
        o.append(reds + whites)
    for wx in (126, 488):
        o.append(path(f"M{wx - 47} -44A47 47 0 0 1 {wx + 47} -44Z", "#121214"))
        o.append(circle(wx, -38, 38, "#0d0d0f") + circle(wx, -38, 21, "#8e8e93") + circle(wx, -38, 17, "#6a6a70"))
        spokes = "".join(line(wx + 5 * math.cos(math.radians(a)), -38 + 5 * math.sin(math.radians(a)),
                              wx + 17 * math.cos(math.radians(a)), -38 + 17 * math.sin(math.radians(a)),
                              "#9a9aa0", 4, stroke_linecap="round") for a in range(0, 360, 72))
        spokes += circle(wx, -38, 6, "#2c2c2e")
        o.append(anim(spokes, "spin", 0.7, "linear", origin=(wx, -38)) if moving else spokes)
    out = at(x, y, s, *o)
    if beam:
        hx, hy = x + 598 * s, y - 120 * s
        out = poly([(hx, hy - 6 * s), (hx, hy + 6 * s), (hx + 620 * s, y + 10 * s), (hx + 620 * s, hy - 70 * s)],
                   art.lin([(0, "#fff", 0.35), (1, "#fff", 0)], hx, 0, hx + 620 * s, 0, user=True)) + out
    if lights:
        out += anim(art.glow(x + 333 * s, y - 268 * s, 70 * s, RED_GLOW, 0.75), "strobeA", 1.1, "linear", x * 0.01)
        out += anim(art.glow(x + 392 * s, y - 268 * s, 60 * s, "#ffffff", 0.6), "strobeB", 1.1, "linear", x * 0.01)
        out += anim(art.glow(x + 592 * s, y - 120 * s, 46 * s, "#ffffff", 0.6), "softpulse", 3)
        out += art.glow(x + 12 * s, y - 186 * s, 34 * s, RED_GLOW, 0.5)
    return out


def car(art, x, y, s=1.0, rim=None, moving=False, color=None):
    """Executive car, side view facing right."""
    base = color or "#18181b"
    body = art.lin([(0, tint(base, 0.18)), (0.45, base), (1, shade(base, 0.5))])
    glass = art.lin([(0, "#3b434d"), (1, "#14181d")], 0, 0, 1, 1)
    o = [ellipse(320, -2, 330, 14, art.rad([(0, "#000", 0.45), (1, "#000", 0)])),
         path("M6 -48L6 -118Q8 -140 34 -146L132 -156L196 -226Q206 -236 226 -236L436 -236Q456 -236 468 -226"
              "L546 -160L616 -150Q636 -146 638 -124L638 -60Q638 -48 626 -48Z", body),
         path("M210 -222L318 -222L318 -164L150 -164Z", glass),
         path("M330 -222L440 -222Q450 -222 458 -214L512 -164L330 -164Z", glass),
         path("M226 -222L252 -222L204 -164L178 -164Z", "#fff", opacity=0.08),
         path("M360 -222L380 -222L346 -164L326 -164Z", "#fff", opacity=0.07),
         rect(318, -222, 12, 58, "#0b0b0d"),
         line(40, -150, 620, -150, "#4a4a50", 1.5),
         line(330, -160, 334, -60, "#050506", 1.6), line(190, -160, 186, -60, "#050506", 1.6),
         rect(296, -140, 20, 5, "#55555b", rx=2), rect(452, -140, 20, 5, "#55555b", rx=2),
         path("M612 -146L634 -140L634 -128L604 -132Z", "#ececef"),
         rect(6, -134, 10, 22, RED_HI, rx=2),
         line(20, -62, 620, -62, "#2e2e33", 2)]
    for wx in (150, 510):
        o.append(path(f"M{wx - 52} -48A52 52 0 0 1 {wx + 52} -48Z", "#060607"))
        o.append(circle(wx, -42, 42, "#0e0e10") + circle(wx, -42, 26, "#5a5a60") + circle(wx, -42, 22, "#45454b"))
        spokes = "".join(line(wx + 6 * math.cos(math.radians(t)), -42 + 6 * math.sin(math.radians(t)),
                              wx + 21 * math.cos(math.radians(t)), -42 + 21 * math.sin(math.radians(t)),
                              "#8e8e93", 4, stroke_linecap="round") for t in range(0, 360, 60))
        spokes += circle(wx, -42, 7, "#1c1c1f")
        o.append(anim(spokes, "spin", 0.6, "linear", origin=(wx, -42)) if moving else spokes)
    if rim:
        o.insert(2, path("M34 -146L132 -156L196 -226Q206 -236 226 -236L436 -236Q456 -236 468 -226L546 -160L616 -150",
                         stroke=rim, stroke_width=2.5, opacity=0.8))
    return at(x, y, s, *o)


def car_front(art, color="#2c3440"):
    """A car seen head-on, ground centre at (0, 0) and 300 wide, headlights on."""
    body = art.lin([(0, tint(color, 0.25)), (1, shade(color, 0.4))])
    return (ellipse(0, 0, 170, 16, art.rad([(0, "#000", 0.5), (1, "#000", 0)]))
            + rect(-150, -26, 50, 26, "#0c0c0e", rx=6) + rect(100, -26, 50, 26, "#0c0c0e", rx=6)
            + path("M-112 -112L-84 -182Q-80 -190 -70 -190H70Q80 -190 84 -182L112 -112Z", body)
            + path("M-98 -118L-74 -174H74L98 -118Z", "#1d242c") + path("M-60 -170H-20L-56 -122H-86Z", "#fff", opacity=0.12)
            + rect(-152, -122, 304, 96, body, rx=22)
            + rect(-60, -86, 120, 30, "#14161a", rx=6) + rect(-34, -50, 68, 18, "#f4f4f6", rx=3)
            + anim(ellipse(-112, -84, 26, 14, "#fffdf2") + ellipse(112, -84, 26, 14, "#fffdf2")
                   + art.glow(-112, -84, 70, "#fffdf2", 0.6) + art.glow(112, -84, 70, "#fffdf2", 0.6), "softpulse", 2)
            + rect(-152, -40, 304, 8, shade(color, 0.5)))


# ---------------------------------------------------------------- site kit

def cctv(x, y, s=1.0, angle=22, flip=False, pan=True):
    body = (rect(20, -22, 72, 26, "#e8e8ea", rx=11) + path("M14 -27L98 -27L103 -20L19 -20Z", "#cfcfd4")
            + rect(24, -6, 64, 4, "#c4c4c9", rx=2)
            + circle(92, -9, 8, "#111114") + circle(94, -11, 2.5, "#ffffff", opacity=0.6)
            + circle(32, -9, 2.6, RED_GLOW, style=motion("blink", 1.4, "linear", x * 0.01)))
    if pan:
        body = anim(body, sway(7), 9, delay=x * 0.02, origin=(28, -6))
    inner = (rect(-6, -16, 12, 32, "#2c2c2e", rx=3) + path("M0 0L28 -6", stroke="#2c2c2e", stroke_width=7,
                                                             stroke_linecap="round")
             + f'<g transform="rotate({angle} 28 -6)">{body}</g>')
    return at(x, y, s, inner, sx=-s if flip else s)


def dome(x, y, s=1.0):
    return at(x, y, s, rect(-30, -4, 60, 10, "#e5e5e8", rx=3),
              path("M-24 6A24 20 0 0 0 24 6Z", "#1c1c1e"),
              path("M-14 10A14 10 0 0 0 0 20", stroke="#fff", stroke_width=2, opacity=0.35),
              circle(10, 12, 2.2, RED_GLOW, style=motion("blink", 1.6, "linear")))


def lamp(art, x, top, base, color="#26262b", head=True, glow_r=180, a=0.35):
    out = rect(x - 4, top, 8, base - top, color) + path(f"M{x} {top}Q{x} {top - 26} {x + 40} {top - 26}",
                                                          stroke=color, stroke_width=6)
    if head:
        out += rect(x + 30, top - 32, 38, 10, color, rx=4) + rect(x + 34, top - 22, 30, 4, "#f4f1ea")
        out += anim(art.glow(x + 49, top - 18, glow_r, "#f4efe4", a), "softpulse", 5.5, delay=x * 0.01)
    return out


def floodlight(art, x, top, base, color="#232328", a=0.45, cone=True, toward=-1):
    out = rect(x - 5, top, 10, base - top, color)
    out += rect(x - 34, top - 26, 68, 26, color, rx=3) + rect(x - 30, top - 6, 60, 5, "#f7f4ec")
    if cone:
        out = anim(poly([(x - 30, top), (x + 30, top), (x + 260 * toward + 260, base), (x + 260 * toward - 260, base)],
                        art.lin([(0, "#f7f4ec", 0.22), (1, "#f7f4ec", 0)])), "softpulse", 6) + out
    out += anim(art.glow(x, top - 4, 150, "#f7f4ec", a), "softpulse", 6)
    return out


def clouds(art, w, y0, y1, seed, color="#ffffff", op=0.8, count=6, dur=90, scale=1.0):
    """A strip of soft clouds that drifts left and wraps seamlessly every `dur` seconds."""
    rnd = random.Random(seed)
    shapes = []
    for i in range(count):
        cx = (i + rnd.uniform(0.1, 0.9)) * w / count
        cy = rnd.uniform(y0, y1)
        k = rnd.uniform(0.7, 1.3) * scale
        puff = (ellipse(0, 0, 90 * k, 26 * k, color) + ellipse(-40 * k, -12 * k, 46 * k, 30 * k, color)
                + ellipse(22 * k, -24 * k, 54 * k, 38 * k, color) + ellipse(68 * k, -6 * k, 40 * k, 24 * k, color))
        shapes.append(f'<g transform="translate({n(cx)} {n(cy)})" opacity="{n(rnd.uniform(0.55, 1.0) * op)}">{puff}</g>')
    strip = "".join(shapes)
    return anim(strip + f'<g transform="translate({w} 0)">{strip}</g>', drift(-w), dur, "linear", seed)


def sheen(art, x, y, w, h, clip=None, dur=7.0, delay=0.0, a=0.28):
    """A soft diagonal highlight that sweeps across a shape now and then."""
    cp = art.clip(clip or rect(x, y, w, h, "#000"))
    bw = max(90.0, w * 0.16)
    g = art.lin([(0, "#fff", 0), (0.5, "#fff", a), (1, "#fff", 0)], 0, 0, 1, 0)
    cx = x + w / 2
    band = poly([(cx - bw, y + h), (cx, y + h), (cx + bw * 0.7, y), (cx - bw * 0.3, y)], g)
    return group(anim(band, sweep(w / 2 + bw * 1.5), dur, "ease-in-out", delay), clip_path=cp)


def crane(x, base, mast_h, jib_l, jib_r, color, sw=3.0, hook=0.6, load=True):
    top = base - mast_h
    w = 22
    o = [line(x - w / 2, base, x - w / 2, top, color, sw), line(x + w / 2, base, x + w / 2, top, color, sw)]
    d, yy, flip = "", base, 1
    while yy - 26 > top:
        d += f"M{n(x - w / 2 * flip)} {n(yy)}L{n(x + w / 2 * flip)} {n(yy - 26)}"
        yy -= 26
        flip *= -1
    o.append(path(d, stroke=color, stroke_width=sw * 0.6))
    jy = top
    o.append(line(x - jib_l, jy, x + jib_r, jy, color, sw * 1.3))
    o.append(line(x - jib_l, jy - 16, x + jib_r * 0.96, jy - 16, color, sw * 0.8))
    d, xx, k = "", x - jib_l, 0
    while xx < x + jib_r * 0.95:
        d += f"M{n(xx)} {n(jy)}L{n(xx + 16)} {n(jy - 16)}L{n(xx + 32)} {n(jy)}"
        xx += 32
        k += 1
    o.append(path(d, stroke=color, stroke_width=sw * 0.55))
    o.append(path(f"M{n(x - jib_l)} {n(jy - 16)}L{n(x)} {n(jy - 74)}L{n(x + jib_r * 0.92)} {n(jy - 16)}",
                  stroke=color, stroke_width=sw * 0.7))
    o.append(line(x, jy - 74, x, jy, color, sw))
    o.append(rect(x - jib_l, jy - 8, 64, 40, color))
    o.append(rect(x + 12, jy + 2, 34, 28, color, rx=3))
    hx = x + jib_r * hook
    o.append(rect(hx - 10, jy - 4, 20, 10, color))
    hb = jy + mast_h * 0.38
    rig = line(hx, jy, hx, hb, color, 1.4) + path(f"M{n(hx)} {n(hb)}q0 12 -8 12", stroke=color, stroke_width=3)
    if load:
        rig += line(hx - 4, hb + 10, hx - 70, hb + 46, color, 1.2) + line(hx - 4, hb + 10, hx + 62, hb + 46, color, 1.2)
        rig += rect(hx - 120, hb + 46, 240, 14, color)
    o.append(anim(rig, sway(1.4), 7, delay=x * 0.01, origin=(hx, jy)))
    o.append(circle(x + 6, jy - 74, 3, RED_GLOW, style=motion("blink", 2.2, "linear")))
    return "".join(o)


def heras(art, x0, x1, top, bot, panel=420, color="#8e8e93", cell=(11, 22), mesh_op=0.55, sw=4.0,
          foot="#3a3a3c"):
    cw, ch = cell
    mesh = art.pattern(cw, ch, f'<path d="M0 0H{cw}M0 0V{ch}" stroke="{color}" stroke-width="{n(max(1.0, sw / 4))}" '
                               f'fill="none" opacity="{mesh_op}"/>')
    o = []
    xx = x0
    while xx < x1:
        o.append(rect(xx, top, panel, bot - top, mesh))
        o.append(rect(xx, top, panel, bot - top, "none", stroke=color, stroke_width=sw, rx=sw))
        xx += panel
    xx = x0
    while xx <= x1 + 1:
        o.append(rect(xx - sw * 6, bot - sw * 2, sw * 12, sw * 4.5, foot, rx=sw))
        o.append(rect(xx - sw * 1.4, top + (bot - top) * 0.18, sw * 2.8, sw * 3, shade(color, 0.3), rx=1))
        o.append(rect(xx - sw * 1.4, top + (bot - top) * 0.78, sw * 2.8, sw * 3, shade(color, 0.3), rx=1))
        xx += panel
    return "".join(o)


def palisade(x0, x1, top, bot, color, w=12.0, gap=7.0):
    o = [rect(x0, top + 26, x1 - x0, 7, shade(color, 0.25)), rect(x0, bot - 42, x1 - x0, 7, shade(color, 0.25))]
    xx = x0
    while xx < x1:
        o.append(poly([(xx, bot), (xx, top + 12), (xx + w * 0.25, top + 2), (xx + w * 0.5, top + 9),
                       (xx + w * 0.75, top), (xx + w, top + 12), (xx + w, bot)], color))
        xx += w + gap
    return "".join(o)


def cone(x, y, s=1.0):
    return at(x, y, s, rect(-34, -10, 68, 10, "#1a1a1c", rx=2),
              poly([(-26, -10), (26, -10), (8, -96), (-8, -96)], RED_HI),
              poly([(-19, -42), (19, -42), (14, -64), (-14, -64)], "#f3f3f5"),
              poly([(-6, -96), (6, -96), (4, -104), (-4, -104)], RED_HI))


def houses(art, x0, base, count, w, h, gap, brick, opening, timber, scaffold=(), roof=None):
    roof = roof or h * 0.55
    bp = art.pattern(26, 12, f'<path d="M0 0H26M0 6H26M13 0V6M0 6V12" stroke="{shade(brick, 0.35)}" '
                             f'stroke-width="1" fill="none"/>')
    o = []
    for i in range(count):
        x = x0 + i * (w + gap)
        o.append(rect(x, base - h, w, h, brick) + rect(x, base - h, w, h, bp, opacity=0.8))
        o.append(rect(x + w * 0.14, base - h * 0.82, w * 0.24, h * 0.24, opening))
        o.append(rect(x + w * 0.62, base - h * 0.82, w * 0.24, h * 0.24, opening))
        o.append(rect(x + w * 0.14, base - h * 0.4, w * 0.24, h * 0.22, opening))
        o.append(rect(x + w * 0.6, base - h * 0.44, w * 0.2, h * 0.44, opening))
        for k, off in enumerate((12, 6, 0)):
            col = tint(timber, 0.12 * (2 - k)) if k < 2 else timber
            ax, ay = x + w / 2 + off, base - h - roof
            o.append(path(f"M{n(x - 10 + off)} {n(base - h)}L{n(ax)} {n(ay)}L{n(x + w + 10 + off)} {n(base - h)}"
                          f"M{n(ax)} {n(ay)}L{n(ax)} {n(base - h)}M{n(x + w * 0.25 + off)} {n(base - h)}L{n(ax)} {n(ay + roof * 0.5)}"
                          f"M{n(x + w * 0.75 + off)} {n(base - h)}L{n(ax)} {n(ay + roof * 0.5)}",
                          stroke=col, stroke_width=3, stroke_linejoin="round", opacity=0.9 if k < 2 else 1))
        o.append(rect(x - 10, base - h - 4, w + 20, 6, timber))
        if i in scaffold:
            sx = x - 18
            while sx <= x + w + 18:
                o.append(line(sx, base, sx, base - h - 30, "#9a9aa0", 3))
                sx += (w + 36) / 4
            for k in range(1, 5):
                yy = base - (h + 30) * k / 4
                o.append(line(x - 18, yy, x + w + 18, yy, "#9a9aa0", 3))
                o.append(rect(x - 18, yy - 6, w + 36, 6, "#77777d"))
    return "".join(o)


def excavator(x, y, s, color):
    return at(x, y, s,
              rect(-110, -38, 230, 38, color, rx=19),
              rect(-80, -112, 150, 76, color, rx=6),
              rect(-40, -170, 70, 62, color, rx=6),
              path("M60 -100L170 -210L290 -150L300 -60", stroke=color, stroke_width=22,
                   stroke_linejoin="round", stroke_linecap="round"),
              path("M282 -70L340 -64L320 -10L270 -24Z", color))


def skyline(seed, x0, x1, base, hmin, hmax, color, lit=None, lit_p=0.12, wmin=50, wmax=130):
    rnd = random.Random(seed)
    o, xx = [], x0
    while xx < x1:
        w = rnd.uniform(wmin, wmax)
        h = rnd.uniform(hmin, hmax)
        o.append(rect(xx, base - h, w + 1, h, color))
        if rnd.random() < 0.3:
            o.append(rect(xx + w * 0.45, base - h - rnd.uniform(16, 60), 3, 60, color))
        if lit:
            for wy in range(int(base - h + 14), int(base - 10), 18):
                for wx in range(int(xx + 8), int(xx + w - 10), 16):
                    if rnd.random() < lit_p:
                        o.append(rect(wx, wy, 7, 9, lit, opacity=round(rnd.uniform(0.35, 0.9), 2)))
        xx += w + rnd.uniform(0, 12)
    return "".join(o)


def stars(seed, w, h, count=60, color="#ffffff"):
    rnd = random.Random(seed)
    out = []
    for _ in range(count):
        x, y, r, op = rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(0.6, 1.8), round(rnd.uniform(0.2, 0.8), 2)
        style = motion("twinkle", round(rnd.uniform(2.5, 6), 1), delay=rnd.uniform(0, 6)) if rnd.random() < 0.4 else None
        out.append(circle(x, y, r, color, opacity=op, style=style))
    return "".join(out)


def moon(art, cx, cy, r):
    return anim(art.glow(cx, cy, r * 4.5, "#e8e8ee", 0.2), "softpulse", 7) + circle(cx, cy, r, "#ececf0") + circle(
        cx - r * 0.3, cy - r * 0.2, r * 0.18, "#d6d6dc") + circle(cx + r * 0.25, cy + r * 0.3, r * 0.12, "#d6d6dc")


def crowd(art, x0, x1, y0, y1, rows, seed, front="#0c0b0e", back="#3a2a32", rim=RED_GLOW, raise_p=0.16,
          phone_p=0.05):
    rnd = random.Random(seed)
    o = []
    for r in range(rows):
        t = r / max(1, rows - 1)
        y = y0 + (y1 - y0) * (t ** 1.3)
        s = 0.55 + 0.8 * t
        col = mix(back, front, t ** 0.7)
        xx = x0 - rnd.uniform(0, 40 * s)
        # Alternate people go into two groups that bounce out of step, like a crowd moving to music.
        halves = ([], [])
        k = 0
        while xx < x1 + 40:
            sz = s * rnd.uniform(0.9, 1.1)
            yy = y + rnd.uniform(-6, 6) * s
            person = [path("M-27 160L-27 -4Q-26 -22 -10 -27L10 -27Q26 -22 27 -4L27 160Z", col),
                      rect(-6, -36, 12, 12, col), ellipse(0, -44, 12, 14, col)]
            if rnd.random() < raise_p:
                side = rnd.choice((-1, 1))
                person.append(path(f"M{18 * side} -20L{26 * side} -62L{22 * side} -100", stroke=col, stroke_width=9,
                                   stroke_linecap="round", stroke_linejoin="round"))
                person.append(circle(22 * side, -104, 6, col))
                if rnd.random() < phone_p * 6:
                    person.append(rect(22 * side - 4, -122, 8, 13, "#e9eef5", rx=1.5,
                                       style=motion("twinkle", round(rnd.uniform(1.5, 3.5), 1), delay=rnd.uniform(0, 3))))
            person.append(path("M-9 -53Q0 -60 9 -53", stroke=rim, stroke_width=2.5, opacity=round(0.25 + 0.5 * t, 2)))
            halves[k % 2].append(at(xx, yy, sz, *person))
            k += 1
            xx += 46 * s * rnd.uniform(0.85, 1.25)
        for i, half in enumerate(halves):
            o.append(anim("".join(half), bob(-4 * s), round(0.95 + 0.12 * r, 2), delay=0.48 * i + 0.2 * r))
    return "".join(o)


def cross(dist):
    """Move `dist` px to the right over one loop, fading in and out at the ends so the wrap is invisible."""
    d = n(dist)
    return keyframes(f"cross{_tag(dist)}", f"0%{{transform:translateX(0);opacity:0}}6%{{opacity:1}}94%{{opacity:1}}"
                                           f"100%{{transform:translateX({d}px);opacity:0}}")


def walker(x, y, h, dist, dur, shirt="#3d4b5c", trousers="#1d1d22", skin=SKINS[1], hair="#1a1612", flip=False,
           delay=0.0, step=1.0, vest=False, bag=None):
    """A pedestrian seen side-on, swinging arms and legs, crossing `dist` px every `dur` seconds."""
    s = h / 400

    def leg(col):
        return (path("M0 -190L5 -100L0 -14", stroke=col, stroke_width=26, stroke_linecap="round",
                     stroke_linejoin="round") + ellipse(9, -8, 19, 8, "#0b0b0c"))

    def arm(col):
        return (path("M0 -322L3 -262L8 -216", stroke=col, stroke_width=18, stroke_linecap="round",
                     stroke_linejoin="round") + circle(8, -211, 9, skin))

    legs, arms = sway(24), sway(20)
    back = (anim(arm(shade(shirt, 0.35)), arms, step, delay=delay, origin=(0, -322))
            + anim(leg(shade(trousers, 0.4)), legs, step, delay=delay + step / 2, origin=(0, -190)))
    torso = path("M-24 -338Q-31 -296 -27 -186L27 -186Q31 -298 22 -338Q0 -347 -24 -338Z", shirt)
    if vest:
        torso += path("M-22 -330Q-28 -290 -25 -200L25 -200Q29 -290 20 -330Z", RED_HI)
        torso += rect(-26, -262, 52, 7, "#f3f3f5") + rect(-26, -236, 52, 7, "#f3f3f5")
    torso += path("M10 -338Q24 -300 27 -186L14 -186Z", "#000", opacity=0.15)
    if bag:
        torso += rect(-40, -300, 20, 64, bag, rx=6)
    head = (rect(-7, -352, 14, 18, skin) + ellipse(5, -372, 21, 25, skin)
            + path("M-16 -362Q-22 -396 6 -398Q26 -396 25 -380Q10 -386 2 -376Q-6 -368 -16 -362Z", hair))
    front = (anim(leg(trousers), legs, step, delay=delay, origin=(0, -190))
             + anim(arm(shirt), arms, step, delay=delay + step / 2, origin=(0, -322)))
    body = anim(back + torso + head + front, bob(-6), step / 2, delay=delay)
    return at(x, y, s, anim(body, cross(dist / s), dur, "linear", delay), sx=-s if flip else s)


def birds(x, y, count, seed, dist=1900, dur=24, color="#3a3a40", s=1.0):
    rnd = random.Random(seed)
    flap = keyframes("flap", "0%,100%{transform:scaleY(1)}50%{transform:scaleY(-0.45)}")
    flock = ""
    for _ in range(count):
        bx, by = rnd.uniform(-70, 70) * s, rnd.uniform(-34, 34) * s
        bird = path("M-12 0Q-6 -8 0 0Q6 -8 12 0", stroke=color, stroke_width=2.4, stroke_linecap="round")
        flock += (f'<g transform="translate({n(bx)} {n(by)}) scale({s})">'
                  f'{anim(bird, flap, round(rnd.uniform(0.32, 0.5), 2), delay=rnd.uniform(0, 1))}</g>')
    return f'<g transform="translate({n(x)} {n(y)})">{anim(flock, cross(dist), dur, "linear", seed)}</g>'


def rain(art, w, h, a=0.3, dur=0.45, color="#cfd6e4"):
    tile = art.pattern(48, 96, f'<path d="M34 0L28 30M10 48L4 78" stroke="{color}" stroke-width="1.6" '
                               f'stroke-linecap="round" opacity="{n(a)}"/>')
    return anim(rect(0, -96, w, h + 96, tile), drift(0, 96), dur, "linear")


def flag(x, top, h, w, color=RED_HI, pole="#c7c7cc", emblem=True, delay=0.0, emblem_color=WHITE):
    wave = keyframes("wave", "0%,100%{transform:skewY(0deg) scaleX(1)}25%{transform:skewY(5deg) scaleX(.95)}"
                             "50%{transform:skewY(0deg) scaleX(1)}75%{transform:skewY(-4deg) scaleX(.97)}")
    cloth = path(f"M{n(x)} {n(top)}Q{n(x + w * 0.5)} {n(top - 6)} {n(x + w)} {n(top + 4)}L{n(x + w)} {n(top + h * 0.42 + 4)}"
                 f"Q{n(x + w * 0.5)} {n(top + h * 0.42 - 4)} {n(x)} {n(top + h * 0.42)}Z", color)
    if emblem:
        cloth += mark(x + w * 0.48, top + h * 0.21, min(h * 0.3, w * 0.62), emblem_color)
    return (rect(x - 3, top - 8, 6, h + 8, pole) + circle(x, top - 10, 5, pole)
            + anim(cloth, wave, 2.6, delay=delay, origin=(x, top + h * 0.21)))


def ticker(art, x, y, w, h, labels, size, color=RED_GLOW, bg="#0a0a0c", dur=14, delay=0.0):
    """An LED strip whose labels scroll left forever. Labels sit in fixed slots so the loop is exact."""
    slot = w / len(labels)
    row = "".join(mono(x + i * slot + 16, y + h / 2 + size * 0.36, lab, size, color, 700) for i, lab in enumerate(labels))
    strip = row + f'<g transform="translate({n(w)} 0)">{row}</g>'
    dots = art.pattern(4, 4, '<rect width="4" height="4" fill="#000" opacity="0.35"/><rect width="3" height="3" fill="none"/>')
    return (rect(x, y, w, h, bg)
            + group(anim(strip, drift(-w), dur, "linear", delay), clip_path=art.clip(rect(x, y, w, h, "#000")))
            + rect(x, y, w, h, dots, opacity=0.5))


def beam(art, x, y, tx, ty, spread, color, a0=0.35, a1=0.0, w0=2.0):
    dx, dy = tx - x, ty - y
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    px, py = -uy, ux
    hw = L * math.tan(math.radians(spread))
    p = [(x + px * w0, y + py * w0), (x - px * w0, y - py * w0), (tx - px * hw, ty - py * hw), (tx + px * hw, ty + py * hw)]
    return poly(p, art.lin([(0, color, a0), (1, color, a1)], x, y, tx, ty, user=True))


def reflect(art, content, gy, depth=220, op=0.3):
    mid = art.uid("m")
    g = art.lin([(0, "#fff", op), (1, "#fff", 0)], 0, gy, 0, gy + depth, user=True)
    art.define(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-4000" y="{n(gy)}" width="12000" height="{n(depth)}">'
               f'<rect x="-4000" y="{n(gy)}" width="12000" height="{n(depth)}" fill="{g}"/></mask>')
    return f'<g mask="url(#{mid})"><g transform="translate(0 {n(2 * gy)}) scale(1 -1)">{content}</g></g>'


def vignette(art, a=0.55, inner=0.55):
    return rect(0, 0, art.w, art.h, art.rad([(inner, "#000", 0), (1, "#000", a)], r=0.75))


def brackets(x, y, w, h, L=34, color=WHITE, op=0.5, sw=2.0):
    d = (f"M{n(x)} {n(y + L)}V{n(y)}H{n(x + L)}M{n(x + w - L)} {n(y)}H{n(x + w)}V{n(y + L)}"
         f"M{n(x + w)} {n(y + h - L)}V{n(y + h)}H{n(x + w - L)}M{n(x + L)} {n(y + h)}H{n(x)}V{n(y + h - L)}")
    return path(d, stroke=color, stroke_width=sw, opacity=op)


def hud(x, y, label, size=15, color=WHITE, op=0.75, dot=RED_GLOW):
    out = ""
    if dot:
        out += circle(x + size * 0.4, y - size * 0.35, size * 0.35, dot, style=motion("blink", 1.6, "linear"))
        x += size * 1.2
    return out + mono(x, y, label, size, color, opacity=op)


def grain(art, a=0.08, seed=3):
    f = art.filter(f'<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="{seed}"/>'
                   '<feColorMatrix type="saturate" values="0"/>'
                   f'<feComponentTransfer><feFuncA type="linear" slope="{a}"/></feComponentTransfer>')
    return rect(0, 0, art.w, art.h, "#000", filter=f)


# ---------------------------------------------------------------- products

def tower(art, x, y, s=1.0, armed=True):
    """RapiDetect-style solar camera tower; base centre at (x, y)."""
    front = art.lin([(0, "#f7f7f9"), (1, "#d4d4d9")], 0, 0, 1, 0)
    panel = art.lin([(0, "#2a3546"), (1, "#121924")], 0, 0, 1, 1)
    grid_f = ""
    for k in range(1, 4):
        t = k / 4
        grid_f += line(-76 + 138 * t, -230, -52 + 92 * t, -360, "#4a5a70", 1.4)
    for k in range(1, 4):
        t = k / 4
        yy = -230 - 130 * t
        xl = -76 + 24 * t
        xr = 62 - 22 * t
        grid_f += line(xl, yy, xr, yy, "#4a5a70", 1.4)
    o = [ellipse(0, 0, 150, 20, "#000", opacity=0.35),
         rect(-110, -72, 180, 72, "#dcdce0"),
         poly([(70, 0), (110, -14), (110, -86), (70, -72)], "#a6a6ad"),
         poly([(-110, -72), (70, -72), (110, -86), (-70, -86)], "#efeff2"),
         rect(-110, -44, 180, 10, RED),
         poly([(70, -44), (110, -58), (110, -48), (70, -34)], RED_DARK),
         poly([(-46, -86), (34, -86), (20, -420), (-28, -420)], front),
         poly([(34, -86), (62, -98), (42, -428), (20, -420)], "#adadb4"),
         mark(-4, -170, 50, RED),
         poly([(-76, -230), (62, -230), (40, -360), (-52, -360)], panel),
         grid_f,
         poly([(-76, -230), (62, -230), (40, -360), (-52, -360)], "none", stroke="#e8e8ec", stroke_width=3,
              stroke_linejoin="round"),
         poly([(64, -236), (98, -250), (72, -372), (44, -362)], "#141a24"),
         line(81, -243, 58, -367, "#3a4658", 1.2), line(54, -299, 85, -311, "#3a4658", 1.2),
         poly([(64, -236), (98, -250), (72, -372), (44, -362)], "none", stroke="#c9c9cf", stroke_width=2.5,
              stroke_linejoin="round"),
         rect(-42, -472, 68, 52, "#ececef", rx=3),
         poly([(26, -420), (50, -429), (50, -481), (26, -472)], "#b5b5bc"),
         poly([(-42, -472), (26, -472), (50, -481), (-18, -481)], "#f9f9fb"),
         circle(-22, -446, 11, "#111114"), circle(-22, -446, 5, "#2c3440"), circle(-19, -449, 2, "#fff", opacity=0.7),
         circle(8, -446, 11, "#111114"), circle(8, -446, 5, "#2c3440"), circle(11, -449, 2, "#fff", opacity=0.7),
         ellipse(39, -452, 5, 10, "#111114"),
         ellipse(-28, -414, 8, 5, "#f4f4f6"), ellipse(4, -414, 8, 5, "#f4f4f6"),
         circle(18, -462, 2.4, RED_GLOW, style=motion("blink", 1.3, "linear")),
         rect(-26, -489, 36, 8, "#8e8e93", rx=2),
         ellipse(-8, -492, 20, 14, "#5a0a0a"),
         anim(ellipse(-8, -492, 20, 14, RED_HI) + ellipse(-14, -497, 7, 4, "#fff", opacity=0.6), "flash", 2.4, "linear")
         if armed else ellipse(-8, -492, 20, 14, RED_HI)]
    out = at(x, y, s, *o)
    if armed:
        out += anim(art.glow(x - 8 * s, y - 492 * s, 90 * s, RED_GLOW, 0.7), "flash", 2.4, "linear")
    return out


def coverage(art, cx, cy, rx, rings=3, color=RED_GLOW, flat=0.28, pulse=True):
    out = ellipse(cx, cy, rx, rx * flat, art.rad([(0, color, 0.16), (1, color, 0)]))
    for k in range(rings):
        r = rx * (k + 1) / rings
        out += ellipse(cx, cy, r, r * flat, "none", stroke=color, stroke_width=1.5,
                       stroke_dasharray="10 10", opacity=round(0.15 + 0.1 * k, 2))
    if pulse:
        for k in range(3):
            out += anim(ellipse(cx, cy, rx, rx * flat, "none", stroke=color, stroke_width=3), "ring", 4.5,
                        "ease-out", 1.5 * k)
    return out


def lock_plate(art, x, y, s=1.0):
    """Door plate with lever, cylinder, and a key on a red NCS tag. Centre of the cylinder at (x, y)."""
    metal = art.lin([(0, "#f0f0f3"), (0.5, "#c9c9ce"), (1, "#8f8f96")], 0, 0, 1, 1)
    lever = art.lin([(0, "#fafafb"), (0.5, "#cfcfd4"), (1, "#86868c")])
    bow = art.lin([(0, "#f2f2f4"), (1, "#9a9aa1")], 0, 0, 1, 1)
    o = [rect(-128, -318, 256, 520, "#000", rx=34, opacity=0.25, transform="translate(10 14)"),
         rect(-128, -318, 256, 520, metal, rx=34),
         rect(-128, -318, 256, 520, "none", rx=34, stroke="#ffffff", stroke_width=2, opacity=0.6),
         circle(0, -190, 54, "#b8b8be"), circle(0, -190, 44, metal),
         anim(rect(0, -214, 270, 46, lever, rx=23)
              + rect(0, -214, 270, 46, "none", rx=23, stroke="#77777d", stroke_width=1.5)
              + rect(30, -206, 220, 6, "#fff", rx=3, opacity=0.6),
              "press", 6, origin=(0, -190)),
         circle(0, -190, 26, "#a5a5ab"),
         circle(0, 0, 44, "#a9a9af"), circle(0, 0, 36, metal),
         circle(0, -8, 10, "#111114"), poly([(-6, -2), (6, -2), (9, 24), (-9, 24)], "#111114"),
         path("M4 -2L-8 -11H-118V11H-98L-94 19L-86 11H-76L-72 19L-64 11H-52L-48 17L-42 11H-8Z", bow,
              stroke="#77777d", stroke_width=1.5, stroke_linejoin="round"),
         line(-112, -2, -14, -2, "#8a8a90", 2),
         rect(-134, -17, 18, 34, bow, rx=4, stroke="#77777d", stroke_width=1.5),
         circle(-180, 0, 50, bow, stroke="#77777d", stroke_width=1.5),
         circle(-198, 0, 14, "#5a5a60"),
         circle(-198, 46, 44, "none", stroke="#c9c9ce", stroke_width=6),
         path("M-198 90V104", stroke="#c9c9ce", stroke_width=5),
         f'<g transform="rotate(8 -198 100)">'
         + anim(rect(-236, 96, 76, 118, RED_HI, rx=14) + circle(-198, 114, 7, "#2a2a2e")
                + mark(-198, 164, 54, WHITE), sway(5), 3.4, origin=(-198, 96)) + "</g>"]
    return at(x, y, s, *o)


# ---------------------------------------------------------------- icons (64 box)

def icon(name, x, y, size=64, color=WHITE, sw=3.0):
    k = size / 64
    st = dict(stroke=color, stroke_width=n(sw / k), stroke_linecap="round", stroke_linejoin="round")
    d = {
        "survey": [path("M18 10H46Q50 10 50 14V56Q50 60 46 60H18Q14 60 14 56V14Q14 10 18 10Z", **st),
                   rect(24, 5, 16, 9, color, rx=2), path("M21 28L25 32L33 24M38 29H44M21 45L25 49L33 41M38 46H44", **st)],
        "cctv": [path("M8 54V36H20", **st), path("M20 36L26 32", **st),
                 f'<g transform="rotate(18 22 26)">' + path("M18 18H52Q56 18 56 22V30Q56 34 52 34H18Z", **st)
                 + circle(50, 26, 3, color) + "</g>"],
        "patrol": [path("M32 6L52 14V30Q52 48 32 58Q12 48 12 30V14Z", **st),
                   path("M22 32L29 39L43 25", **st)],
        "clock": [circle(32, 32, 24, "none", **st), path("M32 18V32L42 38", **st)],
        "siren": [path("M18 46Q18 22 32 22Q46 22 46 46Z", **st), path("M12 46H52V54H12Z", **st),
                  path("M32 6V12M12 14L16 18M52 14L48 18M6 30H10M58 30H54", **st)],
        "motion": [circle(24, 14, 6, "none", **st), path("M24 22V40M24 40L16 56M24 40L32 56M14 30H34", **st),
                   path("M44 20Q52 32 44 44M50 14Q62 32 50 50", **st)],
        "solar": [path("M8 44L20 14H56L44 44Z", **st), path("M14 29H50M26 14L20 44M38 14L32 44", **st),
                  path("M32 44V56M22 56H42", **st)],
        "radius": [circle(32, 32, 26, "none", stroke_dasharray="4 6", **st), circle(32, 32, 15, "none", **st),
                   circle(32, 32, 4, color), path("M32 32L56 20", **st)],
        "key": [circle(20, 32, 11, "none", **st), path("M31 32H58M50 32V41M43 32V39", **st)],
        "lock": [path("M18 30H46V56H18Z", **st), path("M23 30V22Q23 12 32 12Q41 12 41 22V30", **st),
                 path("M32 40V46", **st)],
        "van": [path("M6 44V22Q6 18 10 18H38L48 30H56Q58 30 58 34V44Z", **st), circle(18, 46, 6, "none", **st),
                circle(46, 46, 6, "none", **st)],
    }[name]
    return at(x, y, k, *d)


def call_bar(y, h=140, w=1600, pad=110):
    return (rect(0, y, w, h, WHITE) + rect(0, y, w, 6, RED)
            + lockup(pad, y + h * 0.6, 28, light=False)
            + text(w - pad, y + 52, "CALL TODAY FOR MORE INFO", 16, INK, 700, "end", letter_spacing="2.5")
            + text(w - pad, y + 98, "01253 982 211", 44, RED, 800, "end", letter_spacing="1")
            + text(w - pad, y + 124, "newconceptsecurity.co.uk", 15, FAINT, 500, "end"))
