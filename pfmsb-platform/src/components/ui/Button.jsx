export default function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, children, className = '', as = 'button', ...rest }) {
  const Tag = as;
  return (
    <Tag className={`btn btn-${variant} btn-${size} ${className}`} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
    </Tag>
  );
}
