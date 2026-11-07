// Semak nisbah kontras WCAG bagi pasangan teks/latar dalam tokens.css
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const bg = { bg: '#070b14', surface: '#0c1220', 'surface-2': '#121a2c', 'surface-3': '#1a2440', 'glass-worst': '#1b3a4a' };
const fg = { text: '#eaeef8', 'text-2': '#aab5cd', 'text-3': '#8f9bb6', accent: '#5eead4', good: '#5cd6a0', warn: '#f2b544', bad: '#ff8a97', focus: '#9fb8ff' };
let fail = 0;
for (const [fn, f] of Object.entries(fg))
  for (const [bn, b] of Object.entries(bg)) {
    const r = ratio(f, b);
    const ok = r >= 4.5;
    if (!ok) fail++;
    console.log(`${ok ? 'LULUS' : 'GAGAL'}  ${fn.padEnd(7)} atas ${bn.padEnd(11)} ${r.toFixed(2)}:1`);
  }
console.log('on-accent atas accent', ratio('#04201c', '#5eead4').toFixed(2) + ':1');
console.log('on-accent atas teal  ', ratio('#04201c', '#2dd4bf').toFixed(2) + ':1');
process.exit(fail ? 1 : 0);
