import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listApplicantsForCompany, updateApplicationStatus } from '../../api/companies.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button } from '../../components/ui.jsx';

const TONE_BY_STATUS = { Pending: 'pending', Reviewed: 'reviewed', Accepted: 'accepted', Rejected: 'rejected' };
const NEXT_ACTIONS = {
  Pending: [{ label: 'Mark reviewed', status: 'Reviewed' }, { label: 'Accept', status: 'Accepted' }, { label: 'Reject', status: 'Rejected' }],
  Reviewed: [{ label: 'Accept', status: 'Accepted' }, { label: 'Reject', status: 'Rejected' }],
  Accepted: [],
  Rejected: [],
};

export default function CompanyApplicants() {
  const { profile } = useAuth();
  const toast = useToast();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    if (!profile) return;
    setLoading(true);
    listApplicantsForCompany(profile.comp_id)
      .then(setApplicants)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [profile?.comp_id]); // eslint-disable-line

  async function handleAction(appId, status) {
    setBusyId(appId);
    try {
      await updateApplicationStatus(appId, status);
      toast.success(`Application marked ${status.toLowerCase()}.`);
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
            <Card key={a.app_id} className="animate-fadeUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm font-semibold text-white">{a.student?.name} {a.student?.surname}</p>
                <p className="text-xs text-tut-gold">{a.wil_program?.program_name}</p>
                <p className="mt-1 text-xs text-white/35">applied {new Date(a.date_applied).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={TONE_BY_STATUS[a.status] || 'default'}>{a.status}</Badge>
                {NEXT_ACTIONS[a.status]?.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.status === 'Rejected' ? 'danger' : 'ghost'}
                    onClick={() => handleAction(a.app_id, action.status)}
                    disabled={busyId === a.app_id}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
