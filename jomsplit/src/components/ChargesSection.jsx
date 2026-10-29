import { Percent, Scale, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatRM, parseMoney, toInputValue } from '../lib/money';
import { SPLIT_MODES } from '../lib/split';
import { useBill } from '../lib/store';
import { Field } from './ui/Field';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';

function PercentField({ label, value, presets, onChange, amount }) {
  const [text, setText] = useState(String(value));
  // Only resync from outside changes (presets, reset) so typing "6." isn't clobbered.
  useEffect(() => setText((t) => (Number(t) === value ? t : String(value))), [value]);
  const n = Number(text);
  const error = text !== '' && (!Number.isFinite(n) || n < 0 || n > 100) ? '0 hingga 100' : '';
  return (
    <div className="charge">
      <Field
        label={label}
        suffix="%"
        inputMode="decimal"
        value={text}
        error={error}
        hint={!error ? `= ${formatRM(amount)}` : ''}
        onChange={(e) => {
          setText(e.target.value);
          const v = Number(e.target.value);
          if (e.target.value === '' || (Number.isFinite(v) && v >= 0 && v <= 100)) onChange(e.target.value === '' ? 0 : v);
        }}
      />
      <div className="presets" role="group" aria-label={`Pratetap ${label}`}>
        {presets.map((p) => (
          <button key={p} type="button" className={value === p ? 'is-on' : ''} onClick={() => onChange(p)}>
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChargesSection({ bill }) {
  const { state, dispatch } = useBill();
  const [discount, setDiscount] = useState(toInputValue(state.charges.discount));
  useEffect(() => setDiscount((t) => ((parseMoney(t) || 0) === state.charges.discount ? t : toInputValue(state.charges.discount))), [state.charges.discount]);
  const discountSen = parseMoney(discount);
  const discountError = discount !== '' && !(discountSen >= 0) ? 'Jumlah tidak sah' : '';
  const set = (patch) => dispatch({ type: 'charges', patch });

  return (
    <Section id="caj" step={3} title="Cukai, servis & diskaun" description="Ikut apa yang tertera pada resit.">
      <div className="charges">
        <PercentField label="SST" value={state.charges.sst} presets={[0, 6, 8]} amount={bill.sst} onChange={(sst) => set({ sst })} />
        <PercentField label="Caj servis" value={state.charges.service} presets={[0, 5, 10]} amount={bill.service} onChange={(service) => set({ service })} />
        <div className="charge">
          <Field
            label="Diskaun"
            prefix="−RM"
            inputMode="decimal"
            placeholder="0.00"
            value={discount}
            error={discountError}
            hint={!discountError && bill.discount < discountSen ? 'Dihadkan kepada jumlah bil' : 'Baucar, promo atau kad ahli'}
            onChange={(e) => {
              setDiscount(e.target.value);
              const v = e.target.value === '' ? 0 : parseMoney(e.target.value);
              if (v >= 0) set({ discount: v });
            }}
          />
        </div>
      </div>

      <div className="mode">
        <span className="field-label">
          <Percent size={13} aria-hidden /> Cara bahagi SST, servis & diskaun
        </span>
        <Segmented
          label="Cara bahagi"
          value={state.mode}
          onChange={(mode) => dispatch({ type: 'mode', mode })}
          options={[
            { value: 'prorata', label: SPLIT_MODES.prorata.short, icon: Scale },
            { value: 'equal', label: SPLIT_MODES.equal.short, icon: Users },
          ]}
        />
        <p className="field-hint">{SPLIT_MODES[state.mode].hint}</p>
      </div>
    </Section>
  );
}
