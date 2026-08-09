import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { getOverview } from '../../api/admin.js';
import { SectionHeading, Spinner, StatCard } from '../../components/ui.jsx';

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then(setStats)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading eyebrow="Super Admin" title="Platform Overview" subtitle="System-wide numbers across every institution and company." />

      {loading ? (
        <Spinner />
      ) : (
        <div className="stagger grid gap-4 sm:grid-cols-3">
          <StatCard label="Total users" value={stats.users} />
          <StatCard label="Students" value={stats.students} />
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Institutions" value={stats.institutions} />
          <StatCard label="Approved programs" value={stats.approvedPrograms} tone="emerald" />
          <StatCard label="Pending programs" value={stats.pendingPrograms} tone="amber" />
          <StatCard label="Applications" value={stats.applications} />
          <StatCard label="Ongoing placements" value={stats.ongoingPlacements} tone="indigo" />
          <StatCard label="Completed placements" value={stats.completedPlacements} tone="emerald" />
        </div>
      )}
    </div>
  );
}
