# Jom Split

Aplikasi bahagi bil lepas makan untuk kawan-kawan. Konsep reka bentuk: **Aurora Glass**.
Ini ialah mockup frontend yang berfungsi sepenuhnya dengan data contoh. Tiada pelayan, tiada AI sebenar.

## Cara jalankan

```bash
cd jom-split
npm install
npm run dev            # pembangunan, http://localhost:5173
npm run build          # dist/index.html (satu fail)
npm run build:artifact # dist/artifact.html (untuk diterbitkan sebagai Artifact)
npm run test:logic     # ujian unit pengiraan wang/pembahagian/penyelesaian
node scripts/contrast.mjs  # audit kontras WCAG AA bagi token warna
```

## Struktur

```
src/
  main.jsx, App.jsx        pintu masuk dan penghala hash (#beranda, #imbas, ...)
  styles/                  tokens.css (sistem reka bentuk) base / layout / components / pages
  data/                    people, receipts, history, nav (semua data contoh)
  lib/                     money, split, settle, suggest, ocr (simulasi), format  (+ ujian)
  hooks/                   useStore, useHashRoute, useCountUp, useSize, useSimulatedLoad, useCopy, useMedia
  components/ui/           Button, Field/Switch, Tabs, Badge, Avatar, Meter, Money, Feedback, Toasts, Icon, PageHeader
  components/layout/       AppShell, Sidebar, MobileNav, NavLinks, Brand, Aurora
  components/charts/       BarChart, BalanceChart, Sparkline  (SVG, tiada 3D)
  components/features/     ReceiptPanel, ItemRow, Suggestion, Dropzone, Processing
  pages/                   Home, Scan, Split, Summary, History, Friends, Settings
```

## Apa yang disimulasikan (jujur)

- **Pengecaman resit**: tiada OCR/model. Resit contoh dipilih daripada nama/saiz fail. Gambar tidak dibaca atau dihantar.
- **Skor keyakinan dan cadangan AI**: nilai contoh dan peraturan ringkas, bukan kebarangkalian model.
- **Data**: bil, rakan dan sejarah ialah rekaan. Disimpan dalam `localStorage` pelayar sahaja.
- **SST 6% dan servis 10%**: lalai boleh diubah. Semak resit sebenar kerana kadar dan asas pengiraan berbeza antara premis.
