import { CLUSTERS, DECISIONS, FUNCTIONS, GATES, clusterById, phaseForMonth } from '../data/plan';

// Derives programme health and "AI" observations from the current state.
// Deterministic rules stand in for a model in this front-end mockup.
export function deriveStatus(state) {
  const phase = phaseForMonth(state.month);
  const gatesPassed = GATES.filter((g) => state.gateApproved[g.id]).length;
  const nextGate = GATES.find((g) => !state.gateApproved[g.id]);
  const checksDone = nextGate ? state.gateChecks[nextGate.id].filter(Boolean).length : 0;
  const decisionsApproved = state.decisions.filter((d) => d === 'approved').length;
  const analysed = state.evidence.filter((e) => e.status === 'analysed').length;
  const coverage = Object.fromEntries(FUNCTIONS.map((f) => [f.id, state.evidence.filter((e) => e.fn === f.id).length]));
  const avg = (o) => Object.values(o).reduce((a, b) => a + b, 0) / FUNCTIONS.length;
  const avgScore = avg(state.scores);
  const avgTarget = avg(state.targets);
  const clusterScores = CLUSTERS.map((c) => ({
    ...c,
    score: c.functions.reduce((a, id) => a + state.scores[id], 0) / c.functions.length,
  }));
  return {
    phase,
    gatesPassed,
    nextGate,
    checksDone,
    decisionsApproved,
    analysed,
    coverage,
    avgScore,
    avgTarget,
    clusterScores,
    yearProgress: state.month / 12,
  };
}

export function deriveInsights(state, s = deriveStatus(state)) {
  const out = [];
  const { phase, nextGate } = s;

  if (nextGate) {
    const gap = nextGate.month - state.month;
    const total = nextGate.checks.length;
    if (gap < 0) {
      out.push({
        tone: 'ember',
        title: `Gate M${nextGate.month} is overdue`,
        text: `Phase ${nextGate.phase} should have closed ${-gap} month${gap === -1 ? '' : 's'} ago. ${s.checksDone}/${total} checks are evidenced. Escalate before Phase ${nextGate.phase + 1} work continues.`,
        to: '/app/gates',
      });
    } else {
      out.push({
        tone: gap === 0 ? 'sun' : 'leaf',
        title: gap === 0 ? `Gate M${nextGate.month} is due this month` : `Gate M${nextGate.month} in ${gap} month${gap === 1 ? '' : 's'}`,
        text: `${s.checksDone} of ${total} proposed checks complete for “${nextGate.deliverable}”.`,
        to: '/app/gates',
      });
    }
  } else {
    out.push({ tone: 'leaf', title: 'All five gates passed', text: 'Year 1 is closed. Carry the evidence into the Year 2–3 growth plan.', to: '/app/outcomes' });
  }

  const critical = FUNCTIONS.filter((f) => clusterById(f.cluster).priority === 'Critical').sort((a, b) => state.scores[a.id] - state.scores[b.id]);
  const weakest = critical[0];
  if (weakest && state.scores[weakest.id] <= 2) {
    out.push({
      tone: 'sun',
      title: `${weakest.name} is the weakest critical function`,
      text: `Scored ${state.scores[weakest.id]}/5 in Cluster ${weakest.cluster} (${clusterById(weakest.cluster).name}). Critical clusters are resourced first because they deliver and win the work.`,
      to: `/app/functions?fn=${weakest.id}`,
    });
  }

  const missing = phase.focus.filter((id) => s.coverage[id] === 0).map((id) => FUNCTIONS.find((f) => f.id === id).name);
  if (missing.length) {
    out.push({
      tone: 'sky',
      title: `${missing.length} in-focus function${missing.length === 1 ? ' has' : 's have'} no evidence yet`,
      text: `${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` and ${missing.length - 3} more` : ''}. Score against evidence, not confidence.`,
      to: '/app/evidence',
    });
  }

  const review = state.evidence.filter((e) => e.status === 'review');
  if (review.length) {
    out.push({
      tone: 'iris',
      title: `${review.length} document${review.length === 1 ? ' needs' : 's need'} human review`,
      text: `Low extraction confidence on ${review[0].name}${review.length > 1 ? ' and others' : ''}.`,
      to: '/app/evidence',
    });
  }

  if (state.month >= 4 && state.decisions[3] !== 'approved') {
    out.push({
      tone: 'ember',
      title: 'Pilot criteria not yet decided',
      text: `Decision 4 (${DECISIONS[3].toLowerCase()}) is still pending, and the pilot starts in M5.`,
      to: '/app/risks',
    });
  }
  return out;
}
