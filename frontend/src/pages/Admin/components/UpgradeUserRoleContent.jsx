import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUpgradeRequestsAPI, approveUpgradeRequestAPI, rejectUpgradeRequestAPI } from '../../../services/admin';
import { FaCheck, FaTimes, FaUserCheck, FaInfoCircle, FaCheckCircle, FaSearch, FaFilter, FaCalendarAlt, FaEnvelope, FaPhoneAlt, FaIdCard, FaFileAlt } from 'react-icons/fa';

const mockRequests = [
  {
    id: 10001,
    fullName: "John Chen",
    userEmail: "quan.tm@gmail.com",
    requestedRole: "JOCKEY",
    status: "PENDING",
    phoneNumber: "0912345678",
    dateOfBirth: "1998-08-20",
    identityNumber: "030098001234",
    weight: 55,
    height: 165,
    licenseNumber: "JC-88291",
    notes: "I have 3 years of experience in amateur horse racing.",
    documentUrls: ["https://images.unsplash.com/photo-1598974357801-cbca100e6563?q=80&w=600"],
    createdAt: "2026-06-30T10:00:00"
  },
  {
    id: 10002,
    fullName: "Larry Cole",
    userEmail: "long.lh@yahoo.com",
    requestedRole: "HORSE_OWNER",
    status: "PENDING",
    phoneNumber: "0988776655",
    dateOfBirth: "1985-03-12",
    identityNumber: "010085005678",
    stableName: "Golden Stallion Farm",
    stableAddress: "Ba Vi, Hanoi",
    notes: "Want to join to register 3 purebred stallions from the farm.",
    documentUrls: ["https://images.unsplash.com/photo-1500622388414-83557fb959a0?q=80&w=600"],
    createdAt: "2026-06-29T14:30:00"
  },
  {
    id: 10003,
    fullName: "Peter Pham",
    userEmail: "hai.pt@outlook.com",
    requestedRole: "RACE_REFEREE",
    status: "PENDING",
    phoneNumber: "0909090909",
    dateOfBirth: "1978-11-05",
    identityNumber: "020078009876",
    certificationNumber: "REF-992-BA",
    experienceYears: 8,
    notes: "Former national athletics referee switching to horse racing.",
    documentUrls: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600"],
    createdAt: "2026-06-28T09:15:00"
  },
  {
    id: 10004,
    fullName: "Mary Nguyen",
    userEmail: "mai.nt@gmail.com",
    requestedRole: "JOCKEY",
    status: "APPROVED",
    phoneNumber: "0977665544",
    dateOfBirth: "2000-01-25",
    identityNumber: "035000012345",
    weight: 48,
    height: 158,
    licenseNumber: "JC-11029",
    notes: "Hope to be approved soon to register for the summer tournament.",
    createdAt: "2026-06-25T08:00:00"
  },
  {
    id: 10005,
    fullName: "Vincent Vu",
    userEmail: "thanh.vd@hotmail.com",
    requestedRole: "HORSE_OWNER",
    status: "REJECTED",
    phoneNumber: "0966554433",
    dateOfBirth: "1990-12-10",
    identityNumber: "018090009876",
    stableName: "Thanh Farms",
    stableAddress: "Cu Chi, HCMC",
    notes: "Registering as horse owner.",
    rejectionReason: "Farm address information does not match business registration.",
    createdAt: "2026-06-24T16:00:00"
  }
];

