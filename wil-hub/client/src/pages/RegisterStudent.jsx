import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button } from '../components/ui.jsx';

export default function RegisterStudent() {
  const { applyAuthResult } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', programOfStudy: '', graduationYear: '', skills: '', availabilityDate: '',
  });
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await registerStudent(form);
      applyAuthResult(data);
      toast.success('Profile created — welcome to WIL Hub.');
      navigate('/student');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-hub-emerald shadow-glowGreen" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-hub-ink">
            WIL<span className="text-hub-indigo">HUB</span>
          </h1>
          <p className="mt-1.5 text-sm text-hub-muted">Create your student profile.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input required value={form.name} onChange={set('name')} /></Field>
            <Field label="Email" hint="Used to log in"><Input type="email" required value={form.email} onChange={set('email')} /></Field>
            <div className="sm:col-span-2">
              <Field label="Program of study"><Input required value={form.programOfStudy} onChange={set('programOfStudy')} placeholder="e.g. BSc Computer Science" /></Field>
            </div>
            <Field label="Graduation year"><Input type="number" min="2024" max="2035" value={form.graduationYear} onChange={set('graduationYear')} /></Field>
            <Field label="Available from"><Input type="date" value={form.availabilityDate} onChange={set('availabilityDate')} /></Field>
            <div className="sm:col-span-2">
              <Field label="Skills" hint="Comma-separated — e.g. React, SQL, Figma">
                <Input value={form.skills} onChange={set('skills')} placeholder="JavaScript, React, SQL" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Password"><Input type="password" required minLength={6} value={form.password} onChange={set('password')} /></Field>
            </div>
            <Button type="submit" disabled={busy} className="sm:col-span-2">
              {busy ? 'Creating…' : 'Create student profile'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-hub-muted">
            Already have an account? <Link to="/login" className="text-hub-indigo underline underline-offset-2">Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
