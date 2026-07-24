import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Container, Row, Col } from 'react-bootstrap';
import './Home.css';
import HeroSection from '../../components/Home/HeroSection';
import StatsSection from '../../components/Home/StatsSection';
import TournamentsSection from '../../components/Home/TournamentsSection';
import RankingBoard from '../../components/Home/RankingBoard';
import { getTournamentsAPI, getActiveRacesAPI } from '../../services/races';
import { getPublicStatsAPI, getPublicLeaderboardAPI } from '../../services/publicApi';
import heroImg from '../../assets/hero_horse_racing.png';

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
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [horses, setHorses] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [statsData, setStatsData] = useState({
    liveRaces: null,
    totalPrizePool: null,
    activeHorses: null,
  });

  useEffect(() => {
    // 1. Fetch tournaments
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

  const getRoleDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'HORSE_OWNER': return '/owner';
      case 'JOCKEY': return '/jockey';
      case 'RACE_REFEREE': return '/referee';
      case 'ADMIN': return '/admin/dashboard';
      case 'SPECTATOR': return '/spectators/dashboard';
      default: return '/spectators/dashboard';
    }
  };

  const getRoleNameVN = () => {
    if (!user) return '';
    switch (user.role) {
      case 'HORSE_OWNER': return 'Horse Owner';
      case 'JOCKEY': return 'Jockey Rider';
      case 'RACE_REFEREE': return 'Race Referee Steward';
      case 'ADMIN': return 'System Administrator';
      case 'SPECTATOR': return 'Spectator Fan';
      default: return user.role;
    }
  };

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
      {/* 0. AUTHENTICATED USER WELCOME BAR */}
      {isAuthenticated && user && (
        <div className="user-welcome-bar">
          <Container fluid="lg">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-warning fs-5">account_circle</span>
                <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
                  Welcome back, <span style={{ color: '#ffd700' }}>{user.fullName || user.username}</span>! Logged in as: <strong className="text-uppercase" style={{ color: '#95d4ac' }}>{getRoleNameVN()}</strong>
                </span>
              </div>
              <button
                onClick={() => navigate(getRoleDashboardPath())}
                className="btn btn-sm btn-warning fw-bold d-flex align-items-center gap-1 shadow-sm"
                style={{ fontSize: '0.82rem', borderRadius: '6px', color: '#07150c' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
                <span>Go to {user.role?.replace('_', ' ')} Dashboard</span>
              </button>
            </div>
          </Container>
        </div>
      )}

      <main className="home-canvas">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. PUBLIC STATS COUNTER */}
        <StatsSection
          liveRaces={statsData.liveRaces}
          totalPrizePool={statsData.totalPrizePool}
          activeHorses={statsData.activeHorses}
        />

        {/* 3. RICH ARTICLES SECTION (PLACEMENT: ABOVE UPCOMING TOURNAMENTS) */}
        <section className="home-articles-container py-3">

          {/* ARTICLE 1: AUTOMATED PHOTO-FINISH & TELEMETRY */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="p-4 p-md-5">
                <span className="article-tag">PRO RACING TECHNOLOGY</span>
                <h2 className="article-title">10,000 fps Optical Photo-Finish & Real-Time RFID Telemetry</h2>
                <p className="article-text">
                  The Horse Racing System pioneers dual optical telemetry. Every competing racehorse is equipped with micro-RFID sensors under the racing saddle, broadcasting GPS coordinates and heart rate metrics at 50Hz.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Vertical line-scan finish camera capturing 10,000 frames/sec eliminating human margin of error.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Live 3D Race Simulation engine for spectators and race stewards inquiry.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Instant automated result synchronization with digital wallets and national leaderboards.</li>
                </ul>
                <button onClick={() => navigate('/rules')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  Explore Rules & Technology
                </button>
              </Col>
              <Col xs={12} lg={6} className="h-100">
                <div className="article-img-wrapper">
                  <img src={heroImg} alt="Race Finish Line Action" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 2: THOROUGHBRED HERITAGE */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="order-lg-2 p-4 p-md-5">
                <span className="article-tag">HERITAGE & PEDIGREE</span>
                <h2 className="article-title">5-Generation Thoroughbred Pedigree & Turf Track Geometry</h2>
                <p className="article-text">
                  Every thoroughbred contender undergoes rigorous pedigree verification. Purebred bloodlines combined with micronutrient grain diets enable racehorses to reach top speeds exceeding 65 km/h on turf tracks.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Digital DNA pedigree passports tracking sire, dam, and career win rates.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Bermuda turf & compressed dirt tracks engineered with 150mm/h drainage.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Comprehensive veterinary health inspections prior to every starting gate entrance.</li>
                </ul>
                <button onClick={() => navigate('/news')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  Discover Racing Heritage
                </button>
              </Col>
              <Col xs={12} lg={6} className="order-lg-1 h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80" alt="Thoroughbred Stable" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 3: SMART STABLE & OWNER ECOSYSTEM */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="p-4 p-md-5">
                <span className="article-tag">FOR HORSE OWNERS</span>
                <h2 className="article-title">Smart Stable Management & Strategic Race Entry</h2>
                <p className="article-text">
                  Step into the role of a Horse Owner and manage legendary racehorses. Our digital stable management platform lets you register entries, hire elite jockeys, monitor purse earnings, and maintain peak conditioning.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Register for prestigious cup tournaments with multi-million dollar prize pools.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Recruit top jockey talent via direct digital invitations and contracts.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Transparent ledger for stabling costs, vet records, and instant prize payouts.</li>
                </ul>
                <button onClick={() => navigate(user ? getRoleDashboardPath() : '/signup')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  {user ? 'Access Stable Portal' : 'Register as Horse Owner'}
                </button>
              </Col>
              <Col xs={12} lg={6} className="h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80" alt="Racehorse Running Free" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 4: FAIRNESS, VAR & ANTI-DOPING */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="order-lg-2 p-4 p-md-5">
                <span className="article-tag">INTEGRITY & VAR OVERVIEW</span>
                <h2 className="article-title">Multi-Angle VAR Stewards & Anti-Doping Protocols</h2>
                <p className="article-text">
                  Absolute integrity is the cornerstone of our sport. Independent race stewards monitor every meter of the track using an 8-camera VAR system, resolving interference objections within 3 minutes of post-race finish.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> WADA/IFHA certified blood and urine drug sampling for all winning contenders.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Weighing-in and out weigh scale checks for jockey and saddle gear compliance.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Public transparency with official steward inquiry reports and video replays.</li>
                </ul>
                <button onClick={() => navigate('/rules#doping')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  View Steward Standards
                </button>
              </Col>
              <Col xs={12} lg={6} className="order-lg-1 h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80" alt="Jockey Galloping Action" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 5: JOCKEY ATHLETIC STANDARDS & SAFETY GEAR */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="p-4 p-md-5">
                <span className="article-tag">JOCKEY ATHLETIC EXCELLENCE</span>
                <h2 className="article-title">Jockey Weight Limits, Safety Gear & Padded Whip Rules</h2>
                <p className="article-text">
                  Professional jockeys combine peak aerobic endurance with millimeter balance. Strict weight limits under 54kg ensure equine welfare while ASTM F1163 certified helmets and level 3 Kevlar vests protect riders at speeds up to 70 km/h.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Strict pre-race scale weigh-in with 45-minute post-race audit.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Padded foam whips limited to 6 controlled strikes per race event.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> International Jockey Academy certification and career license management.</li>
                </ul>
                <button onClick={() => navigate('/rules')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  Read Jockey Standards
                </button>
              </Col>
              <Col xs={12} lg={6} className="h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&w=800&q=80" alt="Jockey Competition Action" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 6: PARI-MUTUEL BETTING & INSTANT PURSE SETTLEMENT */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="order-lg-2 p-4 p-md-5">
                <span className="article-tag">PARI-MUTUEL ENGINE</span>
                <h2 className="article-title">Automated Pari-Mutuel Wagering & Instant Purse Payouts</h2>
                <p className="article-text">
                  Our system integrates an automated Pari-Mutuel tote pool calculating WIN, PLACE, and SHOW odds dynamically. As soon as the Photo-Finish camera certifies the official order of finish, winning bets and purse earnings deposit instantly.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Transparent tote odds calculation pool updated prior to post time.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Seamless digital wallet deposit, withdrawal, and transaction ledger.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Automatic refund processing for scratched or disqualified contenders.</li>
                </ul>
                <button onClick={() => navigate('/tournaments')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  View Tournament Bets
                </button>
              </Col>
              <Col xs={12} lg={6} className="order-lg-1 h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=800&q=80" alt="Racetrack Finishing Straight" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 7: RACETRACK TURF DRAINAGE & SAFETY BARRIERS */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="p-4 p-md-5">
                <span className="article-tag">INFRASTRUCTURE & SAFETY</span>
                <h2 className="article-title">Bermuda Grass Aeration & Sub-Turf Drainage Engineering</h2>
                <p className="article-text">
                  Safety begins on the track surface. Our racecourse features 150mm/h sub-surface drainage pipes, Bermuda grass aeration, and flexible safety rail barriers designed to absorb impact and prevent catastrophic injuries.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Moisture penetrometer testing guaranteeing optimal turf firmness before post time.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Flexible PVC safety rails yielding under high-speed impact.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> All-weather racing capability under heavy tropical rainfall conditions.</li>
                </ul>
                <button onClick={() => navigate('/news')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  Learn Infrastructure Tech
                </button>
              </Col>
              <Col xs={12} lg={6} className="h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80" alt="Green Turf Racecourse Field" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

          {/* ARTICLE 8: VIRTUAL 3D RACE SIMULATION & STREAMING */}
          <div className="home-article-card">
            <Row className="g-0 align-items-center">
              <Col xs={12} lg={6} className="order-lg-2 p-4 p-md-5">
                <span className="article-tag">VIRTUAL SIMULATION ENGINE</span>
                <h2 className="article-title">Real-Time 3D Live Simulation & Multi-Angle Camera Stream</h2>
                <p className="article-text">
                  Can't attend the racecourse in person? Our Live Simulation TV renders 2D/3D track positions, horse stamina gauges, speed meters, and live AI commentary feed for every second of the race.
                </p>
                <ul className="article-feature-list">
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Interactive POV perspective camera focusing on individual horses.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Real-time broadcast commentary announcing speed shifts and home straight sprints.</li>
                  <li><span className="material-symbols-outlined fs-5">check_circle</span> Instant photo-finish snapshot replay modal for close finishes.</li>
                </ul>
                <button onClick={() => navigate('/live')} className="btn btn-warning fw-bold px-4 rounded-3 text-dark" style={{ fontSize: '0.88rem', background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', border: 'none' }}>
                  Watch Live Simulation TV
                </button>
              </Col>
              <Col xs={12} lg={6} className="order-lg-1 h-100">
                <div className="article-img-wrapper">
                  <img src="https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&w=800&q=80" alt="Starting Gates Loading" className="article-img" />
                </div>
              </Col>
            </Row>
          </div>

        </section>

        {/* 4. CAREERS & RECRUITMENT BANNER */}
        <section className="home-articles-container py-3">
          <div className="careers-banner-section">
            <Row className="align-items-center g-4">
              <Col xs={12} lg={7}>
                <span className="article-tag" style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}>
                  EQUINE RECRUITMENT
                </span>
                <h2 className="careers-banner-title">
                  Build an Elite Career with <span className="careers-banner-gold">Horse Racing System</span>
                </h2>
                <p className="text-white-50" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                  We are actively recruiting passionate talents for professional jockeys, head race trainers, AI telemetry engineers, and racecourse veterinary specialists.
                </p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <div className="career-slot-badge">
                    <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>Professional Jockey</div>
                    <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Up to $40,000/yr + Purse Bonuses</div>
                  </div>
                  <div className="career-slot-badge">
                    <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>Head Race Trainer</div>
                    <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Up to $50,000/yr</div>
                  </div>
                  <div className="career-slot-badge">
                    <div className="fw-bold text-warning" style={{ fontSize: '0.9rem' }}>AI Telemetry Engineer</div>
                    <div className="text-white-50" style={{ fontSize: '0.78rem' }}>Up to $35,000/yr</div>
                  </div>
                </div>
              </Col>
              <Col xs={12} lg={5} className="text-lg-end">
                <button
                  onClick={() => navigate('/careers')}
                  className="btn btn-lg fw-bold px-4 py-3 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 100%)', color: '#07150c', border: 'none', borderRadius: '8px' }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span>Explore All 5 Job Openings</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
                </button>
              </Col>
            </Row>
          </div>
        </section>

        {/* 5. UPCOMING TOURNAMENTS SECTION (MOVED BELOW ARTICLES AS REQUESTED) */}
        <TournamentsSection tournaments={tournaments} />

        {/* 6. LEADERBOARDS SECTION */}
        <section id="rankings" className="leaderboards-section" aria-label="Elite rankings">
          <div className="leaderboards-grid">
            <RankingBoard title="Leaderboard: Elite Racehorses" icon="♞" items={finalHorses} />
            <RankingBoard title="Leaderboard: Master Jockeys" icon="♘" items={finalJockeys} initials />
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;
