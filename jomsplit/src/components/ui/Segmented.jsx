// The sliding pill is plain CSS: a framer layoutId here stalls exit
// animations when the control sits inside a closing modal.
export function Segmented({ value, onChange, options, label }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="segmented" role="radiogroup" aria-label={label} style={{ '--count': options.length, '--index': index }}>
      <span className="segmented-pill" aria-hidden />
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {o.icon && <o.icon size={15} aria-hidden />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
