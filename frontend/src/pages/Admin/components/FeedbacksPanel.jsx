import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaTimes, FaSearch, FaCommentDots, FaInfoCircle, FaCheckCircle, FaUser, FaEnvelope, FaTag } from 'react-icons/fa';

const MOCK_FEEDBACKS = [
  {
    id: 30001,
    userFullName: "Trần Anh Tuấn",
    userEmail: "tuan.ta@jockey.com",
    userRole: "JOCKEY",
    subject: "Lệ phí đăng ký thi đấu quá cao",
    content: "Lệ phí hiện tại cho các giải đấu hạng mục Classic khá cao đối với các nài ngựa tự do. Đề nghị ban tổ chức xem xét hỗ trợ giảm 10% lệ phí hoặc tăng tỷ lệ chia thưởng cho Jockey lên 40%.",
    createdAt: "2026-06-30T10:00:00Z",
    status: "PENDING"
  },
  {
    id: 30002,
    userFullName: "Nguyễn Minh Vy",
    userEmail: "vy.nm@owner.com",
    userRole: "HORSE_OWNER",
    subject: "Sân đua cỏ Mỹ Tho có mặt cỏ không đều",
    content: "Tôi vừa cho ngựa thi đấu thử tại sân cỏ Mỹ Tho. Một số khu vực cua rẽ có cỏ mọc không đều và khá trơn khi trời mưa nhẹ. Đề xuất ban quản lý sân thực hiện bảo dưỡng và lu phẳng mặt cỏ để đảm bảo an toàn cho ngựa.",
    createdAt: "2026-06-29T16:45:00Z",
    status: "RESOLVED",
    adminNote: "Đã chuyển tiếp ý kiến phản hồi tới ban quản trị sân đua Mỹ Tho. Họ đã xác nhận sẽ bảo dưỡng lại toàn bộ mặt cỏ và báo cáo tiến độ trước ngày 05/07/2026."
  },
  {
    id: 30003,
    userFullName: "Lê Hoàng Long",
    userEmail: "long.lh@referee.com",
    userRole: "RACE_REFEREE",
    subject: "Hệ thống camera giám sát góc hẹp",
    content: "Tại vạch đích của trường đua Đại Nam, camera giám sát góc hẹp đôi khi bị khuất bởi biển quảng cáo. Cần điều chỉnh vị trí camera cao lên 1.5 mét để hỗ trợ trọng tài xác định chính xác thứ hạng ngựa khi về đích sát nút.",
    createdAt: "2026-06-28T09:15:00Z",
    status: "PENDING"
  },
  {
    id: 30004,
    userFullName: "Phan Văn Khánh",
    userEmail: "khanh.pv@spectator.com",
    userRole: "SPECTATOR",
    subject: "Lỗi hiển thị tỷ lệ cược trực tiếp",
    content: "Khi xem livestream giải đấu hôm qua, tỷ lệ cược hiển thị trên màn hình bị đứng hình khoảng 2 phút trước khi cuộc đua bắt đầu. Mong đội ngũ kỹ thuật tối ưu hóa luồng dữ liệu thời gian thực tốt hơn.",
    createdAt: "2026-07-01T05:30:00Z",
    status: "PENDING"
  }
];

