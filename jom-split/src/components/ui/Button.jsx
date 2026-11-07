import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

/** Butang standard. `as="a"` untuk pautan. Tinggi minimum 44 px. */
const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', icon, iconRight, loading = false, as = 'button', children, className = '', ...rest },
  ref,
) {
  const Comp = as === 'a' ? motion.a : motion.button;
  const props = as === 'a' ? rest : { type: 'button', ...rest };
  return (
    <Comp
      ref={ref}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`btn btn--${variant} btn--${size} ${className}`}
      aria-busy={loading || undefined}
      {...props}
      disabled={rest.disabled || loading}
    >
      {loading ? <Icon name="LoaderCircle" className="spin" /> : icon ? <Icon name={icon} /> : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} />}
    </Comp>
  );
});
export default Button;
