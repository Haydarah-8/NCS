"""Posters and banners: about page, careers, and the service posters."""
from lib import *  # noqa: F401,F403


def generation():
    a = Art(1600, 660, "The new generation of security. The North West leading provider of security services.")
    a.add(rect(0, 0, 1600, 660, a.lin([(0, "#0e1016"), (1, "#07080b")], 0, 0, 1, 1)))
    duo = a.filter('<feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.075 0.1475 0.0275 0 0  '
                   '0.075 0.1475 0.0275 0 0  0 0 0 1 0"/>')
    panel = [(0, 0), (520, 0), (945, 660), (0, 660)]
    cp = a.clip(poly(panel, "#000"))
    scene = [rect(0, 0, 1000, 660, a.lin([(0, "#5a5a60"), (1, "#0d0d0f")])),
             a.glow(330, 180, 420, "#ffffff", 0.4),
             skyline(4, -20, 1000, 520, 80, 260, "#2a2a2e", lit="#ffffff", lit_p=0.08),
             rect(0, 520, 1000, 140, "#141416"),
             van(a, -70, 612, 0.92, lights=True, moving=True),
             officer(470, 650, 480, "uniform", "radio", SKINS[1]),
             officer(640, 655, 450, "suit", "clasped", SKINS[2])]
    a.add(group(*scene, filter=duo, clip_path=cp))
    a.add(rect(0, 0, 1600, 660, a.lin([(0, "#000", 0), (0.6, "#000", 0), (1, "#000", 0.45)])))
    a.add(poly([(520, 0), (562, 0), (987, 660), (945, 660)], RED_HI),
          poly([(596, 0), (608, 0), (1033, 660), (1021, 660)], RED, opacity=0.85),
          sheen(a, 0, 0, 1600, 660, clip=poly(panel, "#000"), dur=8, a=0.16))
    a.add(lockup(1060, 140, 24),
          text(1060, 292, "THE NEW", 66, WHITE, 800, letter_spacing="1"),
          text(1060, 364, "GENERATION", 66, WHITE, 800, letter_spacing="1"),
          text(1060, 436, "OF SECURITY", 66, WHITE, 800, letter_spacing="1"),
          rect(1060, 466, 90, 5, RED_HI),
          text(1060, 510, "THE NORTH WEST LEADING PROVIDER", 19, RED_GLOW, 700, letter_spacing="2.5"),
          text(1060, 538, "OF SECURITY SERVICES", 19, RED_GLOW, 700, letter_spacing="2.5"))
    return a


def approved_contractor():
    a = Art(1600, 800, "SIA Approved Contractor. The objective of the scheme is to raise performance standards "
                       "and to assist the private security industry in developing new opportunities.")
    a.add(rect(0, 0, 1600, 800, a.lin([(0, "#121216"), (1, "#1f1f24")])),
          skyline(17, -20, 1000, 800, 120, 330, "#18181d", lit="#e9e4da", lit_p=0.06),
          anim(a.glow(430, 360, 380, RED, 0.3), "glowpulse", 5))
    shield = "M0 -170L140 -120L140 10Q140 120 0 190Q-140 120 -140 10L-140 -120Z"
    a.add(anim(circle(430, 372, 214, "none", stroke=RED_GLOW, stroke_width=2, stroke_dasharray="4 14", opacity=0.6),
               "spin", 30, "linear"),
          anim(circle(430, 372, 240, "none", stroke=WHITE, stroke_width=1.5, stroke_dasharray="60 30", opacity=0.2),
               "spin", 50, "linear", direction="reverse"))
    a.add(text(430, 140, "SIA APPROVED CONTRACTOR SCHEME", 16, WHITE, 700, "middle", letter_spacing="3", opacity=0.75),
          at(430, 360, 1.0, path(shield, "none", stroke=WHITE, stroke_width=6, stroke_linejoin="round")),
          at(430, 360, 0.84, path(shield, a.lin([(0, RED_HI), (1, RED_DARK)]))),
          sheen(a, 290, 170, 280, 380, clip=path(shield, "#000", transform="translate(430 360) scale(0.84)"),
                dur=6, a=0.35),
          path("M370 362L415 408L500 314", stroke=WHITE, stroke_width=24, stroke_linecap="round",
               stroke_linejoin="round", stroke_dasharray="200", style=motion(draw(200), 5, "ease-in-out")),
          rect(250, 566, 360, 70, WHITE, rx=4),
          text(430, 611, "APPROVED CONTRACTOR", 26, INK, 800, "middle", letter_spacing="1"))
    a.add(poly([(1080, 0), (1600, 0), (1600, 800), (565, 800)], a.lin([(0, RED_HI), (1, RED_DARK)], 0, 0, 1, 1)),
          poly([(1040, 0), (1056, 0), (541, 800), (525, 800)], RED_HI, opacity=0.5))
    quote = ["The objective of the scheme", "is to raise performance", "standards and to assist the",
             "private security industry in", "developing new opportunities."]
    a.add(text(996, 250, "“", 170, WHITE, 400, family="Georgia,'Times New Roman',serif", opacity=0.25))
    for i, ln in enumerate(quote):
        a.add(text(1010, 250 + i * 42, ln, 30, WHITE, 500))
    a.add(rect(1010, 486, 80, 4, WHITE),
          text(1010, 534, "Security Guarding · Door Supervision · Key Holding", 20, WHITE, 600, opacity=0.92),
          mono(1010, 572, "ACS REFERENCE  NECOSESC01", 16, WHITE, opacity=0.75),
          lockup(1010, 700, 30, accent="#ffd0d0"))
    return a


