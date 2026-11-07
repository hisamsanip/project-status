import { useId } from 'react';

export function Field({ label, hint, error, children, className = '' }) {
  const id = useId();
  const child = children({ id, 'aria-invalid': !!error || undefined, 'aria-describedby': error ? `${id}-e` : hint ? `${id}-h` : undefined });
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      {child}
      {error ? <p id={`${id}-e`} className="field__error" role="alert">{error}</p> : hint ? <p id={`${id}-h`} className="field__hint">{hint}</p> : null}
    </div>
  );
}

export function Switch({ checked, onChange, label, hint, id }) {
  return (
    <div className="switch-row">
      <div className="switch-row__text">
        <span id={`${id}-l`} className="switch-row__label">{label}</span>
        {hint && <span className="switch-row__hint">{hint}</span>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        className={`switch${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  );
}
