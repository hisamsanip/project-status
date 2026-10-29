// All money is held as integer sen (cents) so totals never drift.

export function parseMoney(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? Math.round(input * 100) : NaN;
  const cleaned = String(input ?? '').trim().replace(/^RM\s*/i, '').replace(/\s/g, '');
  if (!cleaned) return NaN;
  // "1,234.50" → thousands comma; "14,50" → decimal comma
  const normalised = /,\d{2}$/.test(cleaned) && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalised)) return NaN;
  return Math.round(Number(normalised) * 100);
}

export function formatRM(sen, { sign = false } = {}) {
  const value = Math.abs(sen) / 100;
  const body = value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = sen < 0 ? '−' : sign && sen > 0 ? '+' : '';
  return `${prefix}RM ${body}`;
}

export function toInputValue(sen) {
  return sen ? (sen / 100).toFixed(2) : '';
}

/**
 * Split an integer total across weights so the parts sum exactly to the total
 * (largest-remainder method). Works for negative totals too.
 */
export function allocate(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!weights.length || sum <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (total * w) / sum);
  const parts = exact.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) parts[order[k][1]] += 1;
  return parts;
}
