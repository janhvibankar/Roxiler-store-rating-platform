import React, { useState, useEffect } from 'react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import RatingInput from '../components/RatingInput';
import Button from '../components/Button';
import storeService from '../services/storeService';
import ratingService from '../services/ratingService';
import tokenStorage from '../utils/tokenStorage';

export const UserStoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingInputState, setRatingInputState] = useState({});
  const [submittingMap, setSubmittingMap] = useState({});
  const [actionMessageMap, setActionMessageMap] = useState({});

  const currentUser = tokenStorage.getUser();
  const isUserRole = currentUser?.role === 'USER';

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
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
    const params = {};
    if (nameFilter.trim()) params.name = nameFilter.trim();
    if (addressFilter.trim()) params.address = addressFilter.trim();
    fetchStores(params);
  };

  const handleClearSearch = () => {
    setNameFilter('');
    setAddressFilter('');
    fetchStores();
  };

  const handleRateSubmit = async (storeId, newRatingValue) => {
    if (!isUserRole) return;

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
      fetchStores({ name: nameFilter.trim() || undefined, address: addressFilter.trim() || undefined });
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Stores</h1>
        <p className="page-description">Browse registered stores and rate your experience.</p>
      </div>

      {/* Simple Search Row */}
      <div style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Store name</label>
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

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Address</label>
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
            {(nameFilter || addressFilter) && (
              <Button type="button" variant="secondary" size="md" onClick={handleClearSearch}>
                Clear
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
        <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Store Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Address</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>My Rating</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const currentStoreRating = ratingInputState[store.id] || store.userRating || 0;
                const isSubmitting = submittingMap[store.id];
                const actionMsg = actionMessageMap[store.id];

                return (
                  <tr key={store.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      {store.name}
                    </td>

                    <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>
                      {store.address}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {store.overallRating !== null && store.overallRating !== undefined ? (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>
                          {renderStars(store.overallRating)}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No ratings</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {store.userRating ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          {'★'.repeat(store.userRating)} ({store.userRating}/5)
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Not rated</span>
                      )}
                    </td>

                    <td style={{ padding: '0.75rem 1rem' }}>
                      {isUserRole ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <RatingInput
                            value={currentStoreRating}
                            disabled={isSubmitting}
                            onChange={(val) => handleRateSubmit(store.id, val)}
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
                      ) : currentUser ? (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Only Normal Users can rate</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Log in as Normal User to rate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserStoreListPage;
