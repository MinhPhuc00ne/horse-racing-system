
import './Home.css';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import TournamentsSection from './components/TournamentsSection';
import RankingBoard from './components/RankingBoard';

const horseRankings = [
  {
    rank: '01',
    avatar: '♞',
    name: 'Stellar Majesty',
    detail: 'Royal Stable #4',
    metric: '98.4 Rating',
    status: 'Undefeated',
    featured: true,
  },
  {
    rank: '02',
    avatar: '♞',
    name: 'Golden Phantom',
    detail: 'Crescent Farms',
    metric: '95.8 Rating',
    status: 'Rising',
  },
  {
    rank: '03',
    avatar: '♞',
    name: 'Emerald Baron',
    detail: 'Highland Fields',
    metric: '94.6 Rating',
    status: 'In Form',
  },
];

const jockeyRankings = [
  {
    rank: '01',
    avatar: 'CS',
    name: 'Clarissa Sterling',
    detail: 'Monaco Club',
    metric: '245 Wins',
    status: 'Top Seeding',
    featured: true,
  },
  {
    rank: '02',
    avatar: 'MR',
    name: 'Marcus Rhone',
    detail: 'Silver Spur Team',
    metric: '231 Wins',
    status: 'Elite',
  },
  {
    rank: '03',
    avatar: 'ER',
    name: 'Elena Rodriguez',
    detail: 'Valencia Range',
    metric: '219 Wins',
    status: 'Contender',
  },
];

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <main className="home-canvas">
        <HeroSection />
        <StatsSection />
        <TournamentsSection />
        
        <section className="leaderboards-section" aria-label="Elite rankings">
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
