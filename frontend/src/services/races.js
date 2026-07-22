import axiosClient from '../api/axiosClient';

/**
 * Public Tournaments & Races API Services with Mock Mode fallback
 */

const isMockMode = () => {
  return false;
};

export async function getTournamentsAPI() {
  try {
    const response = await axiosClient.get('/tournaments');
    return response.data || [];
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get tournaments list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getTournamentRacesAPI(tournamentId) {
  try {
    const response = await axiosClient.get(`/tournaments/${tournamentId}/races`);
    return response.data; // List of RaceResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get race rounds list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getRaceParticipantsAPI(raceId) {
  try {
    const response = await axiosClient.get(`/races/${raceId}/participants`);
    return response.data; // List of ParticipantResponse
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get race participants.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getActiveRacesAPI() {
  try {
    const response = await axiosClient.get('/races/active');
    return response.data || [];
  } catch (error) {
    console.error("Failed to get active races from API:", error);
    throw error;
  }
}
