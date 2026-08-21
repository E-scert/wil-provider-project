import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import {
  getMyProfile,
  getMyPrograms,
  getMyApplicants,
  getMyPlacements,
} from "../../api/companies.js";
import {
  Card,
  SectionHeading,
  Spinner,
  Badge,
  StatCard,
  EmptyState,
} from "../../components/ui.jsx";

export default function CompanyDashboard() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyPrograms(),
      getMyApplicants(),
      getMyPlacements(),
    ])
      .then(([p, pr, a, pl]) => {
        setProfile(p);
        setPrograms(pr);
        setApplicants(a);
        setPlacements(pl);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading)
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        eyebrow="Dashboard"
        title={profile?.name}
        subtitle="Overview of your company activity"
        action={
          <Badge tone={profile?.verified_status ? "verified" : "pending"}>
            {profile?.verified_status ? "Verified" : "Unverified"}
          </Badge>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Programs" value={programs.length} tone="indigo" />
        <StatCard
          label="Pending"
          value={programs.filter((p) => p.posting_status === "pending").length}
          tone="amber"
        />
        <StatCard
          label="Approved"
          value={programs.filter((p) => p.posting_status === "approved").length}
          tone="emerald"
        />
        <StatCard label="Placements" value={placements.length} tone="indigo" />
      </div>

      {/* Recent applicants */}
      <Card className="mb-6">
        <h2 className="font-display text-lg font-semibold text-hub-ink mb-4">
          Recent Applicants
        </h2>
        {applicants.length === 0 ? (
          <EmptyState title="No applicants yet" />
        ) : (
          <ul className="divide-y divide-hub-line">
            {applicants.slice(0, 5).map((a) => (
              <li
                key={a.application_id}
                className="py-2 text-sm text-hub-ink flex justify-between"
              >
                <span>
                  {a.student_name} applied to {a.program_title}
                </span>
                <Badge tone={a.status}>{a.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Recent placements */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-hub-ink mb-4">
          Recent Placements
        </h2>
        {placements.length === 0 ? (
          <EmptyState title="No placements yet" />
        ) : (
          <ul className="divide-y divide-hub-line">
            {placements.slice(0, 5).map((p) => (
              <li
                key={p.placement_id}
                className="py-2 text-sm text-hub-ink flex justify-between"
              >
                <span>
                  {p.student_name} → {p.title}
                </span>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
