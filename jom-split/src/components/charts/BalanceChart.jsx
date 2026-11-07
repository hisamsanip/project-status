import { useSize } from '../../hooks/useSize.js';
import { formatRM } from '../../lib/money.js';

/**
 * Carta bar mendatar: bahagian setiap orang (RM). Bar penuh bermula pada 0.
 * Warna hijau + label "Dibayar" untuk yang sudah bayar (bukan warna sahaja).
 */
export default function BalanceChart({ rows, caption }) {
  const [ref, width] = useSize(520);
  const compact = width < 420;
  const nameW = compact ? 64 : 88;
  const valW = compact ? 84 : 100;
  const RH = 44;
  const m = { t: 8, b: 32 };
  const H = rows.length * RH + m.t + m.b;
  const iw = Math.max(width - nameW - valW - 8, 40);
  const max = Math.max(...rows.map((r) => r.value), 1);
  const stepRaw = max / 100 / 3;
  const step = [5, 10, 20, 25, 50, 100, 200].find((s) => s >= stepRaw) ?? 200;
  const xMaxRM = Math.ceil(max / 100 / step) * step;
  const x = (sen) => nameW + (sen / 100 / xMaxRM) * iw;
  const ticks = [];
  for (let v = 0; v <= xMaxRM; v += step) ticks.push(v);

  return (
    <div ref={ref} className="chart">
      <svg width={width} height={H} role="img" aria-label={caption} className="chart__svg">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={nameW + (v / xMaxRM) * iw} x2={nameW + (v / xMaxRM) * iw} y1={m.t} y2={H - m.b} className={v === 0 ? 'chart__base' : 'chart__grid'} />
            <text x={nameW + (v / xMaxRM) * iw} y={H - 12} textAnchor="middle" className="chart__tick">{v}</text>
          </g>
        ))}
        <text x={width - valW + 4} y={H - 12} className="chart__axis-title">RM</text>
        {rows.map((r, i) => {
          const cy = m.t + i * RH + RH / 2;
          const w = Math.max(x(r.value) - nameW, r.value > 0 ? 3 : 0);
          return (
            <g key={r.id}>
              <text x={0} y={cy + 4} className="chart__label chart__label--left">{r.name}</text>
              <rect x={nameW} y={cy - 10} width={w} height={20} rx={6} fill={r.paid ? '#5cd6a0' : '#5eead4'} fillOpacity={r.paid ? 0.55 : r.payer ? 0.35 : 0.85} />
              <text x={nameW + w + 8} y={r.paid || r.payer ? cy - 2 : cy + 4} className={`chart__value chart__value--left${r.paid ? ' is-good' : ''}`}>
                {formatRM(r.value)}
              </text>
              {(r.paid || r.payer) && (
                <text x={nameW + w + 8} y={cy + 13} className={`chart__status${r.paid ? ' is-good' : ''}`}>
                  {r.paid ? 'Dibayar' : 'Pembayar'}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="sr-only"><table>
        <caption>{caption}</caption>
        <thead><tr><th>Nama</th><th>Jumlah (RM)</th><th>Status</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{r.name}</td><td>{(r.value / 100).toFixed(2)}</td><td>{r.paid ? 'Dibayar' : r.payer ? 'Pembayar' : 'Belum bayar'}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
