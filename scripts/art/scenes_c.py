"""Scene illustrations, part three: a corporate door supervision post and a sports stadium."""
import math
import random

from lib import *  # noqa: F401,F403

CIVVIES = [("#3d4b5c", "#1d1d22"), ("#6e6258", "#24242a"), ("#2f3a4a", "#3a3a40"), ("#8a8f97", "#1f1f24"),
           ("#5a2a2a", "#1d1d22"), ("#d2d2d7", "#2c2c32")]


def _revolving(cx, top, bot, r, glass):
    """A revolving door whose four wings turn continuously."""
    steps = []
    for k in range(25):
        t = k / 24
        c = math.cos(2 * math.pi * t)
        front = math.sin(2 * math.pi * t) > 0
        steps.append(f"{n(t * 100)}%{{transform:scaleX({c if abs(c) > 0.02 else 0.02:.3f});"
                     f"opacity:{0.75 if front else 0.35}}}")
    wing = keyframes("wing", "".join(steps))
    panel = (rect(cx, top + 8, r, bot - top - 12, "#7f97ad", opacity=0.55)
             + rect(cx + 8, top + 20, r - 16, 10, "#ffffff", opacity=0.35)
             + line(cx + r - 3, top + 8, cx + r - 3, bot - 4, "#3d4650", 6)
             + line(cx, top + 8, cx, bot - 4, "#3d4650", 6) + rect(cx + 10, top + 120, r - 20, 6, "#3d4650"))
    wings = "".join(anim(panel, wing, 8, "linear", 2 * k, origin=(cx, top)) for k in range(4))
    drum = (rect(cx - r - 10, top - 18, 2 * r + 20, 22, "#2c2c30", rx=6)
            + rect(cx - r, top, 2 * r, bot - top, "#f2e9da", opacity=0.55)
            + wings
            + line(cx - r, top, cx - r, bot, "#5d636b", 7) + line(cx + r, top, cx + r, bot, "#5d636b", 7)
            + rect(cx - r - 6, bot - 6, 2 * r + 12, 8, "#4a4a50"))
    return drum


def door_supervision():
    a = Art(1600, 1000, "Door supervisor at the entrance of a corporate building, with visitors coming and going")
    a.add(rect(0, 0, 1600, 200, a.lin([(0, "#a9b6c6"), (1, "#d6dde6")])),
          clouds(a, 1600, 30, 120, 12, "#ffffff", 0.8, count=4, dur=110, scale=0.7),
          birds(-120, 70, 5, 4, dist=1900, dur=26, color="#56606c", s=0.8))
    fac = [0, 110, 1600, 670]
    a.add(rect(*fac, a.lin([(0, "#5b6f86"), (0.5, "#7d90a6"), (1, "#4e6075")], 0, 0, 1, 1)))
    cp = a.clip(rect(*fac, "#000"))
    a.add(group(clouds(a, 1600, 160, 520, 21, "#ffffff", 0.22, count=5, dur=60, scale=1.4),
                anim(poly([(300, 110), (420, 110), (720, 780), (600, 780)], "#ffffff", opacity=0.12)
                     + poly([(980, 110), (1020, 110), (1320, 780), (1280, 780)], "#ffffff", opacity=0.1),
                     keyframes("glass", "0%,100%{transform:translateX(0)}50%{transform:translateX(220px)}"), 12),
                clip_path=cp))
    a.add(path("".join(f"M{x} 110V780" for x in range(0, 1601, 80)), stroke="#3b4757", stroke_width=4),
          path("".join(f"M0 {y}H1600" for y in range(150, 780, 64)), stroke="#3b4757", stroke_width=3),
          rect(0, 102, 1600, 14, "#2c333d"))
    rnd = random.Random(31)
    for _ in range(26):
        cx, cy = rnd.randrange(0, 20) * 80, 150 + rnd.randrange(0, 5) * 64
        a.add(rect(cx + 6, cy + 6, 68, 52, "#f5ecd8", opacity=0.28,
                   style=motion("twinkle", round(rnd.uniform(6, 12), 1), delay=rnd.uniform(0, 12))
                   if rnd.random() < 0.4 else None))
    # Entrance block: stone surround, canopy, lit lobby behind glass.
    a.add(rect(400, 430, 800, 350, "#d9d6d0"), rect(420, 500, 760, 280, a.lin([(0, "#f6efe2"), (1, "#d8cbb4")])),
          rect(470, 640, 180, 60, "#b9ab94"), rect(470, 630, 180, 12, "#9f927c"),
          ellipse(1080, 610, 26, 40, "#7a8a6a", opacity=0.5), rect(1072, 640, 16, 60, "#9f927c"),
          text(800, 474, "RECEPTION", 30, "#2c2c30", 700, "middle", letter_spacing="10"),
          rect(380, 488, 840, 18, "#2c2c30"))
    for x in range(440, 1180, 80):
        a.add(anim(a.glow(x, 508, 44, "#fff6e6", 0.6), "softpulse", 4, delay=x * 0.01))
    glass = a.lin([(0, "#e6eef4", 0.5), (1, "#c3d0db", 0.3)], 0, 0, 1, 1)
    for x0 in (520, 960):
        a.add(rect(x0, 520, 120, 258, glass), rect(x0, 520, 120, 258, "none", stroke="#5d636b", stroke_width=6),
              rect(x0 + (100 if x0 < 800 else 10), 620, 10, 70, "#9aa1a9", rx=4))
    a.add(_revolving(800, 520, 778, 118, glass))
    a.add(dome(800, 512, 0.9), rect(880, 610, 22, 60, "#3a3a40", rx=4),
          rect(884, 620, 14, 18, "#1d1d22", rx=2), circle(891, 650, 3.5, RED_GLOW, style=motion("blink", 1.2, "linear")))
    # Plaza, bollards and flags.
    a.add(rect(0, 780, 1600, 220, a.lin([(0, "#c9c6c0"), (1, "#a9a6a0")])),
          path("".join(f"M{800 + (xb - 800) * 0.25} 780L{xb} 1000" for xb in range(-1600, 3201, 200))
               + "M0 820H1600M0 880H1600M0 960H1600", stroke="#b8b5af", stroke_width=2))
    for x in (300, 420, 1180, 1300):
        a.add(ellipse(x, 862, 18, 6, "#000", opacity=0.2), rect(x - 9, 790, 18, 72, "#d9d9dd", rx=8),
              rect(x - 9, 806, 18, 8, RED_HI))
    a.add(flag(120, 220, 520, 170, RED_HI, delay=0), flag(1470, 230, 510, 150, "#f2f2f4", emblem_color=RED, delay=0.9))
    a.add(walker(160, 930, 330, 560, 14, *CIVVIES[0], skin=SKINS[3], delay=0, bag="#2c2c30"),
          walker(1040, 915, 310, 600, 17, *CIVVIES[1], skin=SKINS[0], flip=True, delay=6),
          walker(-80, 980, 380, 1700, 21, *CIVVIES[3], skin=SKINS[2], delay=11, step=0.9))
    a.add(shadow(a, 1150, 905, 100, a=0.3),
          officer(1150, 905, 450, "suit", "radio", SKINS[2], armband=True))
    a.add(walker(1700, 995, 400, 1900, 19, *CIVVIES[4], skin=SKINS[1], flip=True, delay=3, step=0.95))
    a.add(vignette(a, 0.18))
    return a


