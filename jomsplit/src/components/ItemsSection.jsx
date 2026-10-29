import { AnimatePresence } from 'framer-motion';
import { Plus, ReceiptText, ScanLine, UtensilsCrossed } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatRM, parseMoney } from '../lib/money';
import { useBill } from '../lib/store';
import { ItemCard } from './ItemCard';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Field } from './ui/Field';
import { QtyStepper } from './ui/QtyStepper';
import { Section } from './ui/Section';

export function ItemsSection({ onScan }) {
  const { state, dispatch } = useBill();
  const [form, setForm] = useState({ name: '', qty: 1, amount: '' });
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);
  const subtotal = state.items.reduce((s, it) => s + it.amount, 0);

  const submit = (e) => {
    e.preventDefault();
    const amount = parseMoney(form.amount);
    const next = {};
    if (!form.name.trim()) next.name = 'Nama item diperlukan.';
    if (!Number.isFinite(amount) || amount <= 0) next.amount = 'Masukkan harga, cth 12.50';
    setErrors(next);
    if (Object.keys(next).length) return;
    // A lone diner obviously ate it; otherwise leave it for the user to assign.
    const solo = state.people.length === 1 ? [state.people[0].id] : [];
    dispatch({ type: 'addItems', items: [{ name: form.name.trim().slice(0, 48), qty: form.qty, amount, ids: solo }] });
    setForm({ name: '', qty: 1, amount: '' });
    nameRef.current?.focus();
  };

  return (
    <Section
      id="item"
      step={2}
      title="Makanan & harga"
      description="Tetapkan siapa makan apa. Item kongsi dibahagi sama rata."
      action={
        <Button variant="accent" size="sm" icon={ScanLine} onClick={onScan}>
          Imbas resit
        </Button>
      }
    >
      <form className="item-form" onSubmit={submit} noValidate>
        <Field ref={nameRef} className="grow" aria-label="Nama makanan atau minuman" placeholder="Nama makanan / minuman" value={form.name} maxLength={48} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <QtyStepper value={form.qty} onChange={(qty) => setForm({ ...form, qty })} />
        <Field className="amount" aria-label="Jumlah harga dalam RM" prefix="RM" inputMode="decimal" placeholder="0.00" value={form.amount} error={errors.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Button variant="primary" type="submit" icon={Plus}>
          Masukkan
        </Button>
      </form>

      {state.items.length ? (
        <>
          <div className="list-head">
            <span>
              <ReceiptText size={14} aria-hidden /> {state.items.length} item
            </span>
            <span className="num">{formatRM(subtotal)}</span>
          </div>
          <ul className="items">
            <AnimatePresence initial={false}>
              {state.items.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </AnimatePresence>
          </ul>
        </>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title="Senarai pesanan masih kosong"
          actions={
            <>
              <Button size="sm" icon={ScanLine} onClick={onScan}>
                Imbas resit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => nameRef.current?.focus()}>
                Taip manual
              </Button>
            </>
          }
        >
          Taip setiap item, atau imbas gambar resit untuk mengisinya secara automatik.
        </EmptyState>
      )}
    </Section>
  );
}
