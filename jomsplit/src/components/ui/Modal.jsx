import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ open, onClose, title, description, icon: Icon, children, footer, size = 'md' }) {
  const id = useId();
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    const focusables = () => panel.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea, [tabindex="0"]') ?? [];
    requestAnimationFrame(() => (panel.current?.querySelector('[data-autofocus]') ?? focusables()[0])?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const list = [...focusables()];
        if (!list.length) return;
        const [first, last] = [list[0], list[list.length - 1]];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="modal-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-backdrop" onClick={onClose} />
          <motion.div
            ref={panel}
            className={`modal modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="modal-head">
              {Icon && (
                <span className="modal-icon" aria-hidden>
                  <Icon size={18} />
                </span>
              )}
              <div>
                <h2 id={`${id}-t`}>{title}</h2>
                {description && <p>{description}</p>}
              </div>
              <button className="btn btn-ghost btn-sm btn-icon modal-close" onClick={onClose} aria-label="Tutup">
                <X size={16} />
              </button>
            </header>
            <div className="modal-body">{children}</div>
            {footer && <footer className="modal-foot">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
