import { Composition, Folder } from "remotion";
import { HowToVideo } from "./HowToVideo";
import { StepScene } from "./StepScene";
import { SCENES, sceneFrames, TOTAL_FRAMES, FPS } from "./script";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PromptVaultHowTo" component={HowToVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Folder name="Steps">
      {SCENES.map(s =>
        s.kind === "step" ? (
          <Composition
            key={s.id}
            id={s.id}
            component={StepScene}
            durationInFrames={sceneFrames(s)}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ step: s.step, title: s.title, clip: s.clip, zoom: s.zoom }}
          />
        ) : null,
      )}
    </Folder>
  </>
);
