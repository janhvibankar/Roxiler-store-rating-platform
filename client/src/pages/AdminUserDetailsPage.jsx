import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import adminService from '../services/adminService';

export const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUserDetails(id);
      setUser(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user details.');
    } finally {
      setLoading(false);
    }
  };

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    padding: '0.55rem 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.875rem',
  };

  const labelStyle = {
    fontWeight: 600,
    color: '#64748b',
    minWidth: '130px',
    flexShrink: 0,
  };

  const valueStyle = {
    color: '#0f172a',
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar role="ADMIN" />
      <div className="page-container">
        <div style={{ marginBottom: '0.85rem' }}>
          <Link to="/admin/users" style={{ color: '#2563eb', fontSize: '0.875rem' }}>
            ← Back to Users List
          </Link>
        </div>

        <div className="page-header">
          <h1 className="page-title">User Profile Details</h1>
          <p className="page-description">Full profile and activity breakdown</p>
        </div>

        {loading ? (
          <Loading message="Loading user details..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !user ? (
          <ErrorMessage message="User not found." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
            {/* Profile Panel */}
            <div className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</h2>
                <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : user.role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                  {user.role}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={rowStyle}>
                  <span style={labelStyle}>User ID</span>
                  <span style={valueStyle}>#{user.id}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Email</span>
                  <span style={valueStyle}>{user.email}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <span style={labelStyle}>Address</span>
                  <span style={valueStyle}>{user.address}</span>
                </div>
              </div>
            </div>

            {/* Owned Store Panel (if STORE_OWNER) */}
            {user.role === 'STORE_OWNER' && (
              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.85rem' }}>
                  Assigned Store
                </h3>

                {user.ownedStore ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Store Name</span>
                      <span style={valueStyle}>{user.ownedStore.name}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Store Email</span>
                      <span style={valueStyle}>{user.ownedStore.email}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Store Address</span>
                      <span style={valueStyle}>{user.ownedStore.address}</span>
                    </div>
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                      <span style={labelStyle}>Average Rating</span>
                      <span style={{ ...valueStyle, color: user.ownedStore.rating ? '#d97706' : '#94a3b8', fontWeight: 600 }}>
                        {user.ownedStore.rating ? `★ ${user.ownedStore.rating} / 5.0` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No store assigned to this Store Owner yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;
