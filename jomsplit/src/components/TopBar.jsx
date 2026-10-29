import { Check, FileText, Moon, RotateCcw, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './ui/Button';

export function TopBar({ steps, theme, onTheme, onDemo, onReset }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#" onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: 'smooth' }))}>
          <Logo />
          <span className="brand-text">
            <strong>JomSplit</strong>
            <span>Kongsi bil, tanpa kira-kira</span>
          </span>
        </a>

        <nav className="stepper" aria-label="Langkah">
          {steps.map((s, i) => (
            <button key={s.id} className={`step ${s.done ? 'is-done' : ''}`} onClick={() => go(s.id)}>
              <span className="step-dot">{s.done ? <Check size={11} strokeWidth={3} /> : i + 1}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <Button variant="ghost" size="sm" icon={FileText} onClick={onDemo} data-tip="Isi dengan bil contoh">
            <span className="hide-sm">Contoh</span>
          </Button>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset} data-tip="Mula bil baharu">
            <span className="hide-sm">Bil baru</span>
          </Button>
          <Button variant="ghost" size="sm" icon={theme === 'dark' ? Sun : Moon} onClick={onTheme} aria-label={theme === 'dark' ? 'Mod cerah' : 'Mod gelap'} data-tip={theme === 'dark' ? 'Mod cerah' : 'Mod gelap'} />
        </div>
      </div>
    </header>
  );
}
