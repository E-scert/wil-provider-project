import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listPrograms, approveProgram, closeProgram } from '../../api/institutions.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button, SkillChips } from '../../components/ui.jsx';

export default function InstitutionPrograms() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('pending');

  function load(status) {
    setLoading(true);
    listPrograms(status === 'all' ? undefined : status)
      .then(setPrograms)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(() => load(filter), [filter]); // eslint-disable-line

  async function handleApprove(id) {
    setBusyId(id);
    try {
      await approveProgram(id);
      toast.success('Program approved — now visible to students.');
      load(filter);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleClose(id) {
    if (!confirm('Close this posting? It will be removed from public listings.')) return;
    setBusyId(id);
    try {
      await closeProgram(id);
      toast.success('Program closed.');
      load(filter);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Institution" title="Postings" subtitle="Review company postings for compliance before they go live." />

      <div className="mb-6 flex gap-2 animate-fadeUp">
        {['pending', 'approved', 'closed', 'all'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState title="Nothing here" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {programs.map((p) => (
            <Card key={p.program_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{p.title}</p>
                  <p className="text-xs text-hub-indigo">
                    {p.company_name} {p.verified_status && <span className="text-hub-emerald">· verified company</span>}
                  </p>
                  <p className="mt-1 text-xs text-hub-muted">{p.duration_months} months · {p.slots_open} slots</p>
                  <div className="mt-2"><SkillChips skills={p.required_skills} /></div>
                </div>
                <Badge tone={p.posting_status}>{p.posting_status}</Badge>
              </div>
              {p.posting_status !== 'closed' && (
                <div className="mt-4 flex gap-2">
                  {p.posting_status === 'pending' && (
                    <Button variant="emerald" onClick={() => handleApprove(p.program_id)} disabled={busyId === p.program_id}>
                      Approve
                    </Button>
                  )}
                  <Button variant="danger" onClick={() => handleClose(p.program_id)} disabled={busyId === p.program_id}>
                    Close posting
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
