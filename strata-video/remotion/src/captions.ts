import type { Caption } from "@remotion/captions";
import { WORDS, DISPLAY_MERGES } from "./words";

// Turns the transcript into word-level captions. Spoken numbers and spelled-out letters are
// merged into one written token (e.g. "J M B." becomes "JMB."), keeping the spoken time span.
// A caption page ends at the end of each sentence.
export const buildCaptions = (): Caption[] => {
  const captions: Caption[] = [];
  let i = 0;
  while (i < WORDS.length) {
    let text = WORDS[i][0];
    let [, start, end] = WORDS[i];
    let step = 1;
    for (const m of DISPLAY_MERGES) {
      const parts = m.spoken.split(" ");
      if (parts.every((p, k) => WORDS[i + k]?.[0] === p)) {
        text = m.shown;
        end = WORDS[i + parts.length - 1][2];
        step = parts.length;
        break;
      }
    }
    const next = WORDS[i + step];
    captions.push({
      text: (captions.length === 0 ? "" : " ") + text,
      startMs: Math.round(start * 1000),
      // Hold each word until the next one starts, so the highlight never drops out mid-sentence.
      endMs: Math.round((next && !/[.?!]$/.test(text) ? next[1] : end) * 1000),
      timestampMs: Math.round(((start + end) / 2) * 1000),
      confidence: null,
      pageBreakAfter: /[.?!]$/.test(text),
    });
    i += step;
  }
  return captions;
};
