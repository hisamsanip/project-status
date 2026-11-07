/** Garis mini dengan isi kawasan dan titik akhir ditekankan. Nilai min/maks dilabel oleh pemanggil. */
export default function Sparkline({ values, w = 128, h = 40, label }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;
  const pts = values.map((v, i) => [pad + (i / (values.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / span) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts.at(-1)[0]} ${h} L${pts[0][0]} ${h} Z`;
  const end = pts.at(-1);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="spark">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5eead4" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5eead4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="#5eead4" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={end[0]} cy={end[1]} r="6" fill="#5eead4" fillOpacity="0.2" />
      <circle cx={end[0]} cy={end[1]} r="3" fill="#5eead4" />
    </svg>
  );
}
