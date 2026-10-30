# AI Sandbox Prompt Vault: how-to video

A 73-second, 1920×1080 video that walks through the Prompt Vault in six steps, with an
ElevenLabs voiceover and animated word-by-word subtitles that follow the narrator.

Final video: `ai-sandbox-prompt-vault-how-to.mp4`

## How it is made

| Part | Tool | Where |
|---|---|---|
| Intro and outro scenes | HyperFrames (HTML + GSAP) | `hyperframes/` → `remotion/public/clips/scenes.mp4` |
| Six step recordings of the real site | Playwright, frame by frame | `capture/record.js` → `remotion/public/clips/step1–6.mp4` |
| Voiceover (voice "Maya", model eleven_v4), loudness-normalised to -16 LUFS | ElevenLabs | `remotion/public/voiceover.mp3` |
| Edit, step headings, voice placement, animated subtitles | Remotion | `remotion/src/` |

The subtitle text and timing live in `remotion/src/script.ts`. Each line has `audio: [start, end]`,
its position in `voiceover.mp3`, and the subtitle lasts exactly as long as that audio. If you
change the words, generate new narration in ElevenLabs and update those times.

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

# 4. Render the final video
cd remotion && npm i && REMOTION_CHROME=$CHROME npx remotion render PromptVaultHowTo out/ai-sandbox-prompt-vault-how-to.mp4
```

Preview and edit in Remotion Studio with `npx remotion studio` from `remotion/`.
