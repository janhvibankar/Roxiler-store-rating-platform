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
      {/* Left Column: Brand Identity */}
      <div className="auth-brand-side">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
            RS
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>RateStore</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '0.75rem' }}>
          Create your account & start rating.
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Join RateStore to share genuine feedback on local stores, track your ratings, and help community members find top-rated services.
        </p>
        <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Account Rules:</strong>
          • Name: 20 to 60 characters<br />
          • Password: 8–16 characters, 1 uppercase & 1 special character<br />
          • Public registration automatically creates Normal User accounts.
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="auth-form-side">
        <div className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.08)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Sign Up</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Create a new RateStore user account</p>
          </div>

          {error && <ErrorMessage message={error} />}
          {successMsg && (
            <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
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

            <Button type="submit" variant="primary" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Registering...' : 'Register Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
