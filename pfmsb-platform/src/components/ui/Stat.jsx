import { Card } from './Card';

export default function Stat({ icon: Icon, label, value, suffix, foot, tone = 'leaf', delay = 0, progress }) {
  return (
    <Card className="stat" delay={delay}>
      <div className="stat-top">
        <span className={`stat-icon tone-${tone}`}>{Icon && <Icon size={15} />}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">
        <span className="display">{value}</span>
        {suffix && <span className="stat-suffix mono">{suffix}</span>}
      </div>
      {progress !== undefined && (
        <div className="bar">
          <span className={`bar-fill tone-bg-${tone}`} style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      {foot && <p className="stat-foot">{foot}</p>}
    </Card>
  );
}
