import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  getRaceRegistrationsAPI,
  approveRaceRegistrationAPI,
  rejectRaceRegistrationAPI,
  confirmRaceRegistrationsAPI
} from '../../../services/admin';
import { getTournamentsAPI } from '../../../services/races';
import { FaCheck, FaTimes, FaInfoCircle, FaSearch, FaFlag, FaExclamationTriangle } from 'react-icons/fa';

const MOCK_REGISTRATIONS = [
  {
    id: 10001,
    tournamentName: "Royal Ascot Stakes",
    raceName: "Gold Cup Final Round",
    raceId: 101,
    horseName: "Shadow Fax",
    horseBreed: "Thoroughbred",
    horseId: 201,
    ownerName: "Benimaru Commander",
    jockeyName: "Leo Carter",
    jockeyId: 301,
    jockeySharePercent: 30,
    ownerSharePercent: 70,
    status: "PENDING"
  },
  {
    id: 10002,
    tournamentName: "Grand National Chase",
    raceName: "Group A Qualifier",
    raceId: 102,
    horseName: "Silver Bullet",
    horseBreed: "Arabian",
    horseId: 202,
    ownerName: "Souei Shadow",
    jockeyName: "Max Sterling",
    jockeyId: 302,
    jockeySharePercent: 25,
    ownerSharePercent: 75,
    status: "APPROVED"
  },
  {
    id: 10003,
    tournamentName: "Melbourne Cup Classic",
    raceName: "Semi Final Round",
    raceId: 103,
    horseName: "Thunderbolt",
    horseBreed: "Quarter Horse",
    horseId: 203,
    ownerName: "Hakuro Swordsman",
    jockeyName: "Marcus Vance",
    jockeyId: 303,
    jockeySharePercent: 40,
    ownerSharePercent: 60,
    status: "PENDING"
  },
  {
    id: 10004,
    tournamentName: "Kentucky Derby Trial",
    raceName: "Group B Qualifier",
    raceId: 104,
    horseName: "Wind Runner",
    horseBreed: "Appaloosa",
    horseId: 204,
    ownerName: "Geld Orc King",
    jockeyName: "Ethan Hunt",
    jockeyId: 304,
    jockeySharePercent: 35,
    ownerSharePercent: 65,
    status: "REJECTED",
    rejectionReason: "Horse does not meet health requirements"
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
    const currentReg = registrations.find(r => r.id === regId);
    setApproveModal({ show: false, regId: null, horseName: '', jockeyName: '', tournamentName: '' });
    
    setErrorModalMessage('');
    setSuccessModalMessage('');
    try {
      if (regId >= 10000) {
        setRegistrations(prev =>
          prev.map(r => r.id === regId ? { ...r, status: 'APPROVED' } : r)
        );
        setSuccessModalMessage('Successfully approved mock race registration!');
        return;
      }
      await approveRaceRegistrationAPI(regId);
      
      const regList = await getRaceRegistrationsAPI();
      setRegistrations(regList);

      if (currentReg) {
        try {
          const tournamentsList = await getTournamentsAPI();
          const tournament = tournamentsList.find(t => t.tournamentName === currentReg.tournamentName);
          if (tournament) {
            const sameTournamentRegs = regList.filter(r => r.tournamentName === currentReg.tournamentName);
            const approvedCount = sameTournamentRegs.filter(r => r.status === 'APPROVED').length;
            const pendingCount = sameTournamentRegs.filter(r => r.status === 'PENDING' || r.status === 'PENDING_JOCKEY').length;

            const maxSlots = tournament.maxSlots || 10;
            const minSlots = tournament.minSlots || 3;

            if (approvedCount >= maxSlots || (pendingCount === 0 && approvedCount >= minSlots)) {
              await confirmRaceRegistrationsAPI(tournament.id);
              setSuccessModalMessage('Successfully approved registration and automatically locked the tournament list!');
              return;
            }
          }
        } catch (autoErr) {
          console.warn('Error locking the tournament list:', autoErr);
        }
      }

      setSuccessModalMessage('Successfully approved race registration!');
    } catch (err) {
      setErrorModalMessage(err.response?.data?.message || err.message || 'Error approving registration.');
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
        setRegistrations(prev =>
          prev.map(r => r.id === regId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r)
        );
        setSuccessModalMessage(`Successfully rejected mock race registration!`);
        return;
      }
      await rejectRaceRegistrationAPI(regId, reason);
      setSuccessModalMessage('Successfully rejected race registration!');
      fetchRegistrations();
    } catch (err) {
      setErrorModalMessage(err.response?.data?.message || err.message || 'Error rejecting registration.');
    }
  };

  // Filter logic
  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = statusFilter === '' || reg.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      reg.horseName?.toLowerCase().includes(searchLower) ||
      reg.jockeyName?.toLowerCase().includes(searchLower) ||
      reg.ownerName?.toLowerCase().includes(searchLower) ||
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
          <FaFlag style={{ color: 'var(--ho-accent-gold-text)' }} /> Approve Tournament Registrations (Horse Owner & Jockey)
        </h2>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card mb-2 p-3" style={{ border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
        <div className="row g-3">
          {/* Search Term */}
          <div className="col-12 col-md-6">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Registrations</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="ho-form-input text-dark fw-semibold"
                placeholder="Search by horse, jockey, owner, tournament, request #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '13px', height: '38px', paddingLeft: '35px' }}
              />
              <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ho-text-muted)', fontSize: '14px' }} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-12 col-md-4">
            <label className="ho-input-label d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
            <select
              className="ho-form-input text-dark fw-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '13px', height: '38px' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING (Pending Approval)</option>
              <option value="APPROVED">APPROVED (Approved)</option>
              <option value="REJECTED">REJECTED (Rejected)</option>
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
          Registration List ({filteredRegistrations.length})
        </h3>

        {loadingReg ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ho-text-muted)' }}>Loading registration list...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--ho-border-gold)', borderRadius: '14px', color: 'var(--ho-text-muted)' }}>
            No registrations found matching the filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Request #</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Tournament (Race)</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Horse</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Horse Owner</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Jockey</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Revenue Split (Jockey / Owner)</th>
                  <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--ho-border-muted)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{reg.id}</td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.tournamentName || 'Tournament'}</span>
                      <span className="text-secondary small">{reg.raceName}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.horseName}</span>
                      <span className="text-secondary small">{reg.horseBreed || 'Thoroughbred'}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.ownerName || 'Unknown Owner'}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="fw-bold d-block text-dark">{reg.jockeyName}</span>
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
                          Reason: "{reg.rejectionReason}"
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
                              <FaCheck /> Approve
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
                              <FaTimes /> Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--ho-text-muted)', fontStyle: 'italic' }}>No Actions</span>
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
                Confirm Approval
              </h3>

              <p className="text-secondary small m-0 fw-medium text-start" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to approve the registration of horse <strong>{approveModal.horseName}</strong> and jockey <strong>{approveModal.jockeyName}</strong> for tournament <strong>{approveModal.tournamentName}</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, regId: null, horseName: '', jockeyName: '', tournamentName: '' })}
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
              Reject Race Registration
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Rejection Reason *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="4"
                required
                placeholder="Enter detailed reason to notify the user..."
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
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
