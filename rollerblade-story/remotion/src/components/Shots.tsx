import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PlacedSegment } from "../timeline";
import { COLORS, SANS } from "../fonts";
import { BrollFrame, shake, SpeedLines } from "./Effects";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.45, 0, 0.55, 1);

type Move = {
  scale: number;
  x?: number;
  y?: number;
  origin?: string;
  filter?: string;
};

/** Per-shot camera moves (push-ins, punch zooms, shakes). `f` = local frame, `n` = length. */
const moveFor = (id: string, f: number, n: number, fps: number): Move => {
  const lin = (a: number, b: number) => interpolate(f, [0, n], [a, b], { ...clamp, easing: smooth });
  switch (id) {
    case "intro":
      return { scale: lin(1.06, 1.18), filter: "brightness(0.72) saturate(1.1)" };
    case "salute": {
      const punch = interpolate(f, [0.95 * fps, 1.1 * fps], [1, 1.12], { ...clamp, easing: Easing.out(Easing.back(2)) });
      return { scale: lin(1.0, 1.04) * punch, origin: "50% 40%" };
    }
    case "wobble": {
      // gentle hand-held wobble while she finds her balance
      return { scale: 1.06, x: Math.sin(f / 7) * 8, y: Math.cos(f / 9) * 5 };
    }
    case "wheels":
      return { scale: lin(2.2, 2.5), origin: "48% 92%", x: lin(30, -30), filter: "contrast(1.1) saturate(1.2)" };
    case "glide":
      return { scale: lin(1.0, 1.1), origin: "45% 55%" };
    case "thumbs": {
      const punch = interpolate(f, [0.15 * fps, 0.3 * fps], [1, 1.14], { ...clamp, easing: Easing.out(Easing.back(2)) });
      return { scale: punch, origin: "60% 35%" };
    }
    case "market":
      return { scale: lin(1.0, 1.06) };
    case "chairs":
      return { scale: 1.08, x: lin(40, -40) };
    case "close1":
      return { scale: lin(1.0, 1.12), origin: "50% 45%" };
    case "close2":
      return { scale: lin(1.12, 1.0) };
    case "weave":
      return { scale: 1.06, x: Math.sin(f / 5) * 4 };
    case "approach":
      return { scale: lin(1.0, 1.1), origin: "50% 40%" };
    case "fly":
      return { scale: lin(1.12, 1.0), origin: "50% 35%", filter: "saturate(1.25) contrast(1.08)" };
    case "land": {
      const s = shake(f, Math.round(0.38 * fps), 22, 12);
      return { scale: 1.06, x: s.x, y: s.y };
    }
    case "after":
      return { scale: lin(1.0, 1.06) };
    case "crowd":
      return { scale: lin(1.04, 1.12), filter: "saturate(1.15)" };
    case "finale":
      return { scale: lin(1.0, 1.08), origin: "60% 50%" };
    default:
      return { scale: 1 };
  }
};

const Footage: React.FC<{ s: PlacedSegment; fps: number }> = ({ s, fps }) => (
  <Video
    src={staticFile(`footage/${s.src}.mp4`)}
    trimBefore={Math.round((s.in ?? 0) * fps)}
    trimAfter={Math.round((s.out ?? 0) * fps)}
    playbackRate={s.rate ?? 1}
    muted
    objectFit="cover"
    style={{ width: "100%", height: "100%" }}
  />
);

/** A normal or b-roll video shot with its camera move and a whip-blur on entry (act 2). */
export const VideoShot: React.FC<{ s: PlacedSegment; whip?: boolean }> = ({ s, whip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = moveFor(s.id, frame, s.frames, fps);
  const whipIn = whip ? interpolate(frame, [0, 6], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const whipOut = whip ? interpolate(frame, [s.frames - 4, s.frames], [0, 1], clamp) : 0;
  const blur = whipIn * 22 + whipOut * 16;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          scale: m.scale,
          transformOrigin: m.origin ?? "50% 50%",
          translate: `${(m.x ?? 0) + whipIn * 160 - whipOut * 120}px ${m.y ?? 0}px`,
          filter: `${m.filter ?? ""} blur(${blur}px)`,
        }}
      >
        <Footage s={s} fps={fps} />
      </AbsoluteFill>
      {s.id === "weave" && <SpeedLines opacity={0.28} />}
      {s.id === "approach" && <SpeedLines opacity={0.4} />}
      {s.id === "wheels" && <BrollFrame label="B-ROLL · THE WHEELS" />}
      {s.id === "crowd" && <BrollFrame label="B-ROLL · REACTIONS" />}
    </AbsoluteFill>
  );
};

