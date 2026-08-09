import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCompany } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button } from '../components/ui.jsx';

export default function RegisterCompany() {
  const { applyAuthResult } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', industry: '', contactPerson: '' });
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await registerCompany(form);
      applyAuthResult(data);
      toast.success('Company account created.');
      navigate('/company');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-hub-emerald shadow-glowGreen" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-hub-ink">
            WIL<span className="text-hub-indigo">HUB</span>
          </h1>
          <p className="mt-1.5 text-sm text-hub-muted">Register your company.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Company name"><Input required value={form.name} onChange={set('name')} /></Field>
            <Field label="Email" hint="Used to log in"><Input type="email" required value={form.email} onChange={set('email')} /></Field>
            <Field label="Industry"><Input value={form.industry} onChange={set('industry')} placeholder="e.g. Software" /></Field>
            <Field label="Contact person"><Input value={form.contactPerson} onChange={set('contactPerson')} /></Field>
            <Field label="Password"><Input type="password" required minLength={6} value={form.password} onChange={set('password')} /></Field>
            <Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create company account'}</Button>
          </form>
          <p className="mt-4 text-center text-xs text-hub-muted">
            Already have an account? <Link to="/login" className="text-hub-indigo underline underline-offset-2">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
