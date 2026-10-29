import { Minus, Plus } from 'lucide-react';

export function QtyStepper({ value, onChange, label = 'Kuantiti' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Kurangkan kuantiti">
        <Minus size={14} />
      </button>
      <span className="num" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(99, value + 1))} aria-label="Tambah kuantiti">
        <Plus size={14} />
      </button>
    </div>
  );
}
