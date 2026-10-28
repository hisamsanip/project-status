import { motion } from 'framer-motion';

export function Card({ children, className = '', glow = false, interactive = false, as, delay = 0, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`card ${glow ? 'card-glow' : ''} ${interactive ? 'card-interactive' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ eyebrow, title, action, icon: Icon }) {
  return (
    <div className="card-header">
      <div className="card-header-text">
        {eyebrow && (
          <span className="eyebrow card-eyebrow">
            {Icon && <Icon size={12} />}
            {eyebrow}
          </span>
        )}
        {title && <h3 className="card-title">{title}</h3>}
      </div>
      {action}
    </div>
  );
}
