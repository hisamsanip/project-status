import { MotionConfig } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BillHero } from './components/BillHero';
import { ChargesSection } from './components/ChargesSection';
import { ItemsSection } from './components/ItemsSection';
import { MobileBar } from './components/MobileBar';
import { PeopleSection } from './components/PeopleSection';
import { ScanModal } from './components/ScanModal';
import { SummaryPanel } from './components/SummaryPanel';
import { TopBar } from './components/TopBar';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { computeBill } from './lib/split';
import { BillProvider, demoBill, emptyBill, useBill } from './lib/store';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jomsplit:theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('jomsplit:theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

function Workspace() {
  const { state, dispatch } = useBill();
  const toast = useToast();
  const [theme, toggleTheme] = useTheme();
  const [scanOpen, setScanOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'reset' | 'demo'
  const bill = useMemo(() => computeBill(state), [state]);

  const steps = [
    { id: 'geng', label: 'Geng', done: state.people.length > 0 },
    { id: 'item', label: 'Pesanan', done: state.items.length > 0 && !bill.unassigned },
    { id: 'caj', label: 'Caj', done: state.items.length > 0 },
    { id: 'bayar', label: 'Bayar', done: state.items.length > 0 && bill.balanced },
  ];

  const hasData = state.people.length || state.items.length;
  const replace = (kind) => {
    const snapshot = state;
    dispatch({ type: 'replace', state: kind === 'demo' ? demoBill() : emptyBill() });
    setConfirm(null);
    toast({ type: 'success', title: kind === 'demo' ? 'Bil contoh dimuatkan' : 'Bil baharu sedia', action: hasData ? { label: 'Batal', onClick: () => dispatch({ type: 'replace', state: snapshot }) } : undefined });
  };
  const ask = (kind) => (hasData ? setConfirm(kind) : replace(kind));

  return (
    <>
      <TopBar steps={steps} theme={theme} onTheme={toggleTheme} onDemo={() => ask('demo')} onReset={() => ask('reset')} />
      <main className="shell">
        <BillHero bill={bill} />
        <div className="workspace">
          <div className="flow">
            <PeopleSection />
            <ItemsSection onScan={() => setScanOpen(true)} />
            <ChargesSection bill={bill} />
          </div>
          <SummaryPanel bill={bill} />
        </div>
        <footer className="foot">
          <span>JomSplit · Semua pengiraan berlaku dalam pelayar anda dan disimpan pada peranti ini sahaja.</span>
        </footer>
      </main>
      <MobileBar bill={bill} />

      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        icon={RotateCcw}
        title={confirm === 'demo' ? 'Ganti dengan bil contoh?' : 'Mula bil baharu?'}
        description={`Bil semasa (${state.people.length} orang, ${state.items.length} item) akan dikosongkan. Anda boleh batalkan sejurus selepas itu.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Kekalkan
            </Button>
            <Button variant="danger" data-autofocus onClick={() => replace(confirm)}>
              {confirm === 'demo' ? 'Guna contoh' : 'Kosongkan'}
            </Button>
          </>
        }
      />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BillProvider>
        <ToastProvider>
          <Workspace />
        </ToastProvider>
      </BillProvider>
    </MotionConfig>
  );
}
