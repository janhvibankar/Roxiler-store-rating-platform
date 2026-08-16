import React from 'react';

export const Table = ({ columns = [], data = [], onSort, emptyMessage = 'No records found' }) => {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((col) => (
              <th
                key={col.key || col.header}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#475569',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {col.header}
                  {col.sortable && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⇅</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: 'transparent',
                }}
              >
                {columns.map((col) => (
                  <td key={col.key || col.header} style={{ padding: '0.75rem 1rem', color: '#0f172a' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
