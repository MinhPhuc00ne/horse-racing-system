import axiosClient from '../api/axiosClient';

const isMockMode = () => {
  return false;
};

export async function getRefereeDashboardStatsAPI() {
  try {
    const response = await axiosClient.get('/referee/dashboard/stats');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load statistics.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getAssignedRacesAPI(status = '') {
  try {
    const response = await axiosClient.get(`/referee/races?status=${status}`);
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get assigned races.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRacePreCheckAPI(raceId) {
  try {
    const response = await axiosClient.get(`/referee/races/${raceId}/pre-check`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load pre-race check data.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateRaceConditionsAPI(raceId, conditions) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/conditions`, conditions);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update track conditions.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateJockeyWeightAPI(raceId, jockeyId, actualWeight) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/jockeys/${jockeyId}/weight`, { actualWeight });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update jockey weight.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function disqualifyParticipantAPI(raceId, participantId, reason) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/participants/${participantId}/disqualify`, { reason });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to disqualify participant.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function addBlacklistAPI(data) {
  try {
    const response = await axiosClient.post('/referee/blacklist', data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to add to blacklist.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function startRaceAPI(raceId) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/start`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to start race.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getHorsesToInspectAPI() {
  try {
    const response = await axiosClient.get('/referee/inspect/horses');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load horses inspection list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateHorseInspectionStatusAPI(id, newStatus, reason = '') {
  try {
    const response = await axiosClient.put(`/referee/inspect/horses/${id}`, { status: newStatus, reason });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update inspection status.';
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
    const errMsg = error.response?.data?.message || 'Failed to load completed races list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceResultsAPI(raceId) {
  try {
    const response = await axiosClient.get(`/referee/races/${raceId}/results`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get race results.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function confirmRaceResultsAPI(raceId) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/confirm-results`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to confirm race results.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getViolationsAPI() {
  try {
    const response = await axiosClient.get('/referee/violations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to load violations list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function reportViolationAPI(raceId, data) {
  try {
    const response = await axiosClient.post(`/referee/races/${raceId}/flags`, data);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to report violation.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function saveSimulatedRaceAPI(race, results) {
  return { success: true };
}

export async function getAssignedTournamentsAPI() {
  const response = await axiosClient.get('/referee/tournaments');
  return response.data;
}

export async function cancelRefereeAssignmentAPI(tournamentId) {
  try {
    const response = await axiosClient.put(`/referee/tournaments/${tournamentId}/cancel-assignment`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to cancel referee assignment.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updatePovAPI(raceId, horseId) {
  try {
    const response = await axiosClient.put(`/referee/races/${raceId}/pov`, { horseId });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update POV.';
    throw new Error(errMsg, { cause: error });
  }
}

