import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  onSort,
  sortBy,
  sortOrder,
  emptyMessage = 'No records found',
}) => {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((col) => {
              const isSorted = col.sortable && sortBy === col.key;
              const isAsc = isSorted && (sortOrder || 'asc').toLowerCase() === 'asc';
              const isDesc = isSorted && (sortOrder || '').toLowerCase() === 'desc';

              return (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.775rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: isSorted ? '#2563eb' : '#475569',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    borderBottom: '1px solid #cbd5e1',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {col.header}
                    {col.sortable && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSorted ? '#2563eb' : '#cbd5e1' }}>
                        {isAsc ? '▲' : isDesc ? '▼' : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: index % 2 === 0 ? '#ffffff' : '#fcfdfd',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fcfdfd')}
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
