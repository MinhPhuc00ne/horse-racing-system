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
      console.error('Lỗi parse user:', e);
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
          console.error('Lỗi khi tải tài khoản ngân hàng từ profile:', err);
        }
      };
      fetchProfile();
    }
  }, [bankAccount, user]);

  const roleName = user?.role === 'HORSE_OWNER' ? 'Chủ Chuồng Ngựa' : 'Kỵ Sĩ';
  const accountHolder = `VÍ ĐIỆN TỬ ${roleName.toUpperCase()} - ${user?.fullName?.toUpperCase() || 'KHÁCH HÀNG'}`;
  const bankName = orderCode ? 'PayOS Portal' : 'Ngân hàng liên kết';
  const accountNumber = bankAccount ? bankAccount : 'Chưa bổ sung';

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
          alert('Thanh toán thành công! Số tiền đã được cộng vào ví.');
          navigate(returnUrl, { replace: true });
        } else if (res.status === 'CANCELLED' || res.status === 'FAILED') {
          clearInterval(intervalId);
          setPaymentStatus('FAILED');
          alert('Giao dịch đã bị hủy hoặc thất bại.');
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [orderCode, navigate, returnUrl]);

  const handleConfirmPayment = async () => {
    if (!orderCode) {
      // Mock mode success fallback
      alert(`Đã nạp thành công ${amount.toLocaleString()} VND vào ví!`);
      navigate(returnUrl, { replace: true });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await checkDepositStatusAPI(orderCode);
      if (res.status === 'SUCCESS') {
        alert('Thanh toán thành công! Số tiền đã được cộng vào ví.');
        navigate(returnUrl, { replace: true });
      } else {
        alert(`Trạng thái thanh toán hiện tại: ${res.status === 'PENDING' ? 'Chưa nhận được thanh toán' : res.status}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi kiểm tra: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate(returnUrl, { replace: true });
  };

  // If we have a real qrCode from PayOS, render it, otherwise use the mock transaction template data
  const qrData = qrCode || `Nạp tiền: ${amount} VND. Chuyển khoản đến ${accountHolder}. Ngân hàng: ${bankName}. Số tài khoản: ${accountNumber}`;

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: '#02140b' }}
    >
      <div
        className="card p-5 shadow-lg text-center"
        style={{ maxWidth: '500px', width: '100%', borderRadius: '15px', backgroundColor: '#fff' }}
      >
        <h2 className="mb-4 text-dark fw-bold">Nạp Tiền Vào Ví {roleName}</h2>

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
              Mở trang thanh toán cổng PayOS (Cửa sổ mới)
            </a>
          </div>
        )}

        <div className="text-start mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', fontSize: '14px' }}>
          <p className="mb-2 text-dark">
            <strong>Ngân hàng thụ hưởng:</strong> {bankName}
          </p>
          <p className="mb-2 text-dark">
            <strong>Tài khoản nhận:</strong> {accountHolder}
          </p>
          <p className="mb-2 text-dark">
            <strong>Số tài khoản:</strong> {accountNumber}
          </p>
          <p className="mb-2 text-dark">
            <strong>Số tiền nạp:</strong>{' '}
            <span className="text-success fw-bold">{amount.toLocaleString()} VND</span>
          </p>
          <p className="mb-0 text-dark">
            <strong>Nội dung chuyển khoản:</strong> {orderCode ? `NAPTIEN HORSES ORDER ${orderCode}` : `NAPTIEN ${user?.username?.toUpperCase() || 'USER'}`}
          </p>
        </div>

        {orderCode && (
          <div className="alert alert-info py-2 px-3 mb-3 text-start" style={{ fontSize: '12px' }}>
            <i className="bi bi-info-circle-fill me-1"></i> Hệ thống đang tự động kiểm tra giao dịch mỗi 3 giây sau khi bạn chuyển khoản.
          </div>
        )}

        <div className="d-flex gap-3 mt-3">
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#e2e8f0', color: '#475569' }}
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Quay Lại
          </button>
          <button
            className="btn w-50 fw-bold"
            style={{ backgroundColor: '#d4af37', color: '#000' }}
            onClick={handleConfirmPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Đang Kiểm Tra...' : (orderCode ? 'Kiểm Tra Thanh Toán' : 'Đã Thanh Toán')}
          </button>
        </div>
      </div>
    </div>
  );
}
