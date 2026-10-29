export function Avatar({ person, size = 28 }) {
  const initials = person.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className="avatar" style={{ '--hue': person.hue, width: size, height: size, fontSize: size * 0.38 }} aria-hidden>
      {initials || '?'}
    </span>
  );
}
