import { motion } from 'framer-motion';
import { CalendarClock, Check, Lock, ShieldCheck, Unlock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Ring from '../components/ui/Ring';
import { useStore } from '../lib/store';
import { GATES, GOVERNANCE, PHASES, RHYTHM } from '../data/plan';

function gateState(g, state) {
  if (state.gateApproved[g.id]) return 'passed';
  const prev = GATES[GATES.indexOf(g) - 1];
  if (prev && !state.gateApproved[prev.id]) return 'locked';
  if (state.month > g.month) return 'overdue';
  return 'open';
}

const LABEL = { passed: 'Passed', locked: 'Locked', overdue: 'Overdue', open: 'Open' };
const TONE = { passed: 'leaf', locked: 'neutral', overdue: 'ember', open: 'sky' };

function GateCard({ gate, index }) {
  const { state, dispatch } = useStore();
  const st = gateState(gate, state);
  const checks = state.gateChecks[gate.id];
  const done = checks.filter(Boolean).length;
  const ready = done === checks.length;
  const phase = PHASES[gate.phase - 1];

  return (
    <Card className={`gate gate-${st}`} delay={index * 0.06}>
      <div className="gate-rail" aria-hidden="true">
        <span className="gate-node">{st === 'passed' ? <Check size={14} strokeWidth={3} /> : st === 'locked' ? <Lock size={12} /> : <span className="mono">{gate.month}</span>}</span>
      </div>
      <div className="gate-main">
        <div className="gate-head">
          <div>
            <span className="eyebrow">
              Gate · M{gate.month} · Phase {gate.phase} ends
            </span>
            <h3 className="gate-title">{gate.deliverable}</h3>
            <p className="faint gate-phase">{phase.name}</p>
          </div>
          <div className="gate-status">
            <Ring value={done / checks.length} size={58} stroke={5} color={st === 'passed' ? 'var(--leaf)' : st === 'overdue' ? 'var(--ember)' : 'var(--sky)'}>
              <span className="mono gate-ring-val">
                {done}/{checks.length}
              </span>
            </Ring>
            <Badge tone={TONE[st]} dot>
              {LABEL[st]}
            </Badge>
          </div>
        </div>
        <span className="eyebrow">Proposed checks</span>
        <ul className="gate-checks">
          {gate.checks.map((c, i) => (
            <li key={c}>
              <label className={`check ${st === 'locked' ? 'is-disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={checks[i]}
                  disabled={st === 'locked'}
                  onChange={() => dispatch({ type: 'toggleCheck', gate: gate.id, index: i })}
                />
                <span className="check-box">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>{c}</span>
              </label>
            </li>
          ))}
        </ul>
        {st !== 'passed' && st !== 'locked' && (
          <div className="gate-actions">
            <Button size="sm" icon={ShieldCheck} disabled={!ready} onClick={() => dispatch({ type: 'approveGate', gate: gate.id })}>
              {ready ? 'Confirm gate & unlock next phase' : 'Evidence every check to confirm'}
            </Button>
          </div>
        )}
        {st === 'passed' && (
          <p className="gate-passed mono">
            <Unlock size={13} /> Management confirmed the evidence. Phase {gate.phase + 1 <= 5 ? gate.phase + 1 : '—'} unlocked.
          </p>
        )}
      </div>
    </Card>
  );
}

export default function Gates() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Part C · How we run the plan"
        title={
          <>
            Five gates <em>control</em> the year.
          </>
        }
        subtitle="A gate is a checkpoint. Each phase ends when management confirms its deliverable and the evidence behind it."
      />
      <div className="gates">
        {GATES.map((g, i) => (
          <GateCard key={g.id} gate={g} index={i} />
        ))}
      </div>
      <p className="footnote">Checks, thresholds and approvers are proposals for management to confirm in Phase 1.</p>

      <div className="grid grid-2">
        <Card>
          <CardHeader eyebrow="Tadbir urus dan hak membuat keputusan" title="Who decides" />
          <ol className="gov">
            {GOVERNANCE.map((g, i) => (
              <motion.li key={g.body} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <span className="gov-level mono">L{i + 1}</span>
                <div>
                  <b>{g.body}</b>
                  <span className="muted">{g.role}</span>
                </div>
              </motion.li>
            ))}
            <li>
              <span className="gov-level mono">L5</span>
              <div>
                <b>Function owners</b>
                <span className="muted">Each names a lead and files a monthly evidence pack</span>
              </div>
            </li>
          </ol>
        </Card>
        <Card>
          <CardHeader eyebrow="Control rhythm" title="How often" icon={CalendarClock} />
          <div className="rhythm">
            {RHYTHM.map((r, i) => (
              <div key={r.cadence} className="rhythm-item">
                <span className="rhythm-freq">
                  {Array.from({ length: [12, 4, 1][i] }, (_, k) => (
                    <i key={k} />
                  ))}
                </span>
                <div>
                  <span className="mono tone-leaf">{r.cadence}</span>
                  <b>{r.name}</b>
                  <span className="muted">{r.text}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
