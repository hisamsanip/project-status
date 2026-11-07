import { RECEIPTS, buildBill } from '../data/receipts.js';

/**
 * PENGECAMAN RESIT SIMULASI.
 * Tiada imej dihantar ke mana-mana pelayan dan tiada model sebenar dijalankan.
 * Resit sampel dipilih secara deterministik daripada nama/saiz fail.
 */
export const STAGES = [
  { id: 'upload', label: 'Menerima gambar', ms: 500 },
  { id: 'read', label: 'Membaca teks resit', ms: 900 },
  { id: 'items', label: 'Mengesan item dan harga', ms: 900 },
  { id: 'tax', label: 'Menyemak SST dan caj perkhidmatan', ms: 600 },
  { id: 'score', label: 'Mengira skor keyakinan', ms: 500 },
];
export const TOTAL_MS = STAGES.reduce((s, x) => s + x.ms, 0);
export const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function validateFile(file) {
  if (!file) return { ok: false, message: 'Tiada fail dipilih.' };
  if (!OK_TYPES.includes(file.type))
    return { ok: false, message: 'Format tidak disokong. Guna gambar JPG, PNG, WebP atau HEIC.' };
  if (file.size > MAX_BYTES)
    return { ok: false, message: 'Gambar melebihi 8 MB. Ambil semula dengan resolusi lebih rendah.' };
  return { ok: true };
}

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Dibatalkan', 'AbortError')); }, { once: true });
  });

export async function runScan(file, { onStage, signal, forceFail = false } = {}) {
  let elapsed = 0;
  for (let i = 0; i < STAGES.length; i++) {
    onStage?.(i, elapsed / TOTAL_MS);
    await wait(STAGES[i].ms, signal);
    elapsed += STAGES[i].ms;
    if (forceFail && i === 1) {
      const e = new Error('Teks pada resit terlalu kabur untuk dibaca. Cuba ambil gambar semula dalam cahaya yang cukup.');
      e.code = 'BLUR';
      throw e;
    }
  }
  onStage?.(STAGES.length, 1);
  const seed = file ? (file.size + file.name.length) % RECEIPTS.length : 0;
  return buildBill({ ...RECEIPTS[seed], source: file ? 'upload-demo' : 'sample' });
}
