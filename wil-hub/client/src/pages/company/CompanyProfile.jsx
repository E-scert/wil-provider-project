import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getMyProfile, updateMyProfile } from "../../api/companies.js";
import {
  Card,
  Field,
  Input,
  Button,
  SectionHeading,
  Spinner,
  Badge,
} from "../../components/ui.jsx";

export default function CompanyProfile() {
  const { refresh } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    contactPerson: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name || "",
          industry: p.industry || "",
          contactPerson: p.contact_person || "",
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      toast.success("Company profile updated.");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Profile"
        title={profile?.name}
        subtitle="Update your company information"
        action={
          <Badge tone={profile?.verified_status ? "verified" : "pending"}>
            {profile?.verified_status ? "Verified" : "Unverified"}
          </Badge>
        }
      />

      <Card className="animate-riseIn">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Company name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Industry">
            <Input
              value={form.industry}
              onChange={(e) =>
                setForm((f) => ({ ...f, industry: e.target.value }))
              }
            />
          </Field>
          <Field label="Contact person">
            <Input
              value={form.contactPerson}
              onChange={(e) =>
                setForm((f) => ({ ...f, contactPerson: e.target.value }))
              }
            />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </Card>

      {!profile?.verified_status && (
        <p className="mt-4 text-xs text-hub-muted">
          Your account is unverified. A super admin can verify your company to
          display a trust badge to students.
        </p>
      )}
    </div>
  );
}
