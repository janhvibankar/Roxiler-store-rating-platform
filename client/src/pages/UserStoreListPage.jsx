import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import RatingInput from '../components/RatingInput';
import Button from '../components/Button';
import Table from '../components/Table';
import storeService from '../services/storeService';
import ratingService from '../services/ratingService';
import tokenStorage from '../utils/tokenStorage';

export const UserStoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingInputState, setRatingInputState] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [actionMessageMap, setActionMessageMap] = useState({});

  const currentUser = tokenStorage.getUser();
  const isUserRole = currentUser?.role === 'USER';

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder]);

  const fetchStores = async (extraParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const effectiveName = 'name' in extraParams ? extraParams.name : nameFilter;
      const effectiveAddress = 'address' in extraParams ? extraParams.address : addressFilter;
      const effectiveSortBy = 'sortBy' in extraParams ? extraParams.sortBy : sortBy;
      const effectiveSortOrder = 'sortOrder' in extraParams ? extraParams.sortOrder : sortOrder;

      const params = {};
      if (effectiveName && effectiveName.trim()) params.name = effectiveName.trim();
      if (effectiveAddress && effectiveAddress.trim()) params.address = effectiveAddress.trim();
      if (effectiveSortBy) params.sortBy = effectiveSortBy;
      if (effectiveSortOrder) params.sortOrder = effectiveSortOrder;

      const response = await storeService.getAllStores(params);
      const storeData = response.data || [];
      setStores(storeData);

      const initialRatings = {};
      storeData.forEach((s) => {
        if (s.userRating) {
          initialRatings[s.id] = s.userRating;
        }
      });
      setRatingInputState(initialRatings);
    } catch (err) {
      setError(err.message || 'Failed to fetch store listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleClearSearch = () => {
    setNameFilter('');
    setAddressFilter('');
    setSortBy('');
    setSortOrder('asc');
    fetchStores({ name: '', address: '', sortBy: '', sortOrder: 'asc' });
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleRateSubmit = async (storeId, newRatingValue) => {
    if (!isUserRole) return;

    const num = Number(newRatingValue);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      setActionMessageMap((prev) => ({
        ...prev,
        [storeId]: { type: 'error', text: 'Rating must be between 1 and 5.' },
      }));
      return;
    }

    setSubmittingMap((prev) => ({ ...prev, [storeId]: true }));
    setActionMessageMap((prev) => ({ ...prev, [storeId]: null }));

    try {
      const store = stores.find((s) => s.id === storeId);
      const isUpdate = store && store.userRating !== null && store.userRating !== undefined;

      if (isUpdate) {
        await ratingService.updateRating(storeId, newRatingValue);
        setActionMessageMap((prev) => ({
          ...prev,
          [storeId]: { type: 'success', text: `Rating updated to ${newRatingValue}` },
        }));
      } else {
        await ratingService.submitRating({ storeId, rating: newRatingValue });
        setActionMessageMap((prev) => ({
          ...prev,
          [storeId]: { type: 'success', text: `Submitted ${newRatingValue} star rating` },
        }));
      }

      setRatingInputState((prev) => ({ ...prev, [storeId]: newRatingValue }));
      fetchStores();
    } catch (err) {
      setActionMessageMap((prev) => ({
        ...prev,
        [storeId]: { type: 'error', text: err.message || 'Failed to save rating.' },
      }));
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [storeId]: false }));
    }
  };

  const renderStars = (ratingVal) => {
    if (ratingVal === null || ratingVal === undefined) return 'No ratings';
    const num = Math.round(Number(ratingVal));
    const fullStars = '★'.repeat(num);
    const emptyStars = '☆'.repeat(5 - num);
    return `${fullStars}${emptyStars} (${ratingVal})`;
  };

  const columns = [
    {
      header: 'Store Name',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</span>
      ),
    },
    {
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (val, row) => (
        <span style={{ color: '#334155' }}>{row.address}</span>
      ),
    },
    {
      header: 'Overall Rating',
      key: 'overallRating',
      sortable: true,
      render: (val, row) =>
        row.overallRating !== null && row.overallRating !== undefined ? (
          <span style={{ color: '#d97706', fontWeight: 600 }}>{renderStars(row.overallRating)}</span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No ratings</span>
        ),
    },
    {
      header: 'My Rating',
      key: 'userRating',
      render: (val, row) =>
        row.userRating ? (
          <span style={{ color: '#059669', fontWeight: 600 }}>
            {'★'.repeat(row.userRating)} ({row.userRating}/5)
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not rated</span>
        ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (val, row) => {
        const currentStoreRating = ratingInputState[row.id] || row.userRating || 0;
        const isSubmitting = submittingMap[row.id];
        const actionMsg = actionMessageMap[row.id];

        if (!isUserRole) {
          return currentUser ? (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Only Normal Users can rate</span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Log in as Normal User to rate</span>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <RatingInput
              value={currentStoreRating}
              disabled={isSubmitting}
              onChange={(val) => handleRateSubmit(row.id, val)}
            />
            {actionMsg && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: actionMsg.type === 'error' ? '#dc2626' : '#059669',
                }}
              >
                {actionMsg.text}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <p className="page-description">Browse registered stores and share your rating experience.</p>
      </div>

      {/* Unified Search Section Panel */}
      <div className="panel" style={{ marginBottom: '1.5rem', background: '#ffffff', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Store Name</label>
            <input
              type="text"
              placeholder="Search by store name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Address</label>
            <input
              type="text"
              placeholder="Search by address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
            {(nameFilter || addressFilter || sortBy) && (
              <Button type="button" variant="secondary" size="md" onClick={handleClearSearch}>
                Clear Filter
              </Button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <Loading message="Loading stores..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : stores.length === 0 ? (
        <div className="panel" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>No stores found.</p>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>Try modifying your search criteria.</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={stores}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyMessage="No stores found."
        />
      )}
    </div>
  );
};

export default UserStoreListPage;
