import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { postProgram, getMyPrograms } from "../../api/companies.js";
import {
  Card,
  Field,
  Input,
  Textarea,
  Button,
  SectionHeading,
  Spinner,
  EmptyState,
  Badge,
  Chips,
} from "../../components/ui.jsx";

const emptyForm = {
  title: "",
  description: "",
  eligibleCourses: "",
  durationMonths: "",
  openDate: "",
  closeDate: "",
  applicationMethod: "email",
  applicationEmail: "",
  applicationLink: "",
};

export default function CompanyPrograms() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      toast.success("Program submitted for institution review.");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        eyebrow="Programs"
        title="WIL Programs"
        subtitle="Manage your placements"
        action={
          <Button onClick={() => setShowForm(true)}>+ New Program</Button>
        }
      />

      {/* Programs list */}
      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState title="No programs posted yet" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.program_id} className="animate-fadeUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">
                    {p.title}
                  </p>
                  <p className="text-xs text-hub-muted">
                    {p.duration_months} months
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-hub-indigo">
                    Eligible courses
                  </p>
                  <div className="mt-1">
                    <Chips items={p.eligible_courses} />
                  </div>

                  {p.application_method === "email" ? (
                    <Field label="Application Email">
                      <span className="text-hub-ink font-medium">
                        {p.application_email}
                      </span>
                    </Field>
                  ) : (
                    <Field label="Application Portal">
                      <a
                        href={p.application_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-hub-indigo hover:underline font-medium"
                      >
                        {p.application_link}
                      </a>
                    </Field>
                  )}
                </div>
                <Badge tone={p.posting_status}>{p.posting_status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <Card className="mt-8 animate-riseIn">
          <h2 className="mb-4 font-display text-base font-semibold text-hub-ink">
            Post a new program
          </h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Title">
                <Input required value={form.title} onChange={set("title")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Eligible courses"
                hint="Comma-separated — e.g. 'Computer Science, Informatics'"
              >
                <Input
                  required
                  value={form.eligibleCourses}
                  onChange={set("eligibleCourses")}
                />
              </Field>
            </div>
            <Field label="Duration (months)">
              <Input
                type="number"
                min="1"
                value={form.durationMonths}
                onChange={set("durationMonths")}
              />
            </Field>
            <Field label="Open date">
              <Input
                type="date"
                value={form.openDate}
                onChange={set("openDate")}
              />
            </Field>
            <Field label="Close date">
              <Input
                type="date"
                required
                value={form.closeDate}
                onChange={set("closeDate")}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Application Method">
                <select
                  value={form.applicationMethod}
                  onChange={set("applicationMethod")}
                  className="rounded-md border border-hub-line bg-hub-bg px-3 py-2 text-sm text-hub-ink"
                >
                  <option value="email">Email</option>
                  <option value="portal">Portal</option>
                </select>
              </Field>
            </div>

            {form.applicationMethod === "email" && (
              <Field label="Application Email">
                <Input
                  required
                  value={form.applicationEmail}
                  onChange={set("applicationEmail")}
                />
              </Field>
            )}
            {form.applicationMethod === "portal" && (
              <Field label="Application Portal Link">
                <Input
                  required
                  value={form.applicationLink}
                  onChange={set("applicationLink")}
                />
              </Field>
            )}

            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Submitting…" : "Submit for review"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
