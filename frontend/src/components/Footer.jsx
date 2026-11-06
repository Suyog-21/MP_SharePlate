import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#261308', color: '#D6C0B0', padding: '3.5rem 0 2rem 0', marginTop: 'auto', borderTop: '2px solid #4A2810' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FF8C00', fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.85rem' }}>
            <Leaf size={22} color="#FF8C00" />
            <span>SharePlate</span>
          </div>
          <p style={{ color: '#BBA494', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Empowering restaurants and NGOs to eliminate food waste and fight hunger through real-time donation matching.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#FED7AA', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Home</Link></li>
            <li><Link to="/about" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>About Us</Link></li>
            <li><Link to="/milestones" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Milestones</Link></li>
            <li><Link to="/contact" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FED7AA', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Get Involved</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/register" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Register Restaurant</Link></li>
            <li><Link to="/register" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Register NGO</Link></li>
            <li><Link to="/login" style={{ color: '#EAD8CB', transition: 'color 0.2s' }}>Account Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FED7AA', fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Rescue</h4>
          <p style={{ color: '#BBA494', fontSize: '0.875rem', lineHeight: 1.5 }}>
            24/7 Food Rescue Hotline:<br />
            <strong style={{ color: '#FF8C00', fontSize: '1.05rem' }}>1-800-SHARE-FOOD</strong>
          </p>
          <p style={{ color: '#BBA494', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            support@shareplate.org
          </p>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid #442412', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#9E8575' }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} SharePlate. Built with care to end food waste.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
