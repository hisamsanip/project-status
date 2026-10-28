import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { DECISIONS, FUNCTIONS, GATES } from '../data/plan';
import { SAMPLE_EVIDENCE } from '../data/evidence';

const KEY = 'canopy.pfmsb.v1';

const initialState = () => ({
  month: 3,
  gateChecks: Object.fromEntries(GATES.map((g) => [g.id, g.checks.map(() => g.id === 'g1')])),
  gateApproved: { g1: true },
  decisions: DECISIONS.map((_, i) => (i < 3 ? 'approved' : 'pending')),
  scores: Object.fromEntries(FUNCTIONS.map((f) => [f.id, f.sample])),
  targets: Object.fromEntries(FUNCTIONS.map((f) => [f.id, Math.min(5, f.sample + 1)])),
  evidence: SAMPLE_EVIDENCE,
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Uploads interrupted by a reload can't resume; settle them.
      const evidence = (saved.evidence || []).map((e) =>
        ['uploading', 'reading', 'classifying'].includes(e.status) ? { ...e, status: 'review' } : e,
      );
      return { ...initialState(), ...saved, evidence };
    }
  } catch {
    /* storage unavailable: fall back to defaults */
  }
  return initialState();
}

function reducer(state, action) {
  switch (action.type) {
    case 'month':
      return { ...state, month: action.month };
    case 'toggleCheck': {
      const checks = [...state.gateChecks[action.gate]];
      checks[action.index] = !checks[action.index];
      const gateApproved = { ...state.gateApproved };
      if (!checks.every(Boolean)) delete gateApproved[action.gate];
      return { ...state, gateChecks: { ...state.gateChecks, [action.gate]: checks }, gateApproved };
    }
    case 'approveGate':
      return { ...state, gateApproved: { ...state.gateApproved, [action.gate]: true } };
    case 'decision': {
      const decisions = [...state.decisions];
      decisions[action.index] = action.status;
      return { ...state, decisions };
    }
    case 'score':
      return { ...state, scores: { ...state.scores, [action.fn]: action.value } };
    case 'target':
      return { ...state, targets: { ...state.targets, [action.fn]: action.value } };
    case 'addEvidence':
      return { ...state, evidence: [action.item, ...state.evidence] };
    case 'updateEvidence':
      return {
        ...state,
        evidence: state.evidence.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      };
    case 'removeEvidence':
      return { ...state, evidence: state.evidence.filter((e) => e.id !== action.id) };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      // File blobs can't be serialised; persist metadata only.
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
