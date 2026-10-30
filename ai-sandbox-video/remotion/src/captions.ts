import type { Caption } from "@remotion/captions";
import { SCENES, sceneFrames, FPS } from "./script";

// Turns the script's subtitle lines into word-level captions on the full video timeline.
// Each word gets a share of its line's time, weighted by word length, so the highlight
// moves at a natural reading pace. The last word of each line ends a caption page.
export const buildCaptions = (): Caption[] => {
  const captions: Caption[] = [];
  let sceneStart = 0;
  for (const scene of SCENES) {
    for (const line of scene.lines) {
      const words = line.text.split(" ");
      const weights = words.map(w => w.length + 3);
      const total = weights.reduce((a, b) => a + b, 0);
      const lineStart = (sceneStart + line.from) * 1000;
      const lineMs = (line.to - line.from) * 1000;
      let t = lineStart;
      words.forEach((w, i) => {
        const d = (weights[i] / total) * lineMs;
        captions.push({
          text: (i === 0 ? "" : " ") + w,
          startMs: Math.round(t),
          endMs: Math.round(t + d),
          timestampMs: Math.round(t + d / 2),
          confidence: null,
          pageBreakAfter: i === words.length - 1,
        });
        t += d;
      });
    }
    sceneStart += sceneFrames(scene) / FPS;
  }
  return captions;
};
