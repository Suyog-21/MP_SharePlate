import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Globe, ShieldCheck, Heart, Sparkles, Utensils, Award, Building2, HeartHandshake } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'ngo') return <Navigate to="/ngo" />;
    return <Navigate to="/restaurant" />;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="container mt-8" style={{ padding: '4rem 1rem 3rem 1rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: '#FFEDD5', 
          color: '#9A3412', 
          padding: '0.4rem 1.25rem', 
          borderRadius: '9999px', 
          fontWeight: 700, 
          fontSize: '0.9rem', 
          marginBottom: '1.5rem',
          border: '1px solid #FED7AA' 
        }}>
          <Sparkles size={16} color="#EA580C" />
          <span>Real-Time Food Rescue Network</span>
        </div>

        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#3E2723', lineHeight: 1.15 }}>
          Zero Waste. <span style={{ color: '#EA580C' }}>Maximum Impact.</span>
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2.5rem auto', color: '#6B4937', lineHeight: 1.7 }}>
          Connect surplus food from restaurants directly to verified NGOs in real-time. 
          Help us build a sustainable future by ensuring good food feeds people, not landfills.
        </p>

        {/* Dual Registration CTA Buttons */}
        <div className="flex justify-center gap-4" style={{ flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <Link 
            to="/register-ngo" 
            className="btn" 
            style={{ 
              padding: '0.9rem 2rem', 
              fontSize: '1.05rem', 
              backgroundColor: '#FFF7ED', 
              color: '#C2410C',
              border: '2px solid #FDBA74',
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Building2 size={20} />
            <span>Register as NGO</span>
          </Link>

          <Link 
            to="/register" 
            className="btn btn-primary" 
            style={{ 
              padding: '0.9rem 2rem', 
              fontSize: '1.05rem', 
              backgroundColor: '#EA580C', 
              borderColor: '#EA580C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <HeartHandshake size={20} />
            <span>Register as Food Donor</span>
            <ArrowRight size={18} />
          </Link>

          <Link 
            to="/login" 
            className="btn btn-outline" 
            style={{ padding: '0.9rem 1.8rem', fontSize: '1.05rem' }}
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mt-8 mb-8">
        <h2 className="text-center mb-8" style={{ fontSize: '2.5rem', color: '#3E2723' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="card text-center" style={{ borderTop: '4px solid #EA580C', padding: '2.5rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#EA580C' }}>
              <Globe size={48} />
            </div>
            <h3 style={{ color: '#3E2723', marginBottom: '0.75rem' }}>1. Real-Time Matching</h3>
            <p style={{ color: '#6B4937', lineHeight: 1.6 }}>Food donors post surplus food in under 30 seconds. Nearby verified NGOs receive immediate alerts for rescue pickup.</p>
          </div>

          <div className="card text-center" style={{ borderTop: '4px solid #4A2810', padding: '2.5rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#4A2810' }}>
              <ShieldCheck size={48} />
            </div>
            <h3 style={{ color: '#3E2723', marginBottom: '0.75rem' }}>2. Verified Non-Profits</h3>
            <p style={{ color: '#6B4937', lineHeight: 1.6 }}>Strict administrative document verification with secure Registration IDs ensures all meals reach trustworthy community shelters.</p>
          </div>

          <div className="card text-center" style={{ borderTop: '4px solid #D97706', padding: '2.5rem 1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#D97706' }}>
              <Heart size={48} />
            </div>
            <h3 style={{ color: '#3E2723', marginBottom: '0.75rem' }}>3. Measure Impact</h3>
            <p style={{ color: '#6B4937', lineHeight: 1.6 }}>Track meals saved, carbon footprint reduction, and build a lasting reputation for sustainability in your local community.</p>
          </div>

        </div>
      </section>

      {/* Quick Impact Highlight */}
      <section className="container mt-8">
        <div style={{ 
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', 
          border: '1px solid #FDBA74', 
          borderRadius: 'var(--radius-lg)', 
          padding: '3rem 2rem', 
          textAlign: 'center' 
        }}>
          <h2 style={{ fontSize: '2.2rem', color: '#4A2810', marginBottom: '1rem' }}>Over 50,000+ Meals Saved Together</h2>
          <p style={{ maxWidth: '650px', margin: '0 auto 2rem auto', color: '#78350F', fontSize: '1.1rem' }}>
            Join hundreds of local kitchens and verified non-profits turning waste into hope every single day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/milestones" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem' }}>
              Explore Milestones <Award size={18} />
            </Link>
            <Link to="/about" className="btn btn-outline" style={{ padding: '0.8rem 1.75rem', backgroundColor: '#FFFFFF' }}>
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
