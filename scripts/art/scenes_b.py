"""Scene illustrations, part two: healthcare, response, lock and unlock, CCTV, towers, fire."""
import math
import random

from lib import *  # noqa: F401,F403


def healthcare():
    a = Art(1600, 1000, "Security officer and a nurse at a hospital emergency entrance in the evening")
    a.add(rect(0, 0, 1600, 760, a.lin([(0, "#1a1c23"), (1, "#3b3f4a")])),
          rect(0, 130, 1600, 630, "#e1e3e6"), rect(0, 120, 1600, 14, "#c9ccd1"))
    rnd = random.Random(12)
    for y in (190, 310, 430):
        a.add(rect(0, y, 1600, 72, a.lin([(0, "#262b33"), (1, "#424955")])))
        for k in range(25):
            if rnd.random() < 0.35:
                tw = motion("twinkle", round(rnd.uniform(6, 12), 1), delay=rnd.uniform(0, 12)) if rnd.random() < 0.25 else None
                a.add(rect(k * 64 + 4, y + 4, 56, 64, "#f2efe6", opacity=round(rnd.uniform(0.35, 0.8), 2), style=tw))
        a.add(path("".join(f"M{k * 64} {y}V{y + 72}" for k in range(26)), stroke="#cfd2d7", stroke_width=4))
    a.add("".join(rect(x, 130, 18, 430, "#cfd2d7") for x in range(150, 1600, 320)))
    a.add(rect(540, 470, 520, 74, CLOUD, rx=6), rect(540, 470, 520, 74, "none", rx=6, stroke="#c7c7cc", stroke_width=2),
          path("M562 507H596L608 481L622 533L634 495L644 511H678", stroke=RED_HI, stroke_width=4, opacity=0.15,
               stroke_linejoin="round", stroke_linecap="round"),
          path("M562 507H596L608 481L622 533L634 495L644 511H678", stroke=RED_HI, stroke_width=4,
               stroke_linejoin="round", stroke_linecap="round", stroke_dasharray="220",
               style=motion(draw(220), 3.2, "linear")),
          text(700, 524, "EMERGENCY", 44, RED, 800, letter_spacing="6"))
    a.add(rect(400, 560, 800, 26, CHAR), rect(420, 586, 12, 174, "#3a3a40"), rect(1168, 586, 12, 174, "#3a3a40"))
    a.add(poly([(560, 760), (1040, 760), (1180, 1000), (420, 1000)], a.lin([(0, "#f3f1ea", 0.3), (1, "#f3f1ea", 0)])),
          a.glow(800, 680, 380, "#f3f1ea", 0.3),
          rect(560, 586, 480, 174, a.lin([(0, "#f6f4ee"), (1, "#d9d5ca")])),
          rect(630, 690, 210, 40, "#b8b2a6", opacity=0.6), ellipse(900, 650, 12, 14, "#8a8478", opacity=0.35),
          rect(886, 664, 28, 70, "#8a8478", opacity=0.3))
    door_l = keyframes("doorL", "0%,22%{transform:translateX(0)}36%,66%{transform:translateX(-200px)}"
                                "80%,100%{transform:translateX(0)}")
    door_r = keyframes("doorR", "0%,22%{transform:translateX(0)}36%,66%{transform:translateX(200px)}"
                                "80%,100%{transform:translateX(0)}")
    glass = a.lin([(0, "#e8eef2", 0.55), (1, "#c9d3da", 0.35)], 0, 0, 1, 1)
    panel = lambda x0: (rect(x0, 586, 240, 174, glass) + rect(x0, 586, 240, 174, "none", stroke="#8a8f96", stroke_width=5)
                        + poly([(x0 + 40, 586), (x0 + 80, 586), (x0 + 20, 760), (x0 - 20, 760)], "#fff", opacity=0.25))
    a.add(group(anim(panel(560), door_l, 9) + anim(panel(800), door_r, 9),
                clip_path=a.clip(rect(560, 586, 480, 174, "#000"))),
          rect(560, 586, 480, 174, "none", stroke="#6d6d75", stroke_width=6))
    for x in range(460, 1180, 90):
        a.add(anim(a.glow(x, 588, 46, "#fff8ec", 0.5), "softpulse", 4, delay=x * 0.01))
    a.add(rect(1356, 560, 8, 200, "#3a3a40"), rect(1320, 498, 80, 80, "#2c2c2e", rx=8),
          text(1360, 558, "H", 56, WHITE, 800, "middle"))
    a.add(rect(0, 760, 1600, 240, a.lin([(0, "#2a2b30"), (1, "#141417")])), line(0, 762, 1600, 762, "#4a4a52", 3),
          rect(100, 820, 300, 150, "none", stroke="#d8d8dc", stroke_width=3, opacity=0.6),
          path("".join(f"M{100 + k * 40} 970L{160 + k * 40} 820" for k in range(6)), stroke="#d8d8dc", stroke_width=3,
               opacity=0.35))
    a.add(walker(1700, 800, 250, 1150, 14, "#9aa3ab", "#8c959d", SKINS[1], flip=True, delay=2),
          walker(-60, 812, 260, 700, 11, "#5a4a5c", "#2a2a30", SKINS[2], delay=7, bag="#2c2c32"))
    a.add(shadow(a, 470, 885, 90), officer(470, 885, 420, "scrubs", "side", SKINS[3], hair="#3a2a1e"))
    a.add(shadow(a, 1130, 900, 100),
          officer(1130, 900, 450, "uniform", "radio", SKINS[2], rim="#f3f1ea", rim_dx=-3.5, rim_op=0.6))
    a.add(vignette(a, 0.35))
    return a


