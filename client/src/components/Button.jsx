import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style = {},
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontWeight: 500,
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background 0.15s ease, border-color 0.15s ease',
    border: 'none',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: { background: '#2563eb', color: '#ffffff' },
    secondary: { background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' },
    danger: { background: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5' },
    outline: { background: 'transparent', border: '1px solid #2563eb', color: '#2563eb' },
  };

  const sizes = {
    sm: { padding: '0.35rem 0.7rem', fontSize: '0.8rem' },
    md: { padding: '0.45rem 0.9rem', fontSize: '0.875rem' },
    lg: { padding: '0.6rem 1.1rem', fontSize: '0.95rem' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
