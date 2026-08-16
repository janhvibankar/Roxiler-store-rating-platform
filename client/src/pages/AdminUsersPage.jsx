import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import adminService from '../services/adminService';

const inputStyle = {
  padding: '0.45rem 0.75rem',
  borderRadius: '4px',
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  color: '#0f172a',
  fontSize: '0.875rem',
  outline: 'none',
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [nameFilter, emailFilter, addressFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (nameFilter) params.name = nameFilter;
      if (emailFilter) params.email = emailFilter;
      if (addressFilter) params.address = addressFilter;
      if (roleFilter) params.role = roleFilter;

      const res = await adminService.getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess('');

    try {
      await adminService.createUser({ name: newName, email: newEmail, address: newAddress, password: newPassword, role: newRole });
      setFormSuccess(`User "${newName}" (${newRole}) created successfully.`);
      setNewName('');
      setNewEmail('');
      setNewAddress('');
      setNewPassword('');
      setNewRole('USER');
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Name', key: 'name', sortable: true },
    { header: 'Email', key: 'email', sortable: true },
    { header: 'Address', key: 'address' },
    {
      header: 'Role',
      key: 'role',
      sortable: true,
      render: (role) => (
        <span className={`badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>{role}</span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Link to={`/admin/users/${row.id}`} style={{ fontSize: '0.85rem', color: '#2563eb' }}>
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar role="ADMIN" />
      <div className="page-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Manage Users</h1>
            <p className="page-description">Add new users and filter user listings</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close Form' : '+ Add User'}
          </Button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="panel" style={{ marginBottom: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', color: '#0f172a' }}>Add New User</h3>
            {formError && <ErrorMessage message={formError} />}
            {formSuccess && (
              <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <Input label="Full Name" placeholder="Name (20-60 chars)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <Input label="Email" type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              <Input label="Address" placeholder="Physical address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} required />
              <Input label="Password" type="password" placeholder="8-16 chars, 1 uppercase" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ ...inputStyle }}
                >
                  <option value="USER">USER (Normal User)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <Button type="submit" variant="primary" size="sm">Create User</Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Row */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Filter:</span>
          <input type="text" placeholder="Name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Email..." value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Address..." value={addressFilter} onChange={(e) => setAddressFilter(e.target.value)} style={inputStyle} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={inputStyle}>
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          {(nameFilter || emailFilter || addressFilter || roleFilter) && (
            <Button size="sm" variant="secondary" onClick={() => { setNameFilter(''); setEmailFilter(''); setAddressFilter(''); setRoleFilter(''); }}>
              Clear
            </Button>
          )}
        </div>

        {loading ? (
          <Loading message="Loading users..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <Table columns={columns} data={users} emptyMessage="No users match the specified filters." />
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
