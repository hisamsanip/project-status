import edl from "./edl.json";
import cues from "./cues.json";

export const FPS = edl.fps;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Segment = {
  id: string;
  act: number;
  kind: "video" | "broll" | "freeze" | "split";
  src?: "home" | "street";
  in?: number;
  out?: number;
  rate?: number;
  still?: string;
  dur?: number;
};

export type PlacedSegment = Segment & { from: number; frames: number };

// Same frame rounding as tools/make_audio.py so audio cues stay in sync.
export const SEGMENTS: PlacedSegment[] = (() => {
  let from = 0;
  return (edl.segments as Segment[]).map((s) => {
    const seconds = s.dur ?? ((s.out ?? 0) - (s.in ?? 0)) / (s.rate ?? 1);
    const frames = Math.round(seconds * FPS);
    const placed = { ...s, from, frames };
    from += frames;
    return placed;
  });
})();

export const TOTAL_FRAMES = SEGMENTS.reduce((a, s) => a + s.frames, 0);

export const seg = (id: string): PlacedSegment => {
  const s = SEGMENTS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown segment ${id}`);
  return s;
};

/** Absolute frame for "N seconds into segment X". */
export const cueFrame = (id: string, at: number) => seg(id).from + Math.round(at * FPS);

export const ACT2_START = seg("market").from;

export type HighlightCue = (typeof cues.highlights)[number];
export type OverlayCue = (typeof cues.overlays)[number];
export const CUES = cues;

/** Voiceover clips placed on the timeline (lengths come from tools/prepare_vo.py). */
export const VO_CLIPS = cues.vo.map((v) => ({
  id: v.id,
  from: cueFrame(v.seg, v.at),
  frames: Math.ceil(v.len * FPS),
}));

/**
 * Captions follow the voice: each starts when its line (or part of a line) is spoken
 * and stays up until shortly after, never overlapping the next caption.
 */
export const CAPTIONS = (() => {
  const list: { from: number; text: string; hl: string; end: number }[] = [];
  cues.vo.forEach((v) => {
    const start = cueFrame(v.seg, v.at);
    const end = start + Math.round(v.len * FPS);
    v.captions.forEach((c, i) => {
      const next = v.captions[i + 1];
      list.push({
        from: start + Math.round(c.at * FPS),
        text: c.text,
        hl: c.hl,
        end: next ? start + Math.round(next.at * FPS) : end + Math.round(0.35 * FPS),
      });
    });
  });
  return list.map((c, i) => {
    const nextFrom = list[i + 1]?.from ?? Infinity;
    return { ...c, frames: Math.max(10, Math.min(c.end, nextFrom) - c.from) };
  });
})();
