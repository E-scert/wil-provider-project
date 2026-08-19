import { api, setToken } from './client.js';

export async function registerStudent(form) {
  const data = await api.post('/auth/register/student', form);
  setToken(data?.token);
  return data;
}
export async function registerCompany(form) {
  const data = await api.post('/auth/register/company', form);
  setToken(data?.token);
  return data;
}
export async function registerInstitution(form) {
  const data = await api.post('/auth/register/institution', form);
  setToken(data?.token);
  return data;
}
export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setToken(data?.token);
  return data;
}
export function logout() {
  setToken(null);
}
export async function fetchMe() {
  return api.get('/auth/me');
}
