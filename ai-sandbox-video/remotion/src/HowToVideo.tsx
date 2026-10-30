import { AbsoluteFill, Series, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { SCENES, sceneFrames, FPS } from "./script";
import { StepScene } from "./StepScene";
import { Subtitles } from "./Subtitles";

// Intro and outro come from the HyperFrames film (scenes.mp4); the six steps are
// real screen recordings of the Prompt Vault. Subtitles sit on top of everything.
export const HowToVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#071338" }}>
    <Series>
      {SCENES.map(scene => (
        <Series.Sequence key={scene.id} name={scene.id} durationInFrames={sceneFrames(scene)}>
          {scene.kind === "hyperframes" ? (
            <Video src={staticFile("clips/scenes.mp4")} trimBefore={Math.round(scene.trimBeforeSeconds * FPS)} muted />
          ) : (
            <StepScene step={scene.step} title={scene.title} clip={scene.clip} zoom={scene.zoom} />
          )}
        </Series.Sequence>
      ))}
    </Series>
    <Subtitles />
  </AbsoluteFill>
);
