import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI } from '../../services/races';
import { placeBetAPI, getMyBetsAPI } from '../../services/bets';
import { getWalletBalanceAPI } from '../../services/wallet';
import { AuthContext } from '../../contexts/AuthContext';
import SpectatorLiveSimulation from './SpectatorLiveSimulation';

export default function SpectatorTournaments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  // Expanded states
  const [expandedTournament, setExpandedTournament] = useState(null);
  const [racesMap, setRacesMap] = useState({});
  const [loadingRaces, setLoadingRaces] = useState({});

  const [selectedRace, setSelectedRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Betting states
  const [walletBalance, setWalletBalance] = useState(0);
  const [myBets, setMyBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [betType, setBetType] = useState('WIN');
  const [betAmount, setBetAmount] = useState('');
  const [placingBet, setPlacingBet] = useState(false);

  // Live simulation states
  const [activeSimulationRace, setActiveSimulationRace] = useState(null);
  const [showPhotoFinishModal, setShowPhotoFinishModal] = useState(false);

  const loadWalletAndBets = async () => {
    if (!user) return;
    try {
      const balanceRes = await getWalletBalanceAPI();
      setWalletBalance(balanceRes.balance || 0);

      setLoadingBets(true);
      const betsRes = await getMyBetsAPI();
      setMyBets(betsRes || []);
    } catch (err) {
      console.error("Failed to load wallet balance or bets", err);
    } finally {
      setLoadingBets(false);
    }
  };

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await getTournamentsAPI();
        setTournaments(data || []);
      } catch (err) {
        console.error("Failed to load tournaments", err);
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, []);

  useEffect(() => {
    loadWalletAndBets();
  }, [user]);

  // AI Chatbot Auto-Fill Event Listener for Place Bet
  useEffect(() => {
    const handlePrefillPlaceBet = (e) => {
      const detail = e.detail || {};
      let data = detail;
      if (!data.amount && !data.raceId) {
        const storageStr = sessionStorage.getItem('ai_prefill_place_bet');
        if (storageStr) {
          try { data = JSON.parse(storageStr); } catch (err) {}
        }
      }

      if (data.amount) setBetAmount(data.amount.toString());
    };

    window.addEventListener('ai_prefill_place_bet', handlePrefillPlaceBet);

    const betStorage = sessionStorage.getItem('ai_prefill_place_bet');
    if (betStorage) handlePrefillPlaceBet({ detail: {} });

    return () => {
      window.removeEventListener('ai_prefill_place_bet', handlePrefillPlaceBet);
    };
  }, []);

  const handleTournamentClick = async (tId) => {
    setExpandedTournament(tId);
    
    if (racesMap[tId] && racesMap[tId].length > 0) {
      handleRaceClick(racesMap[tId][0]);
      return;
    }

    setLoadingRaces(prev => ({ ...prev, [tId]: true }));
    try {
      const racesData = await getTournamentRacesAPI(tId);
      setRacesMap(prev => ({ ...prev, [tId]: racesData || [] }));
      
      if (racesData && racesData.length > 0) {
        handleRaceClick(racesData[0]);
      } else {
        setSelectedRace(null);
      }
    } catch (err) {
      console.error(`Failed to fetch races for tournament ${tId}`, err);
    } finally {
      setLoadingRaces(prev => ({ ...prev, [tId]: false }));
    }
  };

  const handleRaceClick = async (race) => {
    setSelectedRace(race);
    setSelectedParticipant(null);
    setBetAmount('');
    setLoadingParticipants(true);
    setParticipants([]);
    try {
      const partData = await getRaceParticipantsAPI(race.id);
      setParticipants(partData || []);
    } catch (err) {
      console.error(`Failed to fetch participants for race ${race.id}`, err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handlePlaceBet = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      alert("Please log in to place a bet.");
      sessionStorage.setItem('postLoginRedirect', '/tournaments');
      navigate('/login?redirect=/tournaments');
      return;
    }
    if (!selectedParticipant) {
      alert("Please select a horse and jockey to place a bet.");
      return;
    }
    const amountVal = parseFloat(betAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    if (amountVal > walletBalance) {
      alert("Insufficient wallet balance. Please deposit more funds.");
      return;
    }

    setPlacingBet(true);
    try {
      await placeBetAPI({
        raceId: selectedRace.id,
        participantId: selectedParticipant.id,
        amount: amountVal,
        betType: betType
      });
      alert("Bet placed successfully!");
      setBetAmount('');
      setSelectedParticipant(null);
      await loadWalletAndBets();
    } catch (err) {
      alert(err.message || "Failed to place bet. Please try again.");
    } finally {
      setPlacingBet(false);
    }
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const nameMatch = t.tournamentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = !statusFilter || t.tournamentStatus?.toUpperCase() === statusFilter.toUpperCase();
    return nameMatch && statusMatch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'bg-warning text-dark';
      case 'OPEN_FOR_REGISTER': return 'bg-success text-white';
      case 'ACTIVE': return 'bg-danger text-white';
      case 'FINISHED': return 'bg-secondary text-white';
      default: return 'bg-dark text-white-50';
    }
  };

  const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'Upcoming';
      case 'OPEN_FOR_REGISTER': return 'Open';
      case 'CLOSED_FOR_REGISTER': return 'Closed';
      case 'ACTIVE': return 'Active';
      case 'FINISHED': return 'Finished';
      default: return status || 'Unknown';
    }
  };

  const currentRaceBets = selectedRace
    ? myBets.filter(b => b.raceId === selectedRace.id || b.raceId === parseInt(selectedRace.id))
    : [];

  const isBettingClosed = !selectedRace || !['OPEN_FOR_REGISTER', 'CLOSED_FOR_REGISTER', 'LOCKED_LIST'].includes(selectedRace.status?.toUpperCase());

  // Render Live Simulator if active
  if (activeSimulationRace) {
    return (
      <SpectatorLiveSimulation 
        race={activeSimulationRace} 
        onClose={() => {
          setActiveSimulationRace(null);
          loadWalletAndBets();
        }} 
      />
    );
  }

  return (
    <div className="py-4" style={{ backgroundColor: '#051009', color: '#e2e8f0', minHeight: '100vh' }}>
      <div className="container-fluid px-3 px-md-4" style={{ maxWidth: '1440px' }}>
        
        {/* Top Header Banner */}
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #07150c 0%, #0c2214 100%)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <div>
            <h2 className="fs-3 fw-bold text-white mb-1">
              Tournaments & <span style={{ color: '#ffd700' }}>Race Meetings</span>
            </h2>
            <p className="text-white-50 small m-0" style={{ fontSize: '0.92rem' }}>
              Look up ongoing tournaments, place Pari-Mutuel wagers, and watch live simulation broadcasts.
            </p>
          </div>
          
          {/* Wallet balance pill */}
          <div className="d-flex align-items-center gap-3 px-3 py-2 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <span className="material-symbols-outlined text-warning" style={{ fontSize: '24px' }}>account_balance_wallet</span>
            <div>
              <span className="text-white-50 d-block" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Wallet Balance</span>
              <strong className="text-success small" style={{ fontSize: '0.95rem' }}>{walletBalance.toLocaleString('en-US')} VND</strong>
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Left Column: Tournaments Search and Table */}
          <div className="col-12 col-lg-7">
            <div className="p-4 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#0c2214', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              
              {/* Search & Filter Toolbar */}
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <div className="position-relative flex-grow-1" style={{ maxWidth: '350px' }}>
                  <span className="material-symbols-outlined position-absolute text-white-50" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>search</span>
                  <input 
                    type="text" 
                    className="w-100 ps-5 pe-3 py-2 text-white rounded-3" 
                    placeholder="Search tournament name, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.3)', outline: 'none', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="dropdown" style={{ width: '200px', position: 'relative' }}>
                  <button 
                    className="btn w-100 d-flex justify-content-between align-items-center text-white" 
                    type="button" 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    style={{ backgroundColor: '#051009', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <span className="text-truncate text-start fw-medium d-flex align-items-center gap-2" style={{flex: 1}}>
                      {statusFilter === '' && 'All Statuses'}
                      {statusFilter === 'UPCOMING' && <><span className="d-inline-block rounded-circle bg-warning" style={{width:'8px',height:'8px'}}></span> Upcoming</>}
                      {statusFilter === 'OPEN_FOR_REGISTER' && <><span className="d-inline-block rounded-circle bg-success" style={{width:'8px',height:'8px'}}></span> Open</>}
                      {statusFilter === 'ACTIVE' && <><span className="d-inline-block rounded-circle bg-danger" style={{width:'8px',height:'8px'}}></span> Closed</>}
                      {statusFilter === 'FINISHED' && <><span className="d-inline-block rounded-circle bg-secondary" style={{width:'8px',height:'8px'}}></span> Finished</>}
                    </span>
                    <span className="material-symbols-outlined text-white-50" style={{fontSize: '18px'}}>expand_more</span>
                  </button>

                  {isStatusDropdownOpen && (
                    <>
                      <div className="position-fixed top-0 bottom-0 start-0 end-0" style={{zIndex: 99}} onClick={() => setIsStatusDropdownOpen(false)}></div>
                      <ul className="dropdown-menu w-100 shadow border-0 mt-2 p-2 show" style={{ backgroundColor: '#07150c', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', fontSize: '0.85rem', position: 'absolute', zIndex: 100 }}>
                        <li>
                          <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 text-white ${statusFilter === '' ? 'bg-warning text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter(''); setIsStatusDropdownOpen(false); }}>
                            All Statuses
                          </button>
                        </li>
                        <li>
                          <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 text-white ${statusFilter === 'UPCOMING' ? 'bg-warning text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('UPCOMING'); setIsStatusDropdownOpen(false); }}>
                            <span className="d-inline-block rounded-circle bg-warning me-2" style={{width:'8px',height:'8px'}}></span>
                            Upcoming
                          </button>
                        </li>
                        <li>
                          <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 text-white ${statusFilter === 'OPEN_FOR_REGISTER' ? 'bg-warning text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('OPEN_FOR_REGISTER'); setIsStatusDropdownOpen(false); }}>
                            <span className="d-inline-block rounded-circle bg-success me-2" style={{width:'8px',height:'8px'}}></span>
                            Open
                          </button>
                        </li>
                        <li>
                          <button className={`dropdown-item rounded mb-1 d-flex align-items-center py-2 text-white ${statusFilter === 'ACTIVE' ? 'bg-warning text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('ACTIVE'); setIsStatusDropdownOpen(false); }}>
                            <span className="d-inline-block rounded-circle bg-danger me-2" style={{width:'8px',height:'8px'}}></span>
                            Closed
                          </button>
                        </li>
                        <li>
                          <button className={`dropdown-item rounded d-flex align-items-center py-2 text-white ${statusFilter === 'FINISHED' ? 'bg-warning text-dark fw-bold' : ''}`} type="button" onClick={() => { setStatusFilter('FINISHED'); setIsStatusDropdownOpen(false); }}>
                            <span className="d-inline-block rounded-circle bg-secondary me-2" style={{width:'8px',height:'8px'}}></span>
                            Finished
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Tournaments list */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status"></div>
                  <p className="text-white-50 mt-2 small">Loading tournaments list...</p>
                </div>
              ) : filteredTournaments.length === 0 ? (
                <div className="text-center py-5 text-white-50 small">No matching tournaments found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', color: '#ffd700', fontSize: '0.85rem' }}>
                        <th>TOURNAMENT</th>
                        <th>LOCATION</th>
                        <th>TOTAL PURSE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.88rem' }}>
                      {filteredTournaments.map(t => {
                        const isExpanded = expandedTournament === t.id;
                        return (
                          <tr 
                            key={t.id} 
                            onClick={() => handleTournamentClick(t.id)} 
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <td>
                              <strong className="text-white d-block">{t.tournamentName}</strong>
                            </td>
                            <td className="text-white-50">{t.location || 'Main Track'}</td>
                            <td className="fw-bold text-warning">
                              {t.totalPrize ? `${(t.totalPrize / 1000000).toLocaleString('en-US')}M VND` : '100M VND'}
                            </td>
                            <td>
                              <span className={`badge px-2 py-1 ${getStatusBadgeClass(t.tournamentStatus)}`} style={{ fontSize: '0.72rem', borderRadius: '4px' }}>
                                {translateStatus(t.tournamentStatus)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Selected Race details, participants, betting and simulation */}
          <div className="col-12 col-lg-5">
            <div className="p-4 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#0c2214', border: '1px solid rgba(212, 175, 55, 0.25)', minHeight: '500px' }}>
              {selectedRace ? (
                <div className="d-flex flex-column h-100">
                  <h3 className="fw-bold text-warning mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
                    <span className="material-symbols-outlined text-warning">flag</span>
                    {selectedRace.raceTrackName || 'Race Details'}
                  </h3>

                  {/* Race Quick Info */}
                  <div className="row g-2 mb-3 p-3 rounded-3" style={{ backgroundColor: '#051009', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <div className="col-6">
                      <span className="small text-white-50 me-1">Race Date:</span>
                      <span className="fw-bold text-white small">{selectedRace.raceDate || 'Upcoming'}</span>
                    </div>
                    <div className="col-6">
                      <span className="small text-white-50 me-1">Start Time:</span>
                      <span className="fw-bold text-white small">{selectedRace.startTime || selectedRace.raceTime || 'Scheduled'}</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="small text-white-50 me-1">Distance:</span>
                      <span className="fw-bold text-warning small">{selectedRace.distance}m</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="small text-white-50 me-1">Surface Type:</span>
                      <span className="fw-bold text-white small">{selectedRace.surfaceType || 'Turf'}</span>
                    </div>
                  </div>

                  {/* Simulation entry button for running/finished races */}
                  {(selectedRace.status === 'RUNNING' || selectedRace.status === 'FINISHED') && (
                    <div className="mb-4">
                      <button 
                        className="btn fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', color: '#07150c', border: 'none', borderRadius: '8px' }}
                        onClick={() => {
                          if (selectedRace.status === 'FINISHED') {
                            setShowPhotoFinishModal(true);
                          } else {
                            setActiveSimulationRace(selectedRace);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined">
                          {selectedRace.status === 'FINISHED' ? 'photo_camera' : 'analytics'}
                        </span>
                        {selectedRace.status === 'FINISHED' ? 'VIEW PHOTO FINISH' : 'VIEW LIVE SIMULATION'}
                      </button>
                    </div>
                  )}

                  {/* Participant list */}
                  <h4 className="fs-6 fw-bold text-white mb-2">Competing Contenders & Jockeys</h4>
                  <p className="text-white-50 mb-3" style={{ fontSize: '0.8rem' }}>
                    {isBettingClosed ? '❌ Betting is currently closed for this race.' : '👉 Click a jockey below to select your wager:'}
                  </p>

                  {loadingParticipants ? (
                    <div className="text-center py-4 flex-grow-1">
                      <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                      <p className="text-white-50 small mt-2">Loading participant list...</p>
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-center py-4 text-white-50 small flex-grow-1">No horses registered for this race yet.</div>
                  ) : (
                    <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {participants.map(p => {
                        const isSelected = selectedParticipant?.id === p.id;
                        const canSelect = !isBettingClosed && p.status !== 'DISQUALIFIED';
                        return (
                          <div 
                            key={p.id} 
                            className="p-3 rounded-3 d-flex align-items-center justify-content-between cursor-pointer"
                            style={{ 
                              backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.2)' : '#051009',
                              border: isSelected ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.08)',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              if (!canSelect) return;
                              if (!user) {
                                sessionStorage.setItem('postLoginRedirect', '/tournaments');
                                navigate('/login?redirect=/tournaments');
                                return;
                              }
                              if (selectedParticipant?.id === p.id) {
                                setSelectedParticipant(null);
                              } else {
                                setSelectedParticipant(p);
                              }
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <span className="material-symbols-outlined text-warning fs-5">pets</span>
                              <div>
                                <strong className="text-white me-2" style={{ fontSize: '0.9rem' }}>{p.horseName}</strong>
                                <span className="text-white-50 d-block small" style={{ fontSize: '0.78rem' }}>
                                  Jockey: {p.jockeyName}
                                </span>
                              </div>
                            </div>
                            {isSelected && <span className="badge bg-warning text-dark fw-bold">SELECTED</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pari-Mutuel Betting Panel Form */}
                  {selectedParticipant && !isBettingClosed && (
                    <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#051009', border: '1px solid #ffd700' }}>
                      <h5 className="fw-bold text-warning fs-6 mb-3 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-warning">local_atm</span>
                        Pari-Mutuel Bet Slip
                      </h5>
                      
                      <div className="mb-3 text-white small">
                        Selected Horse: <strong className="text-warning">{selectedParticipant.horseName}</strong> (Jockey: {selectedParticipant.jockeyName})
                      </div>

                      <form onSubmit={handlePlaceBet}>
                        <div className="row g-2 mb-3">
                          <div className="col-12">
                            <label className="text-white-50 small mb-1">Bet Type Option</label>
                            <div className="d-flex flex-column gap-2 mt-1">
                              <div 
                                className="p-2 rounded-3 d-flex justify-content-between align-items-center cursor-pointer"
                                onClick={() => setBetType('WIN')}
                                style={{ 
                                  backgroundColor: betType === 'WIN' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)',
                                  border: betType === 'WIN' ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                <div>
                                  <span className="fw-bold text-white d-block" style={{fontSize: '12px'}}>WIN (1st Place Only)</span>
                                  <span className="text-white-50 d-block mt-1" style={{fontSize: '10px'}}>Highest Payout Multiplier</span>
                                </div>
                              </div>
                              <div 
                                className="p-2 rounded-3 d-flex justify-content-between align-items-center cursor-pointer"
                                onClick={() => setBetType('PLACE')}
                                style={{ 
                                  backgroundColor: betType === 'PLACE' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)',
                                  border: betType === 'PLACE' ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                <div>
                                  <span className="fw-bold text-white d-block" style={{fontSize: '12px'}}>PLACE (1st or 2nd Place)</span>
                                  <span className="text-white-50 d-block mt-1" style={{fontSize: '10px'}}>Balanced Payout Risk</span>
                                </div>
                              </div>
                              <div 
                                className="p-2 rounded-3 d-flex justify-content-between align-items-center cursor-pointer"
                                onClick={() => setBetType('SHOW')}
                                style={{ 
                                  backgroundColor: betType === 'SHOW' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)',
                                  border: betType === 'SHOW' ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                <div>
                                  <span className="fw-bold text-white d-block" style={{fontSize: '12px'}}>SHOW (Top 3 Finishers)</span>
                                  <span className="text-white-50 d-block mt-1" style={{fontSize: '10px'}}>Lowest Risk • Top 3 Qualification</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-12 mt-3">
                            <label className="text-white-50 small mb-1">Bet Amount (VND)</label>
                            <input 
                              type="number"
                              min="1000"
                              step="1000"
                              className="form-control text-white rounded-3"
                              placeholder="Enter wager amount..."
                              value={betAmount}
                              onChange={(e) => setBetAmount(e.target.value)}
                              required
                              style={{ backgroundColor: '#07150c', border: '1px solid rgba(212,175,55,0.3)', outline: 'none' }}
                            />
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary py-2 px-3 flex-grow-1 small"
                            onClick={() => setSelectedParticipant(null)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-warning fw-bold py-2 px-3 flex-grow-1 small text-dark"
                            disabled={placingBet || !betAmount}
                            style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}
                          >
                            {placingBet ? 'Submitting...' : 'Confirm Bet'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Bets Placed List */}
                  {currentRaceBets.length > 0 && (
                    <div className="mt-auto border-top border-secondary pt-3">
                      <h5 className="fw-bold text-white fs-6 mb-3 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }}>receipt_long</span>
                        Your Wagers in This Race
                      </h5>
                      
                      <div className="d-flex flex-column gap-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                        {currentRaceBets.map(bet => (
                          <div key={bet.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#051009', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div>
                              <strong className="text-white small d-block">{bet.horseName}</strong>
                              <span className="text-white-50 d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                Type: <strong className="text-warning">{bet.betType}</strong> | Wager: {bet.amount?.toLocaleString('en-US')} VND
                              </span>
                            </div>
                            <div className="text-end">
                              <span className={`badge ${
                                bet.status === 'WON' ? 'bg-success' :
                                bet.status === 'LOST' ? 'bg-danger' :
                                bet.status === 'REFUNDED' ? 'bg-secondary' :
                                'bg-warning text-dark'
                              } text-uppercase mb-1`} style={{ fontSize: '0.7rem', display: 'block' }}>
                                {bet.status}
                              </span>
                              {bet.status === 'WON' && (
                                <span className="text-success fw-bold d-block" style={{ fontSize: '0.8rem' }}>
                                  +{bet.payoutAmount?.toLocaleString('en-US')} VND
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center my-auto">
                  <span className="material-symbols-outlined text-white-50 mb-2" style={{ fontSize: '48px' }}>
                    touch_app
                  </span>
                  <p className="text-white-50 small" style={{ maxWidth: '320px', lineHeight: '1.6' }}>
                    Select a tournament on the left table to inspect race details, competing horses, jockeys, and place Pari-Mutuel bets.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Photo Finish Modal */}
        {showPhotoFinishModal && createPortal(
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content overflow-hidden" style={{ backgroundColor: '#07150c', border: '1px solid #d4af37' }}>
                <div className="modal-header border-0 position-absolute w-100 p-3" style={{ zIndex: 10 }}>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white ms-auto" 
                    onClick={() => setShowPhotoFinishModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-0 position-relative">
                  <div className="d-flex flex-column justify-content-center align-items-center text-white p-5" style={{ minHeight: '400px', backgroundColor: '#020905' }}>
                    <span className="material-symbols-outlined text-warning mb-3" style={{ fontSize: '56px' }}>
                      photo_camera
                    </span>
                    <h4 className="fw-bold text-warning">OFFICIAL 10,000 FPS PHOTO FINISH</h4>
                    <p className="text-white-50 text-center px-4" style={{ maxWidth: '500px' }}>
                      Optical line-scan photo finish verification image for race meeting <strong>{selectedRace?.raceTrackName || selectedRace?.tournamentName}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}
