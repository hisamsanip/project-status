import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="page-header-text"
      >
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="display page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </motion.div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
