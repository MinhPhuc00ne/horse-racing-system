import { useState } from 'react';
import { createPortal } from 'react-dom';
import DataCard from '../ui/DataCard';
import StatusBadge from '../ui/StatusBadge';
import { useHorseOwner } from '../../contexts/HorseOwnerContext';
import { submitRaceRegistrationAPI, updateRaceRegistrationAPI, cancelRaceRegistrationAPI } from '../../services/owner';

export default function RaceEntriesContent() {
  const { horses = [], systemUsers = [], tournaments = [], setTournaments, refreshData } = useHorseOwner();
  const [showModal, setShowModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [formData, setFormData] = useState({
    horseId: '',
    jockeyId: '',
    ownerShare: 90,
    jockeyShare: 10,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateRegId, setUpdateRegId] = useState(null);

  // Filter only READY horses
  const readyHorses = horses.filter(h => h.status && h.status.toUpperCase() === 'READY');
  // Filter only jockeys who are friends
  const friendJockeys = systemUsers.filter(u => u.role === 'JOCKEY' && u.friendStatus === 'FRIEND');

  const handleRegisterClick = (race) => {
    setSelectedRace(race);
    setIsUpdating(false);
    setUpdateRegId(null);

    const allowed = race.allowedClasses ? race.allowedClasses.split(',').map(s => s.trim().toUpperCase()) : [];
    const eligibleHorses = readyHorses.filter(h => {
      if (allowed.length === 0) return true;
      return h.breed && allowed.includes(h.breed.trim().toUpperCase());
    });

    setFormData({
      horseId: eligibleHorses.length > 0 ? eligibleHorses[0].id : '',
      jockeyId: friendJockeys.length > 0 ? friendJockeys[0].id : '',
      ownerShare: 90,
      jockeyShare: 10,
    });
    setShowModal(true);
  };

  const handleUpdateClick = (race) => {
    setSelectedRace(race);
    setIsUpdating(true);
    setUpdateRegId(race.myRegistration.id);

    const allowed = race.allowedClasses ? race.allowedClasses.split(',').map(s => s.trim().toUpperCase()) : [];
    const eligibleHorses = readyHorses.filter(h => {
      if (allowed.length === 0) return true;
      return h.breed && allowed.includes(h.breed.trim().toUpperCase());
    });

    const currentHorse = horses.find(h => h.name === race.myRegistration.horseName);
    const horseIdVal = currentHorse ? currentHorse.id : (eligibleHorses.length > 0 ? eligibleHorses[0].id : '');

    const currentJockey = systemUsers.find(u => u.fullName === race.myRegistration.jockeyName);
    const jockeyIdVal = currentJockey ? currentJockey.id : (friendJockeys.length > 0 ? friendJockeys[0].id : '');

    setFormData({
      horseId: horseIdVal,
      jockeyId: jockeyIdVal,
      ownerShare: race.myRegistration.ownerSharePercent || 90,
      jockeyShare: race.myRegistration.jockeySharePercent || 10,
    });
    setShowModal(true);
  };

  const handleCancelClick = async (reg) => {
    const isApproved = reg.status === 'APPROVED';
    const warningMsg = isApproved
      ? 'WARNING: This registration is already approved. Under regulations, if you WITHDRAW now, you will NOT be refunded the entry fee.\n\nAre you sure you want to withdraw?'
      : 'Are you sure you want to cancel this registration? The entry fee will be 100% refunded to your wallet.';

    if (!window.confirm(warningMsg)) {
      return;
    }

    try {
      setLoading(true);
      await cancelRaceRegistrationAPI(reg.id);

      const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
      const localList = JSON.parse(savedLocal).filter(l => l.raceId !== reg.raceId);
      localStorage.setItem('owner_registered_races', JSON.stringify(localList));

      await refreshData();

      setSuccessMsg(isApproved
        ? 'Withdrew successfully! The entry fee is non-refundable according to the rules.'
        : 'Registration cancelled and entry fee refunded successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      alert("Failed to cancel registration: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!formData.horseId || !formData.jockeyId) {
      alert("Please select both a horse and a jockey.");
      return;
    }

    const ownerS = parseFloat(formData.ownerShare);
    const jockeyS = parseFloat(formData.jockeyShare);

    if (isNaN(ownerS) || isNaN(jockeyS) || Math.abs((ownerS + jockeyS) - 100) > 0.001) {
      alert("Total profit sharing split must equal 100%.");
      return;
    }

    try {
      setLoading(true);

      const requestPayload = {
        tournamentId: selectedRace.tournamentId,
        horseId: parseInt(formData.horseId),
        jockeyId: parseInt(formData.jockeyId),
        ownerSharePercent: ownerS,
        jockeySharePercent: jockeyS,
      };

      if (isUpdating) {
        await updateRaceRegistrationAPI(updateRegId, requestPayload);
      } else {
        await submitRaceRegistrationAPI(requestPayload);
      }

      const selectedHorseObj = horses.find(h => h.id === parseInt(formData.horseId));
      const selectedJockeyObj = systemUsers.find(j => j.id === parseInt(formData.jockeyId));

      const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
      let localList = JSON.parse(savedLocal);
      if (isUpdating) {
        localList = localList.filter(l => l.raceId !== selectedRace.id);
      }
      localList.push({ raceId: selectedRace.id, horseName: selectedHorseObj?.name || '' });
      localStorage.setItem('owner_registered_races', JSON.stringify(localList));

      try {
        await refreshData();
      } catch (e) {
        console.error(e);
      }

      setSuccessMsg(isUpdating
        ? `Successfully updated registration for horse ${selectedHorseObj?.name} and Jockey ${selectedJockeyObj?.fullName}!`
        : `Successfully registered horse ${selectedHorseObj?.name} with Jockey ${selectedJockeyObj?.fullName} for tournament ${selectedRace.tournamentName}!`);

      setShowModal(false);
      setShowSuccessModal(true);
      setIsUpdating(false);
      setUpdateRegId(null);
    } catch (err) {
      alert((isUpdating ? "Update" : "Registration") + " failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 p-4 rounded-4" style={{ backgroundColor: '#0c2214', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <div>
          <span className="badge bg-warning text-dark fw-bold mb-2" style={{ fontSize: '0.75rem' }}>HORSE OWNER SUITE</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-white mb-1" style={{ color: '#ffffff' }}>
            Upcoming Tournaments & Race Entries
          </h2>
          <p className="text-white-50 small m-0" style={{ color: '#94a3b8' }}>
            Register your thoroughbred horses to participate in prestigious cup tournaments.
          </p>
        </div>
      </div>

      {/* Grid of Races */}
      <div className="row g-4 mb-4">
        {tournaments.map((race, i) => {
          const userRegisteredHorses = horses.filter(h => race.registeredHorses?.includes(h.name));
          const isRegistered = userRegisteredHorses.length > 0;
          return (
            <div key={race.id || i} className="col-12 col-md-4">
              <DataCard
                title={race.tournamentName}
                subtitle={`${race.date} at ${race.time}`}
                interactive={true}
              >
                {race.imageUrl && (
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '10px' }}>
                    <img src={race.imageUrl.startsWith('/') ? `http://localhost:8080${race.imageUrl}` : race.imageUrl} alt={race.tournamentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
                    <span className="fw-bold text-white">Location:</span>
                    <span className="text-end text-truncate ms-2 text-white-50" style={{ maxWidth: '150px' }}>{race.location}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
                    <span className="fw-bold text-white">Track Type:</span>
                    <span className="text-white-50">{race.trackType}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
                    <span className="fw-bold text-white">Prize Pool:</span>
                    <span className="fw-bold text-warning">{race.prizePool}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
                    <span className="fw-bold text-white">Track Shape:</span>
                    <span className="text-white-50">{String(race.trackShape).toUpperCase() === 'OVAL' ? 'Oval Track' : 'Straight Track'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-secondary">
                    <span className="fw-bold text-white">Entry Fee:</span>
                    <span className="text-white-50">{race.entryFee ? `${race.entryFee.toLocaleString()} VND` : 'Free'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 align-items-center mb-2">
                    <span className="fw-bold text-white">Status:</span>
                    <StatusBadge status={race.myRegistration ? (race.myRegistration.status === 'APPROVED' ? 'READY' : race.myRegistration.status) : race.status} />
                  </div>

                  {/* ALLOWED BREEDS HIGH-CONTRAST BOX */}
                  <div className="p-2.5 rounded-3 mt-1" style={{ background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.35)' }}>
                    <div className="d-flex align-items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>info</span>
                      <span className="fw-bold text-warning" style={{ fontSize: '13px' }}>Allowed Breeds:</span>
                    </div>
                    <div className="fw-semibold ms-4" style={{ fontSize: '13px' }}>
                      {race.allowedClasses ? race.allowedClasses.split(',').map(c => c.trim()).map((c, idx) => (
                        <span key={idx} className="badge bg-dark text-warning border border-warning me-1 mb-1 px-2 py-1">{c}</span>
                      )) : <span className="badge bg-dark text-warning border border-warning px-2 py-1">All breeds allowed</span>}
                    </div>
                  </div>
                </div>

                {race.myRegistration ? (
                  <div className="d-flex flex-column gap-2 w-100">
                    <div className="p-3 rounded-3 border" style={{ backgroundColor: '#051009', fontSize: '13px', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-white-50 fw-semibold">Horse:</span>
                        <span className="fw-bold text-white">{race.myRegistration.horseName}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-white-50 fw-semibold">Jockey:</span>
                        <span className="fw-bold text-white">{race.myRegistration.jockeyName}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-white-50 fw-semibold">Status:</span>
                        <span className="badge" style={{
                          backgroundColor: race.myRegistration.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : race.myRegistration.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: race.myRegistration.status === 'APPROVED' ? '#10b981' : race.myRegistration.status === 'PENDING' ? '#f59e0b' : '#3b82f6',
                          border: `1px solid ${race.myRegistration.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.3)' : race.myRegistration.status === 'PENDING' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {race.myRegistration.status === 'APPROVED' ? 'Approved' : race.myRegistration.status === 'PENDING' ? 'Pending Admin Approval' : 'Pending Jockey Confirmation'}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 w-100 mt-2">
                      <button
                        onClick={() => handleUpdateClick(race)}
                        className="btn btn-outline-warning w-50 py-2 fw-bold"
                        style={{ borderRadius: '8px' }}
                        disabled={race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER'}
                      >
                        Change Info
                      </button>
                      <button
                        onClick={() => handleCancelClick(race.myRegistration)}
                        className="btn btn-danger w-50 py-2 fw-bold text-white"
                        style={{ borderRadius: '8px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegisterClick(race)}
                    className="btn fw-bold w-100 py-2.5 shadow-sm text-dark mt-auto"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    disabled={race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER'}
                  >
                    {race.status === 'FINISHED' ? 'REGISTRATION CLOSED' : 'REGISTER'}
                  </button>
                )}
              </DataCard>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {showModal && selectedRace && createPortal(
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content text-white" style={{ backgroundColor: '#0c2214', border: '1px solid #d4af37' }}>
              <div className="modal-header border-secondary" style={{ backgroundColor: '#07150c' }}>
                <h5 className="modal-title fw-bold text-warning">
                  {isUpdating ? 'Update Race Registration' : 'Register Horse for Race'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <h6 className="fw-bold text-white m-0">{selectedRace.tournamentName}</h6>
                  <span className="text-white-50 small">{selectedRace.location} • Prize: {selectedRace.prizePool}</span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="text-white-50 small mb-1 fw-bold">Select Horse</label>
                    <select
                      className="form-select text-white"
                      value={formData.horseId}
                      onChange={(e) => setFormData({ ...formData, horseId: e.target.value })}
                      style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                      <option value="" disabled>-- Select a ready horse --</option>
                      {readyHorses.map(h => (
                        <option key={h.id} value={h.id}>{h.name} ({h.breed || 'Thoroughbred'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-white-50 small mb-1 fw-bold">Select Jockey (From Friends)</label>
                    <select
                      className="form-select text-white"
                      value={formData.jockeyId}
                      onChange={(e) => setFormData({ ...formData, jockeyId: e.target.value })}
                      style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                      <option value="" disabled>-- Select a jockey --</option>
                      {friendJockeys.map(j => (
                        <option key={j.id} value={j.id}>{j.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-6">
                    <label className="text-white-50 small mb-1">Owner Prize Share (%)</label>
                    <input
                      type="number"
                      className="form-control text-white"
                      value={formData.ownerShare}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, ownerShare: val, jockeyShare: 100 - val });
                      }}
                      style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.3)' }}
                    />
                  </div>

                  <div className="col-6">
                    <label className="text-white-50 small mb-1">Jockey Prize Share (%)</label>
                    <input
                      type="number"
                      className="form-control text-white"
                      value={formData.jockeyShare}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, jockeyShare: val, ownerShare: 100 - val });
                      }}
                      style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.3)' }}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary text-white" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-warning fw-bold text-dark" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Submitting...' : 'Confirm Registration'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Modal */}
      {showSuccessModal && createPortal(
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-white text-center p-4" style={{ backgroundColor: '#0c2214', border: '1px solid #d4af37' }}>
              <span className="material-symbols-outlined text-warning display-4 mb-2">check_circle</span>
              <h4 className="fw-bold text-white mb-2">Success!</h4>
              <p className="text-white-50 mb-4">{successMsg}</p>
              <button className="btn btn-warning fw-bold px-4 text-dark mx-auto" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
