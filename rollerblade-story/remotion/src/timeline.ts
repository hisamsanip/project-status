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

export type CaptionCue = (typeof cues.captions)[number];
export type HighlightCue = (typeof cues.highlights)[number];
export type OverlayCue = (typeof cues.overlays)[number];
export const CUES = cues;
