import React, { useState, useEffect } from 'react';
import { getAssignedTournamentsAPI, cancelRefereeAssignmentAPI } from '../../services/referee';
import StatusBadge from '../../components/ui/StatusBadge';

export default function AssignedTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tList = await getAssignedTournamentsAPI();
      setTournaments(tList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (tournament) => {
    setSelectedTournament(tournament);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedTournament) return;

    setSubmitting(true);
    try {
      await cancelRefereeAssignmentAPI(selectedTournament.id);
      setShowCancelModal(false);
      setNotification({
        type: 'success',
        message: `Hủy phân công cho giải đấu "${selectedTournament.tournamentName}" thành công.`
      });
      fetchData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Không thể hủy phân công giải đấu.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isRegistrationClosed = (registrationDeadline) => {
    if (!registrationDeadline) return false;
    return new Date() > new Date(registrationDeadline);
  };

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="mb-4">
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>Giải Đấu Được Phân Công</h2>
          <p className="text-secondary small">Xem danh sách các giải đấu được chỉ định cho bạn. Bạn có thể tự hủy phân công trước khi hết hạn đăng ký giải đấu.</p>
        </div>

        {loading ? (
          <div className="p-4 text-secondary text-center">Đang tải dữ liệu...</div>
        ) : (
          <div className="row g-4">
            <div className="col-12">
              <h3 className="fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>Danh Sách Giải Đấu</h3>
              {tournaments.length === 0 ? (
                <div className="glass-card text-center p-5 text-secondary">
                  Không có giải đấu nào được phân công cho bạn.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tournaments.map((t) => {
                    const isClosed = isRegistrationClosed(t.registrationDeadline);
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
                            className={`ho-btn ${isClosed ? 'ho-btn-outline-secondary' : 'ho-btn-outline-danger'} py-2 px-3 fw-bold`}
                            style={{ fontSize: '12px' }}
                            disabled={isClosed}
                            onClick={() => handleCancelClick(t)}
                            title={isClosed ? 'Giải đấu đã đóng đăng ký, không thể hủy' : 'Hủy phân công trước khi đóng đăng ký'}
                          >
                            {isClosed ? 'Đã đóng đăng ký (Không thể hủy)' : 'Hủy tham gia'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowCancelModal(false)}>
          <div className="modal-content-custom animate-scale-up p-4" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="ho-font-epilogue fs-5 fw-bold text-dark m-0">Xác nhận hủy phân công</h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCancelModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#a0aec0' }}
              >
                &times;
              </button>
            </div>
            <p className="text-secondary small mb-4">
              Bạn có chắc chắn muốn hủy phân công quản lý giải đấu <strong>{selectedTournament?.tournamentName}</strong> không? Hành động này có hiệu lực ngay lập tức.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="ho-btn ho-btn-outline-secondary py-2 px-4"
                onClick={() => setShowCancelModal(false)}
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="ho-btn ho-btn-danger-solid py-2 px-4 fw-bold"
                onClick={handleCancelConfirm}
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
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
