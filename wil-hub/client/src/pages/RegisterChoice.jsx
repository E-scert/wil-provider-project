import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui.jsx';

const ROLES = [
  { to: '/register/student', title: 'Student', desc: 'Build a verified profile, browse trusted opportunities, and apply in one place.' },
  { to: '/register/company', title: 'Company', desc: 'Post WIL opportunities and reach institution-verified candidates.' },
  { to: '/register/institution', title: 'Institution', desc: 'Verify student eligibility, approve postings, and track placements.' },
];

export default function RegisterChoice() {
  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-2xl animate-riseIn">
        <div className="mb-10 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-hub-emerald shadow-glowGreen" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-hub-ink">
            WIL<span className="text-hub-indigo">HUB</span>
          </h1>
          <p className="mt-1.5 text-sm text-hub-muted">Who's joining?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ROLES.map((r) => (
            <Card key={r.to} className="flex flex-col justify-between animate-fadeUp">
              <div>
                <h2 className="font-display text-base font-semibold text-hub-ink">{r.title}</h2>
                <p className="mt-2 text-sm text-hub-muted">{r.desc}</p>
              </div>
              <Link to={r.to} className="mt-5">
                <Button className="w-full">Continue</Button>
              </Link>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-hub-muted">
          Already have an account? <Link to="/login" className="text-hub-indigo underline underline-offset-2">Log in</Link>
        </p>
        <p className="mt-3 text-center text-xs text-hub-muted/60">
          Institution registration is open for this demo so the full workflow is testable end to end.
          In production, institution accounts should be provisioned by a super admin instead of self-registered.
        </p>
      </div>
    </div>
  );
}
