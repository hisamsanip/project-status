import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Field } from '../components/ui/Field.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { useCopy } from '../hooks/useCopy.js';
import { formatRM } from '../lib/money.js';
import { minimizeTransfers, rawPairCount } from '../lib/settle.js';

export default function Friends() {
  const { state, dispatch, net, toast } = useStore();
  const copy = useCopy();
  const { people, history } = state;
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const transfers = minimizeTransfers(net).filter((t) => byId[t.from] && byId[t.to]);
  const raw = rawPairCount(history);

  const add = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setErr('Isi nama rakan.');
    if (n.length > 16) return setErr('Maksimum 16 huruf.');
    if (people.some((p) => p.name.toLowerCase() === n.toLowerCase())) return setErr('Nama itu sudah ada.');
    dispatch({ type: 'ADD_PERSON', name: n });
    toast(`${n} ditambah`, 'good');
    setName(''); setErr('');
  };

  const remind = (t) => {
    const from = byId[t.from].name;
    const to = byId[t.to].name;
    copy(`Hai ${from}, peringatan mesra: baki ${formatRM(t.amountSen)} kepada ${to} masih belum selesai. Boleh bayar bila senang ya. Terima kasih!`, `Peringatan untuk ${from} disalin`);
  };

  return (
    <>
      <PageHeader eyebrow="Kumpulan" title="Rakan" accent="makan anda" lead="Baki bersih setiap orang daripada semua bil yang belum selesai." />

      <section className="card plan glass" aria-labelledby="plan-title">
        <div className="block__head">
          <h2 id="plan-title" className="h3"><Icon name="Sparkles" size={18} /> Pelan penyelesaian</h2>
          <Badge tone="info">Dikira daripada data contoh</Badge>
        </div>
        {transfers.length === 0 ? (
          <p className="muted">Semua baki sudah selesai. Tiada pindahan diperlukan.</p>
        ) : (
          <>
            <p className="lead">
              {transfers.length} pindahan sahaja untuk melunaskan semua{raw > transfers.length ? `, berbanding ${raw} hutang asal` : ''}.
            </p>
            <ul className="transfers">
              {transfers.map((t) => (
                <li key={`${t.from}-${t.to}`} className="transfer">
                  <Avatar person={byId[t.from]} size={32} />
                  <span className="transfer__text"><strong>{byId[t.from].name}</strong> bayar <strong>{byId[t.to].name}</strong></span>
                  <span className="transfer__amt">{formatRM(t.amountSen)}</span>
                  <Button size="sm" icon="Bell" onClick={() => remind(t)}>Peringatan</Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="friends-grid">
        <section className="card" aria-labelledby="mem-title">
          <h2 id="mem-title" className="h3">Ahli ({people.length})</h2>
          {people.length === 0 ? (
            <EmptyState icon="Users" title="Kumpulan masih kosong" body="Tambah rakan pertama anda di borang sebelah." />
          ) : (
            <ul className="members">
              {people.map((p) => {
                const v = net[p.id] ?? 0;
                return (
                  <li key={p.id} className="member">
                    <Avatar person={p} size={40} />
                    <div className="member__who">
                      <span className="member__name">{p.name}{p.me && ' (anda)'}</span>
                      <span className={`member__bal${v > 0 ? ' is-pos' : v < 0 ? ' is-neg' : ''}`}>
                        {v > 0 ? `Patut terima ${formatRM(v)}` : v < 0 ? `Patut bayar ${formatRM(-v)}` : 'Tiada baki'}
                      </span>
                    </div>
                    {!p.me && (confirmId === p.id ? (
                      <span className="member__confirm">
                        <Button size="sm" variant="danger" onClick={() => { dispatch({ type: 'REMOVE_PERSON', id: p.id }); setConfirmId(null); toast(`${p.name} dibuang`); }}>Buang</Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>Batal</Button>
                      </span>
                    ) : (
                      <button type="button" className="icon-btn" aria-label={`Buang ${p.name}`} onClick={() => setConfirmId(p.id)}>
                        <Icon name="Trash2" size={18} />
                      </button>
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="card" aria-labelledby="add-title">
          <h2 id="add-title" className="h3">Tambah rakan</h2>
          <form className="stack" onSubmit={add} noValidate>
            <Field label="Nama" error={err} hint="Maksimum 16 huruf.">
              {(p) => <input {...p} className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}
            </Field>
            <Button type="submit" variant="primary" icon="Plus">Tambah ke kumpulan</Button>
          </form>
        </section>
      </div>
    </>
  );
}
