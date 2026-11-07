import { distribute } from '../lib/money.js';

// Sejarah sampel (rekaan) bagi Jun–Nov 2026. Semua entri berlabel `sample: true`.
const RAW = [
  ['Makan malam hari lahir Farid', 'Kedai Makan Bunga Raya', '2026-06-06', 21460, 'p1', ['p1','p2','p3','p4','p5'], 2.1],
  ['Brunch Ahad', 'Kafe Sudut Hijau', '2026-06-21', 9840, 'p2', ['p1','p2','p4','p5'], 1.4],
  ['Steamboat hujung minggu', 'Restoran Pot Panas', '2026-07-12', 28600, 'p4', ['p1','p2','p3','p4','p5'], 3.2],
  ['Teh tarik lepas kerja', 'Warung Pak Hassan', '2026-07-25', 4150, 'p1', ['p1','p3','p5'], 0.8],
  ['Sarapan pasukan', 'Kedai Kopi Sri Muda', '2026-08-09', 7230, 'p5', ['p1','p2','p3','p5'], 1.6],
  ['Makan tengah hari Jumaat', 'Restoran Selera Kampung', '2026-08-15', 13380, 'p2', ['p1','p2','p3','p4','p5'], 2.4],
  ['Gathering rumah Mei Ling', 'Pesanan bawa pulang', '2026-08-30', 24200, 'p4', ['p1','p2','p3','p4','p5'], 4.1],
  ['BBQ tepi pantai', 'Pantai Bakar Seri Laut', '2026-09-13', 36890, 'p1', ['p1','p2','p3','p4','p5'], 2.9],
  ['Pencuci mulut lewat malam', 'Kafe Manis Malam', '2026-09-27', 8420, 'p3', ['p1','p3','p4','p5'], 1.2],
  ['Nasi kandar selepas filem', 'Kedai Makan Bunga Raya', '2026-10-04', 11940, 'p1', ['p1','p2','p3','p5'], 1.9],
  ['Makan malam pasukan', 'Restoran Selera Kampung', '2026-10-17', 22630, 'p5', ['p1','p2','p3','p4','p5'], 5.5],
  ['Brunch Ahad', 'Kafe Sudut Hijau', '2026-10-25', 10270, 'p2', ['p1','p2','p4','p5'], 3.0],
  ['Mee kari lewat petang', 'Warung Pak Hassan', '2026-11-02', 5760, 'p1', ['p1','p3','p5'], 6.0],
  ['Makan malam hujung minggu', 'Kedai Makan Bunga Raya', '2026-11-06', 18740, 'p3', ['p1','p2','p3','p4','p5'], 1.0],
];

// Bahagian tidak sama rata secara deterministik (bukan rawak) supaya demo stabil.
const WEIGHTS = [1.0, 1.25, 0.85, 1.1, 0.95];
// Yang masih belum bayar (selain pembayar): hanya entri terkini.
const UNPAID = {
  10: ['p2', 'p4'],
  11: ['p4', 'p5'],
  12: ['p3', 'p5'],
  13: ['p1', 'p2', 'p4', 'p5'],
};

export const HISTORY = RAW.map(([title, venue, dateISO, totalSen, payerId, who, settleDays], idx) => {
  const w = who.map((id) => WEIGHTS[Number(id.slice(1)) - 1]);
  const parts = distribute(totalSen, w);
  const shares = Object.fromEntries(who.map((id, i) => [id, parts[i]]));
  const unpaid = UNPAID[idx] ?? [];
  const paid = Object.fromEntries(who.filter((id) => id !== payerId && !unpaid.includes(id)).map((id) => [id, true]));
  return { id: `h${idx + 1}`, title, venue, dateISO, totalSen, payerId, shares, paid, settleDays, sample: true };
});
