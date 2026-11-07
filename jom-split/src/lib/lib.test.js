import test from 'node:test';
import assert from 'node:assert/strict';
import { distribute, roundTo5, parseRM, formatRM } from './money.js';
import { computeBill } from './split.js';
import { minimizeTransfers, netBalances, grossFor } from './settle.js';

test('roundTo5 mengikut peraturan Malaysia', () => {
  const expect = { 100: 100, 101: 100, 102: 100, 103: 105, 104: 105, 105: 105, 106: 105, 107: 105, 108: 110, 109: 110 };
  for (const [k, v] of Object.entries(expect)) assert.equal(roundTo5(Number(k)), v, k);
});

test('distribute sentiasa menjumlah tepat', () => {
  for (const total of [1, 100, 1001, 2999, 12345]) {
    for (const w of [[1], [1, 1], [1, 1, 1], [3, 5, 7, 11], [0, 4, 0]]) {
      const parts = distribute(total, w);
      assert.equal(parts.reduce((a, b) => a + b, 0), total);
    }
  }
  assert.deepEqual(distribute(100, [0, 0]), [0, 0]);
});

test('parseRM dan formatRM', () => {
  assert.equal(parseRM('12.5'), 1250);
  assert.equal(parseRM('RM 9.90'), 990);
  assert.equal(parseRM('12,50'), 1250);
  assert.ok(Number.isNaN(parseRM('abc')));
  assert.ok(Number.isNaN(parseRM('-3')));
  assert.equal(formatRM(123456), 'RM 1,234.56');
  assert.equal(formatRM(-500, { signed: true }), '-RM 5.00');
});

const people = ['a', 'b', 'c'].map((id) => ({ id }));
const mk = (items, extra = {}) => ({
  items, sstOn: true, serviceOn: true, sstRate: 0.06, serviceRate: 0.1, payerId: 'a', ...extra,
});

test('computeBill: jumlah semua bahagian = jumlah bil', () => {
  const bill = mk([
    { priceSen: 1250, assignees: ['a'] },
    { priceSen: 2800, assignees: ['a', 'b', 'c'] },
    { priceSen: 990, assignees: ['b'] },
    { priceSen: 333, assignees: ['b', 'c'] },
  ]);
  const r = computeBill(bill, people);
  assert.equal(r.assignedSen, 1250 + 2800 + 990 + 333);
  assert.equal(r.serviceSen, Math.round(r.assignedSen * 0.1));
  assert.equal(r.rows.reduce((s, x) => s + x.dueSen, 0), r.grandSen);
  assert.equal(r.rows.reduce((s, x) => s + x.totalSen, 0), r.grandSen);
  for (const row of r.rows) if (row.id !== 'a') assert.equal(row.dueSen % 5, 0);
});

test('computeBill: item belum diagih tidak dikenakan cukai', () => {
  const r = computeBill(mk([{ priceSen: 1000, assignees: [] }]), people);
  assert.equal(r.grandSen, 0);
  assert.equal(r.unassignedSen, 1000);
  assert.equal(r.unassignedCount, 1);
});

test('computeBill: cukai dan servis boleh dimatikan', () => {
  const r = computeBill(mk([{ priceSen: 1000, assignees: ['b'] }], { sstOn: false, serviceOn: false }), people);
  assert.equal(r.grandSen, 1000);
});

test('minimizeTransfers melunaskan semua baki', () => {
  const net = { a: 5000, b: -3000, c: -2000, d: 0 };
  const t = minimizeTransfers(net);
  assert.equal(t.length, 2);
  const after = { ...net };
  for (const x of t) { after[x.from] += x.amountSen; after[x.to] -= x.amountSen; }
  assert.ok(Object.values(after).every((v) => v === 0));
});

test('netBalances abaikan yang sudah bayar dan pembayar sendiri', () => {
  const h = [{ payerId: 'a', shares: { a: 1000, b: 2000, c: 3000 }, paid: { c: true } }];
  const n = netBalances(h, ['a', 'b', 'c']);
  assert.deepEqual(n, { a: 2000, b: -2000, c: 0 });
});

test('grossFor memisahkan terima dan bayar', () => {
  const h = [
    { payerId: 'a', shares: { a: 1000, b: 2000, c: 3000 }, paid: { c: true } },
    { payerId: 'b', shares: { a: 500, b: 500 }, paid: {} },
  ];
  assert.deepEqual(grossFor(h, 'a'), { receive: 2000, pay: 500 });
  assert.deepEqual(grossFor(h, 'b'), { receive: 500, pay: 2000 });
});
