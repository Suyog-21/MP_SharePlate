import React, { useState } from 'react';
const API_BASE = 'http://localhost:5000';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Loader2, 
  HelpCircle,
  Clock
} from 'lucide-react';

const NGOApplication = () => {
  const [formData, setFormData] = useState({
    name: '',
    ngoType: 'Trust',
    yearEstablished: '',
    registrationNumber: '',
    darpanId: '',
    panNumber: '',
    website: '',
    officialEmail: '',
    contactNumber: '',
    alternateContactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    repName: '',
    repDesignation: '',
    repContact: '',
    repEmail: '',
  });

  const [files, setFiles] = useState({
    registrationCertificate: null,
    panCard: null,
    addressProof: null,
    darpanProof: null,
    certificate12A_80G: null,
    fcraCertificate: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic size check (8MB)
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit.');
        return;
      }
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check mandatory documents
    if (!files.registrationCertificate || !files.panCard || !files.addressProof) {
      setError('Please upload all mandatory documents: Registration Certificate, PAN Card, and Address Proof.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      Object.keys(files).forEach((key) => {
        if (files[key]) {
          payload.append(key, files[key]);
        }
      });

      const res = await fetch(`${API_BASE}/api/ngo/apply`, {
        method: 'POST',
        credentials: 'include',
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSubmittedApp(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefId = () => {
    if (submittedApp?.applicationReferenceId) {
      navigator.clipboard.writeText(submittedApp.applicationReferenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESS SUBMISSION VIEW
  if (submittedApp) {
    return (
      <div className="container mt-8 animate-fade-in" style={{ maxWidth: '700px', paddingBottom: '4rem' }}>
        <div className="card text-center" style={{ borderTop: '6px solid #16A34A', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h1 style={{ fontSize: '2rem', color: '#14532D', marginBottom: '1rem' }}>
            Application Submitted Successfully!
          </h1>

          <div style={{
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            margin: '1.5rem 0 2rem 0',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Your Application Tracking Reference ID
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              <code style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', letterSpacing: '1px' }}>
                {submittedApp.applicationReferenceId}
              </code>
              <button
                onClick={copyRefId}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                title="Copy Reference ID"
              >
                {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: '#374151',
            maxWidth: '560px',
            margin: '0 auto 2.5rem auto',
            backgroundColor: '#FFF7ED',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FED7AA'
          }}>
            "Your NGO verification application has been successfully submitted. Our administration team will manually verify your documents and organization details. The verification process may take 10–15 days. You will receive an email once your application has been reviewed."
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              Return to Home
            </Link>
            <Link to="/register-ngo" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
              NGO Portal Info
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // APPLICATION FORM VIEW
  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '860px', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/register-ngo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to NGO Options</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 style={{ fontSize: '2.4rem', color: '#3E2723', marginBottom: '0.5rem' }}>
          NGO Verification Application
        </h1>
        <p style={{ color: '#6B4937', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Please provide complete and accurate regulatory information for verification. Note: active portal login is granted only after administrative document approval.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1: ORGANIZATION DETAILS */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <Building2 size={22} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#3E2723' }}>1. Organization Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Official NGO Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="As registered in legal documents"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                NGO Type <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                name="ngoType"
                className="form-control"
                value={formData.ngoType}
                onChange={handleInputChange}
                required
              >
                <option value="Trust">Trust</option>
                <option value="Society">Society</option>
                <option value="Section 8 Company">Section 8 Company</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Year of Establishment <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                name="yearEstablished"
                className="form-control"
                placeholder="e.g. 2015"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.yearEstablished}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                NGO Registration Number <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                className="form-control"
                placeholder="e.g. TR-2015/0987"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Organization PAN Number <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="panNumber"
                className="form-control"
                placeholder="e.g. AABCT1234F"
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                value={formData.panNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">NGO Darpan ID (Optional)</label>
              <input
                type="text"
                name="darpanId"
                className="form-control"
                placeholder="e.g. MH/2020/0251234"
                value={formData.darpanId}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website (Optional)</label>
              <input
                type="url"
                name="website"
                className="form-control"
                placeholder="https://example-ngo.org"
                value={formData.website}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT DETAILS */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <MapPin size={22} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#3E2723' }}>2. Contact Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Official Email Address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="email"
                name="officialEmail"
                className="form-control"
                placeholder="contact@example-ngo.org"
                value={formData.officialEmail}
                onChange={handleInputChange}
                required
              />
              <small style={{ color: '#6B7280', display: 'block', marginTop: '0.25rem' }}>
                Approval notices and the Registration ID will be delivered here.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Number <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Contact Number (Optional)</label>
              <input
                type="tel"
                name="alternateContactNumber"
                className="form-control"
                placeholder="+91 22 28470000"
                value={formData.alternateContactNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Registered Office Address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                placeholder="Building, street, landmark..."
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                City <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                State <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="state"
                className="form-control"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                PIN Code <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                placeholder="e.g. 400001"
                maxLength={6}
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: AUTHORIZED REPRESENTATIVE */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <UserCheck size={22} color="var(--primary-color)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#3E2723' }}>3. Authorized Representative</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Full Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="repName"
                className="form-control"
                placeholder="e.g. Dr. Ramesh Sharma"
                value={formData.repName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Designation <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                name="repDesignation"
                className="form-control"
                placeholder="e.g. Managing Trustee / Secretary"
                value={formData.repDesignation}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Number <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="tel"
                name="repContact"
                className="form-control"
                placeholder="+91 9820011223"
                value={formData.repContact}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="email"
                name="repEmail"
                className="form-control"
                placeholder="representative@example.org"
                value={formData.repEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DOCUMENTS UPLOAD */}
        <div className="card mb-6" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <Upload size={22} color="var(--primary-color)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#3E2723' }}>4. Verification Documents</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>Accepted formats: PDF, PNG, JPG (Max 8MB per document)</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Registration Certificate (Mandatory) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.registrationCertificate ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  NGO Registration Certificate <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {files.registrationCertificate && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'registrationCertificate')}
                required
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>Mandatory. Trust deed, Society cert., or Sec. 8 cert.</small>
            </div>

            {/* Organization PAN Card (Mandatory) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.panCard ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  Organization PAN Card <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {files.panCard && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'panCard')}
                required
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>Mandatory. Official PAN issued in entity's name.</small>
            </div>

            {/* Address Proof (Mandatory) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.addressProof ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  Registered Office Address Proof <span style={{ color: '#DC2626' }}>*</span>
                </label>
                {files.addressProof && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'addressProof')}
                required
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>Mandatory. Utility bill, rent agreement, or property deed.</small>
            </div>

            {/* NGO Darpan Proof (Optional) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.darpanProof ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                  NGO Darpan Certificate (Optional)
                </label>
                {files.darpanProof && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'darpanProof')}
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>NITI Aayog Darpan portal acknowledgement.</small>
            </div>

            {/* 12A / 80G Certificate (Optional) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.certificate12A_80G ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                  12A / 80G Certificate (Optional)
                </label>
                {files.certificate12A_80G && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'certificate12A_80G')}
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>Income Tax exemption registration certificate.</small>
            </div>

            {/* FCRA Certificate (Optional) */}
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: files.fcraCertificate ? '#F0FDF4' : '#FAFAFA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>
                  FCRA Certificate (Optional)
                </label>
                {files.fcraCertificate && <CheckCircle2 size={18} color="#16A34A" />}
              </div>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => handleFileChange(e, 'fcraCertificate')}
              />
              <small style={{ display: 'block', marginTop: '0.35rem', color: '#6B7280' }}>Foreign Contribution Regulation Act certification.</small>
            </div>

          </div>
        </div>

        {/* SUBMISSION NOTICE & BUTTON */}
        <div style={{
          backgroundColor: '#FFF7ED',
          border: '1px solid #FED7AA',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <Clock size={24} color="#C2410C" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#9A3412', fontSize: '0.95rem' }}>Manual Verification Notice</h4>
            <p style={{ margin: 0, color: '#78350F', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Applications are reviewed in 10–15 days by our administration team. Submitting this form does not immediately activate account login. Once approved, your Registration ID will be emailed to your official email.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Uploading Documents & Submitting Application...</span>
            </>
          ) : (
            <span>Submit Verification Application</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default NGOApplication;
