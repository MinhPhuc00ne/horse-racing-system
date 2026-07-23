import React from 'react';
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

  // Logic trộn dữ liệu thực tế và mock
  const realActiveUpcoming = tournaments.filter(
    t => t.tournamentStatus === 'Active' || t.tournamentStatus === 'OPEN_FOR_REGISTER' || t.tournamentStatus === 'Upcoming'
  );
  
  const realOthers = tournaments.filter(
    t => !(t.tournamentStatus === 'Active' || t.tournamentStatus === 'OPEN_FOR_REGISTER' || t.tournamentStatus === 'Upcoming')
  );

  const combinedReal = [...realActiveUpcoming, ...realOthers];

  const displayList = [];
  for (let i = 0; i < 3; i++) {
    if (combinedReal[i]) {
      const t = combinedReal[i];
      displayList.push({
        image: i === 0 ? tournament1 : i === 1 ? tournament2 : tournament3,
        tag: t.tournamentStatus === 'Active' || t.tournamentStatus === 'OPEN_FOR_REGISTER' ? 'Đang Mở Cược' : (t.tournamentStatus === 'Finished' ? 'Đã Kết Thúc' : 'Sắp Diễn Ra'),
        title: t.tournamentName,
        location: t.location || 'Trường đua hệ thống',
        pool: t.totalPrize ? `${t.totalPrize.toLocaleString()} VND` : '0 VND',
      });
    } else {
      displayList.push(defaultMockTournaments[i]);
    }
  }

  return (
    <section id="tournaments" className="tournaments-section" aria-label="Upcoming tournaments">
      <div className="section-header-row">
        <div>
          <h2 className="section-main-title">Upcoming Tournaments</h2>
          <p className="section-subtitle">The most prestigious events in the racing calendar.</p>
        </div>
        <div className="carousel-controls" aria-hidden="true">
          <button className="control-btn" type="button">‹</button>
          <button className="control-btn" type="button">›</button>
        </div>
      </div>

      <div className="tournaments-grid">
        {displayList.map((tournament, idx) => (
          <article className="tournament-card" key={idx}>
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
