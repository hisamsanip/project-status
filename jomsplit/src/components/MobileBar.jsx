import { ArrowDown } from 'lucide-react';
import { formatRM } from '../lib/money';

export function MobileBar({ bill }) {
  return (
    <div className="mobilebar">
      <div>
        <span className="muted">Jumlah besar</span>
        <strong className="num">{formatRM(bill.total)}</strong>
      </div>
      <button className="btn btn-primary btn-md" onClick={() => document.getElementById('bayar')?.scrollIntoView({ behavior: 'smooth' })}>
        <span>Lihat bahagian</span>
        <ArrowDown size={16} aria-hidden />
      </button>
    </div>
  );
}
