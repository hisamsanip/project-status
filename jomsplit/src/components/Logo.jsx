export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="logo">
      <rect width="32" height="32" rx="9" fill="var(--ink)" />
      <path d="M9 7h14v17l-2.3-1.6L18.3 24 16 22.4 13.7 24l-2.4-1.6L9 24z" fill="none" stroke="var(--accent-on-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12.5 12h7M12.5 15.5h4.5" stroke="var(--accent-on-ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 5l-9 22" stroke="var(--ink)" strokeWidth="3" />
      <path d="M21 5l-9 22" stroke="var(--accent-on-ink)" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}
