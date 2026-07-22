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
    console.error('Error sending AI chat message:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message.');
  }
}

export async function getChatHistoryAPI() {
  try {
    const response = await axiosClient.get('/v1/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    // Nếu chưa đăng nhập (UNAUTHORIZED), ta có thể ném lỗi hoặc trả về mảng rỗng
    if (error.response?.status === 401) {
      throw new Error('Please log in to view chat history.');
    }
    throw new Error(error.response?.data?.error || 'Failed to load chat history.');
  }
}

export async function clearChatHistoryAPI() {
  try {
    const response = await axiosClient.delete('/v1/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw new Error(error.response?.data?.error || 'Failed to clear chat history.');
  }
}
