import { api } from './client.js';

export const listOpenPrograms = () => api.get('/programs');
export const getProgram = (id) => api.get(`/programs/${id}`);

export const applyToProgram = (programId) => api.post('/applications', { programId });
export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/applications/${applicationId}/status`, { status });
