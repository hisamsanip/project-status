# Standard video edit prompt

Copy everything inside the box below into a new session, fill in the `INPUT` block, and attach the video.
The pipeline mirrors how `ai-sandbox/media/how-to-*.mp4` were made (see `README.md`).

````text
You are my video editor. Edit the attached video to the spec below using HyperFrames and Remotion,
with FFmpeg and whisper.cpp for the audio and cutting work. Work through the phases in order and do not
skip the checks. When a step is blocked (network, missing model, missing key), say exactly what is
blocked and use the fallback listed. Never fake a result.

## INPUT (I fill this in)
- Source video: <attached file>
- Purpose / audience: <e.g. staff how-to, social post, project update>
- Language of the final video: <English | Bahasa Melayu | both>
- Format: <16:9 1920x1080 | 9:16 1080x1920 | 1:1 1080x1080>
- Target length: <e.g. 60 s, or "as short as the content allows">
- Tone / brand: <colours, logo path, mood of music>
- Cinematic look: <none | subtle | classic teal-orange | warm film | cool moody>, letterbox <yes | no>
- Voiceover: <keep original speech | replace with generated voiceover | none>
- Must keep / must not show: <anything>

## PHASE 0: Inspect
1. ffprobe the source: duration, resolution, fps, audio present or not.
2. Extract a contact sheet (1 frame per 5 s) and look at it so you understand what is on screen.
3. Confirm the tools work: ffmpeg, whisper-cli plus a real model (not the `for-tests-*` models),
   remotion, hyperframes. Report anything missing before going further.

## PHASE 1: Transcribe
- Run whisper.cpp (`whisper-cli -m <real model> -ojf -ml 1`) to get word-level timestamps.
  Use `base.en` or `small.en` for English and `small` (multilingual) for Malay.
- Save `transcript.json` (words, start, end). Everything later is timed from this file.
- If the source has no speech, write the script from the on-screen content and mark the video "voiceover from script".

## PHASE 2: Remove silence and dead air
- `ffmpeg -af silencedetect=noise=-35dB:d=0.5` to list silences. Cross-check against the transcript word gaps.
- Cut silences longer than 0.5 s, but keep 0.15 s of padding either side so speech does not clip.
- Also cut filler ("um", "uh", "eh", "err") and obvious false starts when a clean cut is possible.
- Do not remove silence in the middle of a visual demo where nothing is being said but the screen is
  doing something important. Keep it, or speed it up 2x to 4x instead.
- Cut on frame boundaries and add a 2-frame audio crossfade at every cut to avoid clicks.
- Re-transcribe the cut video so subtitle timing matches the NEW timeline. Report seconds removed.

## PHASE 3: Voiceover (free options only)
Use in this order and tell me which one was used:
1. Keep the original speech if the voiceover field says so (loudness-normalise to -16 LUFS).
2. Free tier of ElevenLabs through the connected tools (spend the fewest credits: one take, no retries,
   confirm with me before anything over ~1,000 characters). Pick a voice with `creative_list_voices`.
3. Local free TTS: Piper or Kokoro (needs a model download: report if the host is blocked), then `espeak-ng` as the last resort.
- Script rules: short sentences, one idea each, written to be spoken, matching what is on screen.
- Time every voiceover line against its scene; stretch or trim the SCENE, not the voice speed.
- Output `voiceover.mp3` plus per-line start/end times, normalised to -16 LUFS.

## PHASE 4: Subtitles (Remotion)
- Build from the word timestamps with `@remotion/captions`; follow the existing `src/Subtitles.tsx` and
  `src/captions.ts` pattern.
- Word-by-word highlight, max 2 lines, max about 42 characters per line, bottom third, inside safe margins
  (for 9:16 keep clear of the top 15% and bottom 20% where app UI sits).
- White text, dark outline or box, contrast ratio of 4.5:1 or better on every frame.
- For "both languages", render two separate files, not stacked subtitles.
- Proofread the subtitle text against the transcript. Fix Malay spelling and names (PFMSB, PR1MA, PPR).

## PHASE 5: B-roll
- Place a B-roll cutaway whenever the same shot has been on screen for more than about 6 s, or when the
  narration names something that can be shown (a place, a document, a number, a screen).
- Each B-roll lasts 2 to 5 s, cuts on a word boundary, and the voiceover continues underneath.
- Free sources, in order: (1) clips and screenshots from my own files, (2) screen recordings of the real
  site or app made with Playwright (`capture/record.js`), (3) animated graphics built in HyperFrames or Remotion
  (title cards, number counters, charts, arrows and callouts), (4) Pexels or Pixabay stock via their free
  API (needs a free key and an allowed host: report if blocked). Never use watermarked or unlicensed footage.
