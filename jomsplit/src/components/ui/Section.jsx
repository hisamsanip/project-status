import { motion } from 'framer-motion';

export function Section({ id, step, icon: Icon, title, description, action, children, className = '' }) {
  return (
    <motion.section id={id} className={`section ${className}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: step * 0.06, ease: [0.22, 1, 0.36, 1] }} aria-labelledby={`${id}-title`}>
      <header className="section-head">
        <div className="section-title">
          <span className="section-step" aria-hidden>{Icon ? <Icon size={16} /> : step}</span>
          <div>
            <h2 id={`${id}-title`}>
              <span className="section-num">0{step}</span> {title}
            </h2>
            {description && <p>{description}</p>}
          </div>
        </div>
        {action && <div className="section-action">{action}</div>}
      </header>
      {children}
    </motion.section>
  );
}