export default function UpgradeUserRoleContent() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ show: false, requestId: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ show: false, requestId: null });
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUpgradeRequestsAPI();
      if (!data || data.length === 0) {
        setRequests(mockRequests);
      } else {
        setRequests(data);
      }
    } catch (err) {
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = (id) => {
    setApproveModal({ show: true, requestId: id });
  };

  const handleApproveConfirm = async () => {
    const id = approveModal.requestId;
    setApproveModal({ show: false, requestId: null });
    setError('');
    setSuccess('');
    try {
      if (id >= 10000) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
        setSuccess('Successfully approved role upgrade request! (Mock Data)');
        return;
      }
      await approveUpgradeRequestAPI(id);
      setSuccess('Successfully approved role upgrade request!');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Could not approve request.');
    }
  };

  const handleRejectClick = (id) => {
    setRejectionModal({ show: true, requestId: id, reason: '' });
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionModal.reason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const id = rejectionModal.requestId;
      if (id >= 10000) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED', rejectionReason: rejectionModal.reason.trim() } : r));
        setSuccess('Rejected role upgrade request. (Mock Data)');
        setRejectionModal({ show: false, requestId: null, reason: '' });
        return;
      }
      await rejectUpgradeRequestAPI(id, rejectionModal.reason.trim());
      setSuccess('Rejected role upgrade request.');
      setRejectionModal({ show: false, requestId: null, reason: '' });
      loadRequests();
    } catch (err) {
      setError(err.message || 'Could not reject request.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesSearch =
      (req.fullName || req.userFullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.requestedRole || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>

      {/* Page Styles */}
      <style>{`
        .doc-gallery {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .doc-thumbnail {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid var(--ho-border-gold);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .doc-thumbnail:hover {
          transform: scale(1.05);
        }
        .details-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px 16px;
          background: rgba(0, 56, 32, 0.02);
          border: 1px solid var(--ho-border-muted);
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 10px;
          font-size: 13px;
        }
        .details-label {
          font-weight: 700;
          color: var(--ho-primary-dark);
          text-align: left;
        }
        .details-value {
          color: var(--ho-text-dark);
          text-align: left;
          font-weight: 500;
        }
      `}</style>

      {/* Title */}
      <div className="mb-4">
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUserCheck style={{ color: 'var(--ho-accent-gold-text)' }} /> Role Upgrade Requests
        </h2>
        <p className="text-secondary small m-0">
          Review personal info, credentials, and approve or reject role upgrade requests.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FaCheckCircle style={{ color: '#10b981' }} /> {success}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card mb-4 p-3 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-stretch align-items-md-center" style={{ border: '1px solid var(--ho-border-gold)' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ho-primary-medium)', opacity: 0.7 }} />
          <input
            type="text"
            className="ho-form-input text-dark fw-semibold"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', fontSize: '14px', height: '42px' }}
          />
        </div>

        {/* Status Filter */}
        <div className="d-flex align-items-center gap-2" style={{ flex: '0 0 auto' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ho-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            <FaFilter className="me-1" /> Status:
          </span>
          <select
            className="ho-form-input text-dark fw-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '14px', minWidth: '180px', height: '42px', paddingRight: '24px' }}
          >
            <option value="PENDING">Pending (PENDING)</option>
            <option value="APPROVED">Approved (APPROVED)</option>
            <option value="REJECTED">Rejected (REJECTED)</option>
            <option value="ALL">All Requests</option>
          </select>
        </div>

      </div>

      {/* Requests Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--ho-text-muted)' }}>Loading upgrade request list...</div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
          No role upgrade requests found.
        </div>
      ) : (
        <div className="row g-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="col-12 col-lg-6">
              <div className="glass-card h-100 d-flex flex-column justify-content-between" style={{ border: '1px solid var(--ho-border-gold)', padding: '24px' }}>

                {/* Request Header */}
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="ho-font-epilogue fs-5 fw-bold text-dark mb-1">{req.fullName || req.userFullName || 'Member'}</h4>
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <FaEnvelope size="11" /> <span>{req.userEmail}</span>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: req.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : req.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(252, 211, 77, 0.15)',
                      color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : 'var(--ho-accent-gold-text)',
                      border: '1px solid var(--ho-border-gold)'
                    }}>
                      {req.status}
                    </span>
                  </div>

                  {/* Transition path */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>SPECTATOR</span>
                    <span className="text-secondary">&rarr;</span>
                    <span className="badge bg-primary text-uppercase" style={{ fontSize: '10px' }}>
                      {req.requestedRole?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="details-grid">
                    <span className="details-label"><FaPhoneAlt size="11" className="me-1" /> Phone:</span>
                    <span className="details-value">{req.phoneNumber || 'N/A'}</span>

                    <span className="details-label"><FaCalendarAlt size="11" className="me-1" /> Date of Birth:</span>
                    <span className="details-value">{req.dateOfBirth || 'N/A'}</span>

                    <span className="details-label"><FaIdCard size="11" className="me-1" /> ID/Passport:</span>
                    <span className="details-value">{req.identityNumber || 'N/A'}</span>

                    {/* Conditional Role Details */}
                    {req.requestedRole === 'JOCKEY' && (
                      <>
                        <span className="details-label">Weight:</span>
                        <span className="details-value">{req.weight ? `${req.weight} kg` : 'N/A'}</span>

                        <span className="details-label">Height:</span>
                        <span className="details-value">{req.height ? `${req.height} cm` : 'N/A'}</span>

                        <span className="details-label">Jockey License:</span>
                        <span className="details-value">{req.licenseNumber || 'N/A'}</span>
                      </>
                    )}

                    {req.requestedRole === 'HORSE_OWNER' && (
                      <>
                        <span className="details-label">Stable Name:</span>
                        <span className="details-value">{req.stableName || 'N/A'}</span>

                        <span className="details-label">Stable Address:</span>
                        <span className="details-value">{req.stableAddress || 'N/A'}</span>
                      </>
                    )}

                    {req.requestedRole === 'RACE_REFEREE' && (
                      <>
                        <span className="details-label">Certificate Number:</span>
                        <span className="details-value">{req.certificationNumber || 'N/A'}</span>

                        <span className="details-label">Experience:</span>
                        <span className="details-value">{req.experienceYears !== null ? `${req.experienceYears} years` : 'N/A'}</span>
                      </>
                    )}

                    {req.notes && (
                      <>
                        <span className="details-label" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '8px', marginTop: '4px' }}>Attached Notes:</span>
                        <span className="details-value" style={{ gridColumn: 'span 2', color: 'var(--ho-text-muted)', fontStyle: 'italic', fontSize: '13px' }}>
                          "{req.notes}"
                        </span>
                      </>
                    )}

                    {req.rejectionReason && (
                      <>
                        <span className="details-label text-danger" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '8px', marginTop: '4px' }}>Rejection Reason:</span>
                        <span className="details-value text-danger" style={{ gridColumn: 'span 2', fontStyle: 'italic', fontSize: '13px' }}>
                          "{req.rejectionReason}"
                        </span>
                      </>
                    )}
                  </div>

                  {/* Documents & Credentials */}
                  {req.documentUrls && req.documentUrls.length > 0 && (
                    <div className="mt-3">
                      <span className="ho-input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', margin: 0 }}><FaFileAlt /> Verification Documents:</span>
                      <div className="doc-gallery">
                        {req.documentUrls.map((url, idx) => {
                          const imgSrc = url && url.startsWith('http') ? url : `http://localhost:8080${url}`;
                          return (
                            <img
                              key={idx}
                              src={imgSrc}
                              alt={`certificate-${idx}`}
                              className="doc-thumbnail"
                              onClick={() => {
                                setLightboxImage(imgSrc);
                                setIsZoomedIn(false);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Only show for PENDING status) */}
                {req.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--ho-border-muted)', paddingTop: '15px' }}>
                    <button
                      onClick={() => handleRejectClick(req.id)}
                      className="btn btn-outline-danger btn-sm fw-bold"
                      style={{ flex: 1, height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaTimes /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="btn btn-success btn-sm fw-bold"
                      style={{ flex: 1, height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <FaCheck /> Approve
                    </button>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && createPortal(
        <div
          onClick={() => {
            setLightboxImage(null);
            setIsZoomedIn(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'none',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            overflow: 'auto'
          }}
        >
          <img
            src={lightboxImage}
            alt="certificate-lightbox"
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain', 
              borderRadius: '8px', 
              border: '2px solid var(--ho-border-gold, #D4AF37)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
              transform: isZoomedIn ? 'scale(1.6)' : 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomedIn(!isZoomedIn);
            }}
          />
        </div>,
        document.body
      )}

      {/* Approve Confirmation Modal */}
      {approveModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setApproveModal({ show: false, requestId: null })}
        >
          <div
            className="glass-card text-center"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '12px' }}>
                Confirm Approval
              </h3>

              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to approve this role upgrade request? This action will grant a new role to the member.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, requestId: null })}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '8px 20px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', borderRadius: '8px' }}
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Reason Modal */}
      {rejectionModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setRejectionModal({ show: false, requestId: null, reason: '' })}
        >
          <form
            onSubmit={handleRejectSubmit}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '10px', margin: 0 }}>
              Reject Upgrade Request
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Rejection Reason *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="4"
                required
                placeholder="Enter detailed reason to notify the user..."
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setRejectionModal({ show: false, requestId: null, reason: '' })}
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Reject Request
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
