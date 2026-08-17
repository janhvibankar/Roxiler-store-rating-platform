import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import adminService from '../services/adminService';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 66px)' }}>
      <Sidebar role="ADMIN" />
      <div className="page-container">
        <div className="page-header">
          <span className="eyebrow">System Administration</span>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Overview of your RateStore platform metrics and quick management controls.</p>
        </div>

        {loading ? (
          <Loading message="Loading statistics..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Metrics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem', borderLeft: '4px solid #2563eb' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Users</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {stats?.totalUsers ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.35rem' }}>Registered system users</div>
              </div>

              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem', borderLeft: '4px solid #059669' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stores</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {stats?.totalStores ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.35rem' }}>Active store listings</div>
              </div>

              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.25rem 1.5rem', borderLeft: '4px solid #d97706' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ratings</div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem', lineHeight: 1.1 }}>
                  {stats?.totalRatings ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.35rem' }}>Customer ratings submitted</div>
              </div>
            </div>

            {/* Practical Navigation Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem' }}>User Management</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
                    Create new normal users or store owners, inspect user profiles, and filter user accounts.
                  </p>
                </div>
                <div>
                  <a href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#2563eb', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Manage Users →
                  </a>
                </div>
              </div>

              <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem' }}>Store Management</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
                    Add new retail stores, assign verified store owners, and monitor store rating averages.
                  </p>
                </div>
                <div>
                  <a href="/admin/stores" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#059669', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Manage Stores →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
