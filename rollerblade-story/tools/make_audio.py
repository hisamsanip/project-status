"""Synthesise the music bed and SFX track for the rollerblade story.

Everything is generated procedurally with numpy (no samples, no licensing),
timed against the same edl.json / cues.json the Remotion composition reads.

    python3 tools/make_audio.py
writes remotion/public/audio/music.wav and remotion/public/audio/sfx.wav
"""
import json
import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "remotion", "src")
OUT = os.path.join(ROOT, "remotion", "public", "audio")
SR = 44100
rng = np.random.default_rng(7)

edl = json.load(open(os.path.join(SRC, "edl.json")))
cues = json.load(open(os.path.join(SRC, "cues.json")))
FPS = edl["fps"]

# --- timeline (same frame rounding as the TS side) -------------------------
starts, frame = {}, 0
for s in edl["segments"]:
    d = s.get("dur", None)
    if d is None:
        d = (s["out"] - s["in"]) / s["rate"]
    n = round(d * FPS)
    starts[s["id"]] = (frame / FPS, n / FPS)
    frame += n
TOTAL = frame / FPS


def at(seg, off=0.0):
    return starts[seg][0] + off


N = int(TOTAL * SR) + SR
t_all = np.arange(N) / SR


# --- helpers ------------------------------------------------------------------
def env_exp(n, decay):
    return np.exp(-np.arange(n) / SR / decay)


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# --- instruments --------------------------------------------------------------
def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.04)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(n, 0.12)


def clap():
    n = int(0.25 * SR)
    noise = rng.standard_normal(n)
    noise = noise - onepole_lp(noise, 900)  # high-pass-ish
    e = env_exp(n, 0.07)
    for k in (0.0, 0.011, 0.022):  # little flam = clap
        e[int(k * SR):] += 0.4 * env_exp(n - int(k * SR), 0.01)
    return noise * e * 0.5


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    noise = rng.standard_normal(n)
    noise = noise - onepole_lp(noise, 6000)
    return noise * env_exp(n, 0.06 if open_ else 0.015) * 0.35


def pluck(midi, length=0.45):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(midi)
    w = np.sign(np.sin(2 * np.pi * f * t)) * 0.35 + np.sin(2 * np.pi * f * t) * 0.65
    w += 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return w * env_exp(n, 0.16) * 0.22


def bass(midi, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = note_hz(midi)
    saw = 2 * ((f * t) % 1.0) - 1
    w = 0.7 * np.sin(2 * np.pi * f * t) + 0.3 * saw
    e = np.minimum(1, t / 0.005) * env_exp(n, length * 0.8)
    return w * e * 0.32


def pad(midis, length):
    n = int(length * SR)
    t = np.arange(n) / SR
    w = np.zeros(n)
    for m in midis:
        for det in (-0.12, 0.12):
            w += np.sin(2 * np.pi * note_hz(m + det) * t)
    a = np.minimum(1, t / 0.4) * np.minimum(1, (length - t) / 0.4).clip(0)
    return w * a * 0.03


# --- music --------------------------------------------------------------------
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
# I - vi - IV - V in C
CHORDS = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]
ROOTS = [36, 33, 29, 31]

drums = np.zeros(N)
keys = np.zeros(N)
low = np.zeros(N)
pads = np.zeros(N)

act2 = at("market")
fly0, fly1 = at("fly"), at("land")
land_hit = at("land", 0.38)
fz0, fz1 = at("closeFz"), at("close2")
lf0, lf1 = at("landFz"), at("after")
end_music = TOTAL - 0.2


def in_gap(t):
    return (fly0 - 0.05 <= t < land_hit) or (fz0 <= t < fz1) or (lf0 <= t < lf1)


bar_i = 0
t = 0.0
while t < end_music:
    ch = CHORDS[bar_i % 4]
    root = ROOTS[bar_i % 4]
    full = t >= act2 - 0.01
    # pads under everything, softer in act 1
    pads_len = min(BAR, end_music - t)
    place(pads, pad(ch, pads_len + 0.3), t, 1.0 if full else 0.8)
    for step in range(8):  # 8th notes
        ts = t + step * BEAT / 2
        if ts >= end_music:
            break
        # arpeggio (act 1: sparse, act 2: every 8th)
        if full or step % 2 == 0:
            if not in_gap(ts):
                m = ch[[0, 1, 2, 1][step % 4]] + (12 if step >= 4 else 0)
                place(keys, pluck(m), ts, 0.9 if full else 0.75)
        if ts >= at("wobble") and not full and step % 4 == 0 and not in_gap(ts):
            place(drums, kick(), ts, 0.45)  # heartbeat kick in act 1
        if full and not in_gap(ts):
            if step % 2 == 0:
                place(drums, kick(), ts, 0.95)
                place(low, bass(root, BEAT / 2), ts, 1.0)
            else:
                place(low, bass(root + 12, BEAT / 2), ts, 0.7)
            if step in (2, 6):
                place(drums, clap(), ts, 0.9)
            place(drums, hat(open_=(step % 2 == 1)), ts, 0.8 if step % 2 else 0.6)
        elif not full and step % 2 == 1 and ts >= at("wobble"):
            place(drums, hat(), ts, 0.4)
    t += BAR
    bar_i += 1

