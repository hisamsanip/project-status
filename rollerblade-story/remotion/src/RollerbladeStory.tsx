import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ACT2_START, CAPTIONS, CUES, cueFrame, FPS, seg, SEGMENTS, TOTAL_FRAMES, VO_CLIPS } from "./timeline";
import { loadFonts } from "./fonts";
import { FreezeShot, SplitShot, VideoShot } from "./components/Shots";
import { Camcorder, FilmGrain, Flash, Letterbox, LightLeak, Vignette } from "./components/Effects";
import { Caption, Highlight } from "./components/Text";

loadFonts();

const sec = (s: number) => Math.round(s * FPS);

const FadeToBlack: React.FC<{ frames: number }> = ({ frames }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
        opacity: interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    />
  );
};

export const RollerbladeStory: React.FC = () => {
  const act1Frames = ACT2_START;
  const act2Frames = TOTAL_FRAMES - ACT2_START;
  const flyPeak = cueFrame("fly", 2.0);
  const landHit = cueFrame("land", 0.38);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* ---------- PICTURE: shots ---------- */}
      {SEGMENTS.map((s) => (
        <Sequence key={s.id} name={`Shot · ${s.id}`} from={s.from} durationInFrames={s.frames} premountFor={30}>
          <AbsoluteFill style={{ filter: s.act === 1 ? "sepia(0.12) saturate(1.08) brightness(1.03)" : "contrast(1.06) saturate(1.12)" }}>
            {s.kind === "freeze" ? (
              <FreezeShot s={s} />
            ) : s.kind === "split" ? (
              <SplitShot s={s} />
            ) : (
              <VideoShot s={s} whip={s.act === 2 && s.id !== "market" && s.id !== "close2" && s.id !== "land" && s.id !== "fly"} />
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* ---------- LOOK ---------- */}
      <Sequence name="Act 1 · camcorder"  durationInFrames={act1Frames}>
        <Camcorder startSeconds={12} />
      </Sequence>
      <Sequence name="Act 2 · letterbox" from={ACT2_START} durationInFrames={act2Frames}>
        <Letterbox size={64} />
      </Sequence>
      <Sequence name="Light leak · intro"  durationInFrames={sec(2.4)}>
        <LightLeak durationInFrames={sec(2.4)} intensity={0.55} />
      </Sequence>
      <Sequence name="Light leak · split" from={seg("split").from} durationInFrames={sec(1.6)}>
        <LightLeak durationInFrames={sec(1.6)} intensity={0.45} />
      </Sequence>
      <Sequence name="Light leak · outro" from={seg("outro").from} durationInFrames={sec(2.2)}>
        <LightLeak durationInFrames={sec(2.2)} intensity={0.6} />
      </Sequence>
      <Vignette strength={0.5} />
      <FilmGrain opacity={0.1} />

      {/* ---------- FLASHES ---------- */}
      <Sequence name="Flash · close call" from={seg("closeFz").from} durationInFrames={10}>
        <Flash frames={6} peak={0.7} />
      </Sequence>
      <Sequence name="Flash · FLY" from={flyPeak} durationInFrames={12}>
        <Flash frames={10} peak={0.95} />
      </Sequence>
      <Sequence name="Flash · landing" from={landHit} durationInFrames={10}>
        <Flash frames={7} peak={0.6} />
      </Sequence>
      <Sequence name="Flash · polaroid" from={seg("landFz").from} durationInFrames={10}>
        <Flash frames={8} peak={1} />
      </Sequence>

      {/* ---------- HIGHLIGHT TEXT ---------- */}
      {CUES.highlights.map((h, i) => {
        const dur = sec(h.dur);
        return (
          <Sequence key={`h${i}`} name={`Highlight · ${h.text}`} from={cueFrame(h.seg, h.at)} durationInFrames={dur}>
            <Highlight
              type={h.type}
              text={h.text}
              color={"color" in h ? h.color : undefined}
              rot={"rot" in h ? h.rot : undefined}
              x={"x" in h ? h.x : undefined}
              y={"y" in h ? h.y : undefined}
              durationInFrames={dur}
            />
          </Sequence>
        );
      })}

      {/* ---------- SCRIPT CAPTIONS (timed to the voiceover) ---------- */}
      {CAPTIONS.map((c, i) => (
        <Sequence key={`c${i}`} name={`Script · ${c.text}`} from={c.from} durationInFrames={c.frames}>
          <Caption text={c.text} hl={c.hl} durationInFrames={c.frames} />
        </Sequence>
      ))}

      {/* ---------- HYPERFRAMES OVERLAYS (alpha WebM) ---------- */}
      {CUES.overlays.map((o) => (
        <Sequence key={o.src} name={`HyperFrames · ${o.src}`} from={cueFrame(o.seg, o.at)} durationInFrames={sec(o.dur)}>
          <OffthreadVideo src={staticFile(o.src)} transparent muted />
        </Sequence>
      ))}

      <Sequence name="Fade out" from={TOTAL_FRAMES - sec(0.6)} durationInFrames={sec(0.6)}>
        <FadeToBlack frames={sec(0.6)} />
      </Sequence>

      {/* ---------- SOUND ---------- */}
      {/* music is pre-ducked under the voiceover in tools/make_audio.py */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.85} />
      <Audio src={staticFile("audio/sfx.mp3")} volume={0.85} />
      {/* ElevenLabs voiceover, one clip per script line */}
      {VO_CLIPS.map((v) => (
        <Sequence key={v.id} name={`VO · ${v.id}`} from={v.from} durationInFrames={v.frames}>
          <Audio src={staticFile(`vo/${v.id}.mp3`)} />
        </Sequence>
      ))}
      {/* natural ambience from each location, low under the music */}
      <Sequence name="Ambience · home" durationInFrames={act1Frames}>
        <Audio src={staticFile("footage/home.mp4")} volume={0.3} />
      </Sequence>
      <Sequence name="Ambience · street" from={ACT2_START} durationInFrames={sec(20)}>
        <Audio
          src={staticFile("footage/street.mp4")}
          volume={(f) => interpolate(f, [0, 10, sec(18), sec(20)], [0, 0.14, 0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
