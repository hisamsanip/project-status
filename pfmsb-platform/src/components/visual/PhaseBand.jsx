import { motion } from 'framer-motion';
import { Diamond } from 'lucide-react';
import { PHASES } from '../../data/plan';

// Compact 12-month band with phases, gate diamonds and a "today" marker.
export default function PhaseBand({ month, onSelect, selected }) {
  const pct = ((month - 0.5) / 12) * 100;
  return (
    <div className="phase-band">
      <div className="phase-band-months mono">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={i + 1 === month ? 'is-now' : ''}>
            M{i + 1}
          </span>
        ))}
      </div>
      <div className="phase-band-track">
        {PHASES.map((p) => {
          const state = month > p.end ? 'done' : month >= p.start ? 'active' : 'next';
          return (
            <button
              key={p.id}
              className={`phase-seg is-${state} ${selected === p.id ? 'is-selected' : ''}`}
              style={{ gridColumn: `${p.start} / ${p.end + 1}` }}
              onClick={() => onSelect?.(p.id)}
            >
              <span className="phase-seg-num mono">P{p.id}</span>
              <span className="phase-seg-name">{p.short}</span>
              <Diamond className="phase-seg-gate" size={11} />
            </button>
          );
        })}
        <motion.span className="phase-now" animate={{ left: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
          <span className="phase-now-label mono">Now · M{month}</span>
        </motion.span>
      </div>
    </div>
  );
}
