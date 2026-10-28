import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider } from './lib/store';
import { useRoute } from './lib/router';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Roadmap from './pages/Roadmap';
import Functions from './pages/Functions';
import Gates from './pages/Gates';
import Evidence from './pages/Evidence';
import Assistant from './pages/Assistant';
import Outcomes from './pages/Outcomes';
import Risks from './pages/Risks';
import NotFound from './pages/NotFound';

const PAGES = {
  '/app': Overview,
  '/app/roadmap': Roadmap,
  '/app/functions': Functions,
  '/app/gates': Gates,
  '/app/evidence': Evidence,
  '/app/assistant': Assistant,
  '/app/outcomes': Outcomes,
  '/app/risks': Risks,
};

export default function App() {
  const { path, params } = useRoute();
  const Page = PAGES[path] || NotFound;

  return (
    <StoreProvider>
      <div className="grain">
        {path === '/' ? (
          <Landing />
        ) : (
          <AppShell path={path}>
            <AnimatePresence mode="wait">
              <motion.div key={path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Page params={params} />
              </motion.div>
            </AnimatePresence>
          </AppShell>
        )}
      </div>
    </StoreProvider>
  );
}
