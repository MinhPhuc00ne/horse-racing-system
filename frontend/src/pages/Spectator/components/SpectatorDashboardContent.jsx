import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { getWalletBalanceAPI } from '../../../services/wallet';
import axiosClient from '../../../api/axiosClient';
import '../Spectator.css';

export default function SpectatorDashboardContent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [latestRequest, setLatestRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const balRes = await getWalletBalanceAPI();
        setBalance(balRes.balance);
      } catch (err) {
        console.error("Failed to fetch balance on dashboard", err);
      } finally {
        setLoadingBalance(false);
      }

      try {
        const reqRes = await axiosClient.get('/upgrade-requests/me');
        if (reqRes.data && reqRes.data.length > 0) {
          // Sort to find latest request
          const sorted = [...reqRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestRequest(sorted[0]);
        }
      } catch (err) {
        console.error("Failed to fetch upgrade requests on dashboard", err);
      } finally {
        setLoadingRequest(false);
      }
    }

    fetchData();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      
      {/* Welcome Banner */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" 
           style={{ 
             background: 'linear-gradient(135deg, #003820 0%, #0f5132 100%)', 
             padding: '2rem', 
             borderRadius: '1rem',
             color: '#ffffff',
             border: '1px solid var(--ho-border-gold)'
           }}>
        <div>
          <span className="badge bg-warning text-dark text-uppercase mb-2" style={{ letterSpacing: '0.1em', fontWeight: 'bold' }}>
            Spectator Member
          </span>
          <h2 className="ho-font-epilogue fs-3 fw-bold mb-1">
            Welcome back, {user?.fullName || 'Spectator'}!
          </h2>
          <p className="m-0 text-white-50 small">
            Follow top-tier races, upgrade your account, and place authorized bets directly in the system.
          </p>
        </div>
        <button className="ho-btn ho-btn-gold-solid" onClick={() => navigate('/spectator/tournaments')}>
          View Tournaments
        </button>
      </div>

      {/* Grid Content */}
      <div className="row g-4">
        
        {/* Left Column: Profile Card */}
        <div className="col-12 col-lg-8">
          <div className="glass-card h-100">
            <h3 className="form-section-title">
              <span className="material-symbols-outlined text-success">account_circle</span>
              Spectator Account Information
            </h3>

            <div className="row g-4 mt-2">
              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">Username</span>
                  <span className="fw-bold text-dark fs-5">{user?.username || 'N/A'}</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">Full Name</span>
                  <span className="fw-bold text-dark fs-5">{user?.fullName || 'N/A'}</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">Email Address</span>
                  <span className="fw-bold text-dark fs-5 text-truncate block">{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">Phone Number</span>
                  <span className="fw-bold text-dark fs-5">{user?.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">System Role</span>
                  <span className="badge text-uppercase font-weight-bold" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--ho-accent-gold-text)' }}>
                    {user?.role || 'SPECTATOR'}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 rounded border" style={{ background: '#ffffff', borderColor: 'var(--ho-border-gold)' }}>
                  <span className="text-secondary small block mb-1">Join Date</span>
                  <span className="fw-bold text-dark fs-5">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wallet & Quick Status Summary */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          
          {/* Wallet Summary Card */}
          <div className="wallet-premium-card">
            <div className="d-flex justify-content-between align-items-center">
              <span className="card-brand">EquineElite Member</span>
              <div className="card-chip"></div>
            </div>
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount mb-3">
              {loadingBalance ? 'Loading...' : `${balance.toLocaleString('en-US')} VND`}
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="ho-btn ho-btn-gold-solid flex-grow-1" onClick={() => navigate('/spectator/wallet')}>
                Deposit / Withdraw
              </button>
            </div>
          </div>

          {/* Quick Upgrade Status Card */}
          <div className="glass-card flex-grow-1">
            <h4 className="ho-font-epilogue fs-6 fw-bold text-dark mb-3">
              Role Upgrade Request
            </h4>

            {loadingRequest ? (
              <div className="text-center py-3 text-secondary small">Checking application...</div>
            ) : latestRequest ? (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-secondary">Requested Role:</span>
                  <span className="badge bg-secondary text-uppercase small">
                    {latestRequest.requestedRole?.replace('_', ' ')}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-secondary">Status:</span>
                  <span className={`badge ${
                    latestRequest.status === 'PENDING' ? 'bg-warning text-dark' :
                    latestRequest.status === 'APPROVED' ? 'bg-success' :
                    'bg-danger'
                  } text-uppercase small`}>
                    {latestRequest.status === 'PENDING' ? 'Pending' :
                     latestRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-secondary">Submission Date:</span>
                  <span className="small text-dark fw-bold">{formatDate(latestRequest.createdAt)}</span>
                </div>

                {latestRequest.status === 'REJECTED' && latestRequest.rejectionReason && (
                  <div className="mt-2 p-2 rounded small text-danger" style={{ background: 'var(--ho-error-bg)', border: '1px solid rgba(186,26,26,0.2)' }}>
                    Reason: "{latestRequest.rejectionReason}"
                  </div>
                )}

                <button className="ho-btn ho-btn-gold-outline w-100 mt-3" onClick={() => navigate('/spectator/upgrade')}>
                  Application Details
                </button>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-secondary small mb-3">You haven't submitted any role upgrade requests.</p>
                <button className="ho-btn ho-btn-gold-outline w-100" onClick={() => navigate('/spectator/upgrade')}>
                  Upgrade Account
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
