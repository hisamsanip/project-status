// The whole video in one place: scene order, timing, footage and subtitle lines.
// Times are in seconds, relative to the start of each scene.

export const FPS = 30;

export type Line = { from: number; to: number; text: string };
export type Zoom = { from: number; to: number; scale: number; originX: string; originY: string };

export type Scene =
  | { id: string; kind: "hyperframes"; seconds: number; trimBeforeSeconds: number; lines: Line[] }
  | { id: string; kind: "step"; seconds: number; step: number; title: string; clip: string; zoom?: Zoom; lines: Line[] };

export const SCENES: Scene[] = [
  {
    id: "Intro", kind: "hyperframes", seconds: 6, trimBeforeSeconds: 0,
    lines: [
      { from: 0.8, to: 3.2, text: "Welcome to the AI Sandbox Prompt Vault." },
      { from: 3.3, to: 5.9, text: "Here's how to build a great prompt in six simple steps." },
    ],
  },
  {
    id: "Step1", kind: "step", seconds: 9, step: 1, title: "Choose what to create", clip: "clips/step1.mp4",
    lines: [
      { from: 0.2, to: 2.4, text: "Step one: choose what you want to create." },
      { from: 2.5, to: 6.6, text: "Pick Slides, Infographic, Visual or Dashboard, or search for any task." },
    ],
  },
  {
    id: "Step2", kind: "step", seconds: 8, step: 2, title: "Pick your AI tool", clip: "clips/step2.mp4",
    lines: [
      { from: 0.3, to: 3.6, text: "Step two: pick the AI tool you'll paste into." },
      { from: 3.8, to: 7.8, text: "Each card now shows what that tool can do." },
    ],
  },
  {
    id: "Step3", kind: "step", seconds: 11, step: 3, title: "Open a prompt and fill in the blanks", clip: "clips/step3.mp4",
    lines: [
      { from: 0.3, to: 3.8, text: "Step three: open a prompt and fill in the blanks." },
      { from: 4.0, to: 10.6, text: "Type your topic and goal, and tap a quick pick like 10 slides." },
    ],
  },
  {
    id: "Step4", kind: "step", seconds: 10, step: 4, title: "Choose role, audience and tone", clip: "clips/step4.mp4",
    lines: [
      { from: 0.3, to: 4.6, text: "Step four: choose the expert role, your audience and the tone." },
      { from: 4.8, to: 9.7, text: "Every choice is written into the prompt for you." },
    ],
  },
  {
    id: "Step5", kind: "step", seconds: 11, step: 5, title: "Pick a style and add your document", clip: "clips/step5.mp4",
    lines: [
      { from: 0.3, to: 4.4, text: "Step five: pick a visual style to set the look." },
      { from: 4.6, to: 10.7, text: "Attached a file? Tell the AI how to use it, like as your data source." },
    ],
  },
  {
    id: "Step6", kind: "step", seconds: 10, step: 6, title: "Copy, paste and check", clip: "clips/step6.mp4",
    lines: [
      { from: 0.3, to: 4.6, text: "Step six: check the finished prompt, then tap Copy." },
      { from: 4.8, to: 9.8, text: "Paste it into your AI tool, and always check the answer before you use it." },
    ],
  },
  {
    id: "Outro", kind: "hyperframes", seconds: 7, trimBeforeSeconds: 6,
    lines: [
      { from: 0.6, to: 3.6, text: "Open the Prompt Vault and try it today." },
      { from: 3.8, to: 6.6, text: "Better questions in, better answers out." },
    ],
  },
];

export const sceneFrames = (s: Scene) => Math.round(s.seconds * FPS);
export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + sceneFrames(s), 0);
