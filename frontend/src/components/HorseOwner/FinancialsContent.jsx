import { useEffect } from 'react';
import { useHorseOwner } from '../../contexts/HorseOwnerContext';
import SpectatorWallet from '../Spectator/SpectatorWallet';

export default function FinancialsContent() {
  const { profile = {}, transactions = [], refreshData } = useHorseOwner();

  useEffect(() => {
    if (refreshData) {
      refreshData();
    }

    const handleRefresh = () => {
      if (refreshData) {
        refreshData();
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [refreshData]);

  // Format currency to VND
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Calculate dynamic stats
  const totalWinnings = transactions
    .filter(t => ['WINNINGS', 'PRIZE'].includes(t.type) && (!t.status || t.status === 'SUCCESS'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEntryFees = transactions
    .filter(t => t.type === 'ENTRY_FEE' && (!t.status || t.status === 'SUCCESS'))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netEarnings = totalWinnings + totalEntryFees;



  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <h2 className="ho-font-epilogue fs-3 fw-bold mb-4" style={{ color: 'var(--ho-primary-dark)' }}>
        Financial Overview
      </h2>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Wallet Balance
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-primary-dark)' }}>
              {formatVND(profile.walletBalance || 0)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Total Winnings
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-success">
              +{formatVND(totalWinnings)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Total Entry Fees
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0 text-danger">
              {formatVND(totalEntryFees)}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="glass-card h-100 p-4">
            <h3 className="ho-font-grotesk text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
              Net Winnings
            </h3>
            <p className="ho-font-epilogue fs-4 fw-bold m-0" style={{ color: 'var(--ho-accent-gold-text)' }}>
              {formatVND(netEarnings)}
            </p>
          </div>
        </div>
      </div>

      {/* Integrated Wallet & Transactions Panel */}
      <div className="mt-2">
        <SpectatorWallet hideHeader={true} />
      </div>
    </div>
  );
}
