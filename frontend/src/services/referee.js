import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  return localStorage.getItem('backend_online') !== 'true';
};

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
  if (isMockMode()) {
    return [
      { id: 999, raceId: 999, raceName: "Trận Giả Lập 4 Ngựa (Demo)", trackShape: "OVAL", distance: 1000, status: "LOCKED_LIST" }
    ];
  }
  try {
    const response = await axiosClient.get(`/referee/races?status=${status}`);
    let data = response.data;
    if ((!data || data.length === 0) && (status === 'upcoming' || status === 'running')) {
      return [
        { id: 999, raceId: 999, raceName: "Trận Giả Lập 4 Ngựa (Demo)", trackShape: "OVAL", distance: 1000, status: "LOCKED_LIST" }
      ];
    }
    return data;
  } catch (error) {
    return [
      { id: 999, raceId: 999, raceName: "Trận Giả Lập 4 Ngựa (Demo)", trackShape: "OVAL", distance: 1000, status: "LOCKED_LIST" }
    ];
  }
}

export async function getRacePreCheckAPI(raceId) {
  if (isMockMode() || raceId === 999 || raceId === '999') {
    return {
      raceId: 999,
      raceName: "Trận Giả Lập 4 Ngựa (Demo)",
      trackCondition: "Turf",
      weather: "Sunny",
      participants: [
        { participantId: 1, horseId: 101, horseName: "Xích Thố (Red Hare)", jockeyId: 1, jockeyName: "Ryan Moore", actualWeight: 480.0, horseImageUrl: "" },
        { participantId: 2, horseId: 102, horseName: "Đầu Rồng (Dragon Head)", jockeyId: 2, jockeyName: "William Buick", actualWeight: 492.0, horseImageUrl: "" },
        { participantId: 3, horseId: 103, horseName: "Hắc Mã (Black Beauty)", jockeyId: 3, jockeyName: "Lafitt Dettori", actualWeight: 475.0, horseImageUrl: "" },
        { participantId: 4, horseId: 104, horseName: "Bạch Long (White Dragon)", jockeyId: 4, jockeyName: "Zac Purton", actualWeight: 485.0, horseImageUrl: "" }
      ]
    };
  }
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

export async function getAssignedTournamentsAPI() {
  if (isMockMode()) {
    return [
      { id: 101, tournamentName: 'Giải Ngoại Hạng Nha Trang (Demo)', location: 'Sân đua Nha Trang', tournamentStatus: 'Upcoming', registrationDeadline: '2026-07-10T17:00:00', entryFee: 200000, prizeFirst: 10000000 },
      { id: 102, tournamentName: 'Cúp Chiến Mã Đà Lạt (Demo)', location: 'Sân đua Đà Lạt', tournamentStatus: 'Upcoming', registrationDeadline: '2026-07-15T10:00:00', entryFee: 300000, prizeFirst: 15000000 }
    ];
  }
  const response = await axiosClient.get('/referee/tournaments');
  return response.data;
}

export async function createRefereeChangeRequestAPI(tournamentId, reason) {
  if (isMockMode()) {
    const key = 'referee_change_requests';
    const requests = JSON.parse(localStorage.getItem(key)) || [];
    const newReq = {
      id: Date.now(),
      tournamentId,
      tournamentName: tournamentId === 101 ? 'Giải Ngoại Hạng Nha Trang (Demo)' : 'Cúp Chiến Mã Đà Lạt (Demo)',
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    requests.unshift(newReq);
    localStorage.setItem(key, JSON.stringify(requests));
    return newReq;
  }
  const response = await axiosClient.post('/referee/change-request', { tournamentId, reason });
  return response.data;
}

export async function getRefereeChangeRequestsAPI() {
  if (isMockMode()) {
    const key = 'referee_change_requests';
    return JSON.parse(localStorage.getItem(key)) || [];
  }
  const response = await axiosClient.get('/referee/change-requests');
  return response.data;
}

