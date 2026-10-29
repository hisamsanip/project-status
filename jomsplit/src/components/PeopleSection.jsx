import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { MAX_PEOPLE } from '../lib/split';
import { useBill } from '../lib/store';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Field } from './ui/Field';
import { Section } from './ui/Section';
import { useToast } from './ui/Toast';

export function PeopleSection() {
  const { state, dispatch } = useBill();
  const toast = useToast();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const full = state.people.length >= MAX_PEOPLE;

  const add = (e) => {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return setError('Tulis nama kawan dulu.');
    if (state.people.some((p) => p.name.toLowerCase() === clean.toLowerCase())) return setError(`${clean} sudah ada dalam geng.`);
    if (full) return setError(`Maksimum ${MAX_PEOPLE} orang.`);
    dispatch({ type: 'addPerson', name: clean.slice(0, 24) });
    setName('');
    setError('');
  };

  const remove = (person) => {
    const snapshot = state;
    dispatch({ type: 'removePerson', id: person.id });
    toast({ type: 'info', title: `${person.name} dikeluarkan`, message: 'Item mereka kini perlu ditetapkan semula.', action: { label: 'Batal', onClick: () => dispatch({ type: 'replace', state: snapshot }) } });
  };

  return (
    <Section
      id="geng"
      step={1}
      title="Geng makan"
      description="Siapa yang ada di meja?"
      action={
        <span className="meter" aria-label={`${state.people.length} daripada ${MAX_PEOPLE} orang`}>
          <span className="meter-track">
            <span className="meter-fill" style={{ width: `${(state.people.length / MAX_PEOPLE) * 100}%` }} />
          </span>
          <span className="num">
            {state.people.length}/{MAX_PEOPLE}
          </span>
        </span>
      }
    >
      <form className="row-form" onSubmit={add} noValidate>
        <Field
          className="grow"
          placeholder={full ? 'Geng sudah penuh' : 'Nama kawan (cth: Sara, Afiq)'}
          value={name}
          maxLength={24}
          disabled={full}
          error={error}
          onChange={(e) => (setName(e.target.value), error && setError(''))}
          aria-label="Nama kawan"
        />
        <Button variant="primary" icon={Plus} type="submit" disabled={full}>
          Tambah
        </Button>
      </form>

      {state.people.length ? (
        <ul className="chips" aria-label="Ahli geng">
          <AnimatePresence initial={false}>
            {state.people.map((p) => (
              <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }} className="person-chip" style={{ '--hue': p.hue }}>
                <Avatar person={p} size={24} />
                <span>{p.name}</span>
                <button onClick={() => remove(p)} aria-label={`Keluarkan ${p.name}`}>
                  <X size={13} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyState icon={Users} title="Belum ada sesiapa">
          Tambah sekurang-kurangnya seorang untuk mula membahagi bil.
        </EmptyState>
      )}
    </Section>
  );
}
