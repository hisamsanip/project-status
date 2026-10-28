import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, FileSpreadsheet, FileText, FileType2, File as FileIcon, Search, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Segmented from '../components/ui/Segmented';
import { useStore } from '../lib/store';
import { FUNCTIONS, fnById, phaseForMonth } from '../data/plan';

// Keyword cues used by the mock classifier to route a document to a function.
const CUES = {
  1: ['property', 'tenant', 'strata', 'residen'],
  2: ['facilit', 'maintenance', 'cmms', 'asset'],
  3: ['contract', 'project'],
  4: ['tender', 'bid', 'proposal'],
  5: ['pricing', 'price', 'rates', 'cost', 'commercial'],
  6: ['finance', 'tax', 'cash', 'budget', 'account', 'financial'],
  7: ['vendor', 'procure', 'supplier', 'subcontract'],
  8: ['operation', 'mobilis', 'sop', 'site'],
  9: ['hsse', 'safety', 'iso', 'quality'],
  10: ['kpi', 'data', 'dashboard', 'report', 'system', 'propkita'],
  11: ['manpower', 'hr', 'competency', 'training', 'staff', 'hiring'],
  12: ['governance', 'legal', 'charter', 'policy', 'board', 'compliance', 'licen'],
};

const FINDINGS = {
  1: ['Service scope per development captured', 'Customer promise to be confirmed in charter'],
  2: ['Planned vs reactive maintenance split extracted', 'Asset data gaps flagged for CMMS'],
  3: ['Contract obligations mapped to SLA owners', 'Change-control clause identified'],
  4: ['Tender pipeline entries extracted', 'Technical / commercial split noted'],
  5: ['Rates compared against cost library structure', 'Pricing methodology assumptions listed'],
  6: ['Working capital and bonding items noted', 'Project costing lines mapped'],
  7: ['Vendor categories and prequalification status extracted', 'HSSE evidence checked per vendor'],
  8: ['30/60/90-day mobilisation steps detected', 'SOP owners identified'],
  9: ['HSSE controls per site extracted', 'ISO programme actions listed'],
  10: ['KPI definitions and data owners extracted', 'Data completeness checks proposed'],
  11: ['Competency gaps by role extracted', 'Hiring plan linked to phase gates'],
  12: ['Decision rights and approvers extracted', 'Compliance checklist items listed'],
};

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function classify(name, month) {
  const n = name.toLowerCase();
  const hit = Object.entries(CUES).find(([, words]) => words.some((w) => n.includes(w)));
  const focus = phaseForMonth(month).focus;
  const fn = hit ? Number(hit[0]) : focus[hash(n) % focus.length];
  const confidence = (hit ? 0.84 : 0.66) + (hash(n) % 12) / 100;
  return { fn, confidence: Math.min(0.98, confidence) };
}

const kindOf = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return 'doc';
  return 'file';
};

const KIND_ICON = { sheet: FileSpreadsheet, pdf: FileType2, doc: FileText, file: FileIcon };

const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

const STAGES = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'reading', label: 'Reading' },
  { key: 'classifying', label: 'Classifying' },
];

