import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Home.css';
import HeroSection from '../../components/Home/HeroSection';
import StatsSection from '../../components/Home/StatsSection';
import TournamentsSection from '../../components/Home/TournamentsSection';
import RankingBoard from '../../components/Home/RankingBoard';
import { getTournamentsAPI, getActiveRacesAPI } from '../../services/races';
import { getPublicStatsAPI, getPublicLeaderboardAPI } from '../../services/publicApi';

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
  const [tournaments, setTournaments] = useState([]);
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [statsData, setStatsData] = useState({
    liveRaces: null,
    totalPrizePool: null,
    activeHorses: null,
  });

  useEffect(() => {
    // 1. Fetch tournaments using client service
    getTournamentsAPI()
      .then((data) => {
        if (Array.isArray(data)) {
          setTournaments(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch tournaments:", err);
      });

    // 2. Fetch public statistics
    getPublicStatsAPI()
      .then((data) => {
        if (data) {
          setStatsData((prev) => ({
            ...prev,
            totalPrizePool: data.totalPrizePoolVND,
            activeHorses: data.activeHorses,
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch public stats:", err);
      });

    // 3. Fetch active running races count
    getActiveRacesAPI()
      .then((data) => {
        if (Array.isArray(data)) {
          setStatsData((prev) => ({
            ...prev,
            liveRaces: data.length,
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch active races:", err);
      });

    // 4. Fetch leaderboards
    getPublicLeaderboardAPI()
      .then((data) => {
        if (data) {
          const formatRank = (num) => String(num).padStart(2, '0');
          const getInitials = (name) => {
            if (!name) return 'JK';
            const parts = name.trim().split(/\s+/);
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          };

          if (Array.isArray(data.horses)) {
            const mappedH = data.horses.map((h) => ({
              rank: formatRank(h.rank),
              avatar: '♞',
              name: h.horseName,
              detail: h.breedName || 'Thoroughbred',
              metric: `${h.rating ? h.rating.toFixed(1) : '50.0'} Rating`,
              status: h.rank === 1 ? 'Undefeated' : h.rank === 2 ? 'Rising' : 'In Form',
              featured: h.rank === 1,
            }));
            setHorses(mappedH);
          }

          if (Array.isArray(data.jockeys)) {
            const mappedJ = data.jockeys.map((j) => ({
              rank: formatRank(j.rank),
              avatar: getInitials(j.fullName),
              name: j.fullName,
              detail: `Score: ${j.rankingScore || 0}`,
              metric: `${j.winRate ? j.winRate.toFixed(1) : '0.0'}% Win`,
              status: j.rank === 1 ? 'Top Seeding' : j.rank === 2 ? 'Elite' : 'Contender',
              featured: j.rank === 1,
            }));
            setJockeys(mappedJ);
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch leaderboard:", err);
      });
  }, []);

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'HORSE_OWNER') return <Navigate to="/owner" replace />;
    if (user.role === 'JOCKEY') return <Navigate to="/jockey" replace />;
    if (user.role === 'RACE_REFEREE') return <Navigate to="/referee" replace />;
  }

  // Fallbacks for rankings
  const finalHorses = [...horses];
  for (let i = finalHorses.length; i < 3; i++) {
    finalHorses.push(defaultHorseRankings[i]);
  }

  const finalJockeys = [...jockeys];
  for (let i = finalJockeys.length; i < 3; i++) {
    finalJockeys.push(defaultJockeyRankings[i]);
  }

  return (
    <div className="home-page-wrapper">
      <main className="home-canvas">
        <HeroSection />
        <StatsSection
          liveRaces={statsData.liveRaces}
          totalPrizePool={statsData.totalPrizePool}
          activeHorses={statsData.activeHorses}
        />
        <TournamentsSection tournaments={tournaments} />

        <section id="rankings" className="leaderboards-section" aria-label="Elite rankings">
          <div className="leaderboards-grid">
            <RankingBoard title="Elite Rankings: Horses" icon="♞" items={finalHorses} />
            <RankingBoard title="Elite Rankings: Jockeys" icon="♘" items={finalJockeys} initials />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
