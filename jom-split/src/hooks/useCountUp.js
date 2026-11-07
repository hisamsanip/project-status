import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Kiraan naik 300 ms (easeOutCubic). Diabaikan jika pengguna minta gerakan dikurangkan. */
export function useCountUp(target, { duration = 300, fromZero = false } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(fromZero && !reduce ? 0 : target);
  const latest = useRef(value);

  useEffect(() => {
    if (reduce || latest.current === target) {
      latest.current = target;
      setValue(target);
      return undefined;
    }
    const from = latest.current;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      latest.current = Math.round(from + (target - from) * eased);
      setValue(latest.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return value;
}
