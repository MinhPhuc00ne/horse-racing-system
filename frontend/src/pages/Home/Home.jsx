import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Home.css';
import HeroSection from '../../components/Home/HeroSection';
import StatsSection from '../../components/Home/StatsSection';
import TournamentsSection from '../../components/Home/TournamentsSection';
import RankingBoard from '../../components/Home/RankingBoard';
import { getPublicLeaderboardAPI } from '../../services/publicApi';

const getInitials = (name) => {
  if (!name) return 'JK';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const defaultHorseRankings = [
  {
    rank: '01',
    avatar: '♞',
    name: 'Stellar Majesty',
    detail: 'Thoroughbred',
    metric: '98.4 Rating',
    status: 'Undefeated',
    featured: true,
  },
  {
    rank: '02',
    avatar: '♞',
    name: 'Golden Phantom',
    detail: 'Arabian',
    metric: '95.8 Rating',
    status: 'Rising',
  },
  {
    rank: '03',
    avatar: '♞',
    name: 'Emerald Baron',
    detail: 'Quarter Horse',
    metric: '94.6 Rating',
    status: 'In Form',
  },
];

const defaultJockeyRankings = [
  {
    rank: '01',
    avatar: 'CS',
    name: 'Clarissa Sterling',
    detail: 'Score: 2450',
    metric: '78.5% Win',
    status: 'Top Seeding',
    featured: true,
  },
  {
    rank: '02',
    avatar: 'MR',
    name: 'Marcus Rhone',
    detail: 'Score: 2310',
    metric: '65.2% Win',
    status: 'Elite',
  },
  {
    rank: '03',
    avatar: 'ER',
    name: 'Elena Rodriguez',
    detail: 'Score: 2190',
    metric: '61.0% Win',
    status: 'Contender',
  },
];

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [horseRankings, setHorseRankings] = useState(defaultHorseRankings);
  const [jockeyRankings, setJockeyRankings] = useState(defaultJockeyRankings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPublicLeaderboardAPI()
      .then((data) => {
        if (!isMounted || !data) return;

        if (data.horses && data.horses.length > 0) {
          const formattedHorses = data.horses.map((h, idx) => ({
            rank: String(h.rank || idx + 1).padStart(2, '0'),
            avatar: '♞',
            name: h.horseName || 'Unnamed Horse',
            detail: h.breedName || 'Standard Breed',
            metric: `${h.rating ?? 0} Rating`,
            status: idx === 0 ? 'Top Seeding' : 'Elite',
            featured: idx === 0,
          }));
          setHorseRankings(formattedHorses);
        }

        if (data.jockeys && data.jockeys.length > 0) {
          const formattedJockeys = data.jockeys.map((j, idx) => ({
            rank: String(j.rank || idx + 1).padStart(2, '0'),
            avatar: getInitials(j.fullName),
            name: j.fullName || 'Unnamed Jockey',
            detail: `Score: ${j.rankingScore ?? 0}`,
            metric: `${j.winRate ?? 0}% Win`,
            status: idx === 0 ? 'Top Seeding' : 'Elite',
            featured: idx === 0,
          }));
          setJockeyRankings(formattedJockeys);
        }
      })
      .catch((err) => {
        console.error('Failed to load public leaderboard:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'HORSE_OWNER') return <Navigate to="/owner" replace />;
    if (user.role === 'JOCKEY') return <Navigate to="/jockey" replace />;
    if (user.role === 'RACE_REFEREE') return <Navigate to="/referee" replace />;
  }

  return (
    <div className="home-page-wrapper">
      <main className="home-canvas">
        <HeroSection />
        <StatsSection />
        <TournamentsSection />

        <section id="rankings" className="leaderboards-section" aria-label="Elite rankings">
          <div className="leaderboards-grid">
            <RankingBoard title="Elite Rankings: Horses" icon="♞" items={horseRankings} />
            <RankingBoard title="Elite Rankings: Jockeys" icon="♘" items={jockeyRankings} initials />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
