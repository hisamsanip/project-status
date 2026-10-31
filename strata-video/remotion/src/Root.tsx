import { Composition } from "remotion";
import { StrataVideo } from "./StrataVideo";
import { FPS, TOTAL_FRAMES } from "./script";

export const RemotionRoot: React.FC = () => (
  <Composition id="AktaPengurusanStrata" component={StrataVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
);
