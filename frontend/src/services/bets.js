import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  return false;
};

/**
 * Đặt cược mới cho một cặp đấu (Spectator only)
 * @param {Object} data { raceId, participantId, amount, betType }
 */
export async function placeBetAPI(data) {
  try {
    const response = await axiosClient.post('/bets', data);
    return response.data; // BetResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Bet placement failed. Please try again.';
    throw new Error(errMsg, { cause: error });
  }
}

/**
 * Lấy danh sách vé cược của Spectator đang đăng nhập
 */
export async function getMyBetsAPI() {
  try {
    const response = await axiosClient.get('/bets/my-bets');
    return response.data; // List of BetResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load bet tickets list.';
    throw new Error(errMsg, { cause: error });
  }
}
