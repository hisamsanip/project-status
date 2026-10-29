import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBill } from './split.js';
import { allocate, parseMoney, formatRM } from './money.js';
import { parseReceipt } from './receipt.js';

const people = [{ id: 'a', name: 'Emms' }, { id: 'b', name: 'Kawan 1' }];
const items = [
  { id: 'i1', name: 'Nasi Goreng Kampung', qty: 1, amount: 1450, shareAll: false, ids: ['a'] },
  { id: 'i2', name: 'Tomyam Campur', qty: 1, amount: 2800, shareAll: true, ids: [] },
];

test('matches the JomSplit v1 screenshot', () => {
  const bill = computeBill({ people, items, charges: { sst: 6, service: 10, discount: 0 }, mode: 'prorata' });
  assert.equal(bill.subtotal, 4250);
  assert.equal(bill.sst, 255);
  assert.equal(bill.service, 425);
  assert.equal(bill.total, 4930);
  assert.deepEqual(bill.rows.map((r) => [r.food, r.extras, r.total]), [[2850, 456, 3306], [1400, 224, 1624]]);
  assert.ok(bill.balanced);
});

test('equal mode and discount still reconcile to the cent', () => {
  const bill = computeBill({ people, items, charges: { sst: 6, service: 10, discount: 333 }, mode: 'equal' });
  assert.equal(bill.total, 4597);
  assert.ok(Math.abs(bill.rows[0].extras - bill.rows[1].extras) <= 1);
  assert.ok(bill.balanced);
});

test('unassigned items are flagged, not silently charged', () => {
  const bill = computeBill({ people, items: [...items, { id: 'i3', name: 'Teh', qty: 1, amount: 350, shareAll: false, ids: [] }], charges: { sst: 6, service: 10, discount: 0 }, mode: 'prorata' });
  assert.equal(bill.unassigned, 350);
  assert.ok(!bill.balanced);
  assert.ok(bill.unallocated > 350);
});

test('allocate sums exactly', () => {
  assert.deepEqual(allocate(100, [1, 1, 1]), [34, 33, 33]);
  assert.equal(allocate(-101, [2, 3, 5]).reduce((a, b) => a + b), -101);
});

test('money parsing and formatting', () => {
  assert.equal(parseMoney('14.50'), 1450);
  assert.equal(parseMoney('RM 14,50'), 1450);
  assert.equal(parseMoney('1,234.5'), 123450);
  assert.ok(Number.isNaN(parseMoney('abc')));
  assert.equal(formatRM(4930), 'RM 49.30');
  assert.equal(formatRM(-500), '−RM 5.00');
});

test('receipt parser', () => {
  const r = parseReceipt([
    'RESTORAN SELERA KITA',
    'Tel: 03-1234 5678',
    '1 Nasi Goreng Kampung 14.50',
    'TOMYAM CAMPUR 28.00 SR',
    'Teh Tarik 2 x 3.50 7.00',
    'Subtotal 49.50',
    'SST 6% 2.97',
    'Service Charge 10% 4.95',
    'TOTAL 57.40',
  ]);
  assert.deepEqual(r.items.map((i) => [i.name, i.qty, i.amount]), [
    ['Nasi Goreng Kampung', 1, 1450],
    ['Tomyam Campur', 1, 2800],
    ['Teh Tarik', 2, 700],
  ]);
  assert.equal(r.sst, 6);
  assert.equal(r.service, 10);
  assert.equal(r.printedSubtotal, 4950);
});