def key_holding():
    a = Art(1600, 1000, "Key holding officer with a torch and keys responding to an alarm at a business at night")
    a.add(rect(0, 0, 1600, 820, a.lin([(0, "#09090c"), (1, "#18181f")])), stars(51, 1600, 220, 30),
          clouds(a, 1600, 60, 200, 8, "#20202a", 0.6, count=4, dur=150, scale=1.2))
    a.add(rect(380, 240, 1220, 580, "#1f1f24"),
          path("".join(f"M{x} 380V820" for x in range(400, 1600, 40)), stroke="#24242a", stroke_width=2),
          rect(380, 232, 1220, 10, "#2a2a30"), rect(380, 320, 1220, 60, "#2a2a30"),
          mono(420, 358, "UNIT 2", 18, FAINT))
    lift = keyframes("shutter", "0%,18%{transform:scaleY(1)}48%,74%{transform:scaleY(.42)}100%{transform:scaleY(1)}")
    a.add(rect(540, 406, 560, 414, "#101014"),
          rect(560, 520, 160, 300, "#1a1a20"), rect(760, 560, 120, 260, "#1a1a20"), rect(920, 500, 160, 320, "#1a1a20"),
          anim(a.glow(820, 760, 300, "#f3ecdc", 0.16), "softpulse", 6),
          poly([(600, 650), (680, 650), (600, 820), (540, 820)], "#ffffff", opacity=0.04),
          anim(rect(540, 406, 560, 236, "#55555d")
               + path("".join(f"M540 {y}H1100" for y in range(418, 640, 12)), stroke="#47474e", stroke_width=2)
               + rect(540, 632, 560, 10, "#3a3a40"), lift, 12, origin=(540, 406)),
          rect(530, 390, 580, 16, "#3a3a40"))
    a.add(rect(1170, 520, 150, 300, "#2c2c32"), rect(1170, 520, 150, 300, "none", stroke="#3a3a40", stroke_width=6),
          rect(1290, 650, 8, 44, "#8e8e93", rx=3), circle(1294, 712, 5, "#c9c9ce"))
    a.add(anim(a.glow(1238, 424, 200, RED_GLOW, 0.65), "flash", 1.6, "linear"),
          anim(circle(1238, 424, 110, "none", stroke=RED_GLOW, stroke_width=3), "ring", 1.6, "ease-out"),
          anim(circle(1238, 424, 110, "none", stroke=RED_GLOW, stroke_width=2), "ring", 1.6, "ease-out", 0.8),
          rect(1190, 410, 96, 110, CLOUD, rx=8), rect(1190, 410, 96, 26, "#6a0a0a", rx=8),
          rect(1190, 424, 96, 12, "#6a0a0a"),
          anim(rect(1190, 410, 96, 26, RED_GLOW, rx=8) + rect(1190, 424, 96, 12, RED_GLOW), "flash", 1.6, "linear"),
          mark(1238, 480, 40, RED))
    a.add(rect(0, 820, 1600, 180, a.lin([(0, "#16161a"), (1, "#0b0b0d")])), line(0, 820, 1600, 820, "#34343a", 2))
    v = van(a, 20, 884, 0.9, lights=True)
    a.add(reflect(a, v, 884, 120, 0.18), v)
    x, y, h = 900, 905, 420
    tx, ty = opoint(x, y, h, TORCH_TIP, flip=True)
    torch = (poly([(tx, ty - 4), (tx, ty + 4), (1340, 790), (1340, 630)],
                  a.lin([(0, "#fffbe9", 0.5), (1, "#fffbe9", 0.04)], tx, 0, 1340, 0, user=True))
             + a.glow(1292, 700, 100, "#fffbe9", 0.35))
    a.add(anim(anim(torch, sway(3), 5, origin=(tx, ty)), "softpulse", 2.1))
    a.add(shadow(a, x, y, 90), officer(x, y, h, "uniform", "torch", SKINS[1], flip=True, rim=RED_GLOW, rim_op=0.8))
    kx, ky = opoint(x, y, h, OFF_HAND, flip=True)
    a.add(circle(kx, ky + 14, 11, "none", stroke="#c9c9ce", stroke_width=3),
          rect(kx - 9, ky + 22, 5, 26, "#d9d9dd", rx=2), rect(kx + 2, ky + 24, 5, 22, "#b8b8be", rx=2),
          f'<g transform="rotate(-14 {n(kx + 8)} {n(ky + 24)})">' + rect(kx + 6, ky + 22, 18, 30, RED_HI, rx=4) + "</g>")
    a.add(hud(60, 70, "ALARM ACTIVATION  02:14", 15),
          mono(78, 98, "UNIT 2  RESPONDING  ETA 00:38", 13, WHITE, opacity=0.55),
          brackets(40, 40, 1520, 920, L=40, op=0.28))
    a.add(rain(a, 1600, 1000, 0.2, 0.5))
    a.add(vignette(a, 0.5))
    return a