# final ring-out chord
place(pads, pad((48, 60, 64, 67, 72), 3.0) * 3, TOTAL - 3.2, 1.0)
place(keys, pluck(72, 2.0) * 1.2, TOTAL - 3.2, 1.0)

# filtered, slowed feel during the slow-mo jump: pad swells, everything else rests
swell = np.zeros(N)
n = int((land_hit - fly0) * SR)
tt = np.arange(n) / SR
for m in (48, 55, 60, 64, 67):
    swell[: n] += np.sin(2 * np.pi * note_hz(m) * tt)
swell[: n] *= (tt / tt[-1]) ** 1.5 * 0.05
pads += np.roll(swell, int(fly0 * SR))

music = drums * 0.9 + keys + low + pads
# overall fade in/out
music *= np.clip(t_all / 1.2, 0, 1)
music *= np.clip((TOTAL - t_all) / 0.8, 0, 1)


# --- SFX ----------------------------------------------------------------------
def whoosh(length=0.45, soft=False):
    n = int(length * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep a simple band by mixing two low-passes with moving cutoff (block-wise)
    out = np.zeros(n)
    blk = 256
    lp1 = lp2 = 0.0
    for i in range(0, n, blk):
        prog = i / n
        fc = 300 + 5000 * np.sin(np.pi * prog) ** 2
        a1 = np.exp(-2 * np.pi * fc / SR)
        a2 = np.exp(-2 * np.pi * fc * 0.35 / SR)
        for k in range(i, min(n, i + blk)):
            lp1 = (1 - a1) * noise[k] + a1 * lp1
            lp2 = (1 - a2) * noise[k] + a2 * lp2
            out[k] = lp1 - lp2
    e = np.sin(np.pi * tt / length) ** 2
    return out * e * (0.6 if soft else 1.1)


def impact():
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    f = 38 + 80 * np.exp(-tt / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.3)
    crack = rng.standard_normal(n) * env_exp(n, 0.02) * 0.5
    return (body + crack) * 0.9


def boom():
    out = impact() * 1.1
    w = whoosh(0.5, True) * 0.3
    off = int(0.02 * SR)
    out[off:off + len(w)] += w
    return out


def shutter():
    n = int(0.12 * SR)
    noise = rng.standard_normal(n)
    noise = noise - onepole_lp(noise, 2500)
    e = env_exp(n, 0.006)
    e[int(0.05 * SR):] += env_exp(n - int(0.05 * SR), 0.008)
    return noise * e * 0.8


def pop():
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    f = 500 + 900 * np.exp(-tt / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.04) * 0.5


def ding():
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    w = sum(np.sin(2 * np.pi * f * tt) * g for f, g in ((1318.5, 1), (1975.5, 0.5), (2637, 0.25)))
    w2 = sum(np.sin(2 * np.pi * f * tt) * g for f, g in ((1760, 1), (2637, 0.4)))
    out = w * env_exp(n, 0.35) * 0.18
    off = int(0.12 * SR)
    out[off:] += (w2 * env_exp(n, 0.45) * 0.2)[: n - off]
    return out


def riser(length):
    n = int(length * SR)
    tt = np.arange(n) / SR
    f = 200 * (8 ** (tt / length))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.08
    noise = rng.standard_normal(n)
    noise = noise - onepole_lp(noise, 1500)
    return (tone + noise * 0.12) * (tt / length) ** 2


sfx = np.zeros(N)


def fire(kind, t0, length=None):
    if kind == "whoosh":
        place(sfx, whoosh(), t0 - 0.18, 0.55)
    elif kind == "whooshSoft":
        place(sfx, whoosh(0.4, True), t0 - 0.15, 0.4)
    elif kind == "pop":
        place(sfx, pop(), t0, 0.7)
    elif kind == "ding":
        place(sfx, ding(), t0, 0.9)
    elif kind == "impact":
        place(sfx, impact(), t0, 0.8)
    elif kind == "boom":
        place(sfx, boom(), t0, 0.75)
    elif kind == "freeze":
        place(sfx, shutter(), t0, 0.9)
        place(sfx, impact(), t0, 0.55)
    elif kind == "riser":
        place(sfx, riser(length or 2.0), t0, 0.8)


for c in cues["highlights"]:
    if c.get("sfx"):
        fire(c["sfx"], at(c["seg"], c["at"]))
for c in cues["overlays"]:
    if c.get("sfx"):
        fire(c["sfx"], at(c["seg"], c["at"]))
for c in cues["sfx"]:
    fire(c["type"], at(c["seg"], c["at"]), c.get("len"))


# --- write ----------------------------------------------------------------------
def write(path, x):
    x = x[: int(TOTAL * SR)]
    peak = np.max(np.abs(x)) or 1
    x = np.tanh(x / peak * 1.2) / np.tanh(1.2) * 0.89  # gentle limiter
    pcm = (x * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", path, f"{len(x) / SR:.2f}s")


os.makedirs(OUT, exist_ok=True)
write(os.path.join(OUT, "music.wav"), music)
write(os.path.join(OUT, "sfx.wav"), sfx)
print("total", TOTAL)
