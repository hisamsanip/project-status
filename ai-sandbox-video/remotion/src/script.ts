// The whole video in one place, per language: scene order, timing, footage, voiceover and
// subtitle lines. Times are in seconds, relative to the start of each scene.

export const FPS = 30;

// `audio` is the [start, end] of this line inside the language's voiceover file.
export type Line = { from: number; text: string; audio: [number, number] };
export const lineEnd = (l: Line) => l.from + (l.audio[1] - l.audio[0]);

export type Scene =
  | { id: string; kind: "hyperframes"; seconds: number; trimBeforeSeconds: number; lines: Line[] }
  | { id: string; kind: "step"; seconds: number; step: number; title: string; clip: string; clipSeconds: number; lines: Line[] };

export type Lang = "en" | "ms";
export type Script = { voiceover: string; voiceName: string; scenes: Scene[] };

// The six screen recordings are shared by both languages. When a language needs a scene
// longer than its recording, the last frame is held.
const CLIP_SECONDS = { step1: 9, step2: 8, step3: 11, step4: 10, step5: 11, step6: 10 };
const step = (n: 1 | 2 | 3 | 4 | 5 | 6, seconds: number, title: string, lines: Line[]): Scene => ({
  id: `Step${n}`, kind: "step", seconds, step: n, title, clip: `clips/step${n}.mp4`, clipSeconds: CLIP_SECONDS[`step${n}`], lines,
});

export const SCRIPTS: Record<Lang, Script> = {
  en: {
    voiceover: "voiceover-en.mp3",
    voiceName: "Maya (ElevenLabs)",
    scenes: [
      {
        id: "Intro", kind: "hyperframes", seconds: 7.5, trimBeforeSeconds: 0,
        lines: [
          { from: 0.6, text: "Welcome to the AI Sandbox Prompt Vault.", audio: [0.00, 2.75] },
          { from: 3.7, text: "Here's how to build a great prompt in six simple steps.", audio: [3.02, 6.52] },
        ],
      },
      step(1, 9, "Choose what to create", [
        { from: 0.2, text: "Step one: choose what you want to create.", audio: [6.86, 9.45] },
        { from: 3.0, text: "Pick Slides, Infographic, Visual or Dashboard, or search for any task.", audio: [9.73, 15.02] },
      ]),
      step(2, 8, "Pick your AI tool", [
        { from: 0.3, text: "Step two: pick the AI tool you'll paste into.", audio: [15.38, 18.47] },
        { from: 3.7, text: "Each card now shows what that tool can do.", audio: [18.69, 21.22] },
      ]),
      step(3, 11, "Open a prompt and fill in the blanks", [
        { from: 0.3, text: "Step three: open a prompt and fill in the blanks.", audio: [21.56, 24.58] },
        { from: 3.7, text: "Type your topic and goal, and tap a quick pick like 10 slides.", audio: [24.83, 28.64] },
      ]),
      step(4, 10, "Choose role, audience and tone", [
        { from: 0.3, text: "Step four: choose the expert role, your audience and the tone.", audio: [29.00, 33.24] },
        { from: 4.9, text: "Every choice is written into the prompt for you.", audio: [33.53, 36.06] },
      ]),
      step(5, 11, "Pick a style and add your document", [
        { from: 0.3, text: "Step five: pick a visual style to set the look.", audio: [36.42, 39.55] },
        { from: 4.4, text: "Attached a file? Tell the AI how to use it, like as your data source.", audio: [39.85, 44.22] },
      ]),
      step(6, 10, "Copy, paste and check", [
        { from: 0.3, text: "Step six: check the finished prompt, then tap Copy.", audio: [44.56, 48.31] },
        { from: 4.6, text: "Paste it into your AI tool, and always check the answer before you use it.", audio: [48.54, 52.69] },
      ]),
      {
        id: "Outro", kind: "hyperframes", seconds: 7, trimBeforeSeconds: 7.5,
        lines: [
          { from: 0.6, text: "Open the Prompt Vault and try it today.", audio: [53.00, 55.12] },
          { from: 3.3, text: "Better questions in, better answers out.", audio: [55.34, 57.88] },
        ],
      },
    ],
  },
  ms: {
    voiceover: "voiceover-ms.mp3",
    voiceName: "Aisyah (ElevenLabs)",
    scenes: [
      {
        id: "Intro", kind: "hyperframes", seconds: 8.5, trimBeforeSeconds: 14.5,
        lines: [
          { from: 0.6, text: "Selamat datang ke AI Sandbox Prompt Vault.", audio: [0.04, 3.03] },
          { from: 3.95, text: "Begini cara membina prompt yang hebat dalam enam langkah mudah.", audio: [3.30, 7.19] },
        ],
      },
      step(1, 10, "Pilih apa yang hendak dihasilkan", [
        { from: 0.2, text: "Langkah satu: pilih apa yang anda mahu hasilkan.", audio: [7.50, 10.85] },
        { from: 3.85, text: "Pilih Slides, Infographic, Visual atau Dashboard, atau cari sebarang tugasan.", audio: [11.14, 16.85] },
      ]),
      step(2, 8, "Pilih alat AI anda", [
        { from: 0.3, text: "Langkah dua: pilih alat AI yang akan anda gunakan.", audio: [17.17, 20.85] },
        { from: 4.3, text: "Setiap kad kini menunjukkan keupayaan alat tersebut.", audio: [21.13, 24.34] },
      ]),
      step(3, 11, "Buka prompt dan isi tempat kosong", [
        { from: 0.3, text: "Langkah tiga: buka prompt dan isikan tempat kosong.", audio: [24.69, 28.32] },
        { from: 4.3, text: "Taip topik dan matlamat anda, dan tekan pilihan pantas seperti 10 slaid.", audio: [28.58, 33.51] },
      ]),
      step(4, 10, "Pilih peranan, khalayak dan nada", [
        { from: 0.3, text: "Langkah empat: pilih peranan pakar, khalayak dan nada.", audio: [33.81, 37.82] },
        { from: 4.9, text: "Setiap pilihan akan ditulis ke dalam prompt untuk anda.", audio: [38.12, 41.32] },
      ]),
      step(5, 11, "Pilih gaya dan tambah dokumen", [
        { from: 0.3, text: "Langkah lima: pilih gaya visual untuk menentukan rupanya.", audio: [41.61, 45.55] },
        { from: 4.65, text: "Ada fail dilampirkan? Beritahu AI cara menggunakannya, contohnya sebagai sumber data.", audio: [45.86, 51.64] },
      ]),
      step(6, 10.4, "Salin, tampal dan semak", [
        { from: 0.3, text: "Langkah enam: semak prompt yang siap, kemudian tekan Copy.", audio: [51.93, 55.97] },
        { from: 4.75, text: "Tampal ke alat AI anda, dan sentiasa semak jawapannya sebelum digunakan.", audio: [56.24, 61.32] },
      ]),
      {
        id: "Outro", kind: "hyperframes", seconds: 7, trimBeforeSeconds: 23,
        lines: [
          { from: 0.6, text: "Buka Prompt Vault dan cubalah hari ini.", audio: [61.56, 64.04] },
          { from: 3.4, text: "Soalan yang lebih baik, jawapan yang lebih baik.", audio: [64.24, 67.21] },
        ],
      },
    ],
  },
};

export const sceneFrames = (s: Scene) => Math.round(s.seconds * FPS);
export const totalFrames = (lang: Lang) => SCRIPTS[lang].scenes.reduce((n, s) => n + sceneFrames(s), 0);
