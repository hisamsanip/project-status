import { motion } from 'framer-motion';

// Radar of maturity per function: current (filled) vs target (dashed).
export default function Radar({ axes, current, target, size = 320 }) {
  const c = size / 2;
  const R = size / 2 - 34;
  const n = axes.length;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / 5), c + Math.sin(a) * R * (v / 5)];
  };
  const poly = (vals) => vals.map((v, i) => pt(i, v).join(',')).join(' ');

  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Maturity radar: current versus target per function">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b8f28a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4fd1a5" stopOpacity="0.08" />
        </radialGradient>
      </defs>
      {[1, 2, 3, 4, 5].map((l) => (
        <polygon key={l} points={poly(Array(n).fill(l))} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 5);
        const [lx, ly] = pt(i, 5.9);
        return (
          <g key={a}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="var(--line)" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="radar-label">
              {a}
            </text>
          </g>
        );
      })}
      <polygon points={poly(target)} fill="none" stroke="var(--sun)" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.85" />
      <motion.polygon
        points={poly(current)}
        fill="url(#radarFill)"
        stroke="var(--leaf)"
        strokeWidth="1.6"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
      />
      {current.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="2.6" fill="var(--leaf)" />;
      })}
    </svg>
  );
}
