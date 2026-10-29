import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { MAX_PEOPLE } from './split.js';

const KEY = 'jomsplit:v2';
export const HUES = ['#e0607e', '#3b82c4', '#d9822b', '#2f9e6e', '#8a63d2', '#c2558f', '#1f9bb0', '#b8892b', '#5b6bd6', '#6f8f2f'];

const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyBill = () => ({
  title: '',
  people: [],
  items: [],
  charges: { sst: 6, service: 10, discount: 0 },
  mode: 'prorata',
});

export function demoBill() {
  const a = { id: uid(), name: 'Emms', hue: HUES[0] };
  const b = { id: uid(), name: 'Kawan 1', hue: HUES[1] };
  return {
    ...emptyBill(),
    title: 'Makan malam geng',
    people: [a, b],
    items: [
      { id: uid(), name: 'Nasi Goreng Kampung', qty: 1, amount: 1450, shareAll: false, ids: [a.id] },
      { id: uid(), name: 'Tomyam Campur (Kongsi)', qty: 1, amount: 2800, shareAll: true, ids: [] },
    ],
  };
}

function nextHue(people) {
  const used = new Set(people.map((p) => p.hue));
  return HUES.find((h) => !used.has(h)) ?? HUES[people.length % HUES.length];
}

function reducer(state, action) {
  switch (action.type) {
    case 'title':
      return { ...state, title: action.value };
    case 'addPerson':
      if (state.people.length >= MAX_PEOPLE) return state;
      return { ...state, people: [...state.people, { id: uid(), name: action.name, hue: nextHue(state.people) }] };
    case 'removePerson':
      return {
        ...state,
        people: state.people.filter((p) => p.id !== action.id),
        items: state.items.map((it) => ({ ...it, ids: it.ids.filter((x) => x !== action.id) })),
      };
    case 'addItems':
      return { ...state, items: [...state.items, ...action.items.map((it) => ({ shareAll: false, ids: [], ...it, id: uid() }))] };
    case 'updateItem':
      return { ...state, items: state.items.map((it) => (it.id === action.id ? { ...it, ...action.patch } : it)) };
    case 'removeItem':
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };
    case 'toggleShareAll':
      return { ...state, items: state.items.map((it) => (it.id === action.id ? { ...it, shareAll: !it.shareAll, ids: [] } : it)) };
    case 'togglePerson':
      return {
        ...state,
        items: state.items.map((it) => {
          if (it.id !== action.id) return it;
          // Picking someone while "Semua" is on starts from everyone else.
          const base = it.shareAll ? state.people.map((p) => p.id) : it.ids;
          const ids = base.includes(action.person) ? base.filter((x) => x !== action.person) : [...base, action.person];
          const all = state.people.length > 1 && ids.length === state.people.length;
          return { ...it, shareAll: all, ids: all ? [] : ids };
        }),
      };
    case 'charges':
      return { ...state, charges: { ...state.charges, ...action.patch } };
    case 'mode':
      return { ...state, mode: action.mode };
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.people) && Array.isArray(saved.items)) return { ...emptyBill(), ...saved };
  } catch {
    /* storage blocked or corrupt — start fresh */
  }
  return demoBill();
}

const Ctx = createContext(null);

export function BillProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode: keep working in memory */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useBill = () => useContext(Ctx);