def careers_banner():
    a = Art(1600, 840, "Start your career in security with New Concept")
    a.add(rect(0, 0, 1600, 840, a.lin([(0, "#0d0d0f"), (1, "#000000")], 0, 0, 1, 1)),
          anim(a.glow(1180, 430, 560, RED, 0.4), "glowpulse", 6), mark(1180, 430, 780, RED),
          sheen(a, 790, 40, 780, 780, clip=mark(1180, 430, 780, "#000"), dur=7, a=0.22))
    a.add(anim(circle(1180, 430, 410, "none", stroke=RED_GLOW, stroke_width=2, stroke_dasharray="3 16", opacity=0.5),
               "spin", 40, "linear"))
    a.add(a.glow(1180, 700, 380, "#000000", 0.55),
          officer(1180, 1210, 990, "suit", "side", SKINS[2]))
    a.add(lockup(110, 120, 24),
          text(110, 236, "START YOUR", 70, WHITE, 800),
          text(110, 316, "CAREER IN", 70, WHITE, 800),
          text(110, 396, "SECURITY WITH", 70, WHITE, 800),
          text(110, 476, "NEW CONCEPT", 70, RED_HI, 800),
          rect(110, 516, 160, 8, RED_HI),
          text(110, 580, "SIA licensed roles in static guarding, mobile patrols,", 22, "#c7c7cc", 500),
          text(110, 612, "door supervision, events, healthcare and key holding.", 22, "#c7c7cc", 500),
          anim(rect(110, 664, 266, 50, RED_HI, rx=25, opacity=0.18), "pulse", 2.4),
          rect(110, 664, 266, 50, "none", rx=25, stroke=RED_HI, stroke_width=2),
          circle(136, 689, 5, RED_GLOW, style=motion("blink", 1.4, "linear")),
          text(154, 696, "NOW RECRUITING", 18, RED_HI, 800, letter_spacing="3"))
    return a


def mobile_unit_poster():
    a = Art(1600, 800, "Mobile security unit: nationwide patrols in signed, liveried vans")
    marks = a.pattern(150, 150, mark(75, 75, 54, "#e8e8eb"))
    a.add(rect(0, 0, 1600, 800, CLOUD), rect(0, 0, 1600, 800, marks))
    wedge = [(700, 0), (1600, 0), (1600, 800), (1215, 800)]
    a.add(poly(wedge, a.lin([(0, RED_HI), (1, RED_DARK)], 0, 0, 1, 1)),
          sheen(a, 700, 0, 900, 800, clip=poly(wedge, "#000"), dur=9, a=0.14),
          poly([(650, 0), (672, 0), (1187, 800), (1165, 800)], INK))
    streak = keyframes("streak", "0%{transform:translateX(120px);opacity:0}20%{opacity:.5}100%{transform:translateX(-160px);opacity:0}")
    for i, (x0, y0, w) in enumerate(((600, 452, 100), (620, 500, 80), (590, 560, 110), (630, 618, 70))):
        a.add(anim(line(x0, y0, x0 + w, y0, INK, 4, stroke_linecap="round"), streak, 1.1, "linear", i * 0.27))
    roll = keyframes("roll70", "to{stroke-dashoffset:70}")
    a.add(line(600, 716, 1600, 716, "#ffffff", 6, opacity=0.55, stroke_dasharray="40 30",
               style=motion(roll, 0.35, "linear")))
    bounce = keyframes("vanbounce", "0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}")
    a.add(shadow(a, 1110, 692, 420, a=0.4), anim(van(a, 720, 690, 1.3, lights=True, moving=True), bounce, 0.5))
    a.add(lockup(110, 130, 28, light=False),
          text(110, 290, "Mobile", 76, INK, 700, letter_spacing="-1.5"),
          text(110, 372, "Security Unit", 76, INK, 700, letter_spacing="-1.5"),
          text(110, 440, "Nationwide patrols in signed,", 24, GREY, 500),
          text(110, 474, "liveried vans. A visible deterrent", 24, GREY, 500),
          text(110, 508, "at a lower cost than a full-time post.", 24, GREY, 500),
          mono(110, 590, "CALL THE CONTROL ROOM 24/7", 15, FAINT),
          text(110, 646, "01253 982 211", 48, RED, 800, letter_spacing="1"))
    return a


