import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileAPI, updateUserProfileAPI } from '../../services/auth';
import { uploadFilesAPI } from '../../services/owner';
import {
  getWalletBalanceAPI,
  depositAPI,
  withdrawAPI,
  updateBankAccountAPI,
  getTransactionHistoryAPI,
} from '../../services/wallet';

const presetAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

const fallbackTransactions = [
  {
    id: 'TX-REF-801',
    date: '2026-07-20 14:30',
    type: 'DEPOSIT',
    event: 'Referee wallet deposit via PayOS Portal',
    amount: 1000000,
  },
  {
    id: 'TX-REF-802',
    date: '2026-07-18 16:45',
    type: 'STIPEND',
    event: 'Head Referee Stipend - Tempest Royal Tournament',
    amount: 5000000,
  },
  {
    id: 'TX-REF-803',
    date: '2026-07-15 09:15',
    type: 'WITHDRAWAL',
    event: 'Withdrawal to linked bank account',
    amount: -2000000,
  },
];

export default function RefereeProfileContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    id: null,
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    identityNumber: '',
    dateOfBirth: '',
    licenseNumber: 'REF-LIC-2026-08',
    experienceYears: 5,
    description: 'National-level racetrack referee with over 5 years of experience officiating and supervising professional tournaments.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    avatarZoom: 1,
    avatarOffsetX: 0,
    avatarOffsetY: 0,
  });

  // Avatar Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Bank Form State
  const [bankName, setBankName] = useState('');
  const [bankBin, setBankBin] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');

  // Wallet & Transactions State
  const [walletBalance, setWalletBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Profile Info
        const userProfile = await getProfileAPI();
        if (userProfile) {
          setFormData((prev) => ({
            ...prev,
            id: userProfile.id,
            username: userProfile.username || '',
            email: userProfile.email || '',
            fullName: userProfile.fullName || '',
            phoneNumber: userProfile.phone || userProfile.phoneNumber || '',
            avatar: userProfile.avatarUrl || prev.avatar,
          }));
          setBankName(userProfile.bankName || '');
          setBankBin(userProfile.bankBin || '');
          setBankAccountNumber(userProfile.bankAccountNumber || '');
          setBankAccountHolderName(userProfile.bankAccountHolderName || userProfile.fullName || '');
        }

        // Restore custom profile fields from localStorage if stored locally
        const savedRefProfile = localStorage.getItem('referee_profile_ext');
        if (savedRefProfile) {
          try {
            const ext = JSON.parse(savedRefProfile);
            setFormData((prev) => ({ ...prev, ...ext }));
          } catch (e) {
            console.error('Error parsing saved referee profile:', e);
          }
        }

        // 2. Fetch Wallet Balance
        try {
          const balanceRes = await getWalletBalanceAPI();
          if (balanceRes && balanceRes.balance !== undefined) {
            setWalletBalance(balanceRes.balance);
          }
        } catch (err) {
          console.error('Failed to get referee wallet balance:', err);
          const savedBal = localStorage.getItem('referee_wallet_balance');
          setWalletBalance(savedBal ? parseFloat(savedBal) : 5000000);
        }

        // 3. Fetch Transaction History
        try {
          const txRes = await getTransactionHistoryAPI();
          if (txRes && txRes.length > 0) {
            setTransactions(txRes);
          } else {
            const savedTx = localStorage.getItem('referee_transactions');
            setTransactions(savedTx ? JSON.parse(savedTx) : fallbackTransactions);
          }
        } catch (err) {
          console.error('Failed to load transaction history:', err);
          const savedTx = localStorage.getItem('referee_transactions');
          setTransactions(savedTx ? JSON.parse(savedTx) : fallbackTransactions);
        }
      } catch (err) {
        console.error('Error loading referee profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatInputWithCommas = (val) => {
    const clean = val.replace(/\D/g, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Save to Backend API
      await updateUserProfileAPI({
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        avatarUrl: formData.avatar,
        bankName: bankName,
        bankBin: bankBin,
        bankAccountNumber: bankAccountNumber,
        bankAccountHolderName: bankAccountHolderName,
      });

      await updateBankAccountAPI(bankName, bankBin, bankAccountNumber, bankAccountHolderName);

      // Save extended local state
      localStorage.setItem(
        'referee_profile_ext',
        JSON.stringify({
          identityNumber: formData.identityNumber,
          dateOfBirth: formData.dateOfBirth,
          licenseNumber: formData.licenseNumber,
          experienceYears: formData.experienceYears,
          description: formData.description,
          avatarZoom: formData.avatarZoom,
          avatarOffsetX: formData.avatarOffsetX,
          avatarOffsetY: formData.avatarOffsetY,
        })
      );

      // Update cached user object
      const userStr = localStorage.getItem('horse_racing_user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          u.fullName = formData.fullName;
          u.phone = formData.phoneNumber;
          u.avatarUrl = formData.avatar;
          localStorage.setItem('horse_racing_user', JSON.stringify(u));
        } catch (err) {
          console.error(err);
        }
      }

      alert('Referee profile and bank details saved successfully!');
    } catch (err) {
      alert('Profile update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    try {
      const res = await depositAPI(amt);
      navigate('/payment-qr', {
        state: {
          amount: amt,
          qrCode: res.qrCode || '',
          orderCode: res.orderCode || null,
          checkoutUrl: res.checkoutUrl || '',
          returnUrl: '/referee/profile',
          bankAccount: `${bankAccountNumber} - ${bankName}`,
        },
      });
      setDepositAmount('');
    } catch (err) {
      alert('Failed to create payment link: ' + err.message);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(depositAmount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (amt > walletBalance) {
      alert('Insufficient wallet balance for withdrawal.');
      return;
    }

    try {
      await withdrawAPI(amt, bankName, bankBin, bankAccountNumber, bankAccountHolderName);

      const newBal = walletBalance - amt;
      setWalletBalance(newBal);
      localStorage.setItem('referee_wallet_balance', newBal.toString());

      const newTx = {
        id: `TX-REF-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        type: 'WITHDRAWAL',
        event: 'Withdrawal request to linked bank account',
        amount: -amt,
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('referee_transactions', JSON.stringify(updatedTxs));

      alert(`Withdrawal request for ${amt.toLocaleString()} VND submitted successfully. System will process shortly.`);
      setDepositAmount('');
    } catch (err) {
      alert('Withdrawal failed: ' + err.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        const urls = await uploadFilesAPI([file]);
        if (urls && urls.length > 0) {
          let url = urls[0];
          if (url.startsWith('/')) {
            url = `http://localhost:8080${url}`;
          }
          setFormData((prev) => ({
            ...prev,
            avatar: url,
            avatarZoom: 1,
            avatarOffsetX: 0,
            avatarOffsetY: 0,
          }));
        }
      } catch (err) {
        alert('Avatar upload failed: ' + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const currentOffsetX = ((formData.avatarOffsetX || 0) * 80) / 100;
    const currentOffsetY = ((formData.avatarOffsetY || 0) * 80) / 100;
    setDragStart({
      x: e.clientX - currentOffsetX,
      y: e.clientY - currentOffsetY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const pctX = (deltaX / 80) * 100;
    const pctY = (deltaY / 80) * 100;
    setFormData((prev) => ({
      ...prev,
      avatarOffsetX: Math.max(-100, Math.min(100, pctX)),
      avatarOffsetY: Math.max(-100, Math.min(100, pctY)),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '70vh', color: 'var(--ho-primary-dark)', fontFamily: 'var(--font-family)' }}
      >
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="fw-bold fs-5">Loading referee profile...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px', fontFamily: 'var(--font-family)' }}>
      {/* Title Header */}
      <div
        className="d-flex justify-content-between align-items-end border-bottom pb-3 mb-4"
        style={{ borderColor: 'var(--ho-border-muted)' }}
      >
        <div>
          <h2 className="fs-3 fw-bold mb-1" style={{ color: 'var(--ho-primary-dark)' }}>
            Referee Profile & Wallet
          </h2>
          <p className="text-secondary small m-0">
            Manage personal details, referee credentials, avatar configuration, and stipend wallet.
          </p>
        </div>
        <span
          className="badge px-3 py-2 rounded-pill fw-bold text-uppercase"
          style={{ backgroundColor: '#0b4f32', color: '#fcd34d', fontSize: '12px', letterSpacing: '0.05em' }}
        >
          Official Race Referee
        </span>
      </div>

      <div className="row g-4">
        {/* Left Column: Referee Profile Settings & Avatar Controls */}
        <div className="col-12 col-lg-6">
          <div className="glass-card d-flex flex-column h-100 p-4">
            <h3
              className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-4"
              style={{ color: 'var(--ho-primary-dark)' }}
            >
              Referee Profile Configuration
            </h3>

            <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-3 flex-grow-1">
              {/* Profile Avatar Selection & Customizer */}
              <div
                className="d-flex flex-column align-items-center gap-3 mb-3 pb-3 border-bottom"
                style={{ borderColor: 'var(--ho-border-muted)' }}
              >
                <div
                  className="position-relative rounded-circle overflow-hidden border cursor-grab shadow-sm"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderColor: 'var(--ho-accent-gold)',
                    borderWidth: '2px',
                    backgroundColor: '#eae5e4',
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={formData.avatar}
                    alt="Referee Avatar Preview"
                    className="w-100 h-100 object-fit-cover"
                    style={{
                      transform: `translate(${formData.avatarOffsetX || 0}%, ${formData.avatarOffsetY || 0}%) scale(${formData.avatarZoom || 1})`,
                      transformOrigin: 'center center',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                <div className="w-100">
                  <label className="ho-input-label text-center d-block mb-2 fw-bold">
                    Select Avatar Profile Picture
                  </label>

                  {/* Presets */}
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {presetAvatars.map((url, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            avatar: url,
                            avatarZoom: 1,
                            avatarOffsetX: 0,
                            avatarOffsetY: 0,
                          }))
                        }
                        className="rounded-circle overflow-hidden border cursor-pointer transition-all"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderColor: formData.avatar === url ? 'var(--ho-accent-gold)' : '#c0c9c0',
                          borderWidth: '2px',
                          transform: formData.avatar === url ? 'scale(1.15)' : 'none',
                          boxShadow: formData.avatar === url ? '0 0 8px rgba(212, 175, 55, 0.6)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <img src={url} alt={`Preset ${index + 1}`} className="w-100 h-100 object-fit-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Local File Uploader */}
                  <div className="d-flex flex-column gap-2 align-items-center mb-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('ref-avatar-upload').click()}
                      className="ho-btn ho-btn-gold-outline py-1.5 px-3 d-flex align-items-center gap-2"
                      style={{ fontSize: '11px', opacity: uploading ? 0.6 : 1 }}
                      disabled={uploading}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        {uploading ? 'sync' : 'upload'}
                      </span>
                      {uploading ? 'Uploading...' : 'Upload From Computer'}
                    </button>
                    <input
                      type="file"
                      id="ref-avatar-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </div>

                  {/* Zoom & Reposition Controls */}
                  <div className="px-3 mb-2 w-100">
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>Zoom</span>
                      <span>{Math.round((formData.avatarZoom || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={formData.avatarZoom || 1}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, avatarZoom: parseFloat(e.target.value) }))
                      }
                      className="form-range"
                      style={{ accentColor: 'var(--ho-accent-gold)' }}
                    />
                    <small className="text-secondary d-block text-center mt-1" style={{ fontSize: '10px' }}>
                      Click and drag image above to reposition center
                    </small>
                  </div>
                </div>
              </div>

              {/* Description / Bio */}
              <div>
                <label className="ho-input-label">Biography & Referee Skill Notes</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="ho-form-input"
                  rows="3"
                  placeholder="Enter bio, racetrack expertise, and notes..."
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Personal Details */}
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="ho-form-input"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="ho-form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="ho-input-label">Email Address (Account)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="ho-form-input"
                  style={{ cursor: 'not-allowed', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}
                />
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Identity / Passport Number</label>
                  <input
                    type="text"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="ho-form-input"
                    placeholder="e.g. 038090100026"
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="ho-form-input"
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Referee License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="ho-form-input font-monospace"
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="ho-input-label">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                    className="ho-form-input"
                  />
                </div>
              </div>

              {/* Bank Account Information */}
              <div className="border-top pt-3 mt-3">
                <h4 className="ho-font-epilogue fs-6 fw-bold mb-3" style={{ color: '#ffffff' }}>
                  Beneficiary Bank Account Details
                </h4>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="ho-input-label">Bank Name</label>
                    <input
                      type="text"
                      className="ho-form-input"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Chase, HSBC, Citibank"
                      required
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="ho-input-label">Account Number</label>
                    <input
                      type="text"
                      className="ho-form-input font-monospace"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="ho-input-label">Account Holder Name (Uppercase)</label>
                    <input
                      type="text"
                      className="ho-form-input"
                      value={bankAccountHolderName}
                      onChange={(e) => setBankAccountHolderName(e.target.value)}
                      placeholder="e.g. GUY CRIMSON"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="ho-btn ho-btn-dark-green w-100 py-3 mt-3 fw-bold" disabled={saving}>
                {saving ? 'Saving...' : 'Save Referee Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Referee Wallet & Transaction Activity Logs */}
        <div className="col-12 col-lg-6 d-flex flex-column gap-4">
          {/* Referee Wallet Card */}
          <div className="glass-card p-4">
            <h3
              className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-3"
              style={{ color: '#ffffff' }}
            >
              Referee Wallet
            </h3>

            <div
              className="rounded-3 p-4 mb-4 d-flex flex-column shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #07150c, #0c2214)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              <h4
                className="text-uppercase fw-bold mb-1"
                style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#95d4ac' }}
              >
                Available Wallet Balance
              </h4>
              <p className="ho-font-epilogue fs-2 fw-extrabold m-0" style={{ color: '#ffe088' }}>
                {walletBalance.toLocaleString()} VND
              </p>
              <p className="small m-0 mt-2 font-mono" style={{ fontSize: '11px', color: '#cbd5e1' }}>
                Linked Bank Account: {bankAccountNumber ? `**** **** ${bankAccountNumber.slice(-4)}` : 'Not Linked'}
              </p>
            </div>

            {/* Deposit & Withdraw Controls */}
            <div className="d-flex flex-column gap-3">
              <input
                type="text"
                placeholder="Enter transaction amount (VND)..."
                value={depositAmount}
                onChange={(e) => setDepositAmount(formatInputWithCommas(e.target.value))}
                className="ho-form-input fw-bold"
              />
              <div className="d-flex gap-2 w-100">
                <button onClick={handleDeposit} className="ho-btn ho-btn-gold-solid flex-grow-1 py-2 px-4 fw-bold">
                  Deposit (PayOS)
                </button>
                <button onClick={handleWithdraw} className="ho-btn ho-btn-gold-outline flex-grow-1 py-2 px-4 fw-bold">
                  Withdraw to Bank
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Transaction Logs */}
          <div className="glass-card p-4">
            <h3
              className="ho-font-epilogue fs-4 fw-bold border-bottom pb-3 mb-3"
              style={{ color: '#ffffff' }}
            >
              Balance Transaction History
            </h3>

            <div className="d-flex flex-column gap-3 overflow-y-auto pr-2" style={{ maxHeight: '350px' }}>
              {transactions.length === 0 ? (
                <div className="text-center text-secondary py-4 small">No transactions executed yet.</div>
              ) : (
                transactions.map((tx, idx) => (
                  <div
                    key={tx.id || idx}
                    className="p-3 border rounded small d-flex flex-column gap-2"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.35)',
                      borderColor: 'rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="fw-bold" style={{ color: '#ffffff' }}>
                        {tx.event || tx.description || 'Referee wallet transaction'}
                      </span>
                      <span className="fw-bold text-uppercase" style={{ color: '#f59e0b', fontSize: '10px' }}>
                        {tx.date || tx.createdAt || 'Recent'}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#cbd5e1' }}>Transaction Type:</span>
                      <span className={`badge ${tx.amount > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {tx.type || (tx.amount > 0 ? 'DEPOSIT' : 'WITHDRAWAL')}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#cbd5e1' }}>Amount:</span>
                      <span className={`fw-bold ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
