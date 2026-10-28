import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import Logo from '../visual/Logo';
import { NAV } from './nav';
import { useStore } from '../../lib/store';
import { phaseForMonth } from '../../data/plan';

export function NavList({ path, onNavigate }) {
  return (
    <nav className="nav" aria-label="Primary">
      {NAV.map((g) => (
        <div className="nav-group" key={g.group}>
          <span className="nav-group-label eyebrow">{g.group}</span>
          {g.items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <a key={it.to} href={`#${it.to}`} className={`nav-item ${active ? 'is-active' : ''}`} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="nav-active" className="nav-active" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <Icon size={17} strokeWidth={1.8} className="nav-icon" />
                <span className="nav-label">{it.label}</span>
                {it.tag && <span className="nav-tag mono">{it.tag}</span>}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function ProgrammeCard() {
  const { state, dispatch } = useStore();
  const phase = phaseForMonth(state.month);
  return (
    <div className="side-card">
      <div className="side-card-top">
        <Sparkles size={14} className="tone-leaf" />
        <span className="eyebrow">Phase {phase.id} live</span>
      </div>
      <p className="side-card-title">{phase.short}</p>
      <div className="bar">
        <span className="bar-fill tone-bg-leaf" style={{ width: `${(state.month / 12) * 100}%` }} />
      </div>
      <div className="side-card-foot mono">
        <span>M{state.month} / 12</span>
        <button className="link-btn" onClick={() => dispatch({ type: 'reset' })} title="Reset demo data">
          <RotateCcw size={12} /> Reset
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ path }) {
  return (
    <aside className="sidebar">
      <a href="#/" className="sidebar-brand" aria-label="Canopy home">
        <Logo />
      </a>
      <NavList path={path} />
      <div className="sidebar-foot">
        <ProgrammeCard />
        <div className="user-chip">
          <span className="avatar mono">PM</span>
          <div className="user-chip-text">
            <span>Plan Coordinator</span>
            <span className="faint">PMO · Confidential</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
