import { allocate } from './money.js';

export const MAX_PEOPLE = 10;

export const SPLIT_MODES = {
  prorata: { label: 'Ikut kadar pesanan (pro-rata)', short: 'Pro-rata', hint: 'Cukai, servis dan diskaun ikut nisbah makanan setiap orang.' },
  equal: { label: 'Bahagi sama rata', short: 'Sama rata', hint: 'Cukai, servis dan diskaun dibahagi sama rata antara yang makan.' },
};

/** Who shares an item: everyone when "Kongsi Semua" is on, else the picked people still in the group. */
export function participantsOf(item, people) {
  if (item.shareAll) return people.map((p) => p.id);
  const ids = new Set(people.map((p) => p.id));
  return item.ids.filter((id) => ids.has(id));
}

/**
 * Compute the bill. SST and service charge are both taken on the food
 * subtotal (same rule as JomSplit v1); the discount comes off the end.
 */
export function computeBill({ people, items, charges, mode }) {
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const sst = Math.round((subtotal * (Number(charges.sst) || 0)) / 100);
  const service = Math.round((subtotal * (Number(charges.service) || 0)) / 100);
  const discount = Math.min(Math.max(charges.discount || 0, 0), subtotal + sst + service);
  const total = subtotal + sst + service - discount;

  const byPerson = new Map(people.map((p) => [p.id, { person: p, food: 0, extras: 0, total: 0, lines: [] }]));
  let unassigned = 0;
  const unassignedItems = [];

  for (const item of items) {
    const who = participantsOf(item, people);
    if (!who.length) {
      unassigned += item.amount;
      unassignedItems.push(item);
      continue;
    }
    const shares = allocate(item.amount, who.map(() => 1));
    who.forEach((id, i) => {
      const row = byPerson.get(id);
      row.food += shares[i];
      row.lines.push({ itemId: item.id, name: item.name, qty: item.qty, amount: shares[i], sharedWith: who.length });
    });
  }

  const assigned = subtotal - unassigned;
  const extrasAll = sst + service - discount;
  // Extras that belong to unassigned food stay unallocated until someone claims it.
  const extrasAssigned = subtotal ? Math.round((extrasAll * assigned) / subtotal) : 0;

  const eaters = [...byPerson.values()].filter((r) => r.food > 0);
  const weights = eaters.map((r) => (mode === 'equal' ? 1 : r.food));
  allocate(extrasAssigned, weights).forEach((x, i) => {
    eaters[i].extras = x;
  });
  for (const row of byPerson.values()) row.total = row.food + row.extras;

  const rows = [...byPerson.values()];
  const allocated = rows.reduce((s, r) => s + r.total, 0);

  return {
    subtotal,
    sst,
    service,
    discount,
    total,
    rows,
    unassigned,
    unassignedItems,
    unallocated: total - allocated,
    balanced: total === allocated,
  };
}
