"""Build storyboard/index.html from the same edl.json + cues.json the edit uses.

    python3 tools/build_storyboard.py

Thumbnails come from storyboard/frames/<shot>.jpg (grabbed from the final render)
and are inlined as data URIs so the page is a single self-contained file.
"""
import base64
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "remotion", "src")
SB = os.path.join(ROOT, "storyboard")
edl = json.load(open(os.path.join(SRC, "edl.json")))
cues = json.load(open(os.path.join(SRC, "cues.json")))
FPS = edl["fps"]

# Per-shot creative notes: what the shot is, plus the effects / b-roll treatment.
NOTES = {
    "intro": ("Living room, first time standing in skates", "HyperFrames title card <b>HER FIRST / STREET RIDE</b> over a 0.5× slow push-in, darkened for legibility. Camcorder chrome (REC, DAY 01, timecode) and a warm light leak."),
    "salute": ("Close-up: pout, then a salute and a big grin", "0.8× speed. Punch-in zoom lands on the salute. Sticker pops in on the grin."),
    "wobble": ("Driveway, arms out, finding balance", "Subtle handheld wobble on the frame to sell the nerves. Heartbeat kick starts in the music."),
    "wheels": ("<b>B-roll</b>: tight crop on the pink skates", "2.2–2.5× crop of the driveway shot at 0.6× slow-mo, framed with a B-ROLL tag. Handwritten notes type on."),
    "glide": ("First real glide down the path", "Slow push-in. Whoosh into the shot."),
    "thumbs": ("Thumbs up to camera", "0.75× speed, punch-in on the stamp hit. Under the stamp: the HyperFrames LEVEL 02 card wipes in to hide the cut to the street."),
    "market": ("Skating past the food stalls", "Letterbox bars slide in and the grade changes from warm home video to a punchier street look. Music drops into the full beat. Location tag."),
    "chairs": ("Weaving between plastic chairs", "Whip-blur transition in, slow lateral pan."),
    "close1": ("A man carries chairs across her path", "Push-in builds toward the freeze."),
    "closeFz": ("<b>Freeze frame</b>: the near miss", "1 s freeze with shutter click and impact, white flash, camera shake, red multiply tint, RGB-split <b>CLOSE CALL!</b>"),
    "close2": ("She slips past and keeps going", "Freeze releases straight back into motion."),
    "weave": ("Clothes stalls, then down the alley", "Anime speed lines over the shot. Three-beat caption. A riser starts building toward the jump."),
    "approach": ("Run-up to the crates", "Heavier speed lines, push-in."),
    "fly": ("The jump over the crates", "<b>Speed ramp to 0.45×</b>. Drums drop out and a pad swells; on the peak, a white flash, a boom and a giant RGB-split <b>FLY!</b>"),
    "land": ("Landing on the crates", "Back to 1×; impact, camera shake and flash on touchdown. The beat comes back."),
    "landFz": ("<b>Freeze frame</b>: the landing as a polaroid", "Still drops in as a tilted polaroid over a blurred copy of itself, with a flash, shutter sound and a <b>STUCK IT! 10/10</b> stamp."),
    "after": ("Steps off, catching her breath", "Gentle push-in."),
    "crowd": ("<b>B-roll</b>: the onlookers by the crates", "Cutaway used as a reaction shot, with a B-ROLL tag and an AUDIENCE location tag."),
    "split": ("<b>B-roll</b>: DAY 1 vs TODAY split screen", "Driveway wobble (sepia) and street weave (punchy grade) slide in from both sides. Light leak."),
    "finale": ("One more pass through the market", "0.75× speed, slow push."),
    "outro": ("Last frame, blurred out behind the end card", "HyperFrames <b>KEEP ROLLING</b> end card with a pink burst. Final chord rings out, then fade to black."),
}

# --- timeline ---------------------------------------------------------------
shots, frame = [], 0
for s in edl["segments"]:
    d = s.get("dur") or (s["out"] - s["in"]) / s["rate"]
    n = round(d * FPS)
    shots.append({**s, "t0": frame / FPS, "t1": (frame + n) / FPS})
    frame += n
