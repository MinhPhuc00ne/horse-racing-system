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
        message: `Successfully cancelled assignment for tournament "${selectedTournament.tournamentName}".`
      });
      fetchData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Could not cancel tournament assignment.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canCancel = (tournamentStatus) => {
    const status = tournamentStatus?.toLowerCase();
    return status === 'active' || status === 'upcoming' || status === 'open_for_register';
  };

  return (
    <>
      <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
        <div className="mb-4">
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>Assigned Tournaments</h2>
          <p className="text-secondary small">View the list of tournaments assigned to you. You can cancel assignments before the registration deadline.</p>
        </div>

        {loading ? (
          <div className="p-4 text-secondary text-center">Loading data...</div>
        ) : (
          <div className="row g-4">
            <div className="col-12">
              <h3 className="fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>Tournament List</h3>
              {tournaments.length === 0 ? (
                <div className="glass-card text-center p-5 text-secondary">
                  No tournaments assigned to you.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tournaments.map((t) => {
                    const isClosed = !canCancel(t.tournamentStatus);
                    return (
                      <div key={t.id} className="glass-card p-4 d-flex justify-content-between align-items-start gap-3 flex-wrap flex-md-nowrap" style={{ borderLeft: '4px solid var(--ho-accent-gold)' }}>
                        <div className="flex-grow-1">
                          <h4 className="fw-bold fs-5 text-dark mb-2">{t.tournamentName}</h4>
                          <div className="d-flex flex-wrap gap-x-4 gap-y-2 text-secondary small">
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">map</span>
                              {t.location || 'Unknown'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">calendar_month</span>
                              Start: {t.officialRaceTime ? new Date(t.officialRaceTime).toLocaleString('en-US') : 'TBD'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <span className="material-symbols-outlined fs-6">event_busy</span>
                              Registration Deadline: {t.registrationDeadline ? new Date(t.registrationDeadline).toLocaleString('en-US') : 'TBD'}
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
                            title={isClosed ? 'Tournament is no longer Active/Upcoming, cannot cancel' : 'Cancel assignment'}
                          >
                            {isClosed ? 'Cannot Cancel' : 'Cancel Assignment'}
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
              <h3 className="ho-font-epilogue fs-5 fw-bold text-dark m-0">Confirm Cancel Assignment</h3>
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
              Are you sure you want to cancel the assignment to manage the tournament <strong>{selectedTournament?.tournamentName}</strong>? This action takes immediate effect.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="ho-btn ho-btn-outline-secondary py-2 px-4"
                onClick={() => setShowCancelModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ho-btn ho-btn-danger-solid py-2 px-4 fw-bold"
                onClick={handleCancelConfirm}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm'}
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
              {notification.type === 'success' ? 'Success' : 'Failure'}
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
