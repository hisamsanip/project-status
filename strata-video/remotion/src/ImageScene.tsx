import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CREAM, PEACH, INK, MUTED, ORANGE, TEAL } from "./theme";
import type { Point } from "./script";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type ImageSceneProps = {
  image: string;
  part: number;
  parts: number;
  title: string;
  // Point times are in seconds from the start of this scene.
  points: Point[];
};

// A clay illustration in a framed card on the left with a slow push-in, and the key points
// popping in on the right as the narrator says them. The bottom 160px stays clear for subtitles.
export const ImageScene: React.FC<ImageSceneProps> = ({ image, part, parts, title, points }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        color: INK,
        background: `radial-gradient(1200px 800px at 75% 30%, ${PEACH}, transparent 70%), ${CREAM}`,
        opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp),
      }}
    >
      {/* Illustration card */}
      <div
        style={{
          position: "absolute", left: 56, top: 56, width: 1200, height: 800, borderRadius: 36, overflow: "hidden",
          border: `6px solid ${INK}`, boxShadow: `0 14px 0 ${INK}, 0 40px 80px rgba(43,33,24,.25)`,
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          scale: interpolate(frame, [0, 18], [0.92, 1], { ...clamp, easing: ease, output: "perceptual-scale" }),
          rotate: interpolate(frame, [0, 18], ["-2deg", "0deg"], { ...clamp, easing: ease }),
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            scale: interpolate(frame, [0, durationInFrames], [1.02, 1.12], { output: "perceptual-scale" }),
          }}
        />
      </div>

      {/* Text panel */}
      <div style={{ position: "absolute", left: 1310, top: 64, width: 560 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            opacity: interpolate(frame, [4, 14], [0, 1], clamp),
          }}
        >
          {Array.from({ length: parts }, (_, i) => (
            <div key={i} style={{ width: i + 1 === part ? 44 : 14, height: 14, borderRadius: 7, background: i + 1 === part ? ORANGE : i + 1 < part ? TEAL : "rgba(43,33,24,.18)" }} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 24, fontWeight: 700, color: MUTED, letterSpacing: ".06em" }}>
            BAHAGIAN {part}/{parts}
          </span>
        </div>
        <div
          style={{
            marginTop: 22, fontSize: 60, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em",
            opacity: interpolate(frame, [6, 16], [0, 1], clamp),
            translate: interpolate(frame, [6, 20], ["40px 0px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 18 }}>
          {points.map((p, i) => {
            const f = frame - Math.round(p.at * fps);
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderRadius: 22,
                  background: "#fff", border: `4px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`,
                  fontSize: 32, fontWeight: 700, lineHeight: 1.2,
                  opacity: interpolate(f, [0, 6], [0, 1], clamp),
                  scale: interpolate(f, [0, 6, 12], [0.6, 1.06, 1], { ...clamp, output: "perceptual-scale" }),
                  translate: interpolate(f, [0, 10], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
                }}
              >
                <div
                  style={{
                    flex: "none", width: 42, height: 42, borderRadius: 21, display: "grid", placeItems: "center",
                    background: TEAL, color: "#fff", fontSize: 24, fontWeight: 800,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ paddingTop: 3 }}>{p.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
