import { api } from './client.js';

export const getMyProfile = () => api.get('/companies/me');
export const updateMyProfile = (patch) => api.put('/companies/me', patch);
export const postProgram = (program) => api.post('/companies/me/programs', program);
export const getMyPrograms = () => api.get('/companies/me/programs');
export const getMyApplicants = () => api.get('/companies/me/applicants');
export const getMyPlacements = () => api.get('/companies/me/placements');
