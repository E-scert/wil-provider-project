import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { postProgram, getMyPrograms } from '../../api/companies.js';
import { Card, Field, Input, Textarea, Button, SectionHeading, Spinner, EmptyState, Badge, SkillChips } from '../../components/ui.jsx';

const emptyForm = { title: '', description: '', requiredSkills: '', slotsOpen: '', durationMonths: '', openDate: '', closeDate: '' };

export default function CompanyPrograms() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    getMyPrograms()
      .then(setPrograms)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []); // eslint-disable-line

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await postProgram(form);
      toast.success('Program submitted for institution review.');
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
      <SectionHeading eyebrow="Company" title="WIL Programs" subtitle="Post new placements — each goes through institution review before it's public." />

      <Card className="mb-6 animate-riseIn">
        <h2 className="mb-4 font-display text-base font-semibold text-hub-ink">Post a new program</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title"><Input required value={form.title} onChange={set('title')} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description"><Textarea rows={3} value={form.description} onChange={set('description')} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Required skills" hint="Comma-separated"><Input required value={form.requiredSkills} onChange={set('requiredSkills')} placeholder="React, JavaScript" /></Field>
          </div>
          <Field label="Slots open"><Input type="number" min="1" required value={form.slotsOpen} onChange={set('slotsOpen')} /></Field>
          <Field label="Duration (months)"><Input type="number" min="1" required value={form.durationMonths} onChange={set('durationMonths')} /></Field>
          <Field label="Open date"><Input type="date" value={form.openDate} onChange={set('openDate')} /></Field>
          <Field label="Close date"><Input type="date" value={form.closeDate} onChange={set('closeDate')} /></Field>
          <Button type="submit" disabled={creating} className="sm:col-span-2">{creating ? 'Submitting…' : 'Submit for review'}</Button>
        </form>
      </Card>

      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState title="No programs posted yet" />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {programs.map((p) => (
            <Card key={p.program_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">{p.title}</p>
                  <p className="text-xs text-hub-muted">{p.duration_months} months · {p.slots_open} slot{p.slots_open === 1 ? '' : 's'} left</p>
                  <div className="mt-2"><SkillChips skills={p.required_skills} /></div>
                </div>
                <Badge tone={p.posting_status}>{p.posting_status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
