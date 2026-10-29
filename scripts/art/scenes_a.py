"""Scene illustrations, part one: hero, close protection, sites, fleet, reception, gatehouse, patrols, retail."""
import random

from lib import *  # noqa: F401,F403


def hero_skyline():
    a = Art(1920, 1080, "Glass towers at night, looking up, with the New Concept Security mark")
    a.add(rect(0, 0, 1920, 1080, a.lin([(0, "#040406"), (0.55, "#101016"), (1, "#1c1c24")])))
    a.add(a.glow(960, 200, 760, RED, 0.3), a.glow(960, 1120, 900, "#30303c", 0.5))
    a.add(stars(11, 1920, 520, 50))
    a.add(anim(beam(a, 560, 1080, 880, -60, 2.2, "#ffffff", 0.09), sway(5), 11, origin=(560, 1080)),
          anim(beam(a, 1420, 1080, 1060, -60, 2.0, "#ffffff", 0.07), sway(4), 13, delay=4, origin=(1420, 1080)))

    vx, vy, yb = 960, -900, 1200

    def X(xb, y):
        return vx + (xb - vx) * (y - vy) / (yb - vy)

    def face(xb0, xb1, ytop, fill, step, floor0, seed, lit=0.045, refl=()):
        corners = [(X(xb0, yb), yb), (X(xb1, yb), yb), (X(xb1, ytop), ytop), (X(xb0, ytop), ytop)]
        out = [poly(corners, fill)]
        ys, y, gap = [], yb, floor0
        while y > ytop + 4:
            ys.append(y)
            y -= gap
            gap = max(gap * 0.94, 14)
        ys.append(ytop)
        cols = max(1, int(abs(xb1 - xb0) / step))
        xs = [xb0 + (xb1 - xb0) * j / cols for j in range(cols + 1)]
        rnd = random.Random(seed)
        for i in range(len(ys) - 1):
            for j in range(cols):
                if rnd.random() < lit:
                    y0, y1 = ys[i], ys[i + 1]
                    tw = motion("twinkle", round(rnd.uniform(4, 9), 1), delay=rnd.uniform(0, 9)) if rnd.random() < 0.3 else None
                    out.append(poly([(X(xs[j], y0), y0), (X(xs[j + 1], y0), y0), (X(xs[j + 1], y1), y1),
                                     (X(xs[j], y1), y1)], "#c9ccd6", opacity=round(rnd.uniform(0.05, 0.2), 2), style=tw))
        if refl:
            cp = a.clip(poly(corners, "#000"))
            out.append(group(anim("".join(refl), "softpulse", 7, delay=seed), clip_path=cp))
        out.append(path("".join(f"M{n(X(xb0, yy))} {n(yy)}L{n(X(xb1, yy))} {n(yy)}" for yy in ys),
                        stroke="#50525e", stroke_width=1.3, opacity=0.8))
        out.append(path("".join(f"M{n(X(xx, yb))} {yb}L{n(X(xx, ytop))} {n(ytop)}" for xx in xs),
                        stroke="#454752", stroke_width=1.6, opacity=0.9))
        out.append(line(X(xb0, ytop), ytop, X(xb1, ytop), ytop, "#6a6c78", 3))
        return "".join(out)

    a.add(face(700, 1220, 430, a.lin([(0, "#181920"), (1, "#262833")], 0, 0, 1, 0), 52, 60, 3))
    a.add(face(330, 640, 150, a.lin([(0, "#15161c"), (1, "#22242d")], 0, 0, 1, 0), 46, 64, 4))
    a.add(face(1300, 1500, 120, "#121318", 40, 64, 5))
    red_l = a.lin([(0, RED_HI, 0.0), (0.5, RED_HI, 0.42), (1, RED_HI, 0.0)], 0, 0, 1, 0)
    a.add(face(-520, 300, 40, a.lin([(0, "#191a20"), (1, "#30323b")], 0, 0, 1, 0), 70, 72, 6,
               refl=[poly([(-40, 1200), (170, 1200), (690, 0), (560, 0)], red_l),
                     poly([(220, 1200), (250, 1200), (740, 0), (720, 0)], "#ffffff", opacity=0.08)]))
    a.add(face(300, 430, 40, "#0f1015", 44, 72, 7, lit=0.03))
    a.add(face(1620, 2500, 0, a.lin([(0, "#2c2e37"), (1, "#1a1b21")], 0, 0, 1, 0), 70, 72, 8,
               refl=[poly([(1560, 1200), (1740, 1200), (1400, 0), (1300, 0)], "#ffffff", opacity=0.07),
                     poly([(1800, 1200), (1900, 1200), (1500, 0), (1450, 0)], RED_HI, opacity=0.22)]))
    a.add(face(1490, 1620, 0, "#0f1015", 44, 72, 9, lit=0.03))

    a.add(anim(a.glow(960, 230, 380, RED, 0.42), "glowpulse", 6))
    a.add(anim(circle(960, 230, 214, "none", stroke=RED_GLOW, stroke_width=1.6, stroke_dasharray="3 9", opacity=0.55),
               "spin", 40, "linear"))
    a.add(anim(circle(960, 230, 248, "none", stroke="#ffffff", stroke_width=1, stroke_dasharray="40 18", opacity=0.18),
               "spin", 70, "linear", direction="reverse"))
    a.add(path("M960 -26V-6M960 466V486M704 230H724M1196 230H1216", stroke="#ffffff", stroke_width=2, opacity=0.35))
    a.add(mark(960, 232, 290, RED_HI, opacity=0.92))
    a.add(brackets(60, 60, 1800, 960, L=54, op=0.22))
    a.add(vignette(a, 0.6))
    return a


