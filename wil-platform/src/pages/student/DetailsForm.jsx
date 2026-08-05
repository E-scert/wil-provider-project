import React, { useState } from "react";
import { Field, Input, Button } from "../../components/ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { upsertStudentDetails } from "../../api/students.js";

export default function DetailsForm() {
  const { profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    studentEmail: "",
    personalEmail: "",
    courseField: "",
    cellNo: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await upsertStudentDetails(profile.stud_id, form);
      toast.success("Contact details updated.");
      setForm({
        studentEmail: updated.student_email || "",
        personalEmail: updated.personal_email || "",
        courseField: updated.course_field || "",
        cellNo: updated.cell_no || "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
      <Field label="Student email">
        <Input
          type="email"
          required
          value={form.studentEmail}
          onChange={(e) =>
            setForm((f) => ({ ...f, studentEmail: e.target.value }))
          }
        />
      </Field>
      <Field label="Personal email">
        <Input
          type="email"
          value={form.personalEmail}
          onChange={(e) =>
            setForm((f) => ({ ...f, personalEmail: e.target.value }))
          }
        />
      </Field>
      <Field label="Course / field">
        <Input
          value={form.courseField}
          onChange={(e) =>
            setForm((f) => ({ ...f, courseField: e.target.value }))
          }
        />
      </Field>
      <Field label="Cell number">
        <Input
          value={form.cellNo}
          onChange={(e) => setForm((f) => ({ ...f, cellNo: e.target.value }))}
        />
      </Field>
      <Button type="submit" disabled={saving} className="sm:col-span-2">
        {saving ? "Saving…" : "Save details"}
      </Button>
    </form>
  );
}
