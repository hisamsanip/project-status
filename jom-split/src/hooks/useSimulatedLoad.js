import { useCallback, useEffect, useState } from 'react';

/**
 * Simulasi muat data: 'loading' -> 'ready' atau 'error'.
 * Keadaan dikira serentak daripada `deps` supaya tiada satu bingkai pun data lama/baharu terpapar sebelum rangka muat.
 */
export function useSimulatedLoad(deps, { ms = 450 } = {}) {
  const [doneKey, setDoneKey] = useState(null);
  const [forceError, setForceError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const key = `${deps.join('|')}#${nonce}#${forceError}`;

  useEffect(() => {
    const t = setTimeout(() => setDoneKey(key), ms);
    return () => clearTimeout(t);
  }, [key, ms]);

  const phase = doneKey !== key ? 'loading' : forceError ? 'error' : 'ready';
  const retry = useCallback(() => { setForceError(false); setNonce((n) => n + 1); }, []);
  return { phase, retry, simulateError: () => setForceError(true) };
}
