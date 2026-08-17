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
      {/* Left Column: Editorial Brand Copy */}
      <div className="auth-brand-side">
        <span className="eyebrow" style={{ marginBottom: '0.5rem' }}>RateStore Platform</span>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
          Find places people actually talk about.
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Explore genuine community ratings for local stores, submit your own star feedback, and manage your business presence seamlessly.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>
            <span>Transparent 5-star community ratings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>
            <span>Verified local business listings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem' }}>✓</span>
            <span>Role-based dashboards for Owners & Admins</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="auth-form-side">
        <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(17, 24, 39, 0.05)', padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Welcome back</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sign in to your RateStore account</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {successMsg && (
            <div style={{ padding: '0.6rem 0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
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

            <Button type="submit" variant="primary" fullWidth disabled={loading} style={{ marginTop: '0.5rem', padding: '0.6rem 1rem' }}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
            New to RateStore?{' '}
            <a href="/signup" style={{ color: '#2563eb', fontWeight: 600 }}>
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
