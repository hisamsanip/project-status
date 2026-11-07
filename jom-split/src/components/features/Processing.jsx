import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import { STAGES } from '../../lib/ocr.js';

/** Panel kaca semasa "AI" memproses (simulasi). Tahap dibaca oleh pembaca skrin melalui aria-live. */
export default function Processing({ stage, preview, fileName, onCancel }) {
  const pct = Math.round((Math.min(stage, STAGES.length) / STAGES.length) * 100);
  return (
    <section className="processing glass" aria-labelledby="proc-title">
      <div className="processing__media" aria-hidden="true">
        {preview ? <img src={preview} alt="" /> : <div className="processing__placeholder"><Icon name="Receipt" size={40} /></div>}
        <span className="processing__beam" />
      </div>
      <div className="processing__body">
        <p className="caption">Simulasi pemprosesan</p>
        <h2 id="proc-title" className="h2">Sedang membaca resit anda</h2>
        <p className="muted">{fileName || 'Resit contoh'}</p>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Kemajuan pemprosesan">
          <span className="progress__fill" style={{ width: `${pct}%` }} />
        </div>
        <ol className="stages" aria-live="polite">
          {STAGES.map((s, i) => {
            const state = i < stage ? 'done' : i === stage ? 'now' : 'wait';
            return (
              <li key={s.id} className={`stage stage--${state}`}>
                <span className="stage__dot">{state === 'done' ? <Icon name="Check" size={14} /> : state === 'now' ? <Icon name="LoaderCircle" size={14} className="spin" /> : null}</span>
                <span>{s.label}</span>
              </li>
            );
          })}
        </ol>
        <Button variant="ghost" icon="X" onClick={onCancel}>Batal</Button>
      </div>
    </section>
  );
}