/** Freeze frames: near-miss (red tint + shake), landing (polaroid), outro (slow blur-out). */
export const FreezeShot: React.FC<{ s: PlacedSegment }> = ({ s }) => {
  const frame = useCurrentFrame();
  const src = staticFile(`stills/${s.still}`);
  const full: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };

  if (s.id === "closeFz") {
    const sh = shake(frame, 0, 26, 16);
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
        <AbsoluteFill
          style={{
            scale: interpolate(frame, [0, s.frames], [1.15, 1.3], clamp),
            transformOrigin: "50% 45%",
            translate: `${sh.x}px ${sh.y}px`,
            filter: "grayscale(0.6) contrast(1.25)",
          }}
        >
          <Img src={src} style={full} />
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: "rgba(255,40,90,0.28)", mixBlendMode: "multiply" }} />
      </AbsoluteFill>
    );
  }

  if (s.id === "landFz") {
    const drop = interpolate(frame, [0, 8], [1.25, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: COLORS.ink }}>
        <AbsoluteFill style={{ filter: "blur(28px) brightness(0.55)", scale: 1.2 }}>
          <Img src={src} style={full} />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              background: COLORS.cream,
              padding: "26px 26px 110px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
              rotate: `${interpolate(frame, [0, 10], [-12, -3], clamp)}deg`,
              scale: drop,
              translate: "-140px 0px",
            }}
          >
            <Img src={src} style={{ width: 1120, height: 630, objectFit: "cover", display: "block" }} />
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: COLORS.ink, marginTop: 26, letterSpacing: "0.1em" }}>
              THE LANDING · FIRST TRY
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // outro
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, s.frames], [1.0, 1.12], clamp),
          filter: `blur(${interpolate(frame, [0, 20], [0, 10], clamp)}px) brightness(${interpolate(frame, [0, 20], [1, 0.55], clamp)})`,
        }}
      >
        <Img src={src} style={full} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Then-vs-now split screen b-roll. */
export const SplitShot: React.FC<{ s: PlacedSegment }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const half = 960;
  const pane = (side: "left" | "right") => {
    const isLeft = side === "left";
    const clip: PlacedSegment = isLeft
      ? { ...s, id: "splitL", src: "home", in: 3.0, out: 3.0 + s.frames / fps, rate: 1 }
      : { ...s, id: "splitR", src: "street", in: 8.4, out: 8.4 + s.frames / fps, rate: 1 };
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: half,
          left: isLeft ? 0 : half,
          overflow: "hidden",
          translate: `${(isLeft ? -1 : 1) * (1 - open) * half}px 0px`,
          filter: isLeft ? "sepia(0.35) saturate(0.9)" : "saturate(1.15) contrast(1.05)",
        }}
      >
        <div style={{ position: "absolute", top: 0, bottom: 0, left: -480, width: 1920 }}>
          <Footage s={clip} fps={fps} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 130,
            left: isLeft ? 70 : undefined,
            right: isLeft ? undefined : 70,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: "0.2em",
            color: COLORS.ink,
            background: isLeft ? COLORS.cream : COLORS.pink,
            padding: "10px 24px",
            borderRadius: 10,
            opacity: interpolate(frame, [10, 16], [0, 1], clamp),
          }}
        >
          {isLeft ? "DAY 1" : "TODAY"}
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {pane("left")}
      {pane("right")}
      <div
        style={{
          position: "absolute",
          left: half - 5,
          width: 10,
          top: 0,
          bottom: 0,
          background: COLORS.cream,
          scale: `1 ${open}`,
        }}
      />
    </AbsoluteFill>
  );
};
