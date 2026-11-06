import React, { useState } from 'react';
const API_BASE = 'http://localhost:5000';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, Mail, Phone, Lock, MapPin, Building2, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const { registerDonor } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }

    setError('');
    setSendingOtp(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-donor-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setOtpSent(true);
      setOtpMessage(data.message || `OTP sent to ${formData.email}`);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // Submit Donor Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpSent || !formData.otp) {
      setError('Please verify your email with the 6-digit OTP.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerDonor(formData);
      navigate('/restaurant');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '640px', paddingBottom: '4rem' }}>
      
      {/* Banner for NGOs */}
      <div 
        style={{
          backgroundColor: '#FFF7ED',
          border: '1.5px solid #FED7AA',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="#C2410C" />
          <div>
            <h4 style={{ margin: 0, color: '#9A3412', fontSize: '0.95rem' }}>Are you a Non-Profit / Food Rescue NGO?</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350F' }}>NGOs require administrative verification and documentation.</p>
          </div>
        </div>
        <Link 
          to="/register-ngo" 
          className="btn"
          style={{
            backgroundColor: '#C2410C',
            color: '#FFFFFF',
            fontSize: '0.85rem',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          Register as NGO
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div className="text-center mb-6">
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#FFEDD5',
            color: 'var(--primary-color)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Utensils size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#3E2723', marginBottom: '0.5rem' }}>
            Register as Food Donor
          </h2>
          <p style={{ color: '#6B4937', fontSize: '0.95rem' }}>
            Restaurants, caterers, hotels & bakeries — join SharePlate to donate surplus meals and track community impact.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* 1. Full Name / Organization Name */}
          <div className="form-group">
            <label className="form-label">
              Full Name / Organization Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Royal Kitchens or Ramesh Gupta"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* 2. Email & OTP Verification */}
          <div className="form-group">
            <label className="form-label">
              Email Address <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="donor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || countdown > 0 || !formData.email}
                className="btn btn-outline"
                style={{ whiteSpace: 'nowrap', padding: '0.6rem 1rem', minWidth: '110px' }}
              >
                {sendingOtp ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : otpSent ? (
                  'Resend OTP'
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            {otpMessage && (
              <small style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.35rem' }}>
                <CheckCircle2 size={14} />
                <span>{otpMessage}</span>
              </small>
            )}
          </div>

          {/* OTP Code Input */}
          {otpSent && (
            <div className="form-group" style={{ backgroundColor: '#FFF7ED', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #FED7AA' }}>
              <label className="form-label" style={{ color: '#9A3412', fontWeight: 700 }}>
                Enter 6-Digit Email OTP <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="otp"
                className="form-control"
                placeholder="6-digit code"
                maxLength={6}
                value={formData.otp}
                onChange={(e) => setFormData((p) => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '4px', fontWeight: 700, backgroundColor: '#FFFFFF' }}
                required
              />
              <small style={{ color: '#78350F', display: 'block', marginTop: '0.25rem' }}>
                Check your email inbox or backend console for the OTP code.
              </small>
            </div>
          )}

          {/* 3. Mobile Number */}
          <div className="form-group">
            <label className="form-label">
              Mobile Number <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* 4. Password */}
          <div className="form-group">
            <label className="form-label">
              Password <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* 5. Complete Address */}
          <div className="form-group">
            <label className="form-label">
              Complete Address <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              name="address"
              className="form-control"
              rows={2}
              placeholder="Outlet / kitchen address for food pickups"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* 6. City and PIN Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                City <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                PIN Code <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                placeholder="e.g. 400001"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSubmitting || !otpSent || !formData.otp}
            style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 700, marginTop: '1rem' }}
          >
            {isSubmitting ? 'Registering Food Donor...' : 'Register as Food Donor'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.9rem', color: '#6B7280', margin: '1.5rem 0 0 0' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
