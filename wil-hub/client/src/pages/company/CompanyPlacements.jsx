import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyPlacements } from '../../api/companies.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge } from '../../components/ui.jsx';

export default function CompanyPlacements() {
  const toast = useToast();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPlacements()
      .then(setPlacements)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Company" title="Placements" subtitle="Students you've selected, tracked through to completion." />

      {loading ? (
        <Spinner />
      ) : placements.length === 0 ? (
        <EmptyState title="No placements yet" subtitle="Select an applicant to create one." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {placements.map((p) => (
            <Card key={p.placement_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-hub-ink">{p.student_name}</p>
                <p className="text-xs text-hub-indigo">{p.title}</p>
              </div>
              <Badge tone={p.completion_status}>{p.completion_status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
