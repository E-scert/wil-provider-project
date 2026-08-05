import React from "react";
import { SectionHeading, Card, Button } from "../../components/ui.jsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="Dashboard"
        subtitle="Your documents and applications."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="text-white font-semibold mb-2">Documents</h2>
          <Button onClick={() => navigate("/student/dashboard/documents")}>
            View Documents
          </Button>
        </Card>

        <Card>
          <h2 className="text-white font-semibold mb-2">Applications</h2>
          <Button onClick={() => navigate("/student/dashboard/applications")}>
            View Applications
          </Button>
        </Card>
      </div>
    </div>
  );
}
