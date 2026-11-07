import { useCallback, useEffect, useState } from 'react';
import { NAV } from '../data/nav.js';

const IDS = NAV.map((n) => n.id);
const read = () => {
  const id = (typeof location !== 'undefined' ? location.hash : '').replace('#', '');
  return IDS.includes(id) ? id : 'beranda';
};

export function useHashRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((id) => {
    if (location.hash === `#${id}`) return;
    location.hash = id;
  }, []);
  return [route, go];
}
