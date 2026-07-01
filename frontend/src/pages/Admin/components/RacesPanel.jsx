import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  getRaceRegistrationsAPI,
  approveRaceRegistrationAPI,
  rejectRaceRegistrationAPI
} from '../../../services/admin';
import { FaCheck, FaTimes, FaInfoCircle, FaSearch, FaFlag, FaExclamationTriangle } from 'react-icons/fa';

const MOCK_REGISTRATIONS = [
  {
    id: 10001,
    tournamentName: "Royal Ascot Stakes",
    raceName: "Vòng Chung Kết Gold Cup",
    raceId: 101,
    horseName: "Shadow Fax",
    horseBreed: "Thoroughbred",
    horseId: 201,
    jockeyName: "Lê Văn Tiến",
    jockeyId: 301,
    jockeySharePercent: 30,
    ownerSharePercent: 70,
    status: "PENDING"
  },
  {
    id: 10002,
    tournamentName: "Grand National Chase",
    raceName: "Vòng Loại Bảng A",
    raceId: 102,
    horseName: "Silver Bullet",
    horseBreed: "Arabian",
    horseId: 202,
    jockeyName: "Nguyễn Minh Hoàng",
    jockeyId: 302,
    jockeySharePercent: 25,
    ownerSharePercent: 75,
    status: "APPROVED"
  },
  {
    id: 10003,
    tournamentName: "Melbourne Cup Classic",
    raceName: "Vòng Bán Kết",
    raceId: 103,
    horseName: "Thunderbolt",
    horseBreed: "Quarter Horse",
    horseId: 203,
    jockeyName: "Trần Anh Tuấn",
    jockeyId: 303,
    jockeySharePercent: 40,
    ownerSharePercent: 60,
    status: "PENDING"
  },
  {
    id: 10004,
    tournamentName: "Kentucky Derby Trial",
    raceName: "Vòng Loại Bảng B",
    raceId: 104,
    horseName: "Wind Runner",
    horseBreed: "Appaloosa",
    horseId: 204,
    jockeyName: "Phạm Minh Đức",
    jockeyId: 304,
    jockeySharePercent: 35,
    ownerSharePercent: 65,
    status: "REJECTED",
    rejectionReason: "Ngựa không đủ điều kiện sức khỏe"
  }
];

