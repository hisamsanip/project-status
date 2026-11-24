"""English voiceover with Piper (free, offline). Usage:
   python3 make_en.py <voice.onnx> <out-dir>
Writes <out-dir>/voiceover-en.mp3 (loudness -16 LUFS) and tts/timings-en.json: [start, end] seconds of each line."""
import json, subprocess, sys, tempfile, wave, os
from piper import PiperVoice, SynthesisConfig
HERE = os.path.dirname(os.path.abspath(__file__))
model, out = sys.argv[1], sys.argv[2]
lines = [l for s in json.load(open(HERE + "/lines.json"))["en"]["scenes"] for l in s["lines"]]
voice = PiperVoice.load(model)
cfg = SynthesisConfig(length_scale=1.06, noise_scale=0.6, noise_w_scale=0.7)
tmp = tempfile.mkdtemp(); parts = []; timings = []; t = 0.0; GAP = 0.45
for i, l in enumerate(lines):
    p = f"{tmp}/{i:02d}.wav"
    with wave.open(p, "wb") as w: voice.synthesize_wav(l["tts"], w, syn_config=cfg)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))
    timings.append([round(t, 2), round(t + d, 2)]); t += d + GAP; parts.append(p)
lst = f"{tmp}/list.txt"; sil = f"{tmp}/sil.wav"
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"anullsrc=r=22050:cl=mono", "-t", str(GAP), sil])
open(lst, "w").write("".join(f"file '{p}'\nfile '{sil}'\n" for p in parts))
raw = f"{tmp}/all.wav"
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", raw])
subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", "44100", "-ac", "1", "-b:a", "160k", f"{out}/voiceover-en.mp3"])
json.dump(timings, open(HERE + "/timings-en.json", "w"))
print(json.dumps(timings))
