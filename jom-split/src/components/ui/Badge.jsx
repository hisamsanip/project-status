import Icon from './Icon.jsx';

export default function Badge({ tone = 'neutral', icon, children, title }) {
  return (
    <span className={`badge badge--${tone}`} title={title}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
