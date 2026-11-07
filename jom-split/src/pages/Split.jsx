import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Money from '../components/ui/Money.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Field, Switch } from '../components/ui/Field.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import ItemRow from '../components/features/ItemRow.jsx';
import Suggestion from '../components/features/Suggestion.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { useMedia } from '../hooks/useMedia.js';
import { buildSuggestions } from '../lib/suggest.js';
import { formatRM } from '../lib/money.js';

export default function Split({ go }) {
  const { state, dispatch, calc, toast } = useStore();
  const { bill, people } = state;
  const [tab, setTab] = useState('semua');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [newName, setNewName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const narrow = useMedia('(max-width: 1023px)');

  const suggestions = useMemo(
    () => buildSuggestions(bill, people, calc).filter((s) => !dismissed.includes(s.id)),
    [bill, people, calc, dismissed],
  );

  const counts = {
    semua: bill.items.length,
    belum: bill.items.filter((i) => i.assignees.length === 0).length,
    kongsi: bill.items.filter((i) => i.assignees.length > 1).length,
  };
  const items = bill.items.filter((i) => {
    if (tab === 'belum' && i.assignees.length) return false;
    if (tab === 'kongsi' && i.assignees.length < 2) return false;
    return !q.trim() || i.name.toLowerCase().includes(q.trim().toLowerCase());
  });

  const accept = (s) => {
    if (s.kind === 'share') { dispatch({ type: 'ASSIGN_ALL', itemId: s.itemId }); toast('Item dikongsi semua orang', 'good'); }
    if (s.kind === 'review') { setEditing(s.itemId); setTab('semua'); }
    setDismissed((d) => [...d, s.id]);
  };

  const addPerson = (e) => {
    e.preventDefault();
    const n = newName.trim();
    if (!n) return setNameErr('Isi nama rakan.');
    if (n.length > 16) return setNameErr('Maksimum 16 huruf.');
    if (people.some((p) => p.name.toLowerCase() === n.toLowerCase())) return setNameErr('Nama itu sudah ada.');
    dispatch({ type: 'ADD_PERSON', name: n });
    toast(`${n} ditambah ke kumpulan`, 'good');
    setNewName(''); setNameErr('');
  };

  const byId = Object.fromEntries(people.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader
        eyebrow="Langkah 2 daripada 3"
        title="Siapa makan"
        accent="apa?"
        lead={`${bill.venue}. Ketik nama untuk memasukkan seseorang ke dalam item.`}
        actions={<Button variant="primary" iconRight="ArrowRight" onClick={() => go('ringkasan')} disabled={calc.assignedSen === 0}>Lihat ringkasan</Button>}
      />

      <div className="split">
        <aside className="split__totals glass" aria-labelledby="tot-title">
          <h2 id="tot-title" className="h3">Setiap orang bayar</h2>
          <ul className="totals">
            {calc.rows.map((r) => {
              const p = byId[r.id];
              const pct = calc.grandSen ? Math.round((r.dueSen / calc.grandSen) * 100) : 0;
              return (
                <li key={r.id} className="totals__row">
                  <Avatar person={p} size={32} />
                  <div className="totals__who">
                    <span className="totals__name">{p.name}{r.id === bill.payerId && <em> · bayar dulu</em>}</span>
                    <span className="totals__sub">{r.items} item</span>
                    <span className="totals__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
                  </div>
                  <Money sen={r.dueSen} />
                </li>
              );
            })}
          </ul>
          {calc.unassignedCount > 0 && (
            <p className="callout callout--warn" role="status">
              <Icon name="TriangleAlert" size={18} />
              {calc.unassignedCount} item ({formatRM(calc.unassignedSen)}) belum diagih dan belum dikira cukai.
            </p>
          )}
          <details className="more" open={!narrow}>
            <summary>Pecahan bil, cukai dan tambah rakan</summary>
          <dl className="breakdown">
            <div><dt>Subjumlah item</dt><dd>{formatRM(calc.assignedSen)}</dd></div>
            <div><dt>Caj perkhidmatan {Math.round(bill.serviceRate * 100)}%</dt><dd>{formatRM(calc.serviceSen)}</dd></div>
            <div><dt>SST {Math.round(bill.sstRate * 100)}%</dt><dd>{formatRM(calc.sstSen)}</dd></div>
            <div><dt>Jumlah</dt><dd><strong>{formatRM(calc.grandSen)}</strong></dd></div>
          </dl>
          <div className="split__switches">
            <Switch id="sw-service" checked={bill.serviceOn} onChange={(v) => dispatch({ type: 'SET_BILL_FIELD', patch: { serviceOn: v } })} label="Caj perkhidmatan" hint={`${Math.round(bill.serviceRate * 100)}% atas item`} />
            <Switch id="sw-sst" checked={bill.sstOn} onChange={(v) => dispatch({ type: 'SET_BILL_FIELD', patch: { sstOn: v } })} label="SST" hint={`${Math.round(bill.sstRate * 100)}% atas item + servis`} />
          </div>
          <form className="addperson" onSubmit={addPerson} noValidate>
            <Field label="Tambah rakan" error={nameErr}>
              {(p) => <input {...p} className="input" placeholder="Nama" value={newName} onChange={(e) => setNewName(e.target.value)} />}
            </Field>
            <Button type="submit" icon="Plus" aria-label="Tambah rakan">Tambah</Button>
          </form>
          </details>
        </aside>

        <div className="split__main">
          <AnimatePresence initial={false}>
            {suggestions.length > 0 && (
              <section key="sug" aria-labelledby="sug-title" className="suggests">
                <div className="block__head">
                  <h2 id="sug-title" className="h3"><Icon name="Sparkles" size={18} /> Cadangan AI</h2>
                  <Badge tone="info" title="Peraturan ringkas; skor ialah nilai demo">Demo</Badge>
                </div>
                <ul className="suggest-list">
                  {suggestions.map((s) => (
                    <Suggestion key={s.id} s={s} onAccept={() => accept(s)} onDismiss={() => setDismissed((d) => [...d, s.id])} />
                  ))}
                </ul>
              </section>
            )}
          </AnimatePresence>

          <div className="toolbar">
            <Tabs
              idPrefix="items"
              label="Tapis item"
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'semua', label: 'Semua', count: counts.semua },
                { id: 'belum', label: 'Belum diagih', count: counts.belum },
                { id: 'kongsi', label: 'Dikongsi', count: counts.kongsi },
              ]}
            />
            <Field label="Cari item" className="toolbar__search">
              {(p) => <input {...p} type="search" className="input" placeholder="cth. teh" value={q} onChange={(e) => setQ(e.target.value)} />}
            </Field>
          </div>

          <div id="items-panel" role="tabpanel" aria-labelledby={`items-${tab}`}>
            {items.length === 0 ? (
              <EmptyState
                icon="CircleCheck"
                title={tab === 'belum' && !q ? 'Semua item sudah diagih' : 'Tiada item sepadan'}
                body={tab === 'belum' && !q ? 'Bagus. Teruskan ke ringkasan untuk lihat siapa bayar siapa.' : 'Cuba tukar penapis atau kosongkan carian.'}
                actions={tab === 'belum' && !q ? <Button variant="primary" onClick={() => go('ringkasan')} iconRight="ArrowRight">Ke ringkasan</Button> : <Button onClick={() => { setTab('semua'); setQ(''); }}>Set semula penapis</Button>}
              />
            ) : (
              <ul className="items">
                {items.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    people={people}
                    editing={editing === it.id}
                    onEdit={setEditing}
                    onToggle={(pid) => dispatch({ type: 'TOGGLE_ASSIGN', itemId: it.id, personId: pid })}
                    onAll={() => dispatch({ type: 'ASSIGN_ALL', itemId: it.id })}
                    onClear={() => dispatch({ type: 'CLEAR_ASSIGN', itemId: it.id })}
                    onSave={(patch) => { dispatch({ type: 'UPDATE_ITEM', itemId: it.id, patch }); setEditing(null); toast('Item dikemas kini', 'good'); }}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
