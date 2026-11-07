import { useMemo, useState } from 'react';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import Money from '../ui/Money.jsx';
import { formatNumber } from '../../lib/money.js';
import { useStore } from '../../hooks/useStore.jsx';

/** Panel kaca di Beranda: resit sampel hidup. Klik seseorang untuk menyerlahkan itemnya. */
export default function ReceiptPanel() {
  const { state, calc } = useStore();
  const { bill, people } = state;
  const [focus, setFocus] = useState(null);
  const avg = Math.round(bill.items.reduce((s, i) => s + i.confidence, 0) / Math.max(bill.items.length, 1));
  const shown = bill.items.slice(0, 7);
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);

  return (
    <section className="receipt glass" aria-labelledby="receipt-title">
      <span className="receipt__scan" aria-hidden="true" />
      <header className="receipt__head">
        <div>
          <p className="caption">Resit sampel</p>
          <h2 id="receipt-title" className="receipt__venue">{bill.venue}</h2>
        </div>
        <Badge tone="good" icon="Sparkles" title="Nilai contoh untuk demo">Dibaca · {avg}%</Badge>
      </header>

      <ul className="receipt__lines">
        {shown.map((it) => {
          const dim = focus && !it.assignees.includes(focus);
          return (
            <li key={it.id} className={`receipt__line${dim ? ' is-dim' : ''}`}>
              <span className="receipt__name">{it.name}</span>
              <span className="receipt__who">
                {it.assignees.length === 0 ? (
                  <span className="receipt__none">belum diagih</span>
                ) : (
                  it.assignees.slice(0, 3).map((id) => <Avatar key={id} person={byId[id] ?? people[0]} size={20} />)
                )}
              </span>
              <span className="receipt__price">{formatNumber(it.priceSen)}</span>
            </li>
          );
        })}
        {bill.items.length > shown.length && <li className="receipt__more">+{bill.items.length - shown.length} item lagi</li>}
      </ul>

      <div className="receipt__totals" role="group" aria-label="Jumlah setiap orang. Pilih nama untuk menyerlahkan itemnya.">
        {calc.rows.map((r) => {
          const p = byId[r.id];
          if (!p) return null;
          const on = focus === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`person-pill${on ? ' is-on' : ''}`}
              aria-pressed={on}
              onClick={() => setFocus(on ? null : r.id)}
            >
              <Avatar person={p} size={24} />
              <span className="person-pill__name">{p.name}</span>
              <Money sen={r.dueSen} fromZero />
            </button>
          );
        })}
      </div>
      <p className="receipt__foot">
        Termasuk servis 10% dan SST 6%. Data contoh, bukan resit sebenar.
      </p>
    </section>
  );
}
