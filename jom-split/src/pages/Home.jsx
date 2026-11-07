import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Icon from '../components/ui/Icon.jsx';
import Money from '../components/ui/Money.jsx';
import ReceiptPanel from '../components/features/ReceiptPanel.jsx';
import Sparkline from '../components/charts/Sparkline.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { formatRM } from '../lib/money.js';
import { minimizeTransfers, rawPairCount, grossFor } from '../lib/settle.js';

const STEPS = [
  { id: 'imbas', icon: 'ScanLine', title: 'Imbas resit', body: 'Gambar resit dibaca jadi senarai item dan harga.' },
  { id: 'agih', icon: 'Split', title: 'Agih item', body: 'Ketik siapa makan apa. Cukai dan servis diagih adil.' },
  { id: 'ringkasan', icon: 'WalletCards', title: 'Hantar tuntutan', body: 'Salin mesej siap pakai untuk kumpulan WhatsApp.' },
];

export default function Home() {
  const { state, net } = useStore();
  const { people, history } = state;
  const me = people.find((p) => p.me) ?? people[0];
  const { receive: owedToMe, pay: iOwe } = grossFor(history, me.id);
  const owers = new Set(history.flatMap((h) => (h.payerId === me.id ? Object.keys(h.shares).filter((k) => k !== me.id && !h.paid[k]) : []))).size;
  const days = history.slice(0, 8).map((h) => h.settleDays).reverse();
  const avgDays = days.reduce((a, b) => a + b, 0) / Math.max(days.length, 1);
  const transfers = minimizeTransfers(net);
  const raw = rawPairCount(history);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <Badge tone="info" icon="Sparkles">Demo · semua data ialah contoh</Badge>
          <h1 id="hero-title" className="display">
            Kenyang makan, <em>senang kira.</em>
          </h1>
          <p className="lead">
            Imbas resit, agih siapa makan apa, dan hantar jumlah setiap orang. Siap sebelum kopi sejuk.
          </p>
          <div className="hero__cta">
            <Button as="a" href="#agih" variant="primary" size="lg" iconRight="ArrowRight">Lihat contoh pembahagian</Button>
            <Button as="a" href="#imbas" size="lg" icon="ScanLine">Imbas resit saya</Button>
          </div>
        </div>
        <div className="hero__panel">
          <ReceiptPanel />
        </div>
      </section>

      <section className="block" aria-labelledby="live-title">
        <div className="block__head">
          <h2 id="live-title" className="h2">Gambaran langsung</h2>
          <Badge tone="neutral">Data contoh</Badge>
        </div>
        <div className="grid grid--3">
          <article className="card stat">
            <p className="caption">Belum dibayar kepada anda</p>
            <Money sen={owedToMe} big fromZero />
            <p className="muted">Daripada {owers} rakan. Anda pula patut bayar {formatRM(iOwe)} kepada rakan lain.</p>
            <Button as="a" href="#kumpulan" variant="ghost" iconRight="ArrowRight" size="sm">Lihat baki</Button>
          </article>
          <article className="card stat">
            <p className="caption">Purata masa bayar balik</p>
            <p className="stat__num"><span className="money__num">{avgDays.toFixed(1)}</span> <span className="stat__unit">hari</span></p>
            <Sparkline values={days} label={`Hari untuk bayar balik, 8 bil terkini: ${days.join(', ')}`} />
            <p className="muted">8 bil terkini, dari {Math.min(...days)} hingga {Math.max(...days)} hari.</p>
          </article>
          <article className="card stat stat--ai">
            <p className="caption"><Icon name="Sparkles" size={14} /> Cadangan AI</p>
            <p className="stat__lead">
              Lunaskan semua baki dengan <strong>{transfers.length} pindahan</strong>
              {raw > transfers.length ? <> berbanding {raw} hutang asal.</> : '.'}
            </p>
            <p className="muted">Dikira daripada baki bersih. Peraturan ringkas, bukan model sebenar.</p>
            <Button as="a" href="#kumpulan" variant="secondary" size="sm" iconRight="ArrowRight">Lihat pelan</Button>
          </article>
        </div>
      </section>

      <section className="block" aria-labelledby="steps-title">
        <h2 id="steps-title" className="h2">Tiga langkah, tiada kalkulator</h2>
        <ol className="grid grid--3 steps">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <a className="card step" href={`#${s.id}`}>
                <span className="step__n">{i + 1}</span>
                <Icon name={s.icon} size={24} />
                <h3 className="h3">{s.title}</h3>
                <p className="muted">{s.body}</p>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
