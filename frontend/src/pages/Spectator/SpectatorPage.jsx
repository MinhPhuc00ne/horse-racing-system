import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Home from '../Home/Home';

// Import Spectator components
import SpectatorDashboardContent from '../../components/Spectator/SpectatorDashboardContent';
import SpectatorTournaments from '../../components/Spectator/SpectatorTournaments';
import SpectatorWallet from '../../components/Spectator/SpectatorWallet';
import SpectatorUpgradeRole from '../../components/Spectator/SpectatorUpgradeRole';
import SpectatorLiveSimulationPage from '../../components/Spectator/SpectatorLiveSimulationPage';

import './Spectator.css';

const spectatorNavLinks = [
  { path: '/spectators/profile', label: 'Profile', icon: 'person' },
  { path: '/spectators/tournaments', label: 'Tournaments & Races', icon: 'emoji_events' },
  { path: '/spectators/live', label: 'Live Simulation', icon: 'sports_score' },
  { path: '/spectators/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' },
  { path: '/spectators/upgrade', label: 'Account Upgrade', icon: 'manage_accounts' }
];

export default function SpectatorPage() {
  const { user } = useContext(AuthContext);

  const profile = {
    fullName: user?.fullName || 'Spectator Member',
    avatar: user?.avatarUrl || ''
  };

  // Dynamically construct navigation links based on user role
  let dynamicNavLinks = [...spectatorNavLinks];
  if (user?.role && user.role !== 'SPECTATOR') {
    if (user.role === 'RACE_REFEREE') {
      dynamicNavLinks = [
        { path: '/referee/pre-race-check', label: 'Pre-Race Check', icon: 'fact_check' },
        { path: '/referee/live-simulation', label: 'Live Simulation', icon: 'sports_score' },
        { path: '/referee/violations', label: 'Violations & Flags', icon: 'gavel' },
        { path: '/spectators/tournaments', label: 'Betting', icon: 'local_atm' },
        { path: '/spectators/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' }
      ];
    } else if (user.role === 'HORSE_OWNER') {
      dynamicNavLinks = [
        { path: '/owner/home', label: 'Home', icon: 'home' },
        { path: '/owner/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/owner/stable', label: 'Stable', icon: 'bedroom_child' },
        { path: '/owner/entries', label: 'Race Entries', icon: 'emoji_events' },
        { path: '/owner/friends', label: 'Connections', icon: 'group' },
        { path: '/owner/financials', label: 'Financials', icon: 'payments' },
        { path: '/owner/analytics', label: 'Analytics', icon: 'analytics' },
        { path: '/spectators/tournaments', label: 'Betting', icon: 'local_atm' },
        { path: '/spectators/live', label: 'Live Simulation', icon: 'live_tv' },
        { path: '/spectators/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' }
      ];
    } else if (user.role === 'JOCKEY') {
      dynamicNavLinks = [
        { path: '/jockey/home', label: 'Home', icon: 'home' },
        { path: '/jockey/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/jockey/races', label: 'Races & Tournaments', icon: 'sports_score' },
        { path: '/jockey/invitations', label: 'Invitations & Connections', icon: 'mail' },
        { path: '/jockey/profile', label: 'Profile & Wallet', icon: 'person' },
        { path: '/spectators/tournaments', label: 'Betting', icon: 'local_atm' },
        { path: '/spectators/live', label: 'Live Simulation', icon: 'live_tv' },
        { path: '/spectators/wallet', label: 'Wallet & Transactions', icon: 'account_balance_wallet' }
      ];
    }
  }

  return (
    <DashboardLayout navLinks={dynamicNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<SpectatorDashboardContent />} />
        <Route path="tournaments" element={<SpectatorTournaments />} />
        <Route path="live" element={<SpectatorLiveSimulationPage />} />
        <Route path="wallet" element={<SpectatorWallet />} />
        <Route path="upgrade" element={<SpectatorUpgradeRole />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="profile" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
