import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from           = location.state?.from?.pathname || '/dashboard';
  const successMessage = location.state?.message || '';

  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // OTP verification state (for unverified users)
  const [needsOTP, setNeedsOTP]       = useState(false);
  const [pendingUserId, setPendingId] = useState('');
  const [otp, setOtp]                 = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.requiresVerification) {
      setPendingId(result.userId);
      setNeedsOTP(true);
      setError(result.message || 'Please verify your account first.');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({ userId: pendingUserId, otp });
      if (res.data.success) {
        setNeedsOTP(false);
        setError('');
        alert('Account verified! Please log in.');
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP({ userId: pendingUserId, purpose: 'registration' });
      alert('OTP resent! Check your email (or server console in dev mode).');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            {needsOTP
              ? <><h1>Verify Your Account</h1><p>Enter the OTP sent to your email</p></>
              : <><h1>Welcome Back</h1><p>Sign in to your library account</p></>}
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {needsOTP ? (
            <>
              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Verification Code</label>
                  <input
                    type="text" className="form-input otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP" maxLength={6} required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Account'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn btn-outline" style={{ marginRight: '0.5rem' }} onClick={handleResendOTP}>Resend OTP</button>
                <button className="btn btn-outline" onClick={() => setNeedsOTP(false)}>Back to Login</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" id="email" name="email" className="form-input"
                  value={form.email} onChange={handleChange} placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input type="password" id="password" name="password" className="form-input"
                  value={form.password} onChange={handleChange} placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
