import { api } from './client.js';

export const getMyProfile = () => api.get('/institutions/me');
export const updateMyProfile = (patch) => api.put('/institutions/me', patch);

export const listStudents = () => api.get('/institutions/students');
export const setStudentEligibility = (studentId, eligibilityStatus) =>
  api.patch(`/institutions/students/${studentId}/eligibility`, { eligibilityStatus });

export const listPrograms = (status) => api.get(`/institutions/programs${status ? `?status=${status}` : ''}`);
export const approveProgram = (id) => api.patch(`/institutions/programs/${id}/approve`);
export const closeProgram = (id) => api.patch(`/institutions/programs/${id}/close`);

export const generateMatches = () => api.post('/institutions/me/generate-matches');
export const listMyMatches = () => api.get('/institutions/me/matches');
export const setMatchStatus = (matchId, matchStatus) => api.patch(`/institutions/matches/${matchId}/status`, { matchStatus });

export const listMyPlacements = () => api.get('/institutions/me/placements');
export const updatePlacement = (id, patch) => api.patch(`/institutions/placements/${id}`, patch);

export const listMyReports = () => api.get('/institutions/me/reports');
export const createReport = (report) => api.post('/institutions/me/reports', report);
