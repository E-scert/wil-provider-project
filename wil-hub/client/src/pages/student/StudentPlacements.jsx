import React, { useEffect, useState } from 'react';
import { getMyPlacements } from '../../api/students.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, SectionHeading, Spinner, EmptyState, Badge } from '../../components/ui.jsx';

export default function StudentPlacements() {
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
      <SectionHeading eyebrow="Student" title="My Placement" subtitle="Once a company selects you, your placement is tracked here." />

      {loading ? (
        <Spinner />
      ) : placements.length === 0 ? (
        <EmptyState title="No placement yet" subtitle="This appears once a company selects you for a program." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {placements.map((p) => (
            <Card key={p.placement_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{p.title}</p>
                  <p className="text-xs text-hub-indigo">{p.company_name}</p>
                </div>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-hub-muted">
                {p.start_date && <span className="rounded-full border border-hub-line px-2 py-0.5">starts {new Date(p.start_date).toLocaleDateString()}</span>}
                {p.end_date && <span className="rounded-full border border-hub-line px-2 py-0.5">ends {new Date(p.end_date).toLocaleDateString()}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
