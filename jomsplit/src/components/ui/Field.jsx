import { forwardRef, useId } from 'react';

export const Field = forwardRef(function Field({ label, hint, error, prefix, suffix, className = '', inputClassName = '', ...rest }, ref) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={`field ${error ? 'is-error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <span className="field-control">
        {prefix && <span className="field-affix">{prefix}</span>}
        <input ref={ref} id={id} className={inputClassName} aria-invalid={!!error} aria-describedby={error || hint ? msgId : undefined} {...rest} />
        {suffix && <span className="field-affix">{suffix}</span>}
      </span>
      {(error || hint) && (
        <span id={msgId} className={error ? 'field-error' : 'field-hint'} role={error ? 'alert' : undefined}>
          {error || hint}
        </span>
      )}
    </div>
  );
});