def _arrow(x, y, dx, dy, size, color, **kw):
    px, py = -dy, dx
    tip = (x + dx * size * 0.7, y + dy * size * 0.7)
    return poly([tip, (x - dx * size * 0.3 + px * size * 0.5, y - dy * size * 0.3 + py * size * 0.5),
                 (x - dx * size * 0.3 - px * size * 0.5, y - dy * size * 0.3 - py * size * 0.5)], color, **kw)


def lock_unlock():
    a = Art(1600, 1000, "A key in a door lock on a red New Concept Security tag, split between day and night")
    day = [(0, 0), (480, 0), (1124, 1000), (0, 1000)]
    night = [(480, 0), (1600, 0), (1600, 1000), (1124, 1000)]
    a.add(poly(day, a.lin([(0, "#f7f7f9"), (1, "#e1e1e6")])), poly(night, a.lin([(0, "#16161b"), (1, "#0a0a0c")])))
    rays = "".join(line(250 + 84 * math.cos(math.radians(t)), 230 + 84 * math.sin(math.radians(t)),
                        250 + 112 * math.cos(math.radians(t)), 230 + 112 * math.sin(math.radians(t)),
                        "#efcf94", 4, stroke_linecap="round", opacity=0.7) for t in range(0, 360, 30))
    a.add(anim(a.glow(250, 230, 280, "#f3dcb4", 0.6), "glowpulse", 6), anim(rays, "spin", 40, "linear"),
          circle(250, 230, 64, "#f6e3c2"))
    cp = a.clip(poly(night, "#000"))
    a.add(group(stars(61, 1600, 700, 70), clip_path=cp))
    a.add(anim(a.glow(1360, 220, 170, "#dfe3f0", 0.22), "softpulse", 7),
          circle(1360, 220, 60, "#ececf0"), circle(1386, 202, 54, "#15151a"))
    a.add(poly([(480, 0), (560, 0), (1204, 1000), (1124, 1000)], RED))
    R, cx, cy = 360, 800, 520
    a.add(anim(path(f"M488 700A{R} {R} 0 0 1 488 340", stroke=INK, stroke_width=3, opacity=0.5, stroke_linecap="round")
               + _arrow(488, 340, 0.5, -0.866, 26, INK, opacity=0.6)
               + mono(410, 526, "OPEN", 16, INK, 600, "end", opacity=0.6), "pulse", 6),
          anim(path(f"M1112 340A{R} {R} 0 0 1 1112 700", stroke=WHITE, stroke_width=3, opacity=0.6, stroke_linecap="round")
               + _arrow(1112, 700, -0.5, 0.866, 26, WHITE, opacity=0.7)
               + mono(1190, 526, "SECURE", 16, WHITE, 600, opacity=0.7), "pulse", 6, delay=3))
    ticks = "".join(line(800 + 46 * math.cos(math.radians(t)), 130 + 46 * math.sin(math.radians(t)),
                         800 + 54 * math.cos(math.radians(t)), 130 + 54 * math.sin(math.radians(t)), INK, 3)
                    for t in range(0, 360, 30))
    a.add(circle(800, 130, 66, "#000", opacity=0.2), circle(800, 130, 62, WHITE),
          circle(800, 130, 62, "none", stroke=INK, stroke_width=4), ticks,
          anim(line(800, 130, 800, 98, INK, 6, stroke_linecap="round"), "spin", 48, "linear", origin=(800, 130)),
          anim(line(800, 130, 800, 82, RED, 4, stroke_linecap="round"), "spin", 4, "linear", origin=(800, 130)),
          circle(800, 130, 6, INK))
    a.add(lock_plate(a, 800, 600, 1.0))
    a.add(mono(110, 790, "07:00  UNLOCK", 22, INK, 700), mono(1490, 790, "18:00  LOCK", 22, WHITE, 700, "end"))
    return a


