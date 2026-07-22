import axiosClient from '../api/axiosClient';

/**
 * Admin API services for managing role upgrades
 */

export async function getUpgradeRequestsAPI() {
  try {
    const response = await axiosClient.get('/admin/upgrade-requests');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load upgrade requests.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveUpgradeRequestAPI(requestId) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to approve upgrade request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectUpgradeRequestAPI(requestId, rejectionReason) {
  try {
    const response = await axiosClient.put(`/admin/upgrade-requests/${requestId}/reject`, {
      rejectionReason: rejectionReason || 'Request rejected by Administrator',
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject upgrade request.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRefereesAPI() {
  try {
    const response = await axiosClient.get('/admin/referees');
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get referees list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTracksAPI() {
  try {
    const response = await axiosClient.get('/admin/tracks');
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get racetracks list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createTrackAPI(data) {
  try {
    const response = await axiosClient.post('/admin/tracks', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to create new racetrack.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createTournamentAPI(data) {
  try {
    const response = await axiosClient.post('/admin/tournaments', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to create tournament.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateTournamentAPI(id, data) {
  try {
    const response = await axiosClient.put(`/admin/tournaments/${id}`, data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update tournament.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateTournamentStatusAPI(id, status) {
  try {
    const response = await axiosClient.put(`/admin/tournaments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update tournament status.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteTournamentAPI(id) {
  try {
    const response = await axiosClient.delete(`/admin/tournaments/${id}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to delete tournament.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createRaceAPI(data) {
  try {
    const response = await axiosClient.post('/admin/races', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to create race round.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceRegistrationsAPI() {
  try {
    const response = await axiosClient.get('/admin/race-registrations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get race registrations.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveRaceRegistrationAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/race-registrations/${id}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to approve race registration.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectRaceRegistrationAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/race-registrations/${id}/reject`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject race registration.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function confirmRaceRegistrationsAPI(tournamentId) {
  try {
    const response = await axiosClient.post(`/admin/tournaments/${tournamentId}/confirm-registration`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to finalize participant list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getWithdrawalsAPI() {
  try {
    const response = await axiosClient.get('/admin/wallets/withdrawals');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get withdrawal requests.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function approveWithdrawalAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/wallets/transactions/${id}/approve`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to approve withdrawal transaction.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function rejectWithdrawalAPI(id) {
  try {
    const response = await axiosClient.put(`/admin/wallets/transactions/${id}/reject`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to reject withdrawal transaction.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateRaceStatusAPI(id, status) {
  try {
    const response = await axiosClient.put(`/admin/races/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update race round status.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getPrizeDistributionsAPI(raceId) {
  try {
    const response = await axiosClient.get(`/admin/races/${raceId}/prize-distributions`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get prize distribution details.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getAdminDashboardStatsAPI() {
  try {
    const response = await axiosClient.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get admin dashboard statistics.';
    throw new Error(errMsg, { cause: error });
  }
}

// User Management APIs
export async function getAllUsersAPI() {
  try {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get users list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createUserAPI(data) {
  try {
    const response = await axiosClient.post('/admin/users', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to create new user.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateUserAPI(id, data) {
  try {
    const response = await axiosClient.put(`/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update user.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteUserAPI(id) {
  try {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to delete user.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function toggleUserStatusAPI(id, enabled) {
  try {
    const response = await axiosClient.put(`/admin/users/${id}/status`, { enabled });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update account status.';
    throw new Error(errMsg, { cause: error });
  }
}

// Blacklist Management APIs
export async function getAdminBlacklistsAPI(status = 'ALL', targetType = 'ALL') {
  try {
    const response = await axiosClient.get('/admin/blacklist', {
      params: { status, targetType }
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load Blacklist.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function addAdminBlacklistAPI(data) {
  try {
    const response = await axiosClient.post('/admin/blacklist', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to add target to Blacklist.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function unbanAdminBlacklistAPI(id, reason) {
  try {
    const response = await axiosClient.put(`/admin/blacklist/${id}/unban`, { reason });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to unban target.';
    throw new Error(errMsg, { cause: error });
  }
}

