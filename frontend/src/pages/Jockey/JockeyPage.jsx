import { Routes, Route, Navigate } from 'react-router-dom';
import { JockeyProvider, useJockey } from '../../contexts/JockeyContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Home from '../Home/Home';
import '../Horse-Owner/HorseOwner.css'; // Reuse premium theme variables, buttons, forms, and timeline classes

// Import Jockey content views
import JockeyDashboardContent from '../../components/Jockey/JockeyDashboardContent';
import JockeyRacesContent from '../../components/Jockey/JockeyRacesContent';
import JockeyInvitationsContent from '../../components/Jockey/JockeyInvitationsContent';
import JockeyProfileContent from '../../components/Jockey/JockeyProfileContent';
import JockeyFinancialsContent from '../../components/Jockey/JockeyFinancialsContent';
import SpectatorLiveSimulationPage from '../../components/Spectator/SpectatorLiveSimulationPage';

const jockeyNavLinks = [
  { path: '/jockey/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/jockey/races', label: 'Races', icon: 'sports_score' },
  { path: '/jockey/invitations', label: 'Connections', icon: 'group' },
  { path: '/jockey/financials', label: 'Financials', icon: 'account_balance_wallet' },
  { path: '/jockey/profile', label: 'Profile', icon: 'person' },
  { path: '/jockey/live', label: 'Live Racing', icon: 'live_tv' }
];

function JockeyRoutesBridge() {
  const { profile, loading } = useJockey();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        color: 'var(--ho-primary-dark)',
        fontFamily: 'var(--font-family)'
      }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fw-bold fs-5">Đang tải dữ liệu kỵ sĩ...</div>
      </div>
    );
  }

  return (
    <DashboardLayout navLinks={jockeyNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<JockeyDashboardContent />} />
        <Route path="races" element={<JockeyRacesContent />} />
        <Route path="invitations" element={<JockeyInvitationsContent />} />
        <Route path="financials" element={<JockeyFinancialsContent />} />
        <Route path="profile" element={<JockeyProfileContent />} />
        <Route path="live" element={<SpectatorLiveSimulationPage />} />
        {/* Catch-all fallback inside jockey route */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function JockeyPage() {
  return (
    <JockeyProvider>
      <JockeyRoutesBridge />
    </JockeyProvider>
  );
}
