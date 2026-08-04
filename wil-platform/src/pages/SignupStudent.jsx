import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpStudent } from '../api/auth.js';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Select, Button } from '../components/ui.jsx';

export default function SignupStudent() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', name: '', surname: '', sex: '', age: '', courseField: '', cellNo: '', personalEmail: '',
  });
  const [busy, setBusy] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signUpStudent(form);
      toast.success('Account created. Check your email if confirmation is required, then log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-lg animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-tut-red shadow-redGlow" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-white">
            WIL CONNECT<span className="text-tut-red">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/45">Create your student profile.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input required value={form.name} onChange={set('name')} /></Field>
            <Field label="Surname"><Input required value={form.surname} onChange={set('surname')} /></Field>
            <Field label="Sex">
              <Select value={form.sex} onChange={set('sex')}>
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
            <Field label="Age"><Input type="number" min="16" max="100" value={form.age} onChange={set('age')} /></Field>
            <Field label="Course / field of study" hint="e.g. Information Technology">
              <Input required value={form.courseField} onChange={set('courseField')} />
            </Field>
            <Field label="Cell number"><Input value={form.cellNo} onChange={set('cellNo')} /></Field>
            <Field label="Student email" hint="Used to log in">
              <Input type="email" required value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Personal email (optional)">
              <Input type="email" value={form.personalEmail} onChange={set('personalEmail')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Password"><Input type="password" required minLength={6} value={form.password} onChange={set('password')} /></Field>
            </div>
            <Button type="submit" disabled={busy} className="sm:col-span-2">
              {busy ? 'Creating profile…' : 'Create student profile'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-white/35">
            Already have an account? <Link to="/login" className="text-tut-red underline underline-offset-2">Log in</Link>.
          </p>
        </Card>
      </div>
    </div>
  );
}
