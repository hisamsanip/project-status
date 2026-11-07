import { distribute, roundTo5 } from './money.js';

/**
 * Kira bahagian setiap orang.
 * - Item dikongsi dibahagi sama rata (sen berbaki diberi mengikut largest remainder).
 * - Caj perkhidmatan dan SST dikira atas item yang SUDAH diagih sahaja, dan diagih
 *   mengikut nisbah subjumlah setiap orang.
 * - Pembundaran 5 sen dikenakan pada bukan-pembayar; pembayar menanggung bezanya,
 *   jadi jumlah semua bahagian sentiasa sama dengan jumlah bil sebenar.
 */
export function computeBill(bill, people, { round5 = true } = {}) {
  const ids = people.map((p) => p.id);
  const sub = Object.fromEntries(ids.map((id) => [id, 0]));
  const itemCount = Object.fromEntries(ids.map((id) => [id, 0]));
  let assignedSen = 0;
  let unassignedSen = 0;
  let unassignedCount = 0;

  for (const item of bill.items) {
    const who = item.assignees.filter((id) => id in sub);
    if (!who.length) {
      unassignedSen += item.priceSen;
      unassignedCount += 1;
      continue;
    }
    const parts = distribute(item.priceSen, who.map(() => 1));
    who.forEach((id, i) => {
      sub[id] += parts[i];
      itemCount[id] += 1;
    });
    assignedSen += item.priceSen;
  }

  const serviceSen = bill.serviceOn ? Math.round(assignedSen * bill.serviceRate) : 0;
  const sstSen = bill.sstOn ? Math.round((assignedSen + serviceSen) * bill.sstRate) : 0;
  const weights = ids.map((id) => sub[id]);
  const svc = distribute(serviceSen, weights);
  const sst = distribute(sstSen, weights);

  let roundingSen = 0;
  const rows = ids.map((id, i) => {
    const totalSen = sub[id] + svc[i] + sst[i];
    let dueSen = totalSen;
    if (round5 && id !== bill.payerId) {
      dueSen = roundTo5(totalSen);
      roundingSen += dueSen - totalSen;
    }
    return { id, items: itemCount[id], subSen: sub[id], serviceSen: svc[i], sstSen: sst[i], totalSen, dueSen };
  });
  // Pembayar menanggung pelarasan supaya jumlah kekal tepat.
  const payerRow = rows.find((r) => r.id === bill.payerId);
  if (payerRow) payerRow.dueSen = payerRow.totalSen - roundingSen;

  return {
    rows,
    assignedSen,
    unassignedSen,
    unassignedCount,
    serviceSen,
    sstSen,
    roundingSen,
    grandSen: assignedSen + serviceSen + sstSen,
    receiptSubSen: assignedSen + unassignedSen,
  };
}
