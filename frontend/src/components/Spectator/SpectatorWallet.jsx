import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  getWalletBalanceAPI,
  depositAPI,
  withdrawAPI,
  getTransactionHistoryAPI,
  checkDepositStatusAPI,
  exportTransactionsPdfAPI,
  exportTransactionsExcelAPI,
  updateBankAccountAPI,
  cancelWithdrawalAPI,
} from '../../services/wallet';
import { getProfileAPI } from '../../services/auth';
import '../../pages/Spectator/Spectator.css';

export default function SpectatorWallet({ hideHeader = false }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form State
  const [activeTab, setActiveTab] = useState('deposit');

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [showDepositQR, setShowDepositQR] = useState(false);
  const [depositQrData, setDepositQrData] = useState(null);
  const [checkingDeposit, setCheckingDeposit] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawQR, setShowWithdrawQR] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);

  // Bank Account States
  const [selectedBankBin, setSelectedBankBin] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');

  // Custom Modal States
  const [customModal, setCustomModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isConfirm: false
  });

  const showCustomAlert = (title, message) => {
    setCustomModal({
      show: true,
      title,
      message,
      onConfirm: null,
      isConfirm: false
    });
  };

  const showCustomConfirm = (title, message, onConfirm) => {
    setCustomModal({
      show: true,
      title,
      message,
      onConfirm,
      isConfirm: true
    });
  };

  const formatNumberWithCommas = (val) => {
    if (val === null || val === undefined) return '';
    // Remove all non-digits
    const clean = val.toString().replace(/\D/g, '');
    // Limit to 10 digits max to prevent overflow
    const truncated = clean.substring(0, 10);
    // Format with commas
    return truncated.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const fetchWalletData = async () => {
    try {
      const res = await getWalletBalanceAPI();
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to load balance', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const txs = await getTransactionHistoryAPI();
      setHistory(txs || []);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadProfileBankDetails = async () => {
    try {
      const profile = await getProfileAPI();
      if (profile) {
        if (profile.bankBin) setSelectedBankBin(profile.bankBin);
        if (profile.bankName) setSelectedBankName(profile.bankName);
        if (profile.bankAccountNumber) setBankAccountNumber(profile.bankAccountNumber);
        if (profile.bankAccountHolderName) setBankAccountHolderName(profile.bankAccountHolderName);
      }
    } catch (err) {
      console.error('Failed to load profile bank details', err);
    }
  };

  const handleCancelWithdrawal = (txId) => {
    showCustomConfirm(
      'Xác Nhận Hủy Giao Dịch',
      'Bạn có chắc chắn muốn hủy yêu cầu rút tiền này?\nTiền sẽ được hoàn trả lại ví của bạn.',
      async () => {
        try {
          await cancelWithdrawalAPI(txId);
          showCustomAlert('Thành công', 'Đã hủy yêu cầu rút tiền thành công!');
          await fetchWalletData();
          await fetchHistoryData();
        } catch (err) {
          showCustomAlert('Thất bại', err.message || 'Hủy yêu cầu rút tiền thất bại.');
        }
      }
    );
  };

  useEffect(() => {
    fetchWalletData();
    fetchHistoryData();
    loadProfileBankDetails();
  }, []);

  // Polling for real deposit transaction status
  useEffect(() => {
    if (!showDepositQR || !depositQrData?.orderCode) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkDepositStatusAPI(depositQrData.orderCode);
        if (res.status === 'SUCCESS') {
          clearInterval(intervalId);
          setShowDepositQR(false);
          setDepositQrData(null);
          showCustomAlert('Thành công', 'Thanh toán thành công! Số tiền đã được cộng vào ví.');
          fetchWalletData();
          fetchHistoryData();
        } else if (res.status === 'CANCELLED' || res.status === 'FAILED') {
          clearInterval(intervalId);
          setShowDepositQR(false);
          setDepositQrData(null);
          showCustomAlert('Thông báo', 'Giao dịch đã bị hủy hoặc thất bại.');
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái thanh toán:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [showDepositQR, depositQrData]);

  const handleDepositSubmit = async (e) => {
    if (e) e.preventDefault();
    const amountVal = parseFloat(depositAmount.toString().replace(/,/g, ''));
    if (isNaN(amountVal) || amountVal <= 0) {
      showCustomAlert('Thông báo', 'Vui lòng nhập số tiền nạp hợp lệ.');
      return;
    }

    if (amountVal > 500000000) {
      showCustomAlert('Giới hạn giao dịch', 'Số tiền nạp tối đa cho mỗi giao dịch là 500,000,000 VND.');
      return;
    }

    setDepositing(true);
    try {
      const res = await depositAPI(amountVal);
      if (res) {
        setDepositQrData({
          amount: amountVal,
          qrCode: res.qrCode || '',
          orderCode: res.orderCode || null,
          checkoutUrl: res.checkoutUrl || '',
          isMock: !res.checkoutUrl
        });
        setShowDepositQR(true);
        setDepositAmount('');
      } else {
        showCustomAlert('Lỗi', 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      showCustomAlert('Lỗi', err.message || 'Giao dịch nạp tiền thất bại.');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    if (e) e.preventDefault();
    const amountVal = parseFloat(withdrawAmount.toString().replace(/,/g, ''));

    if (!selectedBankName || !bankAccountNumber) {
      showCustomAlert(
        'Yêu Cầu Thiết Lập Ngân Hàng',
        'Bạn chưa liên kết thông tin ngân hàng thụ hưởng (Tên ngân hàng, Số tài khoản) trong Hồ Sơ của mình.\n\nVui lòng vào mục Hồ Sơ (Profile) để thiết lập thông tin ngân hàng trước khi thực hiện rút tiền.'
      );
      return;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      showCustomAlert('Thông báo', 'Vui lòng nhập số tiền rút hợp lệ.');
      return;
    }

    if (amountVal > 500000000) {
      showCustomAlert('Giới hạn giao dịch', 'Số tiền rút tối đa cho mỗi giao dịch là 500,000,000 VND.');
      return;
    }

    if (amountVal > balance) {
      showCustomAlert('Lỗi', 'Số dư ví hiện tại không đủ để thực hiện giao dịch này.');
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawAPI(amountVal, selectedBankName, selectedBankBin, bankAccountNumber, bankAccountHolderName);
      setQrAmount(amountVal);
      setShowWithdrawQR(true);
      setWithdrawAmount('');
      await fetchWalletData();
      await fetchHistoryData();
    } catch (err) {
      showCustomAlert('Thất bại', err.message || 'Yêu cầu rút tiền thất bại.');
    } finally {
      setWithdrawing(false);
    }
  };

  const selectQuickAmount = (val) => {
    setDepositAmount(formatNumberWithCommas(val));
  };

  const handleExportPdf = async () => {
    try {
      const blob = await exportTransactionsPdfAPI();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Transaction_History.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert(error.message || 'Error exporting PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportTransactionsExcelAPI();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Transaction_History.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert(error.message || 'Error exporting Excel');
    }
  };

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      {/* Title */}
      {!hideHeader && (
        <div className="mb-4">
          <span className="role-badge">SPECTATOR ROLE</span>
          <h2 className="ho-font-epilogue fs-3 fw-bold text-dark mb-1">My Wallet & Transactions</h2>
          <p className="text-secondary small">
            Manage your funds, make deposits via VietQR, or request cash withdrawals.
          </p>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Wallet Balance & Forms */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          {/* Card Wallet Graphic */}
          <div className="wallet-premium-card">
            <div className="d-flex justify-content-between align-items-center">
              <span className="card-brand">EquineElite Member Wallet</span>
              <div className="card-chip"></div>
            </div>
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">
              {loading ? 'Loading...' : `${balance.toLocaleString('en-US')} VND`}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '15px',
                right: '20px',
                opacity: 0.15,
                fontSize: '48px',
              }}
            >
              💳
            </div>
          </div>

          {/* Form Tabs: Deposit & Withdraw */}
          <div className="glass-card flex-grow-1" style={{ padding: '24px' }}>
            <div className="wallet-tab-container mb-4">
              <div
                className="wallet-tab-slider"
                style={{
                  transform: activeTab === 'withdraw' ? 'translateX(100%)' : 'translateX(0)',
                }}
              />
              <button
                className={`wallet-tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
                type="button"
              >
                Deposit
              </button>
              <button
                className={`wallet-tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
                type="button"
              >
                Withdraw
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'deposit' ? (
                /* Deposit Panel */
                <div className="animate-fade-in">
                  <form onSubmit={handleDepositSubmit} className="d-flex flex-column gap-3">
                    <div className="form-group">
                      <label className="ho-input-label text-dark fw-bold mb-2">
                        Enter Deposit Amount
                      </label>
                      <div className="wallet-premium-input-group">
                        <input
                          type="text"
                          className="wallet-premium-input"
                          placeholder="e.g. 100,000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(formatNumberWithCommas(e.target.value))}
                          required
                        />
                        <span className="wallet-premium-input-suffix">VND</span>
                      </div>
                      <small className="text-muted small mt-1 d-block" style={{ fontSize: '11px' }}>
                        Minimum deposit: 10,000 VND
                      </small>
                    </div>

                    {/* Quick Options */}
                    <div>
                      <label className="ho-input-label text-dark fw-bold mb-2">
                        Quick Select Amount
                      </label>
                      <div className="wallet-quick-select-grid">
                        {[50000, 100000, 200000, 500000, 1000000].map((val) => {
                          const isSelected = depositAmount.toString().replace(/,/g, '') === val.toString();
                          return (
                            <div
                              key={val}
                              onClick={() => selectQuickAmount(val)}
                              className={`wallet-quick-select-card ${isSelected ? 'active' : ''}`}
                            >
                              {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="wallet-submit-btn w-100 mt-2 py-3"
                      disabled={depositing}
                    >
                      {depositing ? 'Generating checkout...' : 'Deposit via VietQR'}
                    </button>
                  </form>
                </div>
              ) : (
                /* Withdraw Panel */
                <div className="animate-fade-in">
                  <form onSubmit={handleWithdrawSubmit} className="d-flex flex-column gap-3">
                    <div className="form-group">
                      <label className="ho-input-label text-dark fw-bold mb-2">
                        Enter Withdrawal Amount
                      </label>
                      <div className="wallet-premium-input-group">
                        <input
                          type="text"
                          className="wallet-premium-input"
                          placeholder="e.g. 50,000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(formatNumberWithCommas(e.target.value))}
                          required
                        />
                        <span className="wallet-premium-input-suffix">VND</span>
                      </div>
                      <small className="text-muted small mt-1 d-block" style={{ fontSize: '11px' }}>
                        Minimum withdrawal: 20,000 VND
                      </small>
                    </div>

                    {/* Quick Options for Withdrawal */}
                    <div>
                      <label className="ho-input-label text-dark fw-bold mb-2">
                        Quick Select Amount
                      </label>
                      <div className="wallet-quick-select-grid">
                        {[50000, 100000, 200000, 500000, 1000000].map((val) => {
                          const isSelected = withdrawAmount.toString().replace(/,/g, '') === val.toString();
                          return (
                            <div
                              key={val}
                              onClick={() => setWithdrawAmount(formatNumberWithCommas(val))}
                              className={`wallet-quick-select-card ${isSelected ? 'active' : ''}`}
                            >
                              {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className="p-3 rounded text-secondary small mb-2"
                      style={{
                        background: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                        lineHeight: '1.4',
                      }}
                    >
                      <span className="fw-bold d-block text-dark mb-1">
                        📌 Withdrawal Processing Flow:
                      </span>
                      Spectator submits request → Amount is temporarily frozen → Admin reviews and
                      approves transaction → Cash/transfer completed externally.
                    </div>

                    <button
                      type="submit"
                      className="wallet-submit-btn w-100 py-3"
                      disabled={withdrawing}
                    >
                      {withdrawing ? 'Processing...' : 'Submit Withdrawal Request'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="col-12 col-lg-7">
          <div className="glass-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="form-section-title mb-0">
                <span className="material-symbols-outlined text-success">history</span>
                Transaction History
              </h3>

            </div>

            {loadingHistory ? (
              <div className="text-center py-5">
                <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                <p className="text-secondary small mt-2">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-5 text-secondary small">
                No transaction history found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table ho-table">
                  <thead>
                    <tr>
                      <th>TXID</th>
                      <th>Date Created</th>
                      <th>Transaction Details</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx) => {
                      const isDeposit = tx.type === 'DEPOSIT' || tx.amount > 0;
                      return (
                        <tr key={tx.id}>
                          <td>
                            <span className="text-secondary small font-monospace">#{tx.id}</span>
                          </td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{tx.date}</td>
                          <td>{tx.event}</td>
                          <td
                            className={`fw-bold ${isDeposit ? 'text-success' : 'text-danger'}`}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {isDeposit ? '+' : ''}
                            {tx.amount.toLocaleString('en-US')} VND
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                tx.status === 'SUCCESS'
                                  ? 'bg-success'
                                  : tx.status === 'PENDING'
                                    ? 'bg-warning text-dark'
                                    : 'bg-danger'
                              } text-uppercase small`}
                              style={{ fontSize: '9px' }}
                            >
                              {tx.status === 'SUCCESS'
                                ? 'Success'
                                : tx.status === 'PENDING'
                                  ? 'Pending'
                                  : 'Failed'}
                            </span>
                          </td>
                          <td>
                            {tx.type === 'WITHDRAW' && tx.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelWithdrawal(tx.id)}
                                className="btn btn-xs btn-outline-danger"
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #e53e3e',
                                  color: '#e53e3e',
                                  backgroundColor: 'transparent',
                                }}
                              >
                                Hủy
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWithdrawQR && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowWithdrawQR(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
              color: '#333',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              padding: '24px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="m-0 fw-bold text-dark" style={{ fontFamily: 'var(--font-family)' }}>
                Yêu Cầu Rút Tiền
              </h5>
              <button className="btn-close" onClick={() => setShowWithdrawQR(false)}></button>
            </div>
            <p className="small text-secondary mb-3">
              Quét mã QR dưới đây để nhận thông tin giao dịch rút tiền{' '}
              <strong>{qrAmount.toLocaleString('en-US')} VND</strong>.
            </p>
            <div className="mb-3 d-flex justify-content-center bg-light p-3 rounded">
              <img
                src={`https://api.vietqr.io/image/970415-113366668888-j1YV5A8.jpg?accountName=HE%20THONG%20DUA%20NGUA&amount=${qrAmount}&addInfo=RUT%20TIEN%20HE%20THONG`}
                alt="VietQR Withdrawal"
                style={{ width: '220px', height: '220px', objectFit: 'contain' }}
              />
            </div>
            <div
              className="alert alert-warning small text-start mb-3 py-2"
              style={{ border: 'none', backgroundColor: '#fff3cd', color: '#664d03' }}
            >
              📌 Yêu cầu đã được gửi lên hệ thống. Ban quản trị sẽ kiểm tra và thực hiện chuyển
              khoản cho bạn.
            </div>
            <button
              className="ho-btn ho-btn-gold-solid w-100 py-2"
              onClick={() => setShowWithdrawQR(false)}
            >
              Đóng
            </button>
          </div>
        </div>,
        document.body
      )}

      {showDepositQR && depositQrData && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => {
            setShowDepositQR(false);
            setDepositQrData(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
              color: '#333',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              padding: '24px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="m-0 fw-bold text-dark" style={{ fontFamily: 'var(--font-family)' }}>
                Nạp Tiền Vào Ví
              </h5>
              <button
                className="btn-close"
                onClick={() => {
                  setShowDepositQR(false);
                  setDepositQrData(null);
                }}
              />
            </div>
            <p className="small text-secondary mb-3">
              Quét mã VietQR dưới đây để nạp{' '}
              <strong>{depositQrData.amount.toLocaleString('en-US')} VND</strong> vào tài khoản.
            </p>

            <div style={{
              textAlign: 'left',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontSize: '13px',
              border: '1px solid #edf2f7'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#718096' }}>Phương thức:</span>
                <span style={{ fontWeight: '600', color: '#2d3748' }}>
                  {depositQrData.isMock ? 'VietQR (Giả lập)' : 'Chuyển khoản VietQR'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#718096' }}>Mã đơn hàng:</span>
                <span style={{ fontWeight: '600', color: '#2d3748', fontFamily: 'monospace' }}>
                  {depositQrData.orderCode ? `#${depositQrData.orderCode}` : 'MOCK_TEST'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#718096' }}>Số tiền nạp:</span>
                <span style={{ fontWeight: '700', color: 'var(--ho-accent-gold-text, #b58900)' }}>
                  {depositQrData.amount.toLocaleString('en-US')} VND
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096' }}>Trạng thái:</span>
                <span style={{ fontWeight: '600', color: '#dd6b20' }}>
                  Chờ quét mã...
                </span>
              </div>
            </div>

            <div className="mb-3 d-flex justify-content-center bg-light p-3 rounded">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                  depositQrData.isMock
                    ? `Nạp tiền giả lập: ${depositQrData.amount} VND`
                    : depositQrData.qrCode
                )}`}
                alt="VietQR Deposit"
                style={{ width: '220px', height: '220px', objectFit: 'contain' }}
              />
            </div>

            {depositQrData.checkoutUrl && (
              <div className="mb-3">
                <a
                  href={depositQrData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link text-decoration-underline text-success small fw-bold p-0"
                  style={{ fontSize: '13px' }}
                >
                  Mở trang thanh toán PayOS (Cửa sổ mới)
                </a>
              </div>
            )}

            {!depositQrData.isMock ? (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-center gap-2 text-warning small py-1 bg-light rounded" style={{ fontSize: '11px' }}>
                  <div className="spinner-border spinner-border-sm text-warning" role="status" style={{ width: '12px', height: '12px' }} />
                  <span>Đang kiểm tra giao dịch tự động...</span>
                </div>
                <button
                  className="ho-btn ho-btn-gold-solid w-100 py-2"
                  disabled={checkingDeposit}
                  onClick={async () => {
                    setCheckingDeposit(true);
                    try {
                      const statusRes = await checkDepositStatusAPI(depositQrData.orderCode);
                      if (statusRes.status === 'SUCCESS') {
                        setShowDepositQR(false);
                        setDepositQrData(null);
                        showCustomAlert('Thành công', 'Thanh toán thành công! Số tiền đã được cộng vào ví.');
                        fetchWalletData();
                        fetchHistoryData();
                      } else {
                        showCustomAlert('Thông báo', `Trạng thái thanh toán hiện tại: ${statusRes.status === 'PENDING' ? 'Chưa nhận được chuyển khoản' : statusRes.status}`);
                      }
                    } catch (err) {
                      showCustomAlert('Thất bại', 'Kiểm tra thất bại: ' + err.message);
                    } finally {
                      setCheckingDeposit(false);
                    }
                  }}
                >
                  {checkingDeposit ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
                </button>
              </div>
            ) : (
              <button
                className="ho-btn ho-btn-gold-solid w-100 py-2"
                onClick={() => {
                  setShowDepositQR(false);
                  setDepositQrData(null);
                  showCustomAlert('Thành công', `Đã nạp thành công ${depositQrData.amount.toLocaleString('en-US')} VND vào ví (Giả lập)!`);
                  fetchWalletData();
                  fetchHistoryData();
                }}
              >
                Xác nhận đã chuyển khoản (Giả lập)
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {customModal.show && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          fontFamily: 'var(--font-family, "Google Sans", sans-serif)'
        }} onClick={() => setCustomModal(prev => ({ ...prev, show: false }))}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '90%',
            color: '#333333',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            padding: '24px',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <h5 className="fw-bold mb-3 text-start" style={{ 
              fontSize: '18px', 
              color: 'var(--ho-primary-dark, #003820)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              paddingBottom: '12px'
            }}>
              {customModal.title}
            </h5>
            
            <p className="text-secondary small mb-4 text-start" style={{ 
              fontSize: '14px', 
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {customModal.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {customModal.isConfirm ? (
                <>
                  <button 
                    className="btn btn-outline-secondary btn-sm" 
                    style={{ padding: '8px 20px', borderRadius: '8px' }}
                    onClick={() => setCustomModal(prev => ({ ...prev, show: false }))}
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    className="ho-btn ho-btn-gold-solid py-2 px-4" 
                    style={{ fontSize: '13px' }}
                    onClick={() => {
                      setCustomModal(prev => ({ ...prev, show: false }));
                      if (customModal.onConfirm) customModal.onConfirm();
                    }}
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button 
                  className="ho-btn ho-btn-gold-solid py-2 px-5" 
                  style={{ fontSize: '13px' }}
                  onClick={() => setCustomModal(prev => ({ ...prev, show: false }))}
                >
                  Đồng ý
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
