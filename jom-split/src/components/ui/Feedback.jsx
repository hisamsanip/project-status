import Icon from './Icon.jsx';
import Button from './Button.jsx';

export function EmptyState({ icon = 'Receipt', title, body, actions }) {
  return (
    <div className="state state--empty">
      <span className="state__icon"><Icon name={icon} size={24} /></span>
      <h3 className="state__title">{title}</h3>
      {body && <p className="state__body">{body}</p>}
      {actions && <div className="state__actions">{actions}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Ada yang tak kena', body, onRetry, actions }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon state__icon--bad"><Icon name="TriangleAlert" size={24} /></span>
      <h3 className="state__title">{title}</h3>
      {body && <p className="state__body">{body}</p>}
      <div className="state__actions">
        {onRetry && <Button variant="secondary" icon="RefreshCw" onClick={onRetry}>Cuba lagi</Button>}
        {actions}
      </div>
    </div>
  );
}

export function Skeleton({ h = 16, w = '100%', r = 8, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ height: h, width: w, borderRadius: r }} aria-hidden="true" />;
}
