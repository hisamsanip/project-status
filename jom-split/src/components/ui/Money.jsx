import { useCountUp } from '../../hooks/useCountUp.js';
import { formatNumber } from '../../lib/money.js';

/** Jumlah RM dengan kiraan naik. `big` mengasingkan awalan "RM" supaya angka menjadi tumpuan. */
export default function Money({ sen, big = false, fromZero = false, className = '' }) {
  const v = useCountUp(sen, { fromZero });
  const neg = v < 0;
  return (
    <span className={`money${big ? ' money--big' : ''} ${className}`}>
      <span className="money__cur">{neg ? '-RM' : 'RM'}</span>
      <span className="money__num">{formatNumber(Math.abs(v))}</span>
    </span>
  );
}
