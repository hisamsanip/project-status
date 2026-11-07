import { formatRM } from './money.js';

/**
 * Cadangan "AI" dalam demo ini dijana oleh peraturan ringkas (item kongsi, harga
 * yang kurang yakin, orang tanpa item). Skor ialah nilai heuristik, bukan kebarangkalian
 * daripada model. UI melabelkannya sebagai demo.
 */
export function buildSuggestions(bill, people, calc) {
  const out = [];
  for (const it of bill.items) {
    if (it.confidence < 80) {
      out.push({
        id: `low-${it.id}`, kind: 'review', itemId: it.id, confidence: it.confidence,
        text: `Harga "${it.name}" mungkin tersalah baca. Semak sebelum mengira.`,
        action: 'Semak harga',
      });
    }
  }
  for (const it of bill.items) {
    if (!it.assignees.length && (it.shared || it.priceSen >= 1500)) {
      const each = Math.round(it.priceSen / Math.max(people.length, 1));
      out.push({
        id: `share-${it.id}`, kind: 'share', itemId: it.id, confidence: it.shared ? 88 : 74,
        text: `"${it.name}" nampak seperti hidangan kongsi. Bahagi ${people.length} orang, kira-kira ${formatRM(each)} seorang.`,
        action: 'Kongsi semua',
      });
    }
  }
  const assignedAny = calc.assignedSen > 0;
  for (const r of calc.rows) {
    if (assignedAny && r.items === 0) {
      const p = people.find((x) => x.id === r.id);
      out.push({
        id: `none-${r.id}`, kind: 'info', confidence: 62,
        text: `${p?.name ?? 'Seorang rakan'} belum ada sebarang item. Mungkin dia tak makan, atau terlupa diagih?`,
        action: 'Faham',
      });
    }
  }
  return out.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}
