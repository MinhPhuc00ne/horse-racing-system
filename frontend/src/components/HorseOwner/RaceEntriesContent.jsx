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

  // Filter only READY horses (case-insensitive)
  const readyHorses = horses.filter(h => h.status && h.status.toUpperCase() === 'READY');
  // Filter only jockeys who are friends
  const friendJockeys = systemUsers.filter(u => u.role === 'JOCKEY' && u.friendStatus === 'FRIEND');

  const handleRegisterClick = (race) => {
    setSelectedRace(race);
    setIsUpdating(false);
    setUpdateRegId(null);

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

  const handleUpdateClick = (race) => {
    setSelectedRace(race);
    setIsUpdating(true);
    setUpdateRegId(race.myRegistration.id);

    const allowed = race.allowedClasses ? race.allowedClasses.split(',').map(s => s.trim().toUpperCase()) : [];
    const eligibleHorses = readyHorses.filter(h => {
      if (allowed.length === 0) return true;
      return h.breed && allowed.includes(h.breed.trim().toUpperCase());
    });

    // Find currently registered horse if present in user stable, else fallback to first eligible
    const currentHorse = horses.find(h => h.name === race.myRegistration.horseName);
    const horseIdVal = currentHorse ? currentHorse.id : (eligibleHorses.length > 0 ? eligibleHorses[0].id : '');

    // Find currently registered jockey if present in friends list
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
      ? 'CẢNH BÁO: Đăng ký này đã được phê duyệt. Theo quy định, nếu bạn RÚT LUI lúc này, bạn sẽ KHÔNG được hoàn lệ phí tham gia.\n\nBạn có chắc chắn muốn rút lui?'
      : 'Bạn có chắc chắn muốn hủy đăng ký này không? Lệ phí tham gia sẽ được hoàn lại 100% vào ví của bạn.';

    if (!window.confirm(warningMsg)) {
      return;
    }

    try {
      setLoading(true);
      await cancelRaceRegistrationAPI(reg.id);

      // Clean local storage
      const savedLocal = localStorage.getItem('owner_registered_races') || '[]';
      const localList = JSON.parse(savedLocal).filter(l => l.raceId !== reg.raceId);
      localStorage.setItem('owner_registered_races', JSON.stringify(localList));

      await refreshData();

      setSuccessMsg(isApproved
        ? 'Rút lui thành công! Lệ phí thi đấu không được hoàn lại theo điều lệ.'
        : 'Hủy đăng ký và hoàn lại lệ phí thi đấu thành công!');
      setShowSuccessModal(true);
    } catch (err) {
      alert("Hủy đăng ký thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!formData.horseId || !formData.jockeyId) {
      alert("Vui lòng chọn cả ngựa và nài ngựa.");
      return;
    }

    const ownerS = parseFloat(formData.ownerShare);
    const jockeyS = parseFloat(formData.jockeyShare);

    if (isNaN(ownerS) || isNaN(jockeyS) || Math.abs((ownerS + jockeyS) - 100) > 0.001) {
      alert("Tổng tỷ lệ chia lợi nhuận phải bằng 100%.");
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

      // Save locally to local storage for persistence across reloads
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
        ? `Cập nhật đăng ký thành công cho ngựa ${selectedHorseObj?.name} và Jockey ${selectedJockeyObj?.fullName}!`
        : `Đăng ký thành công ngựa ${selectedHorseObj?.name} với Jockey ${selectedJockeyObj?.fullName} cho giải đấu ${selectedRace.tournamentName}!`);

      setShowModal(false);
      setShowSuccessModal(true);
      setIsUpdating(false);
      setUpdateRegId(null);
    } catch (err) {
      alert((isUpdating ? "Cập nhật" : "Đăng ký") + " thất bại: " + err.message);
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
                    <span className="fw-bold text-dark">Track Shape:</span>
                    <span>{String(race.trackShape).toUpperCase() === 'OVAL' ? 'Sân vòng tròn' : 'Sân thẳng'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom border-light">
                    <span className="fw-bold text-dark">Entry Fee:</span>
                    <span>{race.entryFee ? `${race.entryFee.toLocaleString()} VND` : 'Free'}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 align-items-center mb-2">
                    <span className="fw-bold text-dark">Status:</span>
                    <StatusBadge status={race.myRegistration ? (race.myRegistration.status === 'APPROVED' ? 'READY' : race.myRegistration.status) : race.status} />
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

                {race.myRegistration ? (
                  <div className="d-flex flex-column gap-2 w-100">
                    <div className="p-2 rounded border" style={{ backgroundColor: 'rgba(0,0,0,0.02)', fontSize: '13px', borderColor: 'var(--ho-border-gold)' }}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary fw-semibold">Chiến mã:</span>
                        <span className="fw-bold text-dark">{race.myRegistration.horseName}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary fw-semibold">Jockey:</span>
                        <span className="fw-bold text-dark">{race.myRegistration.jockeyName}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-secondary fw-semibold">Trạng thái:</span>
                        <span className="badge" style={{
                          backgroundColor: race.myRegistration.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : race.myRegistration.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: race.myRegistration.status === 'APPROVED' ? '#10b981' : race.myRegistration.status === 'PENDING' ? '#f59e0b' : '#3b82f6',
                          border: `1px solid ${race.myRegistration.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.3)' : race.myRegistration.status === 'PENDING' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {race.myRegistration.status === 'APPROVED' ? 'Đã phê duyệt' : race.myRegistration.status === 'PENDING' ? 'Chờ Admin duyệt' : 'Chờ Jockey xác nhận'}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2 w-100">
                      <button
                        onClick={() => handleUpdateClick(race)}
                        className="ho-btn ho-btn-outline-dark-green w-50 py-2 fw-bold"
                        style={{ border: '1px solid var(--ho-primary-dark)', borderRadius: '8px', color: 'var(--ho-primary-dark)', background: 'transparent' }}
                        disabled={race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER'}
                      >
                        Đổi thông tin
                      </button>
                      <button
                        onClick={() => handleCancelClick(race.myRegistration)}
                        className="btn btn-danger w-50 py-2 fw-bold text-white"
                        style={{ borderRadius: '8px', backgroundColor: '#ef4444', border: 'none' }}
                        disabled={race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER'}
                      >
                        Rút lui
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegisterClick(race)}
                    className={`ho-btn ${(race.status === 'Active' || race.status === 'OPEN_FOR_REGISTER') ? 'ho-btn-gold-solid' : 'btn-secondary'} w-100 py-2 fw-bold`}
                    disabled={race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER'}
                    style={(race.status !== 'Active' && race.status !== 'OPEN_FOR_REGISTER') ? { backgroundColor: '#cccccc', color: '#666666', border: '1px solid #bbbbbb', cursor: 'not-allowed' } : {}}
                  >
                    {(race.status === 'Active' || race.status === 'OPEN_FOR_REGISTER')
                      ? 'Đăng ký tham gia'
                      : race.status === 'Upcoming'
                        ? 'Chưa mở đăng ký'
                        : 'Đã đóng đăng ký'}
                  </button>
                )}
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
              {isUpdating ? 'Cập nhật đăng ký cho' : 'Đăng ký tham gia'} {selectedRace?.tournamentName}
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
                onClick={() => { setShowModal(false); setIsUpdating(false); setUpdateRegId(null); }}
                className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                style={{ textDecoration: 'none' }}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="ho-btn ho-btn-gold-solid py-2 px-4 fw-bold"
                disabled={loading || readyHorses.length === 0 || friendJockeys.length === 0}
              >
                {loading ? 'Đang xử lý...' : (isUpdating ? 'Xác nhận thay đổi' : 'Xác nhận đăng ký')}
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
