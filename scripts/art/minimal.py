"""Minimal illustrations: flat, crisp shapes on a transparent background whose scenery fades out at
the edges, so each picture blends into whatever section it sits on. Every drawing has a light tone
(for white and light grey sections) and a dark tone (for black sections)."""
import math
import random

from lib import *  # noqa: F401,F403


class Tone:
    def __init__(self, name):
        self.name = name
        d = self.dark = name == "dark"
        self.far = "#1c1c1e" if d else "#eeeef1"
        self.mid = "#29292c" if d else "#e2e2e7"
        self.near = "#38383b" if d else "#d0d0d6"
        self.line = "#48484c" if d else "#b9b9bf"
        self.strong = "#7c7c82" if d else "#6e6e73"
        self.ink = "#f5f5f7" if d else "#1d1d1f"
        self.soft = "#a1a1a6" if d else "#86868b"
        self.suit = "#3d3d42" if d else "#1d1d1f"
        self.trousers = "#2f2f33" if d else "#141416"
        self.glass = "#262e37" if d else "#dfe6ec"
        self.lit = "#efe4cc" if d else "#f8f4ec"
        self.white = "#f2f2f4" if d else "#ffffff"
        self.edge = "#5c5c61" if d else "#c4c4ca"
        self.shadow_a = 0.6 if d else 0.13
        self.grass = "#22392a" if d else "#dbe8dd"


# ---------------------------------------------------------------- helpers

def fade(a, content, left=0.16, right=0.16, top=0.0, bottom=0.16):
    """Dissolve the drawing into transparency towards the edges so it melts into the section behind."""
    gx = a.lin([(0, "#fff", 0), (left, "#fff", 1), (1 - right, "#fff", 1), (1, "#fff", 0)], 0, 0, 1, 0)
    gy = a.lin([(0, "#fff", 0 if top else 1), (max(top, 0.001), "#fff", 1), (1 - bottom, "#fff", 1),
                (1, "#fff", 0 if bottom else 1)])
    mx, my = a.uid("m"), a.uid("m")
    for m, g in ((mx, gx), (my, gy)):
        a.define(f'<mask id="{m}" maskUnits="userSpaceOnUse" x="0" y="0" width="{a.w}" height="{a.h}">'
                 f'<rect width="{a.w}" height="{a.h}" fill="{g}"/></mask>')
    return f'<g mask="url(#{my})"><g mask="url(#{mx})">{content}</g></g>'


def ground(t, y, x0=0, x1=1600):
    return rect(x0, y, x1 - x0, 2, t.line)


def floor_shadow(a, t, cx, cy, rx):
    return ellipse(cx, cy, rx, rx * 0.11, a.rad([(0, "#000", t.shadow_a), (1, "#000", 0)]))


def person(t, x, y, h, kind="suit", pose="clasped", skin=SKINS[0], **kw):
    if kind == "scrubs":
        return officer(x, y, h, kind, pose, skin, **kw)
    return officer(x, y, h, kind, pose, skin, jacket=t.suit, trousers=t.trousers, **kw)


