import axiosClient from '../api/axiosClient';

/**
 * AI Chat Service
 */

const isMockMode = () => {
  return false;
};

export async function sendChatMessageAPI(message, image = null) {
  try {
    // Based on AiChatController, can return plain string or object
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
    // If not logged in (UNAUTHORIZED), throw error or return empty array
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
