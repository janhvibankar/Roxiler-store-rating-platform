import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message = 'Something went wrong.' }) => {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      borderRadius: '8px',
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#f87171',
      fontSize: '0.875rem',
      margin: '1rem 0'
    }}>
      <AlertCircle size={20} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