def construction_poster():
    a = Art(1600, 900, "Construction security: how to secure your site")
    a.add(rect(0, 0, 1600, 330, a.lin([(0, RED_HI), (1, RED_DEEP)], 0, 0, 1, 1)),
          sheen(a, 0, 0, 1600, 330, dur=9, a=0.12),
          mark(1380, 140, 360, WHITE, opacity=0.08),
          houses(a, 760, 330, 4, 120, 80, 30, "#5c0a0a", "#3a0505", "#6a1010"),
          crane(1240, 330, 230, 300, 120, "#5c0a0a", sw=2.4, load=False),
          text(110, 150, "CONSTRUCTION SECURITY", 64, WHITE, 800, letter_spacing="1"),
          text(110, 212, "How to secure your site", 36, WHITE, 500, opacity=0.88))
    a.add(rect(0, 330, 1600, 430, CLOUD))
    cards = [("survey", "Full site survey", ["Blind spots and weak", "areas mapped first."]),
             ("cctv", "On-site CCTV", ["Cameras to back up", "your existing team."]),
             ("patrol", "Perimeter patrols", ["Regular fence checks", "and a visible presence."]),
             ("clock", "24/7 cover", ["Day, night and", "weekend cover."])]
    for i, (ic, title, desc) in enumerate(cards):
        x, y = 110 + i * 360, 380
        a.add(rect(x + 4, y + 8, 300, 330, "#000", rx=22, opacity=0.05), rect(x, y, 300, 330, WHITE, rx=22),
              mono(x + 28, y + 50, f"0{i + 1}", 18, RED, 700),
              anim(circle(x + 60, y + 118, 38, "none", stroke=RED, stroke_width=3), "ring", 4, "ease-out", 4 - i),
              anim(circle(x + 60, y + 118, 38, RED) + icon(ic, x + 33, y + 91, 54, WHITE, 3.2), bob(-7), 2.4,
                   delay=2.4 - i * 0.35),
              text(x + 28, y + 222, title, 24, INK, 700),
              text(x + 28, y + 262, desc[0], 17, GREY, 500), text(x + 28, y + 288, desc[1], 17, GREY, 500))
    a.add(call_bar(760))
    return a


def lock_unlock_poster():
    a = Art(1600, 900, "Lock and unlock service")
    a.add(rect(0, 0, 1600, 760, a.lin([(0, "#1a1a1e"), (1, "#0b0b0d")])),
          poly([(960, 0), (1100, 0), (1589, 760), (1449, 760)], RED, opacity=0.9),
          anim(a.glow(1180, 420, 400, RED, 0.34), "glowpulse", 6), lock_plate(a, 1180, 470, 0.92))
    a.add(text(110, 190, "LOCK AND", 72, WHITE, 800), text(110, 272, "UNLOCK SERVICE", 72, WHITE, 800),
          text(110, 350, "Officers open and close your premises at", 24, "#c7c7cc", 500),
          text(110, 386, "the start and end of the day, so the keys", 24, "#c7c7cc", 500),
          text(110, 422, "are never left with one member of staff.", 24, "#c7c7cc", 500))
    for i, item in enumerate(["SIA-licensed officers", "Signed, liveried vehicles",
                              "Alongside key holding and alarm response"]):
        y = 506 + i * 50
        a.add(path(f"M110 {y - 8}L118 {y}L134 {y - 18}", stroke=RED_HI, stroke_width=4, stroke_linecap="round",
                   stroke_linejoin="round", stroke_dasharray="40", style=motion(draw(40), 4, delay=4 - i * 0.4)),
              text(152, y, item, 22, WHITE, 600, opacity=0.92))
    a.add(call_bar(760))
    return a