def van_m(a, t, x, y, s=1.0, lights=True, moving=False):
    """Flat liveried van, side view facing right; (x, y) is the rear wheel ground line."""
    o = [ellipse(304, -2, 330, 14, a.rad([(0, "#000", t.shadow_a), (1, "#000", 0)])),
         path("M8 -44L8 -246Q8 -262 24 -262L424 -262Q446 -262 458 -248L522 -158L584 -138"
              "Q600 -132 600 -114L600 -50Q600 -44 594 -44Z", t.white, stroke=t.edge, stroke_width=3),
         poly([(60, -259), (168, -259), (292, -72), (184, -72)], RED),
         poly([(186, -259), (202, -259), (326, -72), (310, -72)], INK),
         rect(9, -80, 590, 9, RED),
         path("M438 -244L452 -244L506 -164L438 -164Z", t.glass if t.dark else "#cfd8e0"),
         line(430, -254, 430, -84, t.edge, 2),
         mark(372, -196, 46, RED),
         path("M582 -132L598 -126L598 -110L578 -113Z", "#fffdf2"),
         rect(9, -206, 8, 40, RED_HI, rx=2),
         rect(300, -277, 124, 14, "#2c2c2e", rx=6)]
    reds = "".join(rect(305 + i * 29, -274, 25, 8, RED_HI, rx=3) for i in (0, 2))
    whites = "".join(rect(305 + i * 29, -274, 25, 8, "#f2f2f4", rx=3) for i in (1, 3))
    o.append(anim(reds, "strobeA", 1.1, "linear", x * 0.01) + anim(whites, "strobeB", 1.1, "linear", x * 0.01)
             if lights else reds + whites)
    for wx in (126, 488):
        o.append(circle(wx, -38, 37, "#1d1d1f") + circle(wx, -38, 18, "#d2d2d7"))
        spokes = "".join(line(wx + 5 * math.cos(math.radians(k)), -38 + 5 * math.sin(math.radians(k)),
                              wx + 15 * math.cos(math.radians(k)), -38 + 15 * math.sin(math.radians(k)),
                              "#8e8e93", 3.5, stroke_linecap="round") for k in range(0, 360, 72))
        o.append(anim(spokes, "spin", 0.7, "linear", origin=(wx, -38)) if moving else spokes)
    return at(x, y, s, *o)


def car_m(a, t, x, y, s=1.0):
    body = "#3a3a3f" if t.dark else "#1d1d1f"
    o = [ellipse(320, -2, 330, 14, a.rad([(0, "#000", t.shadow_a), (1, "#000", 0)])),
         path("M6 -48L6 -118Q8 -140 34 -146L132 -156L196 -226Q206 -236 226 -236L436 -236Q456 -236 468 -226"
              "L546 -160L616 -150Q636 -146 638 -124L638 -60Q638 -48 626 -48Z", body),
         path("M210 -222L318 -222L318 -164L150 -164Z", "#55606c" if not t.dark else "#4a5560"),
         path("M330 -222L440 -222Q450 -222 458 -214L512 -164L330 -164Z", "#55606c" if not t.dark else "#4a5560"),
         path("M612 -146L634 -140L634 -128L604 -132Z", "#fffdf2"), rect(6, -134, 10, 22, RED_HI, rx=2)]
    for wx in (150, 510):
        o.append(circle(wx, -42, 40, "#0e0e10") + circle(wx, -42, 20, "#8e8e93"))
    return at(x, y, s, *o)


def windows(t, x, y, w, h, cols, rows, seed, lit_p=0.35, pad=8):
    rnd = random.Random(seed)
    cw, ch = w / cols, h / rows
    out = []
    for c in range(cols):
        for r in range(rows):
            lit = t.dark and rnd.random() < lit_p
            out.append(rect(x + c * cw + pad, y + r * ch + pad, cw - 2 * pad, ch - 2 * pad, t.lit if lit else t.glass,
                            rx=3, style=motion("twinkle", round(rnd.uniform(6, 12), 1), delay=rnd.uniform(0, 12))
                            if lit and rnd.random() < 0.3 else None))
    return "".join(out)


def barrier_kf():
    return keyframes("barrier", "0%,30%{transform:rotate(0)}42%,72%{transform:rotate(80deg)}84%,100%{transform:rotate(0)}")


def revolving(t, cx, top, bot, r):
    steps = []
    for k in range(25):
        u = k / 24
        c = math.cos(2 * math.pi * u)
        steps.append(f"{n(u * 100)}%{{transform:scaleX({c if abs(c) > 0.02 else 0.02:.3f});"
                     f"opacity:{0.85 if math.sin(2 * math.pi * u) > 0 else 0.4}}}")
    wing = keyframes("wing", "".join(steps))
    panel = (rect(cx, top + 8, r, bot - top - 10, "#93a6b8" if not t.dark else "#4f6070", opacity=0.6)
             + line(cx + r - 3, top + 8, cx + r - 3, bot - 2, t.strong, 5) + line(cx, top + 8, cx, bot - 2, t.strong, 5))
    return (rect(cx - r - 8, top - 16, 2 * r + 16, 18, t.strong, rx=6)
            + "".join(anim(panel, wing, 8, "linear", 2 * k, origin=(cx, top)) for k in range(4))
            + line(cx - r, top, cx - r, bot, t.strong, 6) + line(cx + r, top, cx + r, bot, t.strong, 6))


