import React, { useState, useEffect } from 'react';
import { getWithdrawalsAPI, approveWithdrawalAPI, rejectWithdrawalAPI } from '../../../services/admin';
import { FaCheck, FaTimes, FaWallet, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

export default function WithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWithdrawalsAPI();
      setWithdrawals(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách yêu cầu rút tiền.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx) => {
    setLoadingId(tx.id);
    setError('');
    setSuccess('');
    try {
      await approveWithdrawalAPI(tx.id);
      setSuccess(`Đã duyệt giao dịch rút tiền #${tx.id} thành công.`);
      setWithdrawals(prev =>
        prev.map(w => (w.id === tx.id ? { ...w, status: 'SUCCESS' } : w))
      );
    } catch (err) {
      setError(`Duyệt giao dịch thất bại: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (tx) => {
    setLoadingId(tx.id);
    setError('');
    setSuccess('');
    try {
      await rejectWithdrawalAPI(tx.id);
      setSuccess(`Đã từ chối giao dịch rút tiền #${tx.id} và hoàn tiền.`);
      setWithdrawals(prev =>
        prev.map(w => (w.id === tx.id ? { ...w, status: 'FAILED' } : w))
      );
    } catch (err) {
      setError(`Từ chối giao dịch thất bại: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ho-font-epilogue fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaWallet style={{ color: 'var(--ho-accent-gold-text)' }} /> Phê Duyệt Yêu Cầu Rút Tiền
        </h2>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCheckCircle style={{ color: '#10b981' }} /> {success}
        </div>
      )}

      {/* Table list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 className="ho-font-epilogue fs-5 fw-bold" style={{ color: 'var(--ho-primary-dark)', margin: 0 }}>
          Yêu Cầu Đang Chờ Xử Lý ({withdrawals.filter(w => w.status === 'PENDING').length})
        </h3>

        <div style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid var(--ho-border-gold)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ho-border-gold)', background: 'rgba(0,56,32,0.04)' }}>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Mã giao dịch</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Khách hàng</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Tài khoản nhận tiền</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Số ví</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Số tiền rút</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Thời gian yêu cầu</th>
                <th style={{ padding: '16px', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--ho-primary-dark)', fontWeight: '700' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--ho-text-muted)' }}>
                    Chưa phát sinh yêu cầu rút tiền nào.
                  </td>
                </tr>
              ) : (
                withdrawals.map((tx) => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid var(--ho-border-muted)',
                      transition: 'background 0.2s',
                      opacity: loadingId === tx.id ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 56, 32, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--ho-primary-dark)' }}>#{tx.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--ho-text-dark)', fontWeight: '600' }}>{tx.userFullName}</span>
                        <span style={{ color: 'var(--ho-text-muted)', fontSize: '12px' }}>{tx.userEmail}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: 'var(--ho-text-dark)', fontWeight: '500', wordBreak: 'break-all' }}>
                        {tx.bankAccount || <em style={{ color: 'var(--ho-text-muted)', fontStyle: 'italic' }}>Chưa liên kết ngân hàng</em>}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--ho-text-dark)', fontWeight: '500' }}>Wallet #{tx.walletId}</td>
                    <td style={{ padding: '16px', color: 'var(--ho-accent-gold-text)', fontWeight: '700' }}>
                      {tx.amount.toLocaleString()} VND
                    </td>
                    <td style={{ padding: '16px', color: 'var(--ho-text-muted)' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : ''}
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
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {tx.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApprove(tx)}
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
                              <FaCheck /> Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(tx)}
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
                              <FaTimes /> Từ chối
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--ho-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCheckCircle style={{ color: tx.status === 'SUCCESS' ? '#10b981' : '#ef4444' }} /> Hoàn thành
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
    </div>
  );
}
