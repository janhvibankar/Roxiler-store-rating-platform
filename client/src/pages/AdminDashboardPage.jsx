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
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
      <Sidebar role="ADMIN" />
      <div className="page-container">
        <div className="page-header">
          <div style={{ marginBottom: '0.25rem' }}>
            <span className="badge badge-admin">Role: System Administrator</span>
          </div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">Overview of system users, stores, and ratings</p>
        </div>

        {loading ? (
          <Loading message="Loading statistics..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                System Metrics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem 1.1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #2563eb' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Users</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    {stats?.totalUsers ?? 0}
                  </div>
                </div>

                <div style={{ padding: '1rem 1.1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #059669' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Stores</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    {stats?.totalStores ?? 0}
                  </div>
                </div>

                <div style={{ padding: '1rem 1.1rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', borderTop: '3px solid #d97706' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Ratings Submitted</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    {stats?.totalRatings ?? 0}
                  </div>
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
