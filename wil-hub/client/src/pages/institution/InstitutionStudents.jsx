import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listStudents, setStudentEligibility } from '../../api/institutions.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button, SkillChips } from '../../components/ui.jsx';

export default function InstitutionStudents() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');

  function load() {
    setLoading(true);
    listStudents()
      .then(setStudents)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  async function toggleEligibility(student) {
    const next = student.eligibility_status === 'verified' ? 'provisional' : 'verified';
    setBusyId(student.student_id);
    try {
      await setStudentEligibility(student.student_id, next);
      toast.success(`${student.name} marked ${next}.`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const visible = filter === 'all' ? students : students.filter((s) => s.eligibility_status === filter);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Institution" title="Students" subtitle="Verify eligibility — this replaces manually issuing letters." />

      <div className="mb-6 flex gap-2 animate-fadeUp">
        {['all', 'provisional', 'verified'].map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {visible.map((s) => (
            <Card key={s.student_id} className="animate-fadeUp flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-sm font-semibold text-hub-ink">{s.name}</p>
                <p className="text-xs text-hub-muted">{s.program_of_study} · class of {s.graduation_year || '—'}</p>
                <div className="mt-2"><SkillChips skills={s.skills} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={s.eligibility_status}>{s.eligibility_status}</Badge>
                <Button variant="ghost" onClick={() => toggleEligibility(s)} disabled={busyId === s.student_id}>
                  Mark {s.eligibility_status === 'verified' ? 'provisional' : 'verified'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
