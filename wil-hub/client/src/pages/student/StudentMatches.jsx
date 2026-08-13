import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyMatches } from '../../api/students.js';
import { applyToProgram } from '../../api/programs.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button, Chips } from '../../components/ui.jsx';

export default function StudentMatches() {
  const toast = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    getMyMatches()
      .then(setMatches)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function handleApply(programId) {
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
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="Suggested Matches"
        subtitle="Programs your institution has proposed based on your course of study."
      />

      {loading ? (
        <Spinner />
      ) : matches.length === 0 ? (
        <EmptyState title="No matches yet" subtitle="Your institution runs matching periodically — check back soon, or browse programs directly." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {matches.map((m) => (
            <Card key={m.match_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{m.program_title}</p>
                  <p className="text-xs text-hub-indigo">{m.company_name} · via {m.institution_name}</p>
                  <div className="mt-2"><Chips items={m.eligible_courses} /></div>
                </div>
                <Badge tone={m.match_status}>{m.match_status}</Badge>
              </div>
              {m.match_status === 'approved' && (
                <Button className="mt-4" onClick={() => navigate('/programs')} variant="ghost">
                  Browse programs to apply
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
