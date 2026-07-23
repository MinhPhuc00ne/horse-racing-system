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
    const errMsg = error.response?.data?.message || 'Failed to get wallet balance.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function depositAPI(amount) {
  try {
    const response = await axiosClient.post('/wallets/deposit', { amount });
    return response.data; // { checkoutUrl, orderCode, etc. }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Deposit request failed.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function withdrawAPI(amount, bankName, bankBin, bankAccountNumber, bankAccountHolderName) {
  try {
    const response = await axiosClient.post('/wallets/withdraw', { 
      amount,
      bankName,
      bankBin,
      bankAccountNumber,
      bankAccountHolderName
    });
    return response.data; // WalletTransaction
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Withdrawal request failed.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateBankAccountAPI(bankName, bankBin, bankAccountNumber, bankAccountHolderName) {
  try {
    const response = await axiosClient.put('/wallets/bank-account', {
      bankName,
      bankBin,
      bankAccountNumber,
      bankAccountHolderName
    });
    return response.data; // UserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update bank account.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function cancelWithdrawalAPI(transactionId) {
  try {
    const response = await axiosClient.put(`/wallets/transactions/${transactionId}/cancel`);
    return response.data; // WalletTransaction
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to cancel withdrawal request.';
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
        eventLabel = 'Wallet Deposit';
      } else if (tx.transactionType === 'WITHDRAW') {
        eventLabel = 'Bank Withdrawal';
      } else if (tx.transactionType === 'PRIZE' || tx.transactionType === 'WINNINGS') {
        eventLabel = 'Race Winnings / Prize';
      } else if (tx.transactionType === 'ENTRY_FEE') {
        eventLabel = 'Race Entry Fee';
      } else if (tx.transactionType === 'REFUND') {
        eventLabel = 'Refund';
      } else {
        eventLabel = `Other Transaction (${tx.transactionType})`;
      }

      if (tx.status === 'PENDING') {
        eventLabel += ' (Pending)';
      } else if (tx.status === 'FAILED') {
        eventLabel += ' (Failed)';
      } else if (tx.status === 'CANCELLED') {
        eventLabel += ' (Cancelled)';
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
    const errMsg = error.response?.data?.message || 'Failed to get transaction history.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function checkDepositStatusAPI(orderCode) {
  try {
    const response = await axiosClient.get(`/wallets/deposit/status/${orderCode}`);
    return response.data; // { orderCode, status }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to check transaction status.';
    throw new Error(errMsg, { cause: error });
  }
}
