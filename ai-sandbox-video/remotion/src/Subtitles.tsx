import { Fragment, useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { buildCaptions } from "./captions";
import type { Lang } from "./script";

// Pages split only at the end of each script line, so a whole sentence shows at once.
const COMBINE_MS = 60000;
const LINGER_MS = 350;

const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 52 }}>
      <div
        style={{
          maxWidth: 1560,
          padding: "18px 34px",
          borderRadius: 22,
          background: "rgba(7, 19, 56, 0.86)",
          border: "2px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [0, 8], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
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
                  color: spoken ? "#ffffff" : "rgba(255, 255, 255, 0.42)",
                  background: active ? "#3d7bff" : "transparent",
                  scale: interpolate(frame, [popFrame, popFrame + 4, popFrame + 9], [1, 1.12, 1], {
                    extrapolateLeft: "clamp", extrapolateRight: "clamp",
                  }),
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

export const Subtitles: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () => createTikTokStyleCaptions({ captions: buildCaptions(lang), combineTokensWithinMilliseconds: COMBINE_MS }).pages,
    [lang],
  );

  return (
    <AbsoluteFill>
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
