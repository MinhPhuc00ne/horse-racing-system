import { Routes, Route, Navigate } from 'react-router-dom';
import { HorseOwnerProvider, useHorseOwner } from '../../contexts/HorseOwnerContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Home from '../Home/Home';
import './HorseOwner.css';

// Import subviews locally
import DashboardContent from '../../components/HorseOwner/DashboardContent';
import StableContent from '../../components/HorseOwner/StableContent';
import RaceEntriesContent from '../../components/HorseOwner/RaceEntriesContent';
import ConnectionsContent from '../../components/HorseOwner/ConnectionsContent';
import FinancialsContent from '../../components/HorseOwner/FinancialsContent';
import ProfileContent from '../../components/HorseOwner/ProfileContent';

// Import Spectator components for Horse Owner integration
import SpectatorTournaments from '../../components/Spectator/SpectatorTournaments';
import SpectatorLiveSimulationPage from '../../components/Spectator/SpectatorLiveSimulationPage';
import SpectatorWallet from '../../components/Spectator/SpectatorWallet';

const ownerNavLinks = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/owner/stable', label: 'Horses', icon: 'fence' },
  { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
  { path: '/owner/friends', label: 'Connections', icon: 'group' },
  { path: '/owner/financials', label: 'Financials', icon: 'account_balance_wallet' },
  { path: '/owner/live', label: 'Live Racing', icon: 'stadium' }
];

function HorseOwnerRoutesBridge() {
  const { profile, loading } = useHorseOwner();

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
        <div className="fw-bold fs-5">Đang tải dữ liệu chuồng ngựa...</div>
      </div>
    );
  }

  return (
    <DashboardLayout navLinks={ownerNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<DashboardContent />} />
        <Route path="stable" element={<StableContent />} />
        <Route path="entries" element={<RaceEntriesContent />} />
        <Route path="friends" element={<ConnectionsContent />} />
        <Route path="financials" element={<FinancialsContent />} />
        <Route path="profile" element={<ProfileContent />} />
        {/* Integrated spectator routes */}
        <Route path="live" element={<SpectatorLiveSimulationPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function HorseOwnerPage() {
  return (
    <HorseOwnerProvider>
      <HorseOwnerRoutesBridge />
    </HorseOwnerProvider>
  );
}
