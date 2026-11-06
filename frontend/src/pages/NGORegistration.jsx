import React from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, FileText, CheckCircle2, ShieldCheck, ArrowRight, Building2, HelpCircle } from 'lucide-react';

const NGORegistration = () => {
  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '960px', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#FFEDD5',
          color: '#C2410C',
          padding: '0.4rem 1.25rem',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '0.85rem',
          marginBottom: '1rem',
          border: '1px solid #FED7AA'
        }}>
          <Building2 size={16} />
          <span>Non-Profit Verification & Access</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#3E2723', marginBottom: '0.75rem' }}>
          NGO Registration Portal
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', color: '#6B4937', lineHeight: 1.6 }}>
          To ensure food safety and integrity, all partner NGOs undergo verification by our administration before gaining portal access. Please select the option that applies to your organization.
        </p>
      </div>

      {/* Two Prominent Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        
        {/* OPTION A: Already Have a Registration ID? */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            borderTop: '5px solid #16A34A',
            padding: '2.5rem 2rem',
            position: 'relative',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <KeyRound size={28} />
            </div>

            <div style={{
              display: 'inline-block',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              marginBottom: '0.75rem',
              letterSpacing: '0.5px'
            }}>
              OPTION A • APPROVED NGOS
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#14532D', marginBottom: '0.75rem' }}>
              Already Have a Registration ID?
            </h2>

            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              For NGOs whose applications have already been verified and approved by the SharePlate administrator. Enter the unique Registration ID received in your approval email to activate your account.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: '#374151', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>One-time secure email OTP verification</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Create password and activate login instantly</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Gain direct access to claim surplus food</span>
              </li>
            </ul>
          </div>

          <Link 
            to="/ngo/activate" 
            className="btn" 
            style={{
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Activate NGO Account</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* OPTION B: New NGO? Register Here */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            borderTop: '5px solid var(--primary-color)',
            padding: '2.5rem 2rem',
            position: 'relative',
            backgroundColor: '#FFFFFF',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#FFEDD5',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <FileText size={28} />
            </div>

            <div style={{
              display: 'inline-block',
              backgroundColor: '#FFEDD5',
              color: '#C2410C',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              marginBottom: '0.75rem',
              letterSpacing: '0.5px'
            }}>
              OPTION B • FIRST TIME APPLICANTS
            </div>

            <h2 style={{ fontSize: '1.6rem', color: '#7C2D12', marginBottom: '0.75rem' }}>
              New NGO? Register Here
            </h2>

            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              For non-profit organizations that have not yet applied for verification. Submit your organization profile, representative details, and regulatory documents for administrator review.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: '#374151', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--primary-color)" />
                <span>Upload NGO Certificate, PAN Card & Address Proof</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <CheckCircle2 size={16} color="var(--primary-color)" />
                <span>Receive Application Reference ID for tracking</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--primary-color)" />
                <span>Admin review completed in 10–15 business days</span>
              </li>
            </ul>
          </div>

          <Link 
            to="/ngo/apply" 
            className="btn btn-primary" 
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Start NGO Verification Form</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>

      {/* Helpful info callout */}
      <div 
        style={{
          marginTop: '3rem',
          backgroundColor: '#FFF7ED',
          border: '1px solid #FED7AA',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <ShieldCheck size={36} color="#C2410C" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ color: '#9A3412', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Need Assistance or Have Questions?</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F' }}>
            Our admin team manually validates all tax-exempt certifications and Darpan IDs to ensure full compliance. If you already submitted an application, please allow 10–15 days for email notification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NGORegistration;
