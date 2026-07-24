import { useState } from 'react';
import DataCard from '../ui/DataCard';
import StatusBadge from '../ui/StatusBadge';
import { useJockey } from '../../contexts/JockeyContext';

export default function JockeyRacesContent() {
  const [activeTab, setActiveTab] = useState('my-schedule'); // 'my-schedule' | 'all-races'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { schedule, tournaments } = useJockey();

  // Search filter for all races
  const filteredRaces = tournaments.filter(race => 
    race.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.raceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    race.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4" style={{ borderColor: 'rgba(212, 175, 55, 0.25)' }}>
        <div>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1 text-white">
            Schedule & Tournaments
          </h2>
          <p className="small m-0" style={{ color: '#cbd5e1' }}>
            Track the races you are about to participate in and view all tournament details.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={() => setActiveTab('my-schedule')}
          className={`ho-tab-btn ${activeTab === 'my-schedule' ? 'ho-tab-btn-active' : ''}`}
        >
          My Schedule ({schedule.length})
        </button>
        <button
          onClick={() => setActiveTab('all-races')}
          className={`ho-tab-btn ${activeTab === 'all-races' ? 'ho-tab-btn-active' : ''}`}
        >
          System Tournaments ({tournaments.length})
        </button>
      </div>

      {/* TAB 1: MY SCHEDULE */}
      {activeTab === 'my-schedule' && (
        <div className="row g-4">
          {schedule.length === 0 ? (
            <div className="col-12 text-center py-5 glass-card italic" style={{ color: '#cbd5e1' }}>
              You have not registered or agreed to participate in any upcoming races.
              Please review invitations in the "Invitations" tab to get started.
            </div>
          ) : (
            schedule.map((race, index) => (
              <div key={race.id || index} className="col-12 col-md-6 col-lg-4">
                <DataCard 
                  title={race.tournamentName} 
                  subtitle={`${race.raceDate} at ${race.raceTime}`}
                  interactive={true}
                >
                  <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span className="fw-bold text-white">Horse Owner:</span>
                      <span className="small" style={{ color: '#cbd5e1' }}>{race.ownerName} ({race.stableName})</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span className="fw-bold text-white">Horse:</span>
                      <span className="small" style={{ color: '#cbd5e1' }}>{race.horseName} ({race.horseBreed})</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span className="fw-bold text-white">Location:</span>
                      <span className="small text-truncate ms-2" style={{ maxWidth: '150px', color: '#cbd5e1' }}>{race.location}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span className="fw-bold text-white">Starting Gate:</span>
                      <span className="fw-bold text-warning">Gate #{race.gateNumber || index + 1}</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                      <span className="fw-bold text-white">Prize Share:</span>
                      <span className="fw-bold text-success">{race.jockeyShare}%</span>
                    </div>
                    <div className="d-flex justify-content-between py-1 align-items-center">
                      <span className="fw-bold text-white">Status:</span>
                      <StatusBadge status="READY" />
                    </div>
                  </div>

                  <div className="mt-3 p-2 text-center rounded fw-semibold text-success small" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    Confirmed Participant
                  </div>
                </DataCard>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL SYSTEM TOURNAMENTS */}
      {activeTab === 'all-races' && (
        <div className="d-flex flex-column gap-4">
          {/* Search Filter Bar */}
          <div className="p-3 glass-card mb-2">
            <div className="position-relative">
              <span className="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-3" style={{ color: '#cbd5e1' }}>
                search
              </span>
              <input
                type="text"
                placeholder="Search tournaments, races, or racetracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ho-form-input ps-5"
              />
            </div>
          </div>

          {/* List of Races */}
          <div className="row g-4">
            {filteredRaces.length === 0 ? (
              <div className="col-12 text-center py-5 glass-card italic" style={{ color: '#cbd5e1' }}>
                No races matched your search keyword.
              </div>
            ) : (
              filteredRaces.map((race, index) => {
                const totalParticipants = race.participants ? race.participants.length : 0;
                return (
                  <div key={race.id || index} className="col-12 col-md-6 col-lg-4">
                    <DataCard 
                      title={`${race.tournamentName}`} 
                      subtitle={`${race.date} at ${race.time}`}
                      interactive={true}
                    >
                      <div className="d-flex flex-column gap-2 mb-3">
                        <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                          <span className="fw-bold text-white">Location:</span>
                          <span className="small text-truncate ms-2" style={{ maxWidth: '160px', color: '#cbd5e1' }}>{race.location}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                          <span className="fw-bold text-white">Track Type:</span>
                          <span className="small" style={{ color: '#cbd5e1' }}>{race.trackType}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                          <span className="fw-bold text-white">Total Prize Pool:</span>
                          <span className="fw-bold text-success small">{race.prizePool}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                          <span className="fw-bold text-white">Participants:</span>
                          <span className="small" style={{ color: '#cbd5e1' }}>{totalParticipants} horses</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 align-items-center">
                          <span className="fw-bold text-white">Status:</span>
                          <StatusBadge status={race.status === 'OPEN_FOR_REGISTER' ? 'Registration Open' : race.status} />
                        </div>
                      </div>

                      <div className="mt-3 p-2 rounded text-center small fw-medium" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#cbd5e1', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        {race.status === 'OPEN_FOR_REGISTER' ? 'Awaiting Horse Owner Registration' : 'Tournament Starting Soon'}
                      </div>
                    </DataCard>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
