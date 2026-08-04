import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  getStudentDetails, updateStudentProfile, upsertStudentDetails, listSkills, addSkill, deleteSkill,
} from '../../api/students.js';
import { Card, Field, Input, Select, Button, SectionHeading, Spinner, EmptyState } from '../../components/ui.jsx';

export default function StudentDashboard() {
  const { profile, refreshProfile } = useAuth(); // profile = student row
  const toast = useToast();

  const [details, setDetails] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: '', surname: '', sex: '', age: '' });
  const [detailsForm, setDetailsForm] = useState({ studentEmail: '', personalEmail: '', courseField: '', cellNo: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!profile) return;
    setProfileForm({ name: profile.name || '', surname: profile.surname || '', sex: profile.sex || '', age: profile.age ?? '' });
    Promise.all([getStudentDetails(profile.stud_id), listSkills(profile.stud_id)])
      .then(([d, s]) => {
        setDetails(d);
        setDetailsForm({
          studentEmail: d?.student_email || '',
          personalEmail: d?.personal_email || '',
          courseField: d?.course_field || '',
          cellNo: d?.cell_no || '',
        });
        setSkills(s);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [profile?.stud_id]); // eslint-disable-line

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateStudentProfile(profile.stud_id, profileForm);
      toast.success('Profile updated.');
      refreshProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveDetails(e) {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const updated = await upsertStudentDetails(profile.stud_id, detailsForm);
      setDetails(updated);
      toast.success('Contact details updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      const row = await addSkill(profile.stud_id, newSkill.trim());
      setSkills((s) => [...s, row]);
      setNewSkill('');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteSkill(mapId) {
    try {
      await deleteSkill(mapId);
      setSkills((s) => s.filter((row) => row.map_id !== mapId));
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <SectionHeading eyebrow="Student" title="Dashboard" />
        <EmptyState
          title="No student profile found"
          subtitle="If you just signed up, this may mean the profile row couldn't be created — see the README's RLS notes."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Student" title={`Welcome, ${profile.name}`} subtitle="Manage your profile, contact details, and skills." />

      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="animate-riseIn">
            <h2 className="mb-4 font-display text-base font-semibold text-white">Profile</h2>
            <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
              <Field label="First name"><Input required value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} /></Field>
              <Field label="Surname"><Input required value={profileForm.surname} onChange={(e) => setProfileForm((f) => ({ ...f, surname: e.target.value }))} /></Field>
              <Field label="Sex">
                <Select value={profileForm.sex} onChange={(e) => setProfileForm((f) => ({ ...f, sex: e.target.value }))}>
                  <option value="">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
              <Field label="Age"><Input type="number" value={profileForm.age} onChange={(e) => setProfileForm((f) => ({ ...f, age: e.target.value }))} /></Field>
              <Button type="submit" disabled={savingProfile} className="sm:col-span-2">
                {savingProfile ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </Card>

          <Card className="animate-riseIn">
            <h2 className="mb-4 font-display text-base font-semibold text-white">Contact & academic details</h2>
            <form onSubmit={handleSaveDetails} className="grid gap-4 sm:grid-cols-2">
              <Field label="Student email">
                <Input type="email" required value={detailsForm.studentEmail} onChange={(e) => setDetailsForm((f) => ({ ...f, studentEmail: e.target.value }))} />
              </Field>
              <Field label="Personal email">
                <Input type="email" value={detailsForm.personalEmail} onChange={(e) => setDetailsForm((f) => ({ ...f, personalEmail: e.target.value }))} />
              </Field>
              <Field label="Course / field">
                <Input value={detailsForm.courseField} onChange={(e) => setDetailsForm((f) => ({ ...f, courseField: e.target.value }))} />
              </Field>
              <Field label="Cell number">
                <Input value={detailsForm.cellNo} onChange={(e) => setDetailsForm((f) => ({ ...f, cellNo: e.target.value }))} />
              </Field>
              <Button type="submit" disabled={savingDetails} className="sm:col-span-2">
                {savingDetails ? 'Saving…' : 'Save details'}
              </Button>
            </form>
          </Card>

          <Card className="animate-riseIn">
            <h2 className="mb-4 font-display text-base font-semibold text-white">Skills</h2>
            <form onSubmit={handleAddSkill} className="mb-4 flex gap-2">
              <Input placeholder="e.g. React, SQL, Figma" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="flex-1" />
              <Button type="submit">Add</Button>
            </form>
            {skills.length === 0 ? (
              <p className="text-sm text-white/40">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.map_id} className="flex items-center gap-2 rounded-full border border-tut-line bg-tut-black px-3 py-1 text-xs text-white/80">
                    {s.skill_name}
                    <button onClick={() => handleDeleteSkill(s.map_id)} className="text-white/30 hover:text-tut-red">×</button>
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
