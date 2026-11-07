import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { PEOPLE } from '../data/people.js';
import { HISTORY } from '../data/history.js';
import { initialBill } from '../data/receipts.js';
import { computeBill } from '../lib/split.js';
import { netBalances } from '../lib/settle.js';

const KEY = 'jomsplit.v1';

const fresh = () => ({
  people: PEOPLE,
  bill: initialBill(),
  paid: {},
  history: HISTORY,
  prefs: { name: 'Aiman', round5: true, sstRate: 0.06, serviceRate: 0.1, reduceMotion: false },
  toasts: [],
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const s = JSON.parse(raw);
    if (!s?.bill?.items || !Array.isArray(s.people) || !Array.isArray(s.history)) return fresh();
    return { ...fresh(), ...s, toasts: [] };
  } catch {
    return fresh();
  }
}

const mapItem = (bill, id, fn) => ({ ...bill, items: bill.items.map((it) => (it.id === id ? fn(it) : it)) });

function reducer(s, a) {
  switch (a.type) {
    case 'SET_BILL':
      return { ...s, bill: a.bill, paid: {} };
    case 'TOGGLE_ASSIGN':
      return {
        ...s,
        bill: mapItem(s.bill, a.itemId, (it) => ({
          ...it,
          assignees: it.assignees.includes(a.personId) ? it.assignees.filter((x) => x !== a.personId) : [...it.assignees, a.personId],
        })),
      };
    case 'ASSIGN_ALL':
      return { ...s, bill: mapItem(s.bill, a.itemId, (it) => ({ ...it, assignees: s.people.map((p) => p.id) })) };
    case 'CLEAR_ASSIGN':
      return { ...s, bill: mapItem(s.bill, a.itemId, (it) => ({ ...it, assignees: [] })) };
    case 'UPDATE_ITEM':
      return { ...s, bill: mapItem(s.bill, a.itemId, (it) => ({ ...it, ...a.patch, confidence: 100 })) };
    case 'SET_BILL_FIELD':
      return { ...s, bill: { ...s.bill, ...a.patch } };
    case 'ADD_PERSON': {
      const hue = 160 + ((s.people.length * 29) % 110);
      const p = { id: `p${Date.now().toString(36)}`, name: a.name, hue };
      return { ...s, people: [...s.people, p] };
    }
    case 'REMOVE_PERSON': {
      const people = s.people.filter((p) => p.id !== a.id);
      const bill = {
        ...s.bill,
        payerId: s.bill.payerId === a.id ? people[0]?.id : s.bill.payerId,
        items: s.bill.items.map((it) => ({ ...it, assignees: it.assignees.filter((x) => x !== a.id) })),
      };
      return { ...s, people, bill };
    }
    case 'TOGGLE_PAID':
      return { ...s, paid: { ...s.paid, [a.personId]: !s.paid[a.personId] } };
    case 'TOGGLE_HISTORY_PAID':
      return {
        ...s,
        history: s.history.map((h) =>
          h.id === a.entryId ? { ...h, paid: { ...h.paid, [a.personId]: !h.paid[a.personId] } } : h,
        ),
      };
    case 'SAVE_HISTORY':
      return { ...s, history: [a.entry, ...s.history], paid: {} };
    case 'SET_PREFS':
      return { ...s, prefs: { ...s.prefs, ...a.patch } };
    case 'TOAST':
      return { ...s, toasts: [...s.toasts, a.toast].slice(-3) };
    case 'DISMISS_TOAST':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) };
    case 'RESET':
      return fresh();
    default:
      return s;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const { toasts, ...persist } = state;
        localStorage.setItem(KEY, JSON.stringify(persist));
      } catch { /* storan mungkin disekat; apl tetap berfungsi */ }
    }, 200);
    return () => clearTimeout(t);
  }, [state]);

  const toastSeq = useRef(0);
  const toast = useCallback((message, tone = 'info') => {
    toastSeq.current += 1;
    dispatch({ type: 'TOAST', toast: { id: toastSeq.current, message, tone } });
  }, []);

  const calc = useMemo(
    () => computeBill(state.bill, state.people, { round5: state.prefs.round5 }),
    [state.bill, state.people, state.prefs.round5],
  );
  const net = useMemo(() => netBalances(state.history, state.people.map((p) => p.id)), [state.history, state.people]);

  const value = useMemo(() => ({ state, dispatch, toast, calc, net }), [state, toast, calc, net]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore mesti digunakan di dalam <StoreProvider>');
  return v;
}
