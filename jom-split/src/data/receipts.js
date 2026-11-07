// Resit sampel (rekaan). "Keyakinan" ialah nilai contoh untuk demo, bukan hasil model sebenar.
export const RECEIPTS = [
  {
    key: 'bunga-raya',
    title: 'Makan malam hujung minggu',
    venue: 'Kedai Makan Bunga Raya',
    items: [
      { name: 'Nasi Kandar Ayam', priceSen: 1250, confidence: 98 },
      { name: 'Nasi Lemak Rendang', priceSen: 990, confidence: 97 },
      { name: 'Mee Goreng Mamak', priceSen: 850, confidence: 96 },
      { name: 'Ikan Bakar (besar)', priceSen: 2800, confidence: 95, shared: true },
      { name: 'Sotong Goreng Tepung', priceSen: 1800, confidence: 71, shared: true },
      { name: 'Teh Tarik', priceSen: 280, confidence: 99 },
      { name: 'Teh Tarik', priceSen: 280, confidence: 99 },
      { name: 'Milo Ais', priceSen: 350, confidence: 98 },
      { name: 'Sirap Bandung', priceSen: 320, confidence: 94 },
      { name: 'Air Kelapa', priceSen: 450, confidence: 93 },
      { name: 'Roti Canai (2 keping)', priceSen: 400, confidence: 90 },
    ],
  },
  {
    key: 'pak-hassan',
    title: 'Makan tengah hari pasukan',
    venue: 'Warung Pak Hassan',
    items: [
      { name: 'Nasi Campur Ayam Masak Merah', priceSen: 1180, confidence: 97 },
      { name: 'Nasi Campur Daging Salai', priceSen: 1320, confidence: 96 },
      { name: 'Laksa Johor', priceSen: 980, confidence: 95 },
      { name: 'Kuih Muih (talam)', priceSen: 1600, confidence: 82, shared: true },
      { name: 'Teh O Ais Limau', priceSen: 220, confidence: 99 },
      { name: 'Kopi O Panas', priceSen: 200, confidence: 99 },
      { name: 'Air Tebu', priceSen: 350, confidence: 68 },
    ],
  },
];

let seq = 0;
export function buildBill(receipt) {
  seq += 1;
  return {
    id: `bill_${Date.now().toString(36)}_${seq}`,
    title: receipt.title,
    venue: receipt.venue,
    dateISO: new Date().toISOString().slice(0, 10),
    source: receipt.source ?? 'sample',
    items: receipt.items.map((it, i) => ({
      id: `it_${seq}_${i}`,
      name: it.name,
      priceSen: it.priceSen,
      confidence: it.confidence ?? 100,
      shared: !!it.shared,
      assignees: [],
    })),
    sstOn: true,
    serviceOn: true,
    sstRate: 0.06,
    serviceRate: 0.1,
    payerId: 'p1',
  };
}

/** Bil permulaan: sebahagian item sudah diagih supaya skrin pertama nampak hidup. */
export function initialBill() {
  const bill = buildBill({ ...RECEIPTS[0], source: 'sample' });
  const give = { 0: ['p1'], 1: ['p2'], 2: ['p3'], 5: ['p2'], 6: ['p4'], 7: ['p5'], 9: ['p1'], 10: ['p3', 'p4'] };
  bill.items.forEach((it, i) => { if (give[i]) it.assignees = give[i]; });
  bill.dateISO = '2026-11-06';
  return bill;
}
