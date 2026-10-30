import { AbsoluteFill, Sequence, Series, staticFile } from "remotion";
import { Audio, Video } from "@remotion/media";
import { SCRIPTS, sceneFrames, FPS, type Lang } from "./script";
import { StepScene } from "./StepScene";
import { Subtitles } from "./Subtitles";

// Intro and outro come from the bilingual HyperFrames film (scenes.mp4); the six steps are
// real screen recordings of the Prompt Vault. Each narration line is placed in its scene
// from the language's ElevenLabs voiceover; subtitles sit on top of everything.
export const HowToVideo: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { scenes, voiceover } = SCRIPTS[lang];
  return (
    <AbsoluteFill style={{ background: "#071338" }}>
      <Series>
        {scenes.map(scene => (
          <Series.Sequence key={scene.id} name={scene.id} durationInFrames={sceneFrames(scene)}>
            {scene.kind === "hyperframes" ? (
              <Video src={staticFile("clips/scenes.mp4")} trimBefore={Math.round(scene.trimBeforeSeconds * FPS)} muted />
            ) : (
              <StepScene step={scene.step} title={scene.title} clip={scene.clip} clipSeconds={scene.clipSeconds} />
            )}
          </Series.Sequence>
        ))}
      </Series>
      {scenes.flatMap((scene, si) => {
        const sceneStart = scenes.slice(0, si).reduce((n, s) => n + sceneFrames(s), 0);
        return scene.lines.map((line, li) => (
          <Sequence key={`${scene.id}-${li}`} name={`Voice: ${line.text}`} from={sceneStart + Math.round(line.from * FPS)}>
            <Audio src={staticFile(voiceover)} trimBefore={Math.round(line.audio[0] * FPS)} trimAfter={Math.round(line.audio[1] * FPS)} />
          </Sequence>
        ));
      })}
      <Subtitles lang={lang} />
    </AbsoluteFill>
  );
};