function Dropzone({ onFiles }) {
  const [over, setOver] = useState(false);
  const input = useRef(null);
  return (
    <div
      className={`dropzone ${over ? 'is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles([...e.dataTransfer.files]);
      }}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      aria-label="Upload evidence files"
    >
      <input
        ref={input}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          onFiles([...e.target.files]);
          e.target.value = '';
        }}
      />
      <div className="dropzone-orb">
        <UploadCloud size={26} />
      </div>
      <h3>Drop evidence packs here</h3>
      <p className="muted">
        Registers, contracts, SOPs, KPI definitions. Canopy reads each file, routes it to one of the 12 functions and pulls out what matters.
      </p>
      <span className="dropzone-cta">
        <Button size="sm" variant="secondary" as="span">
          Browse files
        </Button>
        <span className="mono faint">XLSX · PDF · DOCX · CSV</span>
      </span>
      <p className="mono faint dropzone-note">Files stay in this browser. Nothing is sent to a server in this mockup.</p>
    </div>
  );
}

function EvidenceRow({ item }) {
  const { dispatch } = useStore();
  const Icon = KIND_ICON[item.kind] || FileIcon;
  const inFlight = STAGES.some((s) => s.key === item.status);
  const stageIdx = STAGES.findIndex((s) => s.key === item.status);
  const fn = fnById(item.fn);

  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className={`ev ${inFlight ? 'is-busy' : ''}`}>
      <span className={`ev-icon kind-${item.kind}`}>
        <Icon size={18} />
      </span>
      <div className="ev-main">
        <div className="ev-top">
          <span className="ev-name">{item.name}</span>
          <span className="mono faint ev-size">{fmtSize(item.size)}</span>
        </div>
        {inFlight ? (
          <div className="ev-pipeline">
            {STAGES.map((s, i) => (
              <span key={s.key} className={`ev-stage ${i < stageIdx ? 'is-done' : i === stageIdx ? 'is-active' : ''}`}>
                {s.label}
              </span>
            ))}
            <div className="ev-progress">
              <motion.span animate={{ width: `${((stageIdx + 1) / (STAGES.length + 1)) * 100}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="ev-meta">
              <label className="ev-fn">
                <span className="sr-only">Function</span>
                <select value={item.fn} onChange={(e) => dispatch({ type: 'updateEvidence', id: item.id, patch: { fn: Number(e.target.value) } })}>
                  {FUNCTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} · {f.name}
                    </option>
                  ))}
                </select>
              </label>
              <span className="mono faint">{Math.round(item.confidence * 100)}% confidence</span>
              {item.status === 'review' ? <Badge tone="iris" dot>Needs review</Badge> : <Badge tone="leaf" dot>Analysed</Badge>}
            </div>
            <ul className="ev-insights">
              {item.insights.map((t) => (
                <li key={t}>
                  <Sparkles size={12} className="tone-leaf" />
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      {!inFlight && (
        <div className="ev-actions">
          {item.status === 'review' && (
            <button className="icon-btn" title="Mark reviewed" aria-label={`Mark ${item.name} reviewed`} onClick={() => dispatch({ type: 'updateEvidence', id: item.id, patch: { status: 'analysed' } })}>
              <CheckCheck size={16} />
            </button>
          )}
          <button className="icon-btn" title="Remove" aria-label={`Remove ${item.name}`} onClick={() => dispatch({ type: 'removeEvidence', id: item.id })}>
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <span className="sr-only">{fn?.name}</span>
    </motion.li>
  );
}

export default function Evidence() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const onFiles = (files) => {
    files.forEach((file, k) => {
      const id = `ev-${Date.now()}-${k}`;
      const { fn, confidence } = classify(file.name, state.month);
      dispatch({
        type: 'addEvidence',
        item: { id, name: file.name, size: file.size, kind: kindOf(file.name), fn, status: 'uploading', confidence, insights: [], addedAt: new Date().toISOString().slice(0, 10) },
      });
      const base = 500 + k * 250;
      setTimeout(() => dispatch({ type: 'updateEvidence', id, patch: { status: 'reading' } }), base);
      setTimeout(() => dispatch({ type: 'updateEvidence', id, patch: { status: 'classifying' } }), base + 900);
      setTimeout(
        () =>
          dispatch({
            type: 'updateEvidence',
            id,
            patch: { status: confidence < 0.8 ? 'review' : 'analysed', insights: FINDINGS[fn] },
          }),
        base + 1900,
      );
    });
  };

  const coverage = useMemo(() => FUNCTIONS.map((f) => ({ ...f, n: state.evidence.filter((e) => e.fn === f.id).length })), [state.evidence]);
  const max = Math.max(1, ...coverage.map((c) => c.n));
  const covered = coverage.filter((c) => c.n > 0).length;

  const list = state.evidence.filter(
    (e) =>
      (filter === 'all' || (filter === 'review' ? e.status === 'review' : e.status === 'analysed')) &&
      (!q || e.name.toLowerCase().includes(q.toLowerCase()) || fnById(e.fn)?.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Intelligence · Evidence vault"
        title={
          <>
            Every score needs <em>proof</em>.
          </>
        }
        subtitle="Function owners file a monthly evidence pack. Canopy reads, classifies and summarises each document so the PMO can check gates faster."
      />

      <div className="grid grid-2-1">
        <Dropzone onFiles={onFiles} />
        <Card>
          <CardHeader eyebrow="Coverage" title={`${covered} of 12 functions evidenced`} />
          <ul className="coverage">
            {coverage.map((c) => (
              <li key={c.id}>
                <span className="mono faint">{String(c.id).padStart(2, '0')}</span>
                <span className="coverage-name">{c.name}</span>
                <span className="coverage-bar">
                  <motion.span className={c.n ? 'tone-bg-leaf' : ''} animate={{ width: `${(c.n / max) * 100}%` }} />
                </span>
                <span className="mono coverage-n">{c.n}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="toolbar toolbar-split">
          <div className="input-wrap">
            <Search size={15} className="faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents or functions" aria-label="Search documents" />
          </div>
          <Segmented
            label="Status"
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'analysed', label: 'Analysed' },
              { value: 'review', label: 'Review' },
            ]}
          />
        </div>
        <ul className="ev-list">
          <AnimatePresence initial={false}>
            {list.map((item) => (
              <EvidenceRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
          {list.length === 0 && <li className="empty">No documents match. Drop a file above to start.</li>}
        </ul>
      </Card>
    </div>
  );
}