# ---------------------------------------------------------------- scenes

def security_personnel(t):
    a = Art(1600, 1000, "Two security officers in suits standing at a reception desk")
    s = [rect(470, 170, 660, 430, t.far, rx=24), rect(650, 250, 300, 250, t.mid, rx=18), mark(800, 375, 150, RED)]
    for x in (560, 800, 1040):
        s += [line(x, 0, x, 92, t.line, 2), path(f"M{x - 34} 120Q{x} 74 {x + 34} 120Z", t.strong)]
    s += [rect(410, 592, 780, 16, t.near, rx=8),
          rect(420, 606, 760, 148, t.white, stroke=t.edge, stroke_width=3, rx=10),
          rect(421, 742, 758, 10, RED), mark(800, 676, 40, RED), ground(t, 882)]
    for x, h, sk in ((560, 480, SKINS[3]), (1040, 490, SKINS[0])):
        s += [floor_shadow(a, t, x, 882, 110), person(t, x, 882, h, "suit", "clasped", sk)]
    a.add(fade(a, "".join(s)))
    return a


def guarding(t):
    a = Art(1600, 1000, "Security officer with a clipboard at a gatehouse barrier")
    s = [ground(t, 862),
         rect(1346, 250, 8, 612, t.line), rect(1316, 232, 70, 22, t.strong, rx=4),
         rect(915, 500, 310, 24, t.strong, rx=6),
         rect(930, 524, 280, 338, t.white, stroke=t.edge, stroke_width=3, rx=8),
         rect(931, 525, 278, 14, RED), text(1070, 536, "SECURITY", 10, WHITE, 800, "middle", letter_spacing="3"),
         rect(960, 570, 220, 128, t.glass, rx=8), rect(980, 642, 70, 40, t.strong, rx=4)]
    arm = rect(280, 704, 600, 14, t.white, stroke=t.edge, stroke_width=2, rx=7) + "".join(
        rect(880 - (i + 1) * 60, 705, 60, 12, RED) for i in range(0, 10, 2))
    s += [anim(arm, barrier_kf(), 11, origin=(880, 711)),
          rect(272, 712, 8, 150, t.line),
          rect(858, 690, 44, 172, t.white, stroke=t.edge, stroke_width=3, rx=8), rect(858, 690, 44, 14, RED, rx=6),
          circle(880, 711, 8, t.strong),
          floor_shadow(a, t, 620, 862, 100), person(t, 620, 862, 470, "uniform", "clipboard", SKINS[4])]
    a.add(fade(a, "".join(s)))
    return a


def site_officer(t):
    a = Art(1600, 1000, "Security officer in a high-visibility vest on a construction site")
    s = [ground(t, 862), crane(330, 862, 640, 200, 860, t.line, sw=2.6, hook=0.62)]
    for x in range(980, 1381, 100):
        s.append(rect(x - 5, 420, 10, 442, t.near))
    for y in (420, 520, 620, 720):
        s.append(rect(970, y, 420, 10, t.near))
    s += [heras(a, 160, 1440, 700, 862, panel=320, color=t.near, cell=(14, 28), mesh_op=0.6, sw=3, foot=t.line),
          floor_shadow(a, t, 1150, 862, 46), cone(1150, 862, 1.0), floor_shadow(a, t, 1240, 862, 38), cone(1240, 862, 0.8),
          floor_shadow(a, t, 760, 862, 110), person(t, 760, 862, 500, "uniform", "radio", SKINS[1], vest=True, hat=True)]
    a.add(fade(a, "".join(s)))
    return a


