import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { listApplications } from "../../api/students.js";
import {
  Card,
  SectionHeading,
  Spinner,
  EmptyState,
  Badge,
  Button,
} from "../../components/ui.jsx";
import { useNavigate } from "react-router-dom";

const TONE_BY_STATUS = {
  Pending: "pending",
  Reviewed: "reviewed",
  Accepted: "accepted",
  Rejected: "rejected",
};

export default function StudentApplications() {
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    listApplications(profile.stud_id)
      .then(setApps)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [profile?.stud_id]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="My Applications"
        subtitle="Programs you've applied to and their current status."
      />

      {loading ? (
        <Spinner />
      ) : apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          subtitle="Browse open programs to apply."
        />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {apps.map((a) => (
            <Card
              key={a.app_id}
              className="animate-fadeUp flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-display text-sm font-semibold text-white">
                  {a.wil_program?.program_name}
                </p>
                <p className="text-xs text-tut-gold">
                  {a.wil_program?.company?.comp_name}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  applied {new Date(a.date_applied).toLocaleDateString()}
                </p>
              </div>
              <Badge tone={TONE_BY_STATUS[a.status] || "default"}>
                {a.status}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button variant="ghost" onClick={() => navigate("/student/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
