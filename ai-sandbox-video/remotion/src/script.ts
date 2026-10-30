// The whole video in one place: scene order, timing, footage and subtitle lines.
// Times are in seconds, relative to the start of each scene.

export const FPS = 30;

// `audio` is the [start, end] of this line inside public/voiceover.mp3 (ElevenLabs, voice "Maya").
export type Line = { from: number; text: string; audio: [number, number] };
export const lineEnd = (l: Line) => l.from + (l.audio[1] - l.audio[0]);
export type Zoom = { from: number; to: number; scale: number; originX: string; originY: string };

export type Scene =
  | { id: string; kind: "hyperframes"; seconds: number; trimBeforeSeconds: number; lines: Line[] }
  | { id: string; kind: "step"; seconds: number; step: number; title: string; clip: string; zoom?: Zoom; lines: Line[] };

export const SCENES: Scene[] = [
  {
    id: "Intro", kind: "hyperframes", seconds: 7.5, trimBeforeSeconds: 0,
    lines: [
      { from: 0.6, text: "Welcome to the AI Sandbox Prompt Vault.", audio: [0.00, 2.75] },
      { from: 3.7, text: "Here's how to build a great prompt in six simple steps.", audio: [3.02, 6.52] },
    ],
  },
  {
    id: "Step1", kind: "step", seconds: 9, step: 1, title: "Choose what to create", clip: "clips/step1.mp4",
    lines: [
      { from: 0.2, text: "Step one: choose what you want to create.", audio: [6.86, 9.45] },
      { from: 3.0, text: "Pick Slides, Infographic, Visual or Dashboard, or search for any task.", audio: [9.73, 15.02] },
    ],
  },
  {
    id: "Step2", kind: "step", seconds: 8, step: 2, title: "Pick your AI tool", clip: "clips/step2.mp4",
    lines: [
      { from: 0.3, text: "Step two: pick the AI tool you'll paste into.", audio: [15.38, 18.47] },
      { from: 3.7, text: "Each card now shows what that tool can do.", audio: [18.69, 21.22] },
    ],
  },
  {
    id: "Step3", kind: "step", seconds: 11, step: 3, title: "Open a prompt and fill in the blanks", clip: "clips/step3.mp4",
    lines: [
      { from: 0.3, text: "Step three: open a prompt and fill in the blanks.", audio: [21.56, 24.58] },
      { from: 3.7, text: "Type your topic and goal, and tap a quick pick like 10 slides.", audio: [24.83, 28.64] },
    ],
  },
  {
    id: "Step4", kind: "step", seconds: 10, step: 4, title: "Choose role, audience and tone", clip: "clips/step4.mp4",
    lines: [
      { from: 0.3, text: "Step four: choose the expert role, your audience and the tone.", audio: [29.00, 33.24] },
      { from: 4.9, text: "Every choice is written into the prompt for you.", audio: [33.53, 36.06] },
    ],
  },
  {
    id: "Step5", kind: "step", seconds: 11, step: 5, title: "Pick a style and add your document", clip: "clips/step5.mp4",
    lines: [
      { from: 0.3, text: "Step five: pick a visual style to set the look.", audio: [36.42, 39.55] },
      { from: 4.4, text: "Attached a file? Tell the AI how to use it, like as your data source.", audio: [39.85, 44.22] },
    ],
  },
  {
    id: "Step6", kind: "step", seconds: 10, step: 6, title: "Copy, paste and check", clip: "clips/step6.mp4",
    lines: [
      { from: 0.3, text: "Step six: check the finished prompt, then tap Copy.", audio: [44.56, 48.31] },
      { from: 4.6, text: "Paste it into your AI tool, and always check the answer before you use it.", audio: [48.54, 52.69] },
    ],
  },
  {
    id: "Outro", kind: "hyperframes", seconds: 7, trimBeforeSeconds: 7.5,
    lines: [
      { from: 0.6, text: "Open the Prompt Vault and try it today.", audio: [53.00, 55.12] },
      { from: 3.3, text: "Better questions in, better answers out.", audio: [55.34, 57.88] },
    ],
  },
];

export const sceneFrames = (s: Scene) => Math.round(s.seconds * FPS);
export const TOTAL_FRAMES = SCENES.reduce((n, s) => n + sceneFrames(s), 0);
