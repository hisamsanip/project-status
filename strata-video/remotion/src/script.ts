// The whole video in one place: scene order, timing and on-screen text. Times are in seconds on
// the voiceover's timeline (the narration plays once, unbroken, from frame 0).

export const FPS = 30;
export const VOICEOVER = "voiceover-ms.mp3";

export type Point = { at: number; text: string };
export type Scene =
  | { id: string; kind: "hyperframes"; start: number; end: number; trimBeforeSeconds: number }
  | { id: string; kind: "image"; start: number; end: number; image: string; part: number; title: string; points: Point[] };

export const SCENES: Scene[] = [
  { id: "Intro", kind: "hyperframes", start: 0, end: 7.55, trimBeforeSeconds: 0 },
  {
    id: "Scene1", kind: "image", start: 7.55, end: 15.65, image: "scenes/scene1.jpg", part: 1,
    title: "Tinggal di bangunan strata?",
    points: [
      { at: 8.8, text: "Kondominium" },
      { at: 9.88, text: "Apartmen" },
      { at: 10.96, text: "Rumah berstrata" },
    ],
  },
  {
    id: "Scene2", kind: "image", start: 15.65, end: 32.65, image: "scenes/scene2.jpg", part: 2,
    title: "Apa itu Akta 757?",
    points: [
      { at: 16.0, text: "Akta Pengurusan Strata 2013" },
      { at: 19.7, text: "Mengawal selia pengurusan & penyenggaraan" },
      { at: 24.0, text: "Semenanjung Malaysia & WP Labuan" },
      { at: 28.9, text: "Hak & tanggungjawab pemilik petak" },
    ],
  },
  {
    id: "Scene3", kind: "image", start: 32.65, end: 54.15, image: "scenes/scene3.jpg", part: 3,
    title: "Siapa yang mengurus?",
    points: [
      { at: 36.3, text: "Tempoh Pengurusan Pemaju" },
      { at: 39.4, text: "JMB: Badan Pengurusan Bersama" },
      { at: 44.0, text: "MC: Perbadanan Pengurusan" },
      { at: 47.7, text: "Jawatankuasa dipilih dalam mesyuarat agung" },
    ],
  },
  {
    id: "Scene4", kind: "image", start: 54.15, end: 68.95, image: "scenes/scene4.jpg", part: 4,
    title: "Tanggungjawab pemilik",
    points: [
      { at: 56.3, text: "Bayar caj penyenggaraan" },
      { at: 57.8, text: "Sumbangan kumpulan wang penjelas" },
      { at: 60.7, text: "Gagal bayar: tindakan undang-undang" },
      { at: 64.6, text: "Pertikaian: Tribunal Pengurusan Strata" },
    ],
  },
  { id: "Outro", kind: "hyperframes", start: 68.95, end: 75.7, trimBeforeSeconds: 8 },
];

export const toFrames = (s: number) => Math.round(s * FPS);
export const sceneFrames = (s: Scene) => toFrames(s.end) - toFrames(s.start);
export const TOTAL_FRAMES = toFrames(SCENES[SCENES.length - 1].end);
export const IMAGE_PARTS = SCENES.filter(s => s.kind === "image").length;
