import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button } from '../components/ui.jsx';

const ROLE_HOME = { student: '/student', company_admin: '/company', institution_admin: '/institution', super_admin: '/admin' };

export default function Login() {
  const { isAuthenticated, role, applyAuthResult } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(ROLE_HOME[role] || '/', { replace: true });
  }, [isAuthenticated, role, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(email, password);
      applyAuthResult(data);
      toast.success('Welcome back.');
      navigate(ROLE_HOME[data.user.role] || '/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-hub-emerald shadow-glowGreen" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-hub-ink">
            WIL<span className="text-hub-indigo">HUB</span>
          </h1>
          <p className="mt-1.5 text-sm text-hub-muted">Log in to your account.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <Button type="submit" disabled={busy}>{busy ? '…' : 'Log in'}</Button>
          </form>
          <p className="mt-4 text-center text-xs text-hub-muted">
            New here? <Link to="/register" className="text-hub-indigo underline underline-offset-2">Create an account</Link>
          </p>
        </Card>

        <p className="mt-6 text-center">
          <Link to="/programs" className="text-xs text-hub-muted/70 underline underline-offset-2 hover:text-hub-muted">
            ← browse open programs without logging in
          </Link>
        </p>
      </div>
    </div>
  );
}
