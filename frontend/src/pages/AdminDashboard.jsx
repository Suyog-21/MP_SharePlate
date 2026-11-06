import React, { useState, useEffect } from 'react';
const API_BASE = 'http://localhost:5000';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  ExternalLink, 
  Building2, 
  UserCheck, 
  MapPin, 
  KeyRound, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({ ALL: 0, PENDING: 0, UNDER_REVIEW: 0, VERIFIED: 0, REJECTED: 0 });
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ngo/applications?status=${activeFilter}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setCounts(data.counts || { ALL: 0, PENDING: 0, UNDER_REVIEW: 0, VERIFIED: 0, REJECTED: 0 });
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeFilter]);

  // Mark Under Review
  const handleMarkUnderReview = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ngo/applications/${id}/under-review`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionFeedback({ type: 'success', message: 'Status updated to UNDER_REVIEW.' });
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp(data.application);
      }
      fetchApplications();
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Application
  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this NGO? This will generate a Registration ID and send an approval notification email.')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ngo/applications/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionFeedback({
        type: 'success',
        message: `Approved! Registration ID: ${data.application.registrationId}. Sent to ${data.application.officialEmail}.`,
      });
      setSelectedApp(data.application);
      fetchApplications();
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Application
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ngo/applications/${selectedApp._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionFeedback({
        type: 'success',
        message: `Application rejected and notification sent to ${data.application.officialEmail}.`,
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApp(data.application);
      fetchApplications();
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list by search
  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.name?.toLowerCase().includes(q) ||
      app.officialEmail?.toLowerCase().includes(q) ||
      app.applicationReferenceId?.toLowerCase().includes(q) ||
      app.registrationNumber?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>PENDING</span>;
      case 'UNDER_REVIEW':
        return <span style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>UNDER REVIEW</span>;
      case 'VERIFIED':
        return <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFIED</span>;
      case 'REJECTED':
        return <span style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>REJECTED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="container mt-8 animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={18} />
            <span>PLATFORM ADMINISTRATION</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#1E293B', margin: 0 }}>
            NGO Verification Requests
          </h1>
          <p style={{ color: '#64748B', margin: '0.25rem 0 0 0' }}>
            Review legal documentation, perform background verification, and generate secure Registration IDs for approved non-profits.
          </p>
        </div>

        <button 
          onClick={fetchApplications}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionFeedback && (
        <div style={{
          backgroundColor: actionFeedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          border: `1px solid ${actionFeedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
          color: actionFeedback.type === 'success' ? '#166534' : '#991B1B',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{actionFeedback.message}</span>
          <button 
            onClick={() => setActionFeedback(null)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Requests', count: counts.ALL },
            { key: 'PENDING', label: 'Pending', count: counts.PENDING },
            { key: 'UNDER_REVIEW', label: 'Under Review', count: counts.UNDER_REVIEW },
            { key: 'VERIFIED', label: 'Verified', count: counts.VERIFIED },
            { key: 'REJECTED', label: 'Rejected', count: counts.REJECTED },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeFilter === tab.key ? '#1E293B' : '#F1F5F9',
                color: activeFilter === tab.key ? '#FFFFFF' : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: activeFilter === tab.key ? '#334155' : '#E2E8F0',
                color: activeFilter === tab.key ? '#FFFFFF' : '#475569',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search NGO name, ref ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: '1rem', fontSize: '0.9rem' }}
          />
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading NGO verification requests...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
            <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
            <h3>No verification requests found</h3>
            <p>No applications match the selected status filter or search criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Ref ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>NGO Name & Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Official Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>City, State</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Submitted</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>
                      <code>{app.applicationReferenceId}</code>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{app.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{app.ngoType} • Reg: {app.registrationNumber}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                      {app.officialEmail}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                      {app.city}, {app.state}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.85rem' }}>
                      {new Date(app.submissionTimestamp).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(app.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
                      >
                        <Eye size={14} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1E293B' }}>{selectedApp.name}</h2>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Reference: <code>{selectedApp.applicationReferenceId}</code> • Submitted: {new Date(selectedApp.submissionTimestamp).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94A3B8' }}
              >
                ×
              </button>
            </div>

            {/* Approval / Registration ID Info Banner */}
            {selectedApp.status === 'VERIFIED' && (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                    Assigned NGO Registration ID:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803D', letterSpacing: '1px' }}>
                    {selectedApp.registrationId}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                    Activation Status: <strong>{selectedApp.isRegistrationIdUsed ? 'Activated by NGO' : 'Unused (Awaiting NGO Activation)'}</strong>
                  </div>
                </div>
                {selectedApp.approvalDetails?.approvedAt && (
                  <div style={{ fontSize: '0.8rem', color: '#166534', textAlign: 'right' }}>
                    Approved on: {new Date(selectedApp.approvalDetails.approvedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {/* Rejection Info Banner */}
            {selectedApp.status === 'REJECTED' && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#991B1B'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>REJECTION REASON RECORDED:</div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedApp.rejectionDetails?.reason || 'No reason specified'}</p>
              </div>
            )}

            {/* Section 1: Organization Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                <Building2 size={16} color="#2563EB" />
                <span>Organization Information</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748B' }}>Entity Type:</span> <strong>{selectedApp.ngoType}</strong></div>
                <div><span style={{ color: '#64748B' }}>Year Established:</span> <strong>{selectedApp.yearEstablished}</strong></div>
                <div><span style={{ color: '#64748B' }}>Registration No:</span> <strong>{selectedApp.registrationNumber}</strong></div>
                <div><span style={{ color: '#64748B' }}>PAN Number:</span> <strong>{selectedApp.panNumber}</strong></div>
                <div><span style={{ color: '#64748B' }}>Darpan ID:</span> <strong>{selectedApp.darpanId || 'Not provided'}</strong></div>
                <div>
                  <span style={{ color: '#64748B' }}>Website:</span>{' '}
                  {selectedApp.website ? (
                    <a href={selectedApp.website} target="_blank" rel="noreferrer" style={{ color: '#2563EB' }}>
                      {selectedApp.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                <MapPin size={16} color="#2563EB" />
                <span>Contact & Registered Address</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748B' }}>Official Email:</span> <strong>{selectedApp.officialEmail}</strong></div>
                <div><span style={{ color: '#64748B' }}>Primary Phone:</span> <strong>{selectedApp.contactNumber}</strong></div>
                <div><span style={{ color: '#64748B' }}>Alternate Phone:</span> {selectedApp.alternateContactNumber || 'None'}</div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748B' }}>Address:</span> {selectedApp.address}, {selectedApp.city}, {selectedApp.state} - {selectedApp.pincode}</div>
              </div>
            </div>

            {/* Section 3: Authorized Representative */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                <UserCheck size={16} color="#2563EB" />
                <span>Authorized Representative</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748B' }}>Name:</span> <strong>{selectedApp.repName}</strong></div>
                <div><span style={{ color: '#64748B' }}>Designation:</span> <strong>{selectedApp.repDesignation}</strong></div>
                <div><span style={{ color: '#64748B' }}>Contact Phone:</span> <strong>{selectedApp.repContact}</strong></div>
                <div><span style={{ color: '#64748B' }}>Email:</span> <strong>{selectedApp.repEmail}</strong></div>
              </div>
            </div>

            {/* Section 4: Submitted Documents */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                <FileText size={16} color="#2563EB" />
                <span>Submitted Verification Documents</span>
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Registration Certificate (Mandatory)', doc: selectedApp.documents?.registrationCertificate },
                  { label: 'PAN Card (Mandatory)', doc: selectedApp.documents?.panCard },
                  { label: 'Address Proof (Mandatory)', doc: selectedApp.documents?.addressProof },
                  { label: 'Darpan Certificate', doc: selectedApp.documents?.darpanProof },
                  { label: '12A / 80G Certificate', doc: selectedApp.documents?.certificate12A_80G },
                  { label: 'FCRA Certificate', doc: selectedApp.documents?.fcraCertificate },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      backgroundColor: item.doc ? '#F8FAFC' : '#FAFAFA',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', wordBreak: 'break-all' }}>
                        {item.doc ? item.doc.originalName : 'Not submitted'}
                      </div>
                    </div>
                    {item.doc && (
                      <a
                        href={`${API_BASE}/api/admin/documents/${item.doc.fileName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem', alignSelf: 'flex-start' }}
                      >
                        <ExternalLink size={12} />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn btn-outline"
              >
                Close
              </button>

              {selectedApp.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleMarkUnderReview(selectedApp._id)}
                  disabled={actionLoading}
                  className="btn"
                  style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', border: '1px solid #BFDBFE' }}
                >
                  <Clock size={16} />
                  <span>Mark Under Review</span>
                </button>
              )}

              {selectedApp.status !== 'VERIFIED' && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="btn"
                    style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5' }}
                  >
                    <XCircle size={16} />
                    <span>Reject Application</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(selectedApp._id)}
                    disabled={actionLoading}
                    className="btn"
                    style={{ backgroundColor: '#16A34A', color: '#FFFFFF' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve & Issue Registration ID</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}>
            <h3 style={{ color: '#991B1B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={20} />
              <span>Reject NGO Application</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '1rem' }}>
              Please provide the official reason for rejection. This explanation will be included in the email notification sent to <strong>{selectedApp?.officialEmail}</strong>.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Rejection Reason <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="e.g. Incomplete address proof / Invalid PAN document provided / Organization Darpan registration does not match submitted name."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="btn"
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