def close_protection():
    a = Art(1600, 1000, "Close protection officer in an overcoat beside an executive car at night")
    a.add(rect(0, 0, 1600, 760, a.lin([(0, "#0b0b0f"), (1, "#26262d")])))
    a.add(skyline(5, -20, 640, 760, 120, 330, "#16161b", lit="#e6e2d8", lit_p=0.1))
    a.add(lamp(a, 140, 360, 760))
    fx = 540
    a.add(rect(fx, -10, 1100, 770, a.lin([(0, "#1a1c22"), (1, "#2d2f37")], 0, 0, 1, 0)))
    rnd = random.Random(14)
    panes = ""
    for col in range(21):
        for row in range(19):
            if rnd.random() < 0.08:
                tw = motion("twinkle", round(rnd.uniform(5, 10), 1), delay=rnd.uniform(0, 10)) if rnd.random() < 0.35 else None
                panes += rect(fx + col * 52 + 3, row * 40 + 3, 46, 34, "#dcdee4",
                              opacity=round(rnd.uniform(0.1, 0.35), 2), style=tw)
    a.add(panes)
    cp = a.clip(rect(fx, -10, 1100, 770, "#000"))
    glide = keyframes("glide260", "0%,100%{transform:translateX(0)}50%{transform:translateX(260px)}")
    a.add(group(anim(poly([(880, -10), (1060, -10), (1560, 770), (1380, 770)], RED_HI, opacity=0.2)
                     + poly([(1090, -10), (1108, -10), (1608, 770), (1590, 770)], RED_GLOW, opacity=0.28),
                     glide, 14),
                clip_path=cp))
    a.add(path("".join(f"M{fx + k * 52} -10V760" for k in range(22)), stroke="#3c3e48", stroke_width=2))
    a.add(path("".join(f"M{fx} {k * 40}H1600" for k in range(20)), stroke="#383a44", stroke_width=1.5))
    a.add(rect(1180, 646, 380, 114, a.lin([(0, "#e9e6de", 0.35), (1, "#b9b4aa", 0.2)])))
    a.add(rect(1160, 630, 420, 16, "#0c0c0e"), a.glow(1370, 650, 280, "#f1ede4", 0.22))
    a.add(rect(0, 760, 1600, 240, a.lin([(0, "#1b1b20"), (1, "#08080a")])))
    a.add(path("M0 792H1600M0 834H1600M0 892H1600M0 966H1600", stroke="#2a2a30", stroke_width=1.5, opacity=0.6))
    streak = rect(0, 940, 520, 5, a.lin([(0, "#ffffff", 0), (0.7, "#f6efe2", 0.5), (1, "#ffffff", 0)], 0, 0, 1, 0), rx=2)
    a.add(f'<g transform="translate(-600 0)">{anim(streak, drift(2200), 7, "linear", 2.5)}</g>')
    a.add(anim(poly([(1273, 718), (1273, 734), (1640, 790), (1640, 640)],
                    a.lin([(0, "#fff", 0.32), (1, "#fff", 0)], 1273, 0, 1640, 0, user=True)), "softpulse", 4))
    a.add(anim(a.glow(1276, 726, 60, "#ffffff", 0.7), "softpulse", 4))
    a.add(walker(1560, 800, 250, 1500, 16, "#22252b", "#121214", SKINS[3], flip=True, delay=2, step=1.05, bag="#3a2a20"),
          walker(-60, 812, 240, 1700, 19, "#3a3f48", "#18181b", SKINS[0], delay=9, step=1.0))
    c = car(a, 650, 862, 1.0, rim=RED_GLOW)
    a.add(reflect(a, c, 862, 170, 0.22), shadow(a, 970, 862, 360, 26, 0.6), c)
    a.add(anim(a.glow(660, 739, 34, RED_GLOW, 0.55), "pulse", 3))
    o = officer(600, 905, 450, "overcoat", "clasped", SKINS[2], rim=RED_GLOW)
    a.add(shadow(a, 600, 905, 100), reflect(a, o, 905, 150, 0.18), o)
    a.add(brackets(470, 420, 270, 520, L=26, op=0.38), hud(470, 404, "CP-01  ON POST", 14))
    a.add(rain(a, 1600, 1000, 0.22, 0.5))
    a.add(vignette(a, 0.5))
    return a


