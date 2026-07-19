import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaCommentDots, FaPaperPlane, FaTimes, FaCheckCircle, FaExclamationTriangle, FaListAlt, FaHistory, FaPlusCircle, FaClock, FaCheck, FaBan, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { createFeedbackAPI, getMyFeedbacksAPI } from '../../services/feedback';

export default function SendFeedbackModal({ isOpen, onClose, onSuccess, initialTab = 'CREATE' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'CREATE' or 'MY_FEEDBACKS'

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Create Form State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // My Feedbacks History State
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);

  const fetchMyFeedbacks = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError('');
      const data = await getMyFeedbacksAPI();
      setMyFeedbacks(data);
    } catch (err) {
      setHistoryError(err.message || 'Không thể tải danh sách ý kiến cá nhân.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'MY_FEEDBACKS') {
      fetchMyFeedbacks();
    }
  }, [isOpen, activeTab, fetchMyFeedbacks]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tiêu đề và nội dung đóng góp.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await createFeedbackAPI({
        subject: subject.trim(),
        content: content.trim()
      });
      setSubject('');
      setContent('');
      setSuccessMessage('Cảm ơn bạn! Ý kiến đóng góp đã được gửi thành công đến Ban Quản Trị.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Không thể gửi đóng góp ý kiến. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FaCheck size="10" /> Đã xử lý
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FaBan size="10" /> Từ chối
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--ho-accent-gold-text, #B8860B)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FaClock size="10" /> Chờ xử lý
          </span>
        );
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1060,
      }}
      onClick={handleClose}
    >
      <div
        className="glass-card"
        style={{
          width: '92%',
          maxWidth: '620px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--ho-border-gold, #D4AF37)',
          background: '#ffffff',
          borderRadius: '16px',
          animation: 'scaleUp 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <h4 className="m-0 fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--ho-primary-dark, #003820)', fontSize: '18px' }}>
            <FaCommentDots style={{ color: 'var(--ho-accent-gold-text, #B8860B)' }} /> Phản Hồi & Đóng Góp Ý Kiến
          </h4>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ho-text-muted, #666)' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex gap-2 mb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('CREATE'); setSuccessMessage(''); }}
            className={`btn btn-sm d-flex align-items-center gap-2 fw-bold ${activeTab === 'CREATE' ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{
              borderRadius: '8px',
              backgroundColor: activeTab === 'CREATE' ? 'var(--ho-primary-dark, #003820)' : 'transparent',
              borderColor: activeTab === 'CREATE' ? 'var(--ho-primary-dark, #003820)' : '#ccc',
              fontSize: '13px'
            }}
          >
            <FaPlusCircle /> Gửi đóng góp mới
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MY_FEEDBACKS')}
            className={`btn btn-sm d-flex align-items-center gap-2 fw-bold ${activeTab === 'MY_FEEDBACKS' ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{
              borderRadius: '8px',
              backgroundColor: activeTab === 'MY_FEEDBACKS' ? 'var(--ho-primary-dark, #003820)' : 'transparent',
              borderColor: activeTab === 'MY_FEEDBACKS' ? 'var(--ho-primary-dark, #003820)' : '#ccc',
              fontSize: '13px'
            }}
          >
            <FaHistory /> Đơn ý kiến đã gửi
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {activeTab === 'CREATE' ? (
            successMessage ? (
              <div className="text-center py-4 d-flex flex-column align-items-center gap-3">
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
                  <FaCheckCircle size="32" />
                </div>
                <h5 className="fw-bold m-0" style={{ color: 'var(--ho-primary-dark, #003820)' }}>Đã Gửi Thành Công!</h5>
                <p className="text-secondary small m-0 px-3">{successMessage}</p>
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('MY_FEEDBACKS')}
                    className="btn btn-outline-secondary btn-sm fw-bold px-3"
                    style={{ borderRadius: '8px' }}
                  >
                    Xem danh sách đã gửi
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-success btn-sm fw-bold px-4"
                    style={{ borderRadius: '8px', backgroundColor: 'var(--ho-primary-dark, #003820)', borderColor: 'var(--ho-primary-dark, #003820)' }}
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                {errorMessage && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 m-0" style={{ fontSize: '13px', borderRadius: '8px' }}>
                    <FaExclamationTriangle />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="ho-input-label d-block mb-1" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ho-primary-dark)' }}>
                    Tiêu đề đóng góp *
                  </label>
                  <input
                    type="text"
                    className="ho-form-input text-dark fw-semibold w-100"
                    required
                    maxLength={255}
                    disabled={submitting}
                    placeholder="Ví dụ: Góp ý về giao diện, đăng ký thi đấu, lỗi hệ thống..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ fontSize: '14px', height: '40px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)' }}
                  />
                </div>

                <div>
                  <label className="ho-input-label d-block mb-1" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ho-primary-dark)' }}>
                    Nội dung chi tiết *
                  </label>
                  <textarea
                    className="ho-form-input text-dark fw-semibold w-100"
                    rows="5"
                    required
                    maxLength={2000}
                    disabled={submitting}
                    placeholder="Mô tả chi tiết vấn đề hoặc ý kiến đề xuất của bạn..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ fontSize: '14px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)', resize: 'vertical' }}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleClose}
                    className="btn btn-outline-secondary btn-sm"
                    style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: '600' }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-success btn-sm d-flex align-items-center gap-2 fw-bold px-4"
                    style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: 'var(--ho-primary-dark, #003820)', borderColor: 'var(--ho-primary-dark, #003820)' }}
                  >
                    <FaPaperPlane size="12" />
                    {submitting ? 'Đang gửi...' : 'Gửi đóng góp'}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* TAB 2: MY FEEDBACKS HISTORY */
            <div className="d-flex flex-column gap-3">
              {loadingHistory ? (
                <div className="text-center py-4 text-secondary fw-semibold">Đang tải lịch sử đóng góp...</div>
              ) : historyError ? (
                <div className="alert alert-danger py-2 px-3 small">{historyError}</div>
              ) : myFeedbacks.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Bạn chưa gửi ý kiến đóng góp nào.
                </div>
              ) : (
                myFeedbacks.map((fb) => {
                  const isExpanded = expandedFeedbackId === fb.id;
                  return (
                    <div
                      key={fb.id}
                      style={{
                        border: '1px solid rgba(0, 56, 32, 0.15)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        backgroundColor: isExpanded ? 'rgba(0, 56, 32, 0.02)' : '#ffffff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div
                        className="d-flex justify-content-between align-items-center cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedFeedbackId(isExpanded ? null : fb.id)}
                      >
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                              #{fb.id} - {fb.subject}
                            </span>
                            {getStatusBadge(fb.status)}
                          </div>
                          <span className="text-muted" style={{ fontSize: '12px' }}>
                            Gửi ngày: {fb.createdAt ? new Date(fb.createdAt).toLocaleString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                        <div className="text-muted ms-2">
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '13px' }}>
                          <div className="mb-2">
                            <span className="fw-semibold text-secondary d-block mb-1">Nội dung đã gửi:</span>
                            <div style={{ padding: '10px 12px', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px', lineHeight: '1.5', color: '#333' }}>
                              {fb.content}
                            </div>
                          </div>

                          {/* Admin Response Note */}
                          {fb.adminNote ? (
                            <div className="mt-2">
                              <span className="fw-bold text-success d-flex align-items-center gap-1 mb-1">
                                <FaCheckCircle /> Phản hồi từ Ban Quản Trị:
                              </span>
                              <div style={{ padding: '10px 12px', background: fb.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', borderLeft: `3px solid ${fb.status === 'RESOLVED' ? '#10b981' : '#ef4444'}`, borderRadius: '4px', fontStyle: 'italic', color: '#1a202c', lineHeight: '1.5' }}>
                                "{fb.adminNote}"
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-muted fst-italic style-sm" style={{ fontSize: '12px' }}>
                              Ý kiến đang được Ban quản trị xem xét và xử lý.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
