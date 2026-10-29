import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/** variant: primary | secondary | ghost | danger · size: sm | md | lg */
export const Button = forwardRef(function Button({ variant = 'secondary', size = 'md', icon: Icon, iconRight: IconRight, loading, block, className = '', children, ...rest }, ref) {
  return (
    <button ref={ref} className={`btn btn-${variant} btn-${size}${block ? ' btn-block' : ''}${!children ? ' btn-icon' : ''} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="spin" size={16} aria-hidden /> : Icon && <Icon size={16} aria-hidden />}
      {children && <span>{children}</span>}
      {IconRight && <IconRight size={16} aria-hidden />}
    </button>
  );
});
