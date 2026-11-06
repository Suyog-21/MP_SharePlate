import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, ShieldCheck, Users, Leaf, ArrowRight, Target, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="container mt-8" style={{ textAlign: 'center', padding: '3.5rem 1rem 2rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFEDD5', color: '#9A3412', border: '1px solid #FED7AA', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <Leaf size={18} color="#EA580C" />
          <span>Our Mission & Story</span>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.25rem', color: '#3E2723' }}>
          Rescuing Food. <span style={{ color: '#EA580C' }}>Nourishing Communities.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', color: '#6B4937', lineHeight: 1.7 }}>
          SharePlate was built on a simple belief: good food belongs on plates, not in landfills. 
          We connect surplus food from restaurants, bakeries, and caterers directly with local NGOs and shelters in real-time.
        </p>
      </section>

      {/* Mission & Vision Cards */}
      <section className="container mt-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #EA580C', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#EA580C' }}>
              <Target size={32} />
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#3E2723' }}>Our Mission</h2>
            </div>
            <p style={{ color: '#6B4937', lineHeight: 1.7 }}>
              To eliminate hunger and cut carbon emissions simultaneously by building an ultra-fast, 
              hyper-local digital bridge between food donors and frontline charitable organizations.
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #4A2810', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#4A2810' }}>
              <Sparkles size={32} />
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#3E2723' }}>Our Vision</h2>
            </div>
            <p style={{ color: '#6B4937', lineHeight: 1.7 }}>
              A world where surplus food distribution is completely automated, transparent, and seamless, 
              ensuring that no edible meal ever goes to waste in any community we serve.
            </p>
          </div>
        </div>
      </section>

      {/* The Food Waste Crisis & Solution */}
      <section className="container mt-8">
        <div className="card" style={{ padding: '2.5rem', background: '#FFFDF9', border: '1px solid #EEDFD0' }}>
          <h2 className="text-center mb-4" style={{ fontSize: '2rem', color: '#3E2723' }}>Why SharePlate Exists</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EA580C', marginBottom: '0.5rem' }}>1.3B+</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#3E2723' }}>Tons of Food Wasted</h3>
              <p style={{ fontSize: '0.95rem', color: '#6B4937' }}>Globally, one-third of all food produced is wasted while 800+ million people face hunger daily.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D97706', marginBottom: '0.5rem' }}>10%</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#3E2723' }}>Global GHG Emissions</h3>
              <p style={{ fontSize: '0.95rem', color: '#6B4937' }}>Food rotting in landfills produces methane, a greenhouse gas 25x more potent than carbon dioxide.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4A2810', marginBottom: '0.5rem' }}>&lt; 30 min</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#3E2723' }}>Average Match Time</h3>
              <p style={{ fontSize: '0.95rem', color: '#6B4937' }}>SharePlate notifies verified NGOs instantly, enabling same-evening hot meal pickups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container mt-8">
        <h2 className="text-center mb-8" style={{ fontSize: '2.2rem', color: '#3E2723' }}>Our Core Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          <div className="card text-center" style={{ padding: '2rem 1.5rem', borderTop: '4px solid #EA580C' }}>
            <div style={{ color: '#EA580C', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={40} />
            </div>
            <h3 style={{ color: '#3E2723' }}>Safety First</h3>
            <p style={{ color: '#6B4937' }}>Strict verification protocols ensure all donated food adheres to local health and hygiene standards.</p>
          </div>

          <div className="card text-center" style={{ padding: '2rem 1.5rem', borderTop: '4px solid #D97706' }}>
            <div style={{ color: '#D97706', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Heart size={40} />
            </div>
            <h3 style={{ color: '#3E2723' }}>Dignity & Care</h3>
            <p style={{ color: '#6B4937' }}>Every person deserves access to fresh, nutritious, and wholesome food provided with dignity.</p>
          </div>

          <div className="card text-center" style={{ padding: '2rem 1.5rem', borderTop: '4px solid #4A2810' }}>
            <div style={{ color: '#4A2810', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Users size={40} />
            </div>
            <h3 style={{ color: '#3E2723' }}>Community Powered</h3>
            <p style={{ color: '#6B4937' }}>Empowering local restaurant managers, NGO volunteers, and citizens to collaborate effortlessly.</p>
          </div>

          <div className="card text-center" style={{ padding: '2rem 1.5rem', borderTop: '4px solid #78350F' }}>
            <div style={{ color: '#78350F', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Globe size={40} />
            </div>
            <h3 style={{ color: '#3E2723' }}>Sustainability</h3>
            <p style={{ color: '#6B4937' }}>Actively lowering the environmental footprint of our food supply chain one meal at a time.</p>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="container mt-8" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', padding: '3.5rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid #FED7AA' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: '#4A2810' }}>Ready to Partner With Us?</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.1rem', color: '#78350F' }}>
          Whether you run a kitchen with surplus meals or manage an NGO feeding those in need, your participation changes lives.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', backgroundColor: '#EA580C', borderColor: '#EA580C' }}>
            Join as a Partner <ArrowRight size={18} />
          </Link>
          <Link to="/contact" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', borderColor: '#4A2810', color: '#4A2810', backgroundColor: '#FFFFFF' }}>
            Contact Our Team
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
