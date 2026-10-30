import { Composition, Folder } from "remotion";
import { HowToVideo } from "./HowToVideo";
import { StepScene } from "./StepScene";
import { SCRIPTS, sceneFrames, totalFrames, FPS } from "./script";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PromptVaultHowTo" component={HowToVideo} durationInFrames={totalFrames("en")} fps={FPS} width={1920} height={1080} defaultProps={{ lang: "en" as const }} />
    <Composition id="PromptVaultHowToMS" component={HowToVideo} durationInFrames={totalFrames("ms")} fps={FPS} width={1920} height={1080} defaultProps={{ lang: "ms" as const }} />
    <Folder name="Steps">
      {SCRIPTS.en.scenes.map(s =>
        s.kind === "step" ? (
          <Composition
            key={s.id}
            id={s.id}
            component={StepScene}
            durationInFrames={sceneFrames(s)}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ step: s.step, title: s.title, clip: s.clip, clipSeconds: s.clipSeconds }}
          />
        ) : null,
      )}
    </Folder>
  </>
);
