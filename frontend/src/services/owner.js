import axiosClient from '../api/axiosClient';

export async function getOwnerProfileAPI() {
  try {
    const response = await axiosClient.get('/owner/profile');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get horse owner profile.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateOwnerProfileAPI(profileData) {
  try {
    const response = await axiosClient.put('/owner/profile', profileData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update profile info.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getMyHorsesAPI() {
  try {
    const response = await axiosClient.get('/owner/horses');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get horses list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function createHorseAPI(horseData) {
  try {
    const response = await axiosClient.post('/owner/horses', horseData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to add new horse.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function submitRaceRegistrationAPI(registrationData) {
  try {
    const response = await axiosClient.post('/owner/race-registrations', {
      tournamentId: registrationData.tournamentId || registrationData.raceId,
      horseId: registrationData.horseId,
      jockeyId: registrationData.jockeyId,
      ownerSharePercent: registrationData.ownerSharePercent,
      jockeySharePercent: registrationData.jockeySharePercent
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to submit race registration.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function getMyRaceRegistrationsAPI() {
  try {
    const response = await axiosClient.get('/owner/race-registrations');
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to get race registrations list.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function cancelRaceRegistrationAPI(id) {
  try {
    const response = await axiosClient.put(`/owner/race-registrations/${id}/cancel`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to cancel race registration.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateRaceRegistrationAPI(id, registrationData) {
  try {
    const response = await axiosClient.put(`/owner/race-registrations/${id}`, registrationData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update race registration.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function uploadFilesAPI(files) {
  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const response = await axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to upload files.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function updateHorseAPI(id, horseData) {
  try {
    const response = await axiosClient.put(`/owner/horses/${id}`, horseData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to update horse info.';
    throw new Error(errMsg, { cause: error });
  }
}

export async function deleteHorseAPI(id) {
  try {
    await axiosClient.delete(`/owner/horses/${id}`);
    return { success: true };
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to delete horse.';
    throw new Error(errMsg, { cause: error });
  }
}
