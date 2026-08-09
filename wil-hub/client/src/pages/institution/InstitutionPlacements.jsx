import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listMyPlacements, updatePlacement } from '../../api/institutions.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge, Button, Input, Select, Field } from '../../components/ui.jsx';

export default function InstitutionPlacements() {
  const toast = useToast();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ startDate: '', endDate: '', completionStatus: 'ongoing' });
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    listMyPlacements()
      .then(setPlacements)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  function startEdit(p) {
    setEditingId(p.placement_id);
    setForm({
      startDate: p.start_date ? p.start_date.slice(0, 10) : '',
      endDate: p.end_date ? p.end_date.slice(0, 10) : '',
      completionStatus: p.completion_status,
    });
  }

  async function save(id) {
    setSaving(true);
    try {
      await updatePlacement(id, form);
      toast.success('Placement updated.');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Institution" title="Placements" subtitle="Confirm dates and track completion for graduation tracking." />

      {loading ? (
        <Spinner />
      ) : placements.length === 0 ? (
        <EmptyState title="No placements yet" subtitle="These appear once a company selects a matched student." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {placements.map((p) => (
            <Card key={p.placement_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{p.student_name}</p>
                  <p className="text-xs text-hub-indigo">{p.program_title} · {p.company_name}</p>
                </div>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </div>

              {editingId === p.placement_id ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></Field>
                  <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} /></Field>
                  <Field label="Status">
                    <Select value={form.completionStatus} onChange={(e) => setForm((f) => ({ ...f, completionStatus: e.target.value }))}>
                      <option value="ongoing">ongoing</option>
                      <option value="completed">completed</option>
                      <option value="failed">failed</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-3 flex gap-2">
                    <Button onClick={() => save(p.placement_id)} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-xs text-hub-muted">
                    {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'no start date'} → {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'no end date'}
                  </p>
                  <Button variant="ghost" onClick={() => startEdit(p)}>Edit</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