def close_protection(t):
    a = Art(1600, 1000, "Close protection officer in an overcoat beside an executive car")
    s = [ground(t, 862), rect(880, 140, 720, 722, t.far),
         path("".join(f"M{x} 140V862" for x in range(936, 1600, 56)) + "".join(f"M880 {y}H1600" for y in range(188, 862, 48)),
              stroke=t.mid, stroke_width=3),
         rect(1080, 700, 180, 162, t.glass),
         car_m(a, t, 560, 862, 1.0),
         floor_shadow(a, t, 520, 880, 100), person(t, 520, 880, 470, "overcoat", "clasped", SKINS[2])]
    a.add(fade(a, "".join(s)))
    return a


def fleet_night(t):
    a = Art(1920, 1080, "New Concept Security vans parked outside Concept House")
    s = [ground(t, 930, 0, 1920)]
    if t.dark:
        s += [circle(1580, 150, 36, "#ececf0"), circle(1594, 140, 32, "#000"), stars(21, 1920, 300, 30)]
    s += [rect(0, 250, 1920, 470, t.far), rect(0, 236, 1920, 18, t.mid),
          windows(t, 60, 280, 1800, 150, 13, 1, 5, lit_p=0.8, pad=14),
          rect(0, 470, 1920, 76, "#2c2c30" if t.dark else "#1d1d1f"),
          mark(370, 508, 50, RED_HI), text(420, 521, "NEW CONCEPT SECURITY", 34, WHITE, 800, letter_spacing="6"),
          rect(340, 560, 900, 160, t.lit if t.dark else t.glass), rect(1300, 560, 130, 160, t.mid)]
    for i, (x, gy, sc) in enumerate(((240, 930, 0.84), (700, 936, 0.88), (1170, 942, 0.92))):
        s.append(van_m(a, t, x, gy, sc))
    a.add(fade(a, "".join(s), 0.1, 0.1, 0, 0.12))
    return a


def mobile_patrols(t):
    a = Art(1600, 1000, "Mobile patrol officer checking a locked gate beside a liveried van")
    s = [ground(t, 862), rect(200, 590, 360, 272, "none", stroke=t.strong, stroke_width=6),
         palisade(206, 554, 600, 860, t.near, w=12, gap=10),
         rect(310, 660, 140, 92, WHITE, stroke=t.edge, stroke_width=2, rx=4), rect(310, 660, 140, 26, RED, rx=4),
         text(380, 679, "WARNING", 13, WHITE, 800, "middle", letter_spacing="2"),
         text(380, 716, "SITE PATROLLED", 11, INK, 800, "middle"),
         van_m(a, t, 780, 862, 0.98)]
    h, x, y = 410, 660, 872
    tx, ty = opoint(x, y, h, TORCH_TIP)
    beam_col = "#fff3c4"
    s += [anim(poly([(tx, ty - 4), (tx, ty + 4), (452, 760), (452, 650)],
                    a.lin([(0, beam_col, 0.55 if t.dark else 0.8), (1, beam_col, 0)], tx, 0, 452, 0, user=True)),
               "softpulse", 2.4),
          floor_shadow(a, t, x, y, 90), person(t, x, y, h, "uniform", "torch", SKINS[0])]
    a.add(fade(a, "".join(s)))
    return a


def retail_guarding(t):
    a = Art(1600, 1000, "Security officer in a suit at the entrance of a retail store")
    rnd = random.Random(9)
    s = [ground(t, 862), rect(230, 300, 440, 420, t.far, rx=8)]
    for y in (400, 500, 600, 700):
        s.append(rect(230, y, 440, 8, t.near))
        xx = 250
        while xx < 640:
            w, hh = rnd.uniform(24, 46), rnd.uniform(30, 64)
            s.append(rect(xx, y - hh, w, hh, rnd.choice([t.near, t.mid, t.strong, RED, t.line]), rx=3))
            xx += w + rnd.uniform(6, 14)
    s += [rect(760, 330, 300, 532, t.glass), rect(760, 330, 300, 532, "none", stroke=t.strong, stroke_width=6),
          line(910, 330, 910, 862, t.strong, 5), dome(910, 318, 1.0)]
    for x in (730, 1090):
        s += [rect(x - 10, 560, 20, 302, t.white, stroke=t.edge, stroke_width=2, rx=10),
              anim(rect(x - 3, 580, 6, 240, RED, rx=3), "pulse", 2.4, delay=x * 0.003)]
    s += [line(240, 600, 650, 600, t.strong, 5), line(260, 600, 260, 862, t.strong, 4), line(630, 600, 630, 862, t.strong, 4)]
    xx = 280
    while xx < 610:
        col = rnd.choice([t.suit, RED, t.near, t.strong, t.mid])
        s.append(rect(xx, 608, 30, rnd.uniform(140, 200), col, rx=7))
        xx += rnd.uniform(26, 34)
    s += [floor_shadow(a, t, 1210, 872, 100), person(t, 1210, 872, 470, "suit", "clasped", SKINS[2], armband=True)]
    a.add(fade(a, "".join(s)))
    return a


