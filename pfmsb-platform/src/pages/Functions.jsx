import { motion } from 'framer-motion';
import { FileText, Info, Users } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Segmented from '../components/ui/Segmented';
import Drawer from '../components/ui/Drawer';
import MaturityDots from '../components/ui/MaturityDots';
import GrowthRings from '../components/visual/GrowthRings';
import { useStore } from '../lib/store';
import { CLUSTERS, DIMENSIONS, FUNCTIONS, MATURITY, PHASES, clusterById, focusState } from '../data/plan';

const setParams = (next) => {
  const q = new URLSearchParams(next).toString();
  window.location.hash = `/app/functions${q ? `?${q}` : ''}`;
};

function ScorePicker({ label, value, onChange, tone }) {
  return (
    <div className="score-picker">
      <span className="eyebrow">{label}</span>
      <div className="score-buttons" role="radiogroup" aria-label={label}>
        {MATURITY.map((m) => (
          <button
            key={m.level}
            role="radio"
            aria-checked={value === m.level}
            className={`score-btn ${value === m.level ? `is-active tone-${tone}` : ''}`}
            onClick={() => onChange(m.level)}
            title={`${m.name}: ${m.text}`}
          >
            <span className="display">{m.level}</span>
            <span className="mono">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FunctionDrawer({ fn, onClose }) {
  const { state, dispatch } = useStore();
  if (!fn) return <Drawer open={false} onClose={onClose} />;
  const c = clusterById(fn.cluster);
  const score = state.scores[fn.id];
  const target = state.targets[fn.id];
  const docs = state.evidence.filter((e) => e.fn === fn.id);

  return (
    <Drawer open onClose={onClose} eyebrow={`Function ${fn.id} · Cluster ${c.id}`} title={fn.name}>
      <div className="fn-drawer-hero">
        <GrowthRings value={score} target={target} size={96} />
        <div>
          <p className="display fn-drawer-level">{MATURITY[score - 1].name}</p>
          <p className="muted">{MATURITY[score - 1].text}</p>
          <p className="mono faint">Target · {target} {MATURITY[target - 1].name}</p>
        </div>
      </div>
      <ScorePicker label="Current maturity" value={score} tone="leaf" onChange={(v) => dispatch({ type: 'score', fn: fn.id, value: v })} />
      <ScorePicker label="Year 1 target" value={target} tone="sun" onChange={(v) => dispatch({ type: 'target', fn: fn.id, value: v })} />

      <div className="drawer-section">
        <span className="eyebrow">Ownership</span>
        <div className="kv">
          <span className="faint">Cluster</span>
          <span>
            {c.name} <Badge tone={c.priority === 'Critical' ? 'ember' : 'sky'}>{c.priority}</Badge>
          </span>
          <span className="faint">Cluster lead</span>
          <span>{c.lead}</span>
        </div>
      </div>

      <div className="drawer-section">
        <span className="eyebrow">Phase focus</span>
        <div className="phase-pips">
          {PHASES.map((p) => {
            const st = focusState(fn.id, p);
            return (
              <span key={p.id} className={`phase-pip ${st ? `is-${st}` : ''}`}>
                <span className="mono">P{p.id}</span>
                <span>{st === 'assess' ? 'Assess' : st === 'reassess' ? 'Reassess' : st === 'focus' ? 'Focus' : '—'}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="drawer-section">
        <span className="eyebrow">Scored on five dimensions</span>
        <div className="chips">
          {DIMENSIONS.map((d) => (
            <span key={d} className="chip is-focus">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="drawer-section">
        <span className="eyebrow">Evidence ({docs.length})</span>
        {docs.length === 0 && (
          <a className="empty-inline" href="#/app/evidence">
            No evidence filed yet. Upload to the vault →
          </a>
        )}
        <ul className="doc-mini">
          {docs.map((d) => (
            <li key={d.id}>
              <FileText size={15} className="faint" />
              <div>
                <span>{d.name}</span>
                {d.insights?.[0] && <span className="faint">{d.insights[0]}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
}

export default function Functions({ params }) {
  const { state } = useStore();
  const cluster = params.get('cluster') || 'all';
  const fnId = Number(params.get('fn'));
  const list = FUNCTIONS.filter((f) => cluster === 'all' || f.cluster === cluster);
  const open = FUNCTIONS.find((f) => f.id === fnId);

  return (
    <div className="page">
      <PageHeader
        eyebrow="12 functions · 4 clusters"
        title={
          <>
            Score against <em>evidence</em>, not confidence.
          </>
        }
        subtitle="Critical clusters are resourced and built first because they deliver and win the work. High clusters are built alongside and support them."
      />

      <div className="notice">
        <Info size={16} />
        <span>
          Maturity scores shown are <b>illustrative sample data</b> for the interface. Real baselines are set from evidence in Phase 1. Open any function to rescore it.
        </span>
      </div>

      <Card className="scale-card">
        <div className="scale">
          {MATURITY.map((m, i) => (
            <motion.div key={m.level} className="scale-step" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <span className="display scale-num">{m.level}</span>
              <span className="mono scale-name">{m.name}</span>
              <span className="muted scale-text">{m.text}</span>
              <span className="scale-bar" style={{ '--l': m.level }} />
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="toolbar">
        <Segmented
          label="Cluster"
          value={cluster}
          onChange={(v) => setParams(v === 'all' ? {} : { cluster: v })}
          options={[{ value: 'all', label: 'All' }, ...CLUSTERS.map((c) => ({ value: c.id, label: `Cluster ${c.id}` }))]}
        />
      </div>

      {CLUSTERS.filter((c) => cluster === 'all' || c.id === cluster).map((c) => (
        <section key={c.id} className="cluster-section">
          <div className="cluster-head">
            <span className={`cluster-letter tone-${c.hue}`}>{c.id}</span>
            <div>
              <h2 className="cluster-name">{c.name}</h2>
              <span className="mono faint">
                <Users size={12} /> {c.lead}
              </span>
            </div>
            <Badge tone={c.priority === 'Critical' ? 'ember' : 'sky'} dot>
              {c.priority}
            </Badge>
          </div>
          <div className="grid grid-fn">
            {list
              .filter((f) => f.cluster === c.id)
              .map((f, i) => {
                const docs = state.evidence.filter((e) => e.fn === f.id).length;
                return (
                  <Card key={f.id} interactive delay={i * 0.04} className="fn-card" onClick={() => setParams({ ...(cluster !== 'all' && { cluster }), fn: f.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setParams({ fn: f.id })}>
                    <div className="fn-card-top">
                      <span className="mono faint">{String(f.id).padStart(2, '0')}</span>
                      <GrowthRings value={state.scores[f.id]} target={state.targets[f.id]} size={54} />
                    </div>
                    <h3 className="fn-card-name">{f.name}</h3>
                    <div className="fn-card-meta">
                      <MaturityDots value={state.scores[f.id]} target={state.targets[f.id]} />
                      <span className="mono faint">{MATURITY[state.scores[f.id] - 1].name}</span>
                    </div>
                    <div className="fn-card-phases">
                      {PHASES.map((p) => (
                        <span key={p.id} className={`fp ${focusState(f.id, p) ? `is-${focusState(f.id, p)}` : ''}`} title={`Phase ${p.id}`} />
                      ))}
                    </div>
                    <span className="fn-card-foot faint">
                      <FileText size={12} /> {docs} evidence
                    </span>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}

      <FunctionDrawer fn={open} onClose={() => setParams(cluster === 'all' ? {} : { cluster })} />
    </div>
  );
}
