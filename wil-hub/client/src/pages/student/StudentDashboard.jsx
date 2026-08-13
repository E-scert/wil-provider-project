import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyProfile, updateMyProfile, uploadCv } from '../../api/students.js';
import { Card, Field, Input, Button, SectionHeading, Spinner, Badge } from '../../components/ui.jsx';

export default function StudentDashboard() {
  const { refresh } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', programOfStudy: '', graduationYear: '', availabilityDate: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function load() {
    setLoading(true);
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name || '',
          programOfStudy: p.program_of_study || '',
          graduationYear: p.graduation_year ?? '',
          availabilityDate: p.availability_date ? p.availability_date.slice(0, 10) : '',
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      toast.success('Profile updated.');
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(file) {
    if (!file) return;
    setUploading(true);
    try {
      const updated = await uploadCv(file);
      setProfile(updated);
      toast.success('CV uploaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10"><Spinner /></div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title={`Welcome, ${profile?.name?.split(' ')[0] || ''}`}
        subtitle="Keep your profile current — institutions verify eligibility from what's here."
        action={
          <Badge tone={profile?.eligibility_status === 'verified' ? 'verified' : 'provisional'}>
            {profile?.eligibility_status}
          </Badge>
        }
      />

      <div className="flex flex-col gap-6">
        <Card className="animate-riseIn">
          <h2 className="mb-4 font-display text-base font-semibold text-hub-ink">Profile</h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Graduation year"><Input type="number" value={form.graduationYear} onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))} /></Field>
            <div className="sm:col-span-2">
              <Field label="Program of study"><Input required value={form.programOfStudy} onChange={(e) => setForm((f) => ({ ...f, programOfStudy: e.target.value }))} /></Field>
            </div>
            <Field label="Available from"><Input type="date" value={form.availabilityDate} onChange={(e) => setForm((f) => ({ ...f, availabilityDate: e.target.value }))} /></Field>
            <Button type="submit" disabled={saving} className="sm:col-span-2">{saving ? 'Saving…' : 'Save profile'}</Button>
          </form>
        </Card>

        <Card className="animate-riseIn">
          <h2 className="mb-4 font-display text-base font-semibold text-hub-ink">CV</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-hub-ink/80">{profile?.cv_url ? 'CV on file' : 'No CV uploaded yet'}</p>
              {profile?.cv_url && (
                <a href={profile.cv_url} target="_blank" rel="noreferrer" className="text-xs text-hub-indigo underline underline-offset-2">
                  View current CV
                </a>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleCvUpload(e.target.files?.[0])}
              />
              <span className="inline-flex items-center justify-center rounded-md bg-hub-indigo px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110 hover:shadow-glow">
                {uploading ? 'Uploading…' : profile?.cv_url ? 'Replace CV' : 'Upload CV'}
              </span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
