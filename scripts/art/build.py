"""Render the coded illustrations to public/images/art, in a light tone (<name>.svg) for white and grey
sections and a dark tone (<name>-dark.svg) for black sections.

    python scripts/art/build.py                     # every image, both tones
    python scripts/art/build.py fleet-night hero-skyline
    python scripts/art/build.py --out some/dir      # somewhere else, e.g. to compare
"""
import argparse
import os

import minimal
import minimal_posters as posters
from minimal import Tone

ART = {
    "hero-skyline": minimal.hero_skyline,
    "close-protection": minimal.close_protection,
    "site-officer": minimal.site_officer,
    "fleet-night": minimal.fleet_night,
    "security-personnel": minimal.security_personnel,
    "guarding": minimal.guarding,
    "mobile-patrols": minimal.mobile_patrols,
    "retail-guarding": minimal.retail_guarding,
    "site-security": minimal.site_security,
    "door-supervision": minimal.door_supervision,
    "event-security": minimal.event_security,
    "healthcare": minimal.healthcare,
    "key-holding": minimal.key_holding,
    "lock-unlock": minimal.lock_unlock,
    "cctv-control-room": minimal.cctv_control,
    "standalone-cameras": minimal.standalone_cameras,
    "fire-services": minimal.fire_services,
    "generation": posters.generation,
    "approved-contractor": posters.approved_contractor,
    "careers-banner": posters.careers_banner,
    "mobile-unit-poster": posters.mobile_unit_poster,
    "construction-poster": posters.construction_poster,
    "lock-unlock-poster": posters.lock_unlock_poster,
    "rapidetect-poster": posters.rapidetect_poster,
    "standalone-poster": posters.standalone_poster,
}

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render the New Concept Security illustrations.")
    parser.add_argument("names", nargs="*", metavar="name",
                        help="images to render (default: all): " + ", ".join(ART))
    parser.add_argument("--out", default=os.path.join(ROOT, "public", "images", "art"))
    args = parser.parse_args()
    unknown = [name for name in args.names if name not in ART]
    if unknown:
        parser.error("unknown image: " + ", ".join(unknown))
    os.makedirs(args.out, exist_ok=True)
    for name in args.names or ART:
        for tone, suffix in (("light", ""), ("dark", "-dark")):
            art = ART[name](Tone(tone))
            file = os.path.join(args.out, f"{name}{suffix}.svg")
            art.save(file)
        print(f"{name}  {art.w}x{art.h}  {os.path.getsize(os.path.join(args.out, name + '.svg')) // 1024} KB")
