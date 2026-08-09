import { api } from './client.js';

export const getMyProfile = () => api.get('/students/me');
export const updateMyProfile = (patch) => api.put('/students/me', patch);
export const uploadCv = (file) => {
  const fd = new FormData();
  fd.append('cv', file);
  return api.post('/students/me/cv', fd);
};
export const getMyApplications = () => api.get('/students/me/applications');
export const getMyMatches = () => api.get('/students/me/matches');
export const getMyPlacements = () => api.get('/students/me/placements');