def site_officer():
    a = Art(1600, 1000, "Security officer in a high-visibility vest on a construction site")
    a.add(rect(0, 0, 1600, 700, a.lin([(0, "#b9bdc5"), (0.6, "#dfe2e7"), (1, "#eef0f3")])))
    a.add(a.glow(1250, 120, 420, "#ffffff", 0.55))
    a.add(clouds(a, 1600, 70, 280, 3, "#ffffff", 0.75, count=5, dur=140))
    a.add(clouds(a, 1600, 230, 400, 9, "#f4f5f7", 0.55, count=6, dur=95, scale=0.6))
    a.add(birds(-100, 240, 6, 5, dist=1800, dur=20, color="#5d6068"),
          birds(-100, 140, 4, 8, dist=1800, dur=28, color="#6e7178", s=0.7))
    a.add(skyline(8, -20, 1620, 700, 60, 170, "#b6b9c0", wmin=60, wmax=150))
    a.add(crane(330, 700, 520, 220, 900, "#4f5158", sw=3.2))
    bx0, bx1 = 860, 1460
    o = [rect(bx0, 615, bx1 - bx0, 85, "#a3a5ab"), rect(bx0, 530, 300, 85, "#a9abb1")]
    for x in range(bx0 + 20, bx1, 50):
        o.append(rect(x, 636, 30, 44, "#3a3d44"))
    for x in range(bx0 + 20, bx0 + 300, 50):
        o.append(rect(x, 552, 30, 42, "#3a3d44"))
    o.append(path(f"M960 360L1060 445M1060 360L960 445M1260 445L1360 530M1360 445L1260 530",
                  stroke="#5a5c63", stroke_width=5))
    for y in (360, 445, 530, 615):
        o.append(rect(bx0 - 6, y, bx1 - bx0 + 12, 12, "#6e7077"))
    for x in range(bx0, bx1 + 1, 100):
        o.append(rect(x - 6, 360, 12, 340, "#5a5c63"))
    a.add(*o)
    a.add(rect(130, 505, 250, 95, "#dedee2"), rect(110, 600, 290, 100, "#e6e6e9"),
          rect(110, 600, 290, 14, RED), rect(150, 522, 120, 30, RED),
          text(210, 543, "SECURITY", 16, WHITE, 800, "middle", letter_spacing="2"),
          rect(290, 524, 70, 50, "#3a3d44"), rect(140, 630, 80, 46, "#3a3d44"), rect(250, 630, 60, 70, "#55585f"),
          mark(360, 652, 34, RED))
    a.add(flag(395, 440, 70, 60, RED_HI, delay=0.4))
    a.add(rect(0, 700, 1600, 300, a.lin([(0, "#a2a3a8"), (1, "#6c6d73")])))
    rnd = random.Random(2)
    a.add("".join(circle(rnd.uniform(0, 1600), rnd.uniform(780, 1000), rnd.uniform(1, 2.6), "#5d5e64",
                         opacity=0.5) for _ in range(160)))
    a.add(walker(1650, 735, 170, 1300, 15, "#2a2a30", "#1d1d22", SKINS[4], flip=True, delay=1, vest=True, step=1.1),
          walker(-40, 742, 160, 900, 12, "#2a2a30", "#1d1d22", SKINS[2], delay=6, vest=True, step=1.1))
    a.add(heras(a, -40, 1640, 600, 770, panel=340, color="#7a7c83", cell=(9, 18), mesh_op=0.5, sw=3.5))
    a.add(rect(1000, 640, 320, 78, RED, rx=3), mark(1042, 679, 54, WHITE),
          text(1082, 674, "SITE PATROLLED", 24, WHITE, 800),
          text(1082, 700, "NEW CONCEPT SECURITY", 13, WHITE, 600, letter_spacing="2"),
          circle(1008, 648, 3, "#2a2a2e"), circle(1312, 648, 3, "#2a2a2e"),
          circle(1008, 710, 3, "#2a2a2e"), circle(1312, 710, 3, "#2a2a2e"))
    a.add(officer(455, 772, 190, "uniform", "side", SKINS[3], vest=True, hat=True))
    beacon = (rect(219, 494, 22, 12, "#3a3a40", rx=3) + ellipse(230, 492, 10, 9, "#7a0c0c")
              + anim(ellipse(230, 492, 10, 9, RED_GLOW) + a.glow(230, 492, 60, RED_GLOW, 0.6), "flash", 1.4, "linear"))
    a.add(beacon)
    a.add(shadow(a, 1320, 890, 50), cone(1320, 890, 0.9), shadow(a, 1200, 915, 60), cone(1200, 915, 1.1))
    a.add(shadow(a, 660, 930, 120, a=0.3),
          officer(660, 930, 520, "uniform", "radio", SKINS[1], vest=True, hat=True))
    a.add(vignette(a, 0.18))
    return a


