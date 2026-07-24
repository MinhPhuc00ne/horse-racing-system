import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getWithdrawalsAPI, approveWithdrawalAPI, rejectWithdrawalAPI } from '../../../services/admin';
import { FaCheck, FaTimes, FaWallet, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const MOCK_WITHDRAWALS = [
  {
    id: 20001,
    userFullName: "Alex Mercer",
    userEmail: "hung.nv@gmail.com",
    bankAccount: "MB Bank - 09876543210 - ALEX MERCER",
    walletId: 501,
    amount: 2500000,
    createdAt: "2026-06-30T08:30:00Z",
    status: "PENDING"
  },
  {
    id: 20002,
    userFullName: "Cynthia Ross",
    userEmail: "mai.tt@yahoo.com",
    bankAccount: "Vietcombank - 1029384756 - CYNTHIA ROSS",
    walletId: 502,
    amount: 15000000,
    createdAt: "2026-06-29T14:15:00Z",
    status: "SUCCESS"
  },
  {
    id: 20003,
    userFullName: "Bruce Wayne",
    userEmail: "bao.pq@outlook.com",
    bankAccount: "Techcombank - 1902837465 - BRUCE WAYNE",
    walletId: 503,
    amount: 780000,
    createdAt: "2026-07-01T02:00:00Z",
    status: "PENDING"
  },
  {
    id: 20004,
    userFullName: "David Miller",
    userEmail: "tuan.lm@gmail.com",
    bankAccount: "Agribank - 4902837465819 - DAVID MILLER",
    walletId: 504,
    amount: 4200000,
    createdAt: "2026-06-28T10:45:00Z",
    status: "FAILED",
    rejectionReason: "Recipient bank account information is incorrect"
  }
];

export default function WithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  // Success / Error Modals State
  const [successModalMessage, setSuccessModalMessage] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Confirmation Modals State
  const [approveModal, setApproveModal] = useState({
    show: false,
    tx: null
  });

  const [rejectModal, setRejectModal] = useState({
    show: false,
    tx: null,
    reason: ''
  });

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getWithdrawalsAPI();
      if (!data || data.length === 0) {
        setWithdrawals(MOCK_WITHDRAWALS);
      } else {
        setWithdrawals(data);
      }
    } catch (err) {
      console.warn("Failed to fetch withdrawals from backend, loading mock fallback data.", err);
      setWithdrawals(MOCK_WITHDRAWALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApproveConfirm = async () => {
    const tx = approveModal.tx;
    setApproveModal({ show: false, tx: null });
    if (!tx) return;

    setLoadingId(tx.id);
    setErrorModalMessage('');
    setSuccessModalMessage('');
    try {
      if (tx.id >= 20000) {
        // Local state update for mock data
        setWithdrawals(prev =>
          prev.map(w => (w.id === tx.id ? { ...w, status: 'SUCCESS' } : w))
        );
        setSuccessModalMessage(`Successfully approved mock withdrawal transaction #${tx.id}.`);
        return;
      }
      await approveWithdrawalAPI(tx.id);
      setSuccessModalMessage(`Successfully approved withdrawal transaction #${tx.id}.`);
      setWithdrawals(prev =>
        prev.map(w => (w.id === tx.id ? { ...w, status: 'SUCCESS' } : w))
      );
    } catch (err) {
      setErrorModalMessage(`Failed to approve transaction: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    const tx = rejectModal.tx;
    const reason = rejectModal.reason;
    setRejectModal({ show: false, tx: null, reason: '' });
    if (!tx) return;

    setLoadingId(tx.id);
    setErrorModalMessage('');
    setSuccessModalMessage('');
    try {
      if (tx.id >= 20000) {
        // Local state update for mock data
        setWithdrawals(prev =>
          prev.map(w => (w.id === tx.id ? { ...w, status: 'FAILED', rejectionReason: reason } : w))
        );
        setSuccessModalMessage(`Successfully rejected mock withdrawal transaction #${tx.id}.`);
        return;
      }
      await rejectWithdrawalAPI(tx.id);
      setSuccessModalMessage(`Successfully rejected withdrawal transaction #${tx.id} and refunded wallet.`);
      setWithdrawals(prev =>
        prev.map(w => (w.id === tx.id ? { ...w, status: 'FAILED' } : w))
      );
    } catch (err) {
      setErrorModalMessage(`Failed to reject transaction: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaWallet style={{ color: '#d4af37' }} /> Approve Withdrawal Requests (Transactions)
        </h2>
      </div>

      {/* Table list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: '#d4af37', margin: 0 }}>
          Pending Requests ({withdrawals.filter(w => w.status === 'PENDING').length})
        </h3>

        <div style={{ overflowX: 'auto', background: 'rgba(12, 34, 20, 0.85)', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#ffffff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Transaction ID</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Customer</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Receiving Account</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Wallet ID</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Amount</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Request Time</th>
                <th style={{ padding: '16px', color: '#d4af37', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#d4af37', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#cbd5e1' }}>
                    No withdrawal requests have been made.
                  </td>
                </tr>
              ) : (
                withdrawals.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      transition: 'background 0.2s',
                      opacity: loadingId === tx.id ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontWeight: '700', color: '#ffffff' }}>#{tx.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#ffffff', fontWeight: '600' }}>{tx.userFullName}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>{tx.userEmail}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: '#ffffff', fontWeight: '500', wordBreak: 'break-all' }}>
                        {tx.bankAccount || <em style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No bank linked</em>}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#ffffff', fontWeight: '500' }}>Wallet #{tx.walletId}</td>
                    <td style={{ padding: '16px', color: '#f59e0b', fontWeight: '700' }}>
                      {tx.amount.toLocaleString()} VND
                    </td>
                    <td style={{ padding: '16px', color: '#cbd5e1' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-US') : ''}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: tx.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : tx.status === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                        color: tx.status === 'SUCCESS' ? '#10b981' : tx.status === 'FAILED' ? '#ef4444' : 'var(--ho-accent-gold-text)'
                      }}>
                        {tx.status}
                      </span>
                      {tx.status === 'FAILED' && tx.rejectionReason && (
                        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontStyle: 'italic', maxWidth: '150px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          Reason: "{tx.rejectionReason}"
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {tx.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => setApproveModal({ show: true, tx: tx })}
                              disabled={loadingId !== null}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '6px',
                                color: '#10b981',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#ffffff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; e.currentTarget.style.color = '#10b981'; }}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ show: true, tx: tx, reason: '' })}
                              disabled={loadingId !== null}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontWeight: '600',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--ho-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCheckCircle style={{ color: tx.status === 'SUCCESS' ? '#10b981' : '#ef4444' }} /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal */}
      {successModalMessage && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setSuccessModalMessage('')}
        >
          <div 
            className="glass-card text-center" 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '30px 24px', 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: '1px solid #10b981',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: '#10b981'
                }}
              >
                <FaCheck size="30" />
              </div>
              
              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: 'var(--ho-primary-dark, #003820)' }}>
                Success!
              </h3>
              
              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {successModalMessage}
              </p>
              
              <button
                type="button"
                onClick={() => setSuccessModalMessage('')}
                className="btn btn-success fw-bold w-100"
                style={{ marginTop: '10px', padding: '10px', fontSize: '14px', borderRadius: '8px' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Error Modal */}
      {errorModalMessage && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1060,
          }}
          onClick={() => setErrorModalMessage('')}
        >
          <div 
            className="glass-card text-center" 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              padding: '30px 24px', 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              border: '1px solid #ef4444',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: '#ef4444'
                }}
              >
                <FaExclamationTriangle size="30" />
              </div>
              
              <h3 className="m-0 fw-bold" style={{ fontSize: '20px', color: '#ef4444' }}>
                An Error Occurred!
              </h3>
              
              <p className="text-secondary small m-0 fw-medium" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {errorModalMessage}
              </p>
              
              <button
                type="button"
                onClick={() => setErrorModalMessage('')}
                className="btn btn-danger fw-bold w-100"
                style={{ marginTop: '10px', padding: '10px', fontSize: '14px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Approve Confirmation Modal */}
      {approveModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={() => setApproveModal({ show: false, tx: null })}
        >
          <div
            className="glass-card text-center"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="m-0 fw-bold text-start" style={{ fontSize: '18px', color: 'var(--ho-primary-dark, #003820)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '12px' }}>
                Confirm Withdrawal Approval
              </h3>

              <p className="text-secondary small m-0 fw-medium text-start" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to approve the withdrawal request of <strong>{approveModal.tx?.amount.toLocaleString()} VND</strong> for customer <strong>{approveModal.tx?.userFullName}</strong> to bank account <strong>{approveModal.tx?.bankAccount}</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, tx: null })}
                  className="btn btn-outline-secondary btn-sm"
                  style={{ padding: '8px 20px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveConfirm}
                  className="btn btn-success btn-sm fw-bold"
                  style={{ padding: '8px 24px', borderRadius: '8px' }}
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Reason Modal */}
      {rejectModal.show && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
          }}
          onClick={() => setRejectModal({ show: false, tx: null, reason: '' })}
        >
          <form
            onSubmit={handleRejectSubmit}
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '24px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--ho-border-gold, #D4AF37)',
              background: '#ffffff',
              borderRadius: '16px',
              animation: 'scaleUp 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="ho-font-epilogue fs-5 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '10px', margin: 0 }}>
              Reject Withdrawal Request
            </h3>

            <div className="form-group text-start">
              <label className="ho-input-label">Rejection Reason *</label>
              <textarea
                className="ho-form-input text-dark fw-semibold"
                rows="4"
                required
                placeholder="Enter reason for rejecting withdrawal..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ resize: 'vertical', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--ho-border-gold)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.08)', paddingTop: '15px' }}>
              <button
                type="button"
                onClick={() => setRejectModal({ show: false, tx: null, reason: '' })}
                className="btn btn-outline-secondary btn-sm"
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm fw-bold"
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}