def site_security(t):
    a = Art(1600, 1000, "Construction site perimeter fencing with a keep out sign and CCTV")
    s = [ground(t, 862)]
    for i, x in enumerate((300, 520, 740)):
        s.append(path(f"M{x} 700V560L{x + 90} 480L{x + 180} 560V700", stroke=t.line, stroke_width=4,
                      stroke_linejoin="round"))
        s.append(path(f"M{x + 90} 480V700M{x} 560H{x + 180}", stroke=t.line, stroke_width=2))
    s += [heras(a, 120, 1480, 560, 862, panel=340, color=t.near, cell=(16, 32), mesh_op=0.6, sw=4, foot=t.line),
          rect(330, 620, 300, 172, WHITE, stroke=t.edge, stroke_width=2, rx=6), rect(330, 620, 300, 46, RED, rx=6),
          rect(330, 650, 300, 16, RED), text(480, 650, "CONSTRUCTION SITE", 18, WHITE, 800, "middle", letter_spacing="1.5"),
          text(480, 744, "KEEP OUT", 48, INK, 800, "middle", letter_spacing="2"),
          rect(1175, 300, 10, 562, t.strong), cctv(1180, 330, 0.9, 26), cctv(1180, 330, 0.9, 26, flip=True)]
    a.add(fade(a, "".join(s)))
    return a


def door_supervision(t):
    a = Art(1600, 1000, "Door supervisor at the entrance of a corporate building")
    s = [ground(t, 862), rect(0, 150, 1600, 712, t.far),
         path("".join(f"M{x} 150V470" for x in range(80, 1600, 90)) + "".join(f"M0 {y}H1600" for y in (250, 360)),
              stroke=t.mid, stroke_width=3),
         rect(500, 480, 600, 382, t.lit), rect(470, 458, 660, 22, t.strong, rx=6),
         rect(520, 506, 150, 356, t.glass, opacity=0.7), rect(930, 506, 150, 356, t.glass, opacity=0.7),
         rect(520, 506, 150, 356, "none", stroke=t.strong, stroke_width=5),
         rect(930, 506, 150, 356, "none", stroke=t.strong, stroke_width=5),
         revolving(t, 800, 512, 862, 110), dome(800, 476, 0.8),
         walker(380, 872, 330, 380, 9, "#3d4b5c" if not t.dark else "#5a6878", "#1d1d22", SKINS[3], delay=0, bag="#2c2c30"),
         floor_shadow(a, t, 1190, 872, 100), person(t, 1190, 872, 470, "suit", "radio", SKINS[2], armband=True)]
    a.add(fade(a, "".join(s)))
    return a


