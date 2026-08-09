import { api } from './client.js';

export const getOverview = () => api.get('/admin/overview');
export const listInstitutions = () => api.get('/admin/institutions');
export const listCompanies = () => api.get('/admin/companies');
export const verifyCompany = (id, verified) => api.patch(`/admin/companies/${id}/verify`, { verified });
export const listUsers = () => api.get('/admin/users');
