import { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import Meter from '../ui/Meter.jsx';
import Icon from '../ui/Icon.jsx';
import { Field } from '../ui/Field.jsx';
import { formatRM, parseRM } from '../../lib/money.js';

export default function ItemRow({ item, people, onToggle, onAll, onClear, editing, onEdit, onSave }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState((item.priceSen / 100).toFixed(2));
  const [err, setErr] = useState('');

  const save = (e) => {
    e.preventDefault();
    const sen = parseRM(price);
    if (!name.trim()) return setErr('Nama item tak boleh kosong.');
    if (Number.isNaN(sen) || sen <= 0) return setErr('Masukkan harga seperti 12.50.');
    setErr('');
    onSave({ name: name.trim(), priceSen: sen });
  };

  const all = item.assignees.length === people.length;
  return (
    <motion.li layout transition={{ duration: 0.2 }} className={`item${item.assignees.length === 0 ? ' is-open' : ''}`}>
      {editing ? (
        <form className="item__edit" onSubmit={save} noValidate>
          <Field label="Nama item" error={err && !name.trim() ? err : ''}>
            {(p) => <input {...p} className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />}
          </Field>
          <Field label="Harga (RM)" error={err && name.trim() ? err : ''}>
            {(p) => <input {...p} className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />}
          </Field>
          <div className="item__edit-actions">
            <Button type="submit" variant="primary" icon="Check">Simpan</Button>
            <Button onClick={() => { setName(item.name); setPrice((item.priceSen / 100).toFixed(2)); setErr(''); onEdit(null); }}>Batal</Button>
          </div>
        </form>
      ) : (
        <>
          <div className="item__top">
            <div className="item__title">
              <span className="item__name">{item.name}</span>
              {item.confidence < 90 && (
                <button type="button" className="item__review" onClick={() => onEdit(item.id)} aria-label={`Semak ${item.name}, keyakinan ${item.confidence} peratus`}>
                  <Icon name="TriangleAlert" size={14} /> Semak
                </button>
              )}
            </div>
            <div className="item__meta">
              {item.confidence < 90 && <Meter value={item.confidence} />}
              <span className="item__price">{formatRM(item.priceSen)}</span>
              <button type="button" className="icon-btn" onClick={() => onEdit(item.id)} aria-label={`Edit ${item.name}`}>
                <Icon name="Pencil" size={16} />
              </button>
            </div>
          </div>
          <div className="item__chips" role="group" aria-label={`Siapa makan ${item.name}`}>
            {people.map((p) => {
              const on = item.assignees.includes(p.id);
              return (
                <button key={p.id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => onToggle(p.id)}>
                  <Avatar person={p} size={22} />
                  <span>{p.name}</span>
                  {on && <Icon name="Check" size={14} />}
                </button>
              );
            })}
            <button type="button" className="chip chip--ghost" onClick={all ? onClear : onAll}>
              {all ? 'Kosongkan' : 'Semua'}
            </button>
          </div>
        </>
      )}
    </motion.li>
  );
}
