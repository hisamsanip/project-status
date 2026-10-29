# JomSplit · Kongsi Bil Pintar

A redesign of JomSplit, a bill-splitting calculator for groups eating out in Malaysia. It was rebuilt from the v1 app (imaginative-narwhal-d6938e.netlify.app) and keeps all of its features and its calculation rules.

**Design concept: "Kertas & Pandan".** The look is warm receipt paper, ink-black type and a single pandan-green accent for anything that means "settled". Money is always set in JetBrains Mono, like a printed receipt, and the summary panel has a torn-paper edge. Headlines use Bricolage Grotesque and the interface uses Inter. Light and dark themes are included.

## Features

| Area | What it does |
| --- | --- |
| 01 Geng makan | Add up to 10 people with colour-coded avatars. Duplicate and empty names are blocked, and you can undo a removal. |
| 02 Makanan & harga | Enter an item name, a quantity stepper and the line total in RM. Edit or delete inline, with undo. Assign each item with "Kongsi semua" or per-person chips. Unassigned items are flagged. |
| Imbas resit | On-device OCR (Tesseract.js, loaded on demand). It runs in three stages (engine → read → parse) and shows a confidence score for each line. Rows can be edited before import, the SST and service rates are detected, and the total is checked against the printed subtotal. A "Tampal teks" tab parses pasted receipt text without OCR. |
| 03 Cukai & servis | SST %, service %, a discount in RM and presets. Extra charges are split pro-rata or equally. |
| 04 Siapa bayar berapa | A live receipt with a share bar, an expandable breakdown per person and a check that the shares add up to the bill to the cent. Copy the summary for WhatsApp, open it with wa.me, or copy one person's share. |

The bill is saved in `localStorage`. The top bar has a sample bill, "Bil baru" (with a confirm step and undo) and a theme toggle.

## Calculation (unchanged from v1)

SST and service charge are each calculated on the food subtotal, and the discount comes off the end. Amounts are held as integer sen, and every split uses the largest-remainder method, so the per-person totals always add up exactly to the grand total. With the v1 sample bill the result is still Emms RM 33.06 and Kawan 1 RM 16.24 (see `src/lib/split.test.js`).

## Develop

```bash
cd jomsplit
npm install
npm test         # bill maths + receipt parser
npm run dev
npm run build    # writes one self-contained file: ../JomSplit.html
```

`JomSplit.html` opens straight from disk or from any static host. For Netlify, publish it as `index.html`, or drag in `jomsplit/dist/`. The fonts and the OCR engine load from the internet, and receipt photos never leave the browser.

Stack: React 18, Vite, Framer Motion, Lucide icons and plain CSS with design tokens (`src/styles/tokens.css`).
