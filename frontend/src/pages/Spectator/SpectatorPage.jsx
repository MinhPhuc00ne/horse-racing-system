import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Import Spectator components
import SpectatorDashboardContent from './components/SpectatorDashboardContent';
import SpectatorTournaments from './components/SpectatorTournaments';
import SpectatorWallet from './components/SpectatorWallet';
import SpectatorUpgradeRole from './components/SpectatorUpgradeRole';
import SpectatorLiveSimulationPage from './components/SpectatorLiveSimulationPage';

import './Spectator.css';

const spectatorNavLinks = [
  { path: '/spectator/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/spectator/tournaments', label: 'Tournaments & Races', icon: 'emoji_events' },
  { path: '/spectator/live', label: 'Live Simulation', icon: 'sports_score' },
  { path: '/spectator/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' },
  { path: '/spectator/upgrade', label: 'Account Upgrade', icon: 'manage_accounts' }
];

export default function SpectatorPage() {
  const { user } = useContext(AuthContext);

  const profile = {
    fullName: user?.fullName || 'Spectator Member',
    avatar: user?.avatarUrl || ''
  };

  // Dynamically construct navigation links based on user role
  const dynamicNavLinks = [...spectatorNavLinks];
  if (user?.role && user.role !== 'SPECTATOR') {
    let backPath = '/';
    let label = 'Back to Admin Portal';
    if (user.role === 'HORSE_OWNER') {
      backPath = '/owner/dashboard';
      label = 'Back to Owner Portal';
    } else if (user.role === 'JOCKEY') {
      backPath = '/jockey/dashboard';
      label = 'Back to Jockey Portal';
    } else if (user.role === 'RACE_REFEREE') {
      backPath = '/referee/dashboard';
      label = 'Back to Referee Portal';
    }
    dynamicNavLinks.unshift({
      path: backPath,
      label: label,
      icon: 'arrow_back'
    });
  }

  return (
    <DashboardLayout navLinks={dynamicNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SpectatorDashboardContent />} />
        <Route path="tournaments" element={<SpectatorTournaments />} />
        <Route path="live" element={<SpectatorLiveSimulationPage />} />
        <Route path="wallet" element={<SpectatorWallet />} />
        <Route path="upgrade" element={<SpectatorUpgradeRole />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

