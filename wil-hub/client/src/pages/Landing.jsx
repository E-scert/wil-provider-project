import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Button } from '../components/ui.jsx';

const ROLE_HOME = { student: '/student', company_admin: '/company', institution_admin: '/institution', super_admin: '/admin' };

const PERSPECTIVES = [
  {
    title: 'Students',
    pain: 'Scattered applications across LinkedIn, Indeed, PNet — missed recruitment cycles, risk of scams, graduation delays.',
    benefit: 'One trusted place to apply, with eligibility verified by your institution before you ever see an opportunity.',
  },
  {
    title: 'Companies',
    pain: 'Admin overload verifying student eligibility, sifting through mismatched applicants, and compliance risk on every posting.',
    benefit: 'Faster access to pre-vetted candidates from the right course of study, compliance already handled.',
  },
  {
    title: 'Institutions',
    pain: 'Students scattered across the internet, delayed placements, graduation bottlenecks, compliance risk.',
    benefit: 'A single verification flag and compliance check — no database migration, no new admin burden.',
  },
];

export default function Landing() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(ROLE_HOME[role] || '/', { replace: true });
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <div className="animate-riseIn text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hub-line bg-hub-panel px-4 py-1.5 text-xs text-hub-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-hub-emerald" />
          Verified WIL placements, one trusted hub
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-hub-ink sm:text-5xl">
          Where <span className="text-hub-indigo">verified students</span> and{' '}
          <span className="text-hub-emerald">legitimate companies</span> connect for WIL.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-hub-muted">
          There is no centralized, trusted platform where only verified WIL students and companies offering WIL
          opportunities can connect under one roof — until now. Institutions validate, companies post, students
          apply. All in one place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => navigate('/register')}>Get started</Button>
          <Button variant="ghost" onClick={() => navigate('/programs')}>Browse open programs</Button>
        </div>
      </div>

      <div className="stagger mt-16 grid gap-5 sm:grid-cols-3">
        {PERSPECTIVES.map((p) => (
          <Card key={p.title} className="animate-fadeUp">
            <h3 className="font-display text-base font-semibold text-hub-ink">{p.title}</h3>
            <p className="mt-3 text-xs uppercase tracking-widest text-hub-rose/80">Pain today</p>
            <p className="mt-1 text-sm text-hub-muted">{p.pain}</p>
            <p className="mt-4 text-xs uppercase tracking-widest text-hub-emerald/80">With WIL Hub</p>
            <p className="mt-1 text-sm text-hub-ink/80">{p.benefit}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-10 animate-riseIn text-center">
        <p className="font-display text-lg text-hub-ink">
          Institutions don't need to merge databases. They just log in and verify.
        </p>
        <p className="mt-2 text-sm text-hub-muted">
          This platform extends what institutions already do — it doesn't replace it. Companies get a clean
          posting hub. Students get a trusted portal with verified opportunities.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register/student"><Button>Join as a student</Button></Link>
          <Link to="/register/company"><Button variant="ghost">Post opportunities</Button></Link>
          <Link to="/register/institution"><Button variant="ghost">Register your institution</Button></Link>
        </div>
      </Card>
    </div>
  );
}
