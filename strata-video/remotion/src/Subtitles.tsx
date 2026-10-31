import { Fragment, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { buildCaptions } from "./captions";
import { INK, ORANGE } from "./theme";

// Pages split only at the end of each sentence, so a whole sentence shows at once.
const COMBINE_MS = 60000;
const LINGER_MS = 300;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 }}>
      <div
        style={{
          maxWidth: 1640,
          padding: "16px 32px",
          borderRadius: 24,
          background: "rgba(43, 33, 24, 0.9)",
          boxShadow: "0 16px 40px rgba(43, 33, 24, 0.3)",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.3,
          color: "#fff",
          opacity: interpolate(frame, [0, 5], [0, 1], clamp),
          translate: interpolate(frame, [0, 8], ["0px 24px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        {page.tokens.map((token, i) => {
          const active = nowMs >= token.fromMs && nowMs < token.toMs;
          const spoken = nowMs >= token.fromMs;
          const popFrame = ((token.fromMs - page.startMs) / 1000) * fps;
          return (
            <Fragment key={i}>
              {token.text.startsWith(" ") ? " " : null}
              <span
                style={{
                  display: "inline-block",
                  padding: "0 6px",
                  borderRadius: 10,
                  color: spoken ? "#fff" : "rgba(255, 255, 255, 0.45)",
                  background: active ? ORANGE : "transparent",
                  scale: interpolate(frame, [popFrame, popFrame + 4, popFrame + 9], [1, 1.1, 1], clamp),
                }}
              >
                {token.text.trimStart()}
              </span>
            </Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC = () => {
  const { fps } = useVideoConfig();
  const pages = useMemo(() => createTikTokStyleCaptions({ captions: buildCaptions(), combineTokensWithinMilliseconds: COMBINE_MS }).pages, []);

  return (
    <AbsoluteFill style={{ color: INK }}>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const lastToken = page.tokens[page.tokens.length - 1];
        const endMs = Math.min(lastToken.toMs + LINGER_MS, next ? next.startMs : Infinity);
        const from = Math.round((page.startMs / 1000) * fps);
        const durationInFrames = Math.round((endMs / 1000) * fps) - from;
        if (durationInFrames <= 0) return null;
        return (
          <Sequence key={index} name={`Subtitle ${index + 1}`} from={from} durationInFrames={durationInFrames}>
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