export default function FeedbacksPanel() {
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);
  
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
    note: ''
  });

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle resolving a feedback
  const handleResolveSubmit = (e) => {
    e.preventDefault();
    const id = resolveModal.feedbackId;
    const note = resolveModal.note;
    setResolveModal({ show: false, feedbackId: null, note: '' });

    if (!note.trim()) {
      setErrorModalMessage('Vui lòng nhập ghi chú xử lý phản hồi.');
      return;
    }

    setFeedbacks(prev =>
      prev.map(fb => fb.id === id ? { ...fb, status: 'RESOLVED', adminNote: note } : fb)
    );
    setSuccessModalMessage('Phản hồi đã được xử lý và lưu ghi chú thành công!');
  };

  // Filter logic
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesStatus = statusFilter === '' || fb.status === statusFilter;
    const matchesRole = roleFilter === '' || fb.userRole === roleFilter;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      fb.userFullName?.toLowerCase().includes(searchLower) ||
      fb.userEmail?.toLowerCase().includes(searchLower) ||
      fb.subject?.toLowerCase().includes(searchLower) ||
      fb.content?.toLowerCase().includes(searchLower) ||
      String(fb.id).includes(searchLower);

    return matchesStatus && matchesRole && matchesSearch;
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'JOCKEY': return 'Nài ngựa (Jockey)';
      case 'HORSE_OWNER': return 'Chủ ngựa (Owner)';
      case 'RACE_REFEREE': return 'Trọng tài (Referee)';
      case 'SPECTATOR': return 'Khán giả (Spectator)';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'JOCKEY': return '#3b82f6';
      case 'HORSE_OWNER': return '#8b5cf6';
      case 'RACE_REFEREE': return '#ec4899';
      case 'SPECTATOR': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCommentDots style={{ color: 'var(--ho-accent-gold-text)' }} /> Tiếp Nhận & Phản Hồi Ý Kiến (Feedbacks)
        </h2>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card mb-2 p-3" style={{ border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
        <div className="row g-3">
          {/* Search Term */}
          <div className="col-12 col-md-5">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tìm kiếm phản hồi</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ho-form-input text-dark fw-semibold"
                placeholder="Tìm theo tên, email, tiêu đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '13px', height: '38px', paddingLeft: '35px' }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ho-text-muted)', fontSize: '14px' }} />
            </div>
          </div>

          {/* Role Filter */}
          <div className="col-12 col-md-3">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vai trò gửi</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="JOCKEY">Nài ngựa (Jockey)</option>
              <option value="HORSE_OWNER">Chủ ngựa (Owner)</option>
              <option value="RACE_REFEREE">Trọng tài (Referee)</option>
              <option value="SPECTATOR">Khán giả (Spectator)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-md-2">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xử lý (PENDING)</option>
              <option value="RESOLVED">Đã xử lý (RESOLVED)</option>
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
          Danh Sách Ý Kiến Đóng Góp ({filteredFeedbacks.length})
        </h3>

        <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Mã đóng góp</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Người đóng góp</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Vai trò</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Tiêu đề đóng góp</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Thời gian gửi</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--ho-text-muted)' }}>
                    Chưa ghi nhận ý kiến đóng góp nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} style={{ borderBottom: '1px solid var(--ho-border-muted)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{fb.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--ho-text-dark)', fontWeight: '600' }}>{fb.userFullName}</span>
                        <span style={{ color: 'var(--ho-text-muted)', fontSize: '12px' }}>{fb.userEmail}</span>
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
                      {new Date(fb.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: fb.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: fb.status === 'RESOLVED' ? '#10b981' : 'var(--ho-accent-gold-text)'
                      }}>
                        {fb.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setDetailModal({ show: true, feedback: fb })}
                          className="btn btn-outline-secondary btn-sm fw-bold"
                          style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
                        >
                          Chi tiết
                        </button>
                        {fb.status === 'PENDING' && (
                          <button
                            onClick={() => setResolveModal({ show: true, feedbackId: fb.id, note: '' })}
                            className="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1"
                            style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px' }}
                          >
                            <FaCheck size="10" /> Xử lý
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )))}
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
            backgroundColor: 'transparent',
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
                Thành Công!
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
                Xác nhận
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
            backgroundColor: 'transparent',
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
                Đã Xảy Ra Lỗi!
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
                Đóng
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
            backgroundColor: 'transparent',
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
                Chi Tiết Ý Kiến Đóng Góp #{detailModal.feedback.id}
              </h3>
              <button
                onClick={() => setDetailModal({ show: false, feedback: null })}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ho-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 15px', fontSize: '14px' }}>
              <span className="text-secondary fw-semibold">Người gửi:</span>
              <span className="text-dark fw-bold">{detailModal.feedback.userFullName}</span>

              <span className="text-secondary fw-semibold">Email:</span>
              <span className="text-dark">{detailModal.feedback.userEmail}</span>

              <span className="text-secondary fw-semibold">Vai trò:</span>
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

              <span className="text-secondary fw-semibold">Thời gian:</span>
              <span className="text-dark">{new Date(detailModal.feedback.createdAt).toLocaleString('vi-VN')}</span>

              <span className="text-secondary fw-semibold">Tiêu đề:</span>
              <span className="text-dark fw-bold">{detailModal.feedback.subject}</span>

              <span className="text-secondary fw-semibold" style={{ gridColumn: 'span 2', marginTop: '5px' }}>Nội dung đóng góp:</span>
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

              {detailModal.feedback.status === 'RESOLVED' && detailModal.feedback.adminNote && (
                <>
                  <span className="text-success fw-bold" style={{ gridColumn: 'span 2', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaCheckCircle /> Phản hồi từ Admin:</span>
                  <div 
                    style={{ 
                      gridColumn: 'span 2', 
                      padding: '12px', 
                      background: 'rgba(16, 185, 129, 0.05)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      lineHeight: '1.6', 
                      color: '#0f5132',
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
                Đóng
              </button>
              {detailModal.feedback.status === 'PENDING' && (
                <button
                  onClick={() => {
                    const fbId = detailModal.feedback.id;
                    setDetailModal({ show: false, feedback: null });
                    setResolveModal({ show: true, feedbackId: fbId, note: '' });
                  }}
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', borderRadius: '8px' }}
                >
                  Giải quyết ngay
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Resolve Input Modal */}
      {resolveModal.show && createPortal(
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
            zIndex: 1050,
          }}
          onClick={() => setResolveModal({ show: false, feedbackId: null, note: '' })}
        >
          <form
            onSubmit={handleResolveSubmit}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '500px',
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
              Xử Lý Ý Kiến Đóng Góp #{resolveModal.feedbackId}
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Ghi chú xử lý / Nội dung phản hồi *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="5"
                required
                placeholder="Nhập hướng giải quyết hoặc nội dung phản hồi gửi tới người dùng..."
                value={resolveModal.note}
                onChange={(e) => setResolveModal(prev => ({ ...prev, note: e.target.value }))}
                style={{ resize: 'vertical', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
              <button
                type="button"
                onClick={() => setResolveModal({ show: false, feedbackId: null, note: '' })}
                className="btn btn-outline-secondary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-success btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Xác nhận đã xử lý
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
