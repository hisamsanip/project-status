import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(() => {});
const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  /** toast({ type, title, message, action: { label, onClick } }) */
  const toast = useCallback(
    (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list.slice(-2), { type: 'success', ...t, id }]);
      timers.current[id] = setTimeout(() => dismiss(id), t.action ? 6000 : 3500);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            return (
              <motion.div key={t.id} layout className={`toast toast-${t.type}`} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}>
                <Icon size={18} aria-hidden />
                <div className="toast-text">
                  <strong>{t.title}</strong>
                  {t.message && <span>{t.message}</span>}
                </div>
                {t.action && (
                  <button
                    className="toast-action"
                    onClick={() => {
                      t.action.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
