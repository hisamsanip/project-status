import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../hooks/useStore.jsx';
import Icon from './Icon.jsx';

function Toast({ t, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3200);
    return () => clearTimeout(id);
  }, [onDone]);
  const icon = t.tone === 'good' ? 'CircleCheck' : t.tone === 'warn' ? 'TriangleAlert' : 'Info';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className={`toast toast--${t.tone}`}
    >
      <Icon name={icon} size={18} />
      <span>{t.message}</span>
    </motion.div>
  );
}

export default function Toasts() {
  const { state, dispatch } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {state.toasts.map((t) => (
          <Toast key={t.id} t={t} onDone={() => dispatch({ type: 'DISMISS_TOAST', id: t.id })} />
        ))}
      </AnimatePresence>
    </div>
  );
}
