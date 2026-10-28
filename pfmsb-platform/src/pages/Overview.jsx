import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, FileCheck2, Flag, Gavel, Sparkles, Sprout, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import Ring from '../components/ui/Ring';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PhaseBand from '../components/visual/PhaseBand';
import Radar from '../components/visual/Radar';
import GrowthRings from '../components/visual/GrowthRings';
import NeuralCanopy from '../components/visual/NeuralCanopy';
import { useStore } from '../lib/store';
import { deriveInsights, deriveStatus } from '../lib/insights';
import { DECISIONS, FUNCTIONS } from '../data/plan';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function AIBrief({ insights }) {
  // Reveal insights one at a time, like a model streaming its brief.
  const [shown, setShown] = useState(0);
  const key = insights.map((i) => i.title).join('|');
  useEffect(() => {
    setShown(0);
    const t = setInterval(() => setShown((n) => (n >= insights.length ? n : n + 1)), 380);
    return () => clearInterval(t);
  }, [key, insights.length]);

  return (
    <Card className="ai-brief" glow delay={0.08}>
      <NeuralCanopy className="ai-brief-canvas" density={0.00035} intensity={0.55} />
      <CardHeader
        eyebrow="Canopy brief · generated now"
        icon={Sparkles}
        title="What needs your attention"
        action={
          <Button as="a" href="#/app/assistant" variant="ghost" size="sm" iconRight={ArrowRight}>
            Ask
          </Button>
        }
      />
      <ul className="insights">
        {insights.slice(0, shown).map((i) => (
          <motion.li key={i.title} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <a href={`#${i.to}`} className="insight">
              <span className={`insight-dot tone-bg-${i.tone}`} />
              <span className="insight-text">
                <b>{i.title}</b>
                <span className="muted">{i.text}</span>
              </span>
              <ArrowRight size={14} className="insight-arrow" />
            </a>
          </motion.li>
        ))}
        {shown < insights.length && <li className="typing" aria-label="Generating"><span /><span /><span /></li>}
      </ul>
    </Card>
  );
}

