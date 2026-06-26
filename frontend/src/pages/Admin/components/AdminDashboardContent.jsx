import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTournamentsAPI } from '../../../services/races';
import { getUpgradeRequestsAPI, getRaceRegistrationsAPI, getRefereesAPI } from '../../../services/admin';
import DataTable from '../../../components/DataTable';

export default function AdminDashboardContent() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usersCount: 15,
    tournamentsCount: 0,
    racesCount: 0,
    pendingUpgradesCount: 0,
    pendingWithdrawalsCount: 3
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const [tournaments, upgrades, registrations, referees] = await Promise.all([
          getTournamentsAPI().catch(() => []),
          getUpgradeRequestsAPI().catch(() => []),
          getRaceRegistrationsAPI().catch(() => []),
          getRefereesAPI().catch(() => [])
        ]);

        const pendingUpgrades = upgrades.filter(u => u.status === 'PENDING');
        
        // Mock some users + count of real referees
        const totalUsers = 12 + referees.length;
        
        setStats({
          usersCount: totalUsers,
          tournamentsCount: tournaments.length,
          racesCount: registrations.length, // use registrations count as proxy for total active entries/races
          pendingUpgradesCount: pendingUpgrades.length,
          pendingWithdrawalsCount: 3 // mock value
        });

        // Take top 5 recent upgrade requests
        setRecentRequests(upgrades.slice(0, 5));
      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const requestColumns = [
    {
      key: 'fullName',
      label: 'Full Name',
      render: (item) => <span className="fw-semibold text-dark">{item.fullName}</span>
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
      render: (item) => <span className="text-secondary small">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
    }
  ];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      <div className="mb-4">
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
          Admin Administration System
        </h2>
        <p className="text-secondary small m-0">
          Overview of tournament statistics, user account management, and withdrawal transactions.
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
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
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
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.tournamentsCount}
                </p>
                <div className="mt-2 small text-secondary">
                  Create & update
                </div>
              </div>
            </div>

            {/* Total Races */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/racemanagement')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>flag</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Entry Registrations
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
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
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.pendingUpgradesCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending approval
                </div>
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-2.4" style={{ flex: '1 0 20%' }}>
              <div className="glass-card glass-card-interactive position-relative overflow-hidden h-100 p-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/withdrawals')}>
                <div className="position-absolute end-0 top-0 p-3 opacity-25">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--ho-accent-gold-text)' }}>account_balance_wallet</span>
                </div>
                <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                  Withdrawal Transactions
                </h3>
                <p className="ho-font-epilogue fs-3 fw-extrabold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
                  {stats.pendingWithdrawalsCount}
                </p>
                <div className="mt-2 small text-warning fw-semibold">
                  Pending wallet approval
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
                  <h3 className="ho-font-epilogue fs-5 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
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
                  <h3 className="ho-font-epilogue fs-5 fw-bold mb-3" style={{ color: 'var(--ho-primary-dark)' }}>
                    Admin Quick Actions
                  </h3>
                  <p className="text-secondary small mb-4">
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

                <div className="mt-4 p-3 rounded bg-light border text-center text-secondary small">
                  Current system account is operating in local development mode (**LOCAL_DEV**).
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
