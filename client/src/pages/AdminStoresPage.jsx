import React, { useState, useEffect } from 'react';
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

export const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');

  // Form State
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchStores();
  }, [nameFilter, emailFilter, addressFilter]);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (nameFilter) params.name = nameFilter;
      if (emailFilter) params.email = emailFilter;
      if (addressFilter) params.address = addressFilter;

      const res = await adminService.getStores(params);
      setStores(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await adminService.getStoreOwners();
      const owners = res.data || [];
      setStoreOwners(owners);
      if (owners.length > 0) {
        setOwnerId(owners[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess('');

    try {
      await adminService.createStore({ name: storeName, email: storeEmail, address: storeAddress, owner_id: parseInt(ownerId, 10) });
      setFormSuccess(`Store "${storeName}" created successfully.`);
      setStoreName('');
      setStoreEmail('');
      setStoreAddress('');
      fetchStores();
    } catch (err) {
      setFormError(err.message || 'Failed to create store.');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Store Name', key: 'name', sortable: true },
    { header: 'Email', key: 'email', sortable: true },
    { header: 'Address', key: 'address' },
    {
      header: 'Average Rating',
      key: 'rating',
      sortable: true,
      render: (val) =>
        val !== null && val !== undefined ? (
          <span style={{ color: '#d97706', fontWeight: 600 }}>★ {val} / 5</span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No ratings</span>
        ),
    },
    { header: 'Owner ID', key: 'owner_id' },
  ];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar role="ADMIN" />
      <div className="page-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Manage Stores</h1>
            <p className="page-description">Add stores, assign store owners, and view average ratings</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close Form' : '+ Add Store'}
          </Button>
        </div>

        {/* Add Store Form */}
        {showAddForm && (
          <div className="panel" style={{ marginBottom: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.85rem', color: '#0f172a' }}>Add New Store</h3>
            {formError && <ErrorMessage message={formError} />}
            {formSuccess && (
              <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateStore} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
              <Input label="Store Name" placeholder="e.g. Apex Electronics" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              <Input label="Store Email" type="email" placeholder="store@example.com" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} required />
              <Input label="Store Address" placeholder="Physical address" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} required />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Assign Store Owner *</label>
                <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} style={{ ...inputStyle }} required>
                  {storeOwners.length === 0 ? (
                    <option value="">No Store Owners available</option>
                  ) : (
                    storeOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <Button type="submit" variant="primary" size="sm" disabled={storeOwners.length === 0}>
                  Create Store
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Row */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Filter:</span>
          <input type="text" placeholder="Store name..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Email..." value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Address..." value={addressFilter} onChange={(e) => setAddressFilter(e.target.value)} style={inputStyle} />
          {(nameFilter || emailFilter || addressFilter) && (
            <Button size="sm" variant="secondary" onClick={() => { setNameFilter(''); setEmailFilter(''); setAddressFilter(''); }}>
              Clear
            </Button>
          )}
        </div>

        {loading ? (
          <Loading message="Loading stores..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <Table columns={columns} data={stores} emptyMessage="No stores match the specified filters." />
        )}
      </div>
    </div>
  );
};

export default AdminStoresPage;
