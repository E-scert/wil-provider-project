import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext.jsx";
import { getMyPlacements } from "../../api/companies.js";
import {
  Card,
  SectionHeading,
  Spinner,
  EmptyState,
  Badge,
  StatCard,
} from "../../components/ui.jsx";

export default function CompanyPlacements() {
  const toast = useToast();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPlacements()
      .then(setPlacements)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading)
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Spinner />
      </div>
    );

  const ongoing = placements.filter((p) => p.completion_status === "ongoing");
  const completed = placements.filter(
    (p) => p.completion_status === "completed",
  );
  const failed = placements.filter((p) => p.completion_status === "failed");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <SectionHeading
        eyebrow="Placements"
        title="Student Placements"
        subtitle="Track students you’ve placed into programs"
      />

      {/* Summary stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard label="Total" value={placements.length} tone="indigo" />
        <StatCard label="Ongoing" value={ongoing.length} tone="amber" />
        <StatCard label="Completed" value={completed.length} tone="emerald" />
      </div>

      {/* Ongoing placements */}
      <Card className="mb-6">
        <h2 className="font-display text-lg font-semibold text-hub-ink mb-4">
          Ongoing Placements
        </h2>
        {ongoing.length === 0 ? (
          <EmptyState title="No ongoing placements" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {ongoing.map((p) => (
              <Card
                key={p.placement_id}
                className="animate-fadeUp flex items-center justify-between"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">
                    {p.student_name}
                  </p>
                  <p className="text-xs text-hub-indigo">{p.title}</p>
                </div>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Completed placements */}
      <Card className="mb-6">
        <h2 className="font-display text-lg font-semibold text-hub-ink mb-4">
          Completed Placements
        </h2>
        {completed.length === 0 ? (
          <EmptyState title="No completed placements" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {completed.map((p) => (
              <Card
                key={p.placement_id}
                className="animate-fadeUp flex items-center justify-between"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">
                    {p.student_name}
                  </p>
                  <p className="text-xs text-hub-indigo">{p.title}</p>
                </div>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Failed placements */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-hub-ink mb-4">
          Failed Placements
        </h2>
        {failed.length === 0 ? (
          <EmptyState title="No failed placements" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {failed.map((p) => (
              <Card
                key={p.placement_id}
                className="animate-fadeUp flex items-center justify-between"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-hub-ink">
                    {p.student_name}
                  </p>
                  <p className="text-xs text-hub-indigo">{p.title}</p>
                </div>
                <Badge tone={p.completion_status}>{p.completion_status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
