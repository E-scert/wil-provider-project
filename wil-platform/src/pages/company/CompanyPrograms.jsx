import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { listCompanyPrograms, createProgram } from '../../api/companies.js';
import { Card, Field, Input, Textarea, Button, SectionHeading, Spinner, EmptyState, Badge } from '../../components/ui.jsx';

const emptyForm = { programName: '', programDesc: '', durationMonths: '', programField: '', openDate: '', closeDate: '', slotsOpen: '' };

export default function CompanyPrograms() {
  const { profile } = useAuth();
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  function load() {
    if (!profile) return;
    setLoading(true);
    listCompanyPrograms(profile.comp_id)
      .then(setPrograms)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [profile?.comp_id]); // eslint-disable-line

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await createProgram(profile.comp_id, form);
      toast.success('Program posted.');
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Company" title="WIL Programs" subtitle="Post new placements and manage what's live." />

      <Card className="mb-6 animate-riseIn">
        <h2 className="mb-4 font-display text-base font-semibold text-white">Post a new program</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Program name"><Input required value={form.programName} onChange={set('programName')} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description"><Textarea rows={3} value={form.programDesc} onChange={set('programDesc')} /></Field>
          </div>
          <Field label="Field" hint="e.g. Software Engineering"><Input required value={form.programField} onChange={set('programField')} /></Field>
          <Field label="Duration (months)"><Input type="number" min="1" required value={form.durationMonths} onChange={set('durationMonths')} /></Field>
          <Field label="Slots open"><Input type="number" min="1" required value={form.slotsOpen} onChange={set('slotsOpen')} /></Field>
          <Field label="Open date"><Input type="date" required value={form.openDate} onChange={set('openDate')} /></Field>
          <Field label="Close date"><Input type="date" required value={form.closeDate} onChange={set('closeDate')} /></Field>
          <Button type="submit" disabled={creating} className="sm:col-span-2">{creating ? 'Posting…' : 'Post program'}</Button>
        </form>
      </Card>

      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState title="No programs posted yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {programs.map((p) => (
            <Card key={p.program_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-white">{p.program_name}</p>
                <p className="text-xs text-white/40">{p.program_field} · {p.duration_months} months</p>
              </div>
              <Badge>{p.slots_open} slot{p.slots_open === 1 ? '' : 's'} left</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
