import axiosClient from '../api/axiosClient';
import { initialJockeyTransactions } from '../mocks/jockeyMockData';
import { initialTransactions } from '../mocks/ownerMockData';

const isMockMode = () => {
  return false;
};

export async function getWalletBalanceAPI() {
  try {
    const response = await axiosClient.get('/wallets/balance');
    return response.data; // Wallet entity: { id, balance, ... }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy số dư ví.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function depositAPI(amount) {
  try {
    const response = await axiosClient.post('/wallets/deposit', { amount });
    return response.data; // Trả về { checkoutUrl, orderCode, etc. }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Yêu cầu nạp tiền thất bại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function withdrawAPI(amount) {
  try {
    const response = await axiosClient.post('/wallets/withdraw', { amount });
    return response.data; // WalletTransaction
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Yêu cầu rút tiền thất bại.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTransactionHistoryAPI() {
  try {
    const response = await axiosClient.get('/wallets/transactions');
    return response.data.map(tx => {
      const isPositive = ['DEPOSIT', 'PRIZE', 'REFUND', 'WINNINGS'].includes(tx.transactionType);
      const mappedAmount = isPositive ? tx.amount : -tx.amount;
      
      let eventLabel = '';
      if (tx.transactionType === 'DEPOSIT') {
        eventLabel = 'Nạp tiền vào ví';
      } else if (tx.transactionType === 'WITHDRAW') {
        eventLabel = 'Rút tiền về ngân hàng';
      } else if (tx.transactionType === 'PRIZE' || tx.transactionType === 'WINNINGS') {
        eventLabel = 'Tiền thưởng thắng cuộc';
      } else if (tx.transactionType === 'ENTRY_FEE') {
        eventLabel = 'Lệ phí tham gia cuộc đua';
      } else if (tx.transactionType === 'REFUND') {
        eventLabel = 'Hoàn trả tiền';
      } else {
        eventLabel = `Giao dịch khác (${tx.transactionType})`;
      }

      if (tx.status === 'PENDING') {
        eventLabel += ' (Chờ thanh toán)';
      } else if (tx.status === 'FAILED') {
        eventLabel += ' (Thất bại)';
      } else if (tx.status === 'CANCELLED') {
        eventLabel += ' (Đã hủy)';
      }

      return {
        id: tx.id.toString(),
        date: tx.createdAt ? tx.createdAt.replace('T', ' ').slice(0, 19) : '',
        type: tx.transactionType, // Keep type for filtering calculations
        event: eventLabel,
        amount: mappedAmount,
        status: tx.status
      };
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy lịch sử giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function checkDepositStatusAPI(orderCode) {
  try {
    const response = await axiosClient.get(`/wallets/deposit/status/${orderCode}`);
    return response.data; // { orderCode, status }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể kiểm tra trạng thái giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function exportTransactionsPdfAPI() {
  try {
    const response = await axiosClient.get('/wallets/transactions/export/pdf', {
      responseType: 'blob', // Important for file download
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Lỗi khi tải PDF giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function exportTransactionsExcelAPI() {
  try {
    const response = await axiosClient.get('/wallets/transactions/export/excel', {
      responseType: 'blob', // Important for file download
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Lỗi khi tải Excel giao dịch.';
    throw new Error(errMsg, { cause: error });
  }
}
