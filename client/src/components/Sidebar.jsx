import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = ({ role = 'ADMIN' }) => {
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Manage Users' },
    { to: '/admin/stores', label: 'Manage Stores' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Owner Dashboard' },
  ];

  const userLinks = [
    { to: '/stores', label: 'Stores List' },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'STORE_OWNER' ? ownerLinks : userLinks;

  return (
    <aside
      style={{
        width: '200px',
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        padding: '1.25rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
        Navigation
      </div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: 'block',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            color: isActive ? '#2563eb' : '#475569',
            background: isActive ? '#eff6ff' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.875rem',
            textDecoration: 'none',
            borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
            transition: 'all 0.15s ease',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
