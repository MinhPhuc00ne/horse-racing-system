import axiosClient from '../api/axiosClient';

/**
 * Feedback API Services
 */

export async function createFeedbackAPI({ subject, content }) {
  try {
    const response = await axiosClient.post('/feedbacks', { subject, content });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to submit feedback. Please try again later.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getAdminFeedbacksAPI(params = {}) {
  try {
    const response = await axiosClient.get('/admin/feedbacks', { params });
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load feedbacks list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function resolveFeedbackAPI(id, adminNote) {
  try {
    const response = await axiosClient.put(`/admin/feedbacks/${id}/resolve`, { adminNote });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to process feedback.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectFeedbackAPI(id, adminNote) {
  try {
    const response = await axiosClient.put(`/admin/feedbacks/${id}/reject`, { adminNote });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject feedback.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getMyFeedbacksAPI() {
  try {
    const response = await axiosClient.get('/feedbacks/my');
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get my feedback list.';
    throw new Error(errMsg, { cause: error });
  }
}
