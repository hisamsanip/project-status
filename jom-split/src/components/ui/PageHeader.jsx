export default function PageHeader({ eyebrow, title, accent, lead, actions }) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h1">
          {title} {accent && <em>{accent}</em>}
        </h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  );
}
