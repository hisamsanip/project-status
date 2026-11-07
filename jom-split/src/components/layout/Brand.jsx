export function BrandMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Logo Jom Split">
      <defs>
        <linearGradient id="bm-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id="bm-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fa6ff" />
          <stop offset="1" stopColor="#8b7cf6" />
        </linearGradient>
      </defs>
      <path d="M16 3a13 13 0 0 0-9.2 22.2L16 16z" fill="url(#bm-a)" />
      <path d="M18.4 6.1A13 13 0 0 1 25.2 25.2 13 13 0 0 1 16 29l-.1-.1L18.4 6.1z" fill="url(#bm-b)" opacity="0.95" />
    </svg>
  );
}

export default function Brand() {
  return (
    <a className="brand" href="#beranda" aria-label="Jom Split, ke Beranda">
      <BrandMark />
      <span className="brand__name">Jom Split</span>
    </a>
  );
}
