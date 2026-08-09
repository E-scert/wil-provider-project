import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { generateMatches, listMyMatches, setMatchStatus } from '../../api/institutions.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button, SkillChips } from '../../components/ui.jsx';

export default function InstitutionMatches() {
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('proposed');

  function load() {
    setLoading(true);
    listMyMatches()
      .then(setMatches)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await generateMatches();
      toast.success(res.createdCount > 0 ? `${res.createdCount} new match(es) proposed.` : 'No new matches found — try approving more postings or verifying more students.');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleStatus(matchId, status) {
    setBusyId(matchId);
    try {
      await setMatchStatus(matchId, status);
      toast.success(`Match ${status}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const visible = filter === 'all' ? matches : matches.filter((m) => m.match_status === filter);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Institution"
        title="Matches"
        subtitle="Auto-matched by skill overlap between verified students and approved postings."
        action={<Button onClick={handleGenerate} disabled={generating}>{generating ? 'Matching…' : 'Run matching'}</Button>}
      />

      <div className="mb-6 flex gap-2 animate-fadeUp">
        {['proposed', 'approved', 'rejected', 'all'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState title="No matches here" subtitle="Try running matching, or check another filter." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {visible.map((m) => (
            <Card key={m.match_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{m.student_name} → {m.program_title}</p>
                  <p className="text-xs text-hub-indigo">{m.company_name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={m.eligibility_status}>{m.eligibility_status}</Badge>
                  </div>
                  <div className="mt-2"><SkillChips skills={m.skills} /></div>
                </div>
                <Badge tone={m.match_status}>{m.match_status}</Badge>
              </div>
              {m.match_status === 'proposed' && (
                <div className="mt-4 flex gap-2">
                  <Button variant="emerald" onClick={() => handleStatus(m.match_id, 'approved')} disabled={busyId === m.match_id}>Approve</Button>
                  <Button variant="danger" onClick={() => handleStatus(m.match_id, 'rejected')} disabled={busyId === m.match_id}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
