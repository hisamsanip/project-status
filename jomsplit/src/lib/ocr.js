// On-device receipt OCR with Tesseract.js. The engine is fetched from a CDN
// the first time it is needed; the photo itself never leaves the browser.

const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
let loading;

function loadEngine() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TESSERACT_URL;
    s.async = true;
    s.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Enjin OCR tidak dapat dimuatkan.')));
    s.onerror = () => {
      loading = undefined;
      s.remove();
      reject(new Error('Tiada sambungan ke enjin OCR. Semak internet, atau guna tab "Tampal teks".'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Downscale and greyscale big phone photos: faster and usually more accurate. */
async function prepare(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.filter = 'grayscale(1) contrast(1.25)';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas;
}

/**
 * @param {File} file
 * @param {(stage: 'engine'|'read', progress: number) => void} onProgress
 * @returns {Promise<{lines: Array<{text: string, confidence: number}>, confidence: number}>}
 */
export async function recogniseReceipt(file, onProgress) {
  onProgress('engine', 0);
  const Tesseract = await loadEngine();
  const image = await prepare(file).catch(() => file);
  const { data } = await Tesseract.recognize(image, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress('read', m.progress);
      else onProgress('engine', m.progress ?? 0);
    },
  });
  const lines = (data.lines || []).map((l) => ({ text: l.text.trim(), confidence: Math.round(l.confidence) })).filter((l) => l.text);
  return { lines, confidence: Math.round(data.confidence) };
}
