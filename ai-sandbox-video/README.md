# Prompt Hub: how-to video

A one-minute-plus, 1920×1080 video that walks through Prompt Hub in six steps, in English and
Bahasa Melayu, with a voiceover and animated word-by-word subtitles that follow the narrator.
The look follows the Prompt Hub brand: Midnight Navy `#131E3A`, Powder Blue `#AFC6E9`, Sunflower Yellow `#FFC20D`.

Final videos (also played on the site from the "Watch how to use it" buttons):
`ai-sandbox/media/how-to-en.mp4` and `ai-sandbox/media/how-to-ms.mp4`.

## How it is made

| Part | Tool | Where |
|---|---|---|
| Intro and outro scenes, both languages (text set with HyperFrames composition variables) | HyperFrames (HTML + GSAP) | `hyperframes/` → `remotion/public/clips/scenes.mp4` |
| Six step recordings of the real site (dark theme) | Playwright, frame by frame | `capture/record.js` → `remotion/public/clips/step1–6.mp4` |
| English voiceover: Lessac (high), free and offline, loudness-normalised to -16 LUFS | Piper TTS | `tts/make_en.py` → `remotion/public/voiceover-en.mp3` |
| Malay voiceover: Aisyah, one ElevenLabs generation (eleven_v4), loudness-normalised to -16 LUFS | ElevenLabs | `remotion/public/voiceover-ms.mp3` |
| Edit, step headings, voice placement, animated subtitles | Remotion | `remotion/src/` |

## Words and timing

Everything spoken lives in `tts/lines.json`: for each line, the subtitle text (`sub`) and the text sent to
the voice (`tts`, for example "P F M S B" so the name is read letter by letter).
`tts/timings-en.json` and `tts/timings-ms.json` hold the `[start, end]` seconds of each line inside that
language's voiceover file. `python3 tts/build_script.py` turns both into `remotion/src/script.ts`
(do not edit that file by hand). Each scene lasts as long as its screen recording or its narration, whichever is longer.

If you change the words:

1. Edit `tts/lines.json`.
2. English: `python3 tts/make_en.py <en_US-lessac-high.onnx> remotion/public` (Piper voice files are free on Hugging Face, `rhasspy/piper-voices`). It rewrites `timings-en.json`.
3. Malay: generate the narration in ElevenLabs (all lines in one text, paragraph per line), save it as `remotion/public/voiceover-ms.mp3`, and write each line's `[start, end]` into `tts/timings-ms.json`.
4. `python3 tts/build_script.py`, then render.

If a Malay intro or outro line gets longer, lengthen that scene's `seconds` in `lines.json` **and** the matching
`data-start` / `data-duration` / `fadeAt` in `hyperframes/index.html`, then re-render the HyperFrames film.

## Rebuild

Needs Node 22+, FFmpeg and a Chromium build. In the commands below, `CHROME` is the path to
a Chrome or Chromium headless executable.

```bash
# 1. Serve the site from the repo root
python3 -m http.server 8770

# 2. Record the six steps (needs `npm i playwright` in capture/)
node capture/record.js http://127.0.0.1:8770/ai-sandbox/ remotion/public/clips

# 3. Render the HyperFrames intro and outro
cd hyperframes && npm i && HYPERFRAMES_BROWSER_PATH=$CHROME npm run render && cd ..

# 4. Render the final videos
cd remotion && npm i
REMOTION_CHROME=$CHROME npx remotion render PromptHubHowTo ../../ai-sandbox/media/how-to-en.mp4
REMOTION_CHROME=$CHROME npx remotion render PromptHubHowToMS ../../ai-sandbox/media/how-to-ms.mp4
```

Preview and edit in Remotion Studio with `npx remotion studio` from `remotion/`.
