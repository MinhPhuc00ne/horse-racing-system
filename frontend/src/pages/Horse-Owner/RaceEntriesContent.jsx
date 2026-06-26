import { useState } from 'react';
import { createPortal } from 'react-dom';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import { useHorseOwner } from './HorseOwnerContext';
import { submitRaceRegistrationAPI } from '../../services/owner';

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

  // Filter only READY horses (case-insensitive)
  const readyHorses = horses.filter(h => h.status && h.status.toUpperCase() === 'READY');
  // Filter only jockeys who are friends
  const friendJockeys = systemUsers.filter(u => u.role === 'JOCKEY' && u.friendStatus === 'FRIEND');

  const handleRegisterClick = (race) => {
    setSelectedRace(race);
    
    // Filter eligible horses by race allowedClasses
    const allowed = race.allowedClasses ? race.allowedClasses.split(',').map(s => s.trim().toUpperCase()) : [];
    const eligibleHorses = readyHorses.filter(h => {
      if (allowed.length === 0) return true; // if no restriction, allow all
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

  const handleConfirm = async () => {
    if (!formData.horseId || !formData.jockeyId) {
      alert("Please select both a horse and a jockey.");
      return;
    }
    
    const ownerS = parseFloat(formData.ownerShare);
    const jockeyS = parseFloat(formData.jockeyShare);

    if (isNaN(ownerS) || isNaN(jockeyS) || Math.abs((ownerS + jockeyS) - 100) > 0.001) {
      alert("Total profit sharing ratio must equal 100%.");
      return;
    }

    try {
      setLoading(true);
      await submitRaceRegistrationAPI({
        tournamentId: selectedRace.tournamentId,
        horseId: parseInt(formData.horseId),
        jockeyId: parseInt(formData.jockeyId),
        ownerSharePercent: ownerS,
        jockeySharePercent: jockeyS,
      });

      const selectedHorseObj = readyHorses.find(h => h.id === parseInt(formData.horseId));
      const selectedJockeyObj = friendJockeys.find(j => j.id === parseInt(formData.jockeyId));

      // Add horse to the registered list for this tournament in local state
      setTournaments(prevTournaments => 
        prevTournaments.map(t => 
          t.id === selectedRace.id 
            ? { ...t, registeredHorses: [...(t.registeredHorses || []), selectedHorseObj.name] }
            : t
        )
      );

      // Save locally to local storage for persistence across reloads
      const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
      const localList = JSON.parse(savedLocal);
      localList.push({ raceId: selectedRace.id, horseName: selectedHorseObj.name });
      localStorage.setItem('owner_registered_races', JSON.stringify(localList));

      try {
        await refreshData();
      } catch (e) {
        console.error(e);
      }

      setSuccessMsg(`Successfully registered horse ${selectedHorseObj.name} with Jockey ${selectedJockeyObj.fullName} for tournament ${selectedRace.tournamentName}!`);
      setShowModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert("Race registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Upcoming Tournaments
          </h2>
          <p className="text-secondary small m-0">
            Register your horses to participate in prestigious cup tournaments.
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
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--ho-border-gold)', marginBottom: '10px' }}>
                    <img src={race.imageUrl.startsWith('/') ? `http://localhost:8080${race.imageUrl}` : race.imageUrl} alt={race.tournamentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Location:</span>
                    <span className="text-end text-truncate ms-2" style={{ maxWidth: '150px' }}>{race.location}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Track Type:</span>
                    <span>{race.trackType}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Prize Pool:</span>
                    <span className="fw-bold" style={{ color: 'var(--ho-primary-medium)' }}>{race.prizePool}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Referee:</span>
                    <span>{race.refereeName || 'Unassigned'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Entry Fee:</span>
                    <span>{race.entryFee ? `${race.entryFee.toLocaleString()} VND` : 'Free'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 align-items-center mb-2">
                    <span className="fw-bold text-dark">Status:</span>
                    <StatusBadge status={isRegistered ? 'READY' : race.status} />
                  </div>
                  <div className="p-2 rounded mt-1" style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--ho-accent-gold-text)' }}>info</span>
                      <span className="fw-bold" style={{ color: 'var(--ho-primary-dark)', fontSize: '13px' }}>Allowed Breeds:</span>
                    </div>
                    <div className="fw-semibold ms-4" style={{ color: 'var(--ho-accent-gold-text)', fontSize: '14px' }}>
                      {race.allowedClasses ? race.allowedClasses.split(',').map(c => c.trim()).map((c, idx) => (
                        <span key={idx} className="badge bg-light text-dark border me-1 mb-1">{c}</span>
                      )) : <span className="badge bg-light text-dark border">All breeds allowed</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRegisterClick(race)}
                  className={`ho-btn ${isRegistered ? 'ho-btn-dark-green' : (race.status === 'Active' || race.status === 'OPEN_FOR_REGISTER') ? 'ho-btn-gold-solid' : 'btn-secondary'} w-100 py-2 fw-bold`}
                  disabled={isRegistered || (race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER')}
                  style={(!isRegistered && race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER') ? { backgroundColor: '#cccccc', color: '#666666', border: '1px solid #bbbbbb', cursor: 'not-allowed' } : {}}
                >
                  {isRegistered 
                    ? `Registered: ${userRegisteredHorses.map(h => h.name).join(', ')}` 
                    : (race.status === 'Active' || race.status === 'OPEN_FOR_REGISTER')
                      ? 'Register for Race' 
                      : race.status === 'Upcoming'
                        ? 'Registration Not Open'
                        : 'Registration Closed'}
                </button>
              </DataCard>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {showModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => !loading && setShowModal(false)}>
          <div className="modal-content-custom animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="ho-font-epilogue fs-4 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
              Register for {selectedRace?.tournamentName}
            </h3>
            
            <div className="d-flex flex-column gap-4 mb-4">
              {/* Select Horse */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Horse <span className="text-secondary small fw-normal">(Only displaying breeds allowed & ready)</span>
                </label>
                <select
                  value={formData.horseId}
                  onChange={(e) => setFormData({ ...formData, horseId: e.target.value })}
                  className="ho-form-input fw-semibold text-dark"
                >
                  {(() => {
                    const allowed = selectedRace?.allowedClasses ? selectedRace.allowedClasses.split(',').map(s => s.trim().toUpperCase()) : [];
                    const eligibleHorses = readyHorses.filter(h => {
                      if (allowed.length === 0) return true;
                      return h.breed && allowed.includes(h.breed.trim().toUpperCase());
                    });
                    
                    if (eligibleHorses.length === 0) {
                      return <option value="">No eligible horses available (Horses must be in Ready status and match breed {selectedRace?.allowedClasses})</option>;
                    }
                    return eligibleHorses.map(h => (
                      <option key={h.id} value={h.id}>{h.name} ({h.breed})</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Select Jockey */}
              <div>
                <label className="ho-input-label ho-font-grotesk">
                  Select Jockey <span className="text-secondary small fw-normal">(Only displaying jockeys in your connections)</span>
                </label>
                <select
                  value={formData.jockeyId}
                  onChange={(e) => setFormData({ ...formData, jockeyId: e.target.value })}
                  className="ho-form-input fw-semibold text-dark"
                >
                  {friendJockeys.length === 0 && <option value="">No jockeys in connections</option>}
                  {friendJockeys.map(j => (
                    <option key={j.id} value={j.id}>{j.fullName} (Win Rate: {j.winRate}%)</option>
                  ))}
                </select>
              </div>

              {/* Profit Sharing */}
              <div className="row g-3">
                <div className="col-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Horse Owner (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.ownerShare}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, ownerShare: val, jockeyShare: 100 - val });
                    }}
                    className="ho-form-input text-dark fw-bold"
                  />
                </div>
                <div className="col-6">
                  <label className="ho-input-label ho-font-grotesk">
                    Jockey (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.jockeyShare}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, jockeyShare: val, ownerShare: 100 - val });
                    }}
                    className="ho-form-input text-dark fw-bold"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end gap-3 align-items-center">
              <button
                onClick={() => setShowModal(false)}
                className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                style={{ textDecoration: 'none' }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="ho-btn ho-btn-gold-solid py-2 px-4 fw-bold"
                disabled={loading || readyHorses.length === 0 || friendJockeys.length === 0}
              >
                {loading ? 'Processing...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Registration Success Modal Dialog */}
      {showSuccessModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1050 }} onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content-custom animate-scale-up text-center" style={{ maxWidth: '450px', padding: '2.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-success mb-3" style={{ fontSize: '48px' }}>
              check_circle
            </span>
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-2" style={{ color: 'var(--ho-primary-dark)' }}>
              Registration Successful
            </h3>
            <p className="text-secondary small fw-medium mb-4" style={{ lineHeight: '1.5' }}>
              {successMsg}
            </p>
            
            <div className="d-flex justify-content-center pt-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="ho-btn ho-btn-gold-solid py-2 px-5 fw-bold text-uppercase"
                style={{ fontSize: '12px', letterSpacing: '0.5px' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