def event_security(t):
    a = Art(1600, 1000, "Stewards in high-visibility vests on duty at the pitch side of a sports stadium")
    rnd = random.Random(4)
    s = [rect(0, 150, 1600, 24, t.strong)]
    for fx in (220, 1380):
        s += [rect(fx - 4, 60, 8, 92, t.strong), rect(fx - 40, 44, 80, 32, t.strong, rx=4),
              "".join(rect(fx - 34 + c * 17, 50, 13, 20, t.white, rx=2) for c in range(4))]
    for r in range(5):
        y = 210 + r * 78
        s.append(rect(0, y + 18, 1600, 52, t.far if r % 2 else t.mid))
        halves = ["", ""]
        xx, k = 10 + rnd.uniform(0, 12), 0
        while xx < 1590:
            col = rnd.choice([RED_HI, RED_HI, t.white, t.strong, RED_DARK])
            halves[k % 2] += rect(xx - 11, y + 22, 22, 28, col, rx=8) + circle(xx, y + 14, 8, rnd.choice(SKINS))
            k += 1
            xx += rnd.uniform(30, 38)
        for i, hlf in enumerate(halves):
            s.append(anim(hlf, bob(-3), round(0.9 + 0.05 * r, 2), delay=0.45 * i + 0.15 * r))
    s += [ticker(a, 0, 610, 1600, 44, ["NEW CONCEPT SECURITY", "STEWARDS ON DUTY", "MATCHDAY SAFETY", "SIA LICENSED"], 20,
                 RED_GLOW, "#111114", dur=16),
          rect(0, 654, 1600, 208, t.grass), rect(0, 668, 1600, 4, WHITE, opacity=0.9), ground(t, 862)]
    for x, h, sk in ((600, 440, SKINS[1]), (1000, 460, SKINS[2])):
        s += [floor_shadow(a, t, x, 900, 90),
              person(t, x, 900, h, "uniform", "behind", sk, back=True, vest=True, vest_text="STEWARD")]
    a.add(fade(a, "".join(s), 0.11, 0.11, 0, 0.12))
    return a


def healthcare(t):
    a = Art(1600, 1000, "Security officer and a nurse at a hospital emergency entrance")
    s = [ground(t, 862), rect(0, 170, 1600, 692, t.far)]
    for y in (210, 300):
        s.append(windows(t, 0, y, 1600, 70, 18, 1, y, lit_p=0.4, pad=10))
    s += [rect(560, 410, 480, 70, WHITE, stroke=t.edge, stroke_width=2, rx=8),
          path("M582 446H610L620 424L632 468L642 436L650 450H676", stroke=RED_HI, stroke_width=4, opacity=0.18,
               stroke_linejoin="round", stroke_linecap="round"),
          path("M582 446H610L620 424L632 468L642 436L650 450H676", stroke=RED_HI, stroke_width=4, stroke_linejoin="round",
               stroke_linecap="round", stroke_dasharray="190", style=motion(draw(190), 3.2, "linear")),
          text(700, 460, "EMERGENCY", 34, RED, 800, letter_spacing="5"),
          rect(500, 496, 600, 20, t.strong, rx=6), rect(560, 516, 480, 346, t.lit)]
    door_l = keyframes("doorL", "0%,22%{transform:translateX(0)}36%,66%{transform:translateX(-200px)}80%,100%{transform:translateX(0)}")
    door_r = keyframes("doorR", "0%,22%{transform:translateX(0)}36%,66%{transform:translateX(200px)}80%,100%{transform:translateX(0)}")
    panel = lambda x0: rect(x0, 516, 240, 346, t.glass, opacity=0.8) + rect(x0, 516, 240, 346, "none", stroke=t.strong, stroke_width=5)
    s += [group(anim(panel(560), door_l, 9) + anim(panel(800), door_r, 9), clip_path=a.clip(rect(560, 516, 480, 346, "#000"))),
          rect(1300, 560, 8, 302, t.strong), rect(1268, 500, 72, 72, t.strong, rx=8),
          text(1304, 554, "H", 50, WHITE, 800, "middle"),
          floor_shadow(a, t, 430, 872, 90), person(t, 430, 872, 430, "scrubs", "side", SKINS[3], hair="#3a2a1e"),
          floor_shadow(a, t, 1180, 872, 100), person(t, 1180, 872, 460, "uniform", "radio", SKINS[2])]
    a.add(fade(a, "".join(s)))
    return a


