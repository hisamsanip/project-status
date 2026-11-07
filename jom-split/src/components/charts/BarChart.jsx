import { useId } from 'react';
import { useSize } from '../../hooks/useSize.js';

function niceStep(max) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

/**
 * Carta bar tegak, dilukis pada piksel sebenar.
 * Paksi-Y bermula pada 0 (tiada pemotongan), unit RM, label terus di atas bar.
 * `partial` = bulan belum lengkap (corak jalur + nota).
 */
export default function BarChart({ data, unit = 'RM', yTitle, caption }) {
  const [ref, width] = useSize(560);
  const uid = useId().replace(/:/g, '');
  const compact = width < 420;
  const m = { t: 36, r: 8, b: 32, l: compact ? 36 : 44 };
  const H = compact ? 240 : 280;
  const max = Math.max(...data.map((d) => d.value), 1);
  const step = niceStep(max);
  const yMax = Math.ceil(max / step) * step;
  const iw = Math.max(width - m.l - m.r, 40);
  const ih = H - m.t - m.b;
  const y = (v) => m.t + ih - (v / yMax) * ih;
  const slot = iw / data.length;
  const bw = Math.min(56, slot * 0.58);
  const ticks = [];
  for (let v = 0; v <= yMax + 0.001; v += step) ticks.push(v);
  const last = data.length - 1;

  return (
    <div ref={ref} className="chart">
      <svg width={width} height={H} role="img" aria-label={caption} className="chart__svg">
        <defs>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="1" stopColor="#5b8def" />
          </linearGradient>
          <pattern id={`p${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#5b8def" fillOpacity="0.18" />
            <rect width="2" height="6" fill="#5eead4" fillOpacity="0.55" />
          </pattern>
        </defs>
        <text x={0} y={14} className="chart__axis-title">{yTitle}</text>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} className={v === 0 ? 'chart__base' : 'chart__grid'} />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" className="chart__tick">{v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = m.l + slot * i + slot / 2;
          const top = y(d.value);
          const isLast = i === last;
          const fill = d.partial ? `url(#p${uid})` : isLast ? `url(#g${uid})` : '#5b8def';
          return (
            <g key={d.label}>
              <rect
                x={cx - bw / 2} y={top} width={bw} height={Math.max(y(0) - top, 1)} rx={6}
                fill={fill} fillOpacity={d.partial || isLast ? 1 : 0.72}
                stroke={d.partial ? '#5eead4' : 'none'} strokeOpacity="0.5" strokeDasharray={d.partial ? '3 3' : undefined}
              />
              <text x={cx} y={top - 8} textAnchor="middle" className={`chart__value${isLast ? ' is-strong' : ''}`}>
                {unit} {Math.round(d.value)}
              </text>
              <text x={cx} y={H - 10} textAnchor="middle" className="chart__label">{d.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="sr-only"><table>
        <caption>{caption}</caption>
        <thead><tr><th>Bulan</th><th>{yTitle}</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td>{Math.round(d.value)}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}
