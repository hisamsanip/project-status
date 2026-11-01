import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, DISPLAY, MARKER, SANS } from "../fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * First-person script line at the bottom of frame.
 * Words pop in one by one; the highlighted phrase gets a pink marker swipe.
 */
export const Caption: React.FC<{ text: string; hl?: string; durationInFrames: number }> = ({
  text,
  hl,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hlStart = hl ? text.indexOf(hl) : -1;
  const words: { w: string; hl: boolean }[] = [];
  let pos = 0;
  for (const w of text.split(" ")) {
    const idx = text.indexOf(w, pos);
    const isHl = hlStart >= 0 && idx >= hlStart && idx < hlStart + (hl?.length ?? 0);
    words.push({ w, hl: isHl });
    pos = idx + w.length;
  }
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);
  const perWord = 2.5;
  const firstHl = words.findIndex((w) => w.hl);
  const swipe = interpolate(frame, [firstHl * perWord + 3, firstHl * perWord + 11], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120, opacity: out }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, gap: "0 18px" }}>
        {words.map((w, i) => {
          const s = spring({ frame: frame - i * perWord, fps, config: { damping: 14, stiffness: 180 } });
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 66,
                lineHeight: 1.25,
                color: w.hl && swipe > 0.6 ? COLORS.ink : "white",
                textShadow: w.hl && swipe > 0.6 ? "none" : "0 4px 0 rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.55)",
                opacity: interpolate(s, [0, 1], [0, 1], clamp),
                translate: `0px ${interpolate(s, [0, 1], [40, 0])}px`,
                scale: interpolate(s, [0, 1], [0.8, 1]),
                padding: w.hl ? "0 6px" : 0,
              }}
            >
              {w.hl && (
                <span
                  style={{
                    position: "absolute",
                    left: -10,
                    right: -10,
                    top: 8,
                    bottom: 4,
                    background: COLORS.pink,
                    borderRadius: 10,
                    zIndex: -1,
                    rotate: "-1.5deg",
                    transformOrigin: "left center",
                    scale: `${swipe} 1`,
                    boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
                  }}
                />
              )}
              <span style={{ position: "relative" }}>{w.w}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

type HighlightProps = {
  type: string;
  text: string;
  color?: string;
  rot?: number;
  x?: number;
  y?: number;
  durationInFrames: number;
};

const colorOf = (c?: string) =>
  c === "sky" ? COLORS.sky : c === "cream" ? COLORS.cream : COLORS.pink;

/** Highlight graphics: stickers, handwritten notes, stamps, location tags and big kinetic words. */
export const Highlight: React.FC<HighlightProps> = ({ type, text, color, rot = 0, x = 0, y = 0, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], clamp);

  if (type === "sticker") {
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          rotate: `${rot}deg`,
          scale: interpolate(pop, [0, 1], [0.2, 1]) * out,
          fontFamily: DISPLAY,
          fontSize: 140,
          lineHeight: 1,
          color: COLORS.ink,
          background: colorOf(color),
          padding: "18px 36px 24px",
          borderRadius: 24,
          border: `8px solid ${COLORS.cream}`,
          boxShadow: "0 18px 0 rgba(0,0,0,0.35)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    );
  }

  if (type === "note") {
    const chars = Math.floor(interpolate(frame, [0, 14], [0, text.length], clamp));
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          rotate: "-4deg",
          fontFamily: MARKER,
          fontSize: 78,
          color: COLORS.sky,
          textShadow: "0 4px 16px rgba(0,0,0,0.7)",
          opacity: out,
          whiteSpace: "nowrap",
        }}
      >
        {text.slice(0, chars)}
      </div>
    );
  }

  if (type === "stamp") {
    const slam = interpolate(frame, [0, 5], [2.4, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          rotate: "-9deg",
          scale: slam,
          opacity: interpolate(frame, [0, 3], [0, 1], clamp) * out,
          fontFamily: DISPLAY,
          fontSize: 96,
          letterSpacing: "0.04em",
          color: COLORS.sky,
          border: `10px solid ${COLORS.sky}`,
          borderRadius: 18,
          padding: "10px 34px 16px",
          background: "rgba(26,16,48,0.55)",
          textShadow: "0 4px 0 rgba(0,0,0,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    );
  }

  if (type === "location") {
    const w = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return (
      <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 18, opacity: out }}>
        <svg width="56" height="72" viewBox="0 0 24 32" style={{ scale: interpolate(pop, [0, 1], [0, 1]) }}>
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill={COLORS.pink} />
          <circle cx="12" cy="12" r="5" fill={COLORS.cream} />
        </svg>
        <div style={{ overflow: "hidden", width: `${w * 100}%` }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 40,
              letterSpacing: "0.22em",
              color: COLORS.ink,
              background: COLORS.cream,
              padding: "12px 26px",
              borderRadius: 10,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        </div>
      </div>
    );
  }

  // bigword: huge kinetic word with RGB split, centred
  const s = spring({ frame, fps, config: { damping: 11, stiffness: 160 } });
  const split = interpolate(frame, [0, 10], [22, 6], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 330,
          lineHeight: 1,
          color: colorOf(color),
          textTransform: "uppercase",
          scale: interpolate(s, [0, 1], [2.2, 1]),
          rotate: `${interpolate(s, [0, 1], [-8, -3])}deg`,
          textShadow: `${split}px 0 0 rgba(255,40,90,0.85), ${-split}px 0 0 rgba(60,220,255,0.85), 0 18px 40px rgba(0,0,0,0.5)`,
          WebkitTextStroke: `6px ${COLORS.ink}`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
