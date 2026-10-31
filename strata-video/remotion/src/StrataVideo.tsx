import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio, Video } from "@remotion/media";
import { SCENES, VOICEOVER, IMAGE_PARTS, sceneFrames, toFrames } from "./script";
import { ImageScene } from "./ImageScene";
import { Subtitles } from "./Subtitles";
import { CREAM } from "./theme";

// Intro and outro come from the HyperFrames film (clips/scenes.mp4); the four middle scenes are
// the clay illustrations. The Malay voiceover plays once from the start and subtitles sit on top.
export const StrataVideo: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <Series>
      {SCENES.map(scene => (
        <Series.Sequence key={scene.id} name={scene.id} durationInFrames={sceneFrames(scene)}>
          {scene.kind === "hyperframes" ? (
            <Video src={staticFile("clips/scenes.mp4")} trimBefore={toFrames(scene.trimBeforeSeconds)} muted />
          ) : (
            <ImageScene
              image={scene.image}
              part={scene.part}
              parts={IMAGE_PARTS}
              title={scene.title}
              points={scene.points.map(p => ({ ...p, at: p.at - scene.start }))}
            />
          )}
        </Series.Sequence>
      ))}
    </Series>
    <Audio src={staticFile(VOICEOVER)} />
    <Subtitles />
  </AbsoluteFill>
);
