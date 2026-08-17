import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import storeOwnerService from '../services/storeOwnerService';

export const StoreOwnerDashboardPage = () => {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState(null);
  const [ratingsError, setRatingsError] = useState(null);

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoadingStores(true);
    setError(null);
    try {
      const res = await storeOwnerService.getDashboard();
      const storeList = res.data || [];
      setStores(storeList);
      if (storeList.length > 0) {
        const firstStoreId = storeList[0].storeId || storeList[0].id;
        setSelectedStoreId(firstStoreId);
        fetchStoreRatings(firstStoreId, sortBy, sortOrder);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch store owner dashboard.');
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchStoreRatings = async (storeId, sBy = sortBy, sOrder = sortOrder) => {
    if (!storeId) return;
    setLoadingRatings(true);
    setRatingsError(null);
    try {
      const res = await storeOwnerService.getStoreRatings(storeId, { sortBy: sBy, sortOrder: sOrder });
      setRatings(res.data || []);
    } catch (err) {
      setRatingsError(err.message || 'Failed to fetch ratings for store.');
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleSort = (field) => {
    let nextOrder = 'asc';
    if (sortBy === field) {
      nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(field);
    setSortOrder(nextOrder);
    if (selectedStoreId) {
      fetchStoreRatings(selectedStoreId, field, nextOrder);
    }
  };

  const handleSelectStore = (storeId) => {
    setSelectedStoreId(storeId);
    fetchStoreRatings(storeId, sortBy, sortOrder);
  };

  const selectedStore = stores.find((s) => (s.storeId || s.id) === selectedStoreId);

  const renderStars = (val) => {
    if (val === null || val === undefined) return 'No ratings';
    const num = Math.round(Number(val));
    const full = '★'.repeat(num);
    const empty = '☆'.repeat(5 - num);
    return `${full}${empty} ${val}`;
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar role="STORE_OWNER" />
      <div className="page-container">
        <div className="page-header">
          <div style={{ marginBottom: '0.25rem' }}>
            <span className="badge badge-owner">Role: Store Owner</span>
          </div>
          <h1 className="page-title">Store Owner Dashboard</h1>
          <p className="page-description">Overview of your registered store performance and customer ratings</p>
        </div>

        {loadingStores ? (
          <Loading message="Loading dashboard..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : stores.length === 0 ? (
          <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>No Store Assigned</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No store has been assigned to your Store Owner account yet.</p>
          </div>
        ) : (
          <>
            {/* Multiple Store Selector if owner has > 1 store */}
            {stores.length > 1 && (
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Select Store:</label>
                <select
                  value={selectedStoreId || ''}
                  onChange={(e) => handleSelectStore(parseInt(e.target.value, 10))}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '4px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                  }}
                >
                  {stores.map((s) => (
                    <option key={s.storeId || s.id} value={s.storeId || s.id}>
                      {s.storeName || s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Store Information Summary Panel */}
            {selectedStore && (
              <div className="panel" style={{ marginBottom: '1.25rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a' }}>
                      Store: {selectedStore.storeName || selectedStore.name}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Address: {selectedStore.address} | Email: {selectedStore.email}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Average Rating:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedStore.averageRating ? '#d97706' : '#94a3b8' }}>
                      {renderStars(selectedStore.averageRating)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Who Rated Table */}
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.65rem' }}>
              Customers Who Rated This Store
            </h2>

            {loadingRatings ? (
              <Loading message="Fetching customer ratings..." />
            ) : ratingsError ? (
              <ErrorMessage message={ratingsError} />
            ) : ratings.length === 0 ? (
              <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>No ratings submitted yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th onClick={() => handleSort('name')} style={{ padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Customer Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('email')} style={{ padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Email {sortBy === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('address')} style={{ padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Address {sortBy === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('rating')} style={{ padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Rating {sortBy === 'rating' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('created_at')} style={{ padding: '0.75rem 1rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Date {sortBy === 'created_at' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{r.name || r.user_name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{r.email || r.user_email}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{r.address || 'N/A'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#d97706', fontWeight: 600 }}>
                          {'★'.repeat(r.rating)} ({r.rating}/5)
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboardPage;
