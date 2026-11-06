import React, { useState } from 'react';
const API_BASE = 'http://localhost:5000';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User, ShieldCheck, HeartHandshake, ChevronDown, Building2 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="container nav-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem' }}>
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          <Leaf size={28} className="nav-brand-icon" style={{ color: 'var(--primary-color)' }} />
          <span>SharePlate</span>
        </Link>

        <div className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)' })}
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)' })}
          >
            About Us
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)' })}
          >
            Contact Us
          </NavLink>
          <NavLink 
            to="/milestones" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)' })}
          >
            Milestones
          </NavLink>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!user ? (
            <div className="nav-auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Prominent Register as NGO button */}
              <Link 
                to="/register-ngo" 
                className="btn"
                style={{
                  backgroundColor: '#FFF7ED',
                  color: '#C2410C',
                  border: '1.5px solid #FDBA74',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Building2 size={16} />
                <span>Register as NGO</span>
              </Link>

              {/* Register as Donor */}
              <Link 
                to="/register" 
                className="btn"
                style={{
                  backgroundColor: 'var(--secondary-color)',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <HeartHandshake size={16} />
                <span>Register as Donor</span>
              </Link>

              {/* Login */}
              <Link 
                to="/login" 
                className="btn btn-outline"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="nav-user-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {(user.role === 'restaurant' || user.role === 'donor') && (
                <NavLink 
                  to="/restaurant" 
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                >
                  Donor Dashboard
                </NavLink>
              )}
              {user.role === 'ngo' && (
                <NavLink 
                  to="/ngo" 
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', borderColor: '#16a34a', color: '#16a34a' }}
                >
                  NGO Dashboard
                </NavLink>
              )}
              {user.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className="btn"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none' }}
                >
                  <ShieldCheck size={16} />
                  Admin Panel
                </NavLink>
              )}

              <div 
                className="nav-user-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#FFF7ED',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #FED7AA',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#9A3412'
                }}
              >
                <User size={15} />
                <span>{user.name}</span>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, background: '#FFEDD5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {user.role}
                </span>
              </div>

              <button 
                onClick={handleLogout} 
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: '#E5E7EB', color: '#6B7280' }}
                title="Logout"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
