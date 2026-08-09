import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../../api/students.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, SectionHeading, Spinner, EmptyState, Badge } from '../../components/ui.jsx';

export default function StudentApplications() {
  const toast = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(setApps)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Student" title="My Applications" subtitle="Programs you've applied to and their current status." />

      {loading ? (
        <Spinner />
      ) : apps.length === 0 ? (
        <EmptyState title="No applications yet" subtitle="Browse open programs to apply." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {apps.map((a) => (
            <Card key={a.application_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-hub-ink">{a.title}</p>
                <p className="text-xs text-hub-indigo">{a.company_name}</p>
                <p className="mt-1 text-xs text-hub-muted">applied {new Date(a.date_applied).toLocaleDateString()}</p>
              </div>
              <Badge tone={a.status}>{a.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