def key_holding(t):
    a = Art(1600, 1000, "Key holding officer with a torch responding to an alarm at a business")
    lift = keyframes("shutter", "0%,18%{transform:scaleY(1)}48%,74%{transform:scaleY(.42)}100%{transform:scaleY(1)}")
    s = [ground(t, 862), rect(0, 250, 1600, 612, t.far), rect(0, 290, 1600, 54, t.mid),
         mono(330, 324, "UNIT 2", 16, t.soft),
         rect(380, 400, 520, 462, "#141418" if t.dark else "#cfd3d8"),
         anim(rect(380, 400, 520, 240, t.near) + path("".join(f"M380 {y}H900" for y in range(412, 640, 12)),
                                                       stroke=t.line, stroke_width=2) + rect(380, 632, 520, 10, t.strong),
              lift, 12, origin=(380, 400)),
         rect(372, 388, 536, 14, t.strong, rx=4),
         rect(980, 520, 140, 342, t.mid, stroke=t.edge, stroke_width=3), rect(1096, 680, 8, 40, t.strong, rx=3),
         anim(circle(1050, 440, 90, "none", stroke=RED_GLOW, stroke_width=3), "ring", 1.6, "ease-out"),
         anim(circle(1050, 440, 90, "none", stroke=RED_GLOW, stroke_width=2), "ring", 1.6, "ease-out", 0.8),
         rect(1010, 396, 80, 92, WHITE, stroke=t.edge, stroke_width=2, rx=8), rect(1010, 396, 80, 22, "#6a0a0a", rx=8),
         anim(rect(1010, 396, 80, 22, RED_GLOW, rx=8), "flash", 1.6, "linear"), mark(1050, 452, 34, RED)]
    x, y, h = 780, 872, 420
    tx, ty = opoint(x, y, h, TORCH_TIP, flip=True)
    s += [anim(poly([(tx, ty - 4), (tx, ty + 4), (1120, 760), (1120, 640)],
                    a.lin([(0, "#fff3c4", 0.55 if t.dark else 0.85), (1, "#fff3c4", 0)], tx, 0, 1120, 0, user=True)),
               "softpulse", 2.2),
          floor_shadow(a, t, x, y, 90), person(t, x, y, h, "uniform", "torch", SKINS[1], flip=True)]
    a.add(fade(a, "".join(s)))
    return a


def lock_unlock(t):
    a = Art(1600, 1000, "A key in a door lock on a red New Concept Security tag")
    rays = "".join(line(330 + 44 * math.cos(math.radians(k)), 300 + 44 * math.sin(math.radians(k)),
                        330 + 60 * math.cos(math.radians(k)), 300 + 60 * math.sin(math.radians(k)),
                        t.soft, 4, stroke_linecap="round") for k in range(0, 360, 45))
    s = [anim(rays, "spin", 30, "linear"), circle(330, 300, 30, "none", stroke=t.soft, stroke_width=4),
         path("M1262 262A40 40 0 1 0 1300 336A32 32 0 1 1 1262 262Z", "none", stroke=t.soft, stroke_width=4,
              stroke_linejoin="round"),
         mono(330, 400, "07:00", 20, t.soft, 700, "middle"), mono(1270, 400, "18:00", 20, t.soft, 700, "middle"),
         lock_plate(a, 800, 560, 1.0)]
    a.add("".join(s))
    return a


def cctv_control(t):
    a = Art(1600, 1000, "Control room operator watching a wall of CCTV monitors")
    slot = keyframes("slot6", "0%,15%{opacity:1}16.7%,100%{opacity:0}")
    s = []
    for i in range(6):
        col, row = i % 3, i // 3
        x, y = 430 + col * 250, 150 + row * 166
        s += [rect(x, y, 236, 150, t.strong, rx=8), rect(x + 8, y + 8, 220, 134, t.glass, rx=4),
              rect(x + 20, y + 96, 196, 34, t.line if not t.dark else "#334050", rx=3),
              rect(x + 30 + (i * 37) % 120, y + 52, 46, 44, t.near if not t.dark else "#3e4c5c", rx=3),
              circle(x + 216, y + 20, 4, RED_GLOW, style=motion("blink", 1.4, "linear", i * 0.2)),
              anim(rect(x + 2, y + 2, 232, 146, "none", rx=8, stroke=RED_GLOW, stroke_width=4), slot, 9, "linear", i * 1.5)]
    s += [rect(240, 760, 1120, 18, t.near, rx=9),
          person(t, 800, 1160, 610, "uniform", "behind", SKINS[0], back=True),
          path("M765 583Q800 512 835 583", stroke=t.strong, stroke_width=7, stroke_linecap="round"),
          circle(765, 586, 11, t.strong), circle(835, 586, 11, t.strong)]
    a.add(fade(a, "".join(s), 0.12, 0.12, 0, 0.2))
    return a


