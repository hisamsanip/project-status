import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../ui/Icon.jsx';
import NavLinks from './NavLinks.jsx';
import { NAV } from '../../data/nav.js';

const MAIN = NAV.filter((n) => n.primary);
const MORE = NAV.filter((n) => !n.primary);

/** Mobile: bar bawah (sasaran sentuh ≥ 48 px) + helaian "Lagi" untuk halaman sekunder. */
export default function MobileNav({ route }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const sheet = useRef(null);
  const moreActive = MORE.some((n) => n.id === route);

  useEffect(() => { setOpen(false); }, [route]);
  useEffect(() => {
    if (!open) return undefined;
    sheet.current?.querySelector('a')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="scrim" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            <motion.div
              ref={sheet}
              id="more-sheet"
              role="dialog"
              aria-label="Menu lain"
              className="sheet glass"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <NavLinks route={route} items={MORE} onNavigate={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <nav className="tabbar" aria-label="Navigasi utama">
        {MAIN.map((n) => (
          <a key={n.id} href={`#${n.id}`} className={`tabbar__item${route === n.id ? ' is-active' : ''}`} aria-current={route === n.id ? 'page' : undefined}>
            <Icon name={n.icon} />
            <span>{n.label.replace(' resit', '').replace(' item', '')}</span>
          </a>
        ))}
        <button
          ref={btn}
          type="button"
          className={`tabbar__item${moreActive || open ? ' is-active' : ''}`}
          aria-expanded={open}
          aria-controls="more-sheet"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="Ellipsis" />
          <span>Lagi</span>
        </button>
      </nav>
    </>
  );
}