def fleet_night():
    a = Art(1920, 1080, "New Concept Security vans parked outside Concept House at night")
    a.add(rect(0, 0, 1920, 640, a.lin([(0, "#040406"), (1, "#14141b")])), stars(21, 1920, 420, 70))
    a.add(clouds(a, 1920, 90, 330, 5, "#262631", 0.55, count=5, dur=160, scale=1.3))
    lx, ly, cx, cy, r = 420, 506, 640, 210, 120
    searchlight = (poly([(lx - 5, ly + 4), (lx + 5, ly - 4), (cx + 0.808 * r, cy + 0.589 * r),
                         (cx - 0.808 * r, cy - 0.589 * r)],
                        a.lin([(0, "#ffffff", 0.34), (1, "#ffffff", 0.1)], lx, ly, cx, cy, user=True))
                   + a.glow(cx, cy, 280, "#ffffff", 0.16)
                   + circle(cx, cy, r, a.rad([(0, "#ffffff", 0.62), (0.8, "#ffffff", 0.3), (1, "#ffffff", 0.12)]))
                   + mark(cx, cy + 2, 172, "#1b1b20", opacity=0.88))
    a.add(anim(searchlight, sway(6), 12, origin=(lx, ly)))
    a.add(rect(0, 520, 600, 300, "#141418"), rect(0, 510, 600, 12, "#1d1d22"), rect(398, 494, 44, 16, "#2a2a30"))
    for i, op in enumerate((0.22, 0.0, 0.3, 0.0, 0.18)):
        a.add(rect(40 + i * 110, 570, 60, 74, "#e9e3d6" if op else "#1d1d22", opacity=op or 1))
    brick = a.pattern(30, 14, '<path d="M0 0H30M0 7H30M15 0V7M0 7V14" stroke="#26262c" stroke-width="1" fill="none"/>')
    a.add(rect(560, 380, 1360, 440, "#1d1d22"), rect(560, 380, 1360, 440, brick, opacity=0.8),
          rect(560, 366, 1360, 18, "#2a2a30"))
    levels = [0.9, 0.75, 0.0, 0.85, 0.6, 0.9, 0.0, 0.7]
    for i, op in enumerate(levels):
        x = 610 + i * 160
        if op:
            a.add(a.glow(x + 55, 478, 120, "#f1ebde", 0.12))
        pane = rect(x + 5, 430, 100, 95, "#f1ebde" if op else "#26262c", opacity=op or 1)
        if op and i in (1, 4):
            pane = anim(pane, "softpulse", 6 + i, delay=i)
        a.add(rect(x, 425, 110, 105, "#cfcfd4"), pane,
              line(x + 55, 430, x + 55, 525, "#bdbdc2", 3), line(x + 5, 470, x + 105, 470, "#bdbdc2", 3))
    a.add(rect(560, 575, 1360, 74, INK), rect(560, 645, 1360, 6, RED), mark(706, 612, 56, RED_HI),
          text(762, 626, "NEW CONCEPT SECURITY", 34, WHITE, 800, letter_spacing="5"),
          mono(1880, 621, "CONCEPT HOUSE", 14, FAINT, anchor="end"))
    for x in range(640, 1900, 180):
        a.add(a.glow(x, 655, 70, "#f6f0e2", 0.28))
    a.add(a.glow(1040, 740, 470, "#f3ecdc", 0.16),
          rect(600, 655, 880, 165, a.lin([(0, "#efe7d6", 0.78), (1, "#a99c86", 0.55)])),
          path("M820 655V820M1040 655V820M1260 655V820M600 690H1480", stroke="#3a3a40", stroke_width=5),
          rect(660, 760, 120, 60, "#3a3530", opacity=0.55), rect(940, 740, 70, 80, "#3a3530", opacity=0.45),
          rect(1110, 768, 140, 52, "#3a3530", opacity=0.5),
          rect(1530, 655, 120, 165, "#26262b"), rect(1545, 670, 90, 135, "#efe7d6", opacity=0.6),
          rect(1690, 655, 230, 165, "#18181c"), rect(1720, 680, 170, 110, "#efe7d6", opacity=0.35))
    a.add(rect(0, 820, 1920, 44, "#1a1a1e"), line(0, 820, 1920, 820, "#34343a", 2), rect(0, 860, 1920, 6, "#2e2e34"),
          rect(0, 866, 1920, 214, a.lin([(0, "#101013"), (1, "#060608")])))
    for x, w, op in ((640, 60, 0.09), (930, 40, 0.07), (1250, 50, 0.08), (1560, 40, 0.06)):
        a.add(anim(rect(x, 880, w, 190, a.lin([(0, "#f1ebde", op), (1, "#f1ebde", 0)])), "softpulse", 3 + x % 4))
    streak = rect(0, 1040, 640, 6, a.lin([(0, "#fff", 0), (0.75, RED_GLOW, 0.45), (1, "#fff", 0)], 0, 0, 1, 0), rx=3)
    a.add(f'<g transform="translate(-700 0)">{anim(streak, drift(2700), 9, "linear", 3)}</g>')
    a.add(lamp(a, 70, 430, 866))
    for i in range(4):
        s, x, gy = 0.84 + i * 0.05, 120 + i * 395, 932 + i * 16
        v = van(a, x, gy, s, lights=True)
        a.add(reflect(a, v, gy, 170, 0.2), v)
    a.add(walker(-80, 1078, 300, 2100, 22, "#161618", "#121214", SKINS[1], delay=4, vest=True, step=1.05),
          walker(2000, 1072, 290, 2150, 25, "#161618", "#121214", SKINS[2], flip=True, delay=15, vest=True, step=1.1))
    a.add(vignette(a, 0.25))
    return a


