import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NGORegistration from './pages/NGORegistration';
import NGOActivation from './pages/NGOActivation';
import NGOApplication from './pages/NGOApplication';
import RestaurantDashboard from './pages/RestaurantDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Milestones from './pages/Milestones';

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
        Loading session...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user.role;
  const isMatch = allowedRoles.includes(userRole) ||
    (allowedRoles.includes('donor') && userRole === 'restaurant') ||
    (allowedRoles.includes('restaurant') && userRole === 'donor');

  if (!isMatch) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'ngo') return <Navigate to="/ngo" replace />;
    return <Navigate to="/restaurant" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/milestones" element={<Milestones />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          
          {/* Donor Registration */}
          <Route path="/register" element={<Register />} />
          <Route path="/register-donor" element={<Register />} />

          {/* NGO Registration & Activation */}
          <Route path="/register-ngo" element={<NGORegistration />} />
          <Route path="/ngo/activate" element={<NGOActivation />} />
          <Route path="/ngo/apply" element={<NGOApplication />} />

          {/* Role Protected Dashboards */}
          <Route 
            path="/restaurant" 
            element={
              <ProtectedRoute allowedRoles={['restaurant', 'donor']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute allowedRoles={['restaurant', 'donor']}>
                <RestaurantDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/ngo" 
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Chatbot />
      <Footer />
    </div>
  );
}

export default App;
