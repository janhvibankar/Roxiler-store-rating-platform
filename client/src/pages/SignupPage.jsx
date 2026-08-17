import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import authService from '../services/authService';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const trimmedAddress = address.trim();
    if (trimmedAddress.length > 400) {
      setError('Address cannot exceed 400 characters.');
      return;
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        'Password must be 8–16 characters and contain at least one uppercase letter and one special character.'
      );
      return;
    }

    setLoading(true);

    try {
      await authService.signup({ name, email, address, password });
      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* Left Column: Editorial Brand Copy */}
      <div className="auth-brand-side">
        <span className="eyebrow" style={{ marginBottom: '0.5rem' }}>Join RateStore</span>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#111827', lineHeight: 1.2, marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
          Create your account & start rating.
        </h1>
        <p style={{ color: '#4b5563', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Join RateStore to share genuine feedback on local stores, track your ratings, and help community members find top-rated services.
        </p>
        <div style={{ padding: '1rem 1.15rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
          <strong style={{ color: '#111827', display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem' }}>Registration Rules:</strong>
          • Full Name: 20 to 60 characters<br />
          • Password: 8–16 chars, 1 uppercase & 1 special character<br />
          • Public registration automatically creates Normal User accounts.
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="auth-form-side">
        <div className="panel" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(17, 24, 39, 0.05)', padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>Create account</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Register a new RateStore user account</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {successMsg && (
            <div style={{ padding: '0.6rem 0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              id="name"
              placeholder="Full Name (20-60 characters)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              label="Physical Address"
              id="address"
              placeholder="Enter physical address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth disabled={loading} style={{ marginTop: '0.5rem', padding: '0.6rem 1rem' }}>
              {loading ? 'Registering...' : 'Register Account'}
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
