// Turns raw receipt text (typed, pasted or from OCR) into bill items.
// Rules only — nothing leaves the browser.

const SKIP = /\b(sub\s*-?total|total|jumlah|grand|amount\s*due|sst|gst|tax|cukai|service|servis|svc|rounding|bundar|cash|tunai|change|baki|card|visa|master|debit|credit|paid|bayar|balance|discount|diskaun|tip|qty|price|harga|invoice|receipt|resit|table|meja|pax|tel|date|tarikh|time|masa|cashier|thank|terima)\b/i;
const PRICE_AT_END = /(?:RM\s*)?(\d{1,5}[.,]\d{2})\s*(?:[A-Z]{1,2})?\s*$/i;
const QTY_LEAD = /^(\d{1,2})\s*(?:x|X|@|\*)?\s+(?=\D)/;
const QTY_INLINE = /\s(?:x|X)\s?(\d{1,2})\b|\b(\d{1,2})\s?(?:x|X)\s/;

const toSen = (s) => Math.round(Number(s.replace(',', '.')) * 100);

function percentFor(re, text) {
  const m = text.match(re);
  return m ? Number(m[1]) : null;
}

/**
 * @param {Array<string|{text:string, confidence?:number}>} lines
 * @returns {{items: Array, sst: number|null, service: number|null, printedSubtotal: number|null, skipped: number}}
 */
export function parseReceipt(lines) {
  const items = [];
  let sst = null;
  let service = null;
  let printedSubtotal = null;
  let skipped = 0;

  for (const entry of lines) {
    const raw = (typeof entry === 'string' ? entry : entry.text).replace(/\s+/g, ' ').trim();
    const confidence = typeof entry === 'string' ? null : entry.confidence ?? null;
    if (!raw) continue;

    sst ??= percentFor(/(?:sst|gst|tax|cukai)[^\d%]{0,12}(\d{1,2}(?:\.\d)?)\s*%/i, raw);
    service ??= percentFor(/(?:service|servis|svc|s\/c)[^\d%]{0,16}(\d{1,2}(?:\.\d)?)\s*%/i, raw);

    const price = raw.match(PRICE_AT_END);
    if (!price) continue;
    if (SKIP.test(raw)) {
      if (/sub\s*-?total/i.test(raw)) printedSubtotal = toSen(price[1]);
      skipped++;
      continue;
    }

    let rest = raw.slice(0, price.index).trim();
    let qty = 1;
    const lead = rest.match(QTY_LEAD);
    if (lead) {
      qty = Number(lead[1]);
      rest = rest.slice(lead[0].length);
    } else {
      const inline = rest.match(QTY_INLINE);
      if (inline) {
        qty = Number(inline[1] || inline[2]);
        rest = rest.replace(inline[0], ' ');
      }
    }
    // Drop a unit price printed before the line total, e.g. "Teh Tarik 2 x 3.50 7.00".
    rest = rest.replace(/(?:RM\s*)?\d{1,5}[.,]\d{2}\s*$/i, '').replace(/[|_~=*#:]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (rest.replace(/[^a-z]/gi, '').length < 2) {
      skipped++;
      continue;
    }
    const amount = toSen(price[1]);
    if (amount <= 0) continue;
    items.push({ name: titleCase(rest), qty: Math.max(1, qty || 1), amount, raw, confidence });
  }

  return { items, sst, service, printedSubtotal, skipped };
}

function titleCase(s) {
  return s.toLowerCase().replace(/(^|\s|\()(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).slice(0, 48);
}
