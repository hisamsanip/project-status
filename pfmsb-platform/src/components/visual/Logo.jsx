export default function Logo({ size = 28, withWord = true }) {
  return (
    <span className="logo">
      <span className="logo-mark" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" width={size * 0.62} height={size * 0.62} aria-hidden="true">
          <path d="M16 3c6 4.8 8.5 9.6 8.5 14.2A8.5 8.5 0 0 1 7.5 17.2C7.5 12.6 10 7.8 16 3z" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M16 11v18M16 18l-4-3M16 22l4-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {withWord && (
        <span className="logo-word">
          Canopy<span className="logo-sub mono">PFMSB</span>
        </span>
      )}
    </span>
  );
}
