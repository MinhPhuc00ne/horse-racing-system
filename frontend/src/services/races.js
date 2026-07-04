import axiosClient from '../api/axiosClient';

/**
 * Public Tournaments & Races API Services with Mock Mode fallback
 */

const isMockMode = () => {
  return localStorage.getItem('backend_online') !== 'true';
};

export async function getTournamentsAPI() {
  if (isMockMode()) {
    return [
      { id: 999, tournamentName: "Giải Giả Lập Đua Ngựa (Demo)", location: "Trường đua Mỹ Đình (Demo)", totalPrize: 100000000, startDate: "2026-07-03", endDate: "2026-07-05", tournamentStatus: "OPEN_FOR_REGISTER" },
      { id: 1, tournamentName: "Spring Championship 2026", location: "Grand National Track", totalPrize: 5000000000, startDate: "2026-07-01", endDate: "2026-07-15", tournamentStatus: "UPCOMING" },
      { id: 2, tournamentName: "Royal Ascot Series 2026", location: "Ascot, Berkshire, UK", totalPrize: 8000000000, startDate: "2026-07-18", endDate: "2026-07-25", tournamentStatus: "OPEN_FOR_REGISTER" },
      { id: 3, tournamentName: "Binh Duong International Championship 2026", location: "Dai Nam Racecourse, Binh Duong", totalPrize: 5000000000, startDate: "2026-08-15", endDate: "2026-08-20", tournamentStatus: "ACTIVE" },
      { id: 4, tournamentName: "Winter Classic Cup 2025", location: "Sapa Snow Track, Vietnam", totalPrize: 4000000000, startDate: "2025-12-01", endDate: "2025-12-10", tournamentStatus: "FINISHED" }
    ];
  }

  try {
    const response = await axiosClient.get('/tournaments');
    let data = response.data || [];
    // Inject the demo tournament for testing simulated races
    data.unshift({
      id: 999,
      tournamentName: "Giải Giả Lập Đua Ngựa (Demo)",
      location: "Trường đua Mỹ Đình (Demo)",
      totalPrize: 100000000,
      tournamentStatus: "OPEN_FOR_REGISTER"
    });
    return data;
  } catch (error) {
    return [
      { id: 999, tournamentName: "Giải Giả Lập Đua Ngựa (Demo)", location: "Trường đua Mỹ Đình (Demo)", totalPrize: 100000000, tournamentStatus: "OPEN_FOR_REGISTER" }
    ];
  }
}

export async function getTournamentRacesAPI(tournamentId) {
  if (isMockMode() || tournamentId === 999 || tournamentId === '999') {
    return [
      { id: 999, raceName: "Trận Giả Lập 4 Ngựa (Demo)", raceDate: "2026-07-03", startTime: "16:00:00", surfaceType: "Turf", distance: 1000, status: "RUNNING", raceTrackName: "Trường đua Mỹ Đình (Demo)", trackShape: "OVAL" }
    ];
  }

  try {
    const response = await axiosClient.get(`/tournaments/${tournamentId}/races`);
    return response.data; // List of RaceResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách vòng đua.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceParticipantsAPI(raceId) {
  if (isMockMode() || raceId === 999 || raceId === '999') {
    return [
      { id: 1, participantId: 1, horseId: 101, horseName: "Xích Thố (Red Hare)", jockeyId: 1, jockeyName: "Ryan Moore", gateNumber: 1, status: "READY", horseImageUrl: "" },
      { id: 2, participantId: 2, horseId: 102, horseName: "Đầu Rồng (Dragon Head)", jockeyId: 2, jockeyName: "William Buick", gateNumber: 2, status: "READY", horseImageUrl: "" },
      { id: 3, participantId: 3, horseId: 103, horseName: "Hắc Mã (Black Beauty)", jockeyId: 3, jockeyName: "Lafitt Dettori", gateNumber: 3, status: "READY", horseImageUrl: "" },
      { id: 4, participantId: 4, horseId: 104, horseName: "Bạch Long (White Dragon)", jockeyId: 4, jockeyName: "Zac Purton", gateNumber: 4, status: "READY", horseImageUrl: "" }
    ];
  }

  try {
    const response = await axiosClient.get(`/races/${raceId}/participants`);
    return response.data; // List of ParticipantResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Không thể lấy danh sách người tham gia.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getActiveRacesAPI() {
  try {
    const response = await axiosClient.get('/races/active');
    return response.data || [];
  } catch (error) {
    console.warn("Failed to get active races from API, falling back to local mock data:", error);
    const demoStatus = localStorage.getItem('demo_race_status');
    if (demoStatus === 'RUNNING' || demoStatus === 'READY') {
      return [{ id: 999, raceName: "Trận Giả Lập 4 Ngựa (Demo)", trackShape: "OVAL", distance: 1000, status: demoStatus, raceTrackName: "Trường đua Mỹ Đình (Demo)", surfaceType: "Turf" }];
    }
    return [];
  }
}
