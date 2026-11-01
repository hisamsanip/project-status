import React from "react";
import { Composition } from "remotion";
import { RollerbladeStory } from "./RollerbladeStory";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RollerbladeStory"
      component={RollerbladeStory}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
