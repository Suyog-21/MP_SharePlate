import React, { useState } from 'react';
const API_BASE = 'http://localhost:5000';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const NGOActivation = () => {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();

  const [step, setStep] = useState(1); // 1: Enter ID, 2: OTP & Password
  const [registrationId, setRegistrationId] = useState('');
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [ngoName, setNgoName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Verify Registration ID & Send OTP
  const handleVerifyId = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ngo/request-activation-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId: registrationId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify Registration ID');
      }

      setNgoName(data.ngoName);
      setMaskedEmail(data.maskedEmail);
      setEmail(data.registeredEmail || '');
      setStep(2);
      setSuccess(`Registration ID verified! We sent an activation OTP to ${data.maskedEmail}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setResending(true);
    try {
      const res = await fetch(`${API_BASE}/api/ngo/request-activation-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId: registrationId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setSuccess(`A new OTP has been sent to ${data.maskedEmail}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Complete Activation
  const handleActivate = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ngo/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          registrationId: registrationId.trim(),
          email: email.trim(),
          otp: otp.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Activation failed');
      }

      setSuccess('Account successfully activated! Redirecting to login...');
      if (data.user) {
        setAuthenticatedUser(data.user);
      }

      setTimeout(() => {
        navigate('/login', { state: { message: 'NGO account activated successfully! Please log in.' } });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '540px', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/register-ngo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to NGO Options</span>
        </Link>
      </div>

      <div className="card" style={{ borderTop: '5px solid #16A34A', padding: '2.5rem 2rem' }}>
        <div className="text-center mb-6">
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#14532D', marginBottom: '0.5rem' }}>
            NGO Account Activation
          </h2>
          <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>
            Activate your organization's portal credentials using the Registration ID provided by the administrator.
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

        {success && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: Registration ID Lookup */}
        {step === 1 && (
          <form onSubmit={handleVerifyId}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                NGO Registration ID <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NGO-REG-A9F4-37B2-C8D1"
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, paddingLeft: '2.5rem' }}
                  required
                />
                <KeyRound size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <small style={{ display: 'block', marginTop: '0.4rem', color: '#6B7280' }}>
                Check the approval confirmation email sent by the SharePlate administrator.
              </small>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading || !registrationId.trim()}
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                marginTop: '1rem'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Registration ID...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify ID & Send Activation OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Email OTP Verification & Password Setup */}
        {step === 2 && (
          <form onSubmit={handleActivate}>
            <div style={{
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Organization Verified:</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{ngoName}</div>
              <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 600, marginTop: '0.2rem' }}>
                Registration ID: {registrationId.toUpperCase()}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Registered Email Address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered official email"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <small style={{ display: 'block', marginTop: '0.3rem', color: '#6B7280' }}>
                Sent to: <strong>{maskedEmail}</strong>
              </small>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Enter 6-Digit OTP <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="6-digit code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 700 }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Create Account Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm Password <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                Change ID
              </button>
              <button
                type="submit"
                className="btn"
                disabled={loading || !otp || !password || !confirmPassword}
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  flex: 2,
                  fontWeight: 700,
                  padding: '0.85rem'
                }}
              >
                {loading ? 'Activating Account...' : 'Complete Activation'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6B7280' }}>
            Don't have an approved Registration ID yet?{' '}
            <Link to="/ngo/apply" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              Apply for NGO Verification
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NGOActivation;