export default function RacesPanel() {
  const [registrations, setRegistrations] = useState([]);
  const [loadingReg, setLoadingReg] = useState(false);

  // Success / Error Modals State
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Confirmation Modals State
  const [approveModal, setApproveModal] = useState({
    show: false,
    regId: null,
    horseName: '',
    jockeyName: '',
    tournamentName: ''
  });

  const [rejectModal, setRejectModal] = useState({
    show: false,
    regId: null,
    reason: ''
  });

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRegistrations = async () => {
    setLoadingReg(true);
    try {
      const regList = await getRaceRegistrationsAPI();
      if (!regList || regList.length === 0) {
        setRegistrations(MOCK_REGISTRATIONS);
      } else {
        setRegistrations(regList);
      }
    } catch (err) {
      console.warn("Failed to fetch registrations from backend, loading mock fallback data.", err);
      setRegistrations(MOCK_REGISTRATIONS);
    } finally {
      setLoadingReg(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Approve registration
  const handleApproveConfirm = async () => {
    const regId = approveModal.regId;
    setApproveModal({ show: false, regId: null, horseName: '', jockeyName: '', tournamentName: '' });
    
    setErrorModalMessage('');
    setSuccessModalMessage('');
    try {
      if (regId >= 10000) {
        // Local state update for mock data
        setRegistrations(prev =>
          prev.map(r => r.id === regId ? { ...r, status: 'APPROVED' } : r)
        );
        setSuccessModalMessage('Đã duyệt đơn đăng ký đua giả lập thành công!');
        return;
      }
      await approveRaceRegistrationAPI(regId);
      setSuccessModalMessage('Đã duyệt đơn đăng ký đua thành công!');
      fetchRegistrations();
    } catch (err) {
      setErrorModalMessage(err.response?.data?.message || err.message || 'Lỗi khi duyệt đơn đăng ký.');
    }
  };

  // Reject registration
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    const regId = rejectModal.regId;
    const reason = rejectModal.reason;
    setRejectModal({ show: false, regId: null, reason: '' });

    setErrorModalMessage('');
    setSuccessModalMessage('');
    try {
      if (regId >= 10000) {
        // Local state update for mock data
        setRegistrations(prev =>
          prev.map(r => r.id === regId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r)
        );
        setSuccessModalMessage(`Đã từ chối đơn đăng ký đua giả lập!`);
        return;
      }
      await rejectRaceRegistrationAPI(regId);
      setSuccessModalMessage('Đã từ chối đơn đăng ký đua!');
      fetchRegistrations();
    } catch (err) {
      setErrorModalMessage(err.response?.data?.message || err.message || 'Lỗi khi từ chối đơn đăng ký.');
    }
  };

  // Filter logic
  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = statusFilter === '' || reg.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      reg.horseName?.toLowerCase().includes(searchLower) ||
      reg.jockeyName?.toLowerCase().includes(searchLower) ||
      reg.tournamentName?.toLowerCase().includes(searchLower) ||
      reg.raceName?.toLowerCase().includes(searchLower) ||
      String(reg.id).includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaFlag style={{ color: 'var(--ho-accent-gold-text)' }} /> Duyệt Đăng Ký Giải Đấu (Horse Owner & Jockey)
        </h2>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card mb-2 p-3" style={{ border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
        <div className="row g-3">
          {/* Search Term */}
          <div className="col-12 col-md-6">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tìm kiếm đăng ký</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ho-form-input text-dark fw-semibold"
                placeholder="Tìm theo tên ngựa, nài ngựa, giải đấu, mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '13px', height: '38px', paddingLeft: '35px' }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ho-text-muted)', fontSize: '14px' }} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-md-4">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái đơn</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">PENDING (Chờ duyệt)</option>
              <option value="APPROVED">APPROVED (Đã duyệt)</option>
              <option value="REJECTED">REJECTED (Từ chối)</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="col-12 col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100 fw-bold d-flex align-items-center justify-content-center"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              style={{ height: '38px', fontSize: '13px', borderRadius: '8px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Registrations Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Danh Sách Đơn Đăng Ký ({filteredRegistrations.length})
        </h3>

        {loadingReg ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Đang tải danh sách đăng ký...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            Không tìm thấy đơn đăng ký nào khớp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Mã đơn</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Giải đấu (Vòng đua)</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Ngựa đua</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Nài ngựa</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Lợi nhuận chia (Jockey / Owner)</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Trạng thái</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--ho-border-muted)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{reg.id}</td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.tournamentName || 'Giải đấu'}</span>
                      <span className="text-secondary small">{reg.raceName} (ID: {reg.raceId})</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.horseName}</span>
                      <span className="text-secondary small">{reg.horseBreed || 'Thoroughbred'} (ID: {reg.horseId})</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.jockeyName}</span>
                      <span className="text-secondary small">ID: {reg.jockeyId}</span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--ho-text-muted)' }}>{reg.jockeySharePercent}% / {reg.ownerSharePercent}%</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: reg.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : reg.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: reg.status === 'APPROVED' ? '#10b981' : reg.status === 'REJECTED' ? '#ef4444' : 'var(--ho-accent-gold-text)'
                      }}>
                        {reg.status}
                      </span>
                      {reg.status === 'REJECTED' && reg.rejectionReason && (
                        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontStyle: 'italic', maxWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          Lý do: "{reg.rejectionReason}"
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {reg.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setApproveModal({
                                show: true,
                                regId: reg.id,
                                horseName: reg.horseName,
                                jockeyName: reg.jockeyName,
                                tournamentName: reg.tournamentName
                              })}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '6px',
                                color: '#10b981',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <FaCheck /> Duyệt
                            </button>
                            <button
                              onClick={() => setRejectModal({
                                show: true,
                                regId: reg.id,
                                reason: ''
                              })}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <FaTimes /> Từ chối
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--ho-text-muted)', fontStyle: 'italic' }}>Không có hành động</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                <FaCheck size="30" />
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
            zIndex: 1050,
          }}
          onClick={() => setApproveModal({ show: false, regId: null, horseName: '', jockeyName: '', tournamentName: '' })}
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
              <h3 className="m-0 fw-bold text-start" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '12px' }}>
                Xác Nhận Phê Duyệt
              </h3>

              <p className="text-secondary small m-0 fw-medium text-start" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn duyệt đơn đăng ký của ngựa <strong>{approveModal.horseName}</strong> và nài ngựa <strong>{approveModal.jockeyName}</strong> cho giải đấu <strong>{approveModal.tournamentName}</strong> không?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, regId: null, horseName: '', jockeyName: '', tournamentName: '' })}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '8px 20px', borderRadius: '8px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', borderRadius: '8px' }}
                >
                  Xác nhận duyệt
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Reason Modal */}
      {rejectModal.show && createPortal(
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
          onClick={() => setRejectModal({ show: false, regId: null, reason: '' })}
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
              Từ Chối Đăng Ký Thi Đấu
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Lý do từ chối *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="4"
                required
                placeholder="Nhập lý do chi tiết để thông báo cho người dùng..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ resize: 'vertical', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
              <button
                type="button"
                onClick={() => setRejectModal({ show: false, regId: null, reason: '' })}
                className="btn btn-outline-secondary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
