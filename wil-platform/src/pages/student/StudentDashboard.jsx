import React, { useState } from "react";
import { SectionHeading, Card, Button } from "../../components/ui.jsx";
import ProfileForm from "./ProfileForm.jsx";
import DetailsForm from "./DetailsForm.jsx";
import SkillsManager from "./SkillsManager.jsx";
import DeleteProfile from "./DeleteProfile.jsx";

export default function ProfileBoard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="Profile"
        subtitle="Manage your account and information."
      />

      {/* Tab navigation */}
      <div className="flex gap-3 mb-6 border-b border-gray-700 pb-2">
        <Button
          variant={activeTab === "profile" ? "primary" : "ghost"}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </Button>
        <Button
          variant={activeTab === "details" ? "primary" : "ghost"}
          onClick={() => setActiveTab("details")}
        >
          Contact & Details
        </Button>
        <Button
          variant={activeTab === "skills" ? "primary" : "ghost"}
          onClick={() => setActiveTab("skills")}
        >
          Skills
        </Button>
        <Button
          variant={activeTab === "delete" ? "danger" : "ghost"}
          onClick={() => setActiveTab("delete")}
        >
          Delete Profile
        </Button>
      </div>

      {/* Tab content */}
      <div className="animate-fadeIn">
        {activeTab === "profile" && (
          <Card>
            <ProfileForm />
          </Card>
        )}
        {activeTab === "details" && (
          <Card>
            <DetailsForm />
          </Card>
        )}
        {activeTab === "skills" && (
          <Card>
            <SkillsManager />
          </Card>
        )}
        {activeTab === "delete" && (
          <Card>
            <DeleteProfile />
          </Card>
        )}
      </div>
    </div>
  );
}
