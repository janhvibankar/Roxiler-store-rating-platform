import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import authService from '../services/authService';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      const userRole = res.data?.user?.role;
      setSuccessMsg(`Logged in successfully as ${res.data.user.name} (${userRole})`);
      setTimeout(() => {
        if (userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (userRole === 'STORE_OWNER') {
          navigate('/owner/dashboard');
        } else {
          navigate('/stores');
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Column: Brand Identity */}
      <div className="auth-brand-side">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
            RS
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>RateStore</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '0.75rem' }}>
          Discover local stores & share your experience.
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          RateStore provides a centralized platform for customers, store owners, and administrators to browse, evaluate, and manage retail store ratings.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> Transparent 1–5 star ratings
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> Dedicated dashboards for Store Owners & Admins
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#2563eb', fontWeight: 700 }}>✓</span> Fast searching and whitelisted sorting
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="auth-form-side">
        <div className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Welcome back</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Sign in to your RateStore account</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {successMsg && (
            <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