# ------------------------------------------------------------ control room

def _feed(kind):
    W, H = 284, 154
    g = "#6a7078"
    o = [rect(0, 0, W, H, "#262a2f")]
    if kind == "carpark":
        o.append(rect(0, 40, W, 114, "#2f3439"))
        o.append(path("".join(f"M{142 + k * 46} 154L{142 + k * 16} 40" for k in range(-4, 5)), stroke=g, stroke_width=1.5))
        o += [rect(40, 92, 50, 28, "#4c525a", rx=6), rect(152, 104, 54, 30, "#5c626a", rx=6), rect(206, 60, 36, 20, "#4c525a", rx=5)]
    elif kind == "corridor":
        o += [poly([(0, 154), (284, 154), (172, 84), (112, 84)], "#3a3f45"),
              poly([(0, 0), (112, 46), (112, 84), (0, 154)], "#2a2e33"),
              poly([(284, 0), (172, 46), (172, 84), (284, 154)], "#30343a"), rect(112, 46, 60, 38, "#20242a"),
              rect(130, 20, 24, 5, "#9aa0a8"), rect(124, 34, 36, 4, "#9aa0a8")]
    elif kind == "perimeter":
        o += [rect(0, 100, W, 54, "#30353a")]
        xx = 0
        while xx < W:
            o.append(poly([(xx, 104), (xx, 50), (xx + 3, 44), (xx + 6, 50), (xx + 6, 104)], "#555b63"))
            xx += 10
        prowl = keyframes("prowl", "0%,100%{transform:translateX(0)}50%{transform:translateX(-96px)}")
        o.append(anim(ellipse(196, 82, 6, 7, "#c9ced4") + rect(189, 89, 14, 26, "#c9ced4", rx=4)
                      + rect(176, 70, 40, 54, "none", stroke=RED_GLOW, stroke_width=2)
                      + rect(176, 58, 58, 13, RED_GLOW) + mono(179, 68, "MOTION", 8.5, WHITE, 700), prowl, 9))
    elif kind == "gate":
        o += [rect(0, 104, W, 50, "#30353a"), rect(170, 50, 70, 60, "#4c525a"), rect(180, 62, 50, 22, "#9aa0a8"),
              rect(30, 82, 140, 6, "#c9ced4"), rect(160, 76, 14, 34, "#6a7078")]
    elif kind == "loading":
        o += [rect(0, 30, W, 124, "#2c3136")]
        for x in (20, 110, 200):
            o.append(rect(x, 50, 70, 80, "#41474e"))
            o.append(path("".join(f"M{x} {y}H{x + 70}" for y in range(56, 130, 7)), stroke="#353a40", stroke_width=1.5))
        o.append(rect(96, 96, 110, 50, "#5c626a", rx=3))
    elif kind == "street":
        o += [rect(0, 0, W, 90, "#2a2e33"), rect(10, 20, 60, 70, "#353a40"), rect(80, 34, 70, 56, "#30353b"),
              rect(160, 10, 110, 80, "#353a40"), rect(0, 90, W, 64, "#3a3f45"),
              path("M0 122H40M70 122H110M140 122H180M210 122H250", stroke="#8a9098", stroke_width=2),
              '<g transform="translate(200 0)">'
              + anim(rect(120, 92, 90, 34, "#d9dde2", rx=4) + rect(122, 106, 86, 4, RED_GLOW)
                     + circle(138, 128, 7, "#1a1d21") + circle(192, 128, 7, "#1a1d21"), drift(-520), 7, "linear")
              + "</g>"]
    elif kind == "lobby":
        wander = keyframes("wander", "0%,100%{transform:translate(0,0)}50%{transform:translate(60px,-14px)}")
        o += [rect(0, 0, W, H, "#30353a"), path("M40 40H244V70Q142 100 40 70Z", "#4c525a"),
              anim(circle(90, 110, 9, "#9aa0a8"), wander, 8), anim(circle(190, 120, 9, "#9aa0a8"), wander, 11, delay=5,
                                                                   direction="reverse"),
              rect(220, 20, 50, 20, "#41474e")]
    elif kind == "stairs":
        d = "M0 154"
        x, y = 0, 154
        while x < W:
            d += f"L{x} {y - 18}L{x + 24} {y - 18}"
            x += 24
            y -= 18
        o += [path(d + f"L{W} 154Z", "#3a3f45"), path("M10 120L270 -60", stroke="#6a7078", stroke_width=3)]
    elif kind == "site":
        o += [rect(0, 110, W, 44, "#30353a"), crane(80, 110, 90, 30, 160, "#6a7078", sw=1.4, load=False),
              rect(150, 76, 50, 34, "#41474e"), rect(206, 70, 56, 40, "#41474e"),
              poly([(146, 76), (175, 54), (204, 76)], "#4c525a")]
    return "".join(o)


