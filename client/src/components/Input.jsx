import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
  style = {},
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem', width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          background: '#ffffff',
          border: error ? '1px solid #dc2626' : '1px solid #cbd5e1',
          color: '#0f172a',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
    </div>
  );
};

export default Input;
