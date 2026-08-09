import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listCompanies, verifyCompany } from '../../api/admin.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button } from '../../components/ui.jsx';

export default function AdminCompanies() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    listCompanies()
      .then(setCompanies)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  async function toggleVerify(company) {
    setBusyId(company.company_id);
    try {
      await verifyCompany(company.company_id, !company.verified_status);
      toast.success(`${company.name} ${!company.verified_status ? 'verified' : 'unverified'}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Super Admin" title="Companies" subtitle="Verify companies to display a trust badge to students." />

      {loading ? (
        <Spinner />
      ) : companies.length === 0 ? (
        <EmptyState title="No companies yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {companies.map((c) => (
            <Card key={c.company_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-hub-ink">{c.name}</p>
                <p className="text-xs text-hub-muted">{c.industry} · {c.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.verified_status ? 'verified' : 'pending'}>{c.verified_status ? 'verified' : 'unverified'}</Badge>
                <Button variant="ghost" onClick={() => toggleVerify(c)} disabled={busyId === c.company_id}>
                  {c.verified_status ? 'Unverify' : 'Verify'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
