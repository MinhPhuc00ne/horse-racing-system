import axiosClient from '../api/axiosClient';

export async function getRefereeDashboardStatsAPI() {
  try {
    const response = await axiosClient.get('/referee/dashboard/stats');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải dữ liệu thống kê.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getAssignedRacesAPI(status = '') {
  try {
    const response = await axiosClient.get(`/referee/races?status=${status}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRacePreCheckAPI(raceId) {
  try {
    const response = await axiosClient.get(`/referee/races/${raceId}/pre-check`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải dữ liệu trước trận.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateRaceConditionsAPI(raceId, conditions) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/conditions`, conditions);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật điều kiện sân chạy.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateJockeyWeightAPI(raceId, jockeyId, actualWeight) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/jockeys/${jockeyId}/weight`, { actualWeight });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật cân nặng nài ngựa.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function disqualifyParticipantAPI(raceId, participantId, reason) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/participants/${participantId}/disqualify`, { reason });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể loại thí sinh thi đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function addBlacklistAPI(data) {
  try {
    const response = await axiosClient.post('/referee/blacklist', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể thêm vào danh sách đen.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function startRaceAPI(raceId) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/start`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể bắt đầu giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getHorsesToInspectAPI() {
  try {
    const response = await axiosClient.get('/referee/inspect/horses');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách kiểm tra ngựa.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateHorseInspectionStatusAPI(id, newStatus, reason = '') {
  try {
    const response = await axiosClient.put(`/referee/inspect/horses/${id}`, { status: newStatus, reason });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể cập nhật trạng thái kiểm tra.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getCompletedRacesAPI() {
  try {
    const response = await axiosClient.get('/referee/races?status=running');
    return response.data.map(race => ({
      ...race,
      id: race.raceId,
      date: race.raceDate,
      time: race.startTime
    }));
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách giải đấu đã hoàn tất.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceResultsAPI(raceId) {
  try {
    const response = await axiosClient.get(`/referee/races/${raceId}/results`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy kết quả giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function confirmRaceResultsAPI(raceId) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/confirm-results`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể xác nhận kết quả giải đấu.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getViolationsAPI() {
  try {
    const response = await axiosClient.get('/referee/violations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tải danh sách vi phạm.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function reportViolationAPI(raceId, data) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/flags`, data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể báo cáo vi phạm.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createChangeRequestAPI(requestData) {
  try {
    const response = await axiosClient.post('/referee/change-request', requestData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể tạo yêu cầu thay đổi.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getChangeRequestsAPI() {
  try {
    const response = await axiosClient.get('/referee/change-requests');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách yêu cầu thay đổi.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function saveSimulatedRaceAPI(race, results) {
  return { success: true };
}
