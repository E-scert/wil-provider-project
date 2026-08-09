import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listInstitutions } from '../../api/admin.js';
import { Card, SectionHeading, Spinner, EmptyState } from '../../components/ui.jsx';

export default function AdminInstitutions() {
  const toast = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInstitutions()
      .then(setInstitutions)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Super Admin" title="Institutions" subtitle="Every institution registered on the platform." />

      {loading ? (
        <Spinner />
      ) : institutions.length === 0 ? (
        <EmptyState title="No institutions yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {institutions.map((i) => (
            <Card key={i.institution_id} className="animate-fadeUp">
              <p className="font-display text-sm font-semibold text-hub-ink">{i.name}</p>
              <p className="text-xs text-hub-muted">{i.contact_person} · {i.email}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
