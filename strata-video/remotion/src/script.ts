// The whole video in one place: scene order, timing and on-screen text. Times are in seconds on
// the voiceover's timeline (the narration plays once, unbroken, from frame 0).

export const FPS = 30;
export const VOICEOVER = "voiceover-ms.mp3";

export type Point = { at: number; text: string };
export type Scene =
  | { id: string; kind: "hyperframes"; start: number; end: number; trimBeforeSeconds: number }
  | { id: string; kind: "image"; start: number; end: number; image: string; part: number; title: string; points: Point[] };

export const SCENES: Scene[] = [
  { id: "Intro", kind: "hyperframes", start: 0, end: 7.7, trimBeforeSeconds: 0 },
  {
    id: "Scene1", kind: "image", start: 7.7, end: 16.0, image: "scenes/scene1.jpg", part: 1,
    title: "Tinggal di bangunan strata?",
    points: [
      { at: 9.1, text: "Kondominium" },
      { at: 10.2, text: "Apartmen" },
      { at: 11.3, text: "Rumah berstrata" },
    ],
  },
  {
    id: "Scene2", kind: "image", start: 16.0, end: 33.8, image: "scenes/scene2.jpg", part: 2,
    title: "Apa itu Akta 757?",
    points: [
      { at: 16.4, text: "Akta Pengurusan Strata 2013" },
      { at: 21.1, text: "Mengawal selia pengurusan & penyenggaraan" },
      { at: 25.0, text: "Semenanjung Malaysia & WP Labuan" },
      { at: 30.0, text: "Hak & tanggungjawab pemilik petak" },
    ],
  },
  {
    id: "Scene3", kind: "image", start: 33.8, end: 51.0, image: "scenes/scene3.jpg", part: 3,
    title: "Siapa yang mengurus?",
    points: [
      { at: 36.6, text: "JMB: Badan Pengurusan Bersama (peringkat awal)" },
      { at: 40.7, text: "MC: Perbadanan Pengurusan (seterusnya)" },
      { at: 44.4, text: "Jawatankuasa dipilih dalam mesyuarat agung" },
      { at: 48.2, text: "Penyenggaraan · Kemudahan · Bajet" },
    ],
  },
  {
    id: "Scene4", kind: "image", start: 51.0, end: 65.8, image: "scenes/scene4.jpg", part: 4,
    title: "Tanggungjawab pemilik",
    points: [
      { at: 53.2, text: "Bayar caj penyenggaraan" },
      { at: 54.7, text: "Sumbangan kumpulan wang penjelas" },
      { at: 57.6, text: "Gagal bayar: tindakan undang-undang" },
      { at: 61.5, text: "Pertikaian: Tribunal Pengurusan Strata" },
    ],
  },
  { id: "Outro", kind: "hyperframes", start: 65.8, end: 72.6, trimBeforeSeconds: 8 },
];

export const toFrames = (s: number) => Math.round(s * FPS);
export const sceneFrames = (s: Scene) => toFrames(s.end) - toFrames(s.start);
export const TOTAL_FRAMES = toFrames(SCENES[SCENES.length - 1].end);
export const IMAGE_PARTS = SCENES.filter(s => s.kind === "image").length;