def cctv_control():
    a = Art(1600, 1000, "Control room operator in a headset watching a wall of CCTV monitors")
    a.add(rect(0, 0, 1600, 1000, "#08080a"), anim(a.glow(800, 320, 840, "#2b3038", 0.6), "softpulse", 4))
    a.add(rect(300, 52, 1000, 600, "#121216", rx=8))
    scan = a.pattern(4, 4, '<rect width="4" height="1.3" fill="#000" opacity="0.28"/>')
    roll = a.lin([(0, "#fff", 0), (0.5, "#fff", 0.07), (1, "#fff", 0)])
    kinds = ["carpark", "corridor", "perimeter", "gate", "lobby", "loading", "street", "stairs", "site"]
    for i, kind in enumerate(kinds):
        col, row = i % 3, i // 3
        x, y = 336 + col * 314, 80 + row * 184
        sx, sy = x + 8, y + 8
        cp = a.clip(rect(sx, sy, 284, 154, "#000"))
        a.add(rect(x, y, 300, 170, "#0d0d0f", rx=6),
              group(f'<g transform="translate({sx} {sy})">' + _feed(kind) + "</g>",
                    anim(rect(sx, sy - 4, 284, 162, scan), drift(0, 4), 0.45, "linear"),
                    anim(rect(sx, sy - 60, 284, 40, roll), drift(0, 260), 5 + i % 3, "linear", i),
                    clip_path=cp),
              mono(sx + 8, sy + 16, f"CAM 0{i + 1}  02:14:36", 9.5, WHITE, opacity=0.75),
              circle(sx + 272, sy + 12, 3.5, RED_GLOW, style=motion("blink", 1.4, "linear", i * 0.2)))
        if kind == "perimeter":
            a.add(anim(rect(x + 2, y + 2, 296, 166, "none", rx=6, stroke=RED_GLOW, stroke_width=3)
                       + a.glow(x + 150, y + 85, 230, RED_GLOW, 0.18), "blink", 1.2, "linear"))
        else:
            slot = keyframes("slot9", "0%,9%{opacity:1}10%,100%{opacity:0}")
            a.add(anim(rect(x + 2, y + 2, 296, 166, "none", rx=6, stroke="#ffffff", stroke_width=2.5)
                       + rect(x + 196, y + 136, 96, 22, RED_GLOW, rx=3)
                       + mono(x + 204, y + 151, "TRACKING", 10, WHITE, 700), slot, 16, "linear", i * 1.78))
    for side in (-1, 1):
        px = [800 + side * v for v in (740, 510, 510, 740)]
        a.add(poly([(px[0], 150), (px[1], 110), (px[2], 560), (px[3], 520)], "#0d0d0f"),
              poly([(px[0] - side * -10, 162), (px[1] + side * 10, 124), (px[2] + side * 10, 546), (px[3] - side * -10, 508)],
                   a.lin([(0, "#2c3238"), (1, "#1b1f24")])),
              line(800 + side * 720, 240, 800 + side * 530, 214, "#5a6068", 2),
              line(800 + side * 720, 300, 800 + side * 530, 280, "#5a6068", 2),
              line(800 + side * 720, 360, 800 + side * 530, 346, "#5a6068", 2),
              anim(line(800 + side * 720, 420, 800 + side * 530, 412, RED_GLOW, 2, opacity=0.8), "pulse", 2))
    a.add(rect(170, 640, 260, 150, "#141418", rx=6), rect(290, 790, 20, 10, "#141418"),
          rect(1170, 640, 260, 150, "#141418", rx=6), rect(1290, 790, 20, 10, "#141418"))
    a.add(poly([(0, 790), (1600, 790), (1600, 1000), (0, 1000)], a.lin([(0, "#1c1c20"), (1, "#0c0c0e")])),
          line(0, 790, 1600, 790, "#4a5260", 2, opacity=0.8),
          poly([(560, 812), (1040, 812), (1064, 850), (536, 850)], "#1d1d22"),
          path("".join(f"M{560 + k * 30} 816L{548 + k * 31} 846" for k in range(17)), stroke="#2c2c32", stroke_width=1.5),
          ellipse(1120, 832, 18, 12, "#1d1d22"), rect(380, 810, 90, 30, "#1d1d22", rx=4),
          circle(400, 818, 4, RED_GLOW, style=motion("blink", 2, "linear")))
    a.add(officer(800, 1170, 650, "uniform", "behind", SKINS[0], back=True, rim="#b9c6d6", rim_dx=[-3, 3], rim_op=0.55))
    a.add(path("M763 578Q800 500 837 578", stroke="#2a2a2e", stroke_width=7, stroke_linecap="round"),
          circle(763, 582, 11, "#141416"), circle(837, 582, 11, "#141416"))
    a.add(mono(1552, 972, "NCS CONTROL ROOM  24/7/365", 14, WHITE, anchor="end", opacity=0.5))
    a.add(vignette(a, 0.45))
    return a


