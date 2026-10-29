import { CalendarDays, PenLine } from 'lucide-react';
import { useBill } from '../lib/store';
import { formatRM } from '../lib/money';

export function BillHero({ bill }) {
  const { state, dispatch } = useBill();
  const eaters = bill.rows.filter((r) => r.total > 0);
  const avg = eaters.length ? Math.round(bill.total / eaters.length) : 0;
  const today = new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="hero">
      <div className="hero-copy">
        <span className="eyebrow">
          <CalendarDays size={14} aria-hidden /> {today}
        </span>
        <label className="hero-title">
          <span className="sr-only">Nama bil</span>
          <input value={state.title} placeholder="Namakan bil ini…" maxLength={48} onChange={(e) => dispatch({ type: 'title', value: e.target.value })} />
          <PenLine size={18} aria-hidden />
        </label>
        <p className="hero-sub">Masukkan geng dan pesanan. JomSplit kira bahagian setiap orang termasuk SST, servis dan diskaun, tepat hingga ke sen.</p>
      </div>
      <dl className="kpis">
        <div className="kpi kpi-main">
          <dt>Jumlah besar</dt>
          <dd className="num">{formatRM(bill.total)}</dd>
        </div>
        <div className="kpi">
          <dt>Purata seorang</dt>
          <dd className="num">{formatRM(avg)}</dd>
        </div>
        <div className="kpi">
          <dt>Geng</dt>
          <dd className="num">{state.people.length}</dd>
        </div>
        <div className="kpi">
          <dt>Item</dt>
          <dd className="num">{state.items.length}</dd>
        </div>
      </dl>
    </div>
  );
}