def security_personnel():
    a = Art(1600, 1000, "Two security officers in suits standing in a building reception")
    a.add(rect(0, 0, 1600, 700, a.lin([(0, "#ececef"), (1, "#d6d6db")])))
    escalator = [(30, 700), (150, 700), (510, 330), (440, 300)]
    steps = path("".join(f"M{n(40 + k * 34)} {n(723 - k * 33)}l60 0" for k in range(-1, 14)),
                 stroke="#a5abb3", stroke_width=2)
    a.add(rect(0, 0, 520, 700, a.lin([(0, "#d3d8de"), (1, "#bfc5cc")])),
          rect(0, 290, 520, 14, "#9aa0a8"),
          poly(escalator, "#8f959d"),
          group(anim(steps, drift(34, -33), 1.6, "linear"), clip_path=a.clip(poly(escalator, "#000"))))
    ride = keyframes("ride", "0%{transform:translate(0,0);opacity:0}8%{opacity:1}88%{opacity:1}"
                             "100%{transform:translate(340px,-330px);opacity:0}")
    for i, (shirt, sk) in enumerate((("#3d4b5c", SKINS[3]), ("#6e2a2a", SKINS[0]), ("#4a4a52", SKINS[2]))):
        rider = (rect(92, 560, 30, 70, shirt, rx=10) + circle(108, 548, 12, sk)
                 + path("M96 542Q100 530 112 532Q120 534 120 544", stroke="#1a1612", stroke_width=6))
        a.add(anim(rider, ride, 13, "linear", i * 4.3))
    a.add(path("M30 650L430 262", stroke="#5d636b", stroke_width=7, stroke_linecap="round"),
          path("M150 700L510 330", stroke="#6f757d", stroke_width=4),
          path("".join(f"M{k * 74} 0V700" for k in range(8)), stroke="#a9afb7", stroke_width=3))
    a.add(rect(520, 0, 560, 700, "#26262a"), anim(a.glow(800, 320, 320, RED, 0.36), "glowpulse", 6),
          mark(800, 320, 210, RED_HI),
          text(800, 474, "NEW CONCEPT SECURITY", 18, "#e5e5ea", 600, "middle", letter_spacing="6"))
    a.add(rect(1080, 0, 520, 700, "#cdc9c3"),
          path("".join(f"M{1080 + k * 26} 0V700" for k in range(21)), stroke="#bdb8b1", stroke_width=2))
    a.add(rect(0, 34, 1600, 10, "#fbfbfd"), rect(0, 44, 1600, 60, a.lin([(0, "#fff", 0.5), (1, "#fff", 0)])))
    a.add(rect(0, 700, 1600, 300, a.lin([(0, "#c4c5ca"), (1, "#a2a3a9")])),
          rect(520, 700, 560, 300, a.lin([(0, "#26262a", 0.45), (1, "#26262a", 0)])),
          a.glow(800, 740, 220, RED, 0.14))
    vpx, vpy = 800, 560
    d = ""
    for xb in range(-1600, 3201, 200):
        x7 = vpx + (xb - vpx) * (700 - vpy) / (1000 - vpy)
        d += f"M{n(x7)} 700L{xb} 1000"
    a.add(path(d + "M0 742H1600M0 802H1600M0 884H1600", stroke="#b3b4ba", stroke_width=1.5))
    a.add(rect(380, 612, 840, 150, a.lin([(0, "#f7f7f9"), (1, "#d9d9de")])),
          path("".join(f"M{x} 616V744" for x in range(440, 1200, 60)), stroke="#e4e4e8", stroke_width=2),
          rect(380, 744, 840, 18, RED), rect(560, 560, 96, 42, "#1d1d1f", rx=3), rect(600, 600, 16, 4, "#1d1d1f"),
          rect(368, 600, 864, 16, "#ffffff", rx=3), mark(800, 688, 46, RED))
    a.add(walker(1640, 820, 260, 1750, 18, "#5c6670", "#2a2a30", SKINS[1], flip=True, delay=3, bag="#6e5a48"))
    for x, y, h, sk in ((520, 905, 470, SKINS[3]), (1080, 900, 480, SKINS[0])):
        o = officer(x, y, h, "suit", "clasped", sk)
        a.add(shadow(a, x, y, 100, a=0.3), reflect(a, o, y, 120, 0.14), o)
    a.add(walker(-120, 990, 400, 1900, 15, "#2f3a4a", "#1d1d22", SKINS[4], delay=8, step=0.95))
    a.add(vignette(a, 0.22))
    return a


