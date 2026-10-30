import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import type { Zoom } from "./script";

const NAVY = "#071338";
const BLUE = "#3d7bff";
const CYAN = "#38c8f5";
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type StepSceneProps = { step: number; title: string; clip: string; zoom?: Zoom };

export const StepScene: React.FC<StepSceneProps> = ({ step, title, clip, zoom }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const z = zoom
    ? interpolate(frame, [zoom.from * fps, zoom.from * fps + 18, zoom.to * fps - 14, zoom.to * fps], [1, zoom.scale, zoom.scale, 1], { ...clamp, easing: ease })
    : 1;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "Inter, sans-serif",
        color: "#fff",
        background: `radial-gradient(1300px 760px at 50% 42%, #0d2366, transparent 72%),
          linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px) 0 0 / 60px 60px,
          linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px) 0 0 / 60px 60px, ${NAVY}`,
        opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp),
      }}
    >
      {/* Step heading */}
      <div
        style={{
          position: "absolute", left: 320, top: 34, display: "flex", alignItems: "center", gap: 22,
          opacity: interpolate(frame, [2, 12], [0, 1], clamp),
          translate: interpolate(frame, [2, 14], ["-40px 0px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        <div
          style={{
            width: 66, height: 66, borderRadius: 20, display: "grid", placeItems: "center",
            background: `linear-gradient(135deg, ${BLUE}, ${CYAN})`, fontSize: 38, fontWeight: 800,
            scale: interpolate(frame, [4, 10, 16], [0.4, 1.15, 1], { ...clamp, output: "perceptual-scale" }),
          }}
        >
          {step}
        </div>
        <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.025em" }}>{title}</div>
      </div>

      {/* Progress: six steps */}
      <div style={{ position: "absolute", right: 320, top: 58, display: "flex", gap: 10, opacity: interpolate(frame, [2, 12], [0, 1], clamp) }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div
            key={n}
            style={{
              width: n === step ? 46 : 16, height: 16, borderRadius: 8,
              background: n === step ? CYAN : n < step ? BLUE : "rgba(255,255,255,.22)",
            }}
          />
        ))}
      </div>

      {/* Browser window with the real screen recording */}
      <div
        style={{
          position: "absolute", left: 320, top: 128, width: 1280, borderRadius: 18, overflow: "hidden",
          background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08)",
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          scale: interpolate(frame, [0, 16], [0.94, 1], { ...clamp, easing: ease, output: "perceptual-scale" }),
        }}
      >
        <div style={{ height: 36, background: "#e9edf5", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
          <div style={{ marginLeft: 18, flex: 1, height: 22, borderRadius: 11, background: "#fff", color: "#5d6578", fontSize: 14, display: "flex", alignItems: "center", paddingLeft: 14 }}>
            hisamsanip.github.io/project-status/ai-sandbox
          </div>
        </div>
        <div style={{ width: 1280, height: 720, overflow: "hidden" }}>
          <div style={{ width: 1280, height: 720, scale: z, transformOrigin: zoom ? `${zoom.originX} ${zoom.originY}` : "50% 50%" }}>
            <Video src={staticFile(clip)} muted style={{ width: 1280, height: 720, display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
