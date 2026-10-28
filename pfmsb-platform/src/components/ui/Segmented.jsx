import { motion } from 'framer-motion';
import { useId } from 'react';

export default function Segmented({ options, value, onChange, size = 'md', label }) {
  const id = useId();
  return (
    <div className={`segmented segmented-${size}`} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const active = v === value;
        return (
          <button
            key={v}
            role="radio"
            aria-checked={active}
            className={`segmented-item ${active ? 'is-active' : ''}`}
            onClick={() => onChange(v)}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="segmented-pill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            <span className="segmented-label">{l}</span>
          </button>
        );
      })}
    </div>
  );
}
