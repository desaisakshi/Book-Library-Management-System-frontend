import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', first_name: '', last_name: '', mobile: '' });
  const [userId, setUserId] = useState('');   // FIX: store userId from registration
  const [otp, setOtp]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const result = await register({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, mobile: form.mobile || undefined });
    if (result.success) {
      setUserId(result.userId || result.data?.userId || result.data?.user?.id);
      setStep(2);
      if (!result.data?.emailSent) {
        setError('Email delivery failed — check the server console for your OTP code.');
      }
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
      // FIX: pass userId (not email) — matches backend
      await authAPI.verifyOTP({ userId, otp });
      navigate('/login', { state: { message: '✅ Account verified! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    try {
      const res = await authAPI.resendOTP({ userId, purpose: 'registration' });
      const sent = res.data?.data?.emailSent;
      alert(sent ? 'OTP resent! Check your email.' : 'Email failed — check server console for OTP.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            {step === 1
              ? <><h1>Create Account</h1><p>Join our library community</p></>
              : <><h1>Verify Your Account</h1><p>OTP sent to {form.email}</p></>}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="first_name" className="form-input" value={form.first_name} onChange={handleChange} placeholder="First name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="last_name" className="form-input" value={form.last_name} onChange={handleChange} placeholder="Last name" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile (optional)</label>
                <input type="tel" name="mobile" className="form-input" value={form.mobile} onChange={handleChange} placeholder="Mobile number" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input" value={form.password} onChange={handleChange} placeholder="Create a password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-input" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input type="text" className="form-input otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code" maxLength={6} required />
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.4rem' }}>
                  💡 In dev mode the OTP is also printed in the server console.
                </p>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
              <button type="button" className="btn btn-outline btn-block" style={{ marginTop: '0.5rem' }} onClick={handleResendOTP}>
                Resend OTP
              </button>
              <button type="button" className="btn btn-outline btn-block" style={{ marginTop: '0.5rem' }} onClick={() => setStep(1)}>
                Back to Registration
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
