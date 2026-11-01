# Her First Street Ride: a rollerblade diary

A 47-second edit (1920×1080, 30 fps) built from two clips: a girl learning to rollerblade at home, then skating through a market street. She tells the story herself in a first-person voiceover (ElevenLabs), with matching captions, highlight stickers, b-roll and effects.

- **Final video:** [`rollerblade-story.mp4`](rollerblade-story.mp4)
- **Storyboard:** [`storyboard/index.html`](storyboard/index.html) (shot list with thumbnails, script, on-screen text, effects and sound, all in one file)

## How it's built

| Part | Tool | Where |
|---|---|---|
| Title, "Level 02" chapter card, "Keep Rolling" end card | **HyperFrames** (HTML + GSAP), rendered as transparent WebM | `hyperframes/compositions/*.html` → `hyperframes/render-overlays.sh` |
| The edit: cuts, speed ramps, freezes, split screen, captions, stickers, camera moves, grade, grain | **Remotion** | `remotion/src/` |
| Edit decision list and cue sheet (one source of truth for picture and sound) | JSON | `remotion/src/edl.json`, `remotion/src/cues.json` |
| Voiceover: 15 lines, voice *Emmaline (young British girl)*, model `eleven_v4`, chosen takes kept in `tools/vo_raw/` | **ElevenLabs** | `tools/prepare_vo.py` → `remotion/public/vo/*.mp3` |
| Music bed (ducked under the voice) and SFX, synthesised from code (no samples) | Python + numpy | `tools/make_audio.py` |
| Storyboard page | Python | `tools/build_storyboard.py` |

## Rebuild

```bash
# 1. HyperFrames overlays → remotion/public/overlays/*.webm
./hyperframes/render-overlays.sh

# 2. Voiceover: trim/tempo/clean the chosen takes and write their lengths into cues.json
python3 tools/prepare_vo.py

# 3. Music + SFX → remotion/public/audio/*.wav (then convert to mp3)
python3 tools/make_audio.py
for f in remotion/public/audio/*.wav; do ffmpeg -y -i "$f" -b:a 160k "${f%.wav}.mp3" && rm "$f"; done

# 4. Preview / render the edit
cd remotion && npm i
npx remotion studio            # preview
npx remotion render RollerbladeStory out/master.mp4 --crf=18

# 5. Loudness-normalise and compress the delivery file (-14 LUFS)
ffmpeg -i remotion/out/master.mp4 -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k rollerblade-story.mp4

# 6. Storyboard thumbnails come from the final video; then rebuild the page
python3 tools/build_storyboard.py
```

Each voiceover line lives in `cues.json` under `vo` (shot, start offset, tempo, caption text). Captions are timed from the voice automatically. To move a line, change its `at`; to change the cut, edit `edl.json`; then rerun steps 2–6. New wording needs a new ElevenLabs take saved to `tools/vo_raw/`.
`remotion.config.ts` only switches to the cloud sandbox's Chromium when that path exists, so it is ignored on a normal machine.
