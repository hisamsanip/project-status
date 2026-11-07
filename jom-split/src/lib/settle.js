/** Baki bersih setiap orang daripada sejarah: positif = patut terima, negatif = patut bayar. */
export function netBalances(history, peopleIds) {
  const net = Object.fromEntries(peopleIds.map((id) => [id, 0]));
  for (const h of history) {
    for (const [pid, share] of Object.entries(h.shares)) {
      if (pid === h.payerId || h.paid[pid]) continue;
      if (pid in net) net[pid] -= share;
      if (h.payerId in net) net[h.payerId] += share;
    }
  }
  return net;
}

/** Bilangan pindahan paling sedikit untuk melunaskan semua baki (algoritma tamak). */
export function minimizeTransfers(net) {
  const debtors = [];
  const creditors = [];
  for (const [id, v] of Object.entries(net)) {
    if (v < 0) debtors.push({ id, v: -v });
    else if (v > 0) creditors.push({ id, v });
  }
  debtors.sort((a, b) => b.v - a.v);
  creditors.sort((a, b) => b.v - a.v);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].id, to: creditors[j].id, amountSen: amt });
    debtors[i].v -= amt;
    creditors[j].v -= amt;
    if (debtors[i].v === 0) i++;
    if (creditors[j].v === 0) j++;
  }
  return out;
}

/** Pasangan hutang mentah (tanpa pengoptimuman) untuk perbandingan. */
export function rawPairCount(history) {
  const pairs = new Set();
  for (const h of history)
    for (const pid of Object.keys(h.shares))
      if (pid !== h.payerId && !h.paid[pid]) pairs.add(`${pid}>${h.payerId}`);
  return pairs.size;
}

/** Jumlah kasar untuk seorang: berapa orang lain patut bayar kepadanya, dan berapa dia patut bayar. */
export function grossFor(history, id) {
  let receive = 0;
  let pay = 0;
  for (const h of history) {
    for (const [pid, share] of Object.entries(h.shares)) {
      if (pid === h.payerId || h.paid[pid]) continue;
      if (h.payerId === id) receive += share;
      if (pid === id) pay += share;
    }
  }
  return { receive, pay };
}