def standalone_cameras():
    a = Art(1600, 1000, "Solar-powered stand-alone camera tower guarding a construction site at night")
    a.add(rect(0, 0, 1600, 620, a.lin([(0, "#0a0a0e"), (1, "#1c1c24")])), stars(71, 1600, 420, 50),
          moon(a, 240, 150, 38), clouds(a, 1600, 80, 300, 2, "#23232d", 0.55, count=4, dur=160, scale=1.3))
    a.add(crane(1350, 620, 400, 520, 140, "#16161b", sw=2.5, load=False),
          rect(110, 548, 240, 72, "#17171c"), rect(130, 482, 200, 66, "#17171c"),
          rect(150, 500, 40, 24, "#2a2a30"), rect(260, 566, 60, 30, "#2a2a30"),
          excavator(1130, 622, 0.8, "#141419"))
    a.add(palisade(-10, 1610, 560, 628, "#18181e", w=7, gap=5))
    a.add(rect(0, 620, 1600, 380, a.lin([(0, "#17171b"), (1, "#0b0b0d")])))
    a.add(anim(poly([(780, 400), (820, 400), (1330, 860), (980, 950)], a.lin([(0, RED_GLOW, 0.18), (1, RED_GLOW, 0)])),
               sway(9), 8, origin=(800, 400)),
          anim(poly([(780, 400), (820, 400), (620, 950), (270, 860)], a.lin([(0, RED_GLOW, 0.18), (1, RED_GLOW, 0)])),
               sway(9), 8, delay=4, origin=(800, 400)))
    a.add(coverage(a, 800, 860, 540), mono(1352, 866, "60 M RADIUS", 15, RED_GLOW, 600))
    a.add(walker(1680, 760, 220, 1900, 17, "#0f0f13", "#0b0b0e", "#2a2420", "#0b0b0e", flip=True, delay=4, step=0.75))
    a.add(tower(a, 800, 860, 1.0))
    for k, r in enumerate((34, 56, 78)):
        a.add(anim(path(f"M{n(792 - r * 0.8)} {n(338 - r * 0.6)}A{r} {r} 0 0 1 {n(792 + r * 0.8)} {n(338 - r * 0.6)}",
                        stroke=WHITE, stroke_width=3, stroke_linecap="round"), "pulse", 1.8, delay=1.8 - k * 0.3))
    a.add(hud(60, 70, "UNIT RD-07  ARMED  SOLAR 98%", 15), brackets(40, 40, 1520, 920, L=40, op=0.28))
    a.add(vignette(a, 0.5))
    return a


