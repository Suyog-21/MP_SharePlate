import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'restaurant',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'restaurant',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="container mt-8" style={{ textAlign: 'center', padding: '3.5rem 1rem 2rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFEDD5', color: '#9A3412', border: '1px solid #FED7AA', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <MessageSquare size={18} color="#EA580C" />
          <span>We're Here to Help</span>
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.25rem', color: '#3E2723' }}>
          Contact <span style={{ color: '#EA580C' }}>SharePlate</span>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '750px', margin: '0 auto', color: '#6B4937', lineHeight: 1.7 }}>
          Whether you're a food business wanting to reduce waste, an NGO looking for meals, or a volunteer wanting to support us, we’d love to connect.
        </p>
      </section>

      {/* Main Grid: Form + Info Cards */}
      <section className="container mt-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          
          {/* Form Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: '#3E2723' }}>Send Us a Message</h2>

            {submitted && (
              <div 
                style={{ 
                  backgroundColor: '#FFEDD5', 
                  border: '1px solid #FED7AA', 
                  color: '#9A3412', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle2 size={22} color="#EA580C" />
                <div>
                  <strong>Thank you!</strong> Your message has been sent. Our team will get back to you within 24 hours.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name"
                  name="name" 
                  className="form-control" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email" 
                    className="form-control" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone" 
                    className="form-control" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="type">I represent a...</label>
                <select 
                  id="type"
                  name="type" 
                  className="form-control" 
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="restaurant">Restaurant / Eatery / Cafe</option>
                  <option value="ngo">NGO / Charity / Food Bank</option>
                  <option value="caterer">Event Caterer / Bakery</option>
                  <option value="volunteer">Volunteer / Citizen</option>
                  <option value="partner">Corporate / CSR Partner</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject"
                  name="subject" 
                  className="form-control" 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we assist you?"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">Message *</label>
                <textarea 
                  id="message"
                  name="message" 
                  rows="4" 
                  className="form-control" 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your questions or requirements..."
                  style={{ resize: 'vertical' }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  fontSize: '1rem',
                  backgroundColor: '#EA580C',
                  borderColor: '#EA580C'
                }}
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

          {/* Info Side Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#3E2723' }}>Contact Information</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: '#FFEDD5', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#EA580C' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#3E2723' }}>Email Support</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>support@shareplate.org</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>partnerships@shareplate.org</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: '#FED7AA', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#9A3412' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#3E2723' }}>Hotlines</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>Emergency Rescue: 1-800-SHARE-FOOD</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>Direct: +1 (555) 742-7300</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: '#EEDFD0', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#4A2810' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#3E2723' }}>Headquarters</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>
                      SharePlate Foundation<br />
                      45 Sustainability Way, Suite 300<br />
                      Metro Food Hub, NY 10001
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: '#FEF3C7', padding: '0.6rem', borderRadius: 'var(--radius-md)', color: '#78350F' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#3E2723' }}>Operational Hours</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>Surplus Rescue Platform: 24/7/365</div>
                    <div style={{ color: '#6B4937', fontSize: '0.9rem' }}>Office Team: Mon - Sat, 8am - 8pm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="card" style={{ padding: '1.75rem', background: '#FFFDF9', border: '1px solid #EEDFD0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#3E2723' }}>
                <HelpCircle size={20} color="#EA580C" />
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#3E2723' }}>Quick Answers</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <strong style={{ color: '#4A2810' }}>Is SharePlate free for NGOs?</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#6B4937' }}>Yes, 100% free forever for verified non-profit partners.</p>
                </div>
                <div>
                  <strong style={{ color: '#4A2810' }}>How quickly is food picked up?</strong>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#6B4937' }}>Most claims happen in under 30 minutes with typical pickups within 1-2 hours.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};

export default Contact;