def guarding():
    a = Art(1600, 1000, "Security officer with a clipboard at a gatehouse barrier at dusk")
    a.add(rect(0, 0, 1600, 640, a.lin([(0, "#141419"), (0.62, "#38232a"), (1, "#7a3a33")])),
          anim(a.glow(800, 640, 760, RED_HI, 0.3), "softpulse", 8), stars(61, 1600, 260, 25))
    a.add(clouds(a, 1600, 120, 360, 4, "#4a2a2e", 0.45, count=4, dur=150, scale=1.4))
    saw = [(0, 640)]
    for x in range(0, 780, 130):
        saw += [(x, 560), (x + 130, 505), (x + 130, 560)]
    saw += [(780, 640)]
    a.add(poly(saw, "#18181d"), rect(640, 430, 40, 210, "#18181d"), rect(1160, 540, 460, 100, "#18181d"),
          rect(1160, 530, 460, 12, "#1f1f25"))
    a.add(floodlight(a, 1380, 300, 640))
    a.add(rect(0, 640, 1600, 360, "#121215"),
          poly([(470, 770), (1130, 770), (1800, 1000), (-200, 1000)], a.lin([(0, "#232328"), (1, "#141417")])))
    a.add(palisade(-10, 880, 560, 770, "#24242a"))
    for y, h, w in ((780, 18, 8), (815, 26, 10), (862, 36, 12), (925, 50, 16)):
        a.add(rect(800 - w / 2, y, w, h, "#d8d8dc", opacity=0.7))
    a.add(poly([(560, 800), (1040, 800), (1062, 813), (538, 813)], "#e8e8ea", opacity=0.75))
    # A car rolls up, waits for the barrier, then drives through, on the same 11s clock as the arm.
    approach = keyframes("approach", "0%{transform:translate(0,-6px) scale(.3);opacity:0}6%{opacity:1}"
                                     "26%,42%{transform:translate(0,0) scale(.6);opacity:1}"
                                     "66%{transform:translate(-40px,190px) scale(1.5);opacity:1}"
                                     "74%,100%{transform:translate(-60px,300px) scale(2);opacity:0}")
    a.add(f'<g transform="translate(830 772)">{anim(car_front(a, "#3a4450"), approach, 11, "ease-in-out", origin=(0, 0))}</g>')
    a.add(poly([(1220, 530), (1292, 546), (1292, 796), (1220, 780)], "#a7a7ae"),
          poly([(1236, 600), (1276, 609), (1276, 790), (1236, 782)], "#7d7d85"),
          rect(920, 520, 300, 260, "#dcdce0"),
          rect(895, 498, 345, 26, INK), poly([(1240, 498), (1312, 513), (1312, 539), (1240, 524)], "#141416"),
          rect(920, 524, 300, 18, RED), text(1070, 538, "SECURITY", 13, WHITE, 800, "middle", letter_spacing="4"),
          anim(a.glow(1070, 625, 260, "#f3ede0", 0.25), "softpulse", 5),
          rect(946, 566, 248, 118, "#f3ede0"), rect(980, 636, 74, 44, "#2a2a2e"), rect(1010, 680, 14, 4, "#2a2a2e"),
          anim(rect(984, 640, 66, 36, "#5b7088", opacity=0.8), "flicker", 5),
          path("M1120 684V640Q1120 630 1130 630H1150", stroke="#3a3a3e", stroke_width=6),
          line(1070, 566, 1070, 684, "#9a9aa0", 3), rect(920, 760, 300, 20, "#9a9aa0"))
    arm = "".join(rect(880 - (i + 1) * 64, 652, 64, 16, RED if i % 2 == 0 else "#f3f3f5") for i in range(10))
    lift = keyframes("barrier", "0%,30%{transform:rotate(0)}42%,72%{transform:rotate(80deg)}84%,100%{transform:rotate(0)}")
    a.add(anim(arm, lift, 11, origin=(880, 660)),
          rect(232, 660, 10, 110, "#d9d9dd"), path("M226 660L237 672L248 660", stroke="#d9d9dd", stroke_width=4),
          rect(856, 640, 48, 132, "#e6e6e9", rx=4), rect(856, 640, 48, 16, RED, rx=3), circle(880, 660, 10, "#5a5a60"))
    a.add(shadow(a, 700, 905, 100), officer(700, 905, 440, "uniform", "clipboard", SKINS[4], rim=RED_GLOW))
    a.add(vignette(a, 0.45))
    return a


def mobile_patrols():
    a = Art(1600, 1000, "Mobile patrol officer checking a locked gate beside a liveried van at night")
    a.add(rect(0, 0, 1600, 800, a.lin([(0, "#08080b"), (1, "#1a1a22")])), stars(31, 1600, 400, 40),
          moon(a, 1320, 170, 48), clouds(a, 1600, 120, 330, 6, "#22222c", 0.6, count=4, dur=150, scale=1.3))
    a.add(rect(80, 430, 760, 300, "#17171c"), rect(80, 420, 760, 12, "#1f1f25"),
          path("".join(f"M{x} 520H{x + 160}" for x in (140, 440)) + "".join(
              f"M140 {y}H300M440 {y}H600" for y in range(530, 720, 14)), stroke="#22222a", stroke_width=3),
          rect(140, 510, 160, 220, "none", stroke="#26262e", stroke_width=4),
          rect(440, 510, 160, 220, "none", stroke="#26262e", stroke_width=4))
    a.add(rect(0, 800, 1600, 200, a.lin([(0, "#141418"), (1, "#0a0a0c")])))
    a.add(palisade(-10, 300, 540, 810, "#26262c"), palisade(620, 830, 540, 810, "#26262c"))
    a.add(rect(300, 556, 320, 250, "none", stroke="#30303a", stroke_width=8),
          palisade(304, 616, 560, 806, "#2c2c34", w=11, gap=9),
          line(460, 556, 460, 806, "#30303a", 6))
    a.add(rect(380, 584, 160, 104, CLOUD, rx=3), rect(380, 584, 160, 28, RED, rx=3), rect(380, 600, 160, 12, RED),
          text(460, 604, "WARNING", 16, WHITE, 800, "middle", letter_spacing="2"),
          text(460, 638, "SITE PATROLLED", 13, INK, 800, "middle"),
          text(460, 656, "NEW CONCEPT SECURITY", 9.5, INK, 600, "middle", letter_spacing="1"),
          mark(460, 674, 16, RED))
    a.add(path("M440 712Q460 730 480 712", stroke="#9a9aa0", stroke_width=4),
          rect(450, 716, 20, 22, "#b8b8be", rx=3), path("M454 716V708Q460 700 466 708V716", stroke="#b8b8be", stroke_width=3))
    v = van(a, 830, 860, 1.08, lights=True)
    a.add(reflect(a, v, 860, 140, 0.18), v)
    h, x, y = 390, 742, 884
    tx, ty = opoint(x, y, h, TORCH_TIP)
    torch = (poly([(tx, ty - 4), (tx, ty + 4), (380, 790), (380, 610)],
                  a.lin([(0, "#fffbe9", 0.55), (1, "#fffbe9", 0.05)], tx, 0, 380, 0, user=True))
             + a.glow(460, 700, 120, "#fffbe9", 0.3))
    a.add(anim(anim(torch, sway(4), 6, origin=(tx, ty)), "softpulse", 2.3))
    a.add(shadow(a, x, y, 90), officer(x, y, h, "uniform", "torch", SKINS[0], rim=RED_GLOW, rim_op=0.8))
    a.add(hud(60, 70, "PATROL 03  02:47  NATIONWIDE", 15), brackets(40, 40, 1520, 920, L=40, op=0.28))
    a.add(rain(a, 1600, 1000, 0.2, 0.55))
    a.add(vignette(a, 0.5))
    return a