def fire_services():
    a = Art(1600, 1000, "Fire marshal on a waking watch patrol scanning an NFC checkpoint in a corridor")

    def lerp(p, q, t):
        return p + (q - p) * t

    def P(side, d, v):
        x = lerp(0, 640, d) if side < 0 else lerp(1600, 880, d)
        top, bot = lerp(0, 380, d), lerp(1000, 580, d)
        return x, bot - v * (bot - top)

    def quad(side, d1, d2, v0, v1):
        return [P(side, d1, v0), P(side, d1, v1), P(side, d2, v1), P(side, d2, v0)]

    a.add(poly([(0, 0), (1600, 0), (880, 380), (640, 380)], a.lin([(0, "#18181c"), (1, "#2a2a30")])),
          poly([(0, 0), (640, 380), (640, 580), (0, 1000)], a.lin([(0, "#26262c"), (1, "#3a3a42")], 0, 0, 1, 0)),
          poly([(1600, 0), (880, 380), (880, 580), (1600, 1000)], a.lin([(0, "#3a3a42"), (1, "#28282e")], 0, 0, 1, 0)),
          poly([(0, 1000), (640, 580), (880, 580), (1600, 1000)], a.lin([(0, "#34343a"), (1, "#18181b")])),
          rect(640, 380, 240, 200, "#24242a"), rect(712, 440, 96, 140, "#18181d"),
          anim(a.glow(760, 417, 90, "#ffffff", 0.3), "softpulse", 3),
          rect(708, 404, 104, 26, "#ececef", rx=3), text(754, 423, "FIRE EXIT", 13, INK, 800, "middle"),
          _arrow(796, 417, 1, 0, 12, INK))
    for side, spans in ((-1, ((0.3, 0.42), (0.62, 0.7), (0.82, 0.87))), (1, ((0.5, 0.6), (0.76, 0.82)))):
        for d1, d2 in spans:
            q = quad(side, d1, d2, 0, 0.62)
            a.add(poly(q, "#1c1c21"), poly(q, "none", stroke="#4a4a52", stroke_width=3))
    a.add(poly([(0, 1000), (640, 580), (880, 580), (1600, 1000)], a.lin([(0, "#ffffff", 0.06), (1, "#ffffff", 0)])))
    a.add(group(walker(620, 580, 130, 290, 9, "#1d1d22", "#121214", SKINS[0], delay=2, vest=True, step=1.1),
                clip_path=a.clip(rect(640, 380, 240, 200, "#000"))))
    for d in (0.12, 0.38, 0.6, 0.78):
        c = lerp(800, 760, d)
        y = lerp(0, 380, d)
        w = lerp(1600, 240, d)
        fixture = (a.glow(c, y + 14, 200 * (1 - d) + 40, "#f4f4f6", 0.3)
                   + rect(c - w * 0.09, y + 6 * (1 - d) + 2, w * 0.18, 12 * (1 - d) + 3, "#f4f4f6"))
        a.add(anim(fixture, "flicker", 7, "linear", 2) if d == 0.38 else fixture)
    a.add(ellipse(780, 150, 26, 8, "#e9e9ec"), circle(792, 152, 2.2, RED_GLOW, style=motion("blink", 2, "linear")))
    a.add(rect(130, 700, 44, 166, RED_HI, rx=18), rect(140, 680, 24, 24, "#1d1d1f", rx=3),
          path("M164 690Q196 700 186 760", stroke="#1d1d1f", stroke_width=6, stroke_linecap="round"),
          rect(134, 760, 36, 44, WHITE, rx=3, opacity=0.9), rect(130, 700, 10, 166, "#fff", rx=5, opacity=0.18))
    a.add(rect(296, 500, 40, 40, RED_HI, rx=4), rect(303, 507, 26, 26, WHITE, rx=2), rect(309, 518, 14, 4, RED_HI))
    a.add(rect(1436, 458, 44, 44, WHITE, rx=6, stroke=RED, stroke_width=3),
          path("M1450 470Q1456 480 1450 490M1456 466Q1465 480 1456 494M1462 462Q1474 480 1462 498",
               stroke=RED, stroke_width=2.6, stroke_linecap="round"))
    a.add(officer(1150, 1010, 620, "uniform", "phone", SKINS[1], back=True, vest=True, vest_text="FIRE MARSHAL"))
    px, py = opoint(1150, 1010, 620, PHONE_AT)
    for k, r in enumerate((16, 28, 40)):
        a.add(anim(path(f"M{n(px + 14 + r * 0.6)} {n(py - r * 0.8)}A{r} {r} 0 0 1 {n(px + 14 + r * 0.6)} {n(py + r * 0.8)}",
                        stroke=RED_GLOW, stroke_width=3, stroke_linecap="round"), "pulse", 1.5, delay=1.5 - k * 0.25))
    a.add(anim(rect(1436, 458, 44, 44, "none", rx=6, stroke=RED_GLOW, stroke_width=3), "ring", 3, "ease-out"))
    a.add(hud(60, 70, "WAKING WATCH  PATROL 14 OF 24  03:20", 15),
          mono(78, 98, "NFC CHECKPOINT 07  LOGGED", 13, WHITE, opacity=0.55),
          brackets(40, 40, 1520, 920, L=40, op=0.28))
    a.add(vignette(a, 0.5))
    return a
