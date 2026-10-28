export default function MaturityDots({ value, target, size = 'md' }) {
  return (
    <span className={`mdots mdots-${size}`} aria-label={`Maturity ${value} of 5${target ? `, target ${target}` : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`mdot ${n <= value ? 'is-on' : ''} ${target && n > value && n <= target ? 'is-target' : ''}`} />
      ))}
    </span>
  );
}