def retail_guarding():
    a = Art(1600, 1000, "Security officer in a suit at the entrance of a retail store")
    a.add(rect(0, 0, 1600, 640, a.lin([(0, "#f2f2f4"), (1, "#e2e2e6")])))
    passer = (ellipse(0, -150, 13, 16, "#7f8792") + rect(-15, -134, 30, 70, "#7f8792", rx=10)
              + path("M-8 -66L-12 0M8 -66L12 0", stroke="#7f8792", stroke_width=11, stroke_linecap="round"))
    passers = (f'<g transform="translate(560 640)">{anim(passer, drift(520), 9, "linear")}</g>'
               f'<g transform="translate(1000 630) scale(-1.08 1.08)">{anim(passer, drift(560), 12, "linear", 5)}</g>')
    a.add(rect(620, 250, 360, 390, a.lin([(0, "#d8dee5"), (1, "#bcc4cd")])),
          rect(620, 500, 360, 140, "#a9b1bb", opacity=0.45),
          group(passers, clip_path=a.clip(rect(620, 250, 360, 390, "#000")), opacity=0.55),
          rect(620, 250, 360, 390, "none", stroke="#2c2c2e", stroke_width=8),
          line(800, 250, 800, 640, "#2c2c2e", 6), rect(780, 410, 8, 70, "#8e8e93", rx=3),
          rect(812, 410, 8, 70, "#8e8e93", rx=3), rect(600, 214, 400, 36, INK))
    rnd = random.Random(9)
    palette = [INK, "#3a3a3c", "#636366", "#d2d2d7", RED, "#f5f5f7", "#86868b", "#aeaeb2"]
    for x0 in (150, 1050):
        sh = [rect(x0, 230, 400, 380, "#e9e9ec"), rect(x0, 230, 400, 380, "none", stroke="#d2d2d7", stroke_width=3)]
        for y in (320, 410, 500, 590):
            sh.append(rect(x0, y, 400, 8, "#c7c7cc"))
            xx = x0 + 12
            while xx < x0 + 380:
                w = rnd.uniform(26, 50)
                hh = rnd.uniform(34, 70)
                sh.append(rect(xx, y - hh, w, hh, rnd.choice(palette), rx=3))
                xx += w + rnd.uniform(4, 14)
        a.add(*sh)
    a.add(rect(0, 0, 1600, 110, "#e6e6ea"), line(0, 110, 1600, 110, "#d2d2d7", 2))
    for x in (260, 520, 1080, 1340):
        a.add(poly([(x - 10, 140), (x + 10, 140), (x + 90, 460), (x - 90, 460)],
                   a.lin([(0, "#ffffff", 0.55), (1, "#ffffff", 0)])),
              rect(x - 12, 110, 24, 32, "#2c2c2e", rx=5), a.glow(x, 142, 40, "#ffffff", 0.8))
    a.add(dome(800, 112, 1.1))
    a.add(rect(0, 640, 1600, 360, a.lin([(0, "#dcdce0"), (1, "#c2c2c7")])))
    d = ""
    for xb in range(-1600, 3201, 220):
        x6 = 800 + (xb - 800) * (640 - 500) / (1000 - 500)
        d += f"M{n(x6)} 640L{xb} 1000"
    a.add(path(d + "M0 690H1600M0 760H1600M0 860H1600", stroke="#cdcdd2", stroke_width=1.5))
    for x in (580, 1000):
        a.add(rect(x - 12, 420, 24, 220, "#f1f1f3", rx=10),
              rect(x - 12, 420, 24, 220, "none", rx=10, stroke="#c7c7cc", stroke_width=2),
              rect(x - 18, 630, 36, 10, "#c7c7cc", rx=3),
              anim(rect(x - 3, 440, 6, 160, RED, rx=3, opacity=0.7), "pulse", 2.4, delay=x * 0.003))
    for x0, x1, seed in ((60, 520, 4), (1170, 1560, 5)):
        r2 = random.Random(seed)
        g = [line(x0, 430, x1, 430, "#8e8e93", 6), line(x0 + 20, 430, x0 + 20, 780, "#8e8e93", 5),
             line(x1 - 20, 430, x1 - 20, 780, "#8e8e93", 5),
             line(x0, 780, x0 + 40, 780, "#8e8e93", 6), line(x1 - 40, 780, x1, 780, "#8e8e93", 6)]
        xx = x0 + 34
        while xx < x1 - 50:
            col = r2.choice(palette)
            g.append(path(f"M{n(xx + 15)} 430l0 8", stroke="#6e6e73", stroke_width=2))
            g.append(rect(xx, 438, 32, r2.uniform(150, 210), col, rx=7))
            g.append(rect(xx, 438, 32, 12, shade(col, 0.15), rx=5))
            xx += r2.uniform(22, 30)
        a.add(*g)
    a.add(rect(540, 700, 300, 18, "#f7f7f9"), rect(552, 718, 10, 120, "#c7c7cc"), rect(818, 718, 10, 120, "#c7c7cc"),
          rect(570, 668, 70, 32, "#3a3a3c", rx=3), rect(575, 640, 60, 28, "#d2d2d7", rx=3),
          rect(660, 676, 70, 24, RED, rx=3), rect(750, 664, 70, 36, "#86868b", rx=3))
    a.add(walker(1700, 905, 360, 1300, 13, "#8a5a5a", "#2c2c32", SKINS[3], flip=True, delay=1, bag=RED_HI))
    a.add(shadow(a, 1010, 930, 110, a=0.28), officer(1010, 930, 480, "suit", "clasped", SKINS[2], armband=True))
    a.add(walker(-100, 990, 400, 1850, 16, "#3d4b5c", "#1d1d22", SKINS[0], delay=7, bag="#d2d2d7", step=0.95))
    a.add(vignette(a, 0.2))
    return a


