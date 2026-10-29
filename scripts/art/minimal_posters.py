"""Minimal banners and service posters on transparent backgrounds, in light and dark tones."""
from lib import *  # noqa: F401,F403
from minimal import fade, floor_shadow, ground, person, van_m


def _phone(t, x, y, size=34):
    return (text(x, y - size * 1.25, "Call today", size * 0.5, t.soft, 600)
            + text(x, y, "01253 982 211", size, RED, 800, letter_spacing="0.5"))


def generation(t):
    a = Art(1600, 660, "The new generation of security. The North West's leading provider of security services.")
    s = [mark(176, 170, 104, RED),
         text(120, 330, "The new generation", 64, t.ink, 700, letter_spacing="-1.5"),
         text(120, 404, "of security.", 64, t.ink, 700, letter_spacing="-1.5"),
         text(120, 466, "The North West's leading provider of security services.", 24, t.soft, 500),
         ground(t, 560, 820, 1600), van_m(a, t, 860, 560, 0.86),
         floor_shadow(a, t, 1450, 566, 80), person(t, 1450, 566, 360, "uniform", "radio", SKINS[1])]
    a.add(fade(a, "".join(s), 0, 0.06, 0, 0))
    return a


def approved_contractor(t):
    a = Art(1600, 800, "SIA Approved Contractor. The objective of the scheme is to raise performance standards "
                       "and to assist the private security industry in developing new opportunities.")
    shield = "M0 -170L140 -120L140 10Q140 120 0 190Q-140 120 -140 10L-140 -120Z"
    a.add(anim(circle(400, 400, 236, "none", stroke=t.line, stroke_width=2, stroke_dasharray="4 14"), "spin", 40, "linear"),
          at(400, 390, 1.0, path(shield, "none", stroke=t.ink, stroke_width=6, stroke_linejoin="round")),
          at(400, 390, 0.84, path(shield, RED)),
          path("M340 392L385 438L470 344", stroke=WHITE, stroke_width=24, stroke_linecap="round", stroke_linejoin="round",
               stroke_dasharray="200", style=motion(draw(200), 5)),
          text(780, 290, "“The objective of the scheme is to", 34, t.ink, 600, letter_spacing="-0.5"),
          text(780, 338, "raise performance standards and to", 34, t.ink, 600, letter_spacing="-0.5"),
          text(780, 386, "assist the private security industry in", 34, t.ink, 600, letter_spacing="-0.5"),
          text(780, 434, "developing new opportunities.”", 34, t.ink, 600, letter_spacing="-0.5"),
          rect(780, 478, 80, 4, RED),
          text(780, 528, "Security Guarding · Door Supervision · Key Holding", 22, t.soft, 600),
          mono(780, 568, "ACS REFERENCE  NECOSESC01", 16, t.soft))
    return a


def careers_banner(t):
    a = Art(1600, 840, "Start your career in security with New Concept")
    s = [mark(1180, 430, 760, RED),
         person(t, 1180, 1210, 990, "suit", "side", SKINS[2]),
         text(110, 300, "Start your career", 72, t.ink, 700, letter_spacing="-1.5"),
         text(110, 384, "in security.", 72, t.ink, 700, letter_spacing="-1.5"),
         text(110, 452, "SIA licensed roles in guarding, patrols, door supervision,", 24, t.soft, 500),
         text(110, 488, "events, healthcare and key holding.", 24, t.soft, 500),
         rect(110, 548, 262, 50, "none", rx=25, stroke=RED, stroke_width=2),
         circle(138, 573, 5, RED_GLOW, style=motion("blink", 1.4, "linear")),
         text(156, 580, "NOW RECRUITING", 17, RED, 800, letter_spacing="3")]
    a.add(fade(a, "".join(s), 0, 0.04, 0, 0.18))
    return a


def mobile_unit_poster(t):
    a = Art(1600, 800, "Mobile security unit: nationwide patrols in signed, liveried vans")
    roll = keyframes("roll70", "to{stroke-dashoffset:70}")
    bounce = keyframes("vanbounce", "0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}")
    s = [text(110, 260, "Mobile", 72, t.ink, 700, letter_spacing="-1.5"),
         text(110, 340, "Security Unit.", 72, t.ink, 700, letter_spacing="-1.5"),
         text(110, 404, "Nationwide patrols in signed, liveried vans.", 24, t.soft, 500),
         text(110, 438, "A visible deterrent at a lower cost.", 24, t.soft, 500),
         _phone(t, 110, 560),
         line(760, 676, 1600, 676, t.line, 4, stroke_dasharray="40 30", style=motion(roll, 0.35, "linear")),
         anim(van_m(a, t, 820, 650, 1.18, moving=True), bounce, 0.5)]
    a.add(fade(a, "".join(s), 0, 0.08, 0, 0))
    return a