def standalone_cameras(t):
    a = Art(1600, 1000, "Solar-powered stand-alone camera tower guarding a site")
    s = [palisade(160, 1440, 700, 862, t.mid, w=8, gap=8), ground(t, 862),
         coverage(a, 800, 862, 520, rings=2, color=RED_GLOW if t.dark else RED),
         tower(a, 800, 862, 1.0)]
    a.add(fade(a, "".join(s)))
    return a


def fire_services(t):
    a = Art(1600, 1000, "Fire marshal on a waking watch patrol scanning an NFC checkpoint")
    s = [rect(680, 330, 240, 240, t.mid),
         path("M680 330L240 0M920 330L1360 0M680 570L240 1000M920 570L1360 1000", stroke=t.line, stroke_width=3),
         poly([(330, 640), (420, 586), (420, 300), (330, 254)], t.far), poly([(1270, 640), (1180, 586), (1180, 300), (1270, 254)], t.far),
         rect(744, 404, 112, 26, WHITE, stroke=t.edge, stroke_width=2, rx=3), text(800, 422, "FIRE EXIT", 13, INK, 800, "middle"),
         rect(716, 450, 168, 120, t.near)]
    for d in (0.25, 0.55, 0.8):
        w = 900 * (1 - d) + 240 * d
        yy = 330 * d
        s.append(anim(rect(800 - w * 0.08, yy + 20 * (1 - d), w * 0.16, 10, t.white if t.dark else "#ffffff",
                           stroke=t.edge, stroke_width=1.5, rx=4), "softpulse", 4, delay=d * 3))
    s += [rect(470, 700, 38, 140, RED_HI, rx=16), rect(478, 682, 22, 22, INK, rx=3),
          rect(1236, 470, 44, 44, WHITE, rx=6, stroke=RED, stroke_width=3),
          path("M1250 482Q1256 492 1250 502M1256 478Q1265 492 1256 506", stroke=RED, stroke_width=2.6, stroke_linecap="round"),
          person(t, 980, 1000, 560, "uniform", "phone", SKINS[1], back=True, vest=True, vest_text="FIRE MARSHAL")]
    px, py = opoint(980, 1000, 560, PHONE_AT)
    for k, r in enumerate((16, 28, 40)):
        s.append(anim(path(f"M{n(px + 14 + r * 0.6)} {n(py - r * 0.8)}A{r} {r} 0 0 1 {n(px + 14 + r * 0.6)} {n(py + r * 0.8)}",
                           stroke=RED_GLOW, stroke_width=3, stroke_linecap="round"), "pulse", 1.5, delay=1.5 - k * 0.25))
    a.add(fade(a, "".join(s), 0.12, 0.12, 0, 0.16))
    return a


def hero_skyline(t):
    a = Art(1920, 1080, "City towers with the New Concept Security mark")
    rnd = random.Random(2)
    s, xx = [], 160
    while xx < 1760:
        w, h = rnd.uniform(90, 180), rnd.uniform(260, 620)
        s.append(rect(xx, 900 - h, w, h, t.far if rnd.random() < 0.5 else t.mid))
        xx += w + rnd.uniform(6, 20)
    s += [ground(t, 900, 0, 1920), anim(circle(960, 380, 210, "none", stroke=RED, stroke_width=2, stroke_dasharray="4 12"),
                                        "spin", 40, "linear"), mark(960, 380, 260, RED)]
    a.add(fade(a, "".join(s), 0.1, 0.1, 0, 0.12))
    return a
