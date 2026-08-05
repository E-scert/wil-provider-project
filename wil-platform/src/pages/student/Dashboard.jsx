import React, { useEffect, useState } from "react";
import {
  SectionHeading,
  Card,
  Button,
  Badge,
  Spinner,
} from "../../components/ui.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { listApplications, getStudentDocs } from "../../api/students.js";
import { supabase } from "../../lib/supabaseClient.js"; // for programs

const TONE_BY_STATUS = {
  Pending: "pending",
  Reviewed: "reviewed",
  Accepted: "accepted",
  Rejected: "rejected",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const toast = useToast();

  const [apps, setApps] = useState([]);
  const [docs, setDocs] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function fetchData() {
      try {
        const [appsData, docsData, programsData] = await Promise.all([
          listApplications(profile.stud_id),
          getStudentDocs(profile.stud_id),
          supabase
            .from("wil_program")
            .select("program_id, program_name, company(comp_name)")
            .order("open_date", { ascending: false })
            .limit(3),
        ]);

        setApps(appsData);
        setDocs(docsData);
        setPrograms(programsData.data || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profile?.stud_id]);

  // Progress: 3 docs + at least 1 application
  const uploadedDocs = [
    "id_doc_path",
    "wil_doc_path",
    "academic_doc_path",
  ].filter((f) => docs?.[f]).length;
  const progress = Math.round(
    ((uploadedDocs + (apps.length > 0 ? 1 : 0)) / 4) * 100,
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="Dashboard"
        subtitle="Your documents, applications, and opportunities."
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Documents shortcut */}
          <Card>
            <h2 className="text-white font-semibold mb-2">Documents</h2>
            <Button onClick={() => navigate("/student/dashboard/documents")}>
              View Documents
            </Button>
          </Card>

          {/* Applications shortcut */}
          <Card>
            <h2 className="text-white font-semibold mb-2">Applications</h2>
            <Button onClick={() => navigate("/student/dashboard/applications")}>
              View Applications
            </Button>
          </Card>

          {/* Recent Applications */}
          <Card>
            <h2 className="text-white font-semibold mb-2">
              Recent Applications
            </h2>
            {apps.slice(0, 3).map((a) => (
              <div
                key={a.app_id}
                className="flex justify-between text-sm text-white/80"
              >
                <span>{a.wil_program?.program_name}</span>
                <Badge tone={TONE_BY_STATUS[a.status] || "default"}>
                  {a.status}
                </Badge>
              </div>
            ))}
            {apps.length === 0 && (
              <p className="text-xs text-white/50">No applications yet</p>
            )}
          </Card>

          {/* Document Upload Status */}
          <Card>
            <h2 className="text-white font-semibold mb-2">Document Status</h2>
            <ul className="text-sm text-white/70 space-y-1">
              <li>
                ID Document: {docs?.id_doc_path ? "✅ Uploaded" : "❌ Missing"}
              </li>
              <li>
                WIL Letter: {docs?.wil_doc_path ? "✅ Uploaded" : "❌ Missing"}
              </li>
              <li>
                Academic Record:{" "}
                {docs?.academic_doc_path ? "✅ Uploaded" : "❌ Missing"}
              </li>
            </ul>
          </Card>

          {/* Latest Programs */}
          <Card>
            <h2 className="text-white font-semibold mb-2">Latest Programs</h2>
            {programs.map((p) => (
              <p key={p.program_id} className="text-sm text-white/80">
                {p.program_name} — {p.company?.comp_name}
              </p>
            ))}
          </Card>

          {/* Profile Progress */}
          <Card>
            <h2 className="text-white font-semibold mb-2">Readiness Tracker</h2>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-tut-red h-3 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/50 mt-1">{progress}% complete</p>
          </Card>
        </div>
      )}
    </div>
  );
}
