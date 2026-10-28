import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FUNCTIONS, PHASES } from '../../data/plan';
import { NAV_FLAT } from './nav';

export default function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const input = useRef(null);

  const items = useMemo(() => {
    const all = [
      ...NAV_FLAT.map((n) => ({ label: n.label, hint: 'Page', to: n.to, icon: n.icon })),
      ...PHASES.map((p) => ({ label: `Phase ${p.id} · ${p.name}`, hint: `M${p.start}–${p.end}`, to: `/app/roadmap?phase=${p.id}` })),
      ...FUNCTIONS.map((f) => ({ label: `${f.id} · ${f.name}`, hint: 'Function', to: `/app/functions?fn=${f.id}` })),
    ];
    const s = q.trim().toLowerCase();
    return s ? all.filter((i) => i.label.toLowerCase().includes(s)) : all.slice(0, 9);
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const go = (it) => {
    window.location.hash = it.to;
    onClose();
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && items[idx]) go(items[idx]);
    else if (e.key === 'Escape') onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim scrim-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="palette-input">
              <Search size={17} className="faint" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={onKey}
                placeholder="Jump to a page, phase or function…"
                aria-label="Search"
              />
              <kbd className="mono">esc</kbd>
            </div>
            <ul className="palette-list" role="listbox">
              {items.length === 0 && <li className="palette-empty faint">No matches for “{q}”</li>}
              {items.map((it, i) => {
                const Icon = it.icon || ArrowRight;
                return (
                  <li key={it.label} role="option" aria-selected={i === idx}>
                    <button className={`palette-item ${i === idx ? 'is-active' : ''}`} onMouseEnter={() => setIdx(i)} onClick={() => go(it)}>
                      <Icon size={15} className="faint" />
                      <span className="palette-label">{it.label}</span>
                      <span className="palette-hint mono">{it.hint}</span>
                      {i === idx && <CornerDownLeft size={13} className="faint" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
