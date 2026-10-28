import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, CircleDashed, Diamond, LoaderCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Segmented from '../components/ui/Segmented';
import { useStore } from '../lib/store';
import { FUNCTIONS, PHASES, focusState, phaseForMonth } from '../data/plan';

function Gantt({ month, selected, onSelect }) {
  return (
    <div className="gantt" role="table" aria-label="12-month roadmap">
      <div className="gantt-row gantt-head" role="row">
        <span className="gantt-label" />
        <div className="gantt-cells">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={`gantt-month mono ${i + 1 === month ? 'is-now' : ''} ${i + 1 < month ? 'is-past' : ''}`}>
              M{i + 1}
            </span>
          ))}
        </div>
      </div>
      {PHASES.map((p, idx) => {
        const state = month > p.end ? 'done' : month >= p.start ? 'active' : 'next';
        const within = state === 'active' ? (month - p.start + 1) / (p.end - p.start + 1) : state === 'done' ? 1 : 0;
        return (
          <div className="gantt-row" role="row" key={p.id}>
            <button className={`gantt-label ${selected === p.id ? 'is-selected' : ''}`} onClick={() => onSelect(p.id)}>
              <span className="mono faint">P{p.id}</span>
              <span>{p.short}</span>
            </button>
            <div className="gantt-cells">
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="gantt-cell" />
              ))}
              <motion.button
                className={`gantt-bar is-${state} ${selected === p.id ? 'is-selected' : ''}`}
                style={{ gridColumn: `${p.start} / ${p.end + 1}` }}
                onClick={() => onSelect(p.id)}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                aria-label={`Phase ${p.id}: ${p.name}, months ${p.start} to ${p.end}`}
              >
                <span className="gantt-bar-fill" style={{ width: `${within * 100}%` }} />
                <span className="gantt-bar-text">
                  M{p.start}–{p.end}
                </span>
                <Diamond size={13} className="gantt-gate" />
              </motion.button>
            </div>
          </div>
        );
      })}
      <div className="gantt-now" style={{ '--m': month }} aria-hidden="true" />
    </div>
  );
}

function PhaseDetail({ phase, month }) {
  const state = month > phase.end ? 'done' : month >= phase.start ? 'active' : 'next';
  const len = phase.end - phase.start + 1;
  // Spread activities across the phase to show which are done at this month.
  const progress = state === 'done' ? 1 : state === 'next' ? 0 : (month - phase.start + 0.5) / len;
  const doneCount = Math.floor(progress * phase.activities.length);

  return (
    <AnimatePresence mode="wait">
      <motion.div key={phase.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="grid grid-2-1">
        <Card>
          <div className="phase-detail-head">
            <div>
              <span className="eyebrow">
                Phase {phase.id} of 5 · Months {phase.start}–{phase.end} · {phase.nameMs}
              </span>
              <h2 className="display phase-detail-title">{phase.name}</h2>
              <p className="muted">{phase.intent}</p>
            </div>
            <Badge tone={state === 'done' ? 'leaf' : state === 'active' ? 'sky' : 'neutral'} dot>
              {state === 'done' ? 'Complete' : state === 'active' ? 'In progress' : 'Upcoming'}
            </Badge>
          </div>
          <ol className="activities">
            {phase.activities.map((a, i) => {
              const st = i < doneCount ? 'done' : i === doneCount && state === 'active' ? 'active' : 'next';
              return (
                <motion.li key={a} className={`activity is-${st}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <span className="activity-icon">
                    {st === 'done' ? <CheckCircle2 size={17} /> : st === 'active' ? <LoaderCircle size={17} className="spin" /> : <CircleDashed size={17} />}
                  </span>
                  <span>{a}</span>
                </motion.li>
              );
            })}
          </ol>
        </Card>
        <div className="stack">
          <Card className="deliverable-card" glow>
            <span className="eyebrow">
              <Diamond size={11} className="tone-sun" /> Deliverable · end of M{phase.end}
            </span>
            <p className="display deliverable-text">{phase.deliverable}</p>
          </Card>
          <Card>
            <CardHeader eyebrow="Functions in focus" title={phase.focusLabel || `${phase.focus.length} functions`} />
            <div className="chips">
              {FUNCTIONS.map((f) => {
                const st = focusState(f.id, phase);
                return (
                  <a key={f.id} href={`#/app/functions?fn=${f.id}`} className={`chip ${st ? `is-${st}` : 'is-off'}`} title={f.name}>
                    <span className="mono">{f.id}</span>
                    {f.name}
                  </a>
                );
              })}
            </div>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function FocusMatrix() {
  return (
    <div className="matrix-scroll">
      <table className="matrix">
        <thead>
          <tr>
            <th className="eyebrow">Function</th>
            {PHASES.map((p) => (
              <th key={p.id} className="mono">
                P{p.id}
                <span className="faint"> · M{p.start}–{p.end}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FUNCTIONS.map((f) => (
            <tr key={f.id}>
              <th scope="row">
                <span className="mono faint">{String(f.id).padStart(2, '0')}</span> {f.name}
              </th>
              {PHASES.map((p) => {
                const st = focusState(f.id, p);
                return (
                  <td key={p.id}>
                    {st === 'assess' && <span className="mx mx-assess">Assess</span>}
                    {st === 'reassess' && <span className="mx mx-reassess">Reassess</span>}
                    {st === 'focus' && (
                      <span className="mx mx-focus" aria-label="Main focus">
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Roadmap({ params }) {
  const { state } = useStore();
  const fromUrl = Number(params.get('phase'));
  const selected = PHASES.some((p) => p.id === fromUrl) ? fromUrl : phaseForMonth(state.month).id;
  const select = (id) => {
    window.history.replaceState(null, '', `#/app/roadmap?phase=${id}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };
  const phase = PHASES[selected - 1];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Part B · The 12-month roadmap"
        title={
          <>
            Twelve months, <em>five phases</em>.
          </>
        }
        subtitle="Foundation first, then delivery, then growth. Gold diamonds mark the deliverable that closes each phase."
        actions={
          <Segmented
            label="Phase"
            size="sm"
            value={selected}
            onChange={select}
            options={PHASES.map((p) => ({ value: p.id, label: `P${p.id}` }))}
          />
        }
      />
      <Card className="gantt-card">
        <Gantt month={state.month} selected={selected} onSelect={select} />
      </Card>
      <PhaseDetail phase={phase} month={state.month} />
      <Card>
        <CardHeader eyebrow="Fokus utama setiap fungsi mengikut fasa" title="Where each function is in focus" />
        <FocusMatrix />
        <p className="footnote">
          A check mark is the main focus of that phase. All 12 functions are assessed in Phase 1 and reassessed in Phase 5.
        </p>
      </Card>
    </div>
  );
}
