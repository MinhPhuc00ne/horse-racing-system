import axiosClient from '../api/axiosClient';
import { initialJockeyDirectory } from '../mocks/jockeyMockData';

/**
 * Connections API services connecting to Spring Boot Backend with Mock Mode fallback
 */

const isMockMode = () => {
  return false;
};

export async function getConnectionsDirectoryAPI(query = '', role = 'ALL') {
  try {
    const response = await axiosClient.get('/connections/directory', {
      params: { query, role }
    });
    return response.data; // List of ConnectionUserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh bạ liên kết.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getFriendsAPI() {
  try {
    const response = await axiosClient.get('/connections/friends');
    return response.data; // List of ConnectionUserResponse (active friends)
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách bạn bè.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function sendConnectionRequestAPI(recipientId) {
  try {
    const response = await axiosClient.post('/connections/request', null, {
      params: { recipientId }
    });
    window.dispatchEvent(new Event('jockey_invitations_updated'));
    return response.data; // ConnectionUserResponse of the new connection
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể gửi yêu cầu kết bạn.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function respondToConnectionRequestAPI(connectionId, action) {
  try {
    const response = await axiosClient.put(`/connections/request/${connectionId}/respond`, null, {
      params: { action }
    });
    window.dispatchEvent(new Event('jockey_invitations_updated'));
    return response.data; // ConnectionUserResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể phản hồi yêu cầu kết bạn.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteConnectionAPI(connectionId) {
  try {
    const response = await axiosClient.delete(`/connections/${connectionId}`);
    window.dispatchEvent(new Event('jockey_invitations_updated'));
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể hủy kết nối bạn bè.';
    throw new Error(errMsg, { cause: error });
  }
}
