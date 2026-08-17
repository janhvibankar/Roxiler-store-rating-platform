import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import tokenStorage from '../utils/tokenStorage';
import authService from '../services/authService';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = tokenStorage.getUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess('');

    try {
      await authService.changePassword({ oldPassword, newPassword });
      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? '#2563eb' : '#4b5563',
    fontWeight: isActive(path) ? 600 : 500,
    fontSize: '0.875rem',
    padding: '0.35rem 0.6rem',
    borderRadius: '4px',
    background: isActive(path) ? '#eff6ff' : 'transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <>
      <nav
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 2rem',
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 2px 0 rgba(17, 24, 39, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
              RS
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.02em' }}>
              RateStore
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(!currentUser || currentUser.role === 'USER') && (
              <Link to="/stores" style={linkStyle('/stores')}>
                Stores Directory
              </Link>
            )}
            {currentUser && currentUser.role === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" style={linkStyle('/admin/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/admin/users" style={linkStyle('/admin/users')}>
                  Users
                </Link>
                <Link to="/admin/stores" style={linkStyle('/admin/stores')}>
                  Stores
                </Link>
              </>
            )}
            {currentUser && currentUser.role === 'STORE_OWNER' && (
              <Link to="/owner/dashboard" style={linkStyle('/owner/dashboard')}>
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{currentUser.name}</span>
                <span className={`badge ${currentUser.role === 'ADMIN' ? 'badge-admin' : currentUser.role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user'}`}>
                  {currentUser.role}
                </span>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
                Update Password
              </Button>

              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: 500, padding: '0.35rem 0.75rem' }}>
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '380px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.85rem', color: '#0f172a' }}>Update Password</h3>
            {passwordError && <ErrorMessage message={passwordError} />}
            {passwordSuccess && (
              <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                {passwordSuccess}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