def construction_poster(t):
    a = Art(1600, 900, "Construction security: how to secure your site")
    s = [text(110, 170, "Construction security.", 64, t.ink, 700, letter_spacing="-1.5"),
         text(110, 226, "How to secure your site.", 30, t.soft, 500)]
    cards = [("survey", "Full site survey", "Blind spots mapped first."),
             ("cctv", "On-site CCTV", "Backs up your team."),
             ("patrol", "Perimeter patrols", "A visible presence."),
             ("clock", "24/7 cover", "Day, night, weekends.")]
    for i, (ic, title, desc) in enumerate(cards):
        x = 110 + i * 360
        s += [anim(icon(ic, x, 340, 72, RED, 3), bob(-6), 2.6, delay=2.6 - i * 0.4),
              text(x, 480, title, 26, t.ink, 700), text(x, 516, desc, 19, t.soft, 500)]
    s += [rect(110, 600, 1380, 2, t.line), _phone(t, 110, 720, 40)]
    a.add("".join(s))
    return a


def lock_unlock_poster(t):
    a = Art(1600, 900, "Lock and unlock service")
    s = [text(110, 220, "Lock and unlock", 68, t.ink, 700, letter_spacing="-1.5"),
         text(110, 300, "service.", 68, t.ink, 700, letter_spacing="-1.5"),
         text(110, 370, "Officers open and close your premises,", 24, t.soft, 500),
         text(110, 404, "so the keys are never left with one person.", 24, t.soft, 500)]
    for i, item in enumerate(["SIA-licensed officers", "Signed, liveried vehicles", "Alongside key holding"]):
        y = 486 + i * 50
        s += [path(f"M110 {y - 8}L118 {y}L134 {y - 18}", stroke=RED, stroke_width=4, stroke_linecap="round",
                   stroke_linejoin="round", stroke_dasharray="40", style=motion(draw(40), 4, delay=4 - i * 0.4)),
              text(152, y, item, 22, t.ink, 600)]
    s += [_phone(t, 110, 760), lock_plate(a, 1180, 440, 0.86)]
    a.add("".join(s))
    return a


def rapidetect_poster(t):
    a = Art(1600, 900, "RapiDetect solar-powered protection tower")
    s = [text(110, 220, "RapiDetect", 88, t.ink, 800, font_style="italic", letter_spacing="-2"),
         text(110, 276, "Solar-powered protection.", 32, RED, 700),
         text(110, 340, "For outdoor sites without existing infrastructure.", 22, t.soft, 500)]
    for i, item in enumerate(["External siren, adjustable sound", "4 motion detectors with cameras",
                              "4 solar panels and a controller", "60 metre radius coverage", "Monitored 24 hours"]):
        y = 410 + i * 44
        s += [anim(rect(110, y - 13, 12, 12, RED, rx=2), "glowpulse", 2.5, delay=2.5 - i * 0.4),
              text(140, y, item, 21, t.ink, 500)]
    s += [_phone(t, 110, 760), ground(t, 820, 940, 1520),
          coverage(a, 1230, 820, 300, rings=2, color=RED), tower(a, 1230, 820, 1.18)]
    a.add(fade(a, "".join(s), 0, 0.05, 0, 0))
    return a


def standalone_poster(t):
    a = Art(1600, 900, "Stand alone camera units: rapid dispatch, remote security, active monitoring, monitored 24 hours")
    s = [text(110, 200, "Stand alone", 72, t.ink, 700, letter_spacing="-1.5"),
         text(110, 280, "camera units.", 72, t.ink, 700, letter_spacing="-1.5"),
         mono(110, 330, "RAPID DISPATCH · REMOTE SECURITY · 24 HR MONITORED", 17, t.soft)]
    feats = [("siren", "External siren", "Wireless, adjustable"), ("motion", "4 motion detectors", "Each with a camera"),
             ("solar", "4 solar panels", "Steady power"), ("radius", "60 m coverage", "Rapid deployment")]
    for i, (ic, title, sub) in enumerate(feats):
        x, y = 110 + (i % 2) * 360, 400 + (i // 2) * 130
        s += [anim(icon(ic, x, y, 56, RED, 3), bob(-5), 2.4, delay=2.4 - i * 0.4),
              text(x + 76, y + 26, title, 21, t.ink, 700), text(x + 76, y + 52, sub, 16, t.soft, 500)]
    s += [_phone(t, 110, 760), ground(t, 820, 940, 1520),
          coverage(a, 1230, 820, 300, rings=2, color=RED), tower(a, 1230, 820, 1.12)]
    a.add(fade(a, "".join(s), 0, 0.05, 0, 0))
    return a
