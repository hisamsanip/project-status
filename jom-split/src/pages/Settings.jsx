import { useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Field, Switch } from '../components/ui/Field.jsx';
import { useStore } from '../hooks/useStore.jsx';

const SWATCHES = [
  ['Latar', '#070B14', 'var(--c-bg)'], ['Permukaan', '#0C1220', 'var(--c-surface)'], ['Permukaan 2', '#121A2C', 'var(--c-surface-2)'],
  ['Teks', '#EAEEF8', 'var(--c-text)'], ['Teks 2', '#AAB5CD', 'var(--c-text-2)'], ['Teks 3', '#8F9BB6', 'var(--c-text-3)'],
  ['Aksen', '#5EEAD4', 'var(--c-accent)'], ['Biru', '#5B8DEF', 'var(--c-blue)'], ['Ungu', '#8B7CF6', 'var(--c-violet)'],
  ['Baik', '#5CD6A0', 'var(--c-good)'], ['Amaran', '#F2B544', 'var(--c-warn)'], ['Ralat', '#FF8A97', 'var(--c-bad)'],
];
const SPACING = [8, 16, 24, 32, 48, 64];

export default function Settings() {
  const { state, dispatch, toast } = useStore();
  const { prefs } = state;
  const [tab, setTab] = useState('umum');
  const [name, setName] = useState(prefs.name);
  const [sst, setSst] = useState(String(Math.round(prefs.sstRate * 100)));
  const [svc, setSvc] = useState(String(Math.round(prefs.serviceRate * 100)));
  const [errs, setErrs] = useState({});
  const [confirm, setConfirm] = useState(false);

  const saveGeneral = (e) => {
    e.preventDefault();
    if (!name.trim()) return setErrs({ name: 'Nama paparan tak boleh kosong.' });
    setErrs({});
    dispatch({ type: 'SET_PREFS', patch: { name: name.trim() } });
    toast('Tetapan disimpan', 'good');
  };

  const saveRates = (e) => {
    e.preventDefault();
    const a = Number(sst); const b = Number(svc);
    const next = {};
    if (!Number.isFinite(a) || a < 0 || a > 15) next.sst = 'Masukkan 0 hingga 15.';
    if (!Number.isFinite(b) || b < 0 || b > 15) next.svc = 'Masukkan 0 hingga 15.';
    setErrs(next);
    if (Object.keys(next).length) return;
    dispatch({ type: 'SET_PREFS', patch: { sstRate: a / 100, serviceRate: b / 100 } });
    dispatch({ type: 'SET_BILL_FIELD', patch: { sstRate: a / 100, serviceRate: b / 100 } });
    toast('Kadar disimpan dan dikenakan pada bil semasa', 'good');
  };

  return (
    <>
      <PageHeader eyebrow="Keutamaan" title="Tetapan" lead="Laraskan kadar cukai, pembundaran dan gerakan." />
      <Tabs idPrefix="set" label="Bahagian tetapan" value={tab} onChange={setTab} tabs={[
        { id: 'umum', label: 'Umum' }, { id: 'kadar', label: 'Cukai & bayaran' }, { id: 'reka', label: 'Reka bentuk' },
      ]} />
      <div id="set-panel" role="tabpanel" aria-labelledby={`set-${tab}`} className="settings">
        {tab === 'umum' && (
          <>
            <form className="card stack" onSubmit={saveGeneral} noValidate>
              <h2 className="h3">Profil</h2>
              <Field label="Nama paparan" error={errs.name}>
                {(p) => <input {...p} className="input" value={name} onChange={(e) => setName(e.target.value)} />}
              </Field>
              <div><Button type="submit" variant="primary" icon="Check">Simpan</Button></div>
            </form>
            <div className="card stack">
              <h2 className="h3">Gerakan</h2>
              <Switch id="sw-motion" checked={prefs.reduceMotion} onChange={(v) => dispatch({ type: 'SET_PREFS', patch: { reduceMotion: v } })} label="Kurangkan gerakan" hint="Mematikan peralihan dan kiraan naik. Tetapan sistem anda juga dihormati." />
            </div>
            <div className="card stack">
              <h2 className="h3">Data demo</h2>
              <p className="muted">Semua bil, rakan dan sejarah dalam demo ini ialah contoh dan disimpan hanya dalam pelayar anda.</p>
              {confirm ? (
                <div className="row-actions">
                  <Button variant="danger" icon="RotateCcw" onClick={() => { dispatch({ type: 'RESET' }); setConfirm(false); toast('Data demo ditetapkan semula', 'good'); }}>Ya, set semula</Button>
                  <Button variant="ghost" onClick={() => setConfirm(false)}>Batal</Button>
                </div>
              ) : (
                <div><Button icon="RotateCcw" onClick={() => setConfirm(true)}>Set semula data demo</Button></div>
              )}
            </div>
          </>
        )}
        {tab === 'kadar' && (
          <>
            <form className="card stack" onSubmit={saveRates} noValidate>
              <h2 className="h3">Kadar lalai</h2>
              <div className="grid grid--2">
                <Field label="SST (%)" error={errs.sst} hint="Biasanya 6% di restoran berdaftar.">
                  {(p) => <input {...p} className="input input--num" inputMode="decimal" value={sst} onChange={(e) => setSst(e.target.value)} />}
                </Field>
                <Field label="Caj perkhidmatan (%)" error={errs.svc} hint="Biasanya 10%. Semak resit anda.">
                  {(p) => <input {...p} className="input input--num" inputMode="decimal" value={svc} onChange={(e) => setSvc(e.target.value)} />}
                </Field>
              </div>
              <div><Button type="submit" variant="primary" icon="Check">Simpan kadar</Button></div>
            </form>
            <div className="card stack">
              <Switch id="sw-round" checked={prefs.round5} onChange={(v) => dispatch({ type: 'SET_PREFS', patch: { round5: v } })} label="Bundar ke 5 sen" hint="Bahagian rakan dibundarkan; pembayar menanggung perbezaan supaya jumlah tepat." />
            </div>
          </>
        )}
        {tab === 'reka' && (
          <>
            <section className="card stack" aria-labelledby="ds-col">
              <h2 id="ds-col" className="h3">Warna</h2>
              <ul className="swatches">
                {SWATCHES.map(([n, hex, v]) => (
                  <li key={n}><span className="swatch" style={{ background: v }} /><span className="swatch__name">{n}</span><code>{hex}</code></li>
                ))}
              </ul>
              <p className="muted small">Semua pasangan teks dan latar diuji ≥ 4.5:1 (WCAG AA) dengan <code>scripts/contrast.mjs</code>.</p>
            </section>
            <section className="card stack" aria-labelledby="ds-type">
              <h2 id="ds-type" className="h3">Tipografi</h2>
              <p className="display" style={{ fontSize: 'clamp(2rem,6vw,3rem)' }}>Instrument <em>Serif</em></p>
              <p className="lead">Geist untuk teks, label dan angka (tabular).</p>
              <p className="muted">Skala: 12 · 14 · 16 · 18 · 20 · 28 · 36–56 · 44–80 px</p>
            </section>
            <section className="card stack" aria-labelledby="ds-sp">
              <h2 id="ds-sp" className="h3">Jarak 8 px, bucu dan gerakan</h2>
              <ul className="spacing">
                {SPACING.map((s) => <li key={s}><span style={{ width: s }} /><code>{s}px</code></li>)}
              </ul>
              <p className="muted small">Bucu 8 / 16 / 24 px. Gerakan 150, 200 dan 300 ms dengan lengkung <code>cubic-bezier(.2,.8,.2,1)</code>.</p>
            </section>
          </>
        )}
      </div>
    </>
  );
}
