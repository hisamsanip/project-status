import { StoreProvider } from './hooks/useStore.jsx';
import { useHashRoute } from './hooks/useHashRoute.js';
import AppShell from './components/layout/AppShell.jsx';
import Home from './pages/Home.jsx';
import Scan from './pages/Scan.jsx';
import Split from './pages/Split.jsx';
import Summary from './pages/Summary.jsx';
import History from './pages/History.jsx';
import Friends from './pages/Friends.jsx';
import Settings from './pages/Settings.jsx';

const PAGES = { beranda: Home, imbas: Scan, agih: Split, ringkasan: Summary, sejarah: History, kumpulan: Friends, tetapan: Settings };

function Routes() {
  const [route, go] = useHashRoute();
  const Page = PAGES[route] ?? Home;
  return (
    <AppShell route={route}>
      <Page go={go} />
    </AppShell>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Routes />
    </StoreProvider>
  );
}
