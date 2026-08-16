import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ value = '', onChange, onClear, placeholder = 'Search...' }) => {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
      <Search size={18} style={{ position: 'absolute', left: '0.8rem', color: '#64748b', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.6rem 2.2rem 0.6rem 2.4rem',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#f8fafc',
          fontSize: '0.875rem',
          outline: 'none',
        }}
      />
      {value && (
        <X
          size={16}
          onClick={onClear}
          style={{ position: 'absolute', right: '0.8rem', color: '#94a3b8', cursor: 'pointer' }}
        />
      )}
    </div>
  );
};

export default SearchBar;
