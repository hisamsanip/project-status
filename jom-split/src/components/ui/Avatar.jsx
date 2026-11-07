export default function Avatar({ person, size = 32, ring = false }) {
  const initials = person.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span
      className={`avatar${ring ? ' avatar--ring' : ''}`}
      style={{ '--h': person.hue, width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
