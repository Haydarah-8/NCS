# Coded illustrations

Every photo and poster on the site is an SVG drawn in code by these scripts and
written to `public/images/art/`. Python 3 is all they need: no packages.

```bash
python scripts/art/build.py
```

Pass names to render only some, for example `python scripts/art/build.py fleet-night`,
or `--out <dir>` to write somewhere else to compare before replacing.

Each image is written twice: `name.svg` for white and light grey sections, and
`name-dark.svg` for black ones. Both have a transparent background, and the
edges fade out, so the drawing melts into whatever section it sits on. On the
site, `artSrc(src, tone)` in `lib/art.ts` picks the right one from the section's
tone.

| File | What it draws |
| --- | --- |
| `lib.py` | Shared pieces: brand colours, the NC mark and wordmark, keyframes and animation helpers, icons, the solar tower and the lock plate |
| `minimal.py` | The flat, minimal scenes, plus `Tone` (the light and dark palettes) and `fade()` (the soft edges) |
| `minimal_posters.py` | About page banners, the careers banner, and the service posters |
| `build.py` | Maps each output file name to the function that draws it |
| `scenes_a.py`, `scenes_b.py`, `scenes_c.py`, `posters.py` | The earlier, more detailed style. `build.py` no longer uses them; they are kept for reference |

Brand colours live at the top of `lib.py` (`RED = "#a01010"` and friends), and
the greys for each tone live in `Tone` in `minimal.py`, so a change there carries
through every image. Phone numbers and other copy on the posters are plain
strings in `minimal_posters.py` (`_phone`).

## Keeping it minimal

- Draw with a few flat shapes in the `Tone` colours, with red only for the brand
  and for things that need to catch the eye. No glows, gradients or textures.
- Wrap backdrops in `fade(a, content, left, right, top, bottom)` and draw them
  full width, so nothing ends in a hard edge inside the fade.
- Every scene takes the tone `t` and uses `t.ink`, `t.soft`, `t.line` and the
  rest, never fixed greys, so the light and dark versions both work.

## Animation

Every image loops like a short video using CSS keyframes inside the SVG, so it
plays in a normal `<img>` tag with no JavaScript. Visitors who set "reduce
motion" in their system settings get a still image.

- `KF` in `lib.py` holds the shared keyframes (`blink`, `pulse`, `breathe`,
  `ring`, `strobeA`/`strobeB`, `flicker`, `spin` and so on). `sway()`, `drift()`,
  `bob()`, `draw()` and `sweep()` create parameterised ones.
- `anim(content, name, seconds, origin=(x, y))` wraps any drawing in a looping
  animation. `origin` is the pivot in local coordinates; leave it out to pivot
  on the shape's centre. Delays are negative so loops start mid-cycle.
- Only the keyframes an image uses are written into it.

Every animated image is redrawn in full on each frame, so keep heavy scenes
(like the event crowd) lean. Animating a few groups is cheap; animating hundreds
of small shapes is not.