def _stand(a, x0, x1, y0, y1, rows, seed):
    """Rows of supporters in team colours that bounce, wave scarves and flash cameras."""
    rnd = random.Random(seed)
    shirts = [RED_HI, RED_HI, "#f2f2f4", "#2c2c34", RED_DARK, "#f2f2f4", "#3a3a44"]
    out = []
    for r in range(rows):
        t = r / max(1, rows - 1)
        y = y0 + (y1 - y0) * t
        s = 0.55 + 0.45 * t
        out.append(rect(x0, y - 6 * s, x1 - x0, 48 * s, "#3a3a42" if r % 2 else "#34343c"))
        halves, scarves = (["", ""]), ""
        xx, k = x0 + rnd.uniform(0, 20), 0
        while xx < x1:
            col = rnd.choice(shirts)
            person = (rect(xx - 13 * s, y - 2 * s, 26 * s, 34 * s, col, rx=9 * s)
                      + circle(xx, y - 12 * s, 9 * s, rnd.choice(SKINS)))
            if rnd.random() < 0.18:
                side = rnd.choice((-1, 1))
                person += path(f"M{n(xx + 9 * s * side)} {n(y)}L{n(xx + 14 * s * side)} {n(y - 30 * s)}",
                               stroke=col, stroke_width=6 * s, stroke_linecap="round")
            if rnd.random() < 0.08:
                bar = (rect(xx - 26 * s, y - 44 * s, 52 * s, 10 * s, RED_HI, rx=2)
                       + "".join(rect(xx - 26 * s + i * 13 * s, y - 44 * s, 6.5 * s, 10 * s, "#f5f5f7")
                                 for i in range(4)))
                scarves += anim(bar, sway(8), round(rnd.uniform(0.8, 1.2), 2), delay=rnd.uniform(0, 1),
                                origin=(xx, y - 30 * s))
            halves[k % 2] += person
            if rnd.random() < 0.05:
                out.append(circle(xx + rnd.uniform(-8, 8), y - 18 * s, 2.6, "#ffffff",
                                  style=motion("flash", round(rnd.uniform(2.5, 6), 1), "linear", rnd.uniform(0, 6))))
            k += 1
            xx += 37 * s * rnd.uniform(0.95, 1.15)
        for i, half in enumerate(halves):
            out.append(anim(half, bob(-3.5 * s), round(0.85 + 0.05 * (r % 3), 2), delay=0.45 * i + 0.13 * r))
        out.append(scarves)
    return "".join(out)


