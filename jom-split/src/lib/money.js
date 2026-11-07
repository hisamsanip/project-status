// Semua wang disimpan dalam sen (integer) supaya tiada ralat titik terapung.
const fmt = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatNumber(sen) {
  return fmt.format(sen / 100);
}

export function formatRM(sen, { signed = false } = {}) {
  const abs = formatNumber(Math.abs(sen));
  const sign = sen < 0 ? '-' : signed && sen > 0 ? '+' : '';
  return `${sign}RM ${abs}`;
}

/** Terima "12.5", "RM 12.50", "12,50" -> 1250. Pulangkan NaN jika tidak sah. */
export function parseRM(input) {
  const cleaned = String(input ?? '').replace(/RM/gi, '').replace(',', '.').trim();
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(cleaned)) return NaN;
  return Math.round(Number(cleaned) * 100);
}

/** Pembundaran 5 sen gaya Malaysia: 1-2 turun, 3-4 naik, 6-7 turun, 8-9 naik. */
export function roundTo5(sen) {
  const r = ((sen % 5) + 5) % 5;
  const base = sen - r;
  return r <= 2 ? base : base + 5;
}

/** Agih `total` sen mengikut berat, jumlahnya sentiasa tepat (largest remainder). */
export function distribute(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!weights.length || sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (w * total) / sum);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k].i] += 1;
  return out;
}
