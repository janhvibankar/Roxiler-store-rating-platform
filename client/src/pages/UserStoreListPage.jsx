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

  const getInitials = (nameStr) => {
    if (!nameStr) return 'ST';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

  const renderStars = (ratingVal) => {
    if (ratingVal === null || ratingVal === undefined) return 'No ratings yet';
    const num = Math.round(Number(ratingVal));
    const fullStars = '★'.repeat(num);
    const emptyStars = '☆'.repeat(5 - num);
    return `${fullStars}${emptyStars} ${ratingVal}`;
  };

  const columns = [
    {
      header: 'Store',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}
          >
            {getInitials(row.name)}
          </span>
          <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.925rem' }}>{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (val, row) => (
        <span style={{ color: '#4b5563', fontSize: '0.875rem' }}>{row.address}</span>
      ),
    },
    {
      header: 'Community rating',
      key: 'overallRating',
      sortable: true,
      render: (val, row) =>
        row.overallRating !== null && row.overallRating !== undefined ? (
          <span style={{ color: '#d97706', fontWeight: 700, fontSize: '0.9rem' }}>
            {renderStars(row.overallRating)}
          </span>
        ) : (
          <span style={{ color: '#9ca3af', fontSize: '0.825rem' }}>No ratings yet</span>
        ),
    },
    {
      header: 'Your rating',
      key: 'userRating',
      render: (val, row) =>
        row.userRating ? (
          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.875rem' }}>
            {'★'.repeat(row.userRating)} ({row.userRating}/5)
          </span>
        ) : (
          <span style={{ color: '#9ca3af', fontSize: '0.825rem' }}>Not rated</span>
        ),
    },
    {
      header: 'Rate',
      key: 'action',
      render: (val, row) => {
        const currentStoreRating = ratingInputState[row.id] || row.userRating || 0;
        const isSubmitting = submittingMap[row.id];
        const actionMsg = actionMessageMap[row.id];

        if (!isUserRole) {
          return currentUser ? (
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Normal Users only</span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Log in to rate</span>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Rate this store
            </span>
            <RatingInput
              value={currentStoreRating}
              disabled={isSubmitting}
              onChange={(val) => handleRateSubmit(row.id, val)}
            />
            {actionMsg && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
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
        <span className="eyebrow">Store Directory</span>
        <h1 className="page-title">Find a store worth talking about.</h1>
        <p className="page-description">Browse registered local businesses, see community ratings, and share your own experience.</p>
      </div>

      {/* Unified Horizontal Search Section Panel */}
      <div className="panel" style={{ marginBottom: '1.75rem', background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Store Name</label>
            <input
              type="text"
              placeholder="Filter by store name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#111827',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151' }}>Address</label>
            <input
              type="text"
              placeholder="Filter by address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.85rem',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#111827',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" variant="primary" size="md">
              Search Stores
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
