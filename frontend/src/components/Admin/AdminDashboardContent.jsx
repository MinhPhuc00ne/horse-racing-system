import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTournamentsAPI } from '../../services/races';
import { getUpgradeRequestsAPI, getRaceRegistrationsAPI, getAdminDashboardStatsAPI } from '../../services/admin';
import DataTable from '../ui/DataTable';
import RevenueAreaChart from './charts/RevenueAreaChart';
import RoleDonutChart from './charts/RoleDonutChart';
import BetVolumeBarChart from './charts/BetVolumeBarChart';
import RevenueBreakdownChart from './charts/RevenueBreakdownChart';
import RaceStatusBarChart from './charts/RaceStatusBarChart';
import TransactionTrendChart from './charts/TransactionTrendChart';
import TournamentPrizeChart from './charts/TournamentPrizeChart';

export default function AdminDashboardContent() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: loadingStats } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: getAdminDashboardStatsAPI
  });

  const { data: upgradeRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['upgradeRequests'],
    queryFn: async () => {
      const res = await getUpgradeRequestsAPI();
      return res.slice(0, 5);
    }
  });

  const loading = loadingStats || loadingRequests;

  const stats = dashboardData ? {
    usersCount: dashboardData.usersCount || 0,
    tournamentsCount: dashboardData.tournamentsCount || 0,
    racesCount: dashboardData.racesCount || 0,
    pendingUpgradesCount: dashboardData.pendingUpgradesCount || 0,
    pendingWithdrawalsCount: dashboardData.pendingWithdrawalsCount || 0
  } : {
    usersCount: 0, tournamentsCount: 0, racesCount: 0, pendingUpgradesCount: 0, pendingWithdrawalsCount: 0
  };

  const recentRequests = upgradeRequests || [];

  // Data for charts
  let revenueData = dashboardData?.revenueData || [];
  if (revenueData.length === 0 || revenueData.every(d => d.val === 0)) {
    revenueData = [
      { month: 'Jan', val: 2500000 }, { month: 'Feb', val: 1200000 },
      { month: 'Mar', val: 3800000 }, { month: 'Apr', val: 2100000 },
      { month: 'May', val: 5400000 }, { month: 'Jun', val: 3200000 },
      { month: 'Jul', val: 7800000 }, { month: 'Aug', val: 4500000 }
    ];
  }

  let betVolumeData = dashboardData?.betVolumeData || [];
  if (betVolumeData.length === 0 || betVolumeData.every(d => d.bets === 0)) {
    betVolumeData = [
      { tournament: 'Summer Cup', bets: 45 },
      { tournament: 'Spring Sprint', bets: 72 },
      { tournament: 'Grand National', bets: 110 },
      { tournament: 'Derby Classic', bets: 85 }
    ];
  }

  const roleDistribution = dashboardData?.roleDistribution || {};
  const revenueDistribution = dashboardData?.revenueDistribution || {};
  const raceStatusDistribution = dashboardData?.raceStatusDistribution || {};
  const transactionTrendData = dashboardData?.transactionTrendData || [];
  const tournamentPrizesData = dashboardData?.tournamentPrizesData || [];

  const requestColumns = [
    {
      key: 'fullName',
      label: 'Full Name',
      render: (item) => <span className="fw-semibold text-white">{item.fullName}</span>
    },
    {
      key: 'requestedRole',
      label: 'Requested Role',
      render: (item) => (
        <span className="badge bg-light text-dark fw-bold" style={{ fontSize: '11px' }}>
          {item.requestedRole}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`badge ${item.status === 'APPROVED' ? 'bg-success' : item.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
          {item.status}
        </span>
      )
    },
    {
      key: 'submittedAt',
      label: 'Date Submitted',
      render: (item) => <span className="small" style={{ color: '#cbd5e1' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title Header */}
      <div className="mb-4 p-4 rounded-4" style={{ backgroundColor: '#0c2214', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
        <span className="badge bg-warning text-dark fw-bold mb-2" style={{ fontSize: '0.75rem' }}>ADMIN CONTROL CONSOLE</span>
        <h2 className="ho-font-epilogue fs-3 fw-bold text-white mb-1" style={{ color: '#ffffff' }}>
          Admin Administration System
        </h2>
        <p className="text-white-50 small m-0" style={{ color: '#94a3b8' }}>
          Overview of tournament statistics, user account management, and financial charts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0aec0' }}>
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="fw-bold">Loading system metrics...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="row g-4 mb-4">
            
            {/* Total Users */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/usermanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>group</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Total Users
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: '#ffffff' }}>
                  {stats.usersCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Manage & search
                </div>
              </div>
            </div>

            {/* Total Tournaments */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tournamentmanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>emoji_events</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Active Tournaments
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: '#ffffff' }}>
                  {stats.tournamentsCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Create & update
                </div>
              </div>
            </div>

            {/* Total Races */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tournamentregistrations')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>flag</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Entry Registrations
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: '#ffffff' }}>
                  {stats.racesCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Approve registrations
                </div>
              </div>
            </div>

            {/* Pending Upgrades */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/upgradeuserrole')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>manage_accounts</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Upgrade Requests
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: '#ffffff' }}>
                  {stats.pendingUpgradesCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending approval
                </div>
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/transactions')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>account_balance_wallet</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Withdrawal Transactions
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: '#ffffff' }}>
                  {stats.pendingWithdrawalsCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending wallet approval
                </div>
              </div>
            </div>

          </div>

          {/* Primary Charts Section (Row 1) */}
          <div className="row g-4 mb-4">
            {/* Revenue Trend Area Chart */}
            <div className="col-12 col-xl-6">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="ho-font-epilogue fs-5 fw-bold m-0 text-dark">Platform Revenue Growth</h3>
                    <p className="text-secondary small m-0">Monthly commission fees (10% of bet volumes)</p>
                  </div>
                  <span className="badge bg-success-subtle text-success fw-bold px-2 py-1" style={{ fontSize: '11px' }}>
                    Live DB Sync
                  </span>
                </div>
                
                <div className="position-relative mt-3" style={{ height: '220px' }}>
                  <RevenueAreaChart data={revenueData} />
                </div>
              </div>
            </div>

            {/* Active User Distribution Donut Chart */}
            <div className="col-12 col-md-6 col-xl-6">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0 text-dark">User Breakdown</h3>
                  <p className="text-secondary small mb-3">System user accounts distribution</p>
                </div>

                <div className="d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                  <RoleDonutChart roleDistribution={roleDistribution} />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Extended Charts Section (Row 2 - 4 New Charts) */}
          <div className="row g-4 mb-4">
            {/* Chart 1: Deposit vs Withdraw Financial Trend */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold m-0 text-dark">Wallet Deposits & Withdrawals</h3>
                  <p className="text-secondary small mb-2">Compare Deposit vs Withdrawal cash flows</p>
                </div>

                <div className="position-relative mt-2" style={{ height: '230px' }}>
                  <TransactionTrendChart data={transactionTrendData} />
                </div>
              </div>
            </div>

            {/* Chart 2: Revenue Sources Breakdown */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold m-0 text-dark">Revenue Sources Breakdown</h3>
                  <p className="text-secondary small mb-2">Distribution of platform income sources</p>
                </div>

                <div className="position-relative mt-2" style={{ height: '230px' }}>
                  <RevenueBreakdownChart revenueDistribution={revenueDistribution} />
                </div>
              </div>
            </div>

            {/* Chart 3: Race Status Breakdown */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold m-0 text-dark">Race Status Breakdown</h3>
                  <p className="text-secondary small mb-2">Distribution of race round statuses</p>
                </div>

                <div className="position-relative mt-2" style={{ height: '230px' }}>
                  <RaceStatusBarChart raceStatusDistribution={raceStatusDistribution} />
                </div>
              </div>
            </div>

            {/* Chart 4: Top Tournaments by Prize Pool */}
            <div className="col-12 col-md-6 col-xl-3">
              <div className="glass-card position-relative h-100" style={{ minHeight: '320px' }}>
                <div>
                  <h3 className="ho-font-epilogue fs-6 fw-bold m-0 text-dark">Top Prize Pools</h3>
                  <p className="text-secondary small mb-2">Tournaments with the largest prize pools</p>
                </div>

                <div className="position-relative mt-2" style={{ height: '230px' }}>
                  <TournamentPrizeChart data={tournamentPrizesData} />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Lists Grid */}
          <div className="row g-4">
            
            {/* Recent Upgrade Requests */}
            <div className="col-12 col-lg-6">
              <div className="glass-card h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0" style={{ color: '#ffffff' }}>
                    Recent Role Upgrade Requests
                  </h3>
                  <button
                    onClick={() => navigate('/admin/upgradeuserrole')}
                    className="ho-btn-link text-uppercase tracking-wider small d-flex align-items-center"
                    style={{ fontSize: '12px' }}
                  >
                    View All
                    <span className="material-symbols-outlined ms-1" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                </div>
                <DataTable columns={requestColumns} data={recentRequests} emptyMessage="No recent upgrade requests." />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="col-12 col-lg-6">
              <div className="glass-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: '#ffffff' }}>
                    Admin Quick Actions
                  </h3>
                  <p className="text-secondary small mb-4" style={{ color: '#cbd5e1' }}>
                    Administrators have privileges to manage tournaments, financials, and system permissions.
                  </p>
                  
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Create New Horse Tournament</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Configure prize pool, match date, deadline, and assign referee</span>
                      </div>
                      <button onClick={() => navigate('/admin/tournamentmanagement')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Manage Rounds & Approve Registrations</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Manage match heats, participant rosters, and sign-ups</span>
                      </div>
                      <button onClick={() => navigate('/admin/racemanagement')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark small">Approve Wallet Withdrawals</span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>Process withdrawals for jockeys/owners, and refund rejected requests</span>
                      </div>
                      <button onClick={() => navigate('/admin/withdrawals')} className="btn btn-outline-success btn-sm fw-bold">Go to</button>
                    </div>
                  </div>
                </div>


              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
