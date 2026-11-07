import { useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Aurora from './Aurora.jsx';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import Brand from './Brand.jsx';
import Badge from '../ui/Badge.jsx';
import Toasts from '../ui/Toasts.jsx';
import { useStore } from '../../hooks/useStore.jsx';
import { NAV } from '../../data/nav.js';

export default function AppShell({ route, children }) {
  const { state } = useStore();
  const title = NAV.find((n) => n.id === route)?.label ?? '';

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = `${title} · Jom Split`;
  }, [route, title]);

  return (
    <MotionConfig reducedMotion={state.prefs.reduceMotion ? 'always' : 'user'}>
      <div className="shell" data-motion={state.prefs.reduceMotion ? 'reduced' : undefined}>
        <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
          Langkau ke kandungan
        </a>
        <Aurora />
        <Sidebar route={route} />
        <header className="topbar">
          <Brand />
          <Badge tone="info" icon="Sparkles">Mod demo</Badge>
        </header>
        <main id="main" tabIndex={-1} className="main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={route}
              className="page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileNav route={route} />
        <Toasts />
      </div>
    </MotionConfig>
  );
}
