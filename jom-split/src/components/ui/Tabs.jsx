import { useRef } from 'react';
import { motion } from 'framer-motion';

/** Tab ARIA lengkap: anak panah kiri/kanan, Home/End. */
export default function Tabs({ tabs, value, onChange, label, idPrefix = 'tab' }) {
  const refs = useRef([]);
  const onKey = (e, i) => {
    const last = tabs.length - 1;
    let n = null;
    if (e.key === 'ArrowRight') n = i === last ? 0 : i + 1;
    if (e.key === 'ArrowLeft') n = i === 0 ? last : i - 1;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = last;
    if (n !== null) {
      e.preventDefault();
      onChange(tabs[n].id);
      refs.current[n]?.focus();
    }
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            id={`${idPrefix}-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={active ? 0 : -1}
            className={`tab${active ? ' is-active' : ''}`}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {active && <motion.span layoutId={`${idPrefix}-pill`} className="tab__pill" transition={{ duration: 0.2 }} />}
            <span className="tab__text">{t.label}</span>
            {t.count !== undefined && <span className="tab__count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
