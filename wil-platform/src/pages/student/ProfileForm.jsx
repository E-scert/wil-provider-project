import React, { useState } from "react";
import { Field, Input, Select, Button } from "../../components/ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { updateStudentProfile } from "../../api/students.js";

export default function ProfileForm() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: profile?.name || "",
    surname: profile?.surname || "",
    sex: profile?.sex || "",
    age: profile?.age ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStudentProfile(profile.stud_id, form);
      toast.success("Profile updated.");
      refreshProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
      <Field label="First name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </Field>
      <Field label="Surname">
        <Input
          required
          value={form.surname}
          onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
        />
      </Field>
      <Field label="Sex">
        <Select
          value={form.sex}
          onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
        >
          <option value="">Prefer not to say</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </Select>
      </Field>
      <Field label="Age">
        <Input
          type="number"
          value={form.age}
          onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
        />
      </Field>
      <Button type="submit" disabled={saving} className="sm:col-span-2">
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
