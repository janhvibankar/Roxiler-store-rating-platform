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
    setLoading(true);
    setError(null);
    setSuccessMsg('');

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
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '2rem 1rem' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>Sign Up</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Register for RateStore</p>
        </div>

        {error && <ErrorMessage message={error} />}
        {successMsg && (
          <div style={{ padding: '0.5rem 0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            id="name"
            placeholder="Full Name (20-60 characters)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Address"
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
  );
};

export default SignupPage;
