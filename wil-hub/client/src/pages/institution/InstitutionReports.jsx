import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listMyReports, createReport, listMyPlacements } from '../../api/institutions.js';
import { Card, Field, Select, Textarea, Button, SectionHeading, Spinner, EmptyState } from '../../components/ui.jsx';

export default function InstitutionReports() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ placementId: '', graduationImpact: false, notes: '' });
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([listMyReports(), listMyPlacements()])
      .then(([r, p]) => {
        setReports(r);
        setPlacements(p);
        if (!form.placementId && p.length) setForm((f) => ({ ...f, placementId: String(p[0].placement_id) }));
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.placementId) {
      toast.error('No placements available to report on yet.');
      return;
    }
    setCreating(true);
    try {
      await createReport({ ...form, placementId: Number(form.placementId) });
      toast.success('Report generated.');
      setForm((f) => ({ ...f, notes: '', graduationImpact: false }));
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Institution" title="Reports" subtitle="Graduation impact and compliance notes, tied to placements." />

      <Card className="mb-6 animate-riseIn">
        <h2 className="mb-4 font-display text-base font-semibold text-hub-ink">Generate a report</h2>
        {placements.length === 0 ? (
          <p className="text-sm text-hub-muted">No placements to report on yet.</p>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field label="Placement">
              <Select value={form.placementId} onChange={(e) => setForm((f) => ({ ...f, placementId: e.target.value }))}>
                {placements.map((p) => (
                  <option key={p.placement_id} value={p.placement_id}>
                    {p.student_name} — {p.program_title} ({p.company_name})
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-hub-ink/80">
              <input
                type="checkbox"
                checked={form.graduationImpact}
                onChange={(e) => setForm((f) => ({ ...f, graduationImpact: e.target.checked }))}
              />
              This placement contributes to graduation
            </label>
            <Field label="Notes"><Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
            <Button type="submit" disabled={creating}>{creating ? 'Generating…' : 'Generate report'}</Button>
          </form>
        )}
      </Card>

      {loading ? (
        <Spinner />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {reports.map((r) => (
            <Card key={r.report_id} className="animate-fadeUp">
              <p className="font-display text-sm font-semibold text-hub-ink">{r.student_name} — {r.program_title}</p>
              <p className="mt-1 text-xs text-hub-muted">{r.graduation_impact ? 'Counts toward graduation' : 'No graduation impact recorded'}</p>
              {r.notes && <p className="mt-2 text-sm text-hub-ink/75">{r.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
