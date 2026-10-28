import {
  CLUSTERS,
  DECISIONS,
  FUNCTIONS,
  GATES,
  GLOSSARY,
  KPIS,
  MATURITY,
  PHASES,
  RHYTHM,
  RISKS,
  SUCCESS,
  clusterById,
} from '../data/plan';
import { deriveInsights, deriveStatus } from './insights';

// Retrieval over the roadmap content. In production this would be a model
// with the plan as grounding; here intent matching keeps the mockup offline.
// Each answer: { text, bullets?, sources? }

// First words too generic to identify a function on their own.
const GENERIC = new Set(['project', 'governance', 'operations', 'commercial', 'human', 'technology', 'finance']);

const has = (q, ...words) => words.some((w) => q.includes(w));

function phaseAnswer(p) {
  return {
    text: `Phase ${p.id} · ${p.name} runs M${p.start}–M${p.end}. ${p.intent}`,
    bullets: [...p.activities, `Deliverable: ${p.deliverable}`],
    sources: [`Slide ${8 + p.id}`],
  };
}

function functionAnswer(f, state) {
  const c = clusterById(f.cluster);
  const phases = PHASES.filter((p) => p.id === 1 || p.id === 5 || p.focus.includes(f.id));
  const docs = state.evidence.filter((e) => e.fn === f.id);
  return {
    text: `${f.id} · ${f.name} sits in Cluster ${c.id} (${c.name}, ${c.priority.toLowerCase()} priority), led by the ${c.lead}. Its current score is ${state.scores[f.id]}/5 against a target of ${state.targets[f.id]}/5.`,
    bullets: [
      `In focus: ${phases.map((p) => `P${p.id}`).join(', ')}`,
      `${docs.length} evidence document${docs.length === 1 ? '' : 's'} filed`,
      ...docs.flatMap((d) => d.insights.slice(0, 1)),
    ],
    sources: ['Slide 5', 'Slide 7'],
  };
}

