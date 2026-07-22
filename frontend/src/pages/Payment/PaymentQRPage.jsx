import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkDepositStatusAPI } from '../../services/wallet';
import { getJockeyProfileAPI } from '../../services/jockey';
import { getOwnerProfileAPI } from '../../services/owner';

export default function PaymentQRPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, returnUrl, qrCode, orderCode, checkoutUrl, bankAccount: initialBankAccount } = location.state || {
    amount: 0,
    returnUrl: '/',
    qrCode: '',
    orderCode: null,
    checkoutUrl: '',
    bankAccount: ''
  };

  const userStr = localStorage.getItem('horse_racing_user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }

  const [bankAccount, setBankAccount] = useState(initialBankAccount || '');

  useEffect(() => {
    if (!bankAccount && user) {
      const fetchProfile = async () => {
        try {
          if (user.role === 'HORSE_OWNER') {
            const profile = await getOwnerProfileAPI();
            if (profile?.bankAccount) {
              setBankAccount(profile.bankAccount);
            }
          } else {
            const profile = await getJockeyProfileAPI();
            if (profile?.bankAccount) {
              setBankAccount(profile.bankAccount);
            }
          }
        } catch (err) {
          console.error('Error loading bank account from profile:', err);
        }
      };
      fetchProfile();
    }
  }, [bankAccount, user]);

  const roleName = user?.role === 'HORSE_OWNER' ? 'Horse Owner' : 'Jockey';
  const accountHolder = `WALLET ${roleName.toUpperCase()} - ${user?.fullName?.toUpperCase() || 'CUSTOMER'}`;
  const bankName = orderCode ? 'PayOS Portal' : 'Linked Bank';
  const accountNumber = bankAccount ? bankAccount : 'Not added yet';

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, SUCCESS, FAILED

  // Polling for real transaction status
  useEffect(() => {
    if (!orderCode) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkDepositStatusAPI(orderCode);
        if (res.status === 'SUCCESS') {
          clearInterval(intervalId);
          setPaymentStatus('SUCCESS');
          alert('Payment successful! The amount has been credited to your wallet.');
          navigate(returnUrl, { replace: true });
        } else if (res.status === 'CANCELLED' || res.status === 'FAILED') {
          clearInterval(intervalId);
          setPaymentStatus('FAILED');
          alert('The transaction has been cancelled or failed.');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [orderCode, navigate, returnUrl]);

  const handleConfirmPayment = async () => {
    if (!orderCode) {
      // Mock mode success fallback
      alert(`Successfully deposited ${amount.toLocaleString()} VND into your wallet!`);
      navigate(returnUrl, { replace: true });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await checkDepositStatusAPI(orderCode);
      if (res.status === 'SUCCESS') {
        alert('Payment successful! The amount has been credited to your wallet.');
        navigate(returnUrl, { replace: true });
      } else {
        alert(`Current payment status: ${res.status === 'PENDING' ? 'Payment not received yet' : res.status}`);
      }
    } catch (error) {
      alert('An error occurred during verification: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate(returnUrl, { replace: true });
  };

  // If we have a real qrCode from PayOS, render it, otherwise use the mock transaction template data
  const qrData = qrCode || `Deposit: ${amount} VND. Transfer to ${accountHolder}. Bank: ${bankName}. Account number: ${accountNumber}`;

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: '#02140b' }}
    >
      <div
        className="card p-5 shadow-lg text-center"
        style={{ maxWidth: '500px', width: '100%', borderRadius: '15px', backgroundColor: '#fff' }}
      >
        <h2 className="mb-4 text-dark fw-bold">Deposit to {roleName} Wallet</h2>

        <div className="d-flex justify-content-center mb-3 p-3 border rounded bg-white">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`}
            alt="Payment QR Code"
            style={{ width: '220px', height: '220px' }}
          />
        </div>

        {checkoutUrl && (
          <div className="mb-3">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link text-decoration-underline text-success small fw-bold"
              style={{ fontSize: '13px' }}
            >
              Open PayOS payment portal (New window)
            </a>
          </div>
        )}

        <div className="text-start mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', fontSize: '14px' }}>
          <p className="mb-2 text-dark">
            <strong>Beneficiary Bank:</strong> {bankName}
          </p>
          <p className="mb-2 text-dark">
            <strong>Recipient Account:</strong> {accountHolder}
          </p>
          <p className="mb-2 text-dark">
            <strong>Account Number:</strong> {accountNumber}
          </p>
          <p className="mb-2 text-dark">
            <strong>Deposit Amount:</strong>{' '}
            <span className="text-success fw-bold">{amount.toLocaleString()} VND</span>
          </p>
          <p className="mb-0 text-dark">
            <strong>Transfer Description:</strong> {orderCode ? `NAPTIEN HORSES ORDER ${orderCode}` : `NAPTIEN ${user?.username?.toUpperCase() || 'USER'}`}
          </p>
        </div>

        {orderCode && (
          <div className="alert alert-info py-2 px-3 mb-3 text-start" style={{ fontSize: '12px' }}>
            <i className="bi bi-info-circle-fill me-1"></i> The system is automatically checking the transaction every 3 seconds after your transfer.
          </div>
        )}

        <div className="d-flex gap-3 mt-3">
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Back
          </button>
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
            onClick={handleConfirmPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Verifying...' : (orderCode ? 'Verify Payment' : 'Paid')}
          </button>
        </div>
      </div>
    </div>
  );
}
