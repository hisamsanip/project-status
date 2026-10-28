import { AnimatePresence, motion } from 'framer-motion';
import { Command, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import Logo from '../visual/Logo';
import { NavList, ProgrammeCard } from './Sidebar';
import { useStore } from '../../lib/store';
import { phaseForMonth } from '../../data/plan';

function ProgrammeClock() {
  const { state, dispatch } = useStore();
  const phase = phaseForMonth(state.month);
  return (
    <label className="clock" title="Simulate the programme month">
      <span className="clock-label mono">
        <span className="pulse-dot" /> M{String(state.month).padStart(2, '0')}
        <span className="clock-phase">· P{phase.id}</span>
      </span>
      <input
        type="range"
        min="1"
        max="12"
        value={state.month}
        onChange={(e) => dispatch({ type: 'month', month: Number(e.target.value) })}
        aria-label="Programme month"
        style={{ '--p': `${((state.month - 1) / 11) * 100}%` }}
      />
    </label>
  );
}

export default function Topbar({ path, onOpenPalette }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar">
        <button className="icon-btn topbar-menu" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <a href="#/" className="topbar-logo" aria-label="Canopy home">
          <Logo size={26} />
        </a>
        <button className="search" onClick={onOpenPalette}>
          <Search size={15} />
          <span>Search pages, phases, functions…</span>
          <kbd className="mono">
            <Command size={11} />K
          </kbd>
        </button>
        <button className="icon-btn topbar-search-mobile" onClick={onOpenPalette} aria-label="Search">
          <Search size={18} />
        </button>
        <ProgrammeClock />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="mobile-nav"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="mobile-nav-head">
                <Logo />
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close navigation">
                  <X size={20} />
                </button>
              </div>
              <NavList path={path} onNavigate={() => setOpen(false)} />
              <ProgrammeCard />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