export default function Overview() {
  const { state } = useStore();
  const s = useMemo(() => deriveStatus(state), [state]);
  const insights = useMemo(() => deriveInsights(state, s), [state, s]);
  const pending = state.decisions.map((d, i) => ({ d, i })).filter((x) => x.d !== 'approved');

  return (
    <div className="page">
      <PageHeader
        eyebrow={`${greeting()} · Month ${state.month} of 12`}
        title={
          <>
            The programme is in <em>{s.phase.short.toLowerCase()}</em>.
          </>
        }
        subtitle={s.phase.intent}
        actions={
          <Button as="a" href="#/app/roadmap" variant="secondary" iconRight={ArrowRight}>
            Open roadmap
          </Button>
        }
      />

      <div className="grid grid-hero">
        <Card className="pulse">
          <CardHeader eyebrow="Programme pulse" icon={Sprout} />
          <div className="pulse-body">
            <Ring value={s.yearProgress} size={156} stroke={9}>
              <span className="display ring-big">{Math.round(s.yearProgress * 100)}%</span>
              <span className="mono faint ring-small">of Year 1</span>
            </Ring>
            <div className="pulse-facts">
              <div>
                <span className="eyebrow">Current phase</span>
                <p className="pulse-fact">
                  P{s.phase.id} · {s.phase.name}
                </p>
              </div>
              <div>
                <span className="eyebrow">Next gate</span>
                <p className="pulse-fact">
                  {s.nextGate ? `M${s.nextGate.month} · ${s.checksDone}/${s.nextGate.checks.length} checks` : 'All gates passed'}
                </p>
              </div>
              <div>
                <span className="eyebrow">Phase deliverable</span>
                <p className="pulse-fact muted">{s.phase.deliverable}</p>
              </div>
            </div>
          </div>
        </Card>
        <AIBrief insights={insights} />
      </div>

      <div className="grid grid-4">
        <Stat icon={Flag} label="Gates passed" value={s.gatesPassed} suffix="/ 5" progress={s.gatesPassed / 5} delay={0.05} />
        <Stat icon={Gavel} label="Decisions approved" value={s.decisionsApproved} suffix="/ 6" tone="sun" progress={s.decisionsApproved / 6} delay={0.1} />
        <Stat icon={FileCheck2} label="Evidence analysed" value={s.analysed} suffix={`/ ${state.evidence.length}`} tone="sky" progress={state.evidence.length ? s.analysed / state.evidence.length : 0} delay={0.15} />
        <Stat icon={Target} label="Avg maturity" value={s.avgScore.toFixed(1)} suffix={`→ ${s.avgTarget.toFixed(1)}`} tone="iris" progress={s.avgScore / 5} delay={0.2} />
      </div>

      <Card delay={0.1}>
        <CardHeader
          eyebrow="Timeline"
          title="12 months, 5 phases"
          action={<span className="mono faint hide-sm">Drag the M-slider in the top bar to simulate any month</span>}
        />
        <PhaseBand month={state.month} onSelect={(id) => (window.location.hash = `/app/roadmap?phase=${id}`)} />
      </Card>

      <div className="grid grid-2-1">
        <Card delay={0.1}>
          <CardHeader
            eyebrow="Capability maturity"
            title="Current vs target, by function"
            action={<Badge tone="sun">Sample data</Badge>}
          />
          <div className="radar-wrap">
            <Radar
              axes={FUNCTIONS.map((f) => String(f.id))}
              current={FUNCTIONS.map((f) => state.scores[f.id])}
              target={FUNCTIONS.map((f) => state.targets[f.id])}
            />
            <div className="radar-legend">
              <span><i className="lg lg-leaf" /> Current</span>
              <span><i className="lg lg-sun" /> Target</span>
            </div>
          </div>
        </Card>
        <Card delay={0.15}>
          <CardHeader eyebrow="Clusters" title="Growth by cluster" />
          <ul className="cluster-list">
            {s.clusterScores.map((c) => (
              <li key={c.id}>
                <a href={`#/app/functions?cluster=${c.id}`} className="cluster-row">
                  <GrowthRings value={Math.round(c.score)} size={44} label={false} />
                  <div className="cluster-row-text">
                    <span className="mono faint">
                      Cluster {c.id} · {c.priority}
                    </span>
                    <span>{c.name}</span>
                  </div>
                  <span className="display cluster-score">{c.score.toFixed(1)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card delay={0.1}>
          <CardHeader
            eyebrow={s.nextGate ? `Gate · M${s.nextGate.month}` : 'Gates'}
            title={s.nextGate ? s.nextGate.deliverable : 'Every gate has passed'}
            action={
              <Button as="a" href="#/app/gates" variant="ghost" size="sm" iconRight={ArrowRight}>
                Gates
              </Button>
            }
          />
          {s.nextGate && (
            <ul className="checklist">
              {s.nextGate.checks.map((c, i) => {
                const done = state.gateChecks[s.nextGate.id][i];
                return (
                  <li key={c} className={done ? 'is-done' : ''}>
                    {done ? <CheckCircle2 size={16} className="tone-leaf" /> : <Circle size={16} className="faint" />}
                    {c}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card delay={0.15}>
          <CardHeader
            eyebrow="Management"
            title={pending.length ? `${pending.length} decisions awaiting approval` : 'All decisions approved'}
            action={
              <Button as="a" href="#/app/risks" variant="ghost" size="sm" iconRight={ArrowRight}>
                Decide
              </Button>
            }
          />
          <ul className="decision-mini">
            {pending.slice(0, 3).map(({ i }) => (
              <li key={i}>
                <span className="mono decision-num">{i + 1}</span>
                <span>{DECISIONS[i]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
