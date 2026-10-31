# Akta Pengurusan Strata 2013: explainer video (Bahasa Melayu)

A 72-second, 1920×1080 explainer on Malaysia's Strata Management Act 2013 (Act 757), with
clay-cartoon scenes, on-screen key points, a Malay male voiceover and word-by-word subtitles.

Final video: `akta-pengurusan-strata-ms.mp4`

## How it is made

| Part | Tool | Where |
|---|---|---|
| Title card and end card | HyperFrames (HTML + GSAP) | `hyperframes/` → `remotion/public/clips/scenes.mp4` |
| Four clay scenes (cut from one 2×2 image) | Higgsfield image | `remotion/public/scenes/scene1–4.jpg` |
| Voiceover (eleven_v4, voice Luqman), loudness-normalised | ElevenLabs | `remotion/public/voiceover-ms.mp3` |
| Word timings for subtitles | ElevenLabs Scribe | `remotion/src/words.ts` |
| Edit, scene text, animated subtitles | Remotion | `remotion/src/` |

Scene timing and the on-screen text live in `remotion/src/script.ts` (times are seconds on the
voiceover timeline). If you change the narration, generate it again in ElevenLabs, transcribe it,
and update `words.ts` and the scene times.

## Rebuild

Needs Node 22+, FFmpeg and Chromium (`CHROME` below is its path).

```bash
cd hyperframes && npm i && HYPERFRAMES_BROWSER_PATH=$CHROME npm run render && cd ..
cd remotion && npm i
REMOTION_CHROME=$CHROME npx remotion render AktaPengurusanStrata ../akta-pengurusan-strata-ms.mp4
```

Preview and edit in Remotion Studio with `npx remotion studio` from `remotion/`.
