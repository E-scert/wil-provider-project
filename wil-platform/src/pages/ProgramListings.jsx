import React, { useEffect, useState } from "react";
import { listOpenPrograms } from "../api/programs.js";
import { applyToProgram } from "../api/students.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  Card,
  SectionHeading,
  EmptyState,
  Spinner,
  Button,
  Badge,
} from "../components/ui.jsx";

export default function ProgramListings() {
  const { role, profile } = useAuth();
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    listOpenPrograms()
      .then(setPrograms)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function handleApply(programId) {
    if (role !== "student") {
      toast.info("Log in as a student to apply.");
      return;
    }
    setApplyingId(programId);
    try {
      await applyToProgram(profile.stud_id, programId);
      toast.success("Application submitted.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading
        eyebrow="Opportunities"
        title="Open WIL Programs"
        subtitle="Work-integrated learning placements currently accepting applications."
      />

      {loading ? (
        <Spinner />
      ) : programs.length === 0 ? (
        <EmptyState
          title="No open programs right now"
          subtitle="Check back soon."
        />
      ) : (
        <div className="stagger grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <Card
              key={p.program_id}
              className="animate-fadeUp flex flex-col justify-between"
            >
              <div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-white">
                    {p.program_name}
                  </h3>
                  <Badge>
                    {p.slots_open} slot{p.slots_open === 1 ? "" : "s"}
                  </Badge>
                </div>
                <p className="text-xs text-tut-gold">{p.company?.comp_name}</p>
                <p className="mt-2 text-sm text-white/55 line-clamp-3">
                  {p.program_desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                  <span className="rounded-full border border-tut-line px-2 py-0.5">
                    {p.program_field}
                  </span>
                  <span className="rounded-full border border-tut-line px-2 py-0.5">
                    {p.duration_months} months
                  </span>
                  <span className="rounded-full border border-tut-line px-2 py-0.5">
                    closes {new Date(p.close_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => handleApply(p.program_id)}
                disabled={applyingId === p.program_id}
              >
                {applyingId === p.program_id ? "Applying…" : "Apply now"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