def site_security():
    a = Art(1600, 1000, "Construction site behind perimeter fencing with keep out and CCTV signs")
    a.add(rect(0, 0, 1600, 700, a.lin([(0, "#121217"), (0.75, "#2e1f22"), (1, "#4a2a2a")])),
          a.glow(800, 700, 760, RED_HI, 0.2), stars(41, 1600, 300, 30))
    a.add(crane(1260, 700, 480, 760, 250, "#1b1b20", sw=3, hook=0.5, load=False))
    a.add(houses(a, 110, 700, 4, 200, 170, 46, "#3a2522", "#0f0f12", "#6f675e", scaffold=(1, 2)))
    a.add(floodlight(a, 60, 380, 700, toward=1, a=0.35))
    px = 1200
    a.add(anim(poly([(px + 40, 352), (px + 54, 360), (px + 400, 720), (px + 60, 760)],
                    a.lin([(0, RED_GLOW, 0.24), (1, RED_GLOW, 0)], 0, 0, 0, 1)),
               sway(7), 9, delay=px * 0.02, origin=(px + 22, 347)))
    a.add(anim(poly([(px - 40, 352), (px - 54, 360), (px - 400, 720), (px - 60, 760)],
                    a.lin([(0, RED_GLOW, 0.18), (1, RED_GLOW, 0)], 0, 0, 0, 1)),
               sway(7), 9, delay=px * 0.02, origin=(px - 22, 347), direction="reverse"))
    a.add(rect(px - 5, 330, 10, 370, "#3a3a40"), poly([(px - 40, 300), (px + 30, 300), (px + 50, 330), (px - 20, 330)], "#1d2533"),
          poly([(px - 40, 300), (px + 30, 300), (px + 50, 330), (px - 20, 330)], "none", stroke="#8e8e93", stroke_width=2),
          cctv(px, 352, 0.8, 28), cctv(px, 352, 0.8, 28, flip=True))
    a.add(rect(0, 700, 1600, 300, a.lin([(0, "#1a1716"), (1, "#0d0d0e")])),
          path("M300 1000Q520 820 760 720M520 1000Q680 840 860 720", stroke="#262220", stroke_width=26, opacity=0.6))
    a.add(f'<g transform="translate(-420 0)">{anim(van(a, 0, 790, 0.62, lights=True, moving=True), cross(2400), 14, "linear")}</g>')
    a.add(heras(a, -60, 1660, 250, 930, panel=520, color="#a2a2a8", cell=(22, 44), mesh_op=0.42, sw=7, foot="#2c2c2e"))
    a.add(rain(a, 1600, 1000, 0.18, 0.5))
    a.add(rect(222, 476, 360, 196, "#000", opacity=0.3, rx=6),
          rect(216, 468, 360, 196, CLOUD, rx=6), rect(216, 468, 360, 62, RED, rx=6), rect(216, 500, 360, 30, RED),
          text(396, 511, "CONSTRUCTION SITE", 28, WHITE, 800, "middle", letter_spacing="1.5"),
          text(396, 598, "KEEP OUT", 64, INK, 800, "middle", letter_spacing="2"),
          text(396, 638, "UNAUTHORISED PERSONS NOT PERMITTED", 13, GREY, 700, "middle", letter_spacing="1"))
    a.add(rect(1046, 528, 290, 156, "#000", opacity=0.3, rx=6),
          rect(1040, 520, 290, 156, INK, rx=6), rect(1040, 520, 290, 8, RED, rx=4),
          icon("cctv", 1060, 548, 64, WHITE, 3.4),
          text(1140, 584, "24HR CCTV", 34, WHITE, 800),
          text(1140, 610, "IN OPERATION", 17, RED_GLOW, 700, letter_spacing="2"),
          circle(1306, 546, 6, RED_GLOW, style=motion("blink", 1.4, "linear")),
          text(1060, 656, "MONITORED BY NEW CONCEPT SECURITY", 11.5, SILVER, 600, letter_spacing="1"))
    for sx, sy in ((228, 480), (564, 480), (228, 652), (564, 652), (1052, 532), (1318, 532), (1052, 664), (1318, 664)):
        a.add(circle(sx, sy, 4, "#111"))
    a.add(vignette(a, 0.5))
    return a
