import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Money from '../components/ui/Money.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Field } from '../components/ui/Field.jsx';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback.jsx';
import BarChart from '../components/charts/BarChart.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { useSimulatedLoad } from '../hooks/useSimulatedLoad.js';
import { formatDate, MONTHS } from '../lib/format.js';
import { formatRM } from '../lib/money.js';

function unpaidOf(h) {
  return Object.keys(h.shares).filter((k) => k !== h.payerId && !h.paid[k]);
}

export default function History() {
  const { state, dispatch } = useStore();
  const { history, people } = state;
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const [range, setRange] = useState('6');
  const [status, setStatus] = useState('semua');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('terkini');
  const [open, setOpen] = useState(null);
  const load = useSimulatedLoad([range]);

  const refISO = history.reduce((m, h) => (h.dateISO > m ? h.dateISO : m), '0000-00-00');
  const [ry, rm, rd] = refISO.split('-').map(Number);

  const chart = useMemo(() => {
    const n = Number(range);
    const buckets = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(ry, rm - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ key, label: MONTHS[d.getMonth()], value: 0, partial: i === 0 });
    }
    for (const h of history) {
      const b = buckets.find((x) => h.dateISO.startsWith(x.key));
      if (b) b.value += h.totalSen / 100;
    }
    return buckets;
  }, [history, range, ry, rm]);

  const total = chart.reduce((s, b) => s + b.value, 0);
  const counts = {
    semua: history.length,
    belum: history.filter((h) => unpaidOf(h).length).length,
    selesai: history.filter((h) => !unpaidOf(h).length).length,
  };

  const list = history
    .filter((h) => (status === 'belum' ? unpaidOf(h).length : status === 'selesai' ? !unpaidOf(h).length : true))
    .filter((h) => !q.trim() || `${h.title} ${h.venue}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (sort === 'jumlah' ? b.totalSen - a.totalSen : b.dateISO.localeCompare(a.dateISO)));

  const caption = `Jumlah dibahagi setiap bulan dalam ringgit Malaysia, ${chart.map((b) => `${b.label} ${Math.round(b.value)}`).join(', ')}. ${chart.at(-1).label} belum lengkap.`;

  return (
    <>
      <PageHeader eyebrow="Rekod" title="Sejarah" accent="makan-makan" lead="Semua bil yang pernah dibahagi, dan siapa yang belum bayar." />

      <section className="card chart-card glass" aria-labelledby="hist-chart">
        <div className="block__head">
          <div>
            <h2 id="hist-chart" className="h3">Jumlah dibahagi setiap bulan</h2>
            <p className="muted">{formatRM(Math.round(total * 100))} dalam {range} bulan · data contoh</p>
          </div>
          <Tabs idPrefix="range" label="Tempoh" value={range} onChange={setRange} tabs={[{ id: '3', label: '3 bulan' }, { id: '6', label: '6 bulan' }]} />
        </div>
        <div id="range-panel" role="tabpanel" aria-labelledby={`range-${range}`}>
          {load.phase === 'loading' && <div className="chart-skel"><Skeleton h={220} r={16} /></div>}
          {load.phase === 'error' && <ErrorState title="Carta gagal dimuatkan" body="Sambungan putus semasa mengambil data. Data anda selamat; cuba muat semula." onRetry={load.retry} />}
          {load.phase === 'ready' && <BarChart data={chart} unit="RM" yTitle="Jumlah dibahagi (RM)" caption={caption} />}
        </div>
        <p className="chart-note">
          <Icon name="Info" size={14} /> Jalur menandakan {chart.at(-1).label} yang belum lengkap (setakat {rd} {MONTHS[rm - 1]}).
          <button type="button" className="linkbtn" onClick={load.simulateError}>Uji keadaan ralat</button>
        </p>
      </section>

      <section className="block" aria-labelledby="list-title">
        <div className="block__head">
          <h2 id="list-title" className="h2">Semua bil</h2>
        </div>
        <div className="toolbar">
          <Tabs idPrefix="stat" label="Status bayaran" value={status} onChange={setStatus} tabs={[
            { id: 'semua', label: 'Semua', count: counts.semua },
            { id: 'belum', label: 'Belum selesai', count: counts.belum },
            { id: 'selesai', label: 'Selesai', count: counts.selesai },
          ]} />
          <Field label="Cari bil" className="toolbar__search">
            {(p) => <input {...p} type="search" className="input" placeholder="cth. Bunga Raya" value={q} onChange={(e) => setQ(e.target.value)} />}
          </Field>
          <Field label="Isih" className="toolbar__sort">
            {(p) => (
              <div className="select-wrap">
                <select {...p} className="input select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="terkini">Terkini dahulu</option>
                  <option value="jumlah">Jumlah tertinggi</option>
                </select>
                <Icon name="ChevronDown" size={18} />
              </div>
            )}
          </Field>
        </div>

        <div id="stat-panel" role="tabpanel" aria-labelledby={`stat-${status}`}>
          {list.length === 0 ? (
            <EmptyState icon="Search" title="Tiada bil sepadan" body="Tiada bil yang sepadan dengan penapis ini." actions={<Button onClick={() => { setStatus('semua'); setQ(''); }}>Set semula penapis</Button>} />
          ) : (
            <ul className="hist">
              {list.map((h) => {
                const unpaid = unpaidOf(h);
                const isOpen = open === h.id;
                return (
                  <motion.li key={h.id} layout transition={{ duration: 0.2 }} className="card hist__item">
                    <button type="button" className="hist__btn" aria-expanded={isOpen} aria-controls={`d-${h.id}`} onClick={() => setOpen(isOpen ? null : h.id)}>
                      <span className="hist__main">
                        <span className="hist__title">{h.title}</span>
                        <span className="hist__sub">{h.venue} · {formatDate(h.dateISO)}{h.sample && ' · contoh'}</span>
                      </span>
                      <Badge tone={unpaid.length ? 'warn' : 'good'} icon={unpaid.length ? 'TriangleAlert' : 'CircleCheck'}>
                        {unpaid.length ? `${unpaid.length} belum bayar` : 'Selesai'}
                      </Badge>
                      <span className="hist__total">{formatRM(h.totalSen)}</span>
                      <Icon name="ChevronDown" size={18} className={`chev${isOpen ? ' is-open' : ''}`} />
                    </button>
                    {isOpen && (
                      <ul id={`d-${h.id}`} className="hist__detail">
                        {Object.entries(h.shares).map(([pid, sen]) => {
                          const p = byId[pid];
                          if (!p) return null;
                          const isPayer = pid === h.payerId;
                          const done = isPayer || h.paid[pid];
                          return (
                            <li key={pid} className="hist__share">
                              <Avatar person={p} size={28} />
                              <span className="hist__name">{p.name}{isPayer && ' · bayar dulu'}</span>
                              <span className="hist__amt">{formatRM(sen)}</span>
                              {isPayer ? <Badge tone="neutral">Pembayar</Badge> : (
                                <Button size="sm" variant="secondary" icon={done ? 'Undo2' : 'Check'} aria-pressed={!!done} onClick={() => dispatch({ type: 'TOGGLE_HISTORY_PAID', entryId: h.id, personId: pid })}>
                                  {done ? 'Batal' : 'Dah bayar'}
                                </Button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
