import { motion } from 'framer-motion';
import { AlertCircle, Check, Pencil, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import { formatRM, parseMoney, toInputValue } from '../lib/money';
import { participantsOf } from '../lib/split';
import { useBill } from '../lib/store';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Field } from './ui/Field';
import { QtyStepper } from './ui/QtyStepper';
import { useToast } from './ui/Toast';

export function ItemCard({ item }) {
  const { state, dispatch } = useBill();
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const who = participantsOf(item, state.people);
  const each = who.length ? Math.ceil(item.amount / who.length) : 0;

  const remove = () => {
    const snapshot = state;
    dispatch({ type: 'removeItem', id: item.id });
    toast({ type: 'info', title: `${item.name} dibuang`, action: { label: 'Batal', onClick: () => dispatch({ type: 'replace', state: snapshot }) } });
  };

  const save = (e) => {
    e.preventDefault();
    const amount = parseMoney(edit.amount);
    if (!edit.name.trim() || !Number.isFinite(amount) || amount <= 0) return setEdit({ ...edit, error: true });
    dispatch({ type: 'updateItem', id: item.id, patch: { name: edit.name.trim(), qty: edit.qty, amount } });
    setEdit(null);
  };

  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }} className={`item ${who.length ? '' : 'is-unassigned'}`}>
      {edit ? (
        <form className="item-edit" onSubmit={save}>
          <Field className="grow" aria-label="Nama item" value={edit.name} data-autofocus onChange={(e) => setEdit({ ...edit, name: e.target.value })} error={edit.error && !edit.name.trim() ? 'Wajib' : ''} />
          <QtyStepper value={edit.qty} onChange={(qty) => setEdit({ ...edit, qty })} />
          <Field className="amount" aria-label="Harga" prefix="RM" inputMode="decimal" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} error={edit.error && !(parseMoney(edit.amount) > 0) ? 'Tidak sah' : ''} />
          <Button variant="primary" size="sm" icon={Check} type="submit" aria-label="Simpan" />
          <Button variant="ghost" size="sm" icon={X} type="button" onClick={() => setEdit(null)} aria-label="Batal" />
        </form>
      ) : (
        <div className="item-top">
          <div className="item-name">
            <strong>{item.name}</strong>
            <span className="muted num">×{item.qty}</span>
          </div>
          <div className="item-price">
            <span className="num">{formatRM(item.amount)}</span>
            {who.length > 1 && <span className="muted num">≈ {formatRM(each)} seorang</span>}
          </div>
          <div className="item-tools">
            <Button variant="ghost" size="sm" icon={Pencil} aria-label={`Edit ${item.name}`} data-tip="Edit" onClick={() => setEdit({ name: item.name, qty: item.qty, amount: toInputValue(item.amount) })} />
            <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Buang ${item.name}`} data-tip="Buang" onClick={remove} />
          </div>
        </div>
      )}

      <div className="assign" role="group" aria-label={`Siapa makan ${item.name}`}>
        {state.people.length > 1 && (
          <button className={`assign-chip assign-all ${item.shareAll ? 'is-on' : ''}`} aria-pressed={item.shareAll} onClick={() => dispatch({ type: 'toggleShareAll', id: item.id })}>
            <Users size={13} aria-hidden /> Kongsi semua
          </button>
        )}
        {state.people.map((p) => {
          const on = who.includes(p.id);
          return (
            <button key={p.id} className={`assign-chip ${on ? 'is-on' : ''}`} style={{ '--hue': p.hue }} aria-pressed={on} onClick={() => dispatch({ type: 'togglePerson', id: item.id, person: p.id })}>
              <Avatar person={p} size={18} />
              {p.name}
            </button>
          );
        })}
        {!state.people.length && <span className="muted">Tambah geng dulu untuk menetapkan item ini.</span>}
        {!who.length && state.people.length > 0 && (
          <span className="badge badge-warn">
            <AlertCircle size={12} aria-hidden /> Belum ditetapkan
          </span>
        )}
      </div>
    </motion.li>
  );
}
