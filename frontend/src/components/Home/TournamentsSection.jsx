import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tournament1 from '../../assets/background1.jpg';
import tournament2 from '../../assets/background2.jpg';
import tournament3 from '../../assets/background3.jpg';

const defaultMockTournaments = [
  {
    image: tournament1,
    tag: 'Premium Event',
    title: 'Emerald Derby 2024',
    location: 'Dubai International Track',
    pool: '$1.5M Pool',
  },
  {
    image: tournament2,
    tag: 'Invitational',
    title: 'Sovereign Cup',
    location: 'Kentucky Downs, USA',
    pool: '$800K Pool',
  },
  {
    image: tournament3,
    tag: 'Night Racing',
    title: 'Midnight Sprint',
    location: 'Tokyo City Track',
    pool: '$1.2M Pool',
  },
];

export default function TournamentsSection({ tournaments = [] }) {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);

  // Logic to merge real and mock data - any tournament status is fine
  const combinedReal = tournaments;
  const totalItemsCount = 6;
  const maxIndex = totalItemsCount - 3; // 3 visible cards at a time

  const displayList = [];
  for (let i = 0; i < totalItemsCount; i++) {
    if (combinedReal[i]) {
      const t = combinedReal[i];
      displayList.push({
        image: i % 3 === 0 ? tournament1 : i % 3 === 1 ? tournament2 : tournament3,
        tag: (() => {
          const s = t.tournamentStatus?.toUpperCase();
          if (s === 'ACTIVE' || s === 'OPEN_FOR_REGISTER') return 'Open for Betting';
          if (s === 'FINISHED' || s === 'COMPLETED') return 'Finished';
          return 'Upcoming';
        })(),
        title: t.tournamentName,
        location: t.location || 'System Racetrack',
        pool: t.totalPrize ? `${t.totalPrize.toLocaleString()} VND` : '0 VND',
      });
    } else {
      // pad with mock data
      const mockIndex = i % defaultMockTournaments.length;
      displayList.push(defaultMockTournaments[mockIndex]);
    }
  }

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Get currently visible cards
  const visibleTournaments = displayList.slice(startIndex, startIndex + 3);

  return (
    <section id="tournaments" className="tournaments-section" aria-label="Upcoming tournaments">
      <div className="section-header-row">
        <div>
          <h2 className="section-main-title">Upcoming Tournaments</h2>
          <p className="section-subtitle">The most prestigious events in the racing calendar.</p>
        </div>
        <div className="carousel-controls">
          <button 
            className="control-btn" 
            type="button" 
            onClick={handlePrev}
            disabled={startIndex === 0}
            style={{ opacity: startIndex === 0 ? 0.35 : 1, cursor: startIndex === 0 ? 'not-allowed' : 'pointer' }}
          >
            ‹
          </button>
          <button 
            className="control-btn" 
            type="button" 
            onClick={handleNext}
            disabled={startIndex === maxIndex}
            style={{ opacity: startIndex === maxIndex ? 0.35 : 1, cursor: startIndex === maxIndex ? 'not-allowed' : 'pointer' }}
          >
            ›
          </button>
        </div>
      </div>

      <div className="tournaments-grid">
        {visibleTournaments.map((tournament, idx) => (
          <article className="tournament-card" key={startIndex + idx}>
            <img src={tournament.image} alt={tournament.title} className="tournament-card-img" />
            <div className="tournament-card-overlay" />
            <div className="tournament-card-content">
              <span className="badge-gold">{tournament.tag}</span>
              <h3 className="tournament-title">{tournament.title}</h3>
              <p className="tournament-location">{tournament.location}</p>
              <div className="tournament-footer">
                <span className="pool-amount">{tournament.pool}</span>
                <button className="details-link-btn" type="button" onClick={() => navigate('/tournaments')}>Bet Now →</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
