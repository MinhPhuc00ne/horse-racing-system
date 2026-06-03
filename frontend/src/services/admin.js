import axiosClient from '../api/axiosClient';

/**
 * Admin API services for managing role upgrades
 */

export async function getUpgradeRequestsAPI() {
  try {
    const response = await axiosClient.get('/admin/upgrade-requests');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to fetch upgrade requests.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveUpgradeRequestAPI(requestId) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to approve request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectUpgradeRequestAPI(requestId, rejectionReason) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/reject`, {
      rejectionReason: rejectionReason || 'Yêu cầu bị từ chối bởi Quản trị viên',
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject request.';
    throw new Error(errMsg, { cause: error });
  }
}
