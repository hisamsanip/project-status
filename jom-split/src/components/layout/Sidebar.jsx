import Brand from './Brand.jsx';
import NavLinks from './NavLinks.jsx';
import Money from '../ui/Money.jsx';
import Badge from '../ui/Badge.jsx';
import { useStore } from '../../hooks/useStore.jsx';

/** Desktop: sidebar penuh. Tablet: rel ikon (label disembunyikan melalui CSS). */
export default function Sidebar({ route }) {
  const { state, calc } = useStore();
  return (
    <aside className="sidebar" aria-label="Navigasi utama">
      <Brand />
      <nav aria-label="Halaman">
        <NavLinks route={route} />
      </nav>
      <a className="sidebar__bill" href="#agih" aria-label="Bil semasa, ke Agih item">
        <span className="caption">Bil semasa</span>
        <strong className="sidebar__bill-title">{state.bill.venue}</strong>
        <Money sen={calc.grandSen} />
        <span className="sidebar__bill-meta">
          {calc.unassignedCount > 0 ? `${calc.unassignedCount} item belum diagih` : 'Semua item sudah diagih'}
        </span>
      </a>
      <div className="sidebar__foot">
        <Badge tone="info" icon="Sparkles">Mod demo</Badge>
      </div>
    </aside>
  );
}
