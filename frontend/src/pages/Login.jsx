import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, HeartHandshake, Building2, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'donor', 'ngo', 'admin'

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'donor') {
      setEmail('donor@test.com');
      setPassword('Donor@12345');
    } else if (tab === 'admin') {
      setEmail('admin@shareplate.org');
      setPassword('Admin@12345');
    } else if (tab === 'ngo') {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      // Route based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'ngo') {
        navigate('/ngo');
      } else {
        navigate('/restaurant');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '460px', paddingBottom: '4rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        
        <div className="text-center mb-6">
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#FFEDD5',
            color: 'var(--primary-color)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#3E2723', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ color: '#6B4937', fontSize: '0.9rem' }}>
            Sign in to access your SharePlate dashboard
          </p>
        </div>

        {/* Role Quick Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          backgroundColor: '#F3F4F6',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('donor')}
            style={{
              border: 'none',
              padding: '0.5rem 0.2rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'donor' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'donor' ? '#C2410C' : '#6B7280',
              boxShadow: activeTab === 'donor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Donor Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ngo')}
            style={{
              border: 'none',
              padding: '0.5rem 0.2rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'ngo' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'ngo' ? '#16A34A' : '#6B7280',
              boxShadow: activeTab === 'ngo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            NGO Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            style={{
              border: 'none',
              padding: '0.5rem 0.2rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'admin' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'admin' ? '#2563EB' : '#6B7280',
              boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Admin Login
          </button>
        </div>

        {successMessage && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.9rem'
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="name@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ paddingLeft: '2.5rem' }}
                required 
              />
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isSubmitting}
            style={{ padding: '0.8rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '1.5rem',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: '#4B5563'
        }}>
          <strong style={{ color: '#111827' }}>Demo Accounts:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.2rem', marginTop: '0.25rem' }}>
            <span>• <strong>Admin:</strong> admin@shareplate.org / Admin@12345</span>
            <span>• <strong>Donor:</strong> donor@test.com / Donor@12345</span>
          </div>
        </div>

        {/* Registration links */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#6B7280' }}>
            New to SharePlate?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '0.9rem' }}>
              Register as Donor
            </Link>
            <span style={{ color: '#D1D5DB' }}>|</span>
            <Link to="/register-ngo" style={{ fontWeight: 600, color: '#16A34A', fontSize: '0.9rem' }}>
              Register as NGO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
