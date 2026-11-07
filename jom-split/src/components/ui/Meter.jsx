/** Skor keyakinan: bar nipis + angka. Nilai demo, bukan kebarangkalian model. */
export default function Meter({ value, label = 'Keyakinan', showLabel = false }) {
  const tone = value >= 90 ? 'good' : value >= 80 ? 'ok' : 'warn';
  return (
    <span className={`meter meter--${tone}`} role="img" aria-label={`${label} ${value} peratus`}>
      {showLabel && <span className="meter__lbl">Yakin</span>}
      <span className="meter__track"><span className="meter__fill" style={{ width: `${value}%` }} /></span>
      <span className="meter__num">{value}%</span>
    </span>
  );
}
