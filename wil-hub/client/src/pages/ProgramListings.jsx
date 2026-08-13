import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOpenPrograms, applyToProgram } from '../api/programs.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, SectionHeading, EmptyState, Spinner, Button, Badge, Chips } from '../components/ui.jsx';

export default function ProgramListings() {
  const { isAuthenticated, role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    listOpenPrograms()
      .then(setPrograms)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function handleApply(programId) {
    if (!isAuthenticated) {
      toast.info('Log in as a student to apply.');
      navigate('/login');
      return;
    }
    if (role !== 'student') {
      toast.info('Only student accounts can apply to programs.');
      return;
    }
    setApplyingId(programId);
    try {
      await applyToProgram(programId);
      toast.success('Application submitted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading
        eyebrow="Opportunities"
        title="Open WIL Programs"
        subtitle="Institution-approved placements currently accepting applications."
      />

      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState title="No open programs right now" subtitle="Check back soon." />
      ) : (
        <div className="stagger grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.program_id} className="animate-fadeUp flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-hub-ink">{p.title}</h3>
                  <Badge tone="approved">{p.slots_open} slot{p.slots_open === 1 ? '' : 's'}</Badge>
                </div>
                <p className="text-xs text-hub-indigo">
                  {p.company_name} {p.verified_status && <span className="text-hub-emerald">· verified</span>}
                </p>
                <p className="mt-2 text-sm text-hub-muted line-clamp-3">{p.description}</p>
                <p className="mt-3 text-xs uppercase tracking-widest text-hub-indigo/80">Open to</p>
                <div className="mt-1">
                  <Chips items={p.eligible_courses} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-hub-muted">
                  <span className="rounded-full border border-hub-line px-2 py-0.5">{p.duration_months} months</span>
                  {p.close_date && (
                    <span className="rounded-full border border-hub-line px-2 py-0.5">
                      closes {new Date(p.close_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button className="mt-4" onClick={() => handleApply(p.program_id)} disabled={applyingId === p.program_id}>
                {applyingId === p.program_id ? 'Applying…' : 'Apply now'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
