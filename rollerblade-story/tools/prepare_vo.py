"""Prepare the ElevenLabs voiceover takes for the edit.

For every entry in cues.json "vo": trim the chosen raw take (tools/vo_raw/<take>.mp3)
to the spoken part, apply the tempo, clean it up (high-pass, light compression,
loudness to -16 LUFS) and write remotion/public/vo/<id>.mp3.
The processed length is written back to cues.json as "len" so captions,
music ducking and the edit all use the same numbers.

    python3 tools/prepare_vo.py
"""
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = os.path.join(ROOT, "remotion", "src", "cues.json")
RAW = os.path.join(ROOT, "tools", "vo_raw")
OUT = os.path.join(ROOT, "remotion", "public", "vo")
os.makedirs(OUT, exist_ok=True)

cues = json.load(open(CUES))
trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03"
for v in cues["vo"]:
    src = os.path.join(RAW, f"{v['take']}.mp3")
    dst = os.path.join(OUT, f"{v['id']}.mp3")
    af = ",".join([
        trim, "areverse", trim, "areverse",  # trim silence at both ends
        f"atempo={v['tempo']}",
        "highpass=f=90",
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=80",
        "loudnorm=I=-16:TP=-2:LRA=7",
        "apad=pad_dur=0.12",
    ])
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", src, "-af", af,
                    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "160k", dst], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
                               capture_output=True, text=True, check=True).stdout)
    v["len"] = round(dur, 3)
    print(f"{v['id']}  {dur:5.2f}s  {v['seg']}+{v['at']}")

open(CUES, "w").write(json.dumps(cues, ensure_ascii=False, indent=2) + "\n")
