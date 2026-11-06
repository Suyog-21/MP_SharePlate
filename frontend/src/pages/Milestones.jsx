import React from 'react';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, Heart, Globe, Users, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';

const Milestones = () => {
  const milestonesList = [
    {
      period: 'Phase 1 • Early 2026',
      title: 'Platform Foundation & Pilot Launch',
      description: 'Launched SharePlate in our first metro hub with 5 pilot restaurants and 2 community shelters. Successfully rescued over 500 meals in the first 30 days.',
      status: 'Completed',
      metric: '500+ meals rescued'
    },
    {
      period: 'Phase 2 • Spring 2026',
      title: 'Real-Time Notification Engine',
      description: 'Built proximity-based matching algorithms notifying NGOs within a 5-mile radius within seconds of a restaurant posting surplus food.',
      status: 'Completed',
      metric: '< 25 min claim time'
    },
    {
      period: 'Phase 3 • Summer 2026',
      title: '10,000 Meals Saved Milestone',
      description: 'Expanded network to 50+ restaurant partners and onboarded 20 accredited NGOs. Introduced digital chain-of-custody verification.',
      status: 'Completed',
      metric: '10,000 meals reached'
    },
    {
      period: 'Phase 4 • Fall 2026',
      title: 'CO2 & ESG Environmental Reporting',
      description: 'Introduced automated environmental impact dashboards for donor restaurants to track avoided carbon emissions and tax-deductible contributions.',
      status: 'Completed',
      metric: '15 tons CO2 saved'
    },
    {
      period: 'Present • Current Milestone',
      title: '50,000+ Meals & City-Wide Scale',
      description: 'Surpassed 50,000 meals delivered! Over 120 restaurant kitchens and 45 certified NGO relief organizations now actively use SharePlate every week.',
      status: 'Achieved',
      metric: '50,000+ meals delivered'
    },
    {
      period: 'Upcoming • 2027 Horizon',
      title: 'Target: 250,000 Meals & Cold-Chain Support',
      description: 'Scaling to neighboring regional districts, introducing refrigerated volunteer dispatch, and partnering with university cafeterias and corporate dining halls.',
      status: 'In Progress',
      metric: '250K target goal'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="container mt-8" style={{ textAlign: 'center', padding: '3.5rem 1rem 2rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFEDD5', color: '#9A3412', border: '1px solid #FED7AA', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <Award size={18} color="#EA580C" />
          <span>Our Journey & Growth</span>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.25rem', color: '#3E2723' }}>
          Milestones & <span style={{ color: '#EA580C' }}>Impact</span>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', color: '#6B4937', lineHeight: 1.7 }}>
          Every milestone represents hungry families fed, edible food saved from landfills, and a greener, more compassionate community.
        </p>
      </section>

      {/* Impact Counters Grid */}
      <section className="container mt-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card text-center" style={{ borderTop: '4px solid #EA580C', padding: '2rem 1rem' }}>
            <div style={{ color: '#EA580C', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Utensils size={36} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3E2723' }}>52,400+</div>
            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem', color: '#3E2723' }}>Meals Saved</h3>
            <p style={{ fontSize: '0.875rem', margin: 0, color: '#6B4937' }}>Fresh food served to community members</p>
          </div>

          <div className="card text-center" style={{ borderTop: '4px solid #4A2810', padding: '2rem 1rem' }}>
            <div style={{ color: '#4A2810', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Users size={36} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3E2723' }}>120+</div>
            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem', color: '#3E2723' }}>Restaurant Donors</h3>
            <p style={{ fontSize: '0.875rem', margin: 0, color: '#6B4937' }}>Active partner kitchens & bakeries</p>
          </div>

          <div className="card text-center" style={{ borderTop: '4px solid #D97706', padding: '2rem 1rem' }}>
            <div style={{ color: '#D97706', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Heart size={36} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3E2723' }}>45+</div>
            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem', color: '#3E2723' }}>NGO Partners</h3>
            <p style={{ fontSize: '0.875rem', margin: 0, color: '#6B4937' }}>Verified food banks & local shelters</p>
          </div>

          <div className="card text-center" style={{ borderTop: '4px solid #78350F', padding: '2rem 1rem' }}>
            <div style={{ color: '#78350F', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Globe size={36} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3E2723' }}>28.5 t</div>
            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem', color: '#3E2723' }}>CO2 Offset</h3>
            <p style={{ fontSize: '0.875rem', margin: 0, color: '#6B4937' }}>Equivalent greenhouse emissions diverted</p>
          </div>

        </div>
      </section>

      {/* Timeline Section */}
      <section className="container mt-8">
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <h2 className="text-center mb-8" style={{ fontSize: '2.2rem', color: '#3E2723' }}>Growth & Timeline</h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {milestonesList.map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    minWidth: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: item.status === 'In Progress' ? '#FEF3C7' : '#FFEDD5',
                    color: item.status === 'In Progress' ? '#92400E' : '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    marginTop: '0.2rem',
                    border: item.status === 'In Progress' ? '1px solid #FDE68A' : '1px solid #FED7AA'
                  }}
                >
                  {item.status === 'Completed' || item.status === 'Achieved' ? (
                    <CheckCircle2 size={24} color="#EA580C" />
                  ) : (
                    <TrendingUp size={24} color="#92400E" />
                  )}
                </div>

                <div style={{ flex: 1, background: '#FFFDF9', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #EEDFD0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.period}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '9999px',
                        fontWeight: 600,
                        backgroundColor: item.status === 'In Progress' ? '#FEF3C7' : '#FFEDD5',
                        color: item.status === 'In Progress' ? '#92400E' : '#9A3412',
                        border: item.status === 'In Progress' ? '1px solid #FDE68A' : '1px solid #FED7AA'
                      }}
                    >
                      {item.metric}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#3E2723' }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, color: '#6B4937', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="container mt-8" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid #FED7AA' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#4A2810' }}>Be Part of Our Next Milestone</h2>
        <p style={{ maxWidth: '650px', margin: '0 auto 1.5rem auto', color: '#78350F' }}>
          Help us achieve 250,000 meals delivered by 2027. Sign up today or support our food rescue network!
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', backgroundColor: '#EA580C', borderColor: '#EA580C' }}>
          Join the Mission <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default Milestones;
