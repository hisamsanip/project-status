import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, ChevronDown, Copy, MessageCircle, Wallet } from 'lucide-react';
import { useState } from 'react';
import { formatRM } from '../lib/money';
import { useBill } from '../lib/store';
import { buildMessage, copyText, personBlock } from '../lib/whatsapp';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { useToast } from './ui/Toast';

function ShareBar({ rows, total }) {
  const paying = rows.filter((r) => r.total > 0);
  if (!paying.length || total <= 0) return null;
  return (
    <div className="sharebar" role="img" aria-label={paying.map((r) => `${r.person.name} ${Math.round((r.total / total) * 100)}%`).join(', ')}>
      {paying.map((r) => (
        <motion.span key={r.person.id} layout style={{ '--hue': r.person.hue, flexGrow: r.total }} data-tip={`${r.person.name} · ${Math.round((r.total / total) * 100)}%`} transition={{ type: 'spring', stiffness: 300, damping: 34 }} />
      ))}
    </div>
  );
}

function PersonCard({ row, total, open, onToggle, onCopy }) {
  const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
  return (
    <motion.li layout className={`person ${open ? 'is-open' : ''}`} style={{ '--hue': row.person.hue }}>
      <button className="person-head" onClick={onToggle} aria-expanded={open}>
        <Avatar person={row.person} size={30} />
        <span className="person-name">
          <strong>{row.person.name}</strong>
          <span className="muted">{row.lines.length ? `${row.lines.length} item · ${pct}% bil` : 'Tiada item'}</span>
        </span>
        <span className="person-total num">{formatRM(row.total)}</span>
        <ChevronDown size={16} className="chev" aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="person-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <ul>
              {row.lines.map((l) => (
                <li key={l.itemId}>
                  <span>
                    {l.name}
                    {l.sharedWith > 1 && <em> · kongsi {l.sharedWith}</em>}
                  </span>
                  <span className="num">{formatRM(l.amount)}</span>
                </li>
              ))}
              {row.extras !== 0 && (
                <li className="muted">
                  <span>Cukai, servis & diskaun</span>
                  <span className="num">{formatRM(row.extras, { sign: true })}</span>
                </li>
              )}
            </ul>
            {row.total > 0 && (
              <Button size="sm" variant="ghost" icon={Copy} onClick={onCopy}>
                Salin bahagian {row.person.name}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function SummaryPanel({ bill }) {
  const { state } = useBill();
  const toast = useToast();
  const [open, setOpen] = useState(() => new Set());
  const message = buildMessage(bill, state);
  const ready = bill.total > 0 && state.people.length > 0;

  const copy = async (text, what) => {
    const ok = await copyText(text);
    toast(ok ? { type: 'success', title: 'Disalin', message: `${what} sedia untuk ditampal ke WhatsApp.` } : { type: 'error', title: 'Tidak dapat menyalin', message: 'Pelayar menyekat papan keratan.' });
  };
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <aside id="bayar" className="summary" aria-labelledby="bayar-title">
      <div className="receipt">
        <header className="receipt-head">
          <span className="section-num">04</span>
          <h2 id="bayar-title">Siapa bayar berapa</h2>
        </header>

        <dl className="totals">
          <div>
            <dt>Makanan</dt>
            <dd className="num">{formatRM(bill.subtotal)}</dd>
          </div>
          <div>
            <dt>SST {state.charges.sst}%</dt>
            <dd className="num">{formatRM(bill.sst)}</dd>
          </div>
          <div>
            <dt>Servis {state.charges.service}%</dt>
            <dd className="num">{formatRM(bill.service)}</dd>
          </div>
          {bill.discount > 0 && (
            <div className="is-discount">
              <dt>Diskaun</dt>
              <dd className="num">{formatRM(-bill.discount)}</dd>
            </div>
          )}
          <div className="grand">
            <dt>Jumlah besar</dt>
            <dd className="num">
              <motion.span key={bill.total} initial={{ opacity: 0.3, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {formatRM(bill.total)}
              </motion.span>
            </dd>
          </div>
        </dl>

        {ready && (
          <div className={`check ${bill.balanced ? 'is-ok' : 'is-warn'}`} role="status">
            {bill.balanced ? <BadgeCheck size={16} aria-hidden /> : <AlertTriangle size={16} aria-hidden />}
            <span>
              {bill.balanced ? (
                <>Semua bahagian dijumlahkan tepat kepada <b className="num">{formatRM(bill.total)}</b>.</>
              ) : (
                <>
                  <b className="num">{formatRM(bill.unallocated)}</b> belum diagihkan.{' '}
                  {bill.unassignedItems.length} item belum ditetapkan:{' '}
                  {bill.unassignedItems
                    .slice(0, 2)
                    .map((i) => i.name)
                    .join(', ')}
                  {bill.unassignedItems.length > 2 && '…'}
                </>
              )}
            </span>
          </div>
        )}

        {ready ? (
          <>
            <ShareBar rows={bill.rows} total={bill.total} />
            <ul className="people">
              {bill.rows.map((r) => (
                <PersonCard key={r.person.id} row={r} total={bill.total} open={open.has(r.person.id)} onToggle={() => toggle(r.person.id)} onCopy={() => copy(personBlock(r), `Bahagian ${r.person.name}`)} />
              ))}
            </ul>
            <div className="share-actions">
              <Button variant="primary" block icon={Copy} onClick={() => copy(message, 'Ringkasan bil')}>
                Salin untuk WhatsApp
              </Button>
              <Button block icon={MessageCircle} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener')}>
                Hantar terus
              </Button>
            </div>
          </>
        ) : (
          <EmptyState icon={Wallet} title="Ringkasan akan muncul di sini">
            {state.people.length ? 'Masukkan item pertama untuk melihat bahagian setiap orang.' : 'Mula dengan menambah geng dan pesanan.'}
          </EmptyState>
        )}
      </div>
    </aside>
  );
}
