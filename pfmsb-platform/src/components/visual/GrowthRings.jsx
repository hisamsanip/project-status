import { motion } from 'framer-motion';

// Tree-ring maturity glyph: one ring per maturity level, lit up to `value`.
export default function GrowthRings({ value = 0, target = 0, size = 64, label = true }) {
  const c = size / 2;
  const step = (size / 2 - 3) / 5;
  return (
    <div className="growth-rings" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {[5, 4, 3, 2, 1].map((lvl) => {
          const on = lvl <= value;
          const tgt = !on && lvl <= target;
          // slight organic wobble so rings read as grown, not drawn
          const r = step * lvl;
          return (
            <motion.ellipse
              key={lvl}
              cx={c + (lvl % 2 ? 0.4 : -0.4)}
              cy={c}
              rx={r}
              ry={r * 0.96}
              fill="none"
              stroke={on ? 'var(--leaf)' : tgt ? 'var(--sun)' : 'var(--line-2)'}
              strokeWidth={on ? 1.6 : 1}
              strokeDasharray={tgt ? '2 3' : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: on ? 1 - (lvl - 1) * 0.1 : 0.9 }}
              transition={{ duration: 0.9, delay: lvl * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
        <circle cx={c} cy={c} r={2} fill="var(--leaf)" />
      </svg>
      {label && <span className="growth-rings-value mono">{value}</span>}
    </div>
  );
}