def sports_event():
    a = Art(1600, 1000, "Stewards in high-visibility vests on duty at the pitch side of a packed sports stadium")
    a.add(rect(0, 0, 1600, 260, a.lin([(0, "#0b0d18"), (1, "#22243a")])), stars(91, 1600, 120, 25))
    for fx in (110, 1490):
        a.add(rect(fx - 6, 20, 12, 230, "#15161f"),
              rect(fx - 60, 10, 120, 64, "#1b1c26", rx=4),
              "".join(rect(fx - 54 + c * 22, 16 + r * 18, 18, 14, "#f8f6ee", rx=2) for c in range(5) for r in range(3)),
              anim(a.glow(fx, 44, 230, "#fffbea", 0.55), "softpulse", 3.5, delay=fx * 0.01))
        a.add(anim(poly([(fx - 50, 70), (fx + 50, 70), (fx + 520 * (1 if fx < 800 else -1), 980),
                         (fx + 140 * (1 if fx < 800 else -1), 980)], a.lin([(0, "#fffbea", 0.16), (1, "#fffbea", 0)])),
                   "softpulse", 5, delay=fx * 0.003))
    # Roof, truss and the big screen.
    a.add(rect(0, 150, 1600, 54, "#14151d"),
          path("".join(f"M{x} 150L{x + 40} 204L{x + 80} 150" for x in range(0, 1600, 80)), stroke="#262836", stroke_width=3),
          "".join(anim(a.glow(x, 206, 40, "#ffffff", 0.7) + rect(x - 10, 200, 20, 8, "#ffffff", rx=2),
                       "softpulse", 2.2 + (x % 3) * 0.4, delay=x * 0.01) for x in range(60, 1600, 120)))
    a.add(rect(600, 20, 400, 176, "#08080a", rx=6), rect(600, 20, 400, 176, "none", rx=6, stroke="#2c2c34", stroke_width=4),
          rect(612, 32, 376, 112, "#101018"),
          mark(680, 88, 74, RED_HI),
          text(730, 82, "MATCHDAY", 34, WHITE, 800, letter_spacing="3"),
          text(730, 112, "STEWARDS ON DUTY", 16, RED_GLOW, 700, letter_spacing="3"),
          anim(a.glow(800, 88, 260, RED, 0.25), "pulse", 2),
          ticker(a, 612, 148, 376, 36, ["FOLLOW STEWARD ADVICE", "ENJOY THE GAME"], 12, dur=8))
    # Two tiers of supporters with a lit concourse between.
    a.add(rect(0, 204, 1600, 480, "#2a2a32"))
    a.add(_stand(a, -20, 1620, 240, 396, 4, 3))
    a.add(rect(0, 418, 1600, 26, "#18181e"),
          "".join(anim(rect(x, 424, 60, 14, "#f6efe0", opacity=0.55), "softpulse", 3 + x % 3, delay=x * 0.01)
                  for x in range(20, 1600, 110)))
    a.add(_stand(a, -20, 1620, 474, 656, 4, 8))
    for x in (260, 800, 1340):
        a.add(rect(x - 14, 236, 28, 450, "#4a4a54", opacity=0.85))
    a.add(flag(380, 300, 150, 110, RED_HI, delay=0.3), flag(1120, 520, 140, 100, "#f2f2f4", emblem=False, delay=1.1))
    # Pitch-side LED boards, the touchline and the stewards.
    a.add(ticker(a, 0, 684, 1600, 64, ["NEW CONCEPT SECURITY", "MATCHDAY SAFETY", "STEWARDS ON DUTY", "SIA LICENSED"],
                 28, RED_GLOW, dur=16))
    a.add(rect(0, 748, 1600, 252, "#2d5636"),
          "".join(rect(0, y, 1600, h, "#336140") for y, h in ((770, 34), (840, 48), (930, 70))),
          rect(0, 760, 1600, 5, "#e9efe9", opacity=0.85),
          rect(0, 748, 1600, 252, a.lin([(0, "#000", 0.35), (1, "#000", 0)])))
    for x, y, h, sk, pose in ((330, 1000, 470, SKINS[1], "behind"), (820, 990, 500, SKINS[2], "behind"),
                              (1300, 1004, 460, SKINS[3], "behind")):
        a.add(shadow(a, x, y - 4, 90, a=0.35),
              officer(x, y, h, "uniform", pose, sk, back=True, vest=True, vest_text="STEWARD", rim="#fffbea",
                      rim_dx=[-3, 3], rim_op=0.35))
    a.add(vignette(a, 0.4))
    return a
