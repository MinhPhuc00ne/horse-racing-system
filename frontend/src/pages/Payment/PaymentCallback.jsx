import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkDepositStatusAPI } from '../../services/wallet';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('orderCode');
  const cancel = searchParams.get('cancel');

  useEffect(() => {
    const handleCallback = async () => {
      if (!orderCode) {
        navigate('/');
        return;
      }

      if (cancel === 'true') {
        alert('Giao dịch đã bị hủy.');
        // Try to go back to profile based on role
        navigateBack();
        return;
      }

      try {
        const res = await checkDepositStatusAPI(orderCode);
        if (res.status === 'SUCCESS') {
          alert('Thanh toán thành công! Số tiền đã được cộng vào ví.');
        } else {
          alert(`Trạng thái thanh toán: ${res.status}. Vui lòng chờ hệ thống cập nhật.`);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra giao dịch:', err);
        alert('Có lỗi xảy ra khi kiểm tra giao dịch.');
      } finally {
        navigateBack();
      }
    };

    const navigateBack = () => {
      const userStr = localStorage.getItem('horse_racing_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'HORSE_OWNER') {
            navigate('/owner/profile', { replace: true });
            return;
          } else if (user.role === 'JOCKEY') {
            navigate('/jockey/profile', { replace: true });
            return;
          } else if (user.role === 'RACE_REFEREE') {
            navigate('/referee/profile', { replace: true });
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      navigate('/', { replace: true });
    };

    handleCallback();
  }, [orderCode, cancel, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#02140b', color: 'white' }}>
      <div className="text-center">
        <div className="spinner-border text-success mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h4 className="ho-font-epilogue">Đang xử lý giao dịch... Vui lòng chờ!</h4>
      </div>
    </div>
  );
}
