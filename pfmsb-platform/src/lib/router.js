import { useEffect, useState, useCallback } from 'react';

// Minimal hash router so the build works on static hosting (GitHub Pages).
// Routes look like "#/app/roadmap?phase=2".
const read = () => window.location.hash.replace(/^#/, '') || '/';

export function parseRoute(raw) {
  const [path, search = ''] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/', params: new URLSearchParams(search) };
}

export function useRoute() {
  const [raw, setRaw] = useState(read);
  useEffect(() => {
    const onChange = () => {
      const next = read();
      setRaw((prev) => {
        if (parseRoute(prev).path !== parseRoute(next).path) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parseRoute(raw);
}

export function useNavigate() {
  return useCallback((to) => {
    window.location.hash = to;
  }, []);
}
