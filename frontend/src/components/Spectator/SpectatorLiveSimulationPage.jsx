import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getActiveRacesAPI, getTournamentsAPI } from '../../services/races';
import { AuthContext } from '../../contexts/AuthContext';
import SpectatorLiveSimulation from './SpectatorLiveSimulation';
import '../../pages/Spectator/Spectator.css';
import heroImg from '../../assets/hero_horse_racing.png';

export default function SpectatorLiveSimulationPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSimulationRace, setActiveSimulationRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);

  const findActiveLiveRace = async () => {
    try {
      const activeRaces = await getActiveRacesAPI();
      if (activeRaces && activeRaces.length > 0) {
        const active = activeRaces[0];
        return {
          id: active.id || active.raceId,
          raceName: active.raceName,
          trackShape: active.trackShape || 'STRAIGHT',
          distance: active.distance || 1200,
          status: active.status,
          raceTrackName: active.raceTrackName || 'International Turf Racecourse',
          surfaceType: active.surfaceType || 'Turf - Bermuda Grade A'
        };
      }
    } catch (err) {
      console.error("Error finding active live race:", err);
    }
    return null;
  };

  useEffect(() => {
    let isCancelled = false;

    const checkActiveRace = async () => {
      try {
        const activeRace = await findActiveLiveRace();
        if (isCancelled) return;

        if (activeRace) {
          if (!activeSimulationRace || activeSimulationRace.id !== activeRace.id || activeSimulationRace.status !== activeRace.status) {
            setActiveSimulationRace(activeRace);
          }
        } else {
          if (activeSimulationRace && activeSimulationRace.id !== 999) {
            setActiveSimulationRace(null);
          }
        }

        // Fetch upcoming tournaments for broadcast schedule
        const tData = await getTournamentsAPI();
        if (Array.isArray(tData)) {
          setUpcomingTournaments(tData.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    checkActiveRace();
    const interval = setInterval(checkActiveRace, 3000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeSimulationRace]);

  const handleLaunchDemoRace = () => {
    setActiveSimulationRace({
      id: 999,
      raceName: "Summer Championship Cup 2026 (Live Demo)",
      trackShape: "OVAL",
      distance: 1200,
      status: "RUNNING",
      raceTrackName: "International Turf Racecourse",
      surfaceType: "Turf - Bermuda Grade A"
    });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh', backgroundColor: '#051009', color: '#fff' }}>
        <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="text-warning fw-bold small">Scanning Live TV Signal & Telemetry Stream...</p>
      </div>
    );
  }

  // Active Broadcast Canvas View (Real race or Demo race)
  if (activeSimulationRace) {
    return (
      <div className="py-3 px-2" style={{ backgroundColor: '#051009', minHeight: '100vh' }}>
        <Container fluid="lg">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ backgroundColor: '#07150c', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-danger py-2 px-3 text-uppercase d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', borderRadius: '20px' }}>
                <span className="d-inline-block rounded-circle bg-white animate-pulse" style={{ width: '8px', height: '8px' }}></span> LIVE BROADCAST
              </span>
              <div>
                <h3 className="m-0 text-white fw-bold" style={{ fontSize: '1.25rem' }}>{activeSimulationRace.raceName}</h3>
                <span className="text-white-50 small">{activeSimulationRace.raceTrackName} • {activeSimulationRace.surfaceType} • {activeSimulationRace.distance}m</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSimulationRace(null)}
              className="btn btn-outline-warning btn-sm fw-bold d-flex align-items-center gap-1 mt-2 mt-sm-0"
              style={{ borderRadius: '6px' }}
            >
              <span className="material-symbols-outlined fs-6">close</span>
              <span>Exit Broadcast</span>
            </button>
          </div>

          <SpectatorLiveSimulation
            race={activeSimulationRace}
            onClose={() => setActiveSimulationRace(null)}
          />
        </Container>
      </div>
    );
  }

  // Live Broadcast Hub Screen (Offline Standby)
  return (
    <div className="py-4" style={{ backgroundColor: '#051009', color: '#e2e8f0', minHeight: '100vh' }}>
      <Container fluid="lg">

        {/* 1. HERO BROADCAST BANNER */}
        <div className="p-4 p-md-5 rounded-4 mb-4" style={{ background: 'linear-gradient(135deg, #07150c 0%, #0c2214 100%)', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
          <Row className="align-items-center g-4">
            <Col xs={12} lg={8}>
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill bg-warning bg-opacity-25 border border-warning text-warning fw-bold" style={{ fontSize: '0.78rem' }}>
                <span className="material-symbols-outlined fs-6">podcasts</span>
                <span>REAL-TIME 10,000 FPS BROADCAST CHANNEL</span>
              </div>

              <h1 className="fw-extrabold text-white display-5 mb-3">
                Live Simulation <span style={{ color: '#ffd700' }}>Broadcast Center</span>
              </h1>

              <p className="text-white-50 lead mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '720px' }}>
                Experience high-precision live equine telemetry, millisecond photo-finish optical timing, and real-time 3D race simulation stream.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Button
                  onClick={handleLaunchDemoRace}
                  className="fw-bold px-4 py-2.5 d-flex align-items-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', color: '#07150c', border: 'none', borderRadius: '8px' }}
                >
                  <span className="material-symbols-outlined fs-5">play_circle</span>
                  <span>Launch Live Simulation Demo</span>
                </Button>

                <Button
                  onClick={() => navigate('/tournaments')}
                  variant="outline-light"
                  className="fw-semibold px-4 py-2.5 d-flex align-items-center gap-2"
                  style={{ borderRadius: '8px' }}
                >
                  <span className="material-symbols-outlined fs-5">calendar_month</span>
                  <span>Tournament Schedule</span>
                </Button>
              </div>
            </Col>

            <Col xs={12} lg={4} className="text-center">
              <div className="p-4 rounded-3 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span className="material-symbols-outlined text-warning mb-2 animate-pulse" style={{ fontSize: '56px' }}>live_tv</span>
                <h5 className="fw-bold text-white mb-1">CHANNEL STATUS: STANDBY</h5>
                <p className="text-white-50 small mb-3">No official race is currently running on the server.</p>
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-dark border border-secondary text-white-50" style={{ fontSize: '0.78rem' }}>
                  <span className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ width: '8px', height: '8px' }}></span>
                  <span>Listening for referee signal...</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* 2. TELEMETRY & TRACK CONDITIONS PANEL */}
        <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
          <span className="material-symbols-outlined text-warning fs-5">sensors</span>
          Racecourse Telemetry & Track Metrics
        </h3>

        <Row className="g-3 mb-5">
          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">grass</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Surface Type</div>
              <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>Turf Grade A</div>
            </div>
          </Col>

          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">thermostat</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Weather</div>
              <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>26°C / Clear Sky</div>
            </div>
          </Col>

          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">speed</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Top Track Speed</div>
              <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>68.5 km/h</div>
            </div>
          </Col>

          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">photo_camera</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>Photo-Finish</div>
              <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>10,000 fps Ready</div>
            </div>
          </Col>

          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">nfc</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>RFID Frequency</div>
              <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>50Hz Realtime</div>
            </div>
          </Col>

          <Col xs={6} sm={4} lg={2}>
            <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
              <span className="material-symbols-outlined text-warning fs-4 mb-1">videocam</span>
              <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>VAR Cameras</div>
              <div className="fw-bold text-white" style={{ fontSize: '0.9rem' }}>8 Angles Active</div>
            </div>
          </Col>
        </Row>

        {/* 3. UPCOMING RACE SCHEDULE & RECORD HIGHLIGHTS */}
        <Row className="g-4">
          <Col xs={12} lg={7}>
            <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <span className="material-symbols-outlined text-warning fs-5">event_upcoming</span>
              Upcoming Championship Races
            </h3>

            {upcomingTournaments.length === 0 ? (
              <div className="p-4 rounded-3 text-center text-white-50" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)' }}>
                No scheduled tournaments currently available.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ backgroundColor: '#09190e', border: '1px solid rgba(212,175,55,0.2)', transition: 'all 0.2s' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle p-3 d-flex align-items-center justify-content-center text-warning" style={{ backgroundColor: 'rgba(212,175,55,0.15)', width: '48px', height: '48px' }}>
                        <span className="material-symbols-outlined fs-4">trophy</span>
                      </div>
                      <div>
                        <h5 className="m-0 text-white fw-bold" style={{ fontSize: '1rem' }}>{tournament.tournamentName}</h5>
                        <div className="text-white-50 small mt-1">
                          Location: {tournament.location || 'Main Racecourse'} • Starts: {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Upcoming'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 ms-auto">
                      <div className="text-end">
                        <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>{tournament.prizePool ? `${tournament.prizePool.toLocaleString()} VND` : '100,000,000 VND'}</div>
                        <div className="text-white-50" style={{ fontSize: '0.75rem' }}>Prize Purse</div>
                      </div>

                      <Button
                        onClick={() => navigate('/tournaments')}
                        variant="warning"
                        size="sm"
                        className="fw-bold px-3"
                        style={{ color: '#07150c', borderRadius: '6px' }}
                      >
                        View Race
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Col>

          {/* 4. TRACK RECORD & CHAMPION HIGHLIGHT */}
          <Col xs={12} lg={5}>
            <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2" style={{ fontSize: '1.25rem' }}>
              <span className="material-symbols-outlined text-warning fs-5">stars</span>
              Track Record Highlight
            </h3>

            <div className="p-4 rounded-3 overflow-hidden position-relative" style={{ background: 'linear-gradient(135deg, #09190e 0%, #0c2214 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <img src={heroImg} alt="Stellar Majesty" className="rounded-3 object-fit-cover" style={{ width: '80px', height: '80px', border: '1px solid #ffd700' }} />
                <div>
                  <span className="badge bg-warning text-dark fw-bold mb-1" style={{ fontSize: '0.72rem' }}>UNDEFEATED RECORD</span>
                  <h4 className="m-0 text-white fw-bold" style={{ fontSize: '1.15rem' }}>Stellar Majesty</h4>
                  <span className="text-white-50 small">Thoroughbred • Rider: Clarissa Sterling</span>
                </div>
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-white-50 small">Best 1400m Record:</span>
                  <span className="fw-bold text-warning" style={{ fontSize: '1.1rem' }}>1m 21.345s</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-white-50 small">Win Rate Rating:</span>
                  <span className="fw-bold text-success" style={{ fontSize: '0.9rem' }}>98.4 Rating (78.5% Win)</span>
                </div>
              </div>

              <p className="text-white-50 small m-0" style={{ lineHeight: '1.5' }}>
                Equipped with RFID telemetry sensor #01. Holds the all-time track record for fastest 400m home straight acceleration.
              </p>
            </div>
          </Col>
        </Row>

      </Container>
    </div>
  );
}
