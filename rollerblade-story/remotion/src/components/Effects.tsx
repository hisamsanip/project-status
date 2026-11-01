import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SANS } from "../fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Animated film grain: SVG turbulence with a new seed every frame. */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 60} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Warm light leak that drifts across the frame. */
export const LightLeak: React.FC<{ durationInFrames: number; intensity?: number }> = ({
  durationInFrames,
  intensity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const p = frame / durationInFrames;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: interpolate(p, [0, 0.3, 0.7, 1], [0, intensity, intensity, 0], clamp),
        background: `radial-gradient(circle at ${interpolate(p, [0, 1], [-10, 110])}% 30%, rgba(255,140,60,0.9) 0%, rgba(255,79,163,0.5) 22%, rgba(0,0,0,0) 50%)`,
      }}
    />
  );
};

/** Full-frame white flash. */
export const Flash: React.FC<{ frames?: number; peak?: number }> = ({ frames = 8, peak = 0.9 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundColor: "white",
        opacity: interpolate(frame, [0, 1, frames], [0, peak, 0], {
          ...clamp,
          easing: Easing.out(Easing.quad),
        }),
      }}
    />
  );
};

/** Anime-style radial speed lines. */
export const SpeedLines: React.FC<{ opacity?: number }> = ({ opacity = 0.35 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const lines = new Array(46).fill(0).map((_, i) => {
    const seed = `${i}-${Math.floor(frame / 2)}`;
    const a = (i / 46) * Math.PI * 2 + random(seed) * 0.12;
    const r0 = 520 + random(`r${seed}`) * 260;
    const r1 = 1300;
    const w = 2 + random(`w${seed}`) * 6;
    return { a, r0, r1, w };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width={width} height={height}>
        {lines.map((l, i) => {
          const x0 = cx + Math.cos(l.a) * l.r0;
          const y0 = cy + Math.sin(l.a) * l.r0;
          const x1 = cx + Math.cos(l.a) * l.r1;
          const y1 = cy + Math.sin(l.a) * l.r1;
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="white" strokeWidth={l.w} strokeLinecap="round" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Home-video camcorder chrome for act 1. */
export const Camcorder: React.FC<{ startSeconds?: number }> = ({ startSeconds = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = startSeconds + frame / fps;
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(Math.floor(t % 60)).padStart(2, "0");
  const ff = String(Math.floor(frame % fps)).padStart(2, "0");
  const blink = Math.floor(frame / 15) % 2 === 0;
  const corner = (pos: React.CSSProperties, rot: number) => (
    <div
      style={{
        position: "absolute",
        width: 70,
        height: 70,
        borderTop: "5px solid rgba(255,255,255,0.85)",
        borderLeft: "5px solid rgba(255,255,255,0.85)",
        rotate: `${rot}deg`,
        ...pos,
      }}
    />
  );
  const text: React.CSSProperties = {
    position: "absolute",
    fontFamily: SANS,
    fontWeight: 800,
    fontSize: 34,
    letterSpacing: "0.12em",
    color: "white",
    textShadow: "0 2px 8px rgba(0,0,0,0.6)",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {corner({ left: 60, top: 60 }, 0)}
      {corner({ right: 60, top: 60 }, 90)}
      {corner({ right: 60, bottom: 60 }, 180)}
      {corner({ left: 60, bottom: 60 }, 270)}
      <div style={{ ...text, right: 110, top: 90, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, background: "#ff3b3b", opacity: blink ? 1 : 0.15 }} />
        REC
      </div>
      <div style={{ ...text, left: 110, top: 90 }}>DAY 01</div>
      <div style={{ ...text, right: 110, bottom: 92, fontSize: 30 }}>
        00:{mm}:{ss}:{ff}
      </div>
    </AbsoluteFill>
  );
};

/** Cinematic letterbox bars that slide in. */
export const Letterbox: React.FC<{ size?: number; inFrames?: number }> = ({ size = 70, inFrames = 12 }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame, [0, inFrames], [0, size], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "black" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "black" }} />
    </AbsoluteFill>
  );
};

/** Small "B-ROLL" style tag for cutaway shots. */
export const BrollFrame: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 36,
          border: `4px solid ${COLORS.cream}`,
          borderRadius: 18,
          opacity: interpolate(frame, [0, 8], [0, 0.85], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 80,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: "0.2em",
          color: COLORS.ink,
          background: COLORS.cream,
          padding: "10px 20px",
          borderRadius: 8,
          translate: interpolate(frame, [0, 10], ["0px 40px", "0px 0px"], {
            ...clamp,
            easing: Easing.out(Easing.back(2)),
          }),
          opacity: interpolate(frame, [0, 6], [0, 1], clamp),
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

/** Deterministic hand-held camera shake offset (px) that decays after `start`. */
export const shake = (frame: number, start: number, amp = 18, decayFrames = 14) => {
  if (frame < start) return { x: 0, y: 0 };
  const k = Math.max(0, 1 - (frame - start) / decayFrames);
  return {
    x: (random(`sx${frame}`) - 0.5) * 2 * amp * k,
    y: (random(`sy${frame}`) - 0.5) * 2 * amp * k,
  };
};
