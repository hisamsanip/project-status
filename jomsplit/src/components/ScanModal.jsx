import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ClipboardPaste, Cpu, FileScan, ImageUp, RefreshCw, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatRM, parseMoney, toInputValue } from '../lib/money';
import { recogniseReceipt } from '../lib/ocr';
import { parseReceipt } from '../lib/receipt';
import { useBill } from '../lib/store';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Segmented } from './ui/Segmented';
import { useToast } from './ui/Toast';

const STAGES = [
  { id: 'engine', label: 'Muat enjin OCR', icon: Cpu },
  { id: 'read', label: 'Baca teks resit', icon: FileScan },
  { id: 'parse', label: 'Kenal pasti item & harga', icon: Sparkles },
];

const level = (c) => (c == null ? null : c >= 85 ? 'high' : c >= 60 ? 'mid' : 'low');
const LEVEL_LABEL = { high: 'Yakin', mid: 'Sederhana', low: 'Semak' };

function Pipeline({ stage, progress }) {
  const at = STAGES.findIndex((s) => s.id === stage);
  return (
    <ol className="pipeline" aria-label="Kemajuan imbasan">
      {STAGES.map((s, i) => {
        const state = i < at ? 'done' : i === at ? 'active' : 'todo';
        return (
          <li key={s.id} className={`is-${state}`}>
            <span className="pipe-icon">{state === 'done' ? <Check size={14} /> : <s.icon size={14} />}</span>
            <span className="pipe-label">{s.label}</span>
            {state === 'active' && <span className="num muted">{Math.round(progress * 100)}%</span>}
            {state === 'active' && (
              <span className="pipe-bar">
                <motion.span animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ ease: 'easeOut' }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ScanModal({ open, onClose }) {
  const { state, dispatch } = useBill();
  const toast = useToast();
  const [tab, setTab] = useState('photo');
  const [phase, setPhase] = useState('idle'); // idle | working | review | error
  const [stage, setStage] = useState('engine');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [rows, setRows] = useState([]);
  const [useRates, setUseRates] = useState(true);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const run = useRef(0);

  const reset = useCallback(() => {
    run.current++;
    setPhase('idle');
    setError('');
    setResult(null);
    setRows([]);
    setProgress(0);
    setPreview((p) => (p && URL.revokeObjectURL(p), null));
  }, []);

  // Reset on open, not on close: swapping content mid exit-animation stalls it.
  useEffect(() => {
    if (open) reset();
    else run.current++;
  }, [open, reset]);

  const review = (parsed, overall) => {
    setResult({ ...parsed, overall });
    setRows(parsed.items.map((it, i) => ({ ...it, key: i, pick: true, amountText: toInputValue(it.amount) })));
    setUseRates(true);
    setPhase('review');
  };

  const scanFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return (setPhase('error'), setError('Fail ini bukan gambar. Guna JPG, PNG atau HEIC dari kamera.'));
    if (file.size > 15 * 1024 * 1024) return (setPhase('error'), setError('Gambar melebihi 15 MB. Cuba ambil semula dengan resolusi lebih rendah.'));
    const me = ++run.current;
    setPreview((p) => (p && URL.revokeObjectURL(p), URL.createObjectURL(file)));
    setPhase('working');
    setError('');
    try {
      const { lines, confidence } = await recogniseReceipt(file, (s, p) => {
        if (run.current !== me) return;
        setStage(s);
        setProgress(p || 0);
      });
      if (run.current !== me) return;
      setStage('parse');
      setProgress(1);
      const parsed = parseReceipt(lines);
      if (!parsed.items.length) throw new Error('Tiada baris item dengan harga dapat dibaca. Pastikan resit rata, terang dan memenuhi gambar, atau tampal teks secara manual.');
      review(parsed, confidence);
    } catch (e) {
      if (run.current !== me) return;
      setPhase('error');
      setError(e.message || 'Imbasan gagal.');
    }
  };

  const parseText = () => {
    const parsed = parseReceipt(text.split(/\r?\n/));
    if (!parsed.items.length) {
      setPhase('error');
      setError('Tiada item dikesan. Pastikan setiap baris berakhir dengan harga, cth "Teh Tarik 3.50".');
      return;
    }
    review(parsed, null);
  };

  const picked = rows.filter((r) => r.pick && parseMoney(r.amountText) > 0 && r.name.trim());
  const pickedSum = picked.reduce((s, r) => s + parseMoney(r.amountText), 0);
  const ratesFound = result && (result.sst != null || result.service != null);

  const commit = () => {
    const solo = state.people.length === 1 ? [state.people[0].id] : [];
    dispatch({ type: 'addItems', items: picked.map((r) => ({ name: r.name.trim().slice(0, 48), qty: r.qty, amount: parseMoney(r.amountText), ids: solo })) });
    if (ratesFound && useRates) dispatch({ type: 'charges', patch: { ...(result.sst != null && { sst: result.sst }), ...(result.service != null && { service: result.service }) } });
    toast({ type: 'success', title: `${picked.length} item dimasukkan`, message: state.people.length > 1 ? 'Sekarang tetapkan siapa makan apa.' : undefined });
    onClose();
    setTimeout(() => document.getElementById('item')?.scrollIntoView({ behavior: 'smooth' }), 250);
  };

  const footer =
    phase === 'review' ? (
      <>
        <Button variant="ghost" icon={RefreshCw} onClick={reset}>
          Imbas lain
        </Button>
        <Button variant="primary" icon={Check} disabled={!picked.length} onClick={commit}>
          Masukkan {picked.length} item · {formatRM(pickedSum)}
        </Button>
      </>
    ) : tab === 'text' && phase !== 'working' ? (
      <Button variant="primary" icon={Sparkles} disabled={!text.trim()} onClick={parseText}>
        Kenal pasti item
      </Button>
    ) : null;

  return (
    <Modal open={open} onClose={onClose} icon={ScanLine} title="Imbas resit" description="Baca item dan harga daripada resit anda, kemudian semak sebelum masuk." footer={footer} size="lg">
      {phase !== 'review' && (
        <Segmented
          label="Sumber resit"
          value={tab}
          onChange={(t) => (reset(), setTab(t))}
          options={[
            { value: 'photo', label: 'Gambar resit', icon: ImageUp },
            { value: 'text', label: 'Tampal teks', icon: ClipboardPaste },
          ]}
        />
      )}

      <AnimatePresence mode="wait">
        {phase === 'review' ? (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="scan-review">
            <div className="scan-meta">
              <span className="badge">
                <Sparkles size={12} aria-hidden /> {result.items.length} item dikesan
              </span>
              {result.overall != null && <span className={`badge conf-${level(result.overall)}`}>Keyakinan OCR {result.overall}%</span>}
              {result.printedSubtotal != null && (
                <span className={`badge ${result.printedSubtotal === pickedSum ? 'conf-high' : 'conf-mid'}`}>
                  {result.printedSubtotal === pickedSum ? <ShieldCheck size={12} aria-hidden /> : <AlertTriangle size={12} aria-hidden />}
                  Subtotal resit {formatRM(result.printedSubtotal)}
                  {result.printedSubtotal !== pickedSum && ` · beza ${formatRM(pickedSum - result.printedSubtotal, { sign: true })}`}
                </span>
              )}
            </div>
            <p className="field-hint">OCR boleh tersilap baca. Betulkan nama atau harga di bawah, dan nyahtanda baris yang bukan makanan.</p>
            <ul className="scan-rows">
              {rows.map((r, i) => {
                const lv = level(r.confidence);
                const bad = !(parseMoney(r.amountText) > 0);
                const set = (patch) => setRows((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                return (
                  <li key={r.key} className={r.pick ? '' : 'is-off'}>
                    <input type="checkbox" checked={r.pick} onChange={(e) => set({ pick: e.target.checked })} aria-label={`Masukkan ${r.name}`} />
                    <input className="scan-name" value={r.name} onChange={(e) => set({ name: e.target.value })} aria-label="Nama item" />
                    <span className="muted num">×{r.qty}</span>
                    <input className={`scan-amt num ${bad ? 'is-bad' : ''}`} inputMode="decimal" value={r.amountText} onChange={(e) => set({ amountText: e.target.value })} aria-label="Harga" />
                    {lv && (
                      <span className={`conf conf-${lv}`} data-tip={`Baris dibaca: "${r.raw}"`}>
                        <span className="conf-bar">
                          <span style={{ width: `${r.confidence}%` }} />
                        </span>
                        {LEVEL_LABEL[lv]}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {ratesFound && (
              <label className="rates">
                <input type="checkbox" checked={useRates} onChange={(e) => setUseRates(e.target.checked)} />
                <span>
                  Guna kadar daripada resit:
                  {result.sst != null && <b> SST {result.sst}%</b>}
                  {result.service != null && <b> · Servis {result.service}%</b>}
                </span>
              </label>
            )}
          </motion.div>
        ) : phase === 'working' ? (
          <motion.div key="working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scan-working">
            {preview && (
              <div className="scan-preview">
                <img src={preview} alt="Resit yang sedang diimbas" />
                <span className="scan-beam" aria-hidden />
              </div>
            )}
            <Pipeline stage={stage} progress={progress} />
            <Button variant="ghost" size="sm" onClick={reset}>
              Batal
            </Button>
          </motion.div>
        ) : tab === 'photo' ? (
          <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              className={`dropzone ${drag ? 'is-drag' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => input.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
              onDragOver={(e) => (e.preventDefault(), setDrag(true))}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                scanFile(e.dataTransfer.files?.[0]);
              }}
            >
              <span className="dropzone-icon">
                <ImageUp size={22} aria-hidden />
              </span>
              <strong>Seret gambar resit ke sini</strong>
              <span className="muted">atau klik untuk pilih / ambil gambar · JPG, PNG hingga 15 MB</span>
              <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (scanFile(e.target.files?.[0]), (e.target.value = ''))} />
            </div>
            <p className="privacy">
              <ShieldCheck size={14} aria-hidden /> Gambar diproses dalam pelayar anda dengan Tesseract OCR. Enjin dimuat turun sekali (~10 MB); gambar tidak dimuat naik ke mana-mana.
            </p>
          </motion.div>
        ) : (
          <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label className="field">
              <span className="field-label">Teks resit — satu item sebaris, harga di hujung</span>
              <textarea data-autofocus className="paste" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Nasi Goreng Kampung   14.50\n2 Teh Tarik           7.00\nTomyam Campur         28.00\nSST 6%                2.97'} />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'error' && (
        <div className="alert" role="alert">
          <AlertTriangle size={16} aria-hidden />
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={reset}>
            Cuba lagi
          </Button>
        </div>
      )}
    </Modal>
  );
}
