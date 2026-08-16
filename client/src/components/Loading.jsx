import React from 'react';

export const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem',
      color: '#94a3b8'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
};

export default Loading;
