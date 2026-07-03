import React, { useState, useEffect } from 'react';
import { getAssignedTournamentsAPI, createRefereeChangeRequestAPI, getRefereeChangeRequestsAPI } from '../../services/referee';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function AssignedTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [reason, setReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tList, rList] = await Promise.all([
        getAssignedTournamentsAPI(),
        getRefereeChangeRequestsAPI()
      ]);
      setTournaments(tList);
      setRequests(rList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineClick = (tournament) => {
    setSelectedTournament(tournament);
    setReason('');
    setShowDeclineModal(true);
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setNotification({
        type: 'error',
        message: 'Vui lòng nhập lý do từ chối tham gia.'
      });
      return;
    }

    setSubmitting(true);
    try {
      await createRefereeChangeRequestAPI(selectedTournament.id, reason.trim());
      setShowDeclineModal(false);
      setNotification({
        type: 'success',
        message: `Gửi yêu cầu thay thế trọng tài cho giải đấu "${selectedTournament.tournamentName}" thành công.`
      });
      // Refresh requests list
      const rList = await getRefereeChangeRequestsAPI();
      setRequests(rList);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Lỗi khi gửi yêu cầu.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const requestColumns = [
    {
      key: 'createdAt',
      label: 'Ngày Gửi',
      render: (item) => new Date(item.createdAt).toLocaleString('vi-VN')
    },
    {
      key: 'tournamentName',
      label: 'Giải Đấu',
      render: (item) => <span className="fw-semibold text-secondary small">{item.tournamentName || `Giải đấu #${item.tournamentId}`}</span>
    },
    {
      key: 'reason',
      label: 'Lý Do Từ Chối'
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      align: 'center',
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="mb-4">
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>Giải Đấu Được Phân Công</h2>
          <p className="text-secondary small">Xem danh sách các giải đấu đua ngựa được chỉ định cho bạn. Gửi yêu cầu xin thay thế nếu không thể tham gia.</p>
        </div>

        {loading ? (
          <div className="p-4 text-secondary text-center">Đang tải dữ liệu...</div>
        ) : (
          <div className="row g-4">
            {/* Left: Tournament Cards List */}
            <div className="col-12 col-lg-7">
              <h3 className="fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>Danh Sách Giải Đấu</h3>
              {tournaments.length === 0 ? (
                <div className="glass-card text-center p-5 text-secondary">
                  Không có giải đấu nào được phân công cho bạn.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tournaments.map((t) => {
                    const hasPendingRequest = requests.some(r => r.tournamentId === t.id && r.status === 'PENDING');
                    return (
                      <div key={t.id} className="glass-card p-4 d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap" style={{ borderLeft: '4px solid var(--ho-accent-gold)' }}>
                        <div className="flex-grow-1">
                          <h4 className="fw-bold fs-5 text-dark mb-2">{t.tournamentName}</h4>
                          <div className="d-flex flex-wrap gap-x-4 gap-y-2 text-secondary small">
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">map</span>
                              {t.location || 'Chưa xác định'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">calendar_month</span>
                              Bắt đầu: {t.officialRaceTime ? new Date(t.officialRaceTime).toLocaleString('vi-VN') : 'Chưa định'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">event_busy</span>
                              Hạn đăng ký: {t.registrationDeadline ? new Date(t.registrationDeadline).toLocaleString('vi-VN') : 'Chưa định'}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-md-end gap-2 justify-content-between">
                          <StatusBadge status={t.tournamentStatus} />
                          <button
                            className={`ho-btn ${hasPendingRequest ? 'ho-btn-outline-secondary' : 'ho-btn-outline-danger'} py-2 px-3 fw-bold`}
                            style={{ fontSize: '12px' }}
                            disabled={hasPendingRequest || t.tournamentStatus !== 'Upcoming'}
                            onClick={() => handleDeclineClick(t)}
                          >
                            {hasPendingRequest ? 'Đang xin thay thế' : 'Không thể tham gia'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Change Requests History List */}
            <div className="col-12 col-lg-5">
              <h3 className="fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>Lịch Sử Yêu Cầu Thay Thế</h3>
              <div className="glass-card">
                <DataTable
                  columns={requestColumns}
                  data={requests}
                  emptyMessage="Bạn chưa gửi yêu cầu thay thế nào."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decline Participation Modal */}
      {showDeclineModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowDeclineModal(false)}>
          <div className="modal-content-custom animate-scale-up p-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="ho-font-epilogue fs-5 fw-bold text-dark m-0">Xác nhận không thể tham gia</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeclineModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}
              >
                &times;
              </button>
            </div>
            <p className="text-secondary small mb-4">
              Bạn đang gửi yêu cầu xin đổi trọng tài cho giải đấu <strong>{selectedTournament?.tournamentName}</strong>. Vui lòng nhập lý do cụ thể để quản trị viên phê duyệt.
            </p>
            <form onSubmit={handleDeclineSubmit}>
              <div className="form-group mb-4">
                <label className="ho-input-label">Lý do xin thay thế *</label>
                <textarea
                  className="ho-form-input text-dark fw-semibold"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                  placeholder="Nhập lý do chi tiết (Ví dụ: bận công tác đột xuất, lý do sức khỏe...)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="ho-btn ho-btn-outline-secondary py-2 px-4"
                  onClick={() => setShowDeclineModal(false)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="ho-btn ho-btn-danger-solid py-2 px-4 fw-bold"
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast Dialog */}
      {notification && (
        <div className="modal-overlay" style={{ zIndex: 99999 }} onClick={() => setNotification(null)}>
          <div className="modal-content-custom animate-scale-up text-center p-4" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <span
              className="material-symbols-outlined mb-2"
              style={{
                fontSize: '56px',
                color: notification.type === 'success' ? 'var(--ho-primary-medium)' : 'var(--ho-error-text)'
              }}
            >
              {notification.type === 'success' ? 'verified' : 'error'}
            </span>
            <h3 className="ho-font-epilogue fs-5 fw-bold text-dark mb-2">
              {notification.type === 'success' ? 'Thành công' : 'Thất bại'}
            </h3>
            <p className="text-secondary small mb-4">{notification.message}</p>
            <button
              className={`ho-btn ${notification.type === 'success' ? 'ho-btn-gold-solid' : 'ho-btn-outline-danger'} w-100 py-2`}
              onClick={() => setNotification(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
