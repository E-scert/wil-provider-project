import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyApplicants } from '../../api/companies.js';
import { updateApplicationStatus } from '../../api/programs.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button } from '../../components/ui.jsx';

const NEXT_ACTIONS = {
  pending: [{ label: 'Shortlist', status: 'shortlisted' }, { label: 'Select', status: 'selected' }, { label: 'Reject', status: 'rejected' }],
  shortlisted: [{ label: 'Select', status: 'selected' }, { label: 'Reject', status: 'rejected' }],
  selected: [],
  rejected: [],
};

export default function CompanyApplicants() {
  const toast = useToast();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    getMyApplicants()
      .then(setApplicants)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  async function handleAction(applicationId, status) {
    setBusyId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success(`Applicant marked ${status}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Company" title="Applicants" subtitle="Everyone who has applied to your programs." />

      {loading ? (
        <Spinner />
      ) : applicants.length === 0 ? (
        <EmptyState title="No applicants yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {applicants.map((a) => (
            <Card key={a.application_id} className="animate-fadeUp">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{a.student_name}</p>
                  <p className="text-xs text-hub-indigo">{a.program_title}</p>
                  <p className="mt-1 text-xs text-hub-muted">{a.program_of_study}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={a.eligibility_status}>{a.eligibility_status}</Badge>
                    {a.cv_url && (
                      <a href={a.cv_url} target="_blank" rel="noreferrer" className="text-xs text-hub-indigo underline underline-offset-2">
                        View CV
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={a.status}>{a.status}</Badge>
                  <div className="flex gap-2">
                    {NEXT_ACTIONS[a.status]?.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.status === 'rejected' ? 'danger' : action.status === 'selected' ? 'emerald' : 'ghost'}
                        onClick={() => handleAction(a.application_id, action.status)}
                        disabled={busyId === a.application_id}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
