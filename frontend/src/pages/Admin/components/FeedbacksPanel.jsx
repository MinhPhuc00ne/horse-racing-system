import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaTimes, FaSearch, FaCommentDots, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaUser, FaEnvelope, FaTag, FaBan } from 'react-icons/fa';
import { getAdminFeedbacksAPI, resolveFeedbackAPI, rejectFeedbackAPI } from '../../../services/feedback';

export default function FeedbacksPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  // Success / Error Modals State
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Interaction Modals State
  const [detailModal, setDetailModal] = useState({
    show: false,
    feedback: null
  });

  const [resolveModal, setResolveModal] = useState({
    show: false,
    feedbackId: null,
    actionType: 'RESOLVE', // 'RESOLVE' or 'REJECT'
    note: ''
  });

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminFeedbacksAPI({
        status: statusFilter,
        role: roleFilter,
        search: searchTerm
      });
      setFeedbacks(data);
    } catch (err) {
      setErrorModalMessage(err.message || 'Could not load feedback list.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter, searchTerm]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Handle resolving or rejecting a feedback
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    const id = resolveModal.feedbackId;
    const note = resolveModal.note;
    const actionType = resolveModal.actionType;

    if (!note.trim()) {
      setErrorModalMessage('Please enter processing notes / feedback reason.');
      return;
    }

    try {
      setResolving(true);
      if (actionType === 'REJECTED') {
        await rejectFeedbackAPI(id, note.trim());
        setSuccessModalMessage('Feedback has been rejected and notification sent to user!');
      } else {
        await resolveFeedbackAPI(id, note.trim());
        setSuccessModalMessage('Feedback has been resolved and note saved successfully!');
      }
      setResolveModal({ show: false, feedbackId: null, actionType: 'RESOLVED', note: '' });
      fetchFeedbacks();
    } catch (err) {
      setErrorModalMessage(err.message || 'Action failed.');
    } finally {
      setResolving(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'JOCKEY': return 'Jockey';
      case 'HORSE_OWNER': return 'Owner';
      case 'RACE_REFEREE': return 'Referee';
      case 'SPECTATOR': return 'Spectator';
      case 'ADMIN': return 'Admin';
      default: return role || 'N/A';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'JOCKEY': return '#3b82f6';
      case 'HORSE_OWNER': return '#8b5cf6';
      case 'RACE_REFEREE': return '#ec4899';
      case 'SPECTATOR': return '#10b981';
      case 'ADMIN': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            REJECTED
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--ho-accent-gold-text)' }}>
            PENDING
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCommentDots style={{ color: 'var(--ho-accent-gold-text)' }} /> Receive & Respond to Feedback (Feedbacks)
        </h2>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card mb-2 p-3" style={{ border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
        <div className="row g-3">
          {/* Search Term */}
          <div className="col-12 col-md-5">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Feedback</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ho-form-input text-dark fw-semibold"
                placeholder="Search by name, email, subject, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '13px', height: '38px', paddingLeft: '35px' }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ho-text-muted)', fontSize: '14px' }} />
            </div>
          </div>

          {/* Role Filter */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sender Role</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">All Roles</option>
              <option value="JOCKEY">Jockey</option>
              <option value="HORSE_OWNER">Owner</option>
              <option value="RACE_REFEREE">Referee</option>
              <option value="SPECTATOR">Spectator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-md-2">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">All</option>
              <option value="PENDING">Pending (PENDING)</option>
              <option value="RESOLVED">Resolved (RESOLVED)</option>
              <option value="REJECTED">Rejected (REJECTED)</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 fw-bold d-flex align-items-center justify-content-center"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
              style={{ height: '38px', fontSize: '13px', borderRadius: '8px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Feedback List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Feedback List ({feedbacks.length})
        </h3>

        <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Feedback ID</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Contributor</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Role</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Subject</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Submit Time</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '600' }}>
                    Loading feedback data...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--ho-text-muted)' }}>
                    No feedback recorded matches the filters.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr key={fb.id} style={{ borderBottom: '1px solid var(--ho-border-muted)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{fb.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--ho-text-dark)', fontWeight: '600' }}>{fb.userFullName || 'Anonymous'}</span>
                        <span style={{ color: 'var(--ho-text-muted)', fontSize: '12px' }}>{fb.userEmail || ''}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: `${getRoleColor(fb.userRole)}20`,
                        color: getRoleColor(fb.userRole),
                        border: `1px solid ${getRoleColor(fb.userRole)}40`
                      }}>
                        {getRoleLabel(fb.userRole)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500', color: 'var(--ho-text-dark)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fb.subject}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--ho-text-muted)' }}>
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleString('en-US') : 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getStatusBadge(fb.status)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setDetailModal({ show: true, feedback: fb })}
                          className="btn btn-outline-secondary btn-sm fw-bold"
                          style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          Details
                        </button>
                        {fb.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => setResolveModal({ show: true, feedbackId: fb.id, actionType: 'RESOLVED', note: '' })}
                              className="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                              style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
                            >
                              <FaCheck size="10" /> Resolve
                            </button>
                            <button
                              onClick={() => setResolveModal({ show: true, feedbackId: fb.id, actionType: 'REJECTED', note: '' })}
                              className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1"
                              style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
                            >
                              <FaBan size="10" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal */}
      {successModalMessage && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setSuccessModalMessage('')}
        >
          <div
            className="glass-card text-center"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '30px 24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: '1px solid #10b981',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#10b981'
                }}
              >
                <FaCheckCircle size="30" />
              </div>

              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: 'var(--ho-primary-dark, #003820)' }}>
                Success!
              </h3>

              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {successModalMessage}
              </p>

              <button
                type="button"
                onClick={() => setSuccessModalMessage('')}
                className="btn btn-success fw-bold w-100"
                style={{ marginTop: '10px', padding: '10px', fontSize: '14px', borderRadius: '8px' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Modal */}
      {errorModalMessage && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setErrorModalMessage('')}
        >
          <div
            className="glass-card text-center"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '30px 24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: '1px solid #ef4444',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#ef4444'
                }}
              >
                <FaExclamationTriangle size="30" />
              </div>

              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: '#ef4444' }}>
                An Error Occurred!
              </h3>

              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {errorModalMessage}
              </p>

              <button
                type="button"
                onClick={() => setErrorModalMessage('')}
                className="btn btn-danger fw-bold w-100"
                style={{ marginTop: '10px', padding: '10px', fontSize: '14px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Details Modal */}
      {detailModal.show && detailModal.feedback && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={() => setDetailModal({ show: false, feedback: null })}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '12px' }}>
              <h3 className="m-0 fw-bold" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)' }}>
                Feedback Details #{detailModal.feedback.id}
              </h3>
              <button
                onClick={() => setDetailModal({ show: false, feedback: null })}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ho-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 15px', fontSize: '14px' }}>
              <span className="text-secondary fw-semibold">Sender:</span>
              <span className="text-dark fw-bold">{detailModal.feedback.userFullName || 'Anonymous'}</span>

              <span className="text-secondary fw-semibold">Email:</span>
              <span className="text-dark">{detailModal.feedback.userEmail || 'N/A'}</span>

              <span className="text-secondary fw-semibold">Role:</span>
              <span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: `${getRoleColor(detailModal.feedback.userRole)}20`,
                  color: getRoleColor(detailModal.feedback.userRole)
                }}>
                  {getRoleLabel(detailModal.feedback.userRole)}
                </span>
              </span>

              <span className="text-secondary fw-semibold">Time:</span>
              <span className="text-dark">{detailModal.feedback.createdAt ? new Date(detailModal.feedback.createdAt).toLocaleString('en-US') : 'N/A'}</span>

              <span className="text-secondary fw-semibold">Subject:</span>
              <span className="text-dark fw-bold">{detailModal.feedback.subject}</span>

              <span className="text-secondary fw-semibold" style={{ gridColumn: 'span 2', marginTop: '5px' }}>Feedback Content:</span>
              <div 
                style={{ 
                  gridColumn: 'span 2', 
                  padding: '12px', 
                  background: 'rgba(0,56,32,0.02)', 
                  border: '1px solid rgba(0,56,32,0.08)', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  lineHeight: '1.6',
                  color: '#2d3748',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {detailModal.feedback.content}
              </div>

              {detailModal.feedback.adminNote && (
                <>
                  <span className={`fw-bold ${detailModal.feedback.status === 'RESOLVED' ? 'text-success' : 'text-danger'}`} style={{ gridColumn: 'span 2', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {detailModal.feedback.status === 'RESOLVED' ? <FaCheckCircle /> : <FaBan />} Admin Response:
                  </span>
                  <div
                    style={{
                      gridColumn: 'span 2',
                      padding: '12px',
                      background: detailModal.feedback.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                      border: `1px solid ${detailModal.feedback.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderRadius: '8px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: detailModal.feedback.status === 'RESOLVED' ? '#0f5132' : '#842029',
                      fontStyle: 'italic'
                    }}
                  >
                    "{detailModal.feedback.adminNote}"
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '15px' }}>
              <button
                onClick={() => setDetailModal({ show: false, feedback: null })}
                className="btn btn-outline-secondary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Close
              </button>
              {detailModal.feedback.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      const fbId = detailModal.feedback.id;
                      setDetailModal({ show: false, feedback: null });
                      setResolveModal({ show: true, feedbackId: fbId, actionType: 'RESOLVED', note: '' });
                    }}
                    className="btn btn-success btn-sm fw-bold"
                    style={{ padding: '8px 20px', borderRadius: '8px' }}
                  >
                    Resolve Now
                  </button>
                  <button
                    onClick={() => {
                      const fbId = detailModal.feedback.id;
                      setDetailModal({ show: false, feedback: null });
                      setResolveModal({ show: true, feedbackId: fbId, actionType: 'REJECTED', note: '' });
                    }}
                    className="btn btn-outline-danger btn-sm fw-bold"
                    style={{ padding: '8px 20px', borderRadius: '8px' }}
                  >
                    Reject Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Resolve / Reject Input Modal */}
      {resolveModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={() => !resolving && setResolveModal({ show: false, feedbackId: null, actionType: 'RESOLVED', note: '' })}
        >
          <form
            onSubmit={handleResolveSubmit}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${resolveModal.actionType === 'REJECTED' ? '#ef4444' : 'var(--ho-border-gold, #D4AF37)'}`,
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: resolveModal.actionType === 'REJECTED' ? '#ef4444' : 'var(--ho-primary-dark)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '10px', margin: 0 }}>
              {resolveModal.actionType === 'REJECTED' ? `Reject Feedback #${resolveModal.feedbackId}` : `Resolve Feedback #${resolveModal.feedbackId}`}
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">
                {resolveModal.actionType === 'REJECTED' ? 'Rejection Reason *' : 'Resolution Notes / Response *'}
              </label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="5"
                required
                disabled={resolving}
                placeholder={resolveModal.actionType === 'REJECTED' ? 'Enter rejection reason to notify the user...' : 'Enter resolution steps or response to the user...'}
                value={resolveModal.note}
                onChange={(e) => setResolveModal(prev => ({ ...prev, note: e.target.value }))}
                style={{ resize: 'vertical', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
              <button
                type="button"
                disabled={resolving}
                onClick={() => setResolveModal({ show: false, feedbackId: null, actionType: 'RESOLVED', note: '' })}
                className="btn btn-outline-secondary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolving}
                className={`btn btn-sm fw-bold ${resolveModal.actionType === 'REJECTED' ? 'btn-danger' : 'btn-success'}`}
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                {resolving ? 'Saving...' : (resolveModal.actionType === 'REJECTED' ? 'Confirm Reject' : 'Confirm Resolve')}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
