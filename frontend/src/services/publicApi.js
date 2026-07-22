import axiosClient from '../api/axiosClient';

/**
 * Public Leaderboard & Stats API services
 */

export async function getPublicLeaderboardAPI() {
  try {
    const response = await axiosClient.get('/public/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public leaderboard:', error);
    throw error;
  }
}

export async function getPublicStatsAPI() {
  try {
    const response = await axiosClient.get('/public/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public stats:', error);
    throw error;
  }
}
