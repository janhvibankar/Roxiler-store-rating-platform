import React, { useState } from 'react';

export const RatingInput = ({ value = 0, onChange, disabled = false }) => {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 1px',
              cursor: disabled ? 'default' : 'pointer',
              color: isFilled ? '#d97706' : '#cbd5e1',
              fontSize: '1.15rem',
              lineHeight: 1,
            }}
            title={`${star} Star${star > 1 ? 's' : ''}`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
};

export default RatingInput;
