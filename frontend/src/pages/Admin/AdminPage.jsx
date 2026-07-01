import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import '../Horse-Owner/HorseOwner.css'; // Reuses HorseOwner premium CSS variables and styles

// Import Admin content panels
import AdminDashboardContent from './components/AdminDashboardContent';
import UserManagementContent from './components/UserManagementContent';
import UpgradeUserRoleContent from './components/UpgradeUserRoleContent';
import TournamentsPanel from './components/TournamentsPanel';
import BreedsPanel from './components/BreedsPanel';
import WithdrawalsPanel from './components/WithdrawalsPanel';
import RacesPanel from './components/RacesPanel';
import FeedbacksPanel from './components/FeedbacksPanel';

const adminNavLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/usermanagement', label: 'User Management', icon: 'group' },
  { path: '/admin/upgradeuserrole', label: 'Upgrade User Role', icon: 'manage_accounts' },
  { path: '/admin/tournamentmanagement', label: 'Tournament Management', icon: 'emoji_events' },
  { path: '/admin/tournamentregistrations', label: 'Tournament Registrations', icon: 'flag' },
  { path: '/admin/transactions', label: 'Transactions', icon: 'account_balance_wallet' },
  { path: '/admin/feedbacks', label: 'Feedbacks', icon: 'rate_review' }
];

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  const profile = {
    fullName: user?.fullName || 'System Admin',
    avatar: user?.avatarUrl || ''
  };

  return (
    <DashboardLayout navLinks={adminNavLinks} profile={profile}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardContent />} />
        <Route path="usermanagement" element={<UserManagementContent />} />
        <Route path="upgradeuserrole" element={<UpgradeUserRoleContent />} />
        <Route path="tournamentmanagement" element={<TournamentsPanel />} />
        <Route path="transactions" element={<WithdrawalsPanel />} />
        <Route path="tournamentregistrations" element={<RacesPanel />} />
        <Route path="feedbacks" element={<FeedbacksPanel />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