- Keep a `credits.md` listing the source and licence of every B-roll clip and music track.

## PHASE 6: Cinematic look
Skip only if the INPUT block says `none`. Apply one consistent grade to every camera shot and B-roll clip.
- Pick the look by testing, not guessing: render 3 candidate grades on the same reference frame with
  `hyperframes grade-compare` (or an FFmpeg contact sheet), look at them, and choose the one that fits the tone.
- Build the grade in FFmpeg (or a `.cube` LUT via `lut3d`) from these parts, kept subtle:
  - contrast S-curve and slightly lifted blacks (`curves`, `eq=contrast=1.05:saturation=0.92`)
  - colour split: cool shadows, warm highlights (`colorbalance`); skin tones must stay natural
  - soft vignette (`vignette=PI/6`) and fine film grain (`noise=alls=6:allf=t`), never heavy
  - optional 2.39:1 letterbox bars, only if `letterbox: yes` and nothing important sits in the cropped area
- Do NOT grade screen recordings, UI shots, logos or text cards: they must stay sharp and legible.
  Grade only live footage and stock B-roll, then composite the untouched graphics on top.
- Match exposure and white balance across clips first, then grade, so the look is uniform.
- Check skin tones and highlights on 3 frames (start, middle, end): no clipped whites, no crushed blacks,
  no colour banding. If it looks heavy, halve the strength.
- Keep the original and the graded version, so I can compare or switch the look off.

## PHASE 7: Background music
- Choose music to fit the tone: <calm | upbeat | corporate | cinematic>. Royalty-free only
  (Pixabay Music, YouTube Audio Library, or music I supply). If no source is reachable, tell me and
  ask me to supply a track. Do not synthesise a placeholder and call it finished.
- Mix: music at about -28 LUFS under speech, with sidechain ducking (`sidechaincompress`) so it dips
  while someone talks and rises 2 to 3 dB in gaps. Fade in 1 s, fade out 2 s. Trim or loop to length.
- Final programme loudness: -16 LUFS integrated, true peak below -1.5 dBTP.

## PHASE 8: Assemble and render
- HyperFrames: intro (2 to 4 s: logo and title) and outro (3 to 5 s: call to action), with text set from
  composition variables so both languages reuse one template.
- Remotion: timeline = intro, graded main video with cuts, graded B-roll cutaways, untouched graphics, subtitles, voiceover, music, outro.
  Animate step or section headings in and out. Keep motion quick and simple.
- Render H.264 MP4, AAC audio 192 kbps, yuv420p, `-movflags +faststart`.
- Also export `subtitles.srt` and a 1280x720 preview.

## PHASE 9: Quality checks (all must pass before you say "done")
- [ ] No silence longer than 0.6 s anywhere in the final audio (re-run silencedetect on the output).
- [ ] Every subtitle appears while its words are spoken (sample 5 points across the video).
- [ ] No text clipped or off-screen. Extract frames at the start, middle and end, and LOOK at them.
- [ ] Voice clearly audible over music. Integrated loudness -16 LUFS (+/- 1).
- [ ] Duration, resolution and fps match the INPUT block. Audio and video lengths match.
- [ ] Cinematic look is consistent across all clips; text and UI stay sharp and ungraded; skin tones look natural.
- [ ] B-roll never covers something the narration says is on the original screen.
- [ ] `credits.md` is complete.

## DELIVERABLES
1. `final.mp4` (and the preview), `subtitles.srt`, `transcript.json`, `credits.md`.
2. The editable Remotion and HyperFrames project, so I can change text and re-render.
3. A short report: what was cut (seconds removed), which voice and music were used and why, anything
   blocked and the fallback you took, and anything you want me to decide.
Send me the final video to review BEFORE any publishing or upload. Do not commit, push or post anything
unless I ask.
````

## Notes on running it

- **Network.** In a cloud session the allowed hosts decide what works. For this prompt to run fully, allow
  `huggingface.co` and `cdn-lfs.huggingface.co` (Whisper models, Piper/Kokoro voices), `cdn.jsdelivr.net`
  (HyperFrames templates), and whichever stock-footage and music sites you want (for example `pixabay.com`,
  `pexels.com`). Without them, the prompt falls back as written and reports what was blocked.
- **"Free" voiceover.** ElevenLabs only counts as free within the free-tier credit allowance; local Piper or Kokoro
  costs nothing but needs the model download above.
- **Existing assets.** The finished English and Malay videos and the Remotion project here
  (`src/script.ts`, `src/Subtitles.tsx`) are the reference for style. Tell the editor to reuse them for brand consistency.
