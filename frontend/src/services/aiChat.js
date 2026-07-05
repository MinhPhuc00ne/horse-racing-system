import axiosClient from '../api/axiosClient';

/**
 * AI Chat Service
 */

const isMockMode = () => {
  return false;
};

export async function sendChatMessageAPI(message, image = null) {
  try {
    const response = await axiosClient.post('/v1/chat', { message, image });
    // Dựa vào AiChatController, có thể trả về plain string hoặc object
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn AI:', error);
    throw new Error(error.response?.data?.error || 'Không thể gửi tin nhắn.');
  }
}

export async function getChatHistoryAPI() {
  try {
    const response = await axiosClient.get('/v1/chat/history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    // Nếu chưa đăng nhập (UNAUTHORIZED), ta có thể ném lỗi hoặc trả về mảng rỗng
    if (error.response?.status === 401) {
      throw new Error('Vui lòng đăng nhập để xem lịch sử trò chuyện.');
    }
    throw new Error(error.response?.data?.error || 'Không thể tải lịch sử chat.');
  }
}

export async function clearChatHistoryAPI() {
  try {
    const response = await axiosClient.delete('/v1/chat/history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử chat:', error);
    throw new Error(error.response?.data?.error || 'Không thể xóa lịch sử chat.');
  }
}