def rapidetect_poster():
    a = Art(1600, 900, "RapiDetect solar-powered protection tower")
    slab = [(980, 0), (1600, 0), (1600, 900), (1560, 900)]
    a.add(rect(0, 0, 1600, 900, WHITE),
          poly(slab, a.lin([(0, RED_HI), (1, RED_DARK)], 0, 0, 1, 1)),
          sheen(a, 980, 0, 620, 900, clip=poly(slab, "#000"), dur=8, a=0.16),
          poly([(930, 0), (950, 0), (1530, 900), (1510, 900)], INK))
    a.add(shadow(a, 1240, 842, 220, a=0.45), coverage(a, 1240, 842, 300, rings=2, color=WHITE),
          tower(a, 1240, 840, 1.22))
    for k, r in enumerate((40, 66, 92)):
        a.add(anim(path(f"M{n(1230 - r * 0.8)} {n(205 - r * 0.6)}A{r} {r} 0 0 1 {n(1230 + r * 0.8)} {n(205 - r * 0.6)}",
                        stroke=WHITE, stroke_width=4, stroke_linecap="round"), "pulse", 1.8, delay=1.8 - k * 0.3))
    a.add(lockup(110, 120, 26, light=False),
          text(110, 282, "RapiDetect", 96, INK, 800, font_style="italic", letter_spacing="-2"),
          text(110, 336, "SOLAR-POWERED PROTECTION", 34, RED, 800, letter_spacing="1"),
          text(110, 400, "The ideal security solution for outdoor", 24, GREY, 500),
          text(110, 434, "sites without existing infrastructure.", 24, GREY, 500))
    for i, item in enumerate(["External siren with adjustable sound", "4 motion detectors with cameras",
                              "4 solar panels and a controller", "60 metre radius coverage",
                              "Monitored 24 hours, with rapid dispatch"]):
        y = 506 + i * 42
        a.add(anim(rect(110, y - 13, 12, 12, RED_HI, rx=2), "glowpulse", 2.5, delay=2.5 - i * 0.4),
              text(140, y, item, 21, INK, 500))
    a.add(text(110, 778, "Call 01253 982211", 24, INK, 800),
          text(110, 810, "newconceptsecurity.co.uk", 18, FAINT, 500))
    return a


def standalone_poster():
    a = Art(1600, 900, "Stand alone camera units: rapid dispatch, remote security, active monitoring, monitored 24 hours")
    a.add(rect(0, 0, 1600, 900, a.lin([(0, "#232326"), (1, "#121214")], 0, 0, 1, 1)),
          poly([(820, 0), (860, 0), (1442, 900), (1402, 900)], RED, opacity=0.6),
          poly([(890, 0), (900, 0), (1482, 900), (1472, 900)], RED_HI, opacity=0.5),
          anim(a.glow(1230, 520, 420, RED, 0.34), "glowpulse", 6))
    a.add(rect(0, 760, 1600, 140, "#000", opacity=0.25),
          coverage(a, 1230, 800, 330), tower(a, 1230, 800, 1.1))
    for k, r in enumerate((38, 62, 86)):
        a.add(anim(path(f"M{n(1221 - r * 0.8)} {n(240 - r * 0.6)}A{r} {r} 0 0 1 {n(1221 + r * 0.8)} {n(240 - r * 0.6)}",
                        stroke=WHITE, stroke_width=4, stroke_linecap="round"), "pulse", 1.8, delay=1.8 - k * 0.3))
    a.add(lockup(1200, 96, 22),
          text(110, 170, "STAND ALONE", 72, RED_HI, 800), text(110, 250, "CAMERA UNITS", 72, RED_HI, 800),
          mono(110, 310, "RAPID DISPATCH // REMOTE SECURITY", 20, WHITE, opacity=0.85),
          mono(110, 340, "ACTIVE MONITORING // 24 HR MONITORED", 20, WHITE, opacity=0.85))
    feats = [("siren", "External siren", "Wireless, adjustable sound"),
             ("motion", "4 motion detectors", "Each with a camera"),
             ("solar", "4 solar panels", "Controller for steady power"),
             ("radius", "60 m coverage", "Rapid deployment")]
    for i, (ic, title, sub) in enumerate(feats):
        x, y = 110 + (i % 2) * 380, 430 + (i // 2) * 130
        a.add(anim(circle(x + 36, y + 36, 36, "none", stroke=RED_HI, stroke_width=3), "ring", 4, "ease-out", 4 - i),
              circle(x + 36, y + 36, 36, RED_HI), icon(ic, x + 12, y + 12, 48, WHITE, 3),
              text(x + 92, y + 32, title, 21, WHITE, 700), text(x + 92, y + 60, sub, 16, SILVER, 500))
    a.add(text(110, 760, "CALL TODAY", 34, WHITE, 800, letter_spacing="1"),
          text(110, 830, "01253 982 211", 60, RED_HI, 800, letter_spacing="1"))
    return a
