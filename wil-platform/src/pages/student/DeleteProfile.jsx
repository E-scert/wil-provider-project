import React from "react";
import { Card, Button } from "../../components/ui.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { deleteStudentProfile } from "../../api/students.js"; // implement this in your API

export default function DeleteProfile() {
  const { profile } = useAuth();
  const toast = useToast();

  async function handleDelete() {
    try {
      await deleteStudentProfile(profile.stud_id);
      toast.success("Profile deleted.");
      // TODO: redirect to homepage or logout after deletion
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Card>
      <h2 className="mb-2 font-display text-base font-semibold text-red-500">
        Delete Profile
      </h2>
      <p className="text-sm text-white/60 mb-4">
        This action cannot be undone. Deleting your profile will remove all your
        data.
      </p>
      <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
        Delete Profile
      </Button>
    </Card>
  );
}
