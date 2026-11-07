import Icon from '../ui/Icon.jsx';
import { NAV } from '../../data/nav.js';

export default function NavLinks({ route, onNavigate, items = NAV, orientation = 'vertical' }) {
  return (
    <ul className={`navlist navlist--${orientation}`}>
      {items.map((n) => (
        <li key={n.id}>
          <a
            href={`#${n.id}`}
            className={`navlink${route === n.id ? ' is-active' : ''}`}
            aria-current={route === n.id ? 'page' : undefined}
            title={n.label}
            onClick={() => onNavigate?.(n.id)}
          >
            <Icon name={n.icon} />
            <span className="navlink__label">{n.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