TOTAL = frame / FPS


def tc(t):
    return f"{int(t // 60):02d}:{t % 60:05.2f}"


def by_seg(items, sid):
    return [x for x in items if x["seg"] == sid]


def img(sid):
    p = os.path.join(SB, "frames", f"{sid}.jpg")
    return "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode()


def caption_html(c):
    t = html.escape(c["text"])
    h = html.escape(c.get("hl", ""))
    return t.replace(h, f"<mark>{h}</mark>") if h else t


SFX_NAMES = {"pop": "pop", "ding": "ding", "freeze": "shutter + impact", "boom": "boom", "whoosh": "whoosh",
             "whooshSoft": "soft whoosh", "riser": "riser", "impact": "impact"}

cards = []
for i, s in enumerate(shots, 1):
    sid = s["id"]
    what, fx = NOTES[sid]
    caps = by_seg(cues["captions"], sid)
    seen, cap_lines = set(), []
    for c in caps:
        if c["text"] in seen:
            continue
        seen.add(c["text"])
        cap_lines.append(f"<p class=\"line\">{caption_html(c)}</p>")
    hls = by_seg(cues["highlights"], sid)
    ovs = by_seg(cues["overlays"], sid)
    sfx = [SFX_NAMES[h["sfx"]] for h in hls if h.get("sfx")] + [SFX_NAMES[o["sfx"]] for o in ovs if o.get("sfx")] + [SFX_NAMES[x["type"]] for x in by_seg(cues["sfx"], sid)]
    kind = s["kind"]
    if kind in ("video", "broll"):
        src = f"{'home' if s['src'] == 'home' else 'street'} clip · {s['in']:.2f}–{s['out']:.2f}s"
        speed = "" if s["rate"] == 1 else f"<span class=\"chip speed\">{s['rate']}×</span>"
    elif kind == "freeze":
        src, speed = "still frame", "<span class=\"chip speed\">hold</span>"
    else:
        src, speed = "home + street clips", ""
    tag = {"broll": "B-roll", "freeze": "Freeze", "split": "B-roll"}.get(kind, "")
    tag_html = f"<span class=\"chip kind\">{tag}</span>" if tag else ""
    hl_html = "".join(f"<span class=\"hl hl-{h['type']}\">{html.escape(h['text'])}</span>" for h in hls)
    ov_html = "".join(f"<span class=\"hl hl-hf\">HyperFrames · {html.escape(o['src'].split('/')[-1].replace('.webm', ''))}</span>" for o in ovs)
    cards.append(f"""
    <article class="shot act{s['act']}" id="shot-{sid}">
      <div class="thumb"><img src="{img(sid)}" alt="Shot {i}: {html.escape(what.replace('<b>', '').replace('</b>', ''))}" loading="lazy"><span class="num">{i:02d}</span></div>
      <div class="meta">
        <div class="row"><span class="tc">{tc(s['t0'])} → {tc(s['t1'])}</span><span class="dur">{s['t1'] - s['t0']:.1f}s</span>{speed}{tag_html}</div>
        <h3>{what}</h3>
        <p class="src">{src}</p>
        {('<div class="block"><span class="lbl">Script</span>' + ''.join(cap_lines) + '</div>') if cap_lines else ''}
        {('<div class="block"><span class="lbl">On-screen</span><div class="hls">' + hl_html + ov_html + '</div></div>') if (hl_html or ov_html) else ''}
        <div class="block"><span class="lbl">Effects</span><p>{fx}</p></div>
        {('<div class="block"><span class="lbl">Sound</span><p class="sfx">' + ' · '.join(sfx) + '</p></div>') if sfx else ''}
      </div>
    </article>""")

