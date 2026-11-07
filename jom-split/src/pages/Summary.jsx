import { useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Money from '../components/ui/Money.jsx';
import Icon from '../components/ui/Icon.jsx';
import { EmptyState } from '../components/ui/Feedback.jsx';
import BalanceChart from '../components/charts/BalanceChart.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { useCopy } from '../hooks/useCopy.js';
import { formatRM } from '../lib/money.js';

export default function Summary({ go }) {
  const { state, dispatch, calc, toast } = useStore();
  const copy = useCopy();
  const { bill, people, paid } = state;
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const payer = byId[bill.payerId] ?? people[0];

  if (calc.assignedSen === 0) {
    return (
      <>
        <PageHeader eyebrow="Langkah 3 daripada 3" title="Siapa bayar" accent="siapa?" />
        <EmptyState
          title="Belum ada item diagih"
          body="Agih sekurang-kurangnya satu item supaya jumlah setiap orang dapat dikira."
          actions={<Button variant="primary" iconRight="ArrowRight" onClick={() => go('agih')}>Pergi ke agihan</Button>}
        />
      </>
    );
  }

  const owing = calc.rows.filter((r) => r.id !== payer.id && r.dueSen > 0);
  const collected = calc.rows.reduce((s, r) => s + (r.id === payer.id || paid[r.id] ? r.dueSen : 0), 0);
  const pct = calc.grandSen ? Math.round((collected / calc.grandSen) * 100) : 0;
  const allPaid = owing.length > 0 && owing.every((r) => paid[r.id]);

  const chartRows = calc.rows
    .filter((r) => r.dueSen > 0)
    .map((r) => ({ id: r.id, name: byId[r.id].name, value: r.dueSen, paid: !!paid[r.id], payer: r.id === payer.id }));

  const msgFor = (r) =>
    `Hai ${byId[r.id].name}, bahagian kamu di ${bill.venue} ialah ${formatRM(r.dueSen)}. Boleh bayar balik kepada ${payer.name} bila-bila masa ya. Terima kasih!`;

  const summaryText = [
    `*Jom Split · ${bill.venue}*`,
    `Jumlah bil: ${formatRM(calc.grandSen)} (dibayar dulu oleh ${payer.name})`,
    '',
    ...owing.map((r) => `• ${byId[r.id].name}: ${formatRM(r.dueSen)}${paid[r.id] ? ' ✔' : ''}`),
    '',
    `Sila bayar balik kepada ${payer.name}. Terima kasih!`,
  ].join('\n');

  const save = () => {
    const shares = Object.fromEntries(calc.rows.filter((r) => r.dueSen > 0).map((r) => [r.id, r.dueSen]));
    const paidMap = Object.fromEntries(Object.entries(paid).filter(([k, v]) => v && k in shares));
    dispatch({
      type: 'SAVE_HISTORY',
      entry: { id: `h_${Date.now()}`, title: bill.title, venue: bill.venue, dateISO: bill.dateISO, totalSen: calc.grandSen, payerId: payer.id, shares, paid: paidMap, settleDays: 0, sample: false },
    });
    toast('Disimpan ke sejarah', 'good');
    go('sejarah');
  };

  return (
    <>
      <PageHeader eyebrow="Langkah 3 daripada 3" title="Siapa bayar" accent="siapa?" lead={`${bill.venue}. Hantar jumlah ini kepada rakan anda.`} />

      <section className="focal glass" aria-labelledby="focal-title">
        <div className="focal__main">
          <p className="caption" id="focal-title">Jumlah bil</p>
          <Money sen={calc.grandSen} big fromZero />
          <p className="muted">Dibayar dahulu oleh <strong>{payer.name}</strong></p>
        </div>
        <div className="focal__side">
          <label className="field__label" htmlFor="payer">Siapa bayar di kaunter?</label>
          <div className="select-wrap">
            <select id="payer" className="input select" value={payer.id} onChange={(e) => dispatch({ type: 'SET_BILL_FIELD', patch: { payerId: e.target.value } })}>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Icon name="ChevronDown" size={18} />
          </div>
          <div className="collect">
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Jumlah terkumpul">
              <span className="progress__fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="muted">Terkumpul {formatRM(collected)} daripada {formatRM(calc.grandSen)} ({pct}%)</p>
          </div>
        </div>
      </section>

      <div className="summary-grid">
        <section className="card" aria-labelledby="owe-title">
          <h2 id="owe-title" className="h3">Perlu bayar kepada {payer.name}</h2>
          {owing.length === 0 ? (
            <p className="muted">Hanya {payer.name} yang makan dalam bil ini. Tiada tuntutan.</p>
          ) : (
            <ul className="settle">
              {owing.map((r) => {
                const done = !!paid[r.id];
                return (
                  <li key={r.id} className={`settle__row${done ? ' is-done' : ''}`}>
                    <Avatar person={byId[r.id]} size={36} />
                    <div className="settle__who">
                      <span className="settle__name">{byId[r.id].name}</span>
                      <span className="settle__sub">{r.items} item{done && ' · sudah bayar'}</span>
                    </div>
                    <Money sen={r.dueSen} />
                    <div className="settle__actions">
                      <button type="button" className="icon-btn" aria-label={`Salin mesej untuk ${byId[r.id].name}`} onClick={() => copy(msgFor(r), `Mesej untuk ${byId[r.id].name} disalin`)}>
                        <Icon name="Copy" size={18} />
                      </button>
                      <Button size="sm" variant="secondary" icon={done ? 'Undo2' : 'Check'} aria-pressed={done} onClick={() => dispatch({ type: 'TOGGLE_PAID', personId: r.id })}>
                        {done ? 'Batal' : 'Dah bayar'}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {allPaid && <p className="callout callout--good" role="status"><Icon name="CircleCheck" size={18} /> Semua sudah bayar. Simpan ke sejarah untuk menutup bil ini.</p>}
          <div className="summary-actions">
            <Button variant="primary" icon="Copy" onClick={() => copy(summaryText, 'Ringkasan disalin. Tampal di WhatsApp.')}>Salin untuk WhatsApp</Button>
            <Button as="a" href={`https://wa.me/?text=${encodeURIComponent(summaryText)}`} target="_blank" rel="noopener noreferrer" icon="ExternalLink">Buka WhatsApp</Button>
            <Button icon="History" onClick={save}>Simpan ke sejarah</Button>
          </div>
        </section>

        <div className="stack">
          <section className="card" aria-labelledby="chart-title">
            <h2 id="chart-title" className="h3">Bahagian setiap orang</h2>
            <BalanceChart rows={chartRows} caption={`Bahagian setiap orang dalam ringgit Malaysia. ${chartRows.map((r) => `${r.name} ${(r.value / 100).toFixed(2)}`).join(', ')}.`} />
          </section>
          <section className="card" aria-labelledby="break-title">
            <h2 id="break-title" className="h3">Pecahan bil</h2>
            <dl className="breakdown">
              <div><dt>Subjumlah item</dt><dd>{formatRM(calc.assignedSen)}</dd></div>
              <div><dt>Caj perkhidmatan</dt><dd>{formatRM(calc.serviceSen)}</dd></div>
              <div><dt>SST</dt><dd>{formatRM(calc.sstSen)}</dd></div>
              <div><dt>Jumlah bil</dt><dd><strong>{formatRM(calc.grandSen)}</strong></dd></div>
            </dl>
            {state.prefs.round5 && (
              <p className="muted small">Bahagian rakan dibundarkan ke 5 sen terdekat. Pelarasan {formatRM(calc.roundingSen, { signed: true })} ditanggung {payer.name}.</p>
            )}
            {calc.unassignedCount > 0 && (
              <p className="callout callout--warn"><Icon name="TriangleAlert" size={18} />{calc.unassignedCount} item belum diagih tidak termasuk di sini.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
