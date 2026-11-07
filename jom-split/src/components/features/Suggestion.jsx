import { motion } from 'framer-motion';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import Meter from '../ui/Meter.jsx';

export default function Suggestion({ s, onAccept, onDismiss }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="suggest"
    >
      <span className="suggest__icon"><Icon name="Sparkles" size={18} /></span>
      <div className="suggest__body">
        <p className="suggest__text">{s.text}</p>
        <div className="suggest__row">
          <Meter value={s.confidence} label="Keyakinan cadangan" showLabel />
          <span className="suggest__actions">
            <Button size="sm" variant="secondary" onClick={onAccept}>{s.action}</Button>
            <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Tolak cadangan">Tolak</Button>
          </span>
        </div>
      </div>
    </motion.li>
  );
}
