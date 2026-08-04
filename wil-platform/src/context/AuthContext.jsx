import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { loadProfile } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { user_id, user_type, profile }
  const [loading, setLoading] = useState(true);

  async function hydrate(nextSession) {
    setSession(nextSession);
    if (nextSession?.user) {
      try {
        const p = await loadProfile(nextSession.user.id);
        setProfile(p);
      } catch (err) {
        // profile row may not exist yet (e.g. RLS blocked signup insert) — surface as logged in
        // but profile-less, rather than silently failing.
        console.error('Failed to load profile row for authenticated user:', err.message);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrate(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user || null,
    role: profile?.user_type || null,
    profile: profile?.profile || null,
    loading,
    refreshProfile: () => session?.user && hydrate(session),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