export function answer(question, state) {
  const q = question.toLowerCase();
  const s = deriveStatus(state);

  const term = GLOSSARY.find((g) => q.includes(g.term.toLowerCase()) && has(q, 'what', 'mean', 'define', 'explain'));
  if (term) return { text: `**${term.term}**: ${term.text}`, sources: ['Slide 3 · Plain-language guide'] };

  if (has(q, 'status', 'where are we', 'summary', 'brief', 'how are we', 'on track')) {
    const ins = deriveInsights(state, s);
    return {
      text: `We are in month ${state.month} of 12, in Phase ${s.phase.id} (${s.phase.short}). ${s.gatesPassed}/5 gates passed, ${s.decisionsApproved}/6 management decisions approved, and average maturity is ${s.avgScore.toFixed(1)} against a target of ${s.avgTarget.toFixed(1)}.`,
      bullets: ins.map((i) => `${i.title}. ${i.text}`),
      sources: ['Live programme state'],
    };
  }

  const fn = FUNCTIONS.find((f) => {
    const first = f.name.split(' ')[0].toLowerCase();
    return q.includes(f.name.toLowerCase()) || (!GENERIC.has(first) && q.includes(first));
  });
  if (fn && !has(q, 'phase')) return functionAnswer(fn, state);

  const pm = q.match(/phase\s*(\d)/);
  if (pm && PHASES[Number(pm[1]) - 1]) return phaseAnswer(PHASES[Number(pm[1]) - 1]);
  const mm = q.match(/\bm(?:onth)?\s*(\d{1,2})\b/);
  if (mm && Number(mm[1]) >= 1 && Number(mm[1]) <= 12) {
    const p = PHASES.find((x) => Number(mm[1]) >= x.start && Number(mm[1]) <= x.end);
    return phaseAnswer(p);
  }
  if (has(q, 'pilot')) return phaseAnswer(PHASES[2]);
  if (has(q, 'foundation', 'baseline assess')) return phaseAnswer(PHASES[0]);
  if (has(q, 'expansion', 'tender', 'external')) return phaseAnswer(PHASES[3]);

  if (has(q, 'gate', 'checkpoint')) {
    return {
      text: 'Five phase gates control the year. Each phase ends when management confirms its deliverable and the evidence behind it.',
      bullets: GATES.map((g) => `M${g.month} · ${g.deliverable}: ${state.gateApproved[g.id] ? 'passed' : `${state.gateChecks[g.id].filter(Boolean).length}/${g.checks.length} checks`}`),
      sources: ['Slide 14'],
    };
  }

  if (has(q, 'kpi', 'target', 'measure', 'success', 'outcome')) {
    return {
      text: 'Success at M12 is defined by six proposed targets. They are planning proposals for management validation, not PFMSB actual results.',
      bullets: [...SUCCESS.map((x) => `${x.value}: ${x.label}`), ...KPIS.map((k) => `${k.name}: ${k.target}`)],
      sources: ['Slide 16', 'Slide 18'],
    };
  }

  if (has(q, 'risk', 'dependenc', 'wrong')) {
    return {
      text: 'Six critical dependencies each have a control. Escalate any unresolved critical dependency before the relevant stage gate.',
      bullets: RISKS.map((r) => `${r.name}: ${r.must}. Control: ${r.control}`),
      sources: ['Slide 19'],
    };
  }

  if (has(q, 'decision', 'decide', 'approve', 'management need')) {
    return {
      text: 'Management is asked to approve the Phase 1 mobilisation charter and launch the baseline assessment. Six decisions underpin it:',
      bullets: DECISIONS.map((d, i) => `${i + 1}. ${d} (${state.decisions[i]})`),
      sources: ['Slide 20'],
    };
  }

  if (has(q, 'maturity', 'score', 'scale')) {
    return {
      text: `Each function is scored 1–5 against evidence, not confidence, on five dimensions. The current average is ${s.avgScore.toFixed(1)}.`,
      bullets: MATURITY.map((m) => `${m.level} · ${m.name}: ${m.text}`),
      sources: ['Slide 17'],
    };
  }

  if (has(q, 'who', 'lead', 'owner', 'cluster', 'accountab')) {
    return {
      text: 'The CEO holds overall accountability. Four cluster leads own the 12 functions. They can be existing managers, so this does not require four new departments.',
      bullets: CLUSTERS.map((c) => `Cluster ${c.id} · ${c.name} (${c.priority}): ${c.lead}`),
      sources: ['Slide 6'],
    };
  }

  if (has(q, 'meet', 'cadence', 'rhythm', 'steerco', 'often', 'governance')) {
    return {
      text: 'The plan runs on a weekly, monthly and quarterly control rhythm.',
      bullets: RHYTHM.map((r) => `${r.cadence} · ${r.name}: ${r.text}`),
      sources: ['Slide 15'],
    };
  }

  if (has(q, 'evidence', 'document', 'upload')) {
    const by = FUNCTIONS.filter((f) => s.coverage[f.id] === 0).map((f) => f.name);
    return {
      text: `${state.evidence.length} documents are in the vault, ${s.analysed} analysed. ${by.length} functions have no evidence yet.`,
      bullets: by.slice(0, 6),
      sources: ['Evidence vault'],
    };
  }

  return {
    text: 'I can answer questions about the PFMSB Year 1 roadmap. Try asking about a phase, a gate, a function, KPIs, risks, decisions or a term like “stage gate”.',
    bullets: ['What happens in Phase 3?', 'Which decisions are pending?', 'How is Facilities management doing?', 'What does mobilisation mean?'],
  };
}

export const SUGGESTIONS = [
  'Give me a status brief',
  'What happens in the pilot phase?',
  'Which decisions does management need to make?',
  'How is Tender & business development doing?',
  'What are the stage gates?',
  'What does SteerCo mean?',
];
