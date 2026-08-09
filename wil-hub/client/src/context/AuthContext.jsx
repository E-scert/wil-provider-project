import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../api/client.js';
import { fetchMe, logout as apiLogout } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { user_id, email, role, linked_id }
  const [entity, setEntity] = useState(null); // students/companies/institutions row, or null for super_admin
  const [loading, setLoading] = useState(true);

  async function hydrate() {
    const token = getToken();
    if (!token) {
      setUser(null);
      setEntity(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMe();
      setUser(data.user);
      setEntity(data.entity);
    } catch {
      setToken(null);
      setUser(null);
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { hydrate(); }, []); // eslint-disable-line

  function applyAuthResult(data) {
    setUser(data.user);
    setEntity(data.entity);
  }

  function logout() {
    apiLogout();
    setUser(null);
    setEntity(null);
  }

  const value = {
    user,
    entity,
    role: user?.role || null,
    loading,
    isAuthenticated: !!user,
    applyAuthResult,
    refresh: hydrate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