# timeline strip
ticks = "".join(
    f"<a class=\"seg act{s['act']} k-{s['kind']}\" href=\"#shot-{s['id']}\" style=\"flex:{s['t1'] - s['t0']:.3f}\" title=\"{i:02d} · {s['id']} · {tc(s['t0'])}\"><span>{i:02d}</span></a>"
    for i, s in enumerate(shots, 1)
)
act2_t = next(s["t0"] for s in shots if s["act"] == 2)

# plain VO script
script_rows = []
seen = set()
for c in cues["captions"]:
    if c["text"] in seen:
        continue
    seen.add(c["text"])
    t = next(s for s in shots if s["id"] == c["seg"])["t0"] + c["at"]
    script_rows.append(f"<li><span class=\"tc\">{tc(t)}</span><span>{html.escape(c['text'])}</span></li>")

page = f"""<title>Her First Street Ride</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Archivo:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Layout: production storyboard sheet: header, proportional timeline strip, then one card per shot in a 2-col grid */
:root {{
  --bg: #fbf7fa; --surface: #ffffff; --fg: #1a1030; --muted: #6b5f7a; --line: #e9dfe8;
  --pink: #e0237f; --pink-soft: #ffd3e8; --sky: #0f8fb8; --sky-soft: #d5f3ff;
  --act1: #f4b183; --act2: #ff4fa3;
  --display: "Anton", "Impact", "Arial Narrow", sans-serif;
  --hand: "Permanent Marker", "Comic Sans MS", cursive;
  --body: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #140e22; --surface: #1d1630; --fg: #f6eef7; --muted: #a99bb8; --line: #2f2645;
  --pink: #ff6fb3; --pink-soft: #4a1c38; --sky: #7fe0ff; --sky-soft: #173847; --act1: #d98b57; --act2: #ff4fa3; color-scheme: dark }} }}
:root[data-theme="dark"] {{
  --bg: #140e22; --surface: #1d1630; --fg: #f6eef7; --muted: #a99bb8; --line: #2f2645;
  --pink: #ff6fb3; --pink-soft: #4a1c38; --sky: #7fe0ff; --sky-soft: #173847; --act1: #d98b57; --act2: #ff4fa3; color-scheme: dark }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 15px; line-height: 1.5; }}
.wrap {{ max-width: 1240px; margin: 0 auto; padding-block: 40px 80px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 40px; }}
.wrap > * {{ min-width: 0; }}
header {{ display: grid; gap: 14px; }}
.kicker {{ font-family: var(--hand); color: var(--sky); font-size: 22px; transform: rotate(-2deg); transform-origin: left; }}
h1 {{ font-family: var(--display); font-weight: 400; text-transform: uppercase; font-size: clamp(48px, 9vw, 112px); line-height: .9; margin: 0; letter-spacing: .005em; text-wrap: balance; }}
h1 span {{ background: var(--act2); color: #1a1030; padding: 0 .12em; display: inline-block; transform: rotate(-1.2deg); }}
.logline {{ max-width: 64ch; font-size: 17px; color: var(--muted); margin: 0; }}
.specs {{ display: flex; flex-wrap: wrap; gap: 8px 18px; font-family: var(--mono); font-size: 12.5px; color: var(--muted); }}
.specs b {{ color: var(--fg); font-weight: 500; }}
h2 {{ font-family: var(--display); font-weight: 400; text-transform: uppercase; font-size: 30px; margin: 0 0 14px; letter-spacing: .02em; }}
.strip-wrap {{ overflow-x: auto; }}
.strip {{ display: flex; gap: 2px; min-width: 720px; height: 46px; }}
.seg {{ display: flex; align-items: flex-end; padding: 0 0 4px 4px; text-decoration: none; color: #1a1030; font-family: var(--mono); font-size: 10px; border-radius: 3px; min-width: 0; overflow: hidden; }}
.seg.act1 {{ background: var(--act1); }} .seg.act2 {{ background: var(--act2); }}
.seg.k-broll, .seg.k-split {{ background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.45) 0 4px, transparent 4px 9px); }}
.seg.k-freeze {{ background: var(--sky); }}
.seg:hover, .seg:focus-visible {{ outline: 2px solid var(--fg); outline-offset: 1px; }}
.acts {{ display: flex; min-width: 720px; margin-top: 6px; font-family: var(--mono); font-size: 11.5px; color: var(--muted); }}
.legend {{ display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font-size: 12.5px; color: var(--muted); }}
.legend i {{ display: inline-block; width: 12px; height: 12px; border-radius: 2px; vertical-align: -1px; margin-right: 6px; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap: 18px; }}
.act-head {{ grid-column: 1 / -1; display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-top: 10px; }}
.act-head h2 {{ margin: 0; }}
.act-head p {{ margin: 0; color: var(--muted); }}
.shot {{ background: var(--surface); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; display: grid; grid-template-columns: minmax(0, 44%) minmax(0, 1fr); }}
.thumb {{ position: relative; align-self: start; padding: 10px 0 10px 10px; }}
.thumb img {{ width: 100%; height: auto; display: block; aspect-ratio: 16/9; border-radius: 6px; background: #000; }}
.num {{ position: absolute; left: 18px; top: 18px; font-family: var(--display); font-size: 22px; color: #fff; background: rgba(26,16,48,.75); padding: 0 8px; border-radius: 4px; }}
.act1 .num {{ box-shadow: inset 0 -3px 0 var(--act1); }} .act2 .num {{ box-shadow: inset 0 -3px 0 var(--act2); }}
.meta {{ padding: 14px 16px 16px; display: grid; gap: 8px; align-content: start; min-width: 0; }}
.row {{ display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }}
.tc {{ font-family: var(--mono); font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }}
.dur {{ font-family: var(--mono); font-size: 12px; font-weight: 500; }}
.chip {{ font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }}
.chip.speed {{ background: var(--sky-soft); color: var(--sky); }}
.chip.kind {{ background: var(--pink-soft); color: var(--pink); }}
h3 {{ margin: 0; font-size: 16px; line-height: 1.3; font-weight: 600; text-wrap: balance; }}
h3 b {{ font-weight: 800; }}
.src {{ margin: 0; font-family: var(--mono); font-size: 11.5px; color: var(--muted); }}
.block {{ display: grid; gap: 3px; }}
.lbl {{ font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }}
.block p {{ margin: 0; font-size: 13.5px; }}
.line {{ font-weight: 600; font-size: 15px !important; }}
mark {{ background: var(--act2); color: #1a1030; padding: 0 .2em; border-radius: 3px; }}
.hls {{ display: flex; flex-wrap: wrap; gap: 6px; }}
.hl {{ font-size: 12px; font-weight: 800; letter-spacing: .04em; padding: 3px 9px; border-radius: 6px; border: 1.5px solid var(--line); }}
.hl-sticker {{ background: var(--pink-soft); border-color: var(--pink); color: var(--pink); }}
.hl-stamp {{ border-color: var(--sky); color: var(--sky); transform: rotate(-2deg); }}
.hl-bigword {{ font-family: var(--display); font-weight: 400; font-size: 16px; letter-spacing: .03em; background: var(--fg); color: var(--bg); border-color: var(--fg); }}
.hl-note {{ font-family: var(--hand); font-weight: 400; color: var(--sky); border-style: dashed; }}
.hl-location {{ color: var(--fg); }}
.hl-location::before {{ content: "● "; color: var(--pink); }}
.hl-hf {{ background: var(--sky-soft); border-color: var(--sky); color: var(--sky); }}
.sfx {{ font-family: var(--mono); font-size: 12px !important; color: var(--muted); }}
.two {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: 32px; }}
.script {{ list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }}
.script li {{ display: grid; grid-template-columns: 70px 1fr; gap: 12px; padding: 7px 0; border-bottom: 1px dashed var(--line); font-size: 15.5px; }}
.kit {{ display: grid; gap: 14px; }}
.kit div {{ display: grid; gap: 2px; }}
.kit h4 {{ margin: 0; font-size: 14px; font-weight: 800; }}
.kit p {{ margin: 0; color: var(--muted); font-size: 14px; max-width: 60ch; }}
code {{ font-family: var(--mono); font-size: 12.5px; background: var(--sky-soft); padding: 1px 5px; border-radius: 4px; }}
@media (max-width: 640px) {{ .shot {{ grid-template-columns: 1fr; }} .thumb {{ padding: 10px 10px 0; }} }}
@media (prefers-reduced-motion: reduce) {{ * {{ scroll-behavior: auto; }} }}
</style>
<div class="wrap">
  <header>
    <div class="kicker">a rollerblade diary · storyboard</div>
    <h1>Her first <span>street ride</span></h1>
    <p class="logline">A girl in a pink helmet goes from wobbling on her driveway to flying over crates in a busy market street. She tells it herself, in first person, through on-screen script lines, with stickers and stamps marking each win.</p>
    <div class="specs"><span><b>{TOTAL:.1f}s</b> runtime</span><span><b>{len(shots)}</b> shots</span><span><b>1920×1080</b> · {FPS} fps</span><span><b>2</b> source clips</span><span>Edit: <b>Remotion</b></span><span>Title / chapter / end cards: <b>HyperFrames</b></span></div>
  </header>

  <section>
    <h2>Timeline</h2>
    <div class="strip-wrap">
      <div class="strip">{ticks}</div>
      <div class="acts"><span style="flex:{act2_t:.2f}">Act 1 · The driveway · 0:00</span><span style="flex:{TOTAL - act2_t:.2f}">Act 2 · The street · {tc(act2_t)}</span></div>
    </div>
    <div class="legend"><span><i style="background:var(--act1)"></i>Act 1 shot</span><span><i style="background:var(--act2)"></i>Act 2 shot</span><span><i style="background:var(--sky)"></i>Freeze frame</span><span><i style="background:repeating-linear-gradient(135deg,var(--muted) 0 3px,transparent 3px 6px)"></i>B-roll</span></div>
  </section>

  <section class="grid">
    <div class="act-head"><h2>Act 1 · The driveway</h2><p>Home-video look: camcorder frame, warm grade, soft music.</p></div>
    {''.join(c for c, s in zip(cards, shots) if s['act'] == 1)}
    <div class="act-head"><h2>Act 2 · The street</h2><p>Letterboxed, punchier grade, full beat, whips, freezes and a speed ramp.</p></div>
    {''.join(c for c, s in zip(cards, shots) if s['act'] == 2)}
  </section>

  <section class="two">
    <div>
      <h2>Her script</h2>
      <ol class="script">{''.join(script_rows)}</ol>
    </div>
    <div class="kit">
      <h2>How it's built</h2>
      <div><h4>HyperFrames: title, chapter and end cards</h4><p>Three GSAP compositions (<code>intro</code>, <code>chapter</code>, <code>outro</code>) rendered as transparent WebM and layered into the edit.</p></div>
      <div><h4>Remotion: the edit</h4><p>Cuts, speed ramps, freezes, split screen, camera moves, script captions with word pop-in and highlight swipe, stickers and stamps, speed lines, flashes, letterbox, camcorder frame, grain and vignette. All timing comes from <code>edl.json</code> and <code>cues.json</code>.</p></div>
      <div><h4>Sound</h4><p>Music bed (120 BPM, I–vi–IV–V) and every SFX are synthesised from code and timed to the same cue sheet: whooshes, pops, ding, shutter, impacts, riser and boom. The original location sound sits low underneath. The final mix is loudness-normalised to −14 LUFS.</p></div>
      <div><h4>B-roll</h4><p>Cut from the supplied footage: the skate close-up crop, the crowd reaction cutaway, the polaroid freeze and the DAY 1 / TODAY split screen.</p></div>
    </div>
  </section>
</div>
"""

open(os.path.join(SB, "index.html"), "w").write(page)
print("wrote", os.path.join(SB, "index.html"), f"{len(page) / 1024:.0f} KB")
