import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { getTournamentsAPI, getTournamentRacesAPI, getRaceParticipantsAPI, getActiveRacesAPI } from '../../services/races';
import { placeBetAPI, getMyBetsAPI } from '../../services/bets';
import { getWalletBalanceAPI } from '../../services/wallet';
import { AuthContext } from '../../contexts/AuthContext';
import SpectatorLiveSimulation from './SpectatorLiveSimulation';
import '../../pages/Spectator/Spectator.css';

const isMockMode = () => {
  return false;
};

export default function SpectatorLiveSimulationPage() {
  const { user } = useContext(AuthContext);
  const [activeSimulationRace, setActiveSimulationRace] = useState(null);
  const [loading, setLoading] = useState(true);

  const findActiveLiveRace = async () => {
    try {
      const activeRaces = await getActiveRacesAPI();
      if (activeRaces && activeRaces.length > 0) {
        const active = activeRaces[0];
        return {
          id: active.id || active.raceId,
          raceName: active.raceName,
          trackShape: active.trackShape || 'STRAIGHT',
          distance: active.distance || 1000,
          status: active.status,
          raceTrackName: active.raceTrackName || 'Official Racetrack',
          surfaceType: active.surfaceType || 'Turf'
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
          // Only update if it changed or not set
          if (!activeSimulationRace || activeSimulationRace.id !== activeRace.id || activeSimulationRace.status !== activeRace.status) {
            setActiveSimulationRace(activeRace);
          }
        } else {
          if (activeSimulationRace) {
            setActiveSimulationRace(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    checkActiveRace();
    // Poll every 2 seconds to check if a race was started/created
    const interval = setInterval(checkActiveRace, 2000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [activeSimulationRace]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status"></div>
        <p className="text-secondary mt-3 small">Scanning Live TV system...</p>
      </div>
    );
  }

  if (activeSimulationRace) {
    return (
      <SpectatorLiveSimulation
        race={activeSimulationRace}
        onClose={() => {
          // Clear demo status if closing demo race
          if (activeSimulationRace.id === 999) {
            localStorage.removeItem('demo_race_status');
            localStorage.removeItem('demo_race_start_time');
          }
          setActiveSimulationRace(null);
        }}
      />
    );
  }

  // Render Premium "No Signal / Offline" TV page
  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="ho-font-epilogue fs-4 fw-bold text-dark m-0">Live Simulation TV</h2>
            <span className="badge bg-secondary border border-secondary-subtle py-1 px-2 text-uppercase d-flex align-items-center gap-1" style={{ fontSize: '10px', borderRadius: '4px' }}>
              <span className="d-inline-block rounded-circle bg-danger animate-pulse" style={{ width: '6px', height: '6px' }}></span> OFFLINE
            </span>
          </div>
          <p className="text-secondary small m-0">Live broadcast channel for ongoing races in the system.</p>
        </div>
      </div>

      <div className="sim-container">
        <div className="glass-sim-card w-100 p-0 overflow-hidden" style={{ minHeight: '520px', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', borderRadius: '16px' }}>

          {/* TV Screen Placeholder */}
          <div className="d-flex flex-column align-items-center justify-content-center text-center text-white p-5" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, #090c13 0%, #151b26 100%)' }}>

            {/* Retro Static/Noise lines background layer */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: 'radial-gradient(circle, transparent 20%, #000 120%), linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
              backgroundSize: '100% 100%, 100% 4px',
              opacity: 0.15,
              pointerEvents: 'none'
            }}></div>

            {/* Simulated Radar Scanline */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
              pointerEvents: 'none'
            }}></div>

            <span className="material-symbols-outlined text-muted mb-3 animate-pulse" style={{ fontSize: '72px', color: 'rgba(255,255,255,0.15)' }}>
              live_tv
            </span>

            <h4 className="fw-bold ho-font-epilogue mb-2 text-uppercase text-secondary tracking-widest" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', letterSpacing: '4px' }}>
              LIVE TV SYSTEM - NO ONGOING RACE
            </h4>

            <p className="text-secondary small px-4 mb-4" style={{ maxWidth: '500px', color: '#6b7280', fontSize: '13px', lineHeight: '1.6' }}>
              There are currently no races online. When the Organizer / Referee starts preparing a new match, this screen will automatically connect and broadcast the race board in real time.
            </p>

            {/* Pulse Indicator */}
            <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-dark bg-opacity-50" style={{ fontSize: '11px', color: '#9ca3af', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ width: '8px', height: '8px' }}></span>
              <span>Listening for signal from Referee...</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
