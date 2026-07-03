import axiosClient from '../api/axiosClient';

export async function getJockeyProfileAPI() {
  try {
    const response = await axiosClient.get('/jockey/profile');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải hồ sơ kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateJockeyProfileAPI(profileData) {
  try {
    const response = await axiosClient.put('/jockey/profile', {
      fullName: profileData.fullName,
      phone: profileData.phoneNumber || profileData.phone,
      avatarUrl: profileData.avatar || profileData.avatarUrl,
      height: profileData.height,
      weight: profileData.weight,
      experienceYear: profileData.experienceYears || profileData.experienceYear,
      licenseNumber: profileData.licenseNumber,
      bankAccount: profileData.bankAccount,
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật hồ sơ kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyInvitationsAPI() {
  try {
    const response = await axiosClient.get('/jockey/invitations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách lời mời đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function respondToJockeyInvitationAPI(invitationId, action) {
  try {
    const apiAction = action === 'ACCEPTED' ? 'ACCEPT' : action === 'REJECTED' ? 'REJECT' : action;
    const response = await axiosClient.put(`/jockey/invitations/${invitationId}/respond`, null, {
      params: { action: apiAction }
    });
    window.dispatchEvent(new Event('jockey_invitations_updated'));
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể gửi phản hồi lời mời đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyScheduleAPI() {
  try {
    const response = await axiosClient.get('/jockey/schedule');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải lịch thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyHistoryAPI() {
  try {
    const response = await axiosClient.get('/jockey/history');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải lịch sử thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getJockeyLeaderboardAPI() {
  try {
    const response = await axiosClient.get('/jockey/leaderboard');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải bảng xếp hạng kỵ sĩ.';
    throw new Error(errMsg, { cause: error });
  }
}
