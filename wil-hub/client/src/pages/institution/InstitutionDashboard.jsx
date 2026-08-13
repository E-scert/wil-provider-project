import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { listStudents, listPrograms, listMyMatches } from '../../api/institutions.js';
import { Card, SectionHeading, Spinner, StatCard } from '../../components/ui.jsx';

export default function InstitutionDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([listStudents(), listPrograms('pending'), listMyMatches()])
      .then(([students, pendingPrograms, matches]) => {
        setStats({
          totalStudents: students.length,
          provisional: students.filter((s) => s.eligibility_status === 'provisional').length,
          verified: students.filter((s) => s.eligibility_status === 'verified').length,
          pendingPrograms: pendingPrograms.length,
          proposedMatches: matches.filter((m) => m.match_status === 'proposed').length,
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading eyebrow="Institution" title="Overview" subtitle="Pending verifications, postings, and matches at a glance." />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="stagger grid gap-4 sm:grid-cols-3">
            <StatCard label="Total students" value={stats.totalStudents} />
            <StatCard label="Awaiting verification" value={stats.provisional} tone="amber" />
            <StatCard label="Verified" value={stats.verified} tone="emerald" />
            <StatCard label="Pending postings" value={stats.pendingPrograms} tone="amber" />
            <StatCard label="Proposed matches" value={stats.proposedMatches} tone="indigo" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/institution/students">
              <Card className="animate-fadeUp transition-colors hover:border-hub-indigo/60">
                <p className="font-display text-sm font-semibold text-hub-ink">Verify students</p>
                <p className="mt-1 text-xs text-hub-muted">Set eligibility status for the student pool.</p>
              </Card>
            </Link>
            <Link to="/institution/programs">
              <Card className="animate-fadeUp transition-colors hover:border-hub-indigo/60">
                <p className="font-display text-sm font-semibold text-hub-ink">Review postings</p>
                <p className="mt-1 text-xs text-hub-muted">Approve compliant company postings.</p>
              </Card>
            </Link>
            <Link to="/institution/matches">
              <Card className="animate-fadeUp transition-colors hover:border-hub-indigo/60">
                <p className="font-display text-sm font-semibold text-hub-ink">Run & validate matches</p>
                <p className="mt-1 text-xs text-hub-muted">Auto-match by course of study, then approve or reject.</p>
              </Card>
            </Link>
            <Link to="/institution/reports">
              <Card className="animate-fadeUp transition-colors hover:border-hub-indigo/60">
                <p className="font-display text-sm font-semibold text-hub-ink">Generate reports</p>
                <p className="mt-1 text-xs text-hub-muted">Graduation impact and compliance notes.</p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
