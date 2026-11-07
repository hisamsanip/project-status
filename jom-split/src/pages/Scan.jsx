import { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Icon from '../components/ui/Icon.jsx';
import Meter from '../components/ui/Meter.jsx';
import { Field, Switch } from '../components/ui/Field.jsx';
import { EmptyState, ErrorState } from '../components/ui/Feedback.jsx';
import Dropzone from '../components/features/Dropzone.jsx';
import Processing from '../components/features/Processing.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { runScan, validateFile } from '../lib/ocr.js';
import { formatRM, parseRM } from '../lib/money.js';

const toDraft = (bill) => ({
  ...bill,
  items: bill.items.map((i) => ({ ...i, priceStr: (i.priceSen / 100).toFixed(2), error: '' })),
});

export default function Scan({ go }) {
  const { dispatch, toast } = useStore();
  const [phase, setPhase] = useState('idle'); // idle | processing | error | done
  const [stage, setStage] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState('');
  const [draft, setDraft] = useState(null);
  const [forceFail, setForceFail] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addErr, setAddErr] = useState('');
  const ctrl = useRef(null);
  const heading = useRef(null);

  useEffect(() => () => { ctrl.current?.abort(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => { if (phase !== 'processing') heading.current?.focus?.(); }, [phase]);

  const begin = useCallback(async (f = null) => {
    if (f) {
      const v = validateFile(f);
      if (!v.ok) { setErr(v.message); setPhase('error'); return; }
    }
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setStage(0);
    setPhase('processing');
    ctrl.current = new AbortController();
    try {
      const bill = await runScan(f, { onStage: setStage, signal: ctrl.current.signal, forceFail });
      setDraft(toDraft(bill));
      setPhase('done');
    } catch (e) {
      if (e.name === 'AbortError') return;
      setErr(e.message);
      setPhase('error');
    }
  }, [forceFail]);

  const cancel = () => { ctrl.current?.abort(); setPhase('idle'); toast('Imbasan dibatalkan');  };

  const manual = () => {
    setDraft({ ...toDraft({ id: `bill_m_${Date.now()}`, title: 'Bil manual', venue: 'Bil manual', dateISO: new Date().toISOString().slice(0, 10), source: 'manual', items: [], sstOn: true, serviceOn: true, sstRate: 0.06, serviceRate: 0.1, payerId: 'p1' }) });
    setFile(null);
    setPhase('done');
  };

  const patchItem = (id, patch) => setDraft((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch, error: '' } : i)) }));
  const removeItem = (id) => setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const addItem = (e) => {
    e.preventDefault();
    const sen = parseRM(newPrice);
    if (!newName.trim()) return setAddErr('Isi nama item.');
    if (Number.isNaN(sen) || sen <= 0) return setAddErr('Masukkan harga seperti 12.50.');
    setAddErr('');
    setDraft((d) => ({ ...d, items: [...d.items, { id: `it_n_${Date.now()}`, name: newName.trim(), priceSen: sen, priceStr: (sen / 100).toFixed(2), confidence: 100, assignees: [], error: '' }] }));
    setNewName(''); setNewPrice('');
  };

  const confirm = () => {
    let bad = false;
    const items = draft.items.map((i) => {
      const sen = parseRM(i.priceStr);
      if (!i.name.trim() || Number.isNaN(sen) || sen <= 0) { bad = true; return { ...i, error: 'Semak nama dan harga.' }; }
      return { ...i, name: i.name.trim(), priceSen: sen };
    });
    if (bad) { setDraft((d) => ({ ...d, items })); toast('Ada item yang perlu dibetulkan dahulu', 'warn'); return; }
    if (!items.length) { toast('Tambah sekurang-kurangnya satu item', 'warn'); return; }
    const { items: _x, ...rest } = draft;
    dispatch({ type: 'SET_BILL', bill: { ...rest, items: items.map(({ priceStr, error, ...it }) => it) } });
    toast('Bil dimuatkan. Jom agih item.', 'good');
    go('agih');
  };

  const total = draft ? draft.items.reduce((s, i) => s + (Number.isNaN(parseRM(i.priceStr)) ? 0 : parseRM(i.priceStr)), 0) : 0;
  const avg = draft && draft.items.length ? Math.round(draft.items.reduce((s, i) => s + i.confidence, 0) / draft.items.length) : 0;
  const lows = draft ? draft.items.filter((i) => i.confidence < 80).length : 0;

  return (
    <>
      <PageHeader
        eyebrow="Langkah 1 daripada 3"
        title="Imbas"
        accent="resit anda"
        lead="Muat naik gambar resit dan biar sistem menyenaraikan item. Anda boleh betulkan apa-apa sebelum meneruskan."
      />

      {phase === 'idle' && (
        <>
          <Dropzone onFile={begin} />
          <div className="grid grid--2 scan-alt">
            <article className="card alt">
              <Icon name="Sparkles" size={22} />
              <div>
                <h3 className="h3">Tiada resit? Cuba resit contoh</h3>
                <p className="muted">Lihat seluruh aliran dengan data rekaan.</p>
              </div>
              <Button onClick={() => begin(null)} iconRight="ArrowRight">Guna resit contoh</Button>
            </article>
            <article className="card alt">
              <Icon name="Pencil" size={22} />
              <div>
                <h3 className="h3">Taip sendiri</h3>
                <p className="muted">Masukkan item dan harga secara manual.</p>
              </div>
              <Button onClick={manual} iconRight="ArrowRight">Masukkan manual</Button>
            </article>
          </div>
          <div className="card demo-tools">
            <Switch id="force-fail" checked={forceFail} onChange={setForceFail} label="Alat demo: simulasikan resit kabur" hint="Hidupkan untuk melihat keadaan ralat pada imbasan seterusnya." />
          </div>
          <p className="note"><Icon name="Info" size={16} /> Demo: item yang dikesan dijana daripada resit contoh. Gambar anda hanya dipaparkan di peranti ini dan tidak dibaca.</p>
        </>
      )}

      {phase === 'processing' && <Processing stage={stage} preview={preview} fileName={file?.name} onCancel={cancel} />}

      {phase === 'error' && (
        <ErrorState
          title="Resit tak dapat dibaca"
          body={err}
          onRetry={() => { setForceFail(false); file ? begin(file) : setPhase('idle'); }}
          actions={<><Button onClick={() => { setForceFail(false); begin(null); }}>Guna resit contoh</Button><Button variant="ghost" onClick={manual}>Taip sendiri</Button></>}
        />
      )}

      {phase === 'done' && draft && (
        <section className="card review" aria-labelledby="review-title">
          <div className="review__head">
            <div>
              <h2 id="review-title" tabIndex={-1} ref={heading} className="h2">Semak item dikesan</h2>
              <p className="muted">
                {draft.items.length} item · jumlah {formatRM(total)}
                {draft.source !== 'manual' && <> · keyakinan purata {avg}%</>}
              </p>
            </div>
            {draft.source === 'manual' ? <Badge icon="Pencil">Manual</Badge> : <Badge tone="info" icon="Sparkles">Simulasi</Badge>}
          </div>

          {lows > 0 && (
            <p className="callout callout--warn" role="status">
              <Icon name="TriangleAlert" size={18} /> {lows} item mempunyai keyakinan rendah. Semak baris yang ditanda.
            </p>
          )}

          <Field label="Nama tempat" className="review__venue">
            {(p) => <input {...p} className="input" value={draft.venue} onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value, title: e.target.value }))} />}
          </Field>

          {draft.items.length === 0 ? (
            <EmptyState icon="Receipt" title="Belum ada item" body="Tambah item pertama menggunakan borang di bawah." />
          ) : (
            <ul className="rows">
              {draft.items.map((i) => (
                <li key={i.id} className={`row${i.confidence < 80 ? ' row--warn' : ''}`}>
                  <Field label="Item" className="row__name" error={i.error}>
                    {(p) => <input {...p} className="input" value={i.name} onChange={(e) => patchItem(i.id, { name: e.target.value })} />}
                  </Field>
                  <Field label="Harga (RM)" className="row__price">
                    {(p) => <input {...p} className="input input--num" inputMode="decimal" value={i.priceStr} onChange={(e) => patchItem(i.id, { priceStr: e.target.value, confidence: 100 })} />}
                  </Field>
                  <div className="row__conf">{draft.source !== 'manual' && <Meter value={i.confidence} />}</div>
                  <button type="button" className="icon-btn" onClick={() => removeItem(i.id)} aria-label={`Buang ${i.name || 'item'}`}>
                    <Icon name="Trash2" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="addrow" onSubmit={addItem} noValidate>
            <Field label="Tambah item" error={addErr && !newName.trim() ? addErr : ''}>
              {(p) => <input {...p} className="input" placeholder="cth. Teh Tarik" value={newName} onChange={(e) => setNewName(e.target.value)} />}
            </Field>
            <Field label="Harga (RM)" error={addErr && newName.trim() ? addErr : ''}>
              {(p) => <input {...p} className="input input--num" inputMode="decimal" placeholder="2.80" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />}
            </Field>
            <Button type="submit" icon="Plus">Tambah</Button>
          </form>

          <div className="review__foot">
            <Button variant="ghost" icon="RotateCcw" onClick={() => setPhase('idle')}>Imbas semula</Button>
            <Button variant="primary" size="lg" iconRight="ArrowRight" onClick={confirm}>Teruskan ke agihan</Button>
          </div>
        </section>
      )}
    </>
  );
}
