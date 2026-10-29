export function EmptyState({ icon: Icon, title, children, actions }) {
  return (
    <div className="empty">
      {Icon && (
        <span className="empty-icon" aria-hidden>
          <Icon size={20} />
        </span>
      )}
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  );
}
